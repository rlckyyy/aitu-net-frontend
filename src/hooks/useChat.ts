import {useEffect, useRef, useState} from "react";
import {ChatMessage} from "@/models/chat/chatMessage";
import {Client, Message} from "@stomp/stompjs";
import {useSearchParams} from "next/navigation";
import {useAuth} from "@/context/AuthProvider";
import {api} from "@/lib";
import SockJS from "sockjs-client";
import {ChatRoom, ChatRoomType} from "@/models/chat/chatRoom";

export function useChat() {
    const {user} = useAuth();
    const searchParams = useSearchParams();
    const stompClientRef = useRef<Client | null>(null);
    const [chatRooms, setChatRooms] = useState<Map<string, ChatRoom>>(new Map());
    const [chatRoomMessages, setChatRoomMessages] = useState<Map<string, ChatMessage[]>>(new Map());
    const [currentChatId, setCurrentChatId] = useState<string>("");
    const SOCKET_URL: string = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "defaultWebSocketUrl";
    {
        console.log("SOCKET_URL", SOCKET_URL);
    }

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
            stompClient.deactivate().catch(console.log)
        }
    }, [user])

    const onConnected = async () => {
        if (!user) return
        console.log("Connected to STOMP")

        stompClientRef.current?.subscribe(`/user/${user.id}/queue/messages`, onMessageReceived)
        await fetchAndSetChatRooms()

        const companionId = searchParams.get("companionId")

        console.log('logging chat rooms')
        console.log('chatRooms:', chatRooms)
        if (companionId) {
            const maybeChatRoom = [...chatRooms.values()]
                .find(chatRoom => {
                    chatRoom.participants!.values().filter(u => u.id === companionId)
                })
            console.log('maybeChatRoom', maybeChatRoom)

            if (maybeChatRoom) {
                console.log(maybeChatRoom && console.log('chat room found'))
            } else {
                console.log('chat room not found')
            }

            let chatId: string;
            if (!maybeChatRoom) {
                console.log("no chatRoom found")
                let newChatRoom = {
                    participantsIds: [companionId],
                    chatRoomType: ChatRoomType.ONE_TO_ONE,
                };
                console.log('creating chat room', newChatRoom);
                const chatRoom = (await api.chat.createChatRoom(newChatRoom)).data;
                chatId = chatRoom.chatId
                console.log('chat room created', chatRoom)
                setChatRooms((prevChatRooms) => {
                    const newChatRooms = new Map(prevChatRooms)
                    newChatRooms.set(chatRoom.chatId, chatRoom)
                    return newChatRooms
                })
            } else {
                chatId = maybeChatRoom.chatId
            }
            await selectChat(chatId)
        } else if (searchParams.has("chatId")) {
            const chatId = searchParams.get("chatId")!
            await selectChat(chatId)
        }
    }

    const fetchAndSetChatRooms = async (id: string = user!.id) => {
        const rooms = await api.chat.fetchChatRooms(id)
        setChatRooms(new Map(rooms.map((room) => [room.chatId, room])))
        console.log('Fetched chat rooms', rooms)
    }

    const fetchAndSetChatMessages = async (chatId: string) => {
        if (!user) return
        const messages = await api.chat.fetchChatRoomMessages(chatId)
        console.log('messages', messages)
        setChatRoomMessages((prev) => new Map(prev).set(chatId, messages))
    }

    const selectChat = async (chatId: string) => {
        setCurrentChatId(chatId)
        await fetchAndSetChatMessages(chatId)
    }

    /**
     * One to one message receiving
     * */
    const onMessageReceived = async (message: Message) => {
        const chatMessage = JSON.parse(message.body) as ChatMessage
        console.log('message received', chatMessage)
        setChatRoomMessages((prev) => {
            const newMessages = new Map(prev)
            newMessages.set(chatMessage.chatId, [...newMessages.get(chatMessage.chatId) || [], chatMessage])
            return newMessages
        });

        if (!chatRooms.has(chatMessage.chatId)) {
            console.log('the block that must not be logged')
            await fetchAndSetChatRooms()
        }
    }

    function sendMessage(chatMessage: ChatMessage, destination: string = '/app/chat'): void {
        if (!user) return
        console.log('sending message', chatMessage)
        stompClientRef.current?.publish({
            destination: destination,
            body: JSON.stringify(chatMessage)
        })

        setChatRoomMessages(prevChatRoomMessages => {
            const newChatRoomMessages = new Map(prevChatRoomMessages)
            const messages = newChatRoomMessages.get(currentChatId) || []
            chatMessage.id = useId()
            newChatRoomMessages.set(currentChatId, [...messages, chatMessage])
            return newChatRoomMessages
        })
    }

    return {chatRooms, chatRoomMessages, currentChatId, selectChat, sendMessage}
}