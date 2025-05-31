
// migratePlayers.js
// Updated to be migratePlayers.ts and use ESM syntax if possible, or keep as JS if easier for user's setup.
// For simplicity with user's current setup (node migrateSchools.js), keeping as JS.
const admin = require('firebase-admin');
// IMPORTANT: Replace with the actual path to your downloaded Firebase Admin SDK JSON file.
const serviceAccount = require('./scrbrd-beta-2-firebase-adminsdk-fbsvc-4c0a94b7bc.json'); 

try {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
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

// Adjust the path if your schools-data.js is in a different location or structure
// This assumes playersData is exported from the compiled JS version of player-data.ts
// If using ts-node, this path can be direct to the .ts file.
// For a simple node execution, we'll assume player-data.js exists in lib
const { playersData } = require('./src/lib/player-data.js'); // Assuming player-data.ts is compiled to player-data.js

async function migratePlayers() {
  console.log('Migrating player data to Firestore...');
  let successCount = 0;
  let errorCount = 0;

  if (!playersData || !Array.isArray(playersData)) {
    console.error('Players data is not available or not in the expected format. Check src/lib/player-data.js export.');
    process.exit(1);
  }

  for (const player of playersData) {
    try {
      // Use the player.id (e.g., "player-1") as the document ID in Firestore
      const playerDocRef = db.collection('players').doc(player.id);
      
      // Create a new object to ensure we only migrate intended fields
      // and to handle any transformations if needed in the future.
      // For now, it's a direct mapping.
      const playerDocumentData = {
        ...player
        // If dateOfBirth needs to be a Timestamp:
        // dateOfBirth: player.dateOfBirth ? admin.firestore.Timestamp.fromDate(new Date(player.dateOfBirth)) : null,
      };

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
