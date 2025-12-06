'use server';

import { fetchCollection, fetchDocument, createDocument, updateDocument, deleteDocument } from "@/lib/firestore";
import { Equipment } from "@/types/firestore";
import { revalidatePath } from "next/cache";

export async function getEquipment() {
  return fetchCollection('equipment');
}

export async function addEquipmentItemAction(item: Omit<Equipment, 'id'>) {
  try {
    const newItem = await createDocument('equipment', item);
    revalidatePath('/equipment');
    return { success: true, item: newItem };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

export async function updateEquipmentItemAction(itemId: string, updates: Partial<Equipment>) {
  try {
    await updateDocument('equipment', itemId, updates);
    revalidatePath('/equipment');
    return { success: true };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

export async function deleteEquipmentItemAction(itemId: string) {
  try {
    await deleteDocument('equipment', itemId);
    revalidatePath('/equipment');
    return { success: true };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

export async function assignEquipmentAction(itemId: string, personId: string) {
  try {
    await updateDocument('equipment', itemId, {
      assignedTo: personId,
      status: 'In Use'
    });
    revalidatePath('/equipment');
    return { success: true };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

export async function returnEquipmentAction(itemId: string) {
  try {
    await updateDocument('equipment', itemId, {
      assignedTo: null,
      status: 'Available'
    });
    revalidatePath('/equipment');
    return { success: true };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}
