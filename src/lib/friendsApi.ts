import {request} from "@/lib/apiClient";
import {FriendRequestStatus} from "@/models/friend/FriendRequestStatus";
import {FriendRequest} from "@/models/friend/FriendRequest";
import {User} from "@/models/user";

export const friendsApi = {
    sendFriendRequest: async (userId: string) => {
        return await request(`/friend/request/${userId}`, {method: 'POST'});
    },
    getReceivedFriendRequests: async (status: FriendRequestStatus) => {
        return await request<FriendRequest[]>(`/friend/received`, {method: 'GET', params: {status}});
    },
    getSentFriendRequests: async (requestStatus: FriendRequestStatus) => {
        return await request<FriendRequest[]>(`/friend/sent`, {method: 'GET'});
    },
    deleteFriendRequest: async (requestId: string) => {
        return await request(`/friend/request/${requestId}`, {method: 'DELETE'});
    },
    respondRequest: async (requestId: string, status: FriendRequestStatus) => {
        return await request(`/friend/request/${requestId}/respond`, {method: 'PUT', params: {status}});
    },
    getUserFriendList: async (userId: string) => {
        return await request<User[]>(`/friend/${userId}`, {method: 'GET'});
    }
}