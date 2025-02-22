import axios, {AxiosError, AxiosResponse} from 'axios';
import {User} from "@/models/user";
import {ChatMessage} from "@/models/chatMessage";
import {ProfileUpdate} from "@/models/ProfileUpdate";

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

async function request<T>(endpoint: string, options: any = {}): Promise<AxiosResponse<T>> {
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

    updateUser: async (profileUpdate: ProfileUpdate) => {
        return request('/users', {
            method: 'PATCH',
            data: profileUpdate,
        })
    },

    uploadProfilePhoto: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return request('/users/profile/photo', {
            method: 'PATCH',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        })
    },

    getProfilePhoto: async (id: string) => {
        return request(`/users/profile/photo/${id}`, {
            method: 'GET',
        });
    },

    getUser: async (): Promise<AxiosResponse<User>> =>
        await request<User>('/auth/me'),

    logout: async () =>
        await request('/auth/logout', {
            method: 'POST',
        }),

    fetchChatRooms: async (email: string): Promise<ChatRoom[]> => {
        return (await request<ChatRoom[]>(`/chats/rooms/${email}`)).data;
    },

    fetchOnlineUsers: async (): Promise<User[]> => {
        return (await request<User[]>('/chats/users/online')).data;
    },

    fetchChatRoomMessages: async (sender: string, recipient: string) => {
        return (await request<ChatMessage[]>(`/chats/messages/${sender}/${recipient}`)).data
    },

    searchUsers: async (query: string) => {
        return (await request<User[]>(`/chats/users/search?query=${query}`)).data
    }
};
