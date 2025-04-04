import {UserRegisterData} from "@/models/userRegisterData";
import {request} from "@/lib/apiClient";
import {AxiosResponse} from "axios";
import {User} from "@/models/user";

export const postApi = {
    // 1. Получить пост по ID
    getById: async (id: string) => {
        return await request<Post>(`/post/${id}`);
    },

    // 2. Поиск постов по критериям
    searchPosts: async (criteria: PostDTO) => {
        return await request<Post[]>(`/post`, {
            method: "GET",
            data: criteria,
        });
    },

    // 3. Создание поста с файлами
    createPost: async (post: PostDTO, files: File[]) => {
        const formData = new FormData();
        formData.append("post", new Blob([JSON.stringify(post)], { type: "application/json" }));
        files.forEach((file) => formData.append("files", file));

        return await request<Post>(`/post`, {
            method: "POST",
            headers: {
                "Content-Type": "multipart/form-data",
            },
            data: formData,
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
};