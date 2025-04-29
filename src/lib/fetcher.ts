import {AxiosResponse} from "axios";

export async function fetcher<T>(axiosFetcher: (...args: any) => Promise<AxiosResponse<T>>, args: any) {
    const response = await axiosFetcher(args)
    if (!response.data) {
        throw new Error(response.statusText, {cause: response})
    }
    return response.data
}