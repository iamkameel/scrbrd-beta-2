import * as admin from 'firebase-admin';
import { fixtures, Fixture } from './src/lib/fixtures-data';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      // @ts-ignore
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

async function getSchoolNameToIdMap(): Promise<{ [key: string]: string }> {
  const schoolsSnapshot = await db.collection('schools').get();
  const schoolNameToIdMap: { [key: string]: string } = {};
  schoolsSnapshot.forEach((doc) => {
    // Assuming school documents have a 'name' field
    const schoolData = doc.data();
    if (schoolData && schoolData.name) {
      schoolNameToIdMap[schoolData.name] = doc.id;
    }
  });
  return schoolNameToIdMap;
}

let schoolNameToIdMapCache: { [key: string]: string } | null = null;

async function getTeamId(teamIdentifier: string): Promise<string | null> {
  // Attempt to parse the teamIdentifier string.
  // Assuming format like "team_[schoolIdentifier]_[teamIdentifier]"
  const parts = teamIdentifier.split('_');
  if (parts.length < 3 || parts[0].toLowerCase() !== 'team') {
    console.warn(`Could not parse team identifier format: ${teamIdentifier}`);
    return null;
  }

  const schoolIdentifier = parts[1].toLowerCase(); // Use lower case for matching
  const teamNameIdentifier = parts.slice(2).join('_'); // Join the rest in case team name has underscores

   if (!schoolNameToIdMapCache) {
       schoolNameToIdMapCache = await getSchoolNameToIdMap();
   }

  const schoolId = schoolNameToIdMapCache[schoolIdentifier] || null;

  if (!schoolId) {
      console.warn(`Could not find a matching school ID for identifier: ${schoolIdentifier}`);
      return null;
  }

  try {
    // Query the 'teams' collection to find a matching team
    const teamsSnapshot = await db.collection('teams')
      .where('schoolId', '==', schoolId) // Use the actual Firebase school ID
      .where('teamName', '==', teamNameIdentifier) // Assuming teamName matches the identifier
      .limit(1) // Assuming there's only one team matching this
        .get();

    if (teamsSnapshot.empty) {
       console.warn(`No matching team found in Firestore for school ID "${schoolId}" and team name "${teamNameIdentifier}" (identifier: ${teamIdentifier})`);
       return null;
    }

    const teamDoc = teamsSnapshot.docs[0];
    console.log(`Dynamically linked team identifier "${teamIdentifier}" to team document with ID: ${teamDoc.id}`);
    return teamDoc.id;

  } catch (error) {
    console.error(`Error dynamically linking team identifier ${teamIdentifier}:`, error);
    return null;
  }
}


async function migrateFixtures() {
  console.log('Starting fixture data migration to Firebase...');

  try {
    console.log(`Found ${fixtures.length} fixtures to migrate.`);

    // Pre-fetch school name to ID map
    schoolNameToIdMapCache = await getSchoolNameToIdMap();

    for (const fixtureData of fixtures) {
      try {
        // Dynamically link teamAId and teamBId to actual team document IDs
        const teamA_firebaseId = await getTeamId(fixtureData.teamAId);
        const teamB_firebaseId = await getTeamId(fixtureData.teamBId);

        if (!teamA_firebaseId || !teamB_firebaseId) {
          console.warn(`Skipping migration for fixture ${fixtureData.id} due to unfound team IDs: ${fixtureData.teamAId}, ${fixtureData.teamBId}`);
          continue; // Skip this fixture if team IDs cannot be resolved
        }

        // Create a new fixture object for Firestore, using linked team IDs
        const fixtureToMigrate = {
          ...fixtureData,
          teamAId: teamA_firebaseId, // Use the actual Firebase team ID
          teamBId: teamB_firebaseId, // Use the actual Firebase team ID
          // We are embedding umpires and scorers names for now as per previous files,
          // linking by ID would require name-to-ID mapping which can be complex
          // umpires: fixtureData.umpires,
          // scorers: fixtureData.scorers,
          // location is kept as string for now
          // location: fixtureData.location,
        };

        // Add fixture document to Firestore
        const fixtureDocRef = db.collection('fixtures').doc(fixtureToMigrate.id.toString()); // Use ID as string
        await fixtureDocRef.set(fixtureToMigrate);
        console.log(`Successfully migrated fixture: ${fixtureToMigrate.id}`);

      } catch (error) {
        console.error(`Error migrating fixture ${fixtureData.id}:`, error);
      }
    }

    console.log('Fixture data migration complete.');

  } catch (error) {
    console.error('Error during fixture migration:', error);
  }
}

migrateFixtures();