import {ChatMessage} from "@/models/chat/ChatMessage";
import {User} from "@/models/User";

export interface MessageRenderProps {
    chatMessage: ChatMessage;
    currentUser: User;
    markMessageAsRead(chatMessage: ChatMessage): Promise<void>;
}