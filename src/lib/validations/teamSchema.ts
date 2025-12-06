import { z } from 'zod';

// Team validation schema
export const teamSchema = z.object({
  name: z.string()
    .min(1, 'Team name is required')
    .min(2, 'Team name must be at least 2 characters')
    .max(100, 'Team name must be less than 100 characters'),
  
  schoolId: z.string()
    .min(1, 'School is required'),
  
  divisionId: z.string()
    .optional(),
  
  suffix: z.string()
    .max(20, 'Suffix must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  
  abbreviatedName: z.string()
    .max(10, 'Abbreviation must be 10 characters or less')
    .optional()
    .or(z.literal('')),
  
  nickname: z.string()
    .max(50, 'Nickname must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  
  coachIds: z.string()
    .optional()
    .or(z.literal('')),
  
  captainId: z.string()
    .optional(),
  
  viceCaptainId: z.string()
    .optional(),
});

export type TeamFormData = z.infer<typeof teamSchema>;
