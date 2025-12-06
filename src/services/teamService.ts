import { 
  collection, 
  getDocs, 
  query
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Team } from '@/types/firestore';

const COLLECTION_NAME = 'teams';

export const getTeams = async () => {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
};
