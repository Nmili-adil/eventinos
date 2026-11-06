import { api } from "@/lib/apiClient"
import { getAuthToken } from "@/services/localStorage"
import { buildLocationPayload } from "@/lib/events-utils"
import { appendExhibitors, appendOrganizer, appendSpeakers, appendSponsors, isFileValue } from "./eventSerializers"

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

const buildEventFormData = (event: any) => {
  const formData = new FormData();

  // Add all fields to FormData
  Object.keys(event).forEach(key => {
    if ((key === 'image' || key === 'logo') && isFileValue(event[key])) {
      formData.append(key, event[key]);
    } else if (key === 'speakers' && Array.isArray(event[key]) && event[key].length > 0) {
      appendSpeakers(formData, event[key]);
    } else if (key === 'exhibitors' && Array.isArray(event[key]) && event[key].length > 0) {
      appendExhibitors(formData, event[key]);
    } else if (key === 'sponsors' && Array.isArray(event[key]) && event[key].length > 0) {
      appendSponsors(formData, event[key]);
    } else if (Array.isArray(event[key])) {
      // Handle other arrays - send as individual values for simple arrays
      if (key === 'badges' || key === 'gallery' || key === 'tags' || key === 'requirements') {
        event[key].forEach((item: any, index: number) => {
          formData.append(`${key}[${index}]`, item);
        });
      } else if (event[key].length > 0) {
        // Other complex arrays - send as JSON string
        formData.append(key, JSON.stringify(event[key]));
      }
    } else if (key === 'organizer') {
      appendOrganizer(formData, event[key]);
    } else if (key === 'location' && typeof event[key] === 'object' && event[key] !== null) {
      formData.append(key, JSON.stringify(buildLocationPayload(event[key])));
    } else if (typeof event[key] === 'object' && event[key] !== null) {
      formData.append(key, JSON.stringify(event[key]));
    } else if (event[key] !== undefined && event[key] !== null) {
      formData.append(key, event[key]);
    }
  });

  return formData;
}

export const updateEventApi = async (id: string | undefined, event: any) => {
  const formData = buildEventFormData(event);

  try {
    const response = await api.put(`/events/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
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
  const formData = buildEventFormData(event);

  try {
    const response = await api.post('/events', formData, {
      skipServerErrorPage: event.status === 'DRAFT',
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

export const submitEventApi = async (id: string) => {
  const response = await api.put(`/events/${id}/submit`, undefined, {
    skipServerErrorPage: true,
  });
  return response.data;
}

export const deleteEventMemberApi = async (eventId: string, memberId: string) => {
  try {
    const response = await api.delete(`/events/${eventId}/members/${memberId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`
      }
    });
    return response.data; // Return only the data part
  } catch (error) {
    console.error(`Error deleting member ${memberId} from event ${eventId}:`, error);
    throw error; // Re-throw to handle in the component
  }
}
