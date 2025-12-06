'use server';

import { revalidatePath } from 'next/cache';
import { fieldSchema } from '@/lib/validations/fieldSchema';
import { createDocument, updateDocument, deleteDocument } from '@/lib/firestore';
import { Field } from '@/types/firestore';
import { ZodError } from 'zod';

export interface FieldActionState {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
}

export async function createFieldAction(
  prevState: FieldActionState,
  formData: FormData
): Promise<FieldActionState> {
  try {
    const rawData = {
      name: formData.get('name'),
      location: formData.get('location'),
      address: formData.get('address'),
      coordinates: {
        lat: Number(formData.get('latitude')),
        lng: Number(formData.get('longitude')),
      },
      capacity: Number(formData.get('capacity')),
      pitchCount: Number(formData.get('pitchCount')),
      boundarySize: {
        north: Number(formData.get('boundaryNorth')),
        south: Number(formData.get('boundarySouth')),
        east: Number(formData.get('boundaryEast')),
        west: Number(formData.get('boundaryWest')),
      },
      pitchType: formData.get('pitchType'),
      scoreboardType: formData.get('scoreboardType'),
      facilities: formData.getAll('facilities'),

      // New fields
      status: formData.get('status'),
      fieldSize: formData.get('fieldSize'),
      surfaceConditionRating: formData.get('surfaceConditionRating'),
      grassCover: formData.get('grassCover'),
      moistureLevel: formData.get('moistureLevel'),
      firmness: formData.get('firmness'),
      contactPerson: formData.get('contactPerson'),
      contactPhone: formData.get('contactPhone'),
      groundsKeeperIds: formData.getAll('groundsKeeperIds'),
    };

    const validatedData = fieldSchema.parse(rawData);

    const newFieldData: Omit<Field, 'id'> = {
      ...validatedData,
      // Transform flat surface fields into nested object
      surfaceDetails: {
        grassCover: validatedData.grassCover ? Number(validatedData.grassCover) : undefined,
        moistureLevel: validatedData.moistureLevel,
        firmness: validatedData.firmness,
      },
      surfaceConditionRating: validatedData.surfaceConditionRating ? Number(validatedData.surfaceConditionRating) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any;

    await createDocument<Omit<Field, 'id'>>('fields', newFieldData);

    revalidatePath('/fields');
    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      error.issues.forEach((err) => {
        const field = String(err.path[0]);
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(err.message);
      });
      return { fieldErrors };
    }
    console.error('Create field error:', error);
    return { error: (error as Error).message || 'Failed to create field' };
  }
}

export async function updateFieldAction(
  id: string,
  prevState: FieldActionState,
  formData: FormData
): Promise<FieldActionState> {
  try {
    const rawData = {
      name: formData.get('name'),
      location: formData.get('location'),
      address: formData.get('address'),
      coordinates: {
        lat: Number(formData.get('latitude')),
        lng: Number(formData.get('longitude')),
      },
      capacity: Number(formData.get('capacity')),
      pitchCount: Number(formData.get('pitchCount')),
      boundarySize: {
        north: Number(formData.get('boundaryNorth')),
        south: Number(formData.get('boundarySouth')),
        east: Number(formData.get('boundaryEast')),
        west: Number(formData.get('boundaryWest')),
      },
      pitchType: formData.get('pitchType'),
      scoreboardType: formData.get('scoreboardType'),
      facilities: formData.getAll('facilities'),

      // New fields
      status: formData.get('status'),
      fieldSize: formData.get('fieldSize'),
      surfaceConditionRating: formData.get('surfaceConditionRating'),
      grassCover: formData.get('grassCover'),
      moistureLevel: formData.get('moistureLevel'),
      firmness: formData.get('firmness'),
      contactPerson: formData.get('contactPerson'),
      contactPhone: formData.get('contactPhone'),
      groundsKeeperIds: formData.getAll('groundsKeeperIds'),
    };

    const validatedData = fieldSchema.parse(rawData);

    const updateData: Partial<Field> = {
      ...validatedData,
      // Transform flat surface fields into nested object
      surfaceDetails: {
        grassCover: validatedData.grassCover ? Number(validatedData.grassCover) : undefined,
        moistureLevel: validatedData.moistureLevel,
        firmness: validatedData.firmness,
      },
      surfaceConditionRating: validatedData.surfaceConditionRating ? Number(validatedData.surfaceConditionRating) : undefined,
      updatedAt: new Date().toISOString(),
    } as any;

    await updateDocument<Field>('fields', id, updateData);

    revalidatePath('/fields');
    revalidatePath(`/fields/${id}`);
    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      error.issues.forEach((err) => {
        const field = String(err.path[0]);
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(err.message);
      });
      return { fieldErrors };
    }
    console.error('Update field error:', error);
    return { error: (error as Error).message || 'Failed to update field' };
  }
}

export async function deleteFieldAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDocument('fields', id);
    revalidatePath('/fields');
    return { success: true };
  } catch (error) {
    console.error('Delete field error:', error);
    return { success: false, error: (error as Error).message || 'Failed to delete field' };
  }
}
