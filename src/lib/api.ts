import axios, {AxiosError, AxiosResponse} from 'axios';
import {User} from "@/models/user";
import {ChatMessage} from "@/models/chatMessage";

const API_URL = 'http://localhost:8080/api/v1';

const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (
            error.response?.status &&
            error.response?.status >= 400 &&
            error.response?.status < 500
        ) {
            return Promise.reject(error);
        }
        console.error('Unexpected API error:', error);
        return Promise.reject(error);
    }
);

async function request<T>(endpoint: string, options: any = {}) : Promise<AxiosResponse<T>> {
    return await apiClient.request({
        url: endpoint,
        ...options,
    });
}

export const api = {
    register: (userData: {
        username: string;
        email: string;
        password: string;
    }) =>
        request('/auth/register', {
            method: 'POST',
            data: userData,
        }),

    login: async (userData: { email: string; password: string }) => {
        return request('/auth/login', {
            method: 'POST',
            data: userData,
        });
    },

    getUser: async () : Promise<AxiosResponse<User>> =>
        await request<User>('/auth/me', {
            method: 'GET',
        }),

    logout: async () =>
        await request('/auth/logout', {
            method: 'POST',
        }),

    fetchChatRooms: async (email: string) : Promise<ChatRoom[]> => {
        const response = await request<ChatRoom[]>(`/chats/rooms/${email}`, {
            method: 'GET'
        });
        return response.data
    },

    fetchOnlineUsers: async () : Promise<User[]> => {
        const response = await request<User[]>('/chats/users/online', {
            method: 'GET'
        });
        return response.data
    },

    fetchChatRoomMessages: async (sender: string, recipient: string) => {
        const response = await request<ChatMessage[]>(`/chats/messages/${sender}/${recipient}`, {
            method: 'GET'
        })
        return response.data
    },

    searchUsers: async (query: string) => {
        const response = await request<User[]>(`/chats/users/search?query=${query}`)
        return response.data
    }
};
