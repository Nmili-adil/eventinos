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
    }
}