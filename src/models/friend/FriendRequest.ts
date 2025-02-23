import {FriendRequestStatus} from "@/models/friend/FriendRequestStatus";

export interface FriendRequest {
    id: string;
    senderId: string;
    receiverId: string;
    status: FriendRequestStatus;
}