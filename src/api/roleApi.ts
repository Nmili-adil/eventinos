import { api } from "@/lib/apiClient"
import { getAuthToken } from "@/services/localStorage"

export const rolesApi = async () =>  {
    try {
        const response = await api.get('/roles', {
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${getAuthToken()}`,
            },
        })
        return response
    } catch (error:any) {
        console.log("Error while fetching roles: ", error)
    }
}

export const roleApi =  async (roleId:string) =>  {
    try {
        const response = await api.get(`/roles/${roleId}`, {
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${getAuthToken()}`,
            },
        })
        return response
    } catch (error:any) {
        console.log("Error while fetching role: ", error)
        throw error
    }
}

export const createRoleApi = async (data: any) => {
    try {
        const response = await api.post('/roles', data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        })
        return response
    } catch (error: any) {
        console.log("Error while creating role: ", error)
        throw error
    }
}

export const updateRoleApi = async (roleId: string, data: any) => {
    try {
        const response = await api.put(`/roles/${roleId}`, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        })
        return response
    } catch (error: any) {
        console.log("Error while updating role: ", error)
        throw error
    }
}

export const deleteRoleApi = async (roleId: string) => {
    try {
        const response = await api.delete(`/roles/${roleId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        })
        return response
    } catch (error: any) {
        console.log("Error while deleting role: ", error)
        throw error
    }
}