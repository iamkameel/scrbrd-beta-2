// Scorer data fetching from Firestore
// Replaces legacy mock data with real database queries

import { fetchCollection, fetchDocument } from './firestore';
import { Person } from '@/types/firestore';
import { where, orderBy } from 'firebase/firestore';

export interface ScoredMatch {
    fixtureId: string;
    matchDescription: string;
    date: string;
    result?: string;
}

export interface ScorerProfile {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
    bio?: string;
    scoringLevel: string;
    availability: string;
    experienceYears: number;
    matchesScoredCount: number;
    accuracyScore?: number;
    associatedSchool?: string;
    recentMatchesScored: ScoredMatch[];
}

// Convert Person to ScorerProfile format
function personToScorerProfile(person: Person): ScorerProfile {
    const fullName = `${person.firstName} ${person.lastName}`;

    return {
        id: person.id,
        name: fullName,
        email: person.email,
        phone: person.phone,
        avatar: person.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=22c55e&color=fff`,
        bio: undefined, // Would come from extended profile
        scoringLevel: person.specializations?.[0] || 'Level 1',
        availability: person.status === 'active' ? 'Available' : 'Unavailable',
        experienceYears: person.stats?.matchesPlayed ? Math.floor(person.stats.matchesPlayed / 10) : 0,
        matchesScoredCount: person.stats?.matchesPlayed || 0,
        accuracyScore: 90, // Default score - would come from accuracy tracking
        associatedSchool: person.assignedSchools?.[0],
        recentMatchesScored: [], // Would be populated from match history
    };
}

// Empty array for backward compatibility
export const scorersData: ScorerProfile[] = [];

// Fetch all scorers
export async function fetchScorers(): Promise<ScorerProfile[]> {
    try {
        const people = await fetchCollection<Person>('people', [
            where('role', '==', 'Scorer'),
            orderBy('lastName')
        ]);
        return people.map(personToScorerProfile);
    } catch (error) {
        console.error('Error fetching scorers:', error);
        return [];
    }
}

// Fetch a single scorer by ID
export async function fetchScorerById(id: string): Promise<ScorerProfile | null> {
    try {
        const person = await fetchDocument<Person>('people', id);
        if (!person) return null;

        // Verify this is a scorer
        if (person.role !== 'Scorer') {
            console.warn(`Person ${id} is not a scorer`);
            return null;
        }

        return personToScorerProfile(person);
    } catch (error) {
        console.error('Error fetching scorer:', error);
        return null;
    }
}

// Fetch available scorers for scheduling
export async function fetchAvailableScorers(): Promise<ScorerProfile[]> {
    try {
        const people = await fetchCollection<Person>('people', [
            where('role', '==', 'Scorer'),
            where('status', '==', 'active'),
            orderBy('lastName')
        ]);
        return people.map(personToScorerProfile);
    } catch (error) {
        console.error('Error fetching available scorers:', error);
        return [];
    }
}
