import {useAuth} from '@/context/AuthProvider';
import {Client, Message, Stomp} from '@stomp/stompjs';
import SockJS from 'sockjs-client'
import React, {useEffect, useRef, useState} from "react";
import {api} from "@/lib/api";
import {User} from "@/models/user";
import {useSearchParams} from "next/navigation";

export default function ChatPage() {
    const stompClientRef = useRef<Client | null>(null)
    const {user} = useAuth()

    const [chatRooms, setChatRooms] = useState<Map<string, ChatRoom>>(new Map())

    // grouped chat messages by chatId [chatId: [messages]]
    const [chatRoomMessages, setChatRoomMessages] = useState<Map<string, ChatMessage[]>>(new Map())
    const [inputMessage, setInputMessage] = useState<string>('')

    const searchParams = useSearchParams()

    // Current chat id for user
    const [currentChatId, setCurrentChatId] = useState<string>('')
    const [currentCompanion, setCurrentCompanion] = useState<string>('')

    useEffect(() => {
        if (!user) {
            return
        }
        const sockJS = new SockJS('http://localhost:8080/ws')
        const stompClient = new Client({
            webSocketFactory: () => sockJS,
            debug: (msg) => {
                console.log(msg)
            },
            onConnect: onConnected,
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message'])
                console.error('Additional details: ' + frame.body)
            }
        })
        stompClient.activate()

        stompClientRef.current = stompClient

        return () => {
            stompClient.deactivate()
        }
    }, [user])

    const onConnected = () => {
        console.log('Successfully connected to STOMP client.')
        console.log('user', user)
        stompClientRef.current?.subscribe(`/user/${user?.email}/queue/messages`, onPrivateMessageReceived)

        const companionEmailFromParam = searchParams.get('companionEmail')
        if (companionEmailFromParam) {
            selectChat(`${user?.email}_${companionEmailFromParam}`, companionEmailFromParam)
        }
        fetchChatRooms()
        fetchOnlineUsers()
    }

    const fetchChatRooms = async () => {
        if (user) {
            const rooms: ChatRoom[] = await api.fetchChatRooms(user.email)
            setChatRooms(
                new Map(rooms.map((chatRoom) => [chatRoom.chatId, chatRoom]))
            )
            console.log(chatRooms)
        }
    }

    const fetchOnlineUsers = async () => {
        if (user) {
            const onlineUsers: User[] = await api.fetchOnlineUsers()
            console.log('Online users', onlineUsers)
        }
    }

    const onPrivateMessageReceived = (message: Message) => {
        const chatMessage = JSON.parse(message.body) as ChatMessage;
        selectChat(chatMessage.chatId, chatMessage.sender)
    }

    const selectChat = async (chatId: string, companionEmail: string) => {
        if (!user) {
            return
        }

        setCurrentChatId(chatId)
        setCurrentCompanion(companionEmail)

        const messages = await api.fetchChatRoomMessages(user.email, companionEmail)
        const chatIdChatRoomMessages = Map.groupBy(messages.values(), item => item.chatId)
        setChatRoomMessages(chatIdChatRoomMessages)
    }

    if (!user) {
        return <div>Loading...</div>
    }

    const handleInputMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        setInputMessage(e.target.value)
    }

    const sendMessage = () => {
        console.log(`sending message: ${inputMessage} to ${currentCompanion} from ${user.email}`)
        const stompClient = stompClientRef.current;
        if (!stompClient) {
            return;
        }
        if (inputMessage === '') {
            return
        }
        const message: ChatMessage = {
            chatId: '',
            type: 'MESSAGE',
            content: inputMessage,
            recipient: currentCompanion,
            sender: user.email,
            status: 'DELIVERED',
            timestamp: new Date()
        }
        stompClient.publish({
            destination: '/app/chat',
            body: JSON.stringify(message)
        })
        setInputMessage('')

        selectChat(currentChatId, currentCompanion)
    }

    function sendMessageOnEnter() {
        return (event) => {
            if (event.key === 'Enter') {
                event.preventDefault()
                sendMessage()
            }
        }
    }

    return (
        <div className="h-screen bg-black text-gray-300 flex overflow-hidden">
            {/* Sidebar (Fixed height, scrollable list inside) */}
            <aside className="w-1/4 bg-gray-900 p-4 h-screen shadow-lg flex flex-col overflow-hidden">
                <h3 className="text-lg font-semibold text-white mb-4">Your Chats</h3>
                <ul className="space-y-2 overflow-y-auto flex-1">
                    {[...chatRooms.values()].map((chatRoom) => (
                        <li key={chatRoom.id}>
                            <button
                                className="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition text-left"
                                onClick={() => selectChat(chatRoom.chatId, chatRoom.recipient)}
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
                        {currentChatId ? (
                            (chatRoomMessages.get(currentChatId) || []).map((message) => (
                                <div
                                    key={message.id}
                                    className={`p-3 rounded max-w-[75%] ${
                                        message.sender === user.email
                                            ? "bg-blue-600 text-white ml-auto"
                                            : "bg-gray-800 text-gray-300"
                                    }`}
                                >
                                    {message.content}
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
                                onKeyDown={sendMessageOnEnter()}
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
