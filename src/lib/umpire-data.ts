// Umpire data fetching from Firestore
// Replaces legacy mock data with real database queries

import { fetchCollection, fetchDocument } from './firestore';
import { Person } from '@/types/firestore';
import { where, orderBy } from 'firebase/firestore';

export interface OfficiatedMatch {
    fixtureId: string;
    matchDescription: string;
    date: string;
    role?: string;
    result?: string;
}

export interface UmpireProfile {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
    bio?: string;
    umpiringLevel: string;
    availability: string;
    experienceYears: number;
    matchesOfficiatedCount: number;
    reliabilityScore?: number;
    associatedClubOrUnion?: string;
    recentMatchesOfficiated: OfficiatedMatch[];
}

// Convert Person to UmpireProfile format
function personToUmpireProfile(person: Person): UmpireProfile {
    const fullName = `${person.firstName} ${person.lastName}`;

    return {
        id: person.id,
        name: fullName,
        email: person.email,
        phone: person.phone,
        avatar: person.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=3b82f6&color=fff`,
        bio: undefined, // Would come from extended profile
        umpiringLevel: person.specializations?.[0] || 'Level 1',
        availability: person.status === 'active' ? 'Available' : 'Unavailable',
        experienceYears: person.stats?.matchesPlayed ? Math.floor(person.stats.matchesPlayed / 10) : 0,
        matchesOfficiatedCount: person.stats?.matchesPlayed || 0,
        reliabilityScore: 85, // Default score - would come from ratings system
        associatedClubOrUnion: person.assignedSchools?.[0],
        recentMatchesOfficiated: [], // Would be populated from match history
    };
}

// Empty array for backward compatibility
export const umpiresData: UmpireProfile[] = [];

// Fetch all umpires
export async function fetchUmpires(): Promise<UmpireProfile[]> {
    try {
        const people = await fetchCollection<Person>('people', [
            where('role', '==', 'Umpire'),
            orderBy('lastName')
        ]);
        return people.map(personToUmpireProfile);
    } catch (error) {
        console.error('Error fetching umpires:', error);
        return [];
    }
}

// Fetch a single umpire by ID
export async function fetchUmpireById(id: string): Promise<UmpireProfile | null> {
    try {
        const person = await fetchDocument<Person>('people', id);
        if (!person) return null;

        // Verify this is an umpire
        if (person.role !== 'Umpire') {
            console.warn(`Person ${id} is not an umpire`);
            return null;
        }

        return personToUmpireProfile(person);
    } catch (error) {
        console.error('Error fetching umpire:', error);
        return null;
    }
}

// Fetch available umpires for scheduling
export async function fetchAvailableUmpires(): Promise<UmpireProfile[]> {
    try {
        const people = await fetchCollection<Person>('people', [
            where('role', '==', 'Umpire'),
            where('status', '==', 'active'),
            orderBy('lastName')
        ]);
        return people.map(personToUmpireProfile);
    } catch (error) {
        console.error('Error fetching available umpires:', error);
        return [];
    }
}
