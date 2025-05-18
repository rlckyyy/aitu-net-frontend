import {User} from "@/models/User";
import {request} from "@/lib/apiClient";
import {ChatMessage} from "@/models/chat/ChatMessage";
import {ChatRoom} from "@/models/chat/ChatRoom";
import {AxiosResponse} from "axios";
import {ChatRoomWithMessages} from "@/models/chat/ChatRoomWithMessages";
import {NewChatRoomRequest} from "@/models/chat/NewChatRoomRequest";

export const chatApi = {
    fetchChatRooms: (idOrEmail?: string): Promise<AxiosResponse<ChatRoom[]>> =>
        (request<ChatRoom[]>(`/chats/rooms/${idOrEmail ?? ''}`)),

    searchUsers: (query: string): Promise<AxiosResponse<User[]>> =>
        (request<User[]>(`/chats/users/search?query=${query}`)),

    /**
     * Current user will be added at api if absent.
     * If chat room already exists, returns existing one
     * */
    createChatRoom: (chatRoomRequest: NewChatRoomRequest): Promise<AxiosResponse<ChatRoom>> =>
        (request<ChatRoom>(`/chats/rooms`, {method: 'POST', data: chatRoomRequest})),

    fetchRelatedUsers: (): Promise<AxiosResponse<User[]>> =>
        (request<User[]>(`/users/related`)),

    uploadFileMessage: (formData: FormData): Promise<AxiosResponse<ChatMessage>> =>
        (request<ChatMessage>('/chats/messages/files', {
            method: 'POST',
            data: formData,
            headers: 'Content-Type: multipart/form-data'
        })),

    fetchChats: (userId?: string): Promise<AxiosResponse<ChatRoomWithMessages[]>> =>
        (request<ChatRoomWithMessages[]>(`/chats/${userId ?? ''}`)),

    countNewMessages: (chatId: string): Promise<AxiosResponse<{ count: number }>> =>
        (request<{ count: number }>(`/chats/rooms/${chatId}/messages/count`))
};
