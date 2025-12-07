import { z } from 'zod';

export const groundskeeperPitchAttributesSchema = z.object({
    paceGeneration: z.coerce.number().min(1).max(20).default(10),
    spinPromotion: z.coerce.number().min(1).max(20).default(10),
    durability: z.coerce.number().min(1).max(20).default(10),
    evenness: z.coerce.number().min(1).max(20).default(10),
    moistureControl: z.coerce.number().min(1).max(20).default(10),
});

export const groundskeeperOutfieldAttributesSchema = z.object({
    drainageManagement: z.coerce.number().min(1).max(20).default(10),
    grassHealth: z.coerce.number().min(1).max(20).default(10),
    boundaryMarking: z.coerce.number().min(1).max(20).default(10),
    rollering: z.coerce.number().min(1).max(20).default(10),
    mowing: z.coerce.number().min(1).max(20).default(10),
});

export const groundskeeperSchema = z.object({
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

    // Groundskeeper Profile Core
    experienceYears: z.coerce.number().min(0).default(0),

    // Attribute Blocks
    pitchAttributes: groundskeeperPitchAttributesSchema.optional(),
    outfieldAttributes: groundskeeperOutfieldAttributesSchema.optional(),

    // Tags
    machineryLicenses: z.array(z.string()).optional(),
    primaryVenues: z.array(z.string()).optional(),
    groundskeeperTraits: z.array(z.string()).optional(),
});

export type GroundskeeperFormData = z.infer<typeof groundskeeperSchema>;
