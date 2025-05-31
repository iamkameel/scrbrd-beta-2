
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { parse } from 'date-fns';
import { fixtures as sourceFixtures } from './src/lib/fixtures-data'; // Adjust the path if necessary

// Initialize Firebase Admin SDK
// Make sure your GOOGLE_APPLICATION_CREDENTIALS environment variable is set,
// or you are running this in an environment where it's auto-configured (e.g., Firebase Functions, Cloud Run).
try {
  if (admin.apps.length === 0) {
    admin.initializeApp();
    console.log('Firebase Admin SDK initialized successfully');
  } else {
    console.log('Firebase Admin SDK already initialized');
  }
} catch (error: any) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1); // Exit if initialization fails
}

const db = admin.firestore();

const importFixtures = async () => {
  const collectionRef = db.collection('fixtures');
  let successCount = 0;
  let errorCount = 0;

  console.log(`Starting import of ${sourceFixtures.length} fixtures...`);

  for (const sourceFixture of sourceFixtures) {
    try {
      const fixtureId = sourceFixture.id.toString();

      // Combine date and time and parse into a Date object
      let scheduledDateTime;
      try {
        // Attempt to parse common time formats, be mindful of locale if AM/PM is used without full date context elsewhere
        const dateTimeString = `${sourceFixture.date} ${sourceFixture.time}`;
        // Supported formats by date-fns parse: https://date-fns.org/v2.28.0/docs/parse
        // Common formats: 'yyyy-MM-dd HH:mm', 'yyyy-MM-dd h:mm a'
        // Assuming time is in "10:00 AM" format, so 'h:mm a' or 'HH:mm' if 24hr
        // Let's try to be flexible or standardize the time format in fixtures-data.ts
        // For "10:00 AM" format:
        let parsedDate = parse(dateTimeString, 'yyyy-MM-dd hh:mm a', new Date());
        if (isNaN(parsedDate.getTime())) {
           // Try 24-hour format if AM/PM parsing failed
           parsedDate = parse(dateTimeString, 'yyyy-MM-dd HH:mm', new Date());
        }

        if (isNaN(parsedDate.getTime())) {
          console.warn(`Could not parse date/time for fixture ID ${fixtureId}: ${dateTimeString}. Skipping timestamp.`);
          scheduledDateTime = null;
        } else {
          scheduledDateTime = Timestamp.fromDate(parsedDate);
        }
      } catch (e) {
        console.warn(`Error parsing date/time for fixture ID ${fixtureId}: ${sourceFixture.date} ${sourceFixture.time}. Error: ${e}`);
        scheduledDateTime = null;
      }

      const fixtureData = {
        fixtureId: fixtureId,
        homeTeamId: sourceFixture.teamAId, // Mapping teamAId to homeTeamId
        awayTeamId: sourceFixture.teamBId, // Mapping teamBId to awayTeamId
        matchType: 'T20', // Defaulting as it's not in sourceFixtures
        venueId: sourceFixture.location, // Using location as venueId (field name)
        scheduledDate: scheduledDateTime,
        overs: 20, // Defaulting for T20
        ageGroup: 'Open', // Defaulting as it's not in sourceFixtures
        status: sourceFixture.status,
        transportId: null, // Optional, not in source
        createdBy: 'system_import_script', // Placeholder
        umpireIds: sourceFixture.umpires || [],
        scorerId: (sourceFixture.scorers && sourceFixture.scorers.length > 0) ? sourceFixture.scorers[0] : null, // Taking first scorer
        groundkeeperId: null, // Optional, not in source
        toss: null, // Optional, not in source
        // Add any other fields from your target schema with defaults or null
        createdAt: Timestamp.now(),
        time: sourceFixture.time, // Keep original time string if needed for display, or rely on formatting Timestamp
      };

      await collectionRef.doc(fixtureId).set(fixtureData);
      successCount++;
      console.log(`Successfully imported fixture with ID: ${fixtureId}`);
    } catch (error) {
      errorCount++;
      console.error(`Error importing fixture with ID ${sourceFixture.id}:`, error);
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
