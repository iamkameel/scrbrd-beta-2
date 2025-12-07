import { z } from 'zod';

export const scorerTechnicalAttributesSchema = z.object({
    softwareProficiency: z.coerce.number().min(1).max(20).default(10),
    lawKnowledge: z.coerce.number().min(1).max(20).default(10),
    linearScoring: z.coerce.number().min(1).max(20).default(10),
    digitalScoring: z.coerce.number().min(1).max(20).default(10),
    problemSolving: z.coerce.number().min(1).max(20).default(10),
});

export const scorerProfessionalAttributesSchema = z.object({
    concentration: z.coerce.number().min(1).max(20).default(10),
    speed: z.coerce.number().min(1).max(20).default(10),
    accuracy: z.coerce.number().min(1).max(20).default(10),
    communication: z.coerce.number().min(1).max(20).default(10),
    punctuality: z.coerce.number().min(1).max(20).default(10),
    collaboration: z.coerce.number().min(1).max(20).default(10),
});

export const scorerSchema = z.object({
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

    // Scorer Profile Core
    certificationLevel: z.string().default('Level 1'),
    preferredMethod: z.enum(['Digital', 'Linear (Paper)', 'Hybrid']).default('Digital'),
    experienceYears: z.coerce.number().min(0).default(0),

    // Attribute Blocks
    technicalAttributes: scorerTechnicalAttributesSchema.optional(),
    professionalAttributes: scorerProfessionalAttributesSchema.optional(),

    // Tags
    scorerTraits: z.array(z.string()).optional(),
});

export type ScorerFormData = z.infer<typeof scorerSchema>;
