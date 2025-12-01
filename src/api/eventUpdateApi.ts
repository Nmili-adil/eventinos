// src/api/eventUpdateApi.ts
import { api } from "@/lib/apiClient";
import { getAuthToken } from "@/services/localStorage";

// Update basic event information
export const updateEventInfos = async (eventId: string, data: any) => {
  return api.put(`/events/${eventId}/infos`, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`
    }
  });
};

// Update event speakers
export const updateEventSpeakers = async (eventId: string, speakers: any[]) => {
  const formData = new FormData();
  // Add speakers data to formData
  formData.append('speakers', JSON.stringify(speakers));
  
  // Handle file uploads if needed
  // speakers.forEach((speaker, index) => {
  //   if (speaker.pictureFile) {
  //     formData.append(`speaker-${index}`, speaker.pictureFile);
  //   }
  // });
  
  return api.put(`/events/${eventId}/speakers`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${getAuthToken()}`
    }
  });
};

// Update event exhibitors
export const updateEventExhibitors = async (eventId: string, exhibitors: any[]) => {
  const formData = new FormData();
  formData.append('exhibitors', JSON.stringify(exhibitors));
  
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
  formData.append('sponsors', JSON.stringify(sponsors));
  
  return api.put(`/events/${eventId}/sponsors`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${getAuthToken()}`
    }
  });
};

// Update event location
export const updateEventLocation = async (eventId: string, location: any) => {
  return api.put(`/events/${eventId}/location`, location, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`
    }
  });
};

// Update event dates
export const updateEventDates = async (eventId: string, dates: { startDate: any; endDate: any }) => {
  return api.put(`/events/${eventId}/date`, dates, {
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