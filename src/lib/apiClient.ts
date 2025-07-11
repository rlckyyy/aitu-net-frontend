import axios, {AxiosError, AxiosResponse} from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL; // https://aitunet.kz/api/v1
{
    console.log("API_URL", API_URL);
}
export const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

apiClient.interceptors.response.use(
    response => response,
    (error: AxiosError) => {
        if (error.response?.status && error.response?.status >= 400 && error.response?.status < 500) {
            return Promise.reject(error);
        }
        console.error("Unexpected API error:", error);
        return Promise.reject(error);
    }
);

export function request<T>(endpoint: string, options: any = {}): Promise<AxiosResponse<T, ProblemDetail>> {
    return apiClient.request({url: endpoint, ...options});
}
