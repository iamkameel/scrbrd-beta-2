'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { medicalSchema } from '@/lib/validations/medicalSchema';
import { Person } from '@/types/firestore';
import { USER_ROLES } from '@/lib/roles';

export interface MedicalActionState {
    errors?: {
        [key: string]: string[];
    };
    message?: string;
    success?: boolean;
}

function extractMedicalData(formData: FormData) {
    // Parse nested attributes
    const clinicalAttributes = {
        diagnosisAccuracy: Number(formData.get('clinicalAttributes.diagnosisAccuracy')),
        tapingStrapping: Number(formData.get('clinicalAttributes.tapingStrapping')),
        emergencyResponse: Number(formData.get('clinicalAttributes.emergencyResponse')),
        massageTherapy: Number(formData.get('clinicalAttributes.massageTherapy')),
        injuryPrevention: Number(formData.get('clinicalAttributes.injuryPrevention')),
    };

    const rehabAttributes = {
        returnToPlayPlanning: Number(formData.get('rehabAttributes.returnToPlayPlanning')),
        strengthConditioning: Number(formData.get('rehabAttributes.strengthConditioning')),
        loadManagement: Number(formData.get('rehabAttributes.loadManagement')),
        rehabProgramDesign: Number(formData.get('rehabAttributes.rehabProgramDesign')),
        psychologicalSupport: Number(formData.get('rehabAttributes.psychologicalSupport')),
    };

    return {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        dateOfBirth: formData.get('dateOfBirth'),
        email: formData.get('email'),
        phoneNumber: formData.get('phoneNumber'),

        // Medical Profile Core
        qualification: formData.get('qualification') || '',
        registrationNumber: formData.get('registrationNumber') || '',
        experienceYears: formData.get('experienceYears') ? Number(formData.get('experienceYears')) : 0,

        // Attribute Blocks
        clinicalAttributes,
        rehabAttributes,

        // Tags
        specializations: formData.get('specializations') ? JSON.parse(formData.get('specializations') as string) : [],
        medicalTraits: formData.get('medicalTraits') ? JSON.parse(formData.get('medicalTraits') as string) : [],
    };
}

function mapToFirestoreMedical(validatedData: any): Omit<Person, 'id' | 'createdAt' | 'updatedAt'> {
    const {
        clinicalAttributes,
        rehabAttributes,
        qualification,
        registrationNumber,
        experienceYears,
        specializations,
        medicalTraits,
        ...rest
    } = validatedData;

    return {
        ...rest,
        // Default to Physiotherapist for now, or use the existing role if updating
        role: validatedData.role || USER_ROLES.PHYSIOTHERAPIST,
        medicalProfile: {
            qualification,
            registrationNumber,
            experienceYears,
            clinicalAttributes,
            rehabAttributes,
            specializations,
            medicalTraits,
        }
    };
}

export async function createMedicalAction(prevState: MedicalActionState, formData: FormData): Promise<MedicalActionState> {
    const rawData = extractMedicalData(formData);
    const validatedFields = medicalSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please fix the errors below.',
            success: false,
        };
    }

    try {
        const medicalData = mapToFirestoreMedical(validatedFields.data);

        await addDoc(collection(db, 'people'), {
            ...medicalData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Error creating medical staff:', error);
        return {
            message: 'Database Error: Failed to create medical staff.',
            success: false,
        };
    }

    revalidatePath('/people');
    redirect('/people');
}

export async function updateMedicalAction(
    id: string,
    prevState: MedicalActionState,
    formData: FormData
): Promise<MedicalActionState> {
    const rawData = extractMedicalData(formData);
    const validatedFields = medicalSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please fix the errors below.',
            success: false,
        };
    }

    try {
        const medicalData = mapToFirestoreMedical(validatedFields.data);

        await updateDoc(doc(db, 'people', id), {
            ...medicalData,
            updatedAt: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Error updating medical staff:', error);
        return {
            message: 'Database Error: Failed to update medical staff.',
            success: false,
        };
    }

    revalidatePath('/people');
    revalidatePath(`/people/${id}`);
    redirect(`/people/${id}`);
}
