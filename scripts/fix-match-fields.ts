/**
 * Fix Match Field Mapping
 * 
 * This script updates existing matches in Firestore to add the correct
 * homeTeamId and awayTeamId fields based on teamAId and teamBId.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

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

async function fixMatchFields() {
    console.log('🔧 Fixing match field mappings...\n');

    try {
        // Get all matches
        const matchesRef = collection(db, 'matches');
        const matchesSnapshot = await getDocs(matchesRef);

        console.log(`Found ${matchesSnapshot.size} matches to update\n`);

        for (const matchDoc of matchesSnapshot.docs) {
            const matchData = matchDoc.data();
            const matchId = matchDoc.id;

            // Check if we need to update
            if (matchData.teamAId && matchData.teamBId) {
                const updates: any = {};

                // Add homeTeamId and awayTeamId if they don't exist
                if (!matchData.homeTeamId) {
                    updates.homeTeamId = matchData.teamAId;
                }
                if (!matchData.awayTeamId) {
                    updates.awayTeamId = matchData.teamBId;
                }
                if (!matchData.homeTeamName && matchData.teamAName) {
                    updates.homeTeamName = matchData.teamAName;
                }
                if (!matchData.awayTeamName && matchData.teamBName) {
                    updates.awayTeamName = matchData.teamBName;
                }

                if (Object.keys(updates).length > 0) {
                    await updateDoc(doc(db, 'matches', matchId), updates);
                    console.log(`✅ Updated match ${matchId}: ${matchData.teamAName} vs ${matchData.teamBName}`);
                    console.log(`   Added fields: ${Object.keys(updates).join(', ')}`);
                } else {
                    console.log(`⏭️  Match ${matchId} already has correct fields`);
                }
            }
        }

        console.log('\n🎉 Match field mapping complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing match fields:', error);
        process.exit(1);
    }
}

fixMatchFields();
