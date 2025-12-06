import { z } from 'zod';

export const PlayerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  role: z.string().default('Player'),
  status: z.enum(['active', 'injured', 'inactive']).default('active'),
  schoolId: z.string().optional(),
  teamIds: z.array(z.string()).optional(),
  skills: z.object({
    batting: z.coerce.number().min(0).max(100).optional(),
    bowling: z.coerce.number().min(0).max(100).optional(),
    fielding: z.coerce.number().min(0).max(100).optional(),
    leadership: z.coerce.number().min(0).max(100).optional(),
    experience: z.coerce.number().min(0).max(100).optional(),
  }).optional(),
  attributes: z.object({
    battingStyle: z.enum(['Right Hand', 'Left Hand']).optional(),
    bowlingStyle: z.string().optional(),
    fieldingPosition: z.string().optional(),
  }).optional(),
});

export type PlayerInput = z.infer<typeof PlayerSchema>;
