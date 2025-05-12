import {User} from "@/models/user";


export enum ChatRoomType {
    ONE_TO_ONE= "ONE_TO_ONE",
    GROUP = "GROUP",
}

export type ChatRoom = {
    id: string;
    chatId: string;
    title: string;
    chatRoomType: ChatRoomType;
    participants: User[];
    empty: boolean;
};
