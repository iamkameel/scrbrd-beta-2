import { z } from 'zod';

export const TeamSchema = z.object({
  name: z.string()
    .min(1, 'Team name is required')
    .min(2, 'Team name must be at least 2 characters')
    .max(100, 'Team name must be less than 100 characters'),

  abbreviatedName: z.string()
    .max(10, 'Abbreviation must be 10 characters or less')
    .optional()
    .or(z.literal('')),

  nickname: z.string()
    .max(50, 'Nickname must be less than 50 characters')
    .optional()
    .or(z.literal('')),

  schoolId: z.string().min(1, 'School is required'),

  divisionId: z.string().optional().or(z.literal('')),

  suffix: z.string()
    .max(20, 'Suffix must be less than 20 characters')
    .optional()
    .or(z.literal('')),

  defaultCaptainId: z.string().optional().or(z.literal('')),
  defaultViceCaptainId: z.string().optional().or(z.literal('')),

  coachIds: z.array(z.string()).optional(),

  defaultScorerId: z.string().optional().or(z.literal('')),
});

export type TeamInput = z.infer<typeof TeamSchema>;
