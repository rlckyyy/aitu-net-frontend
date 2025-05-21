import {AccessType} from "@/models/group/accessType";

export type ProfileUpdate = {
    username?: string;
    description?: string;
    accessType?: AccessType;
}