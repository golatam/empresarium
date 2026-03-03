import { z } from 'zod';

export const companyDetailsSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  companyActivity: z.string().optional(),
  companyAddress: z.string().optional(),
});

export const founderSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  dateOfBirth: z.string().optional(),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  taxId: z.string().optional(),
  ownershipPercentage: z.number().min(0).max(100),
  isDirector: z.boolean().default(false),
  extraData: z.record(z.string(), z.unknown()).default({}),
});

export const addonsSchema = z.object({
  nomineeDirector: z.boolean().default(false),
  nomineeShareholder: z.boolean().default(false),
  accounting: z.boolean().default(false),
  bookkeeping: z.boolean().default(false),
});

export type CompanyDetailsFormData = z.infer<typeof companyDetailsSchema>;
export type FounderFormData = z.infer<typeof founderSchema>;
export type AddonsFormData = z.infer<typeof addonsSchema>;
