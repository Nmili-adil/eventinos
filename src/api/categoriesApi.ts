import { api } from "@/lib/apiClient"
import { getAuthToken } from "@/services/localStorage"

export const fetchCategories = async () => {
  const response = await api.get('/categories', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  })
  return response
}

export const fetchCategoryById = async (id: string) => {
  const response = await api.get(`/categories/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  })
  return response.data
}

export const updateCategory = async (id: string, data: any) => {
  const response = await api.put(`/categories/${id}`, data, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  })
  return response.data
}

export const createCategory = async (data: any) => {
  const response = await api.post('/categories', data, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  })
  return response.data
}

export const deleteCategory = async (id: string) => {
  const response = await api.delete(`/categories/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  })
  return response.data
}
