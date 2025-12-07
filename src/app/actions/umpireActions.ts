'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { umpireSchema } from '@/lib/validations/umpireSchema';
import { Person } from '@/types/firestore';
import { USER_ROLES } from '@/lib/roles';

export interface UmpireActionState {
    errors?: {
        [key: string]: string[];
    };
    message?: string;
    success?: boolean;
}

function extractUmpireData(formData: FormData) {
    const preferredFormats = formData.getAll('preferredFormats') as string[];

    // Parse nested attributes
    const decisionAttributes = {
        lbwJudgement: Number(formData.get('decisionAttributes.lbwJudgement')),
        caughtBehindAccuracy: Number(formData.get('decisionAttributes.caughtBehindAccuracy')),
        runOutPositioning: Number(formData.get('decisionAttributes.runOutPositioning')),
        boundaryCalls: Number(formData.get('decisionAttributes.boundaryCalls')),
        drsAccuracy: Number(formData.get('decisionAttributes.drsAccuracy')),
        consistency: Number(formData.get('decisionAttributes.consistency')),
    };

    const matchControlAttributes = {
        playerManagement: Number(formData.get('matchControlAttributes.playerManagement')),
        conflictResolution: Number(formData.get('matchControlAttributes.conflictResolution')),
        timeManagement: Number(formData.get('matchControlAttributes.timeManagement')),
        lawApplication: Number(formData.get('matchControlAttributes.lawApplication')),
        communication: Number(formData.get('matchControlAttributes.communication')),
        pressureHandling: Number(formData.get('matchControlAttributes.pressureHandling')),
    };

    const physicalAttributes = {
        fitness: Number(formData.get('physicalAttributes.fitness')),
        endurance: Number(formData.get('physicalAttributes.endurance')),
        positioningAgility: Number(formData.get('physicalAttributes.positioningAgility')),
        concentration: Number(formData.get('physicalAttributes.concentration')),
        vision: Number(formData.get('physicalAttributes.vision')),
    };

    return {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        dateOfBirth: formData.get('dateOfBirth'),
        email: formData.get('email'),
        phoneNumber: formData.get('phoneNumber'),

        // Umpire Profile Core
        certificationLevel: formData.get('certificationLevel') || 'Level 1',
        homeAssociation: formData.get('homeAssociation') || '',
        yearsActive: formData.get('yearsActive') ? Number(formData.get('yearsActive')) : 0,
        preferredFormats,

        // Attribute Blocks
        decisionAttributes,
        matchControlAttributes,
        physicalAttributes,

        // Tags
        umpireTraits: formData.get('umpireTraits') ? JSON.parse(formData.get('umpireTraits') as string) : [],
    };
}

function mapToFirestoreUmpire(validatedData: any): Omit<Person, 'id' | 'createdAt' | 'updatedAt'> {
    const {
        decisionAttributes,
        matchControlAttributes,
        physicalAttributes,
        certificationLevel,
        homeAssociation,
        yearsActive,
        preferredFormats,
        umpireTraits,
        ...rest
    } = validatedData;

    return {
        ...rest,
        role: USER_ROLES.UMPIRE,
        umpireProfile: {
            certificationLevel,
            homeAssociation,
            yearsActive,
            preferredFormats,
            decisionAttributes,
            matchControlAttributes,
            physicalAttributes,
            umpireTraits,
        }
    };
}

export async function createUmpireAction(prevState: UmpireActionState, formData: FormData): Promise<UmpireActionState> {
    const rawData = extractUmpireData(formData);
    const validatedFields = umpireSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please fix the errors below.',
            success: false,
        };
    }

    try {
        const umpireData = mapToFirestoreUmpire(validatedFields.data);

        await addDoc(collection(db, 'people'), {
            ...umpireData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Error creating umpire:', error);
        return {
            message: 'Database Error: Failed to create umpire.',
            success: false,
        };
    }

    revalidatePath('/people');
    redirect('/people');
}

export async function updateUmpireAction(
    id: string,
    prevState: UmpireActionState,
    formData: FormData
): Promise<UmpireActionState> {
    const rawData = extractUmpireData(formData);
    const validatedFields = umpireSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please fix the errors below.',
            success: false,
        };
    }

    try {
        const umpireData = mapToFirestoreUmpire(validatedFields.data);

        await updateDoc(doc(db, 'people', id), {
            ...umpireData,
            updatedAt: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Error updating umpire:', error);
        return {
            message: 'Database Error: Failed to update umpire.',
            success: false,
        };
    }

    revalidatePath('/people');
    revalidatePath(`/people/${id}`);
    redirect(`/people/${id}`);
}
