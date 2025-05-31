// migrateSchools.js
const admin = require('firebase-admin');
// IMPORTANT: Replace 'YOUR_SERVICE_ACCOUNT_KEY.json' with the actual path to your downloaded Firebase Admin SDK JSON file.
// Example: const serviceAccount = require('./path/to/your/scrbrd-beta-2-firebase-adminsdk-xxxx.json');
const serviceAccount = require('./scrbrd-beta-2-firebase-adminsdk-fbsvc-4c0a94b7bc.json'); 

try {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully');
  } else {
    console.log('Firebase Admin SDK already initialized');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1);
}

const db = admin.firestore();

// Adjust the path to your schools-data.ts file if necessary
// This assumes schools-data.ts is compiled to schools-data.js or you're using ts-node
const { schoolsData } = require('./src/lib/schools-data');

async function migrateSchools() {
  console.log('Migrating schools data to Firestore...');
  let successCount = 0;
  let errorCount = 0;

  for (const school of schoolsData) {
    try {
      const schoolId = String(school.id);
      const schoolRef = db.collection('schools').doc(schoolId);

      const schoolDocumentData = {
        name: school.name,
        location: school.location,
        crestUrl: school.crestUrl,
        bannerImageUrl: school.bannerImageUrl || null,
        about: school.about || null,
        awardsAndAccolades: school.awardsAndAccolades || [],
        records: school.records || [],
        divisionId: school.divisionId || "div_placeholder", // Use from data if available
        provinceId: "province_placeholder", // Placeholder - update with actual province IDs later
        address: "address_placeholder", // Placeholder - update later
        contactEmail: "email_placeholder", // Placeholder - update later
        contactPhone: "phone_placeholder", // Placeholder - update later
        fields: school.fields || [], // Added fields
        teams: school.teams || [],   // Added teams array
        // Add original numeric ID if needed for any reason, or just use the string doc ID
        originalNumericId: school.id 
      };

      await schoolRef.set(schoolDocumentData);
      successCount++;
      console.log(`Successfully migrated school: ${school.name} (${schoolId})`);

    } catch (error) {
      errorCount++;
      console.error(`Error migrating school ${school.name}:`, error);
    }
  }

  console.log('Schools migration complete.');
  console.log(`Successfully migrated: ${successCount}`);
  console.log(`Failed to migrate: ${errorCount}`);
  
  if (errorCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

migrateSchools().catch(error => {
  console.error("Migration script failed:", error);
  process.exit(1);
});
