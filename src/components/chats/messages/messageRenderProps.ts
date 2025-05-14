import {ChatMessage} from "@/models/chat/chatMessage";
import {User} from "@/models/user";

export interface MessageRenderProps {
    chatMessage: ChatMessage;
    currentUser: User;
    markMessageAsRead(chatMessage: ChatMessage): Promise<void>;
}