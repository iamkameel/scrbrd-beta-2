import { z } from 'zod';

export const TeamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters'),
  abbreviatedName: z.string().optional(),
  nickname: z.string().optional(),
  schoolId: z.string().min(1, 'School is required'),
  divisionId: z.string().optional(),
  suffix: z.string().optional(),
  defaultCaptainId: z.string().optional(),
  defaultViceCaptainId: z.string().optional(),
  coachIds: z.array(z.string()).optional(),
  defaultScorerId: z.string().optional(),
});

export type TeamInput = z.infer<typeof TeamSchema>;
