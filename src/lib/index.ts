import {userApi} from "@/lib/userApi";
import {chatApi} from "@/lib/chatApi";
import {authApi} from "@/lib/authApi";
import {friendsApi} from "@/lib/friendsApi";

export const api = {
    auth: authApi,
    user: userApi,
    chat: chatApi,
    friends: friendsApi,
};