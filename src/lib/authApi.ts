import {request} from "@/lib/apiClient";
import {User} from "@/models/User";
import {AxiosResponse} from "axios";
import {NewUserRequest} from "@/models/NewUserRequest";

export const authApi = {
    register: (userRegData: NewUserRequest) =>
        request<User>('/auth/register', {method: 'POST', data: userRegData}),

    login: async (userData: { email: string; password: string }): Promise<AxiosResponse<{ token: string }>> =>
        await request<{ token: string }>('/auth/login', {method: 'POST', data: userData}),

    getUser: async (): Promise<AxiosResponse<User>> =>
        await request<User>('/auth/me'),

    logout: () => request('/auth/logout', {method: 'POST'}),

    forgotPassword: async (email: string) => {
        await request('/auth/forgot', {method: 'GET', params: {email}})
    },

    recoverPassword: async (email: string , token: string, password: string) => {
        await request('/auth/recover', {method: 'PATCH', params: {email, token, password}})
    }
};