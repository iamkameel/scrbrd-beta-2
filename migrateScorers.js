import * as admin from 'firebase-admin';
import { scorersData } from './src/lib/scorer-data';
// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            // Add other Firebase configuration if needed, e.g., databaseURL
            // databaseURL: 'https://your-project-id.firebaseio.com',
        });
    }
    catch (error) {
        console.error('Error initializing Firebase Admin SDK:', error);
        process.exit(1);
    }
}
const db = admin.firestore();
async function migrateScorers() {
    console.log('Starting scorer data migration to Firebase...');
    try {
        console.log(`Found ${scorersData.length} scorers to migrate.`);
        for (const scorerData of scorersData) {
            try {
                const scorerToMigrate = {
                    ...scorerData,
                };
                // Add scorer document to Firestore
                const scorerDocRef = db.collection('scorers').doc(scorerToMigrate.id);
                await scorerDocRef.set(scorerToMigrate);
                console.log(`Successfully migrated scorer: ${scorerToMigrate.name} (ID: ${scorerToMigrate.id})`);
            }
            catch (error) {
                console.error(`Error migrating scorer ${scorerData.name} (ID: ${scorerData.id}):`, error);
            }
        }
        console.log('Scorer data migration complete.');
    }
    catch (error) {
        console.error('Error during scorer migration:', error);
    }
}
migrateScorers();
