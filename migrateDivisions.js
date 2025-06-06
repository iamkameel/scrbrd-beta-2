import * as admin from 'firebase-admin';
import { divisionsData } from './src/lib/divisions-data';
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
async function migrateDivisions() {
    console.log('Starting division data migration to Firebase...');
    try {
        console.log(`Found ${divisionsData.length} divisions to migrate.`);
        for (const divisionData of divisionsData) {
            try {
                const divisionToMigrate = {
                    ...divisionData,
                };
                // Add division document to Firestore
                const divisionDocRef = db.collection('divisions').doc(divisionToMigrate.id);
                await divisionDocRef.set(divisionToMigrate);
                console.log(`Successfully migrated division: ${divisionToMigrate.name} (ID: ${divisionToMigrate.id})`);
            }
            catch (error) {
                console.error(`Error migrating division ${divisionData.name} (ID: ${divisionData.id}):`, error);
            }
        }
        console.log('Division data migration complete.');
    }
    catch (error) {
        console.error('Error during division migration:', error);
    }
}
migrateDivisions();
