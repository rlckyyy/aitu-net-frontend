export interface User {
    id: string;
    email: string;
    username: string;
    roles: string[];
    friendList: string[];
    photoPath: string | null;
}