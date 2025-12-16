import { api } from "@/lib/apiClient";
import { getAuthToken } from "@/services/localStorage";

export interface Right {
  _id: string;
  name: string;
  group: string;
  createdAt: string;
  updatedAt: string;
}

export const fetchRightsApi = async () => {
  try {
    const response = await api.get('/rights', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

