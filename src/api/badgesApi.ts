import { api } from "@/lib/apiClient"

export const fetchBadgesApi = async () => {
    try {
        const response = await api.get("/badges")
        return response
    } catch (error) {
        console.log(error)
    }
}

export const fetchBadgeByIdApi = async (id: string) => {
    try {
        const response = await api.get(`/badges/${id}`)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const updateBadgeApi = async (id: string, badge: any) => {
    try {
        const response = await api.put(`/badges/${id}`, badge)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const createBadgeApi = async (badge: any) => {
    try {
        const response = await api.post(`/badges`, badge)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const deleteBadgeApi = async (id: string) => {
    try {
        const response = await api.delete(`/badges/${id}`)
        return response
    } catch (error) {
        console.log(error)
    }
}
