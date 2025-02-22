export interface User {
    id: string;
    email: string;
    username: string;
    description: string;
    roles: string[];
    friendList: string[];
    avatar: Avatar;
}

interface Avatar {
    id: string;
    location: string;
}
