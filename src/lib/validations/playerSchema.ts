import { z } from 'zod';

// Player validation schema
// FM-Style Attribute Schemas
const battingAttributesSchema = z.object({
  frontFoot: z.coerce.number().min(1).max(20).default(10),
  backFoot: z.coerce.number().min(1).max(20).default(10),
  powerHitting: z.coerce.number().min(1).max(20).default(10),
  timing: z.coerce.number().min(1).max(20).default(10),
  shotRange: z.coerce.number().min(1).max(20).default(10),
  sweep: z.coerce.number().min(1).max(20).default(10),
  reverseSweep: z.coerce.number().min(1).max(20).default(10),
  spinReading: z.coerce.number().min(1).max(20).default(10),
  seamAdaptation: z.coerce.number().min(1).max(20).default(10),
  strikeRotation: z.coerce.number().min(1).max(20).default(10),
  finishing: z.coerce.number().min(1).max(20).default(10),
});

const bowlingAttributesSchema = z.object({
  stockBallControl: z.coerce.number().min(1).max(20).default(10),
  variations: z.coerce.number().min(1).max(20).default(10),
  powerplaySkill: z.coerce.number().min(1).max(20).default(10),
  middleOversControl: z.coerce.number().min(1).max(20).default(10),
  deathOversSkill: z.coerce.number().min(1).max(20).default(10),
  lineLengthConsistency: z.coerce.number().min(1).max(20).default(10),
  spinManipulation: z.coerce.number().min(1).max(20).default(10),
  releaseMechanics: z.coerce.number().min(1).max(20).default(10),
  tacticalOverConstruction: z.coerce.number().min(1).max(20).default(10),
});

const fieldingAttributesSchema = z.object({
  closeCatching: z.coerce.number().min(1).max(20).default(10),
  deepCatching: z.coerce.number().min(1).max(20).default(10),
  groundFielding: z.coerce.number().min(1).max(20).default(10),
  throwingPower: z.coerce.number().min(1).max(20).default(10),
  throwingAccuracy: z.coerce.number().min(1).max(20).default(10),
  reactionSpeed: z.coerce.number().min(1).max(20).default(10),
  anticipation: z.coerce.number().min(1).max(20).default(10),
});

const mentalAttributesSchema = z.object({
  temperament: z.coerce.number().min(1).max(20).default(10),
  gameAwareness: z.coerce.number().min(1).max(20).default(10),
  pressureHandling: z.coerce.number().min(1).max(20).default(10),
  patience: z.coerce.number().min(1).max(20).default(10),
  killerInstinct: z.coerce.number().min(1).max(20).default(10),
  decisionMaking: z.coerce.number().min(1).max(20).default(10),
  adaptability: z.coerce.number().min(1).max(20).default(10),
  workEthic: z.coerce.number().min(1).max(20).default(10),
  leadership: z.coerce.number().min(1).max(20).default(10),
  competitiveness: z.coerce.number().min(1).max(20).default(10),
});

const physicalAttributesSchema = z.object({
  speed: z.coerce.number().min(1).max(20).default(10),
  acceleration: z.coerce.number().min(1).max(20).default(10),
  agility: z.coerce.number().min(1).max(20).default(10),
  strength: z.coerce.number().min(1).max(20).default(10),
  stamina: z.coerce.number().min(1).max(20).default(10),
  balance: z.coerce.number().min(1).max(20).default(10),
  coreFitness: z.coerce.number().min(1).max(20).default(10),
  injuryResistance: z.coerce.number().min(1).max(20).default(10),
});

const playerTraitSchema = z.object({
  traitId: z.string(),
  name: z.string(),
});

const roleRatingSchema = z.object({
  roleRatingId: z.string(),
  roleCode: z.string(),
  rating: z.coerce.number(),
});

const seasonStatsSchema = z.object({
  seasonStatsId: z.string(),
  seasonId: z.string(),
  teamId: z.string(),
  format: z.string(),
  matches: z.coerce.number(),
  runs: z.coerce.number(),
  battingAverage: z.coerce.number(),
  strikeRate: z.coerce.number(),
  wickets: z.coerce.number(),
  economy: z.coerce.number(),
  catches: z.coerce.number(),
  momAwards: z.coerce.number(),
});

const zoneAnalysisSchema = z.object({
  zoneId: z.string(),
  type: z.enum(['strength', 'weakness']),
  zoneLabel: z.string(),
  description: z.string(),
});

const achievementSchema = z.object({
  achievementId: z.string(),
  title: z.string(),
  description: z.string(),
  achievedOn: z.string(),
});

const coachReportSchema = z.object({
  reportId: z.string(),
  summary: z.string(),
  pros: z.string(),
  cons: z.string(),
  createdAt: z.string(),
  coachId: z.string(),
});

export const playerSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),

  lastName: z.string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),

  dateOfBirth: z.string()
    .min(1, 'Date of birth is required'),

  email: z.string().email().optional().or(z.literal('')),
  phoneNumber: z.string().optional().or(z.literal('')),

  schoolId: z.string().min(1, 'School is required'),
  jerseyNumber: z.string().optional(),
  status: z.string().default('active'),
  role: z.string().default('Player'),

  // Core Profile
  primaryRole: z.string().default('Unknown'),
  battingStyle: z.string().default('Right-hand Bat'),
  bowlingStyle: z.string().default('Right-arm Medium'),

  // Nested Attributes
  battingAttributes: battingAttributesSchema.optional(),
  bowlingAttributes: bowlingAttributesSchema.optional(),
  fieldingAttributes: fieldingAttributesSchema.optional(),
  mentalAttributes: mentalAttributesSchema.optional(),
  physicalAttributes: physicalAttributesSchema.optional(),

  // Legacy fields (optional)
  heightCm: z.string().optional(),
  weightKg: z.string().optional(),

  // New Collections
  playerTraits: z.array(playerTraitSchema).optional(),
  roleRatings: z.array(roleRatingSchema).optional(),
  zoneAnalysis: z.array(zoneAnalysisSchema).optional(),
  coachReports: z.array(coachReportSchema).optional(),
  achievements: z.array(achievementSchema).optional(),
  seasonStats: z.array(seasonStatsSchema).optional(),
});

export type PlayerFormData = z.infer<typeof playerSchema>;


