import {request} from "@/lib/apiClient";
import {FriendRequestStatus} from "@/models/friend/FriendRequestStatus";
import {FriendRequest} from "@/models/friend/FriendRequest";
import {User} from "@/models/user";

export const friendsApi = {
    sendFriendRequest: async (userId: string) => {
        return await request(`/friends/request/${userId}`, {method: 'POST'});
    },
    getReceivedFriendRequests: async (status: FriendRequestStatus) => {
        return await request<FriendRequest[]>(`/friends/received`, {method: 'GET', params: {status}});
    },
    getSentFriendRequests: async (status: FriendRequestStatus) => {
        return await request<FriendRequest[]>(`/friends/sent`, {method: 'GET', params: {status: status}});
    },
    deleteFriendRequest: async (requestId: string) => {
        return await request(`/friends/request/${requestId}`, {method: 'DELETE'});
    },
    respondRequest: async (requestId: string, status: FriendRequestStatus) => {
        return await request(`/friends/request/${requestId}/respond`, {method: 'PUT', params: {status}});
    },
    getUserFriendList: async (userId: string) => {
        return await request<User[]>(`/friends/${userId}`, {method: 'GET'});
    }
}