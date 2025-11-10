import { z } from 'zod';

const socialNetworksSchema = z.object({
  facebook: z.string().url().optional().or(z.literal('')),
  instagram: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  twitter: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
});

const speakerSchema = z.object({
  _id: z.string().optional(),
  fullName: z.string().min(1, "Full name is required"),
  picture: z.string().url().optional().or(z.literal('')),
  socialNetworks: socialNetworksSchema,
});

const exhibitorSchema = z.object({
  _id: z.string().optional(),
  fullName: z.string().min(1, "Exhibitor name is required"),
  picture: z.string().url().optional().or(z.literal('')),
  socialNetworks: socialNetworksSchema,
});

const sponsorSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Sponsor name is required"),
  logo: z.string().url().optional().or(z.literal('')),
  socialNetworks: socialNetworksSchema,
});

const dateTimeSchema = z.object({
  date: z.string().min(1, "Date is required"),
  time: z.string().optional(),
});

const locationSchema = z.object({
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  name: z.string().min(1, "Location name is required"),
  place_id: z.string(),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  countryCode: z.string().min(2, "Country code is required"),
});

export const eventFormSchema = z.object({
  createdBy:z.string().optional(),
  name: z.string().min(1, "Event name is required").max(100),
  description: z.string().optional().or(z.literal('')),
  image: z.string().url("Invalid URL").optional().or(z.literal('')),
  visibility: z.enum(["PUBLIC", "PRIVATE"]),
  type: z.enum(["FACETOFACE", "VIRTUEL"]),
  isNearestEvent: z.boolean().default(false),
  isUpCommingEvent: z.boolean().default(false),
  status: z.enum(["PENDING", "ACCEPTED", "REFUSED", "CLOSED"]).default("PENDING"),
  startDate: dateTimeSchema,
  endDate: dateTimeSchema,
  location: locationSchema,
  socialNetworks: socialNetworksSchema,
  speakers: z.array(speakerSchema),
  exhibitors: z.array(exhibitorSchema),
  sponsors: z.array(sponsorSchema),
  categories: z.string().optional().or(z.literal('')),
  badges: z.array(z.string()).default([]),
  gallery: z.array(z.string().url()).default([]),
  program: z.string().optional().or(z.literal('')),
  requirements: z.array(z.string()).default([]),
  capacity: z.number().optional().default(0),
  allowRegistration: z.boolean().default(false),
  registrationDeadline: dateTimeSchema,
  tags: z.array(z.string()).default([]),
}).refine((data) => {
  // Validate that end date is after start date
  if (data.startDate.date && data.endDate.date) {
    const startDate = new Date(data.startDate.date);
    const endDate = new Date(data.endDate.date);
    return endDate >= startDate;
  }
  return true;
}, {
  message: "End date must be equal to or after start date",
  path: ["endDate", "date"],
});

export type EventFormData = z.infer<typeof eventFormSchema>;