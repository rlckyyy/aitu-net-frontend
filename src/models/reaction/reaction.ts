export interface Reaction {
    id?: string;
    postId?: string;
    userId?: string;
    reactionType?: ReactionType;
}

export enum ReactionType {
    LIKE = 'LIKE',
    DISLIKE = 'DISLIKE',
}