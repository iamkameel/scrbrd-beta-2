
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { schoolsData, type SchoolProfile, type SchoolTeam } from '@/lib/schools-data';
import type { PlayerProfile, PlayerStats } from '@/lib/player-data';

// IMPORTANT: Replace with the actual path to your downloaded Firebase Admin SDK JSON file if needed.
const serviceAccountPath = './scrbrd-beta-2-firebase-adminsdk-fbsvc-4c0a94b7bc.json';
import serviceAccount from './scrbrd-beta-2-firebase-adminsdk-fbsvc-4c0a94b7bc.json';

console.log("----------------------------------------------------");
console.log("--- Starting Player Data Migration Script (migratePlayers.ts) ---");
console.log(`Attempting to load service account from: ${serviceAccountPath}`);
console.log("----------------------------------------------------\n");

try {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully for player generation.');
  } else {
    console.log('Firebase Admin SDK already initialized for player generation.');
  }
} catch (error) {
  console.error('CRITICAL: Error initializing Firebase Admin SDK for player generation:', error);
  process.exit(1);
}

const db = admin.firestore();

const roles = ["Batsman", "Bowler", "All-rounder", "Wicket-keeper", "Opening Batsman", "Middle-order Batsman", "Fast Bowler", "Spinner"];
const battingStyles = ["Right-hand bat", "Left-hand bat"];
const bowlingStyles = ["Right-arm fast", "Left-arm fast", "Right-arm medium", "Left-arm medium", "Right-arm off-spin", "Right-arm leg-spin", "Left-arm orthodox", "Left-arm chinaman"];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Elizabeth", "William", "Linda", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Charles", "Christopher", "Sarah", "Daniel", "Karen", "Matthew", "Nancy", "Anthony", "Lisa", "Donald", "Betty", "Paul", "Margaret", "Liam", "Olivia", "Noah", "Emma", "Oliver", "Ava", "Elijah", "Sophia", "Lucas", "Isabella", "Mason", "Mia", "Logan", "Amelia", "Ethan", "Harper", "Aiden", "Evelyn"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Green", "Adams", "Baker", "Nelson"];

const generatedFullNames = new Set<string>();

function generateUniqueFullName(): { firstName: string, lastName: string } {
  let fullName: string;
  let firstName: string = '';
  let lastName: string = '';
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 50) { // Limit attempts to prevent infinite loop with small name pools
    firstName = getRandomElement(firstNames);
    lastName = getRandomElement(lastNames);
    fullName = `${firstName} ${lastName}`;

    if (!generatedFullNames.has(fullName)) {
      generatedFullNames.add(fullName);
      isUnique = true;
    }
    attempts++;
  }
  if (!isUnique) { // Fallback if unique name not found after attempts
    console.warn("Could not generate a unique name after several attempts, using a suffixed name.");
    return { firstName, lastName: `${lastName}${getRandomInt(1,99)}` };
  }
  return { firstName, lastName };
}

function generatePlayerStats(): PlayerStats {
  return {
    matchesPlayed: getRandomInt(5, 20),
    runs: getRandomInt(50, 500),
    average: parseFloat((Math.random() * 30 + 10).toFixed(2)),
    strikeRate: parseFloat((Math.random() * 50 + 70).toFixed(2)),
    highestScore: { value: `${getRandomInt(20, 100)}${Math.random() > 0.8 ? '*' : ''}` },
    wickets: getRandomInt(0, 30),
    bowlingAverage: parseFloat((Math.random() * 30 + 15).toFixed(2)),
    economyRate: parseFloat((Math.random() * 5 + 3).toFixed(2)),
    bestBowling: { value: `${getRandomInt(1,5)}/${getRandomInt(10,50)}`},
    catches: getRandomInt(1, 10),
  };
}

function generateRandomDateOfBirth(): Timestamp {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - getRandomInt(14, 18); // Ages 14 to 18
    const birthMonth = getRandomInt(0, 11); // 0 for January, 11 for December
    const birthDay = getRandomInt(1, 28); // Simplified to avoid month length issues
    return Timestamp.fromDate(new Date(birthYear, birthMonth, birthDay));
}

async function generateSchoolSquads() {
  console.log('\nStarting generation of placeholder player data for school squads...');
  let totalPlayersGenerated = 0;
  let totalErrorsGeneratingPlayers = 0;
  let schoolsProcessedCount = 0;
  let schoolsSkippedDueToMissingTeam = 0;

  if (!schoolsData || !Array.isArray(schoolsData) || schoolsData.length === 0) {
    console.error('CRITICAL: Schools data is not available, not an array, or is empty. Check src/lib/schools-data.ts export.');
    console.error('No players will be generated.');
    process.exit(1);
  }

  console.log(`Found ${schoolsData.length} schools to process from @/lib/schools-data.ts.`);
  if (schoolsData.length > 0) {
    console.log(`First school data sample: ${JSON.stringify(schoolsData[0], null, 2)}`);
  }

  for (const school of schoolsData) {
    console.log(`\n--- Processing school: ${school.name} (ID: ${school.id}) ---`);
    schoolsProcessedCount++;

    if (!school.teams || school.teams.length === 0) {
      console.warn(`  WARNING: School ${school.name} has no 'teams' array or it's empty. Skipping player generation.`);
      schoolsSkippedDueToMissingTeam++;
      continue;
    }
    
    let primaryTeam: SchoolTeam | undefined = school.teams.find(t => t.name.toLowerCase().includes("1st xi"));
    
    if (!primaryTeam) {
      primaryTeam = school.teams[0]; // Default to the first team if "1st XI" not found
      console.log(`  No "1st XI" found for ${school.name}, defaulting to first team: ${primaryTeam.name} (ID: ${primaryTeam.id})`);
    }

    // Robust check for primaryTeam and its id before using it
    if (!primaryTeam || !primaryTeam.id) {
      console.warn(`  CRITICAL SKIP: School ${school.name} (ID: ${school.id}). Could not determine a primary team with a valid ID.`);
      console.warn(`  Ensure 'teams' array in 'schools-data.ts' for this school has at least one team object with an 'id' property.`);
      console.warn(`  Example team entry: { id: "schoolName_1stXI", name: "1st XI" }`);
      schoolsSkippedDueToMissingTeam++;
      continue;
    }

    // If we reach here, primaryTeam and primaryTeam.id are guaranteed to be defined.
    const primaryTeamId = primaryTeam.id; // This should now be safe from TS2461.

    console.log(`  Generating players for team: ${primaryTeam.name} (Team ID: ${primaryTeamId})`);
    generatedFullNames.clear(); // Clear for each new team to allow name reuse across different teams

    const playersPerTeam = 12; // Generate a squad of 12 for the primary team
    for (let i = 1; i <= playersPerTeam; i++) {
      const { firstName, lastName } = generateUniqueFullName();
      const playerName = `${firstName} ${lastName}`;
      const playerDocRef = db.collection('players').doc(); // Auto-generate Firestore document ID
      const playerRole = roles[i % roles.length]; // Cycle through roles for variety

      const playerData: Omit<PlayerProfile, 'id'> = {
        name: playerName,
        teamId: primaryTeamId, // Assign to the school's primary team ID
        avatar: `https://placehold.co/100x100.png`, // Placeholder avatar
        role: playerRole,
        battingStyle: getRandomElement(battingStyles),
        bowlingStyle: playerRole.toLowerCase().includes("bowler") || playerRole.toLowerCase().includes("all-rounder") ? getRandomElement(bowlingStyles) : "N/A",
        bio: `Placeholder bio for ${playerName}, a dedicated member of ${school.name}'s ${primaryTeam.name}.`,
        stats: generatePlayerStats(), // Generate random placeholder stats
        careerSpan: "Current School Season",
        dateOfBirth: generateRandomDateOfBirth().toDate().toISOString().split('T')[0], // Format as YYYY-MM-DD string
        skills: {}, // Empty skills object for now, to be potentially filled by AI
      };
      
      // Convert dateOfBirth string back to Timestamp for Firestore
      const playerDocumentData = {
        ...playerData,
        dateOfBirth: playerData.dateOfBirth ? Timestamp.fromDate(new Date(playerData.dateOfBirth)) : null,
      };

      try {
        // console.log(`    Attempting to generate player: ${playerName} (Doc ID: ${playerDocRef.id}) for team ID: ${primaryTeamId}`);
        // if (i === 1) { // Log first player data for each school
        //   console.log(`    Sample player data for ${playerName}: ${JSON.stringify(playerDocumentData, null, 2)}`);
        // }
        await playerDocRef.set(playerDocumentData);
        totalPlayersGenerated++;
        // console.log(`    Successfully generated player: ${playerName} with Firestore ID: ${playerDocRef.id}`);
      } catch (error) {
        totalErrorsGeneratingPlayers++;
        console.error(`    ERROR generating player ${playerName} (Attempted Doc ID: ${playerDocRef.id}):`, error);
      }
    }
    console.log(`  Finished generating players for ${school.name} - ${primaryTeam.name}. Players generated: ${playersPerTeam}`);
  }

  console.log('\n--- Player Data Generation Script Summary ---');
  console.log(`Schools Processed: ${schoolsProcessedCount}`);
  console.log(`Schools Skipped (No Valid Team ID): ${schoolsSkippedDueToMissingTeam}`);
  console.log(`Total Players Successfully Generated: ${totalPlayersGenerated}`);
  console.log(`Total Errors During Player Generation: ${totalErrorsGeneratingPlayers}`);
  console.log("-------------------------------------------\n");


  if (totalErrorsGeneratingPlayers > 0 || schoolsSkippedDueToMissingTeam > 0) {
    console.warn("Script finished with some issues. Please review logs.");
    process.exit(1); // Exit with error if any player generation failed or schools were skipped
  } else if (totalPlayersGenerated === 0 && schoolsProcessedCount > 0) {
    console.warn("Script finished. No players were generated, but schools were processed. This might indicate an issue with team ID logic or player generation loop.");
    process.exit(1);
  } else if (totalPlayersGenerated === 0 && schoolsProcessedCount === 0) {
     console.error("Script finished. No schools processed and no players generated. Check schoolsData source.");
     process.exit(1);
  }
  else {
    console.log("Player data migration script completed successfully!");
    process.exit(0);
  }
}

generateSchoolSquads().catch(error => {
  console.error("CRITICAL SCRIPT FAILURE in generateSchoolSquads:", error);
  process.exit(1);
});
