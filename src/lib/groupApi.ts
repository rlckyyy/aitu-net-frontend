import {request} from "@/lib/apiClient";
import {Group, GroupCreateDto} from "@/models/group/group";

export const groupApi = {
    getById: async (id: string) => {
        return await request<Group>(`/group/${id}`);
    },
    searchGroups: async (name?: string, ownerId?: string, userId?: string) => {
        const params: Record<string, any> = {};

        if (name) params.name = name;
        if (ownerId) params.ownerId = ownerId;
        if (userId) params.userId = userId;
        return await request<Group[]>(`/group/search`, params);
    },
    createGroup: async (createDto: GroupCreateDto, avatar: File | undefined) => {
        const formData = new FormData();
        formData.append("dto", new Blob([JSON.stringify(createDto)], { type: "application/json" }));
        if (avatar) {
            formData.append("file", avatar);
        }
        return await request(`/group`,
            {
                method: "POST",
                data: formData,
            });
    },
    followGroup: async (groupId: string) => {
        return await request(`/group/${groupId}/follow`, {method: "POST"});
    }
};