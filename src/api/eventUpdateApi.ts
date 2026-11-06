// src/api/eventUpdateApi.ts
import { api } from "@/lib/apiClient";
import { getAuthToken } from "@/services/localStorage";
import { buildLocationPayload, toEventDateTime } from "@/lib/events-utils";
import { appendExhibitors, appendOrganizer, appendSpeakers, appendSponsors, isFileValue } from "./eventSerializers";

// Update basic event information
export const updateEventInfos = async (eventId: string, data: any) => {
  const formData = new FormData();
  
  // Add basic fields
  Object.keys(data).forEach(key => {
    if ((key === 'image' || key === 'logo') && isFileValue(data[key])) {
      formData.append(key, data[key]);
    } else if (key === 'organizer') {
      appendOrganizer(formData, data[key]);
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
  
  appendSpeakers(formData, speakers);

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
  
  appendExhibitors(formData, exhibitors);

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
  
  appendSponsors(formData, sponsors);

  return api.put(`/events/${eventId}/sponsors`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${getAuthToken()}`
    }
  });
};

// Update event location
export const updateEventLocation = async (eventId: string, location: any) => {
  const payload = { location: buildLocationPayload(location) };

  return api.put(`/events/${eventId}/location`, payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`
    }
  });
};

// Update event dates
export const updateEventDates = async (eventId: string, dates: { startDate: any; endDate: any }) => {
  const formattedDates = {
    startDate: toEventDateTime(dates.startDate),
    endDate: toEventDateTime(dates.endDate),
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
