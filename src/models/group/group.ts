import {Avatar} from "@/models/User";
import {AccessType} from "@/models/group/accessType";

export interface GroupCreateDto {
    name: string;
    description: string;
    accessType: AccessType;
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
    createdAt: Date;
    updatedAt: Date;
}