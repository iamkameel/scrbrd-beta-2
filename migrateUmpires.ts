import * as admin from 'firebase-admin';
import { umpiresData, UmpireProfile } from './src/lib/umpire-data';

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

async function migrateUmpires() {
  console.log('Starting umpire data migration to Firebase...');

  try {
    console.log(`Found ${umpiresData.length} umpires to migrate.`);

    for (const umpireData of umpiresData) {
      try {
        const umpireToMigrate: UmpireProfile = {
          ...umpireData,
        };

        // Add umpire document to Firestore
        const umpireDocRef = db.collection('umpires').doc(umpireToMigrate.id);
        await umpireDocRef.set(umpireToMigrate);
        console.log(`Successfully migrated umpire: ${umpireToMigrate.name} (ID: ${umpireToMigrate.id})`);

      } catch (error) {
        console.error(`Error migrating umpire ${umpireData.name} (ID: ${umpireData.id}):`, error);
      }
    }

    console.log('Umpire data migration complete.');

  } catch (error) {
    console.error('Error during umpire migration:', error);
  }
}

migrateUmpires();