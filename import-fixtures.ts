import * as admin from 'firebase-admin';
import { fixtures } from './src/lib/fixtures-data'; // Adjust the path if necessary

// Initialize Firebase Admin SDK
// Make sure your GOOGLE_APPLICATION_CREDENTIALS environment variable is set
try {
  admin.initializeApp();
  console.log('Firebase Admin SDK initialized successfully');
} catch (error: any) {
  if (error.code === 'app/duplicate-app') {
    console.log('Firebase Admin SDK already initialized');
  } else {
    console.error('Error initializing Firebase Admin SDK:', error);
    process.exit(1); // Exit if initialization fails
  }
}


const db = admin.firestore();

const importFixtures = async () => {
  const collectionRef = db.collection('fixtures');
  let successCount = 0;
  let errorCount = 0;

  console.log(`Starting import of ${fixtures.length} fixtures...`);

  for (const fixture of fixtures) {
    try {
      // You can use fixture.id as the document ID if it's unique and suitable
      // await collectionRef.doc(fixture.id.toString()).set(fixture);

      // Or let Firestore generate an automatic ID
      await collectionRef.add(fixture);
      successCount++;
      console.log(`Successfully added fixture with ID: ${fixture.id}`);
    } catch (error) {
      errorCount++;
      console.error(`Error adding fixture with ID ${fixture.id}:`, error);
    }
  }

  console.log('Import complete.');
  console.log(`Successful imports: ${successCount}`);
  console.log(`Failed imports: ${errorCount}`);

  if (errorCount > 0) {
    process.exit(1); // Exit with an error code if there were failures
  } else {
    process.exit(0); // Exit successfully
  }
};

importFixtures();