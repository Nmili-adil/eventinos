import z from "zod";

export const contactFormSchema = z.object({
  firstName: z
    .string()
    .min(1, "validation.firstName.required")
    .min(2, "validation.firstName.min")
    .max(50, "validation.firstName.max")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "validation.firstName.invalid"),
  lastName: z
    .string()
    .min(1, "validation.lastName.required")
    .min(2, "validation.lastName.min")
    .max(50, "validation.lastName.max")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "validation.lastName.invalid"),
  email: z
    .string()
    .min(1, "validation.email.required")
    .email("validation.email.invalid")
    .max(100, "validation.email.max"),
  phone: z
    .string()
    .max(20, "validation.phone.max")
    .regex(/^[+]?[\d\s()-]*$/, "validation.phone.invalid")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .min(1, "validation.message.required")
    .min(10, "validation.message.min")
    .max(2000, "validation.message.max"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
