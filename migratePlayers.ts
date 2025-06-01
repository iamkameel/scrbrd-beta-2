
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore'; // Import Timestamp
// IMPORTANT: Replace with the actual path to your downloaded Firebase Admin SDK JSON file.
// The path seems correct relative to the project root based on previous context.
import serviceAccount from './scrbrd-beta-2-firebase-adminsdk-fbsvc-4c0a94b7bc.json'; 
import { playersData, type PlayerProfile } from './src/lib/player-data'; // Use direct import from .ts

try {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      // Type assertion for serviceAccount
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully for player migration.');
  } else {
    console.log('Firebase Admin SDK already initialized for player migration.');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK for player migration:', error);
  process.exit(1);
}

const db = admin.firestore();

async function migratePlayers() {
  console.log('Migrating player data to Firestore...');
  let successCount = 0;
  let errorCount = 0;

  if (!playersData || !Array.isArray(playersData)) {
    console.error('Players data is not available or not in the expected format. Check src/lib/player-data.ts export.');
    process.exit(1);
  }

  console.log(`Found ${playersData.length} players to migrate.`);

  for (const player of playersData) {
    try {
      const playerDocRef = db.collection('players').doc(player.id);
      
      // Create a new object, ensuring only defined fields from PlayerProfile are migrated.
      // Handle dateOfBirth transformation to Firestore Timestamp.
      const playerDocumentData: Omit<PlayerProfile, 'id' | 'dateOfBirth'> & { dateOfBirth?: Timestamp | null } = {
        name: player.name,
        teamId: player.teamId, // Use teamId
        avatar: player.avatar,
        role: player.role,
        battingStyle: player.battingStyle,
        bowlingStyle: player.bowlingStyle,
        bio: player.bio,
        stats: player.stats, // Assuming stats object is Firestore compatible
        careerSpan: player.careerSpan,
        skills: player.skills, // Assuming skills object is Firestore compatible
        dateOfBirth: player.dateOfBirth ? Timestamp.fromDate(new Date(player.dateOfBirth)) : null,
      };
      
      // Remove undefined fields to avoid Firestore errors
      Object.keys(playerDocumentData).forEach(key => {
        if ((playerDocumentData as any)[key] === undefined) {
          delete (playerDocumentData as any)[key];
        }
      });


      console.log(`Attempting to migrate player: ${player.name} (ID: ${player.id}) with data:`, JSON.stringify(playerDocumentData, null, 2));
      await playerDocRef.set(playerDocumentData);
      successCount++;
      console.log(`Successfully migrated player: ${player.name} (ID: ${player.id})`);

    } catch (error) {
      errorCount++;
      console.error(`Error migrating player ${player.name} (ID: ${player.id}):`, error);
    }
  }

  console.log('Players migration complete.');
  console.log(`Successfully migrated: ${successCount}`);
  console.log(`Failed to migrate: ${errorCount}`);
  
  if (errorCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

migratePlayers().catch(error => {
  console.error("Player migration script failed:", error);
  process.exit(1);
});
