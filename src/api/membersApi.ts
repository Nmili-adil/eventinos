import { api } from "@/lib/apiClient";
import { getAuthToken } from "@/services/localStorage";

export const fetchMembersApi = async () => {
    try {
        const response = await api.get('/members', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        });
        return response;
    } catch (error) {
        console.log(error)
    }
}

export const deleteMemberApi = async (memberId: string) => {
    try {
        const response = await api.delete(`/members/${memberId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        });
        return response;
    } catch (error) {
        console.log(error)
    }
}