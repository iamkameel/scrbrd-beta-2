'use server';

import { createDocument, fetchMatchesByDateRange, fetchCollection } from '@/lib/firestore';
import { Match, Person } from '@/types/firestore';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { where } from 'firebase/firestore';

export type FixtureActionState = {
    error?: string;
    success?: boolean;
    conflicts?: string[];
};

/**
 * Check for scheduling conflicts
 * Checks if venue is booked or teams are playing within 3 hours of the proposed time
 */
export async function checkFixtureConflictsAction(
    date: string,
    time: string,
    venueId: string,
    homeTeamId: string,
    awayTeamId: string
): Promise<{ hasConflicts: boolean; conflicts: string[] }> {
    try {
        const startDateTime = new Date(`${date}T${time}`);
        // Check window: 3 hours before and after
        const windowStart = new Date(startDateTime.getTime() - 3 * 60 * 60 * 1000);
        const windowEnd = new Date(startDateTime.getTime() + 3 * 60 * 60 * 1000);

        const existingMatches = await fetchMatchesByDateRange(windowStart, windowEnd);
        const conflicts: string[] = [];

        existingMatches.forEach(match => {
            // Check Venue
            if (match.fieldId === venueId) {
                conflicts.push(`Venue is already booked for match: ${match.homeTeamName} vs ${match.awayTeamName} at ${new Date(match.dateTime!).toLocaleTimeString()}`);
            }

            // Check Teams
            if (match.homeTeamId === homeTeamId || match.awayTeamId === homeTeamId) {
                conflicts.push(`Home team is already playing: ${match.homeTeamName} vs ${match.awayTeamName}`);
            }
            if (match.homeTeamId === awayTeamId || match.awayTeamId === awayTeamId) {
                conflicts.push(`Away team is already playing: ${match.homeTeamName} vs ${match.awayTeamName}`);
            }
        });

        return {
            hasConflicts: conflicts.length > 0,
            conflicts
        };
    } catch (error) {
        console.error('Error checking conflicts:', error);
        return { hasConflicts: false, conflicts: [] };
    }
}

/**
 * Get available officials for a specific time slot
 */
export async function getAvailableOfficialsAction(
    date: string,
    time: string
): Promise<{ umpires: Person[]; scorers: Person[] }> {
    try {
        const startDateTime = new Date(`${date}T${time}`);
        const windowStart = new Date(startDateTime.getTime() - 4 * 60 * 60 * 1000); // 4 hour buffer for officials
        const windowEnd = new Date(startDateTime.getTime() + 4 * 60 * 60 * 1000);

        const existingMatches = await fetchMatchesByDateRange(windowStart, windowEnd);

        // Get all officials
        const [allUmpires, allScorers] = await Promise.all([
            fetchCollection<Person>('people', [where('role', '==', 'Umpire')]),
            fetchCollection<Person>('people', [where('role', '==', 'Scorer')])
        ]);

        // Find busy official IDs
        const busyOfficialIds = new Set<string>();
        existingMatches.forEach(match => {
            if (match.umpires) match.umpires.forEach(id => busyOfficialIds.add(id));
            if (match.scorer) busyOfficialIds.add(match.scorer);
        });

        return {
            umpires: allUmpires.filter(u => !busyOfficialIds.has(u.id)),
            scorers: allScorers.filter(s => !busyOfficialIds.has(s.id))
        };
    } catch (error) {
        console.error('Error fetching officials:', error);
        return { umpires: [], scorers: [] };
    }
}

/**
 * Create a Smart Fixture
 */
export async function createSmartFixtureAction(
    prevState: FixtureActionState,
    formData: FormData
): Promise<FixtureActionState> {
    try {
        const date = formData.get('date') as string;
        const time = formData.get('time') as string;
        const homeTeamId = formData.get('homeTeamId') as string;
        const awayTeamId = formData.get('awayTeamId') as string;
        const venueId = formData.get('venueId') as string;

        // Re-check conflicts server-side
        const { hasConflicts, conflicts } = await checkFixtureConflictsAction(
            date,
            time,
            venueId,
            homeTeamId,
            awayTeamId
        );

        if (hasConflicts) {
            return { error: 'Scheduling conflicts detected', conflicts };
        }

        const matchData: Partial<Match> = {
            dateTime: `${date}T${time}:00.000Z`, // ISO string
            matchDate: `${date}T${time}:00.000Z`, // For compatibility
            homeTeamId,
            awayTeamId,
            fieldId: venueId,
            matchType: formData.get('matchType') as any,
            overs: Number(formData.get('overs')) || 20,
            status: 'scheduled',
            umpires: formData.get('umpireIds') ? (formData.get('umpireIds') as string).split(',') : [],
            scorer: (formData.get('scorerId') as string) === 'unassigned' ? '' : (formData.get('scorerId') as string),
            homeTeamName: formData.get('homeTeamName') as string, // Optimistic
            awayTeamName: formData.get('awayTeamName') as string, // Optimistic
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await createDocument('matches', matchData);

        revalidatePath('/fixtures');
    } catch (error) {
        console.error('Error creating fixture:', error);
        return { error: 'Failed to create fixture' };
    }

    redirect('/fixtures');
}
