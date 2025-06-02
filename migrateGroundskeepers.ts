import * as admin from 'firebase-admin';
import { groundkeepersData, GroundskeeperProfile } from './src/lib/groundskeeper-data';

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

async function migrateGroundskeepers() {
  console.log('Starting groundskeeper data migration to Firebase...');

  try {
    console.log(`Found ${groundkeepersData.length} groundskeepers to migrate.`);

    for (const groundskeeperData of groundkeepersData) {
      try {
        const groundskeeperToMigrate: GroundskeeperProfile = {
          ...groundskeeperData,
        };

        // Add groundskeeper document to Firestore
        const groundskeeperDocRef = db.collection('groundskeepers').doc(groundskeeperToMigrate.id);
        await groundskeeperDocRef.set(groundskeeperToMigrate);
        console.log(`Successfully migrated groundskeeper: ${groundskeeperToMigrate.name} (ID: ${groundskeeperToMigrate.id})`);

      } catch (error) {
        console.error(`Error migrating groundskeeper ${groundskeeperData.name} (ID: ${groundskeeperData.id}):`, error);
      }
    }

    console.log('Groundskeeper data migration complete.');

  } catch (error) {
    console.error('Error during groundskeeper migration:', error);
  }
}

migrateGroundskeepers();