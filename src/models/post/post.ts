export interface PostDTO {
    ownerId?: string;
    groupId?: string;
    postType?: PostType;
    description?: string;
}

export interface Post {
    id: string;
    ownerId?: string;
    groupId?: string;
    postType?: PostType;
    description?: string;
    mediaFileIds?: string[];
}

export enum PostType {
    GROUP = 'GROUP',
    USER = 'USER',
}