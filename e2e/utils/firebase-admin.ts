import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: App;

/**
 * Initialize Firebase Admin SDK for E2E testing
 * This allows us to directly manipulate Firestore for test data setup
 */
export function getAdminApp() {
    if (!adminApp && getApps().length === 0) {
        // Initialize with service account
        // In CI/CD, this would use environment variables
        // For local testing, it uses the local emulator
        adminApp = initializeApp({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'scrbrd-beta-2',
        });
    }
    return adminApp || getApps()[0];
}

export function getAdminDb() {
    const app = getAdminApp();
    return getFirestore(app);
}

/**
 * Create test players for a team
 */
export async function createTestPlayers(teamId: string, teamName: string, count: number = 11) {
    const db = getAdminDb();
    const players = [];

    for (let i = 1; i <= count; i++) {
        const playerData = {
            firstName: `Player`,
            lastName: `${i}`,
            role: 'Player',
            teamIds: [teamId],
            playingRole: i <= 6 ? 'Batsman' : (i <= 9 ? 'Bowler' : 'All-rounder'),
            battingStyle: i % 2 === 0 ? 'Right-hand bat' : 'Left-hand bat',
            bowlingStyle: i > 6 ? (i % 2 === 0 ? 'Right-arm fast' : 'Left-arm spin') : undefined,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const docRef = await db.collection('people').add(playerData);
        players.push({ id: docRef.id, ...playerData });
        console.log(`Created player: Player ${i} (${docRef.id})`);
    }

    return players;
}

/**
 * Delete test data by prefix
 */
export async function cleanupTestData(prefix: string = 'Test') {
    const db = getAdminDb();

    // Delete teams
    const teamsSnapshot = await db.collection('teams')
        .where('name', '>=', prefix)
        .where('name', '<', prefix + '\uf8ff')
        .get();

    const deletePromises = [];
    for (const doc of teamsSnapshot.docs) {
        console.log(`Deleting team: ${doc.data().name}`);
        deletePromises.push(doc.ref.delete());
    }

    // Delete people (players)
    const peopleSnapshot = await db.collection('people')
        .where('firstName', '==', 'Player')
        .get();

    for (const doc of peopleSnapshot.docs) {
        const data = doc.data();
        if (data.lastName && /^\d+$/.test(data.lastName)) {
            console.log(`Deleting player: ${data.firstName} ${data.lastName}`);
            deletePromises.push(doc.ref.delete());
        }
    }

    // Delete matches
    const matchesSnapshot = await db.collection('matches').get();
    for (const doc of matchesSnapshot.docs) {
        const data = doc.data();
        // Delete if it's a test match (you might want to add a flag for this)
        if (data.competition?.includes('Test') || data.notes?.includes('E2E Test')) {
            console.log(`Deleting match: ${doc.id}`);
            deletePromises.push(doc.ref.delete());
        }
    }

    await Promise.all(deletePromises);
    console.log(`Cleanup complete: deleted ${deletePromises.length} documents`);
}

/**
 * Get team ID by name
 */
export async function getTeamIdByName(teamName: string): Promise<string | null> {
    const db = getAdminDb();
    const snapshot = await db.collection('teams')
        .where('name', '==', teamName)
        .limit(1)
        .get();

    if (snapshot.empty) {
        return null;
    }

    return snapshot.docs[0].id;
}
