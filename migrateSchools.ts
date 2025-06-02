// This is a placeholder for the migrateSchools script.
// It was previously showing an error message related to src/app/players/page.tsx.

import * as admin from 'firebase-admin';
import { schoolsData, SchoolProfile } from './src/lib/schools-data'; // Adjust the path if necessary

// Initialize Firebase Admin if not already done
if (admin.apps.length === 0) {
  const serviceAccount = require('./scrbrd-beta-2-firebase-adminsdk-fbsvc-4c0a94b7bc.json'); // Replace with your actual service account key path
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function main() {
  console.log("Starting school data migration to Firebase...");
  console.log(`Found ${schoolsData.length} schools to migrate.`);

  const schoolsCollectionRef = db.collection('schools');

  for (const school of schoolsData) {
    try {
      await schoolsCollectionRef.doc(String(school.id)).set(school);
      console.log(`Successfully migrated school: ${school.name} (ID: ${school.id})`);
    } catch (error) {
      console.error(`Error migrating school ${school.name} (ID: ${school.id}):`, error);
    }
  }

  console.log("School data migration complete.");
  process.exit(0);
  // } catch (error) {
  //   console.error("Error during school migration placeholder:", error);
  //   process.exit(1);
  // }
}

main().catch(error => {
  console.error("migrateSchools.ts script failed:", error);
  process.exit(1);
});

export {}; // Ensures this file is treated as a module.
