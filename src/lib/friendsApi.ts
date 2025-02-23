import {request} from "@/lib/apiClient";
import {FriendRequestStatus} from "@/models/friend/FriendRequestStatus";
import {FriendRequest} from "@/models/friend/FriendRequest";

export const friendsApi = {
    sendFriendRequest: async (userId: string) => {
        return await request(`/friend/request/${userId}`, {method: 'POST'});
    },
    getReceivedFriendRequests: async (requestStatus: FriendRequestStatus) => {
        return await request<FriendRequest[]>(`/friend/received`, {method: 'GET'});
    },
    getSentFriendRequests: async (requestStatus: FriendRequestStatus) => {
        return await request<FriendRequest[]>(`/friend/sent`, {method: 'GET'});
    },
    deleteFriendRequest: async (requestId: string) => {
        return await request(`/friend/${requestId}`, {method: 'DELETE'});
    },
    respondRequest: async (requestId: string, status: FriendRequestStatus) => {
        return await request(`/friend/${requestId}/respond`, {method: 'POST', params: {status}});
    }
}