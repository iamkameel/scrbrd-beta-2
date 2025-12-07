'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { scorerSchema } from '@/lib/validations/scorerSchema';
import { Person } from '@/types/firestore';
import { USER_ROLES } from '@/lib/roles';

export interface ScorerActionState {
    errors?: {
        [key: string]: string[];
    };
    message?: string;
    success?: boolean;
}

function extractScorerData(formData: FormData) {
    // Parse nested attributes
    const technicalAttributes = {
        softwareProficiency: Number(formData.get('technicalAttributes.softwareProficiency')),
        lawKnowledge: Number(formData.get('technicalAttributes.lawKnowledge')),
        linearScoring: Number(formData.get('technicalAttributes.linearScoring')),
        digitalScoring: Number(formData.get('technicalAttributes.digitalScoring')),
        problemSolving: Number(formData.get('technicalAttributes.problemSolving')),
    };

    const professionalAttributes = {
        concentration: Number(formData.get('professionalAttributes.concentration')),
        speed: Number(formData.get('professionalAttributes.speed')),
        accuracy: Number(formData.get('professionalAttributes.accuracy')),
        communication: Number(formData.get('professionalAttributes.communication')),
        punctuality: Number(formData.get('professionalAttributes.punctuality')),
        collaboration: Number(formData.get('professionalAttributes.collaboration')),
    };

    return {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        dateOfBirth: formData.get('dateOfBirth'),
        email: formData.get('email'),
        phoneNumber: formData.get('phoneNumber'),

        // Scorer Profile Core
        certificationLevel: formData.get('certificationLevel') || 'Level 1',
        preferredMethod: formData.get('preferredMethod') || 'Digital',
        experienceYears: formData.get('experienceYears') ? Number(formData.get('experienceYears')) : 0,

        // Attribute Blocks
        technicalAttributes,
        professionalAttributes,

        // Tags
        scorerTraits: formData.get('scorerTraits') ? JSON.parse(formData.get('scorerTraits') as string) : [],
    };
}

function mapToFirestoreScorer(validatedData: any): Omit<Person, 'id' | 'createdAt' | 'updatedAt'> {
    const {
        technicalAttributes,
        professionalAttributes,
        certificationLevel,
        preferredMethod,
        experienceYears,
        scorerTraits,
        ...rest
    } = validatedData;

    return {
        ...rest,
        role: USER_ROLES.SCORER,
        scorerProfile: {
            certificationLevel,
            preferredMethod,
            experienceYears,
            technicalAttributes,
            professionalAttributes,
            scorerTraits,
        }
    };
}

export async function createScorerAction(prevState: ScorerActionState, formData: FormData): Promise<ScorerActionState> {
    const rawData = extractScorerData(formData);
    const validatedFields = scorerSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please fix the errors below.',
            success: false,
        };
    }

    try {
        const scorerData = mapToFirestoreScorer(validatedFields.data);

        await addDoc(collection(db, 'people'), {
            ...scorerData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Error creating scorer:', error);
        return {
            message: 'Database Error: Failed to create scorer.',
            success: false,
        };
    }

    revalidatePath('/people');
    redirect('/people');
}

export async function updateScorerAction(
    id: string,
    prevState: ScorerActionState,
    formData: FormData
): Promise<ScorerActionState> {
    const rawData = extractScorerData(formData);
    const validatedFields = scorerSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please fix the errors below.',
            success: false,
        };
    }

    try {
        const scorerData = mapToFirestoreScorer(validatedFields.data);

        await updateDoc(doc(db, 'people', id), {
            ...scorerData,
            updatedAt: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Error updating scorer:', error);
        return {
            message: 'Database Error: Failed to update scorer.',
            success: false,
        };
    }

    revalidatePath('/people');
    revalidatePath(`/people/${id}`);
    redirect(`/people/${id}`);
}
