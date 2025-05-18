interface ChatStrategy {
    getChatId(): Promise<string>;
}