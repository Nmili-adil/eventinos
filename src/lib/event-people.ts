import type { TFunction } from "i18next";
import { normalizeCategoryId } from "./events-utils";

const ROLE_SEPARATOR = " — ";

export const getSpeakerName = (speaker: any): string =>
  [speaker?.firstName, speaker?.lastName].filter(Boolean).join(" ") || speaker?.fullName || "";

export const getSpeakerRole = (speaker: any): string =>
  [speaker?.jobTitle, speaker?.organization].filter(Boolean).join(ROLE_SEPARATOR) ||
  speaker?.fonction ||
  "";

// Older speakers only have fullName and fonction. Fill the new fields as well
// as those allow; whatever cannot be guessed is left for the user to complete.
export const expandLegacySpeaker = (speaker: any) => {
  const nameParts = (speaker?.fullName || "").trim().split(/\s+/).filter(Boolean);
  const [job, organization] = (speaker?.fonction || "").split(ROLE_SEPARATOR);
  return {
    firstName: speaker?.firstName || nameParts[0] || "",
    lastName: speaker?.lastName || nameParts.slice(1).join(" "),
    jobTitle: speaker?.jobTitle || job?.trim() || "",
    organization: speaker?.organization || organization?.trim() || "",
  };
};

export const isSpeakerComplete = (speaker: any): boolean =>
  Boolean(
    speaker?.firstName &&
      speaker?.lastName &&
      speaker?.jobTitle &&
      speaker?.organization &&
      speaker?.picture
  );

export const isSponsorComplete = (sponsor: any): boolean =>
  Boolean(sponsor?.name && sponsor?.logo && normalizeCategoryId(sponsor?.category));

// The fields kept on a speaker. fullName and fonction are derived, and are still
// sent for clients and backend versions that only know those two.
export const toSpeakerValues = (person: any) => ({
  _id: person._id,
  firstName: person.firstName,
  lastName: person.lastName,
  fullName: getSpeakerName(person),
  jobTitle: person.jobTitle,
  organization: person.organization,
  fonction: getSpeakerRole(person),
  picture: person.picture,
  nationality: person.nationality,
  socialNetworks: person.socialNetworks,
});

export const getPartnerTypeLabel = (t: TFunction, type: any): string =>
  type?.key
    ? t(`sponsorCategories.defaults.${type.key}`, { defaultValue: type.name })
    : type?.name || "";

// `category` may be populated or a plain id, so types are also looked up in `types`.
export const groupPartnersByType = (t: TFunction, partners: any[], types: any[] = []) => {
  const groups = new Map<string, { id: string; label: string; partners: any[] }>();

  partners.forEach((partner) => {
    const id = normalizeCategoryId(partner?.category);
    const type =
      types.find((candidate) => candidate._id === id) ||
      (typeof partner?.category === "object" ? partner.category : null);

    if (!groups.has(id)) {
      groups.set(id, {
        id,
        label: getPartnerTypeLabel(t, type) || t("eventForm.labels.otherPartners"),
        partners: [],
      });
    }
    groups.get(id)!.partners.push(partner);
  });

  return Array.from(groups.values());
};
