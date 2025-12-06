import { Timestamp } from 'firebase/firestore';

/**
 * Serialize Firestore Timestamps to ISO strings for Client Components
 */
export function serializeTimestamp(timestamp: any): string | null {
  if (!timestamp) return null;
  
  // Already a string
  if (typeof timestamp === 'string') return timestamp;
  
  // Firestore Timestamp with toDate()
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }
  
  // Date object
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  
  // Timestamp-like object with seconds
  if (timestamp && typeof timestamp.seconds === 'number') {
    return new Date(timestamp.seconds * 1000).toISOString();
  }
  
  return null;
}

/**
 * Serialize any object with Timestamps
 */
export function serializeFirestoreData<T extends Record<string, any>>(data: T): T {
  const serialized: any = {};
  
  for (const key in data) {
    const value = data[key];
    
    if (value === null || value === undefined) {
      serialized[key] = value;
    } else if (Array.isArray(value)) {
      serialized[key] = value.map((item: any) => 
        typeof item === 'object' && item !== null ? serializeFirestoreData(item) : item
      );
    } else if ((value as any) instanceof Date) {
      serialized[key] = (value as any).toISOString();
    } else if (typeof value === 'object' && typeof (value as any).toDate === 'function') {
      // Firestore Timestamp
      serialized[key] = serializeTimestamp(value);
    } else if (typeof value === 'object') {
      serialized[key] = serializeFirestoreData(value);
    } else {
      serialized[key] = value;
    }
  }
  
  return serialized as T;
}

/**
 * Parse serialized ISO string back to Date
 */
export function parseSerializedDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  try {
    return new Date(dateString);
  } catch {
    return null;
  }
}
