import {useEffect, useRef, useState} from "react";
import {ChatMessage} from "@/models/chat/chatMessage";
import {Client, Message} from "@stomp/stompjs";
import {useSearchParams} from "next/navigation";
import {useAuth} from "@/context/AuthProvider";
import {api} from "@/lib";
import SockJS from "sockjs-client";
import {ChatRoom, ChatRoomType} from "@/models/chat/chatRoom";
import {ChatRoomWithMessages} from "@/models/chat/chatRoomWithMessages";

interface ChatStrategy {
    getChatId(): Promise<string>;
}

export type NewChatRoomRequest = {
    title?: string,
    participantsIds: string[];
    chatRoomType: ChatRoomType;
}

/**
 * Chat strategy that depends on other users
 * */
class CompanionChatStrategy implements ChatStrategy {

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
                chatRoom.participants.values().filter(u => u.id === companionId)
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

/**
 * Native behavioural chat strategy
 * */
class DefaultChatStrategy implements ChatStrategy {

    constructor(private readonly searchParams: URLSearchParams) {
    }

    async getChatId(): Promise<string> {
        return this.searchParams.get("chatId")!
    }
}

/**
 * Empty chat strategy
 * */
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
        new CompanionChatStrategy(searchParams, chatRooms, api, pushToChatRooms),
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
        const chatMessage = JSON.parse(message.body) as ChatMessage
        console.log('message received', chatMessage)
        if (!chatRooms.has(chatMessage.chatId)) {
            fetchAndSetChatRooms()
        }
        pushToChatMessages(chatMessage)
    }

    function sendMessage(chatMessage: ChatMessage, destination: string = '/app/chat'): void {
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

    return {chatRooms, chatRoomMessages, currentChatId, stompClientRef, selectChat, sendMessage}
}