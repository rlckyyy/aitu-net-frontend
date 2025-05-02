import {ChatRoom} from "@/models/chat/chatRoom";
import {ChatMessage} from "@/models/chat/chatMessage";

export type ChatRoomWithMessages = {
    chatRoom: ChatRoom;
    messages: ChatMessage[];
}