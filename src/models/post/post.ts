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
    createdAt?: Date;
    updatedAt?: Date;
    resource?: string;
    description?: string;
    mediaFileIds?: string[];
}

export enum PostType {
    GROUP = 'GROUP',
    USER = 'USER',
}