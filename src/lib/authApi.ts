import {request} from "@/lib/apiClient";
import {User} from "@/models/user";
import {AxiosResponse} from "axios";

export const authApi = {
    register: (userData: { username: string; email: string; password: string }) =>
        request('/auth/register', {method: 'POST', data: userData}),

    login: (userData: { email: string; password: string }) =>
        request('/auth/login', {method: 'POST', data: userData}),

    getUser: async (): Promise<AxiosResponse<User>> =>
        await request<User>('/auth/me'),

    logout: () => request('/auth/logout', {method: 'POST'}),
};