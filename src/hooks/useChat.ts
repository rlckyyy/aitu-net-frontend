import {useEffect, useRef, useState} from "react";
import {ChatMessage} from "@/models/chatMessage";
import {Client, Message} from "@stomp/stompjs";
import {useSearchParams} from "next/navigation";
import {useAuth} from "@/context/AuthProvider";
import {api} from "@/lib";
import SockJS from "sockjs-client";

export function useChat() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const stompClientRef = useRef<Client | null>(null);

    const [chatRooms, setChatRooms] = useState<Map<string, ChatRoom>>(new Map());
    const [chatRoomMessages, setChatRoomMessages] = useState<Map<string, ChatMessage[]>>(new Map());
    const [currentChatId, setCurrentChatId] = useState<string>("");
    const [currentCompanion, setCurrentCompanion] = useState<string>("");

    useEffect(() => {
        if (!user) return;

        const stompClient = new Client({
            webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
            debug: console.log,
            onConnect: onConnected,
            onStompError: (frame) => console.error(`STOMP Error: ${frame.body}`),
        });

        stompClient.activate();
        stompClientRef.current = stompClient;

        return () => {
            stompClient.deactivate().catch(console.log)
        };
    }, [user]);

    const onConnected = async () => {
        if (!user) return;
        console.log("Connected to STOMP");

        stompClientRef.current?.subscribe(`/user/${user.email}/queue/messages`, onMessageReceived);

        fetchAndSetChatRooms();

        const companionEmail = searchParams.get("companionEmail");
        if (companionEmail) {
            const { chatId } = await api.chat.getOrCreateChatId(user.email, companionEmail);
            if (!chatRooms.has(chatId)) {
                setChatRooms((prevChatRooms) => {
                    const newChatRooms = new Map(prevChatRooms)
                    const localChatRoom: ChatRoom = {
                        id: crypto.randomUUID(),
                        chatId: chatId,
                        sender: user.email,
                        recipient: companionEmail
                    }
                    newChatRooms.set(chatId, localChatRoom)
                    return newChatRooms
                })
            }
            selectChat(chatId, companionEmail)
        }
    };

    const fetchAndSetChatRooms = async (email: string | undefined = user?.email) => {
        if (!email) return;
        const rooms = await api.chat.fetchChatRooms(email);
        setChatRooms(new Map(rooms.map((room) => [room.chatId, room])));
    };

    const fetchAndSetChatMessages = async (chatId: string, companionEmail: string) => {
        if (!user) return;
        const messages = await api.chat.fetchChatRoomMessages(user.email, companionEmail);
        setChatRoomMessages((prev) => new Map(prev).set(chatId, messages));
    }

    const selectChat = async (chatId: string, companionEmail: string) => {
        setCurrentChatId(chatId);
        setCurrentCompanion(companionEmail);
        await fetchAndSetChatMessages(chatId, companionEmail);
    }

    const onMessageReceived = (message: Message) => {
        const chatMessage = JSON.parse(message.body) as ChatMessage;
        setChatRoomMessages((prev) => {
            const newMessages = new Map(prev);
            newMessages.set(chatMessage.chatId, [...(newMessages.get(chatMessage.chatId) || []), chatMessage]);
            return newMessages;
        });

        if (!chatRooms.has(chatMessage.chatId)) {
            fetchAndSetChatRooms();
        }
    }

    const sendMessage = (chatMessage: ChatMessage, destination: string = '/app/chat') => {
        const stompClient = stompClientRef.current
        stompClient?.publish({
            destination: destination,
            body: JSON.stringify(chatMessage)
        })

        setChatRoomMessages(prevChatRoomMessages => {
            const newChatRoomMessages = new Map(prevChatRoomMessages)
            const messages = newChatRoomMessages.get(currentChatId) || []
            chatMessage.id = crypto.randomUUID()
            newChatRoomMessages.set(currentChatId, [...messages, chatMessage])
            return newChatRoomMessages
        })

        if (!chatRooms.has(currentChatId)) {
            setChatRooms(prevChatRooms => {
                const newChatRooms: Map<string, ChatRoom> = new Map(prevChatRooms)
                newChatRooms.set(currentChatId, {
                    id: crypto.randomUUID(),
                    chatId: currentChatId,
                    sender: chatMessage.sender,
                    recipient: currentCompanion
                })
                return newChatRooms
            })
        }
    }

    return { chatRooms, chatRoomMessages, currentChatId, currentCompanion, selectChat, sendMessage }
}