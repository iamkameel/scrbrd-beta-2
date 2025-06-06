import pkg from 'firebase-admin';
import serviceAccount from './scrbrd-beta-2-firebase-adminsdk-fbsvc-4c0a94b7bc.json' assert { type: 'json' };
import { getFirestore } from 'firebase-admin/firestore';

const { initializeApp, credential, apps } = pkg;

// Initialize Firebase Admin if not already done
if (apps.length === 0) {
 initializeApp({
    credential: credential.cert(serviceAccount),
  });
}
const fieldsData = [
  { fieldName: "Northwood Main Oval", location: "Northwood School", conditionNotes: "Excellent condition, well-drained." },
  { fieldName: "Knights Field B", location: "Northwood School", conditionNotes: "Good for practice sessions." },
  { fieldName: "Hilton College Main Field", location: "Hilton College" },
  { fieldName: "Weightman-Smith Oval", location: "Hilton College", conditionNotes: "Currently undergoing minor aeration." },
  { fieldName: "Kingsmead Stadium (Contract)", location: "Durban" },
  { fieldName: "Chatsworth Oval (Consultant)", location: "Chatsworth" },
  { fieldName: "All Westville Boys' High Fields", location: "Westville Boys' High School" },
  { fieldName: "Hillcrest College Green", location: "Hillcrest College" },
  { fieldName: "City Stadium", location: "City Council" },
  { fieldName: "Michaelhouse Oval", location: "Michaelhouse School" },
  { fieldName: "Academy Ground", location: "Panthers Academy" },
  { fieldName: "Training Pitches", location: "Panthers Academy" },
  { fieldName: "DHS Memorial Ground", location: "DHS" },
  { fieldName: "Kearsney AH Smith Oval", location: "Kearsney College" },
  { fieldName: "Clifton Riverside", location: "Clifton School" },
  { fieldName: "Goldstones", location: "Maritzburg College" }
];

// Function to create a valid Firestore document ID
const createDocumentId = (fieldName, location) => {
    // Combine fieldName and location and replace invalid characters with underscores
    const combined = `${fieldName}-${location}`;
    return combined.replace(/[^a-zA-Z0-9_-]/g, '_');
};

async function migrateFields() {
  console.log("Starting field data migration to Firestore...");
  console.log(`Found ${fieldsData.length} fields to migrate.`);

  const fieldsCollectionRef = db.collection('fields');

  for (const field of fieldsData) {
    const docId = createDocumentId(field.fieldName, field.location);
    try {
      await fieldsCollectionRef.doc(docId).set(field);
      console.log(`Successfully migrated field: ${field.fieldName} at ${field.location} (ID: ${docId})`);
    } catch (error) {
      console.error(`Error migrating field ${field.fieldName} at ${field.location} (ID: ${docId}):`, error);
    }
  }

  console.log("Field data migration complete.");
  process.exit(0);
}

const db = getFirestore();

migrateFields().catch(error => {
  console.error("migrateFieldsScript.js script failed:", error);
  process.exit(1);
});

export {};