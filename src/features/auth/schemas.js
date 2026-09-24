import { z } from 'zod'

// Mirrors backend validators/common.js so users get the same rules before submitting.
export const passwordRule = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/\d/, 'Password must contain a number')

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Enter your email or roll number'),
  password: z.string().min(1, 'Enter your password'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, 'Enter your email').email('Enter a valid email address'),
})

export const resetPasswordSchema = z
  .object({
    password: passwordRule,
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
