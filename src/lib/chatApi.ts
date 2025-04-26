import {User} from "@/models/user";
import {request} from "@/lib/apiClient";
import {ChatMessage} from "@/models/chat/chatMessage";
import {ChatRoom} from "@/models/chat/chatRoom";
import {AxiosResponse} from "axios";
import {NewChatRoomRequest} from "@/hooks/useChat";

export const chatApi = {
    fetchChatRooms: async (email: string): Promise<ChatRoom[]> =>
        (await request<ChatRoom[]>(`/chats/rooms/${email}`)).data,

    fetchChatRoomMessages: async (chatId: string): Promise<ChatMessage[]> =>
        (await request<ChatMessage[]>(`/chats/rooms/${chatId}/messages`)).data,

    searchUsers: async (query: string): Promise<User[]> =>
        (await request<User[]>(`/chats/users/search?query=${query}`)).data,

    /**
     * Current user will be added at api if absent
     * */
    createChatRoom: async (chatRoomRequest: NewChatRoomRequest): Promise<AxiosResponse<ChatRoom>> =>
        (await request<ChatRoom>(`/chats/rooms`, {method: 'POST', data: chatRoomRequest})),

    fetchRelatedUsers: async (): Promise<User[]> =>
        (await request<User[]>(`/chats/users/related`)).data,

    uploadFileMessage: async (formData: FormData): Promise<ChatMessage> =>
        (await request<ChatMessage>('/chats/messages/files', {method: 'POST', data: formData, headers: 'Content-Type: multipart/form-data'})).data
};
