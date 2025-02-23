import {request} from "@/lib/apiClient";
import {ProfileUpdate} from "@/models/ProfileUpdate";

export const userApi = {
    updateUser: (profileUpdate: ProfileUpdate) =>
        request('/users', { method: 'PATCH', data: profileUpdate }),

    deleteProfilePhoto: () => request('/users/profile/photo', { method: 'DELETE' }),

    uploadProfilePhoto: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        return request('/users/profile/photo', {
            method: 'PATCH',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    getProfilePhoto: (id: string) =>
        request(`/users/profile/photo/${id}`, { method: 'GET' }),
};