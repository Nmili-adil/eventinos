import { api } from "@/lib/apiClient"
import { getAuthToken } from "@/services/localStorage"

export const createOrganizerApi = async (data: any) => {
  return api.post(`/organizers`, data, {
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
    },
  })
}