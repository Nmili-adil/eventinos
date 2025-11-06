import { z } from 'zod';

const socialNetworksSchema = z.object({
  facebook: z.string().url().optional().or(z.literal('')),
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
  socialNetworks: socialNetworksSchema.omit({ facebook: true, twitter: true }),
});

const sponsorSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Sponsor name is required"),
  logo: z.string().url().optional().or(z.literal('')),
  socialNetworks: socialNetworksSchema.pick({ website: true }),
});

const dateTimeSchema = z.object({
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
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
  name: z.string().min(1, "Event name is required").max(100),
  description: z.string().min(1, "Description is required").max(1000),
  image: z.string().url("Invalid URL").optional().or(z.literal('')),
  visibility: z.enum(["PUBLIC", "PRIVATE"]),
  type: z.enum(["FACETOFACE", "ONLINE", "HYBRID"]),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "CLOSED"]),
  startDate: dateTimeSchema,
  endDate: dateTimeSchema,
  location: locationSchema,
  socialNetworks: socialNetworksSchema,
  speakers: z.array(speakerSchema),
  exhibitors: z.array(exhibitorSchema),
  sponsors: z.array(sponsorSchema),
  gallery: z.array(z.string().url()).default([]),
  program: z.string().min(1, "Program is required"),
  tags: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
});

export type EventFormData = z.infer<typeof eventFormSchema>;