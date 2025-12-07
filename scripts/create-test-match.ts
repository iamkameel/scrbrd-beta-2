/**
 * Create Test Match with Real Data
 * 
 * This script creates a test match in Firestore with proper team IDs
 * that actually exist in the database.
 */

import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';

// Firebase config from your project
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createTestMatch() {
    console.log('🏏 Creating test match with real team data...\n');

    try {
        // First, get all teams to see what we have
        const teamsRef = collection(db, 'teams');
        const teamsSnapshot = await getDocs(teamsRef);

        console.log(`Found ${teamsSnapshot.size} teams in Firestore:\n`);

        interface TeamData {
            id: string;
            name: string;
            [key: string]: any;
        }

        const teams: TeamData[] = [];
        teamsSnapshot.forEach((doc) => {
            const data = doc.data();
            const team: TeamData = {
                id: doc.id,
                name: data.name || 'Unknown Team',
                ...data
            };
            teams.push(team);
            console.log(`  - ${team.id}: ${team.name}`);
        });

        if (teams.length < 2) {
            console.error('\n❌ Need at least 2 teams to create a match!');
            process.exit(1);
        }

        // Use the first two teams
        const homeTeam = teams[0];
        const awayTeam = teams[1];

        console.log(`\n✅ Creating match: ${homeTeam.name} vs ${awayTeam.name}`);

        // Create a test match
        const matchId = 'test-match-' + Date.now();
        const matchData = {
            id: matchId,
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            homeTeamName: homeTeam.name,
            awayTeamName: awayTeam.name,
            matchDate: new Date().toISOString(),
            matchTime: new Date().toISOString(),
            venue: 'Main Oval',
            status: 'live',
            isLive: true,
            matchType: 'T20',
            overs: 20,
            state: 'LIVE',
            liveScore: {
                innings: {
                    totalRuns: 0,
                    totalWickets: 0,
                    overs: [],
                    overHistory: []
                },
                currentOver: [],
                partnership: {
                    runs: 0,
                    balls: 0
                }
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await setDoc(doc(db, 'matches', matchId), matchData);

        console.log(`\n🎉 Test match created successfully!`);
        console.log(`   Match ID: ${matchId}`);
        console.log(`   URL: http://localhost:3000/matches/${matchId}/manage`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating test match:', error);
        process.exit(1);
    }
}

createTestMatch();
