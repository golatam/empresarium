import { z } from 'zod';

export const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  bio: z.string().optional(),
  preferredLocale: z.enum(['en', 'es', 'pt', 'ru']),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
