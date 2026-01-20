import { api } from "@/lib/apiClient";

export const deleteAccountApi = async (data: {
  fullName: string;
  email: string;
  phone: string;
  reason: string;
  additionalInfo?: string;
}) => {
  try {
    const response = await api.post('/delete-account-request', data);
    
    return {  statusText: response.statusText  , response};
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};