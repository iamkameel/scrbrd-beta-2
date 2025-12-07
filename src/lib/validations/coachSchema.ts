import { z } from 'zod';

// Coach Attribute Schemas
const coachingAttributesSchema = z.object({
    battingCoaching: z.coerce.number().min(1).max(20).default(10),
    fastBowlingCoaching: z.coerce.number().min(1).max(20).default(10),
    spinBowlingCoaching: z.coerce.number().min(1).max(20).default(10),
    fieldingCoaching: z.coerce.number().min(1).max(20).default(10),
    wicketkeepingCoaching: z.coerce.number().min(1).max(20).default(10),
    youthDevelopment: z.coerce.number().min(1).max(20).default(10),
    seniorDevelopment: z.coerce.number().min(1).max(20).default(10),
    oneToOneCoaching: z.coerce.number().min(1).max(20).default(10),
    sessionPlanning: z.coerce.number().min(1).max(20).default(10),
    videoAnalysisUse: z.coerce.number().min(1).max(20).default(10),
});

const tacticalAttributesSchema = z.object({
    tacticsLimitedOvers: z.coerce.number().min(1).max(20).default(10),
    tacticsLongFormat: z.coerce.number().min(1).max(20).default(10),
    fieldSetting: z.coerce.number().min(1).max(20).default(10),
    bowlingChanges: z.coerce.number().min(1).max(20).default(10),
    battingOrderConstruction: z.coerce.number().min(1).max(20).default(10),
    inGameAdaptability: z.coerce.number().min(1).max(20).default(10),
    analyticsUse: z.coerce.number().min(1).max(20).default(10),
    oppositionAnalysis: z.coerce.number().min(1).max(20).default(10),
});

const manManagementAttributesSchema = z.object({
    playerCommunication: z.coerce.number().min(1).max(20).default(10),
    parentCommunication: z.coerce.number().min(1).max(20).default(10),
    motivation: z.coerce.number().min(1).max(20).default(10),
    conflictManagement: z.coerce.number().min(1).max(20).default(10),
    disciplineStandards: z.coerce.number().min(1).max(20).default(10),
    leadershipPresence: z.coerce.number().min(1).max(20).default(10),
    playerWelfare: z.coerce.number().min(1).max(20).default(10),
    feedbackQuality: z.coerce.number().min(1).max(20).default(10),
});

const professionalAttributesSchema = z.object({
    organisation: z.coerce.number().min(1).max(20).default(10),
    attentionToDetail: z.coerce.number().min(1).max(20).default(10),
    opennessToNewMethods: z.coerce.number().min(1).max(20).default(10),
    consistency: z.coerce.number().min(1).max(20).default(10),
    workEthic: z.coerce.number().min(1).max(20).default(10),
    pressureComposure: z.coerce.number().min(1).max(20).default(10),
    longTermPlanning: z.coerce.number().min(1).max(20).default(10),
});

const coachSeasonStatsSchema = z.object({
    seasonId: z.string(),
    teamId: z.string(),
    matches: z.coerce.number(),
    wins: z.coerce.number(),
    losses: z.coerce.number(),
    noResults: z.coerce.number(),
    titlesWon: z.coerce.number(),
    finalsReached: z.coerce.number(),
    avgMarginRuns: z.coerce.number(),
    avgMarginWickets: z.coerce.number(),
    chaseSuccessRate: z.coerce.number(),
});

export const coachSchema = z.object({
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
    assignedSchools: z.array(z.string()).optional(),
    teamIds: z.array(z.string()).optional(),
    status: z.string().default('active'),
    role: z.string().default('Coach'),

    // Coach Profile Core
    currentRole: z.string().default(''),
    qualificationLevel: z.string().default(''),
    coachingSince: z.coerce.number().optional(),
    primaryTeams: z.array(z.string()).optional(),
    preferredFormats: z.array(z.string()).optional(),
    philosophySummary: z.string().optional(),
    currentAbility: z.coerce.number().min(1).max(20).default(10),
    potentialAbility: z.coerce.number().min(1).max(20).default(10),
    reputation: z.coerce.number().min(1).max(5).default(1),

    // Attribute Blocks
    coachingAttributes: coachingAttributesSchema.optional(),
    tacticalAttributes: tacticalAttributesSchema.optional(),
    manManagementAttributes: manManagementAttributesSchema.optional(),
    professionalAttributes: professionalAttributesSchema.optional(),

    // Tags & Stats
    coachTraits: z.array(z.string()).optional(),
    coachSeasonStats: z.array(coachSeasonStatsSchema).optional(),
});

export type CoachFormData = z.infer<typeof coachSchema>;
