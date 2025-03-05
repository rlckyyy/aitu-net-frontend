import {User} from "@/models/user";
import {request} from "@/lib/apiClient";
import {ChatMessage} from "@/models/chat/chatMessage";

export const chatApi = {
    fetchChatRooms: async (email: string): Promise<ChatRoom[]> =>
        (await request<ChatRoom[]>(`/chats/rooms/${email}`)).data,

    fetchChatRoomMessages: async (sender: string, recipient: string): Promise<ChatMessage[]> =>
        (await request<ChatMessage[]>(`/chats/messages/${sender}/${recipient}`)).data,

    searchUsers: async (query: string): Promise<User[]> =>
        (await request<User[]>(`/chats/users/search?query=${query}`)).data,

    getOrCreateChatId: async (sender: string, recipient: string): Promise<{chatId: string}> => {
        return (await request<{chatId: string}>(`/chats/id/${sender}/${recipient}`)).data
    }
};
