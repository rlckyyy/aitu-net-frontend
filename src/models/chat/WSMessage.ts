import {ChatMessage} from "@/models/chat/ChatMessage";
import {ChatRoom} from "@/models/chat/ChatRoom";

export type WSMessage = |
    {
        type: WSMessageType.CHAT_MESSAGE;
        message: ChatMessage
    }
    |
    {
        type: WSMessageType.CHAT_ROOM;
        message: ChatRoom
    }

export enum WSMessageType {
    CHAT_MESSAGE = "CHAT_MESSAGE",
    CHAT_ROOM = "CHAT_ROOM"
}