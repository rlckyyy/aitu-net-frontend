import {AccessType} from "@/models/group/accessType";

export interface User {
    id: string;
    email: string;
    username: string;
    description: string;
    roles: string[];
    friendList: string[];
    avatar?: Avatar;
    connected: boolean;
    showConnectionDetails: boolean;
    leftOn: Date;
    connectedOn: Date;
    accessType: AccessType;
    encryptedPrivateKey: string;
}

export interface Avatar {
    id: string;
    location: string;
}
