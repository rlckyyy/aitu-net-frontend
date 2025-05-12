export interface Comment {
    id?: string;
    postId?: string;
    userId?: string;
    content?: string;
    mediaFileLinks?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CommentCriteria {
    postId?: string;
    userId?: string;
    groupId?: string;
}