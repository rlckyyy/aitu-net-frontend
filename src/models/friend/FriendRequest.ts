import {FriendRequestStatus} from "@/models/friend/FriendRequestStatus";

export interface FriendRequest {
    id: string;
    senderId: string;
    sender: string;
    receiverId: string;
    receiver: string;
    status: FriendRequestStatus;
}