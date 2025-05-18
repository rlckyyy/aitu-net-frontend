import {ChatRoom} from "@/models/chat/ChatRoom";
import {ChatMessage} from "@/models/chat/ChatMessage";

export type ChatRoomWithMessages = {
    chatRoom: ChatRoom;
    messages: ChatMessage[];
}