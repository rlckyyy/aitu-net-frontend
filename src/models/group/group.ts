import {Avatar} from "@/models/user";

export interface GroupCreateDto {
    name: string;
    description: string;
    accessType: AccessType
}

export interface Group {
    id: string;
    name: string;
    description: string;
    accessType: AccessType;
    userIds: string[];
    avatar: Avatar;
    postIds: string[];
    adminIds: string[];
    ownerId: string;
}