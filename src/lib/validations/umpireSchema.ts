import { z } from 'zod';

export const umpireDecisionAttributesSchema = z.object({
    lbwJudgement: z.coerce.number().min(1).max(20).default(10),
    caughtBehindAccuracy: z.coerce.number().min(1).max(20).default(10),
    runOutPositioning: z.coerce.number().min(1).max(20).default(10),
    boundaryCalls: z.coerce.number().min(1).max(20).default(10),
    drsAccuracy: z.coerce.number().min(1).max(20).default(10),
    consistency: z.coerce.number().min(1).max(20).default(10),
});

export const umpireMatchControlAttributesSchema = z.object({
    playerManagement: z.coerce.number().min(1).max(20).default(10),
    conflictResolution: z.coerce.number().min(1).max(20).default(10),
    timeManagement: z.coerce.number().min(1).max(20).default(10),
    lawApplication: z.coerce.number().min(1).max(20).default(10),
    communication: z.coerce.number().min(1).max(20).default(10),
    pressureHandling: z.coerce.number().min(1).max(20).default(10),
});

export const umpirePhysicalAttributesSchema = z.object({
    fitness: z.coerce.number().min(1).max(20).default(10),
    endurance: z.coerce.number().min(1).max(20).default(10),
    positioningAgility: z.coerce.number().min(1).max(20).default(10),
    concentration: z.coerce.number().min(1).max(20).default(10),
    vision: z.coerce.number().min(1).max(20).default(10),
});

export const umpireSchema = z.object({
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

    // Umpire Profile Core
    certificationLevel: z.string().default('Level 1'),
    homeAssociation: z.string().default(''),
    yearsActive: z.coerce.number().min(0).default(0),
    preferredFormats: z.array(z.string()).optional(),

    // Attribute Blocks
    decisionAttributes: umpireDecisionAttributesSchema.optional(),
    matchControlAttributes: umpireMatchControlAttributesSchema.optional(),
    physicalAttributes: umpirePhysicalAttributesSchema.optional(),

    // Tags
    umpireTraits: z.array(z.string()).optional(),
});

export type UmpireFormData = z.infer<typeof umpireSchema>;
