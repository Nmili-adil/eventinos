import { api } from "@/lib/apiClient";
import { getAuthToken } from "@/services/localStorage";

export interface Contact {
  _id:string;
  subject: string;
  message: string;
  user: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export const fetchContactsApi = async () => {
  try {
    const response = await api.get('/contacts', {
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

export const deleteContactApi = async (contactId: string) => {
  try {
    const response = await api.delete(`/contacts/${contactId}`, {
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

