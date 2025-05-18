/**
 * Native behavioural chat strategy
 * */
export class DefaultChatStrategy implements ChatStrategy {

    constructor(private readonly searchParams: URLSearchParams) {
    }

    async getChatId(): Promise<string> {
        return this.searchParams.get("chatId")!
    }
}