'use server';

import { adminDb } from '@/lib/firebase-admin';
import { Person } from '@/types/firestore';

export async function getTrainerPlayersAction(trainerEmail: string) {
    try {
        const peopleRef = adminDb.collection('people');
        const trainerSnapshot = await peopleRef.where('email', '==', trainerEmail).limit(1).get();

        if (trainerSnapshot.empty) return [];

        const trainer = trainerSnapshot.docs[0].data() as Person;
        const teamIds = trainer.teamIds || [];

        if (teamIds.length === 0) return [];

        // Fetch players in these teams
        // Firestore 'in' query supports up to 10 items.
        // If more, we need multiple queries or fetch all people and filter (not scalable but okay for now).
        // Or fetch by teamId one by one.

        // We want to find people where their 'teamIds' array has an intersection with trainer's 'teamIds'.
        // 'array-contains-any' checks if the document's array field contains ANY of the values in the provided array.
        const playersSnapshot = await peopleRef.where('teamIds', 'array-contains-any', teamIds).get();

        const players = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Person));

        // Filter by role 'Player' just in case, or if they have a player profile
        return players.filter(p => p.role === 'Player' || p.playingRole || p.playerProfile);
    } catch (error) {
        console.error('Error fetching trainer players:', error);
        return [];
    }
}
