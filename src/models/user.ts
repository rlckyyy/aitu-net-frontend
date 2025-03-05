export interface User {
    id: string;
    email: string;
    username: string;
    description: string;
    roles: string[];
    friendList: string[];
    avatar: Avatar;
    publicKey: string;
}

interface Avatar {
    id: string;
    location: string;
}
