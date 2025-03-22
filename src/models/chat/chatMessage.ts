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
    contentForSelf?: string;
    timestamp: Date;
    status: ChatMessageStatus;
    type: string;
    encryptedAesKey?: string;
    iv?: string;
    encryptedAesKeyForSelf?: string;
    ivForSelf?: string;
};
