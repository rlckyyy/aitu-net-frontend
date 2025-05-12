import {User} from "@/models/user";
import {request} from "@/lib/apiClient";
import {ChatMessage} from "@/models/chat/chatMessage";
import {ChatRoom} from "@/models/chat/chatRoom";
import {AxiosResponse} from "axios";
import {NewChatRoomRequest} from "@/hooks/useChat";
import {ChatRoomWithMessages} from "@/models/chat/chatRoomWithMessages";

export const chatApi = {
    fetchChatRooms: (idOrEmail?: string): Promise<AxiosResponse<ChatRoom[]>> =>
        (request<ChatRoom[]>(`/chats/rooms/${idOrEmail??''}`)),

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
        (request<ChatRoomWithMessages[]>(`/chats/${userId??''}`))
};
