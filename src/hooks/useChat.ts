import {useEffect, useRef, useState} from "react";
import {ChatMessage} from "@/models/chat/ChatMessage";
import {Client, Message} from "@stomp/stompjs";
import {useSearchParams} from "next/navigation";
import {useAuth} from "@/context/AuthProvider";
import {api} from "@/lib";
import SockJS from "sockjs-client";
import {ChatRoom} from "@/models/chat/ChatRoom";
import {ChatRoomWithMessages} from "@/models/chat/ChatRoomWithMessages";
import {WSMessage, WSMessageType} from "@/models/chat/WSMessage";
import {getStrategy, StrategyDeps} from "@/strategies/chat/registry";

export function useChat() {
    const {user} = useAuth()
    const searchParams = useSearchParams()
    const stompClientRef = useRef<Client | null>(null)
    const [chatRooms, setChatRooms] = useState<Map<string, ChatRoom>>(new Map())
    const [chatRoomMessages, setChatRoomMessages] = useState<Map<string, ChatMessage[]>>(new Map())
    const [currentChatId, setCurrentChatId] = useState<string>("")
    const timeoutRef = useRef<NodeJS.Timeout>(null)
    const readMessagesRef = useRef<Map<string, ChatMessage>>(new Map())
    const [newMessagesCount, setNewMessagesCount] = useState<Map<string, number>>(new Map())
    const SOCKET_URL: string = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "defaultWebSocketUrl"

    useEffect(() => {
        if (!user) return

        const stompClient = new Client({
            webSocketFactory: () => new SockJS(SOCKET_URL), // https://aitunet.kz/api/ws
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

    useEffect(() => {
        Array.from(chatRooms.keys()).map(chatId => {
            api.chat.countNewMessages(chatId)
                .then(response => response.data.count)
                .then(count => {
                    setNewMessagesCount(prev => {
                        const newState = new Map(prev)
                        newState.set(chatId, count)
                        return newState
                    })
                })
        })
    }, [chatRooms])

    const onConnected = () => {
        if (!user) return
        console.log("Connected to STOMP")

        stompClientRef.current?.subscribe(`/user/${user.id}/queue/messages`, onMessageReceived)

        const deps: StrategyDeps = {
            searchParams: searchParams,
            chatRooms: chatRooms,
            api: api,
            pushToChatRooms: pushToChatRooms
        }
        const chatIdStrategy = getStrategy(deps)

        console.log(chatIdStrategy)

        chatIdStrategy.getChatId()
            .then(selectChat)

        fetchAndSetChats()
    }

    function fetchAndSetChatRooms(userId?: string) {
        api.chat.fetchChatRooms(userId)
            .then(response => response.data)
            .then(rooms => {
                console.log('Fetched chat rooms', rooms)
                setChatRooms(new Map(rooms.map((room) => [room.chatId, room])));
            })
    }

    function fetchAndSetChats(userId?: string) {
        api.chat.fetchChats(userId)
            .then(response => response.data)
            .then((chats: ChatRoomWithMessages[]) => {
                const rooms = new Map(chats.map(chat => [chat.chatRoom.chatId, chat.chatRoom]))

                const messages = Map.groupBy(
                    chats.flatMap(val => val.messages),
                    message => message.chatId
                )

                setChatRooms(rooms)
                setChatRoomMessages(messages)
            })
    }

    const selectChat = async (chatId: string) => {
        setCurrentChatId(chatId)
    }

    const onMessageReceived = (message: Message) => {
        const messageObject: WSMessage = JSON.parse(message.body)
        if (messageObject.type === WSMessageType.CHAT_MESSAGE) {
            const chatMessage: ChatMessage = messageObject.message
            console.log('message received', chatMessage)
            if (!chatRooms.has(chatMessage.chatId)) {
                fetchAndSetChatRooms()
            }
            pushToChatMessages(chatMessage)
        } else if (messageObject.type === WSMessageType.CHAT_ROOM) {
            const chatRoom: ChatRoom = messageObject.message
            console.log("NEW CHAT ROOM CREATED", chatRoom)
            pushToChatRooms(chatRoom)
        }
    }

    function sendMessage(chatMessage: ChatMessage, destination: string = '/app/chat'): void {
        console.log('sending message', chatMessage)
        stompClientRef.current?.publish({
            destination: destination,
            body: JSON.stringify(chatMessage)
        })
    }

    async function markMessageAsRead(chatMessage: ChatMessage): Promise<void> {
        readMessagesRef.current.set(chatMessage.id!, chatMessage)

        timeoutRef.current && clearTimeout(timeoutRef.current)

        timeoutRef.current = setTimeout(() => {
            const messageIds = Array.from(readMessagesRef.current.keys())
            send(messageIds)
            readMessagesRef.current.clear()
        }, 3000)

        setNewMessagesCount(prev => {
            const newState = new Map(prev)
            newState.get(chatMessage.chatId) && newState.set(chatMessage.chatId, newState.get(chatMessage.chatId)! - 1)
            return newState
        })
    }

    function send(messageIds: string[]) {
        stompClientRef.current?.publish({
            destination: `/app/chat/message/status`,
            body: JSON.stringify({messageIds})
        })
    }

    function markBufferedMessagesAsRead() {
        if (readMessagesRef.current.size > 0) {
            timeoutRef.current && clearTimeout(timeoutRef.current)

            send(Array.from(readMessagesRef.current.keys()))
        }
    }

    function pushToChatRooms(chatRoom: ChatRoom) {
        setChatRooms((prevChatRooms) => {
            const newChatRooms = new Map(prevChatRooms)
            newChatRooms.set(chatRoom.chatId, chatRoom)
            return newChatRooms
        })
    }

    function pushToChatMessages(chatMessage: ChatMessage) {
        setChatRoomMessages((prevChatRoomMessages) => {
            const newChatRoomMessages = new Map(prevChatRoomMessages)
            newChatRoomMessages.set(chatMessage.chatId, [...newChatRoomMessages.get(chatMessage.chatId) ?? [], chatMessage])
            return newChatRoomMessages
        })
    }

    return {chatRooms, chatRoomMessages, currentChatId, stompClientRef, newMessagesCount, selectChat, sendMessage, markMessageAsRead}
}