import { z } from 'zod'

// ... existing schemas ...

// Forgot Password schemas
export const forgotPasswordEmailSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide'),
})

export const forgotPasswordOtpSchema = z.object({
  otp: z
    .string()
    .min(1, 'Le code de réinitialisation est requis')
    .length(4, 'Le code doit contenir 4 chiffres')
    .regex(/^[A-Za-z0-9]+$/, 'Le code doit contenir uniquement des chiffres'),
})

export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(1, 'Le nouveau mot de passe est requis')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    ),
  confirmPassword: z.string().min(1, 'La confirmation du mot de passe est requise'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

// Forgot Password types
export type ForgotPasswordEmailData = z.infer<typeof forgotPasswordEmailSchema>
export type ForgotPasswordOtpData = z.infer<typeof forgotPasswordOtpSchema>
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>