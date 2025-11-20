import z from "zod"




export const emailStepSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide'),
})

export const otpStepSchema = z.object({
  otp: z
    .string()
    .min(1, 'Le code OTP est requis')
    .length(4, 'Le code OTP doit contenir 4 chiffres')
    .regex(/^\d+$/, 'Le code OTP doit contenir uniquement des chiffres'),
})

export const basicInfoStepSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Le prénom est requis')
    .min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z
    .string()
    .min(1, 'Le nom est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères'),
  phoneNumber: z
    .string()
    .min(1, 'Le numéro de téléphone est requis')
    .regex(/^\d{1,10}$/, 'Numéro de téléphone invalide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    ),
  confirmPassword: z.string().min(1, 'La confirmation du mot de passe est requise'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

export const profileStepSchema = z.object({
  picture: z.instanceof(File).optional(),
  country: z.string().min(1, 'Le pays est requis'),
  city: z.string().min(1, 'La ville est requise'),
  gender: z.enum(['MALE', 'FEMALE'], {
    errorMap: () => ({ message: 'Veuillez sélectionner votre genre' })
  }),
  birthday: z.string().min(1, 'La date de naissance est requise'),
})

// Types
export type EmailStepData = z.infer<typeof emailStepSchema>
export type OtpStepData = z.infer<typeof otpStepSchema>
export type BasicInfoStepData = z.infer<typeof basicInfoStepSchema>
export type ProfileStepData = z.infer<typeof profileStepSchema>