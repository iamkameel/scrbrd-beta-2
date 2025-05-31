// migrateSchools.js
const admin = require('firebase-admin');
const serviceAccount = require('./home/user/studio/scrbrd-beta-2-firebase-adminsdk-fbsvc-4c0a94b7bc.json'); // <== IMPORTANT: Replace with the actual name of your downloaded JSON file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // databaseURL: 'YOUR_DATABASE_URL' // Optional: if you're using Realtime Database as well
});

const db = admin.firestore();

// Adjust the path to your schools-data.ts file if necessary
// You might need to compile your TypeScript to JavaScript first or use a tool like ts-node
// For simplicity, let's assume you can directly require it for now.
const { schoolsData } = require('./src/lib/schools-data');

async function migrateSchools() {
  console.log('Migrating schools data to Firestore...');

  for (const school of schoolsData) {
    try {
      // Convert number ID to string for consistency with ER diagram and Firestore practices
      const schoolId = String(school.id);
      const schoolRef = db.collection('schools').doc(schoolId);

      const schoolData = {
        name: school.name,
        location: school.location,
        crestUrl: school.crestUrl,
        bannerImageUrl: school.bannerImageUrl || null, // Use null for optional fields if not present
        about: school.about || null,
        awardsAndAccolades: school.awardsAndAccolades || [],
        records: school.records || [],
        divisionId: "div_placeholder", // Placeholder - update with actual division IDs later
        provinceId: "province_placeholder", // Placeholder - update with actual province IDs later
        address: "address_placeholder", // Placeholder - update later
        contactEmail: "email_placeholder", // Placeholder - update later
        contactPhone: "phone_placeholder", // Placeholder - update later
      };

      await schoolRef.set(schoolData); // Use set() to specify the document ID

      console.log(`Successfully migrated school: ${school.name} (${schoolId})`);

    } catch (error) {
      console.error(`Error migrating school ${school.name}:`, error);
    }
  }

  console.log('Schools migration complete.');
}

migrateSchools().catch(console.error);
