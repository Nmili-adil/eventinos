import { z } from 'zod';

const socialNetworksSchema = z.object({
  facebook: z.string().url().optional().or(z.literal('')).default(''),
  instagram: z.string().url().optional().or(z.literal('')).default(''),
  linkedin: z.string().url().optional().or(z.literal('')).default(''),
  twitter: z.string().url().optional().or(z.literal('')).default(''),
  website: z.string().url().optional().or(z.literal('')).default(''),
});

const speakerSchema = z.object({
  _id: z.string().optional(),
  fullName: z.string().min(1, "Full name is required"),
  picture: z.string().url().optional().or(z.literal('')).default(''),
  socialNetworks: socialNetworksSchema.default({}),
});

const exhibitorSchema = z.object({
  _id: z.string().optional(),
  fullName: z.string().min(1, "Exhibitor name is required"),
  picture: z.string().url().optional().or(z.literal('')).default(''),
  socialNetworks: socialNetworksSchema.default({}),
});

const sponsorSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Sponsor name is required"),
  logo: z.string().url().optional().or(z.literal('')).default(''),
  socialNetworks: socialNetworksSchema.default({}),
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
  image: z.string().url("Invalid URL").optional().or(z.literal('')).default(''),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
  type: z.enum(["FACETOFACE", "VIRTUEL", "HYBRID"]).default("FACETOFACE"), // Added HYBRID
  isNearestEvent: z.boolean().default(false),
  isUpComingEvent: z.boolean().default(false), // Note: backend uses "isUpComingEvent" (different spelling)
  status: z.enum(["PENDING", "ACCEPTED", "REFUSED", "CLOSED"]).default("PENDING"),
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
  socialNetworks: socialNetworksSchema.default({
    facebook: '',
    instagram: '',
    linkedin: '',
    twitter: '',
    website: '',
  }),
  speakers: z.array(speakerSchema).default([]),
  exhibitors: z.array(exhibitorSchema).default([]),
  sponsors: z.array(sponsorSchema).default([]),
  category: z.string().optional().or(z.literal('')).default(''),
  badges: z.array(z.string()).default([]),
  gallery: z.array(z.string().url().optional().or(z.literal(''))).default([]), // Made URL optional
  program: z.string().default(''),
  requirements: z.array(z.string()).default([]),
  capacity: z.number().min(0).default(0),
  allowRegistration: z.boolean().default(false),
  registrationDeadline: dateTimeSchema.optional().default({ date: '', time: '' }), // Made optional
  tags: z.array(z.string()).default([]),
})
.refine((data) => {
  // Only validate if both dates are provided
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