import { useEffect, useRef, useState } from "react";
import { ChatMessage, DecryptedMessage, MessageType } from "@/models/chat/ChatMessage";
import { Client, Message } from "@stomp/stompjs";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { api } from "@/lib";
import SockJS from "sockjs-client";
import { ChatRoom } from "@/models/chat/ChatRoom";
import { ChatRoomWithMessages } from "@/models/chat/ChatRoomWithMessages";
import { WSMessage, WSMessageType } from "@/models/chat/WSMessage";
import { getStrategy, StrategyDeps } from "@/strategies/chat/registry";
import { E2EEncryptionService } from "@/service/E2EEncryptionService";

export function useChat() {
    const { user } = useAuth()
    const searchParams = useSearchParams()
    const stompClientRef = useRef<Client | null>(null)

    // State для чатов и сообщений
    const [chatRooms, setChatRooms] = useState<Map<string, ChatRoom>>(new Map())
    const [chatRoomMessages, setChatRoomMessages] = useState<Map<string, DecryptedMessage[]>>(new Map())
    const [currentChatId, setCurrentChatId] = useState<string>("")

    // Кэш публичных ключей участников для каждого чата
    const [participantKeys, setParticipantKeys] = useState<Map<string, Record<string, string>>>(new Map())

    // Управление состоянием чтения сообщений
    const timeoutRef = useRef<NodeJS.Timeout>(null)
    const readMessagesRef = useRef<Map<string, DecryptedMessage>>(new Map())
    const [newMessagesCount, setNewMessagesCount] = useState<Map<string, number>>(new Map())

    const SOCKET_URL: string = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "defaultWebSocketUrl"
    const encryptionService = E2EEncryptionService.getInstance()

    // ===== ИНИЦИАЛИЗАЦИЯ =====
    useEffect(() => {
        if (!user) return

        // Инициализируем сервис шифрования
        encryptionService.initialize()

        const stompClient = new Client({
            webSocketFactory: () => new SockJS(SOCKET_URL),
            debug: console.log,
            onConnect: onConnected,
            onStompError: (frame) => console.error(`STOMP Error: ${frame.body}`),
        })

        stompClient.activate()
        stompClientRef.current = stompClient

        return () => {
            markBufferedMessagesAsRead()
            stompClient.deactivate()
                .catch(console.log)
        }
    }, [user])

    // Подсчет новых сообщений при изменении списка чатов
    useEffect(() => {
        if (chatRooms.size === 0) return

        const loadMessageCounts = async () => {
            for (const chatId of chatRooms.keys()) {
                try {
                    const response = await api.chat.countNewMessages(chatId)
                    const count = response.data.count

                    setNewMessagesCount(prev => {
                        const newState = new Map(prev)
                        newState.set(chatId, count)
                        return newState
                    })
                } catch (error) {
                    console.error(`Failed to load message count for chat ${chatId}:`, error)
                }
            }
        }

        loadMessageCounts()
    }, [chatRooms])

    // ===== WEBSOCKET СОЕДИНЕНИЕ =====
    const onConnected = () => {
        if (!user) return
        console.log("🔌 Connected to WebSocket")

        stompClientRef.current?.subscribe(`/user/${user.id}/queue/messages`, onMessageReceived)

        const deps: StrategyDeps = {
            searchParams: searchParams,
            chatRooms: chatRooms,
            api: api,
            pushToChatRooms: pushToChatRooms
        }

        const chatIdStrategy = getStrategy(deps)
        console.log("🎯 Chat Strategy:", chatIdStrategy.constructor.name)

        chatIdStrategy.getChatId()
            .then(chatId => {
                if (chatId) {
                    selectChat(chatId)
                }
            })
            .catch(error => {
                console.error("Strategy failed:", error)
            })

        fetchAndSetChats(user.id)
    }

    const onMessageReceived = async (message: Message) => {
        const messageObject: WSMessage = JSON.parse(message.body)

        if (messageObject.type === WSMessageType.CHAT_MESSAGE) {
            const encryptedMessage: ChatMessage = messageObject.message
            console.log('🔒 Received encrypted message for chat:', encryptedMessage.chatId)

            if (!chatRooms.has(encryptedMessage.chatId)) {
                fetchAndSetChatRooms()
            }

            try {
                const decryptedMessage = await decryptReceivedMessage(encryptedMessage)
                addDecryptedMessageToChat(decryptedMessage)

                console.log('✅ Message decrypted successfully')
            } catch (error) {
                console.error('❌ Failed to decrypt message:', error)
            }
        } else if (messageObject.type === WSMessageType.CHAT_ROOM) {
            const chatRoom: ChatRoom = messageObject.message
            console.log("📁 New chat room created:", chatRoom.chatId)

            // Добавляем новый чат и загружаем ключи
            pushToChatRooms(chatRoom)
            await loadChatParticipantKeys(chatRoom.chatId)
        }
    }

    // ===== ОТПРАВКА СООБЩЕНИЙ =====
    const sendMessage = async (
        chatId: string,
        messageText: string,
        type: MessageType = MessageType.MESSAGE_TEXT
    ): Promise<void> => {
        if (!user) {
            throw new Error('User not authenticated')
        }

        if (!messageText.trim()) {
            console.warn('Empty message text, skipping send')
            return
        }

        console.log('📤 Sending message to chat:', chatId)

        try {
            // 1. Получаем ключи участников
            let keys = participantKeys.get(chatId)
            if (!keys) {
                console.log('🔑 Loading participant keys...')
                await loadChatParticipantKeys(chatId)
                keys = participantKeys.get(chatId)
                if (!keys) {
                    throw new Error('Failed to load participant keys')
                }
            }

            // 2. Шифруем сообщение
            console.log('🔒 Encrypting message...')
            const { encryptedContent, encryptedKeys } = await encryptionService.encryptMessage(messageText, keys)

            // 3. Создаем объект сообщения
            const chatMessage: ChatMessage = {
                chatId,
                senderId: user.id,
                encryptedContent,
                encryptedKeys,
                type,
                length: messageText.length
            }

            // 4. Отправляем через WebSocket
            stompClientRef.current?.publish({
                destination: '/app/chat',
                body: JSON.stringify(chatMessage)
            })

            console.log('✅ Encrypted message sent')
        } catch (error) {
            console.error('❌ Failed to send encrypted message:', error)
            throw error // Пробрасываем ошибку для обработки в UI
        }
    }

    // ===== РАСШИФРОВКА СООБЩЕНИЙ =====
    const decryptReceivedMessage = async (encryptedMessage: ChatMessage): Promise<DecryptedMessage> => {
        if (!user) {
            throw new Error('User not authenticated')
        }

        // Расшифровываем содержимое
        const decryptedContent = await encryptionService.decryptMessage(encryptedMessage, user.id)

        return {
            id: encryptedMessage.id!,
            chatId: encryptedMessage.chatId,
            senderId: encryptedMessage.senderId,
            content: decryptedContent, // ← Расшифрованный текст
            createdAt: encryptedMessage.createdAt!,
            status: encryptedMessage.status!,
            type: encryptedMessage.type
        }
    }

    // ===== ЗАГРУЗКА ДАННЫХ =====
    const fetchAndSetChatRooms = async (userId?: string) => {
        try {
            const response = await api.chat.fetchChatRooms(userId)
            const rooms = response.data

            console.log('📁 Loaded', rooms.length, 'chat rooms')
            setChatRooms(new Map(rooms.map(room => [room.chatId, room])))
        } catch (error) {
            console.error('Failed to fetch chat rooms:', error)
        }
    }

    const fetchAndSetChats = async (userId?: string) => {
        try {
            console.log('Logging before fetch userId', userId)
            const response = await api.chat.fetchChats(userId)
            const chats: ChatRoomWithMessages[] = response.data
            console.log('chats logging', chats)
            console.log('💬 Loading', chats.length, 'chats with messages')

            const rooms = new Map(chats.map(chat => [chat.chatRoom.chatId, chat.chatRoom]))
            const decryptedMessagesMap = new Map<string, DecryptedMessage[]>()

            for (const chat of chats) {
                const decryptedMessages: DecryptedMessage[] = []

                if (!participantKeys.has(chat.chatRoom.chatId)) {
                    await loadChatParticipantKeys(chat.chatRoom.chatId)
                }

                for (const encryptedMessage of chat.messages) {
                    try {
                        const decryptedMessage = await decryptReceivedMessage(encryptedMessage)
                        decryptedMessages.push(decryptedMessage)
                    } catch (error) {
                        console.error('Failed to decrypt historical message:', error)
                    }
                }

                decryptedMessagesMap.set(chat.chatRoom.chatId, decryptedMessages)
            }

            setChatRooms(rooms)
            setChatRoomMessages(decryptedMessagesMap)

            console.log('✅ All messages decrypted and loaded')
        } catch (error) {
            console.error('Failed to fetch chats:', error)
        }
    }

    const loadChatParticipantKeys = async (chatId: string) => {
        try {
            console.log('🔑 Loading keys for chat:', chatId)

            const response = await api.chat.getChatParticipantKeys(chatId)
            const keys = response.data

            setParticipantKeys(prev => {
                const newKeys = new Map(prev)
                newKeys.set(chatId, keys)
                return newKeys
            })

            console.log('✅ Keys loaded for', Object.keys(keys).length, 'participants')
        } catch (error) {
            console.error('❌ Failed to load participant keys:', error)
            throw error
        }
    }

    const selectChat = async (chatId: string) => {
        console.log('🎯 Selecting chat:', chatId)

        if (!chatId) {
            setCurrentChatId("")
            return
        }

        setCurrentChatId(chatId)

        if (!participantKeys.has(chatId)) {
            console.log('🔑 Loading participant keys...')
            await loadChatParticipantKeys(chatId)
        }
        console.log(chatRoomMessages)
        const messages = chatRoomMessages.get(chatId)
        console.log(`💬 Chat ${chatId} has ${messages?.length || 0} messages`)
    }

    const pushToChatRooms = (chatRoom: ChatRoom) => {
        setChatRooms(prevChatRooms => {
            const newChatRooms = new Map(prevChatRooms)
            newChatRooms.set(chatRoom.chatId, chatRoom)
            return newChatRooms
        })
    }

    const addDecryptedMessageToChat = (message: DecryptedMessage) => {
        setChatRoomMessages(prev => {
            const newMessages = new Map(prev)
            const currentMessages = newMessages.get(message.chatId) ?? []
            newMessages.set(message.chatId, [...currentMessages, message])
            return newMessages
        })
    }

    // ===== ОТМЕТКИ О ПРОЧТЕНИИ =====
    const markMessageAsRead = async (message: DecryptedMessage): Promise<void> => {
        readMessagesRef.current.set(message.id, message)

        // Дебаунс - отправляем статус через 3 секунды
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
            const messageIds = Array.from(readMessagesRef.current.keys())

            stompClientRef.current?.publish({
                destination: '/app/chat/message/status',
                body: JSON.stringify({ messageIds })
            })

            readMessagesRef.current.clear()
        }, 3000)

        // Уменьшаем счетчик новых сообщений
        setNewMessagesCount(prev => {
            const newState = new Map(prev)
            const currentCount = newState.get(message.chatId)
            if (currentCount && currentCount > 0) {
                newState.set(message.chatId, currentCount - 1)
            }
            return newState
        })
    }

    const markBufferedMessagesAsRead = () => {
        if (readMessagesRef.current.size > 0) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }

            const messageIds = Array.from(readMessagesRef.current.keys())
            stompClientRef.current?.publish({
                destination: '/app/chat/message/status',
                body: JSON.stringify({ messageIds })
            })

            readMessagesRef.current.clear()
        }
    }

    return {
        // Данные
        chatRooms,                    // Map<chatId, ChatRoom>
        chatRoomMessages,             // Map<chatId, DecryptedMessage[]> ← Уже расшифрованные!
        currentChatId,                // Текущий выбранный чат
        newMessagesCount,             // Map<chatId, number>

        // Функции
        selectChat,                   // (chatId: string) => Promise<void>
        sendMessage,                  // (chatId, text, type?) => Promise<void> ← Автоматически шифрует
        markMessageAsRead,            // (message: DecryptedMessage) => Promise<void>

        // Служебное
        stompClientRef               // Ref на WebSocket клиент
    }
}