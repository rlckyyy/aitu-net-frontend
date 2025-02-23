import {userApi} from "@/lib/userApi";
import {chatApi} from "@/lib/chatApi";
import {authApi} from "@/lib/authApi";

export const api = {
    auth: authApi,
    user: userApi,
    chat: chatApi,
};