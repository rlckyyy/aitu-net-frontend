import {request} from "@/lib/apiClient";
import {User} from "@/models/user";
import {AxiosResponse} from "axios";
import {UserRegister} from "@/models/userRegister";

export const authApi = {
    register: (userRegData: UserRegister) =>
        request('/auth/register', {method: 'POST', data: userRegData}),

    login: (userData: { email: string; password: string }): Promise<AxiosResponse<{ token: string }>> =>
        request<{ token: string }>('/auth/login', {method: 'POST', data: userData}),

    getUser: async (): Promise<AxiosResponse<User>> =>
        await request<User>('/auth/me'),

    logout: () => request('/auth/logout', {method: 'POST'}),
    checkAuth: () => request('/auth/check', {method: 'GET'}),
};