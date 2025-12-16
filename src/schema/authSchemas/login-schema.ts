import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .email('Format d\'email invalide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  is_backoffice: z.boolean().optional().default(true),
})

export type LoginFormData = z.infer<typeof loginSchema>