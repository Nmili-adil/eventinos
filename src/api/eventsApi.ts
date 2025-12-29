import { api } from "@/lib/apiClient"
import { getAuthToken } from "@/services/localStorage"

export const fetchEvents = async () => {
  return api.get(`/events?limit=all`, {
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
  const formData = new FormData();

  // Add all fields to FormData
  Object.keys(event).forEach(key => {
    if (key === 'image' && event[key] instanceof File) {
      formData.append('image', event[key]);
    } else if (Array.isArray(event[key])) {
      // Handle arrays - send as JSON string for complex arrays, or individual values for simple arrays
      if (key === 'badges' || key === 'gallery' || key === 'tags' || key === 'requirements') {
        // Simple string arrays - send as individual values
        event[key].forEach((item: any, index: number) => {
          formData.append(`${key}[${index}]`, item);
        });
      } else {
        // Complex object arrays - send as JSON string
        formData.append(key, JSON.stringify(event[key]));
      }
    } else if (typeof event[key] === 'object' && event[key] !== null) {
      formData.append(key, JSON.stringify(event[key]));
    } else if (event[key] !== undefined && event[key] !== null) {
      formData.append(key, event[key]);
    }
  });

  try {
    const response = await api.post('/events', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
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