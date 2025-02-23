import axios, { AxiosError, AxiosResponse } from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status && error.response?.status >= 400 && error.response?.status < 500) {
            return Promise.reject(error);
        }
        console.error('Unexpected API error:', error);
        return Promise.reject(error);
    }
);

export async function request<T>(endpoint: string, options: any = {}): Promise<AxiosResponse<T>> {
    return await apiClient.request({ url: endpoint, ...options });
}