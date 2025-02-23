import {User} from "@/models/user";
import {request} from "@/lib/apiClient";
import {ChatMessage} from "@/models/chatMessage";

export const chatApi = {
    fetchChatRooms: async (email: string): Promise<ChatRoom[]> =>
        (await request<ChatRoom[]>(`/chats/rooms/${email}`)).data,

    fetchOnlineUsers: async (): Promise<User[]> =>
        (await request<User[]>('/chats/users/online')).data,

    fetchChatRoomMessages: async (sender: string, recipient: string): Promise<ChatMessage[]> =>
        (await request<ChatMessage[]>(`/chats/messages/${sender}/${recipient}`)).data,

    searchUsers: async (query: string): Promise<User[]> =>
        (await request<User[]>(`/chats/users/search?query=${query}`)).data,
};
