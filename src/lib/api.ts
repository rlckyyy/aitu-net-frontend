import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

async function request(endpoint: string, options: any = {}) {
    try {
        const response = await apiClient.request({
            url: endpoint,
            ...options,
        });
        return response;
    } catch (error) {
        console.error('Ошибка API', error);
        throw error;
    }
}

export const api = {
    register: (userData: {
        username: string;
        email: string;
        password: string;
    }) =>
        request('/v1/auth/register', {
            method: 'POST',
            data: userData,
        }),

    login: async (userData: { email: string; password: string }) => {
        return request('/v1/auth/login', {
            method: 'POST',
            data: userData,
        });
    },

    getUser: () =>
        request('/v1/auth/me', {
            method: 'GET',
        }),

    logout: async () =>
        await request('/v1/auth/logout', {
            method: 'POST',
        }),
};
