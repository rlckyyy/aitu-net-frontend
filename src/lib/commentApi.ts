import {request} from "@/lib/apiClient";
import {Comment, CommentCriteria} from "@/models/comment/comment";

export const commentApi = {
    saveComment: async (comment: Comment, files: File[]) => {
        const formData = new FormData();
        formData.append("comment", new Blob([JSON.stringify(comment)], {type: "application/json"}));
        files.forEach(file => formData.append("files", file));
        return await request(`/comments`,
            {method: 'POST', data: formData});
    },

    getComments: async (criteria: CommentCriteria) => {
        return await request<Comment[]>(`/comments/public`,
            {method: 'GET', params: criteria});
    },

    deleteComment: async (commentId: string) => {
        return await request(`/comments/${commentId}`,
            {method: 'DELETE'});
    },
    updateComment: async (commentId: string, update: { content: string }) => {
        return await request(`/comments/${commentId}`,
            {method: 'PATCH', data: update});
    }
}