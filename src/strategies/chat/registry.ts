import {ChatRoom} from "@/models/chat/ChatRoom";
import {NoOpStrategy} from "@/strategies/chat/NoOpChatStrategy";
import {CompanionChatStrategy} from "@/strategies/chat/CompanionChatStrategy";
import {DefaultChatStrategy} from "@/strategies/chat/DefaultChatStrategy";

export type StrategyDeps = {
    searchParams: URLSearchParams,
    chatRooms: Map<string, ChatRoom>,
    api: any,
    pushToChatRooms: (room: ChatRoom) => void
}

const strategyRegistry: Record<string, (deps: StrategyDeps) => ChatStrategy> = {
    companionId: ({searchParams, chatRooms, api, pushToChatRooms}) =>
        new CompanionChatStrategy(searchParams, chatRooms, api, pushToChatRooms),
    chatId: ({searchParams}) =>
        new DefaultChatStrategy(searchParams)
}

export function getStrategy(deps: StrategyDeps): ChatStrategy {
    for (const key of Object.keys(strategyRegistry)) {
        if (deps.searchParams.has(key)) {
            return strategyRegistry[key](deps)
        }
    }

    return new NoOpStrategy()
}