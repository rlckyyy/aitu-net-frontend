export enum ChatMessageStatus {
    RECEIVED,
    DELIVERED
}

export type ChatMessage = {
    id?: string;
    chatId: string;
    senderId: string;
    content: string;
    status: ChatMessageStatus;
    type: string;
    createdAt?: Date;
    updatedAt?: Date;
};
