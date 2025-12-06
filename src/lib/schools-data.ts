// Legacy mock data - now using Firestore
// Keeping these as stubs for backward compatibility with restored pages

export interface SchoolData {
    id: string;
    name: string;
    abbreviation?: string;
    province?: string;
    city?: string;
}

// Empty array - data should come from Firestore
export const schoolsData: SchoolData[] = [];
