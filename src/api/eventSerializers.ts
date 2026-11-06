// FormData serialization shared by event create (eventsApi) and per-tab update
// (eventUpdateApi). Keys use the dot notation expected by the backend's
// convertDotNotationToNested parser, e.g. `speakers.0.fullName`.
import { normalizeCategoryId } from "@/lib/events-utils";

export const isFileValue = (value: unknown): value is File =>
  typeof File !== "undefined" && value instanceof File;

const appendIfPresent = (formData: FormData, key: string, value: unknown) => {
  if (value !== undefined && value !== null && value !== "") {
    formData.append(key, value as string | Blob);
  }
};

const appendSocialNetworks = (
  formData: FormData,
  prefix: string,
  socialNetworks: Record<string, unknown> | undefined,
) => {
  if (!socialNetworks) return;
  Object.keys(socialNetworks).forEach((key) => {
    appendIfPresent(formData, `${prefix}.socialNetworks.${key}`, socialNetworks[key]);
  });
};

export const appendSpeakers = (formData: FormData, speakers: any[]) => {
  speakers.forEach((speaker, index) => {
    const prefix = `speakers.${index}`;
    appendIfPresent(formData, `${prefix}._id`, speaker._id);
    appendIfPresent(formData, `${prefix}.firstName`, speaker.firstName);
    appendIfPresent(formData, `${prefix}.lastName`, speaker.lastName);
    appendIfPresent(formData, `${prefix}.fullName`, speaker.fullName);
    appendIfPresent(formData, `${prefix}.jobTitle`, speaker.jobTitle);
    appendIfPresent(formData, `${prefix}.organization`, speaker.organization);
    appendIfPresent(formData, `${prefix}.fonction`, speaker.fonction);
    appendIfPresent(formData, `${prefix}.nationality`, speaker.nationality);
    appendIfPresent(formData, `${prefix}.picture`, speaker.picture);
    appendSocialNetworks(formData, prefix, speaker.socialNetworks);
  });
};

export const appendExhibitors = (formData: FormData, exhibitors: any[]) => {
  exhibitors.forEach((exhibitor, index) => {
    const prefix = `exhibitors.${index}`;
    appendIfPresent(formData, `${prefix}._id`, exhibitor._id);
    appendIfPresent(formData, `${prefix}.fullName`, exhibitor.fullName);
    appendIfPresent(formData, `${prefix}.fonction`, exhibitor.fonction);
    appendIfPresent(formData, `${prefix}.nationality`, exhibitor.nationality);
    appendIfPresent(formData, `${prefix}.picture`, exhibitor.picture);
    appendSocialNetworks(formData, prefix, exhibitor.socialNetworks);
  });
};

export const appendSponsors = (formData: FormData, sponsors: any[]) => {
  sponsors.forEach((sponsor, index) => {
    const prefix = `sponsors.${index}`;
    appendIfPresent(formData, `${prefix}._id`, sponsor._id);
    appendIfPresent(formData, `${prefix}.name`, sponsor.name);
    appendIfPresent(formData, `${prefix}.category`, normalizeCategoryId(sponsor.category));
    appendIfPresent(formData, `${prefix}.logo`, sponsor.logo);
    appendSocialNetworks(formData, prefix, sponsor.socialNetworks);
  });
};

export const appendOrganizer = (formData: FormData, organizer: any) => {
  ["name", "logo", "website", "email", "phone"].forEach((field) => {
    appendIfPresent(formData, `organizer.${field}`, organizer?.[field]);
  });
};
