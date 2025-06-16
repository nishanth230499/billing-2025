import { z } from 'zod'

export const emailSchema = z
  .string()
  .trim()
  .email({ message: 'Invalid email address' })

export const loginPasswordSchema = z
  .string()
  .trim()
  .min(1, { message: 'Password must be at least 8 characters' })
