import {useAuth} from '@/context/AuthProvider';
import {Client, Message} from '@stomp/stompjs';
import SockJS from 'sockjs-client'
import React, {useEffect, useRef, useState} from "react";
import {useSearchParams} from "next/navigation";
import {ChatMessage, ChatMessageStatus} from "@/models/chatMessage";
import {api} from "@/lib";

export default function ChatPage() {
    const stompClientRef = useRef<Client | null>(null)
    const {user} = useAuth()

    const [chatRooms, setChatRooms] = useState<Map<string, ChatRoom>>(new Map())

    // grouped chat messages by chatId [chatId: [messages]]
    const [chatRoomMessages, setChatRoomMessages] = useState<Map<string, ChatMessage[]>>(new Map())
    const [inputMessage, setInputMessage] = useState<string>('')

    const searchParams = useSearchParams()

    // Current chat id for users
    const [currentChatId, setCurrentChatId] = useState<string>('')
    const [currentCompanion, setCurrentCompanion] = useState<string>('')

    useEffect(() => {
        if (!user) return
        const stompClient = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            debug: console.log,
            onConnect: onConnected,
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message'])
                console.error('Additional details: ' + frame.body)
            }
        })
        stompClient.activate()

        stompClientRef.current = stompClient

        return () => stompClient.deactivate()
    }, [user])

    const onConnected = async () => {
        if (!user) return
        console.log('Successfully connected to STOMP client.')
        stompClientRef.current?.subscribe(`/user/${user?.email}/queue/messages`, onPrivateMessageReceived)

        const companionEmail = searchParams.get('companionEmail')
        if (companionEmail) {
            const {chatId} = await api.chat.getOrCreateChatId(user.email, companionEmail)
            selectChat(chatId, user.email, companionEmail)
        }

        fetchAndSetChatRooms()
    }

    const fetchAndSetChatRooms = async (email: string = user?.email) => {
        if (!email) return

        const rooms: ChatRoom[] = await api.chat.fetchChatRooms(email)
        setChatRooms(
            new Map(rooms.map((chatRoom) => [chatRoom.chatId, chatRoom]))
        )
    }

    const fetchAndSetChatRoomMessages = async (sender: string = user?.email, recipient: string = currentCompanion, chatId: string = currentChatId) => {
        if (!sender || !currentCompanion || !chatId) return

        const messages: ChatMessage[] = await api.chat.fetchChatRoomMessages(sender, recipient)
        const newChatRoomMessages = new Map(chatRoomMessages)
        newChatRoomMessages.set(currentChatId, messages)

        setChatRoomMessages(newChatRoomMessages)
    }

    const onPrivateMessageReceived = (message: Message) => {
        const chatMessage = JSON.parse(message.body) as ChatMessage;

        if (!chatRooms.has(chatMessage.chatId)) {
            fetchAndSetChatRooms()
        }

        setChatRoomMessages(prevChatRoomMessages => {
            const newChatRoomMessages = new Map(prevChatRoomMessages)
            const messages = newChatRoomMessages.get(chatMessage.chatId) || []
            newChatRoomMessages.set(chatMessage.chatId, [...messages, chatMessage])
            return newChatRoomMessages
        })
    }

    const selectChat = async (chatId: string, sender: string | undefined = user?.email, companionEmail: string) => {
        if (!sender) {
            return
        }

        setCurrentChatId(chatId)
        setCurrentCompanion(companionEmail)

        await fetchAndSetChatRoomMessages(sender, companionEmail, chatId)
    }

    if (!user) {
        return <div>Loading...</div>
    }

    const handleInputMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        setInputMessage(e.target.value)
    }

    const sendMessage = () => {
        const stompClient = stompClientRef.current
        if (!user || !stompClient || inputMessage.trim() === '') return

        console.log(`sending message: ${inputMessage} to ${currentCompanion} from ${user.email}`)

        const message: ChatMessage = {
            chatId: currentChatId,
            type: 'MESSAGE',
            content: inputMessage,
            recipient: currentCompanion,
            sender: user.email,
            status: ChatMessageStatus.DELIVERED,
            timestamp: new Date()
        }

        stompClient.publish({
            destination: '/app/chat',
            body: JSON.stringify(message)
        })


        setInputMessage('')

        setChatRoomMessages(prevChatRoomMessages => {
            const newChatRoomMessages = new Map(prevChatRoomMessages)
            const messages = newChatRoomMessages.get(currentChatId) || []
            message.id = crypto.randomUUID()
            newChatRoomMessages.set(currentChatId, [...messages, message])
            return newChatRoomMessages
        })

        if (!chatRooms.has(currentChatId)) {
            setChatRooms(prevChatRooms => {
                const newChatRooms = new Map(prevChatRooms)
                newChatRooms.set(currentChatId, {
                    id: crypto.randomUUID(),
                    chatId: currentChatId,
                    sender: user.email,
                    recipient: currentCompanion
                })
                return newChatRooms
            })
        }
    }

    if (!user) {
        return <div>Loading...</div>
    }

    return (
        <div className="h-screen bg-black text-gray-300 flex overflow-hidden">
            {/* Sidebar (Fixed height, scrollable list inside) */}
            <aside className="w-1/4 bg-gray-900 p-4 h-screen shadow-lg flex flex-col overflow-hidden">
                <h3 className="text-lg font-semibold text-white mb-4">Chats</h3>
                <ul className="space-y-2 overflow-y-auto flex-1">
                    {[...chatRooms.values()].map((chatRoom: ChatRoom) => (
                        <li key={chatRoom.id}>
                            <button
                                className="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition text-left"
                                onClick={() => selectChat(chatRoom.chatId, user?.email, chatRoom.recipient)}
                            >
                                {chatRoom.recipient}
                            </button>
                        </li>
                    ))}
                </ul>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 p-6 flex flex-col h-screen overflow-hidden">
                <h1 className="text-2xl font-bold text-white">{currentCompanion}</h1>

                <div className="w-full bg-gray-900 p-4 rounded-lg shadow-lg mt-4 flex flex-col flex-1 overflow-hidden">
                    {/* Scrollable Messages Section */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {currentCompanion ? (
                            (chatRoomMessages.get(currentChatId) || []).map((chatMessage: ChatMessage) => (
                                <div
                                    key={chatMessage.id}
                                    className={`p-3 rounded max-w-[75%] ${
                                        chatMessage.sender === user.email
                                            ? "bg-blue-600 text-white ml-auto"
                                            : "bg-gray-800 text-gray-300"
                                    }`}
                                >
                                    {chatMessage.content}
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-400 flex items-center justify-center h-full">
                                Select a chat to start messaging
                            </div>
                        )}
                    </div>

                    {/* Sticky Message Input Bar */}
                    {currentCompanion && (
                        <div className="mt-4 flex p-2 bg-gray-800 rounded-b-lg">
                            <input
                                type="text"
                                className="flex-grow p-2 rounded bg-gray-700 border border-gray-600 text-white"
                                placeholder={`Enter message for ${currentCompanion}`}
                                onChange={handleInputMessage}
                                value={inputMessage}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), sendMessage())}
                            />
                            <button
                                className="ml-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 text-white rounded transition"
                                onClick={sendMessage}
                            >
                                Send
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
