export enum ChatMessageStatus {
    RECEIVED = "RECEIVED",
    DELIVERED = "DELIVERED"// todo: properly process the message status
}

export enum MessageType {
    MESSAGE_TEXT= "MESSAGE_TEXT",
    MESSAGE_AUDIO = "MESSAGE_AUDIO",
    MESSAGE_VIDEO = "MESSAGE_VIDEO",
    JOIN = "JOIN",
    LEAVE = "LEAVE",
}

export type ChatMessage = {
    id?: string;
    chatId: string;
    senderId: string;
    content: string;
    status: ChatMessageStatus;
    type: MessageType;
    createdAt?: Date;
    updatedAt?: Date;
};
