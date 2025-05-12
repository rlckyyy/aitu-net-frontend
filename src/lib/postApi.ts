import {request} from "@/lib/apiClient";
import {Post, PostDTO, PostType} from "@/models/post/post";
import {Reaction} from "@/models/reaction/reaction";

export const postApi = {
    getById: async (id: string) => {
        return await request<Post>(`/post/${id}`);
    },

    searchPosts: async (groupId?: string, ownerId?: string, postType?: PostType, description?: string) => {
        const params: Record<string, any> = {};
        console.log(groupId, ownerId, postType, description);
        if (groupId) params.groupId = groupId;
        if (ownerId) params.ownerId = ownerId;
        if (postType) params.postType = postType;
        if (description) params.description = description;
        return await request<Post[]>(`/post/public`, {
            params: params,
        });
    },

    createPost: async (post: PostDTO, files: File[]) => {
        const formData = new FormData();
        formData.append("post", new Blob([JSON.stringify(post)], {type: "application/json"}));

        files.forEach(file => formData.append("files", file));

        return await request<Post>(`/post`, {
            method: "POST",
            data: formData,
            headers: {"Content-Type": "multipart/form-data"}
        });
    },

    updatePost: async (id: string, update: { description: string }) => {
        return await request<Post>(`/post/${id}`, {
            method: "PATCH",
            data: update,
        });
    },

    deleteFiles: async (postId: string, fileIds: string[]) => {
        const params = new URLSearchParams();
        fileIds.forEach((id) => params.append("fileIds", id));

        return await request<Post>(`/post/${postId}?${params.toString()}`, {
            method: "DELETE",
        });
    },

    updatePostReaction: async (reaction: Reaction) => {
        return await request<Post>(`/post/reactions`, {
            method: "PATCH",
            data: reaction,
        });
    },

    deletePostReaction: async (postId: string, userId: string) => {
        return await request<Post>(`/post/${postId}/reactions/${userId}`, {
            method: "DELETE",
        });
    },

    getReactions: async (postId: string) => {
        return await request<Reaction[]>(`/post/public/${postId}/reactions`);
    }
};