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
}

export interface Avatar {
    id: string;
    location: string;
}
