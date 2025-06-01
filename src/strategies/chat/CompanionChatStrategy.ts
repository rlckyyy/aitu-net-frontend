import {ChatRoom, ChatRoomType} from "@/models/chat/ChatRoom";
import {NewChatRoomRequest} from "@/models/chat/NewChatRoomRequest";

/**
 * Chat strategy that depends on other users
 * */
export class CompanionChatStrategy implements ChatStrategy {

    constructor(private readonly searchParams: URLSearchParams,
                private readonly chatRooms: Map<string, ChatRoom>,
                private readonly api: any,
                private readonly pushToChatRooms: (room: ChatRoom) => void
    ) {
    }

    async getChatId(): Promise<string> {
        const companionId = this.searchParams.get("companionId")!
        const maybeChatRoom = [...this.chatRooms.values()]
            .find(chatRoom => {
                return chatRoom.chatRoomType === ChatRoomType.ONE_TO_ONE &&
                    chatRoom.participants.some(u => u.id === companionId)
            })

        if (!maybeChatRoom) {
            const request: NewChatRoomRequest = {
                participantsIds: [companionId],
                chatRoomType: ChatRoomType.ONE_TO_ONE
            }
            const chatRoom = (await this.api.chat.createChatRoom(request)).data;
            this.pushToChatRooms(chatRoom)
            return chatRoom.chatId
        } else {
            return maybeChatRoom.chatId
        }
    }
}