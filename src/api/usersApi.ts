import { api } from "@/lib/apiClient"
import { getAuthToken } from "@/services/localStorage"

export const fetchUsers = async (page = 1, limit = 10, role: 'all' | 'organizer' | 'member' | 'admin' = 'all') => {
  const params: Record<string, any> = {
    page,
    limit,
    // role
  }

  if (role && role !== 'all') {
    params.role = role
  }

  return api.get('/users/all', {
    params,
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
    const response = await api.put(`/users/${userId}`, { password: newPassword }, {
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

export const createUserApi = async (data: any) => {
  try {
    const response = await api.post('/users', data, {
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

export const updateAccoutStatusApi = async (memberId: string, isActive: boolean) => {
  try {
      const response = await api.put(`/users/${memberId}/status`, { isActive }, {
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