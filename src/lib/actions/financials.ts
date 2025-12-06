'use server';

import { fetchTransactions, createDocument, updateDocument, deleteDocument } from "@/lib/firestore";
import { Transaction } from "@/types/firestore";
import { revalidatePath } from "next/cache";

export async function getTransactions() {
  return fetchTransactions();
}

export async function addTransactionAction(transaction: Omit<Transaction, 'id'>) {
  try {
    const newTransaction = await createDocument('transactions', transaction);
    revalidatePath('/financials');
    return { success: true, transaction: newTransaction };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

export async function updateTransactionAction(transactionId: string, updates: Partial<Transaction>) {
  try {
    await updateDocument('transactions', transactionId, updates);
    revalidatePath('/financials');
    return { success: true };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

export async function deleteTransactionAction(transactionId: string) {
  try {
    await deleteDocument('transactions', transactionId);
    revalidatePath('/financials');
    return { success: true };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}
