export enum ChatMessageStatus {
    RECEIVED,
    DELIVERED
}

export type ChatMessage = {
    id?: string;
    chatId: string;
    sender: string;
    recipient: string;
    content: string;
    timestamp: Date;
    status: ChatMessageStatus;
    type: string;
};
