import { api } from "@/lib/apiClient"
import { getAuthToken } from "@/services/localStorage"

export const fetchSponsorCategoriesApi = async (
  page: number = 1,
  pageSize: number = 10,
  sort?: string,
  search?: string
) => {
  const response = await api.get('/sponsor-categories', {
    params: {
      page,
      limit: pageSize,
      ...(sort ? { sort } : {}),
      ...(search ? { search } : {}),
    },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  })
  return response
}

export const fetchAllSponsorCategoriesApi = async () => {
  const response = await api.get('/sponsor-categories/all', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  })
  return response
}

export const fetchSponsorCategoryByIdApi = async (id: string) => {
  const response = await api.get(`/sponsor-categories/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  })
  return response
}

export const createSponsorCategoryApi = async (data: { name: string }) => {
  const response = await api.post('/sponsor-categories', data, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  })
  return response
}

export const updateSponsorCategoryApi = async (id: string, data: { name: string }) => {
  const response = await api.put(`/sponsor-categories/${id}`, data, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  })
  return response
}

export const deleteSponsorCategoryApi = async (id: string) => {
  const response = await api.delete(`/sponsor-categories/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  })
  return response
}

export const exportSponsorCategoriesApi = async () => {
  const response = await api.get('/sponsor-categories/export', {
    responseType: 'blob',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  })
  return response
}
