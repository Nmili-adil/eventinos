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


export const getUserById = async (userId: string) => {
  return api.get(`/users/${userId}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  })
}

export const updateUserApi = async (userId: string, data: any) => {
  try {
    const response = await api.put(`/users/${userId}`, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const updateUserPasswordApi = async (userId: string, newPassword: string) => {
  try {
    const response = await api.patch(`/users/${userId}/password`, { password: newPassword }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
}