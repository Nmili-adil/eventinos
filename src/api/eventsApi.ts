import { api } from "@/lib/apiClient"
import { getAuthToken } from "@/services/localStorage"

export const fetchEvents = async () => {
  return api.get('/events?limit=all', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  })
}
export const fetchEventByIdApi = async (eventId: string): Promise<any> => { // Use more specific type if available
  try {
    const response = await api.get(`/events/${eventId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`
      }
    });
    return response.data; // Return only the data part
  } catch (error) {
    console.error(`Error fetching event ${eventId}:`, error);
    throw error; // Re-throw to handle in the component
  }
}

export const updateEventApi = async (id: string | undefined, event: any) => {
  try {
    const response = await api.put(`/events/${id}`, event, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`
      }
    });
    return response.data; // Return only the data part
  } catch (error) {
    console.error(`Error updating event ${id}:`, error);
    throw error; // Re-throw to handle in the component
  }
}

export const deleteEventApi = async (id: string) => {
  try {
    const response = await api.delete(`/events/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`
      }
    });
    return response.data; // Return only the data part
  } catch (error) {
    console.error(`Error deleting event ${id}:`, error);
    throw error; // Re-throw to handle in the component
  }
}