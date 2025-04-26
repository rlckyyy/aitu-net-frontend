import {apiClient} from "@/lib/apiClient";

export async function fetcher(url: string, params?: any) {
    const resp = await apiClient.get(url, {params: params});
    if (!resp.data) {
        throw new Error(resp.data)
    }
    return resp.data
}