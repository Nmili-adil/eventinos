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

  // Helper function to append speakers data with indexed format
  const appendSpeakers = (speakers: any[]) => {
    speakers.forEach((speaker, index) => {
      if (speaker._id) formData.append(`speakers[${index}][_id]`, speaker._id);
      if (speaker.fullName) formData.append(`speakers[${index}][fullName]`, speaker.fullName);
      
      // Handle picture file or URL
      if (speaker.picture instanceof File) {
        formData.append(`speakers[${index}][picture]`, speaker.picture);
      } else if (speaker.picture) {
        formData.append(`speakers[${index}][picture]`, speaker.picture);
      }
      
      // Add social networks
      if (speaker.socialNetworks) {
        Object.keys(speaker.socialNetworks).forEach(key => {
          const value = speaker.socialNetworks[key];
          if (value !== undefined && value !== null && value !== '') {
            formData.append(`speakers[${index}][socialNetworks][${key}]`, value);
          }
        });
      }
    });
  };

  // Helper function to append exhibitors data with indexed format
  const appendExhibitors = (exhibitors: any[]) => {
    exhibitors.forEach((exhibitor, index) => {
      if (exhibitor._id) formData.append(`exhibitors[${index}][_id]`, exhibitor._id);
      if (exhibitor.fullName) formData.append(`exhibitors[${index}][fullName]`, exhibitor.fullName);
      
      // Handle picture file or URL
      if (exhibitor.picture instanceof File) {
        formData.append(`exhibitors[${index}][picture]`, exhibitor.picture);
      } else if (exhibitor.picture) {
        formData.append(`exhibitors[${index}][picture]`, exhibitor.picture);
      }
      
      // Add social networks
      if (exhibitor.socialNetworks) {
        Object.keys(exhibitor.socialNetworks).forEach(key => {
          const value = exhibitor.socialNetworks[key];
          if (value !== undefined && value !== null && value !== '') {
            formData.append(`exhibitors[${index}][socialNetworks][${key}]`, value);
          }
        });
      }
    });
  };

  // Helper function to append sponsors data with indexed format
  const appendSponsors = (sponsors: any[]) => {
    sponsors.forEach((sponsor, index) => {
      if (sponsor._id) formData.append(`sponsors[${index}][_id]`, sponsor._id);
      if (sponsor.name) formData.append(`sponsors[${index}][name]`, sponsor.name);
      
      // Handle logo file or URL
      if (sponsor.logo instanceof File) {
        formData.append(`sponsors[${index}][logo]`, sponsor.logo);
      } else if (sponsor.logo) {
        formData.append(`sponsors[${index}][logo]`, sponsor.logo);
      }
      
      // Add social networks
      if (sponsor.socialNetworks) {
        Object.keys(sponsor.socialNetworks).forEach(key => {
          const value = sponsor.socialNetworks[key];
          if (value !== undefined && value !== null && value !== '') {
            formData.append(`sponsors[${index}][socialNetworks][${key}]`, value);
          }
        });
      }
    });
  };

  // Add all fields to FormData
  Object.keys(event).forEach(key => {
    if (key === 'image' && event[key] instanceof File) {
      formData.append('image', event[key]);
    } else if (key === 'speakers' && Array.isArray(event[key]) && event[key].length > 0) {
      // Use indexed format that backend's convertDotNotationToNested can parse
      appendSpeakers(event[key]);
    } else if (key === 'exhibitors' && Array.isArray(event[key]) && event[key].length > 0) {
      // Use indexed format that backend's convertDotNotationToNested can parse
      appendExhibitors(event[key]);
    } else if (key === 'sponsors' && Array.isArray(event[key]) && event[key].length > 0) {
      // Use indexed format that backend's convertDotNotationToNested can parse
      appendSponsors(event[key]);
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