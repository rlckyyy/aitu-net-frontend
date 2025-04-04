interface PostDTO {
    ownerId?: string;
    groupId?: string;
    description?: string;
}

interface Post {
    id: string;
    ownerId?: string;
    groupId?: string;
    description?: string;
    mediaFileIds?: string[];
}