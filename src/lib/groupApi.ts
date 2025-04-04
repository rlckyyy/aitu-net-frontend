import {request} from "@/lib/apiClient";
import {GroupCreateDto} from "@/models/group/group";

export const groupApi = {
    getById: async (id: string) => {
        return await request(`/group/${id}`);
    },
    searchGroups: async (params: { name?: string; ownerId?: string; userId?: string }) => {
        return await request(`/group/search`, params);
    },
    createGroup: async (createDto: GroupCreateDto) => {
        return await request(`/group`, {method: "POST", data: createDto});
    },
    followGroup: async (groupId: string) => {
        return await request(`/group/${groupId}/follow`, {method: "POST"});
    }
};