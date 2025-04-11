import {User} from "@/models/user";
import {request} from "@/lib/apiClient";
import {ChatMessage} from "@/models/chat/chatMessage";
import {ChatRoom, ChatRoomType} from "@/models/chat/chatRoom";
import {AxiosResponse} from "axios";

export const chatApi = {
    fetchChatRooms: async (email: string): Promise<ChatRoom[]> =>
        (await request<ChatRoom[]>(`/chats/rooms/${email}`)).data,

    fetchChatRoomMessages: async (chatId: string): Promise<ChatMessage[]> =>
        (await request<ChatMessage[]>(`/chats/messages/${chatId}`)).data,

    searchUsers: async (query: string): Promise<User[]> =>
        (await request<User[]>(`/chats/users/search?query=${query}`)).data,

    createChatRoom: async (newChatRoom: {
        title?: string,
        participantsIds: string[];
        chatRoomType: ChatRoomType;
    }): Promise<AxiosResponse<ChatRoom>> =>
        (await request<ChatRoom>(`/chats/rooms`, {method: 'POST', data: newChatRoom})),

    fetchRelatedUsers: async (): Promise<User[]> =>
        (await request<User[]>(`/chats/users/related`)).data,
};
