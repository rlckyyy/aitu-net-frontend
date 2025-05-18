/**
 * Empty chat strategy
 * */
export class NoOpStrategy implements ChatStrategy {
    async getChatId(): Promise<string> {
        return ''
    }
}