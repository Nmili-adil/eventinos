// src/api/eventUpdateApi.ts
import { api } from "@/lib/apiClient";
import { getAuthToken } from "@/services/localStorage";

// Update basic event information
export const updateEventInfos = async (eventId: string, data: any) => {
  const formData = new FormData();
  
  // Add basic fields
  Object.keys(data).forEach(key => {
    if (key === 'image' && data[key] instanceof File) {
      formData.append('image', data[key]);
    } else if (typeof data[key] === 'object' && data[key] !== null) {
      formData.append(key, JSON.stringify(data[key]));
    } else if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  });
  
  return api.put(`/events/${eventId}/infos`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${getAuthToken()}`
    }
  });
};

// Update event category
export const updateEventCategory = async (eventId: string, categoryId: string) => {
  return api.put(`/events/${eventId}/category`, { category: categoryId }, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`
    }
  });
};

// Update event speakers
export const updateEventSpeakers = async (eventId: string, speakers: any[]) => {
  const formData = new FormData();
  
  // Add speakers data
  speakers.forEach((speaker, index) => {
    // Add speaker fields
    if (speaker._id) formData.append(`speakers.${index}._id`, speaker._id);
    if (speaker.fullName) formData.append(`speakers.${index}.fullName`, speaker.fullName);
    
    // Handle picture file or URL
    if (speaker.picture instanceof File) {
      formData.append(`speakers.${index}.picture`, speaker.picture);
    } else if (speaker.picture) {
      formData.append(`speakers.${index}.picture`, speaker.picture);
    }
    
    // Add social networks
    if (speaker.socialNetworks) {
      Object.keys(speaker.socialNetworks).forEach(key => {
        if (speaker.socialNetworks[key]) {
          formData.append(`speakers.${index}.socialNetworks.${key}`, speaker.socialNetworks[key]);
        }
      });
    }
  });
  
  return api.put(`/events/${eventId}/speakers`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${getAuthToken()}`
    }
  });
};

export const updateEventGallery = async (eventId: string, galleryImages: string[]) => {
  return api.put(`/events/${eventId}/gallery`, { gallery: galleryImages }, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`
    }
  });
};

// Update event exhibitors
export const updateEventExhibitors = async (eventId: string, exhibitors: any[]) => {
  const formData = new FormData();
  
  // Add exhibitors data
  exhibitors.forEach((exhibitor, index) => {
    // Add exhibitor fields
    if (exhibitor._id) formData.append(`exhibitors.${index}._id`, exhibitor._id);
    if (exhibitor.fullName) formData.append(`exhibitors.${index}.fullName`, exhibitor.fullName);
    
    // Handle picture file or URL
    if (exhibitor.picture instanceof File) {
      formData.append(`exhibitors.${index}.picture`, exhibitor.picture);
    } else if (exhibitor.picture) {
      formData.append(`exhibitors.${index}.picture`, exhibitor.picture);
    }
    
    // Add social networks
    if (exhibitor.socialNetworks) {
      Object.keys(exhibitor.socialNetworks).forEach(key => {
        if (exhibitor.socialNetworks[key]) {
          formData.append(`exhibitors.${index}.socialNetworks.${key}`, exhibitor.socialNetworks[key]);
        }
      });
    }
  });
  
  return api.put(`/events/${eventId}/exhibitors`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${getAuthToken()}`
    }
  });
};

// Update event sponsors
export const updateEventSponsors = async (eventId: string, sponsors: any[]) => {
  const formData = new FormData();
  
  // Add sponsors data
  sponsors.forEach((sponsor, index) => {
    // Add sponsor fields
    if (sponsor._id) formData.append(`sponsors.${index}._id`, sponsor._id);
    if (sponsor.name) formData.append(`sponsors.${index}.name`, sponsor.name);
    
    // Handle logo file or URL
    if (sponsor.logo instanceof File) {
      formData.append(`sponsors.${index}.logo`, sponsor.logo);
    } else if (sponsor.logo) {
      formData.append(`sponsors.${index}.logo`, sponsor.logo);
    }
    
    // Add social networks
    if (sponsor.socialNetworks) {
      Object.keys(sponsor.socialNetworks).forEach(key => {
        if (sponsor.socialNetworks[key]) {
          formData.append(`sponsors.${index}.socialNetworks.${key}`, sponsor.socialNetworks[key]);
        }
      });
    }
  });
  
  return api.put(`/events/${eventId}/sponsors`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${getAuthToken()}`
    }
  });
};

// Update event location
export const updateEventLocation = async (eventId: string, location: any) => {
  // Ensure location has the correct structure for the backend
  const formattedLocation = {
    location: {
      coordinates: {
        latitude: location?.coordinates?.latitude || location?.location?.lat || 0,
        longitude: location?.coordinates?.longitude || location?.location?.lng || 0
      },
      name: location?.name || ""
    }
  };
  
  return api.put(`/events/${eventId}/location`, formattedLocation, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`
    }
  });
};

// Update event dates
export const updateEventDates = async (eventId: string, dates: { startDate: any; endDate: any }) => {
  // Format dates to DD-MM-YYYY as expected by backend
  const formatDate = (dateObj: any) => {
    if (!dateObj) return { date: "", time: "" };
    
    // If it's already an object with date and time
    if (typeof dateObj === 'object' && dateObj.date) {
      const dateValue = dateObj.date;
      let formattedDate = "";
      
      // Convert date to DD-MM-YYYY format
      if (dateValue instanceof Date) {
        const day = String(dateValue.getDate()).padStart(2, '0');
        const month = String(dateValue.getMonth() + 1).padStart(2, '0');
        const year = dateValue.getFullYear();
        formattedDate = `${day}-${month}-${year}`;
      } else if (typeof dateValue === 'string') {
        // Try to parse the string and convert to DD-MM-YYYY
        const parsedDate = new Date(dateValue);
        if (!isNaN(parsedDate.getTime())) {
          const day = String(parsedDate.getDate()).padStart(2, '0');
          const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
          const year = parsedDate.getFullYear();
          formattedDate = `${day}-${month}-${year}`;
        } else {
          // Already in DD-MM-YYYY format
          formattedDate = dateValue;
        }
      }
      
      return {
        date: formattedDate,
        time: dateObj.time || ""
      };
    }
    
    // If it's a plain date string or Date object
    if (dateObj instanceof Date || typeof dateObj === 'string') {
      const date = dateObj instanceof Date ? dateObj : new Date(dateObj);
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return { date: `${day}-${month}-${year}`, time: "" };
      }
    }
    
    return { date: "", time: "" };
  };
  
  const formattedDates = {
    startDate: formatDate(dates.startDate),
    endDate: formatDate(dates.endDate)
  };
  
  return api.put(`/events/${eventId}/date`, formattedDates, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`
    }
  });
};

// Update event social networks
export const updateEventSocialNetworks = async (eventId: string, socialNetworks: any) => {
  return api.put(`/events/${eventId}/socialNetworks`, socialNetworks, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`
    }
  });
};

// Update event badge
export const updateEventBadge = async (eventId: string, badges: string[]) => {
  return api.put(`/events/${eventId}/badge`, { badges }, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`
    }
  });
};

// Update event status
export const updateEventStatus = async (eventId: string, status: string) => {
  return api.put(`/events/${eventId}/status`, { status }, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`
    }
  });
};