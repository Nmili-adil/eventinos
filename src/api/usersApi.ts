import { api } from "@/lib/apiClient"
import { getAuthToken } from "@/services/localStorage"

export const fetchUsers = async () => {
  return api.get('/users', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  })
}