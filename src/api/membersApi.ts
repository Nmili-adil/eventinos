import { api } from "@/lib/apiClient";
import { getAuthToken } from "@/services/localStorage";

export const fetchMembersApi = async (page: number = 1, pageSize: number = 10) => {
    try {
        const response = await api.get('/members', {
            params: {
                page,
                limit: pageSize,
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        });
        return response;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

export const createMemberApi = async (data: any) => {
    try {
        const response = await api.post('/members', data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        });
        return response;
    } catch (error) {
        console.log(error)
        throw error;
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

export const updateMemberApi = async (memberId: string, data: any) => {
    try {
        const response = await api.put(`/members/${memberId}`, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        });
        return response;
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const updateMemberStatusApi = async (memberId: string, isActive: boolean) => {
    try {
        const response = await api.put(`/members/${memberId}/status`, { isActive }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        });
        return response;
    } catch (error) {
        console.log(error)
        throw error
    }
}