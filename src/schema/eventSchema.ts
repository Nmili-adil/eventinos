import { z } from 'zod';
import i18n from 'i18next';
import { EVENT_STATUSES } from '@/constants/eventStatuses';

// Messages are resolved at validation time, so they follow the current language.
const required = (key: string) => ({ error: () => i18n.t(key) });

const socialNetworksSchema = z.object({
  facebook: z.string().optional().or(z.literal('')).default(''),
  instagram: z.string().optional().or(z.literal('')).default(''),
  linkedin: z.string().optional().or(z.literal('')).default(''),
  twitter: z.string().optional().or(z.literal('')).default(''),
  website: z.string().optional().or(z.literal('')).default(''),
});

const uploadFieldSchema = z.union([
  z.string().url("Invalid URL"),
  z.literal(''),
  z.custom<File>((value) => typeof File !== 'undefined' && value instanceof File),
]).optional().default('');

const organizerSchema = z.object({
  name: z.string().trim().min(1, required('eventForm.validation.organizerRequired')),
  logo: z.union([
    z.string(),
    z.custom<File>((value) => typeof File !== 'undefined' && value instanceof File),
  ]).optional().default(''),
  website: z.string().optional().default(''),
  email: z.union([z.email(required('eventForm.validation.invalidEmail')), z.literal('')]).optional().default(''),
  phone: z.string().optional().default(''),
});

// A URL once uploaded through the dialog; the API layer also accepts a File.
const requiredImage = (key: string) =>
  z.custom<string>(
    (value) =>
      (typeof value === 'string' && value.trim() !== '') ||
      (typeof File !== 'undefined' && value instanceof File),
    required(key),
  );

export const speakerSchema = z.object({
  _id: z.string().optional(),
  firstName: z.string().trim().min(1, required('eventForm.addSpeakerDialog.validation.firstNameRequired')),
  lastName: z.string().trim().min(1, required('eventForm.addSpeakerDialog.validation.lastNameRequired')),
  fullName: z.string().optional().default(''), // derived, kept for backend compatibility
  picture: requiredImage('eventForm.addSpeakerDialog.validation.pictureRequired'),
  jobTitle: z.string().trim().min(1, required('eventForm.addSpeakerDialog.validation.jobTitleRequired')),
  organization: z.string().trim().min(1, required('eventForm.addSpeakerDialog.validation.organizationRequired')),
  fonction: z.string().optional().or(z.literal('')).default(''), // derived, kept for backend compatibility
  nationality: z.string().optional().or(z.literal('')).default(''),
  socialNetworks: socialNetworksSchema.default(() => ({
    facebook: '',
    instagram: '',
    linkedin: '',
    twitter: '',
    website: '',
  })),
});

const exhibitorSchema = z.object({
  _id: z.string().optional(),
  fullName: z.string().min(1, "Exhibitor name is required"),
  picture: z.string().url().optional().or(z.literal('')).default(''),
  fonction: z.string().optional().or(z.literal('')).default(''),
  nationality: z.string().optional().or(z.literal('')).default(''),
  socialNetworks: socialNetworksSchema.default(() => ({
    facebook: '',
    instagram: '',
    linkedin: '',
    twitter: '',
    website: '',
  })),
});

export const sponsorSchema = z.object({
  _id: z.string().optional(),
  name: z.string().trim().min(1, required('eventForm.addSponsorDialog.validation.required')),
  logo: requiredImage('eventForm.addSponsorDialog.validation.logoRequired'),
  category: z.string().min(1, required('eventForm.addSponsorDialog.validation.categoryRequired')),
  socialNetworks: socialNetworksSchema.default(() => ({
    facebook: '',
    instagram: '',
    linkedin: '',
    twitter: '',
    website: '',
  })),
});

const dateTimeSchema = z.object({
  date: z.string().optional().default(''),
  time: z.string().optional().default(''),
});

const locationSchema = z.object({
  location: z.object({
    lat: z.number().default(0),
    lng: z.number().default(0),
  }).default({ lat: 0, lng: 0 }),
  name: z.string().default(''),
  address: z.string().optional().default(''),
  place_id: z.string().optional().default(''),
  city: z.string().default(''),
  country: z.string().default(''),
  countryCode: z.string().default(''),
});

export const eventFormSchema = z.object({
  createdBy: z.string().optional().default(''),
  name: z.string().min(1, "Event name is required").max(100),
  description: z.string().default(''),
  image: uploadFieldSchema,
  logo: uploadFieldSchema,
  organizer: organizerSchema,
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
  type: z.enum(["FACETOFACE", "VIRTUEL", "HYBRID"]).default("FACETOFACE"), // Added HYBRID
  isNearestEvent: z.boolean().default(false),
  isUpComingEvent: z.boolean().default(false), // Note: backend uses "isUpComingEvent" (different spelling)
  status: z.enum(EVENT_STATUSES).default("PENDING"),
  startDate: dateTimeSchema.default({ date: '', time: '' }),
  endDate: dateTimeSchema.default({ date: '', time: '' }),
  location: locationSchema.default({
    location: { lat: 0, lng: 0 },
    name: '',
    address: '',
    place_id: '',
    city: '',
    country: '',
    countryCode: '',
  }),
  socialNetworks: socialNetworksSchema.default(() => ({
    facebook: '',
    instagram: '',
    linkedin: '',
    twitter: '',
    website: '',
  })),
  speakers: z.array(speakerSchema).default([]),
  exhibitors: z.array(exhibitorSchema).default([]),
  sponsors: z.array(sponsorSchema).default([]),
  category: z.string().min(1, required('eventForm.validation.categoryRequired')),
  badges: z.array(z.string()).default([]),
  gallery: z.array(z.string().url()).default([]),
  program: z.string().default(''),
  requirements: z.array(z.string()).default([]),
  capacity: z.number().min(0).default(0),
  allowRegistration: z.boolean().default(false),
  registrationDeadline: dateTimeSchema.optional().default({ date: '', time: '' }), 
  tags: z.array(z.string()).default([]),
})
.refine((data) => {
  if (data.startDate.date && data.endDate.date) {
    const startDate = new Date(data.startDate.date);
    const endDate = new Date(data.endDate.date);
    return endDate >= startDate;
  }
  return true;
}, {
  message: "End date must be equal to or after start date",
  path: ["endDate.date"],
});

export type EventFormData = z.infer<typeof eventFormSchema>;
