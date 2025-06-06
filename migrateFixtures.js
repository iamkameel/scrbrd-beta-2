import * as admin from 'firebase-admin';
import { fixtures } from './src/lib/fixtures-data';
// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            // @ts-ignore
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
let schoolNameToIdMapCache = null; // Cache for school name to ID mapping
async function getSchoolNameToIdMap() {
    if (schoolNameToIdMapCache !== null) {
        return schoolNameToIdMapCache;
    }
    try {
        const snapshot = await db.collection('schools').get();
        schoolNameToIdMapCache = new Map();
        snapshot.forEach((doc) => {
            // Assuming school documents have a 'name' field
            const schoolData = doc.data();
            if (schoolData && typeof schoolData.name === 'string') {
                // Store the school name in lower case and a derived identifier
                schoolNameToIdMapCache.set(schoolData.name.toLowerCase(), doc.id);
            }
        });
        return schoolNameToIdMapCache;
    }
    catch (error) {
        console.error("Error fetching schools for map:", error);
        return null; // Return null if fetching schools fails
    }
}
async function getTeamId(teamIdentifier) {
    const parts = teamIdentifier.split('_');
    if (parts.length < 3 || parts[0].toLowerCase() !== 'team') {
        console.warn(`Could not parse team identifier format: ${teamIdentifier}`);
        return null;
    }
    // Extract the school identifier (second part) and team name identifier (remaining parts)
    const schoolIdentifier = parts[1].toLowerCase();
    const teamNameIdentifier = parts.slice(2).join('_').toLowerCase();
    const schoolMap = await getSchoolNameToIdMap();
    if (!schoolMap) {
        console.error("School name to ID map is not available.");
        return null;
    }
    // Attempt to find school by direct identifier match
    let schoolId = null;
    const directMatch = schoolMap.get(schoolIdentifier);
    if (directMatch) {
        schoolId = directMatch;
    }
    else {
        // If direct match fails, try to find a school whose name contains the identifier
        console.log(`Attempting partial match for school identifier: ${schoolIdentifier}`);
        // Filter for schools where the name starts with or contains the schoolIdentifier
        const potentialMatches = Array.from(schoolMap.entries()).filter(([schoolName, id]) => schoolName.includes(schoolIdentifier));
        if (potentialMatches.length > 0) {
            // Assuming the first partial match is sufficient, or add more complex logic here
            schoolId = potentialMatches[0][1];
            console.log(`Found partial school match: "${potentialMatches[0][0]}" (ID: ${schoolId}) for identifier "${schoolIdentifier}"`);
        }
        else {
            console.warn(`Could not find a matching school ID for identifier: ${schoolIdentifier}`);
            return null;
        }
    }
    if (schoolId) {
        try {
            // Fetch the school document to get the teams array
            const schoolDoc = await db.collection('schools').doc(schoolId).get();
            const schoolData = schoolDoc.data();
            const availableTeamNames = [];
            // Check if the school document exists and has a 'teams' array
            if (schoolData && Array.isArray(schoolData.teams)) {
                // Collect available team names for logging and find a match
                let matchingTeam = null;
                for (const team of schoolData.teams) {
                    if (team && typeof team.name === 'string') {
                        availableTeamNames.push(team.name);
                        const teamName = team.name.toLowerCase();
                        console.log(`Checking team "${team.name}" against identifier "${teamNameIdentifier}"`);
                        // Case-insensitive exact match
                        if (teamName === teamNameIdentifier) {
                            matchingTeam = team;
                            break; // Found a match, no need to continue the loop
                        }
                    }
                }
                console.warn(`No matching team found in Firestore for school ID "${schoolId}" and team name "${teamNameIdentifier}" (identifier: ${teamIdentifier}). Available team names: ${availableTeamNames.join(', ')}`);
                return null; // Team not found within the school
            }
            // If the school document doesn't exist or doesn't have a teams array
            console.warn(`School document with ID "${schoolId}" not found or does not contain a 'teams' array.`);
            return null;
        }
        catch (error) {
            console.error(`Error dynamically linking team identifier ${teamIdentifier}:`, error);
            return null;
        }
    }
    // This return is reached if schoolId is null after lookup
    return null; // Should have been handled in the school lookup
}
async function migrateFixtures() {
    console.log('Starting fixture data migration to Firebase...');
    console.log(`Found ${fixtures.length} fixtures to migrate.`);
    // Ensure school map is loaded before processing fixtures
    await getSchoolNameToIdMap();
    for (const fixtureData of fixtures) {
        try {
            // Dynamically link teamAId and teamBId to actual team document IDs
            const teamA_firebaseId = await getTeamId(fixtureData.teamAId);
            const teamB_firebaseId = await getTeamId(fixtureData.teamBId);
            if (!teamA_firebaseId || !teamB_firebaseId) { // Check if both teams were found
                console.warn(`Skipping migration for fixture ${fixtureData.id} due to unfound team IDs: ${fixtureData.teamAId}, ${fixtureData.teamBId}`);
                continue; // Skip this fixture if team IDs cannot be resolved
            }
            // Create a new fixture object for Firestore, using linked team IDs
            const fixtureToMigrate = {
                ...fixtureData,
                teamAId: teamA_firebaseId, // Use the actual Firebase team ID
                teamBId: teamB_firebaseId, // Use the actual Firebase team ID
            };
            // Add fixture document to Firestore
            const fixtureDocRef = db.collection('fixtures').doc(fixtureToMigrate.id.toString()); // Use ID as string
            await fixtureDocRef.set(fixtureToMigrate);
            console.log(`Successfully migrated fixture: ${fixtureToMigrate.id}`);
        }
        catch (error) {
            console.error(`Error migrating fixture ${fixtureData.id}:`, error);
        }
    }
    console.log('Fixture data migration complete.');
}
migrateFixtures();
