'use server';

import { fetchSponsors, createDocument, updateDocument, deleteDocument } from "@/lib/firestore";
import { Sponsor } from "@/types/firestore";
import { revalidatePath } from "next/cache";

export async function getSponsors() {
  return fetchSponsors();
}

export async function addSponsorAction(sponsor: Omit<Sponsor, 'id'>) {
  try {
    const newSponsor = await createDocument('sponsors', sponsor);
    revalidatePath('/sponsors');
    return { success: true, sponsor: newSponsor };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

export async function updateSponsorAction(sponsorId: string, updates: Partial<Sponsor>) {
  try {
    await updateDocument('sponsors', sponsorId, updates);
    revalidatePath('/sponsors');
    return { success: true };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

export async function deleteSponsorAction(sponsorId: string) {
  try {
    await deleteDocument('sponsors', sponsorId);
    revalidatePath('/sponsors');
    return { success: true };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}
