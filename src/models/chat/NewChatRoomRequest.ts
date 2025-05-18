import {ChatRoomType} from "@/models/chat/ChatRoom";

export type NewChatRoomRequest = {
    title?: string,
    participantsIds: string[];
    chatRoomType: ChatRoomType;
}