import { z } from 'zod';

export const sendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d{6}$/, 'Code must be 6 digits'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(1, 'Full name is required'),
  role: z.enum(['client', 'partner']),
});

export type SendOtpFormData = z.infer<typeof sendOtpSchema>;
export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
