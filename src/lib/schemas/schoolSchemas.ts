import { z } from 'zod';

export const SchoolSchema = z.object({
  name: z.string().min(1, 'School name is required'),
  abbreviation: z.string().optional(),
  motto: z.string().optional(),
  establishmentYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  contactEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  contactName: z.string().optional(),
  principal: z.string().optional(),
  logoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  divisionId: z.string().optional(),
  provinceId: z.string().optional(),
  brandColors: z.object({
    primary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').optional(),
    secondary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').optional(),
  }).optional(),
});

export type SchoolInput = z.infer<typeof SchoolSchema>;
