export enum ChatMessageStatus {
    RECEIVED = "RECEIVED",
    DELIVERED = "DELIVERED"
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
    length: number;
    status: ChatMessageStatus;
    type: MessageType;
    createdAt?: Date;
    updatedAt?: Date;
};
