import {useEffect, useRef, useState} from "react";
import {ChatMessage} from "@/models/chat/chatMessage";
import {Client, Message} from "@stomp/stompjs";
import {useSearchParams} from "next/navigation";
import {useAuth} from "@/context/AuthProvider";
import {api} from "@/lib";
import SockJS from "sockjs-client";
import {
    decryptAESKeyWithPrivateKey,
    decryptWithAES,
    encryptAESKeyWithPublicKey,
    encryptWithAES,
    generateAESKey,
    getPrivateKey
} from "@/app/services/keysService";

export function useChat() {
    const {user} = useAuth();
    const searchParams = useSearchParams();
    const stompClientRef = useRef<Client | null>(null);

    const [chatRooms, setChatRooms] = useState<Map<string, ChatRoom>>(new Map());
    const [chatRoomMessages, setChatRoomMessages] = useState<Map<string, ChatMessage[]>>(new Map());
    const [currentChatId, setCurrentChatId] = useState<string>("");
    const [currentCompanion, setCurrentCompanion] = useState<string>("");

    const localId = crypto.randomUUID()

    useEffect(() => {
        if (!user) return

        const stompClient = new Client({
            webSocketFactory: () => new SockJS("http://aitu-network:8080/ws"),
            debug: console.log,
            onConnect: onConnected,
            onStompError: (frame) => console.error(`STOMP Error: ${frame.body}`),
        })

        stompClient.activate()
        stompClientRef.current = stompClient

        return () => {
            stompClient.deactivate().catch(console.log)
        }
    }, [user])

    const onConnected = async () => {
        if (!user) return
        console.log("Connected to STOMP")

        stompClientRef.current?.subscribe(`/user/${user.email}/queue/messages`, onMessageReceived)

        await fetchAndSetChatRooms()

        const companionEmail = searchParams.get("companionEmail")
        if (companionEmail) {
            const {chatId} = await api.chat.getOrCreateChatId(user.email, companionEmail)
            if (!chatRooms.has(chatId)) {
                setChatRooms((prevChatRooms) => {
                    const newChatRooms = new Map(prevChatRooms)
                    const localChatRoom: ChatRoom = {
                        id: localId,
                        chatId: chatId,
                        sender: user.email,
                        recipient: companionEmail
                    }
                    newChatRooms.set(chatId, localChatRoom)
                    return newChatRooms
                })
            }
            await selectChat(chatId, companionEmail)
        }
    }

    const fetchAndSetChatRooms = async (email: string | undefined = user?.email) => {
        if (!email) return
        const rooms = await api.chat.fetchChatRooms(email)
        setChatRooms(new Map(rooms.map((room) => [room.chatId, room])))
    }

    const fetchAndSetChatMessages = async (chatId: string, companionEmail: string) => {
        if (!user) return
        const messages = await api.chat.fetchChatRoomMessages(user.email, companionEmail)
        console.log('messages from datasource:', JSON.stringify(messages))
        for (const message of messages) {
            if (message.sender === user.email) {
                message.content = await decryptOwnMessage(message)
            } else {
                message.content = await decryptCompanionMessage(message)
            }
        }
        setChatRoomMessages((prev) => new Map(prev).set(chatId, messages))
    }

    const selectChat = async (chatId: string, companionEmail: string) => {
        setCurrentChatId(chatId)
        setCurrentCompanion(companionEmail)
        await fetchAndSetChatMessages(chatId, companionEmail)
    }

    const onMessageReceived = async (message: Message) => {
        const chatMessage = JSON.parse(message.body) as ChatMessage

        chatMessage.content = await decryptCompanionMessage(chatMessage)

        setChatRoomMessages((prev) => {
            const newMessages = new Map(prev)
            newMessages.set(chatMessage.chatId, [...(newMessages.get(chatMessage.chatId) || []), chatMessage])
            return newMessages
        });

        if (!chatRooms.has(chatMessage.chatId)) {
            await fetchAndSetChatRooms()
        }
    }

    /**
     * Send message that is encrypted with generated AES key.
     * The AES key is encrypted via recipient's public key
     * */
    const sendMessage = async (chatMessage: ChatMessage, destination: string = '/app/chat') => {
        if (!user) return
        const plainContentText = chatMessage.content

        // encrypting for recipient
        {
            const aesKey = await generateAESKey()
            const {encryptedData, iv} = await encryptWithAES(plainContentText, aesKey)

            chatMessage.content = encryptedData
            chatMessage.iv = iv

            const recipient = (await api.user.getUserByEmail(chatMessage.recipient)).data;
            chatMessage.encryptedAesKey = await encryptAESKeyWithPublicKey(aesKey, recipient.publicKey)
        }
        // encrypting for self
        {
            const aesKey = await generateAESKey()
            const {encryptedData, iv} = await encryptWithAES(plainContentText, aesKey)
            chatMessage.contentForSelf = encryptedData
            chatMessage.ivForSelf = iv

            chatMessage.encryptedAesKeyForSelf = await encryptAESKeyWithPublicKey(aesKey, user.publicKey)
        }
        console.log('sending message', chatMessage)
        stompClientRef.current?.publish({
            destination: destination,
            body: JSON.stringify(chatMessage)
        })

        setChatRoomMessages(prevChatRoomMessages => {
            const newChatRoomMessages = new Map(prevChatRoomMessages)
            const messages = newChatRoomMessages.get(currentChatId) || []
            chatMessage.id = localId
            chatMessage.content = plainContentText
            newChatRoomMessages.set(currentChatId, [...messages, chatMessage])
            return newChatRoomMessages
        })

        if (!chatRooms.has(currentChatId)) {
            setChatRooms(prevChatRooms => {
                const newChatRooms: Map<string, ChatRoom> = new Map(prevChatRooms)
                newChatRooms.set(currentChatId, {
                    id: localId,
                    chatId: currentChatId,
                    sender: chatMessage.sender,
                    recipient: currentCompanion
                })
                return newChatRooms
            })
        }
    }

    const decryptCompanionMessage = async (chatMessage: ChatMessage): Promise<string> => {
        return decryptMessage(chatMessage.content, chatMessage.encryptedAesKey!, chatMessage.iv!)
    }

    const decryptOwnMessage = async (chatMessage: ChatMessage) => {
        return decryptMessage(chatMessage.contentForSelf!, chatMessage.encryptedAesKeyForSelf!, chatMessage.ivForSelf!)
    }

    /**
     * Decrypt message's encrypted AES key and
     * decrypt message with current user's (recipient) private key, message's init vector and our decrypted AES key.
     * */
    const decryptMessage = async (data: string, encryptedAesKey: string, iv: string) => {
        const privateKey = await getPrivateKey()
        if (!privateKey) {
            console.error('User does not have private key')
            return Promise.reject('User does not have private key')
        }

        const aesKey = await decryptAESKeyWithPrivateKey(encryptedAesKey, privateKey)
        return await decryptWithAES(data, iv, aesKey)
    }

    return {chatRooms, chatRoomMessages, currentChatId, currentCompanion, selectChat, sendMessage}
}