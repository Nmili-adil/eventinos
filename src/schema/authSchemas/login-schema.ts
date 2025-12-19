import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string() 
    .min(1, "Email are required")
    .transform((val) => val.trim().toLowerCase()), 
    
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters long'),
    
  is_backoffice: z.boolean().optional().default(true),
})

export type LoginFormData = z.infer<typeof loginSchema>