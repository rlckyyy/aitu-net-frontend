import {request} from "@/lib/apiClient";
import {Group, GroupCreateDto} from "@/models/group/group";

export const groupApi = {
    getById: async (id: string) => {
        return await request<Group>(`/group/${id}`);
    },
    searchGroups: async (name?: string, ownerId?: string, userId?: string ) => {
        const params: Record<string, any> = {};

        if (name) params.groupId = name;
        if (ownerId) params.ownerId = ownerId;
        if (userId) params.postType = userId;
        return await request<Group[]>(`/group/search`, params);
    },
    createGroup: async (createDto: GroupCreateDto) => {
        return await request(`/group`, {method: "POST", data: createDto});
    },
    followGroup: async (groupId: string) => {
        return await request(`/group/${groupId}/follow`, {method: "POST"});
    }
};