import {userApi} from "@/lib/userApi";
import {chatApi} from "@/lib/chatApi";
import {authApi} from "@/lib/authApi";
import {friendsApi} from "@/lib/friendsApi";
import {groupApi} from "@/lib/groupApi";
import {postApi} from "@/lib/postTs";

export const api = {
    auth: authApi,
    user: userApi,
    chat: chatApi,
    friends: friendsApi,
    group: groupApi,
    post: postApi
};