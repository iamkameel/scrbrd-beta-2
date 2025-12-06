import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Field } from '@/types/firestore';

const COLLECTION_NAME = 'fields';

export const fieldService = {
  // Get all fields
  getAllFields: async (): Promise<Field[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('name'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Field));
    } catch (error) {
      console.error('Error fetching fields:', error);
      return [];
    }
  },

  // Get a single field by ID
  getFieldById: async (id: string): Promise<Field | null> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Field;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching field with ID ${id}:`, error);
      return null;
    }
  },

  // Get fields by School ID
  getFieldsBySchoolId: async (schoolId: string): Promise<Field[]> => {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('schoolId', '==', schoolId),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Field));
    } catch (error) {
      console.error(`Error fetching fields for school ${schoolId}:`, error);
      return [];
    }
  },

  // Create a new field
  createField: async (fieldData: Omit<Field, 'id'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...fieldData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating field:', error);
      throw error;
    }
  },

  // Update a field
  updateField: async (id: string, fieldData: Partial<Field>): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...fieldData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error updating field ${id}:`, error);
      throw error;
    }
  }
};
