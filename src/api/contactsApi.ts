import { api } from "@/lib/apiClient";
import { getAuthToken } from "@/services/localStorage";

export interface ContactUser {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  picture?: string;
  gender?: string;
}

export interface Contact {
  _id: string;
  subject: string;
  message: string;
  user?: ContactUser | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ContactsPagination {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const fetchContactsApi = async (page = 1, limit = 10) => {
  try {
    const response = await api.get('/contacts', {
      params: {
        page,
        limit,
      },
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

export const replyToContactApi = async (contactId: string, payload: { message: string }) => {
  try {
    const response = await api.post(`/contacts/${contactId}/reply`, payload, {
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

