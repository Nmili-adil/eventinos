import { api } from "@/lib/apiClient"
import { getAuthToken } from "@/services/localStorage"

export const fetchEvents = async (page: number = 1, limit: number = 10) => {
  return api.get(`/events?page=${page}&limit=${limit}`, {
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

export const createEventApi = async (event: any) => {
  try {
    const response = await api.post('/events', event, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`
      }
    });
    return response.data; // Return only the data part
  } catch (error) {
    console.error('Error creating event:', error);
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

export const updateEventStatusApi = async (id: string, status: string) => {
  console.log(id);
  
  try {
    const response = await api.put(`/events/${id}/status`, { status }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`
      }
    });
    return response.data; // Return only the data part
  } catch (error) {
    console.error(`Error updating event status ${id}:`, error);
    throw error; // Re-throw to handle in the component
  }
}