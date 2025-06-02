import * as admin from 'firebase-admin';
import { detailedTeamsData, Team } from './src/lib/team-data';
import { SchoolProfile } from './src/lib/schools-data';
import { PlayerProfile } from './src/lib/player-data'; // Import PlayerProfile interface
import { Division } from './src/lib/divisions-data'; // Import Division interface

// Initialize Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // Add other Firebase configuration if needed, e.g., databaseURL
    // databaseURL: 'https://your-project-id.firebaseio.com',
  });
} catch (error) {
    // Optionally, handle the error differently if it's not due to re-initialization
    // process.exit(1); // Exit if initialization failed for another reason
  }

const db = admin.firestore();

async function migrateTeams() {
  // Manually populate this map with the placeholder player IDs from detailedTeamsData
  // (e.g., "P101") as keys, and the actual Firebase Player document IDs as values.
  // You can find the Firebase Player IDs in your Firestore 'players' collection.
  const playerPlaceholderIdToFirebaseIdMap: { [key: string]: string } = {
    // Example: "P101": "actual_firebase_player_id_for_P101",
  };
  console.log('Starting team data migration to Firebase...');

  try {
    // Fetch school documents to create a mapping of school names to IDs
    const schoolsSnapshot = await db.collection('schools').get();
    const schoolNameToIdMap: { [key: string]: string } = {};
    schoolsSnapshot.forEach((doc) => {
      const schoolData = doc.data() as SchoolProfile;
      schoolNameToIdMap[schoolData.name] = doc.id;
    });

    // Fetch division documents to create a mapping of division names/IDs to IDs
    const divisionsSnapshot = await db.collection('divisions').get();
    const divisionMap: { [key: string]: string } = {};
    divisionsSnapshot.forEach((doc) => {
      divisionMap[doc.id] = doc.id; // Map division ID to document ID
      const divisionData = doc.data() as Division;
      divisionMap[divisionData.name] = doc.id; // Map division name to document ID
    });

    console.log(`Found ${detailedTeamsData.length} teams to migrate.`);

    for (const teamData of detailedTeamsData) {
      try {
        // Find the actual school ID based on the team name (assuming team name includes school name or there's a way to map)
        // This part might need adjustment based on how you can link teamData to schoolsData
        // For now, I'll attempt to find a school ID based on a rough match or placeholder logic.
        // A more robust solution would be needed if teamData doesn't directly contain info to link to schools.

        // **NOTE:** The current detailedTeamsData doesn't have a direct link to school name, only school_placeholder.
        // You will need to manually ensure your detailedTeamsData can be linked to schoolsData,
        // perhaps by adding a schoolName property or updating schoolId placeholder with actual school IDs.
        // For this script to work, I'll use a simplistic approach assuming the team name might contain
        // part of the school name or you'll manually update the schoolId in detailedTeamsData before running.

        let actualSchoolId = schoolNameToIdMap[teamData.schoolId] || null;

        // If schoolId is still a placeholder or not found, try to infer from teamName (less reliable)
        if (!actualSchoolId) {
           for (const schoolName in schoolNameToIdMap) {
               if (teamData.teamName.includes(schoolName) || teamData.id.includes(schoolNameToIdMap[schoolName])) {
                   actualSchoolId = schoolNameToIdMap[schoolName];
                   break;
               }
           }
        }


        if (!actualSchoolId) {
            console.warn(`Could not find a matching school for team ${teamData.teamName}. Skipping migration for this team.`);
            continue; // Skip this team if school ID cannot be determined
        }

        // Find the actual division ID based on age group and team name/division
        let actualDivisionId = divisionMap[teamData.divisionId]; // Try using the existing divisionId first

        if (!actualDivisionId && teamData.ageGroup && teamData.division) {
            // Construct a potential division ID or name from age group and division/team name
            const potentialDivisionIdentifier = `${teamData.ageGroup.toLowerCase()}${teamData.division.toLowerCase()}`; // Example: u16a
            actualDivisionId = divisionMap[potentialDivisionIdentifier];
             if (!actualDivisionId) {
                 actualDivisionId = divisionMap[`${teamData.ageGroup} ${teamData.division}`]; // Example: U16 A
            }
        }

        // Create a new team object for Firestore, replacing the placeholder schoolId
        const teamToMigrate: Omit<Team, 'squad'> & { schoolId: string, divisionId: string, players: admin.firestore.DocumentReference[] } = {
            id: teamData.id,
            teamName: teamData.teamName,
            schoolId: actualSchoolId, // Add the missing schoolId
            divisionId: actualDivisionId || 'unassigned_division', // Use found divisionId or a default
            ageGroup: teamData.ageGroup,
            division: teamData.division,
            mascot: teamData.mascot,
            performanceStats: teamData.performanceStats,
            players: [], // We will add player references here
            affiliation: "School Affiliation" // Add the missing affiliation property
        };

        // Add team document to Firestore
        const teamDocRef = db.collection('teams').doc(teamToMigrate.id);
        await teamDocRef.set(teamToMigrate);
        console.log(`Successfully migrated team: ${teamToMigrate.teamName} (ID: ${teamToMigrate.id})`);

        // Update player documents to link back to the team
            if (teamData.squad && teamData.squad.length > 0) {
                console.log(`Updating ${teamData.squad.length} player documents for team ${teamToMigrate.teamName}...`);
                const batch = db.batch();
                const playerRefs: admin.firestore.DocumentReference[] = [];

                for (const player of teamData.squad) {
                    const placeholderPlayerId = player.id; // Assuming player object has an 'id' field
                    const firebasePlayerId = playerPlaceholderIdToFirebaseIdMap[placeholderPlayerId];

                    if (firebasePlayerId) {
                        const playerDocRef = db.collection('players').doc(firebasePlayerId);
                        batch.update(playerDocRef, {
                            teamId: teamToMigrate.id,
                            teamRef: teamDocRef // Add a reference to the team document
                        });
                        playerRefs.push(playerDocRef);
                        console.log(`Successfully matched player with placeholder ID "${placeholderPlayerId}" to Firebase ID "${firebasePlayerId}".`);
                    } else {
                        console.warn(`Could not find a Firebase ID mapping for placeholder player ID "${placeholderPlayerId}" from team "${teamToMigrate.teamName}". Skipping linking for this player.`);
                    }
                }

                // Only commit the batch if there are players to update
                if (playerRefs.length > 0) {
                  try {
                    await batch.commit();
                    console.log(`Successfully committed batch update for players for team: ${teamToMigrate.teamName}`);
                  } catch (batchError: any) {
                    console.error(`Error committing batch update for team ${teamToMigrate.teamName}:`, batchError);
                    // Depending on your needs, you might want to throw the error
                    // throw batchError;
                  }
                } else {
                  console.log(`No players found with valid Firebase IDs for team ${teamToMigrate.teamName}. No batch update needed.`);
                }
            } else {
                console.log(`Team ${teamToMigrate.teamName} has no players in the squad data. Skipping player document updates.`);
            }
          } catch (error: any) { // Explicitly type error
            console.error(`Error migrating team ${teamData.teamName} (ID: ${teamData.id}):`, error);
          }
    }
  } catch (error: any) {
    // Catch any errors during the initial fetch of schools or the overall migration loop
    console.error('Error during team migration process:', error);
  }
}

migrateTeams();