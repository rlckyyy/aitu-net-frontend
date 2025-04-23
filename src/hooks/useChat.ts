import {useEffect, useRef, useState} from "react";
import {ChatMessage} from "@/models/chat/chatMessage";
import {Client, Message} from "@stomp/stompjs";
import {useSearchParams} from "next/navigation";
import {useAuth} from "@/context/AuthProvider";
import {api} from "@/lib";
import SockJS from "sockjs-client";
import {ChatRoom, ChatRoomType} from "@/models/chat/chatRoom";

interface ChatStrategy {
    getChatId(): Promise<string>;
}

export type NewChatRoomRequest = {
    title?: string,
    participantsIds: string[];
    chatRoomType: ChatRoomType;
}

class PrivateChatStrategy implements ChatStrategy {

    constructor(private readonly searchParams: URLSearchParams,
                private readonly chatRooms: Map<string, ChatRoom>,
                private readonly api: any,
                private readonly pushToChatRooms: (room: ChatRoom) => void
    ) {
    }

    async getChatId(): Promise<string> {
        const companionId = this.searchParams.get("companionId")!
        const maybeChatRoom = [...this.chatRooms.values()]
            .find(chatRoom => {
                chatRoom.participants!.values().filter(u => u.id === companionId)
            })

        if (!maybeChatRoom) {
            const request: NewChatRoomRequest = {
                participantsIds: [companionId],
                chatRoomType: ChatRoomType.ONE_TO_ONE
            }
            const chatRoom = (await this.api.chat.createChatRoom(request)).data;
            this.pushToChatRooms(chatRoom)
            return chatRoom.chatId
        } else {
            return maybeChatRoom.chatId
        }
    }
}

class DefaultChatStrategy implements ChatStrategy {

    constructor(private readonly searchParams: URLSearchParams) {
    }

    async getChatId(): Promise<string> {
        return this.searchParams.get("chatId")!
    }
}

class NoOpStrategy implements ChatStrategy {
    async getChatId(): Promise<string> {
        return ''
    }
}

type StrategyDeps = {
    searchParams: URLSearchParams,
    chatRooms: Map<string, ChatRoom>,
    api: any,
    pushToChatRooms: (room: ChatRoom) => void
}

const strategyRegistry: Record<string, (deps: StrategyDeps) => ChatStrategy> = {
    companionId: ({searchParams, chatRooms, api, pushToChatRooms}) =>
        new PrivateChatStrategy(searchParams, chatRooms, api, pushToChatRooms),
    chatId: ({searchParams}) =>
        new DefaultChatStrategy(searchParams)
}

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
        await fetchAndSetChatRooms()
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
        if (!chatId.trim()) {
            setCurrentChatId(chatId)
            return
        }
        setCurrentChatId(chatId)
        await fetchAndSetChatMessages(chatId)
    }

    const onMessageReceived = async (message: Message) => {
        const chatMessage = JSON.parse(message.body) as ChatMessage
        console.log('message received', chatMessage)
        pushToChatMessages(chatMessage)
    }

    function sendMessage(chatMessage: ChatMessage, destination: string = '/app/chat'): void {
        if (!user) return
        console.log('sending message', chatMessage)
        stompClientRef.current?.publish({
            destination: destination,
            body: JSON.stringify(chatMessage)
        })
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

    function getStrategy(deps: StrategyDeps): ChatStrategy {
        for (const key of Object.keys(strategyRegistry)) {
            if (deps.searchParams.has(key)) {
                return strategyRegistry[key](deps)
            }
        }

        return new NoOpStrategy()
    }

    return {chatRooms, chatRoomMessages, currentChatId, selectChat, sendMessage}
}