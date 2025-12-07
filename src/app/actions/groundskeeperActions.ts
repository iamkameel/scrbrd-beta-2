'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { groundskeeperSchema } from '@/lib/validations/groundskeeperSchema';
import { Person } from '@/types/firestore';
import { USER_ROLES } from '@/lib/roles';

export interface GroundskeeperActionState {
    errors?: {
        [key: string]: string[];
    };
    message?: string;
    success?: boolean;
}

function extractGroundskeeperData(formData: FormData) {
    // Parse nested attributes
    const pitchAttributes = {
        paceGeneration: Number(formData.get('pitchAttributes.paceGeneration')),
        spinPromotion: Number(formData.get('pitchAttributes.spinPromotion')),
        durability: Number(formData.get('pitchAttributes.durability')),
        evenness: Number(formData.get('pitchAttributes.evenness')),
        moistureControl: Number(formData.get('pitchAttributes.moistureControl')),
    };

    const outfieldAttributes = {
        drainageManagement: Number(formData.get('outfieldAttributes.drainageManagement')),
        grassHealth: Number(formData.get('outfieldAttributes.grassHealth')),
        boundaryMarking: Number(formData.get('outfieldAttributes.boundaryMarking')),
        rollering: Number(formData.get('outfieldAttributes.rollering')),
        mowing: Number(formData.get('outfieldAttributes.mowing')),
    };

    return {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        dateOfBirth: formData.get('dateOfBirth'),
        email: formData.get('email'),
        phoneNumber: formData.get('phoneNumber'),

        // Groundskeeper Profile Core
        experienceYears: formData.get('experienceYears') ? Number(formData.get('experienceYears')) : 0,

        // Attribute Blocks
        pitchAttributes,
        outfieldAttributes,

        // Tags
        machineryLicenses: formData.get('machineryLicenses') ? JSON.parse(formData.get('machineryLicenses') as string) : [],
        primaryVenues: formData.get('primaryVenues') ? JSON.parse(formData.get('primaryVenues') as string) : [],
        groundskeeperTraits: formData.get('groundskeeperTraits') ? JSON.parse(formData.get('groundskeeperTraits') as string) : [],
    };
}

function mapToFirestoreGroundskeeper(validatedData: any): Omit<Person, 'id' | 'createdAt' | 'updatedAt'> {
    const {
        pitchAttributes,
        outfieldAttributes,
        experienceYears,
        machineryLicenses,
        primaryVenues,
        groundskeeperTraits,
        ...rest
    } = validatedData;

    return {
        ...rest,
        role: USER_ROLES.GROUNDS_KEEPER,
        groundskeeperProfile: {
            experienceYears,
            machineryLicenses,
            primaryVenues,
            pitchAttributes,
            outfieldAttributes,
            groundskeeperTraits,
        }
    };
}

export async function createGroundskeeperAction(prevState: GroundskeeperActionState, formData: FormData): Promise<GroundskeeperActionState> {
    const rawData = extractGroundskeeperData(formData);
    const validatedFields = groundskeeperSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please fix the errors below.',
            success: false,
        };
    }

    try {
        const groundskeeperData = mapToFirestoreGroundskeeper(validatedFields.data);

        await addDoc(collection(db, 'people'), {
            ...groundskeeperData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Error creating groundskeeper:', error);
        return {
            message: 'Database Error: Failed to create groundskeeper.',
            success: false,
        };
    }

    revalidatePath('/people');
    redirect('/people');
}

export async function updateGroundskeeperAction(
    id: string,
    prevState: GroundskeeperActionState,
    formData: FormData
): Promise<GroundskeeperActionState> {
    const rawData = extractGroundskeeperData(formData);
    const validatedFields = groundskeeperSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please fix the errors below.',
            success: false,
        };
    }

    try {
        const groundskeeperData = mapToFirestoreGroundskeeper(validatedFields.data);

        await updateDoc(doc(db, 'people', id), {
            ...groundskeeperData,
            updatedAt: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Error updating groundskeeper:', error);
        return {
            message: 'Database Error: Failed to update groundskeeper.',
            success: false,
        };
    }

    revalidatePath('/people');
    revalidatePath(`/people/${id}`);
    redirect(`/people/${id}`);
}
