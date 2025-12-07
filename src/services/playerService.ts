import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Person } from '@/types/firestore';

const COLLECTION_NAME = 'people';

export const getPlayers = async () => {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef, where('role', '==', 'Player'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Person));
  } catch (error) {
    console.error("Error fetching players:", error);
    return [];
  }
};

export const getPlayerById = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Person : null;
  } catch (error) {
    console.error(`Error fetching player ${id}:`, error);
    return null;
  }
};

export const addPlayer = async (player: Omit<Person, 'id'>) => {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(colRef, { ...player, role: 'Player', createdAt: new Date().toISOString() });
    return docRef.id;
  } catch (error) {
    console.error("Error adding player:", error);
    throw error;
  }
};

export const updatePlayer = async (id: string, data: Partial<Person>) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
    return true;
  } catch (error) {
    console.error(`Error updating player ${id}:`, error);
    throw error;
  }
};

export const deletePlayer = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error deleting player ${id}:`, error);
    throw error;
  }
};
