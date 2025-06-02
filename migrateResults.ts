import * as admin from 'firebase-admin';
import { resultsData, Result } from './src/lib/results-data';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      // Add other Firebase configuration if needed, e.g., databaseURL
      // databaseURL: 'https://your-project-id.firebaseio.com',
    });
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    process.exit(1);
  }
}

const db = admin.firestore();

async function migrateResults() {
  console.log('Starting result data migration to Firebase...');

  try {
    console.log(`Found ${resultsData.length} results to migrate.`);

    for (const resultData of resultsData) {
      try {
        // Find the corresponding fixture document reference
        const fixtureRef = db.collection('fixtures').doc(resultData.fixtureId.toString());

        // Check if the fixture exists (optional, but good practice)
        const fixtureDoc = await fixtureRef.get();
        if (!fixtureDoc.exists) {
          console.warn(`Fixture with ID ${resultData.fixtureId} not found for result ${resultData.id}. Migrating result without fixture link.`);
           // Migrate result without fixture reference if fixture not found
            const resultToMigrate: Result = {
              ...resultData,
            };
             const resultDocRef = db.collection('results').doc(resultToMigrate.id.toString());
            await resultDocRef.set(resultToMigrate);
            console.log(`Successfully migrated result: ${resultToMigrate.id} (Fixture ID: ${resultToMigrate.fixtureId})`);
            continue; // Move to the next result
        }


        // Create a new result object for Firestore, including the fixture reference
        const resultToMigrate: Result & { fixtureRef: admin.firestore.DocumentReference } = {
          ...resultData,
          // Assuming teamAId and teamBId in resultsData are just identifiers and fixtures data has the actual team links
          // We embed innings and ballEvents as planned
          innings: resultData.innings, // Embed innings data
          fixtureRef: fixtureRef, // Add reference to the fixture document
        };

        // Add result document to Firestore
        const resultDocRef = db.collection('results').doc(resultToMigrate.id.toString());
        await resultDocRef.set(resultToMigrate);
        console.log(`Successfully migrated result: ${resultToMigrate.id} (Fixture ID: ${resultToMigrate.fixtureId})`);

      } catch (error) {
        console.error(`Error migrating result ${resultData.id} (Fixture ID: ${resultData.fixtureId}):`, error);
      }
    }

    console.log('Result data migration complete.');

  } catch (error) {
    console.error('Error during result migration:', error);
  }
}

migrateResults();