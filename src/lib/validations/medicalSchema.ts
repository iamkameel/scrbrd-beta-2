import { z } from 'zod';

export const medicalClinicalAttributesSchema = z.object({
    diagnosisAccuracy: z.coerce.number().min(1).max(20).default(10),
    tapingStrapping: z.coerce.number().min(1).max(20).default(10),
    emergencyResponse: z.coerce.number().min(1).max(20).default(10),
    massageTherapy: z.coerce.number().min(1).max(20).default(10),
    injuryPrevention: z.coerce.number().min(1).max(20).default(10),
});

export const medicalRehabAttributesSchema = z.object({
    returnToPlayPlanning: z.coerce.number().min(1).max(20).default(10),
    strengthConditioning: z.coerce.number().min(1).max(20).default(10),
    loadManagement: z.coerce.number().min(1).max(20).default(10),
    rehabProgramDesign: z.coerce.number().min(1).max(20).default(10),
    psychologicalSupport: z.coerce.number().min(1).max(20).default(10),
});

export const medicalSchema = z.object({
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

    // Medical Profile Core
    qualification: z.string().default(''),
    registrationNumber: z.string().default(''),
    experienceYears: z.coerce.number().min(0).default(0),

    // Attribute Blocks
    clinicalAttributes: medicalClinicalAttributesSchema.optional(),
    rehabAttributes: medicalRehabAttributesSchema.optional(),

    // Tags
    specializations: z.array(z.string()).optional(),
    medicalTraits: z.array(z.string()).optional(),
});

export type MedicalFormData = z.infer<typeof medicalSchema>;
