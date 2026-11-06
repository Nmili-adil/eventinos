import type { EventFormData } from "@/schema/eventSchema";
import {
  combineDateTime,
  formatLocalTime,
  normalizeCategoryId,
  normalizeLocation,
} from "@/lib/events-utils";

const mapSocialNetworks = (socialNetworks: any) => ({
  facebook: socialNetworks?.facebook || "",
  instagram: socialNetworks?.instagram || "",
  linkedin: socialNetworks?.linkedin || "",
  twitter: socialNetworks?.twitter || "",
  website: socialNetworks?.website || "",
});

// The form always holds `date` as an ISO string that already includes the time.
export const mapEventDateToForm = (value: any) => {
  const date = combineDateTime(value?.date, value?.time);
  return date
    ? { date: date.toISOString(), time: formatLocalTime(date) }
    : { date: "", time: "" };
};

const mapPerson = (person: any) => ({
  _id: person._id || "",
  fullName: person.fullName || "",
  picture: person.picture || "",
  fonction: person.fonction || "",
  nationality: person.nationality || "",
  socialNetworks: mapSocialNetworks(person.socialNetworks),
});

export const mapEventToForm = (event: any): EventFormData =>
  ({
    createdBy: event.createdBy?._id || event.createdBy || "",
    name: event.name || "",
    description: event.description || "",
    image: event.image || "",
    logo: event.logo || "",
    visibility: event.visibility || "PUBLIC",
    type: event.type || "FACETOFACE",
    isNearestEvent: event.isNearestEvent || false,
    isUpComingEvent: event.isUpComingEvent || false,
    status: event.status || "PENDING",
    category: normalizeCategoryId(event.category),
    capacity: event.capacity || 0,
    allowRegistration: event.allowRegistration || false,
    registrationDeadline: event.registrationDeadline || { date: "", time: "" },
    startDate: mapEventDateToForm(event.startDate),
    endDate: mapEventDateToForm(event.endDate),
    location: normalizeLocation(event.location),
    socialNetworks: mapSocialNetworks(event.socialNetworks),
    speakers: Array.isArray(event.speakers) ? event.speakers.map(mapPerson) : [],
    exhibitors: Array.isArray(event.exhibitors) ? event.exhibitors.map(mapPerson) : [],
    sponsors: Array.isArray(event.sponsors)
      ? event.sponsors.map((sponsor: any) => ({
          _id: sponsor._id || "",
          name: sponsor.name || "",
          logo: sponsor.logo || "",
          category: normalizeCategoryId(sponsor.category),
          socialNetworks: mapSocialNetworks(sponsor.socialNetworks),
        }))
      : [],
    gallery: Array.isArray(event.gallery) ? event.gallery : [],
    badges: Array.isArray(event.badges)
      ? event.badges.map((badge: any) => badge.id || badge._id || "")
      : [],
    program: event.program || "",
    tags: Array.isArray(event.tags) ? event.tags : [],
    requirements: Array.isArray(event.requirements) ? event.requirements : [],
  }) as EventFormData;
