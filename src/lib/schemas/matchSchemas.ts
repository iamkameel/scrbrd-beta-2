import { z } from 'zod';

export const MatchSchema = z.object({
  homeTeamId: z.string().min(1, 'Home team is required'),
  awayTeamId: z.string().min(1, 'Away team is required'),
  matchDate: z.string().min(1, 'Date is required'),
  matchTime: z.string().optional(),
  fieldId: z.string().optional(),
  isDayNight: z.boolean().default(false).optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'postponed', 'live']).default('scheduled'),
  matchType: z.enum(['T20', 'ODI', 'Test', 'T10', 'Other']).default('T20'),
  overs: z.coerce.number().min(1).optional(),
  umpires: z.array(z.string()).optional(),
  scorer: z.string().optional(),
  notes: z.string().optional(),
}).refine(data => data.homeTeamId !== data.awayTeamId, {
  message: "Home and Away teams must be different",
  path: ["awayTeamId"],
});

export type MatchInput = z.infer<typeof MatchSchema>;
