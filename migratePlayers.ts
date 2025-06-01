
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { schoolsData, type SchoolProfile, type SchoolTeam } from './src/lib/schools-data'; // Import schools data
import type { PlayerProfile, PlayerStats, PlayerSkills } from './src/lib/player-data'; // Import PlayerProfile structure

// IMPORTANT: Replace with the actual path to your downloaded Firebase Admin SDK JSON file if needed.
// The path seems correct relative to the project root based on previous context.
import serviceAccount from './scrbrd-beta-2-firebase-adminsdk-fbsvc-4c0a94b7bc.json';

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
  console.error('Error initializing Firebase Admin SDK for player generation:', error);
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
    // Assuming players are between 14 and 18 years old for school teams
    const birthYear = currentYear - getRandomInt(14, 18);
    const birthMonth = getRandomInt(0, 11); // Month is 0-indexed
    const birthDay = getRandomInt(1, 28); // Keep it simple for days
    return Timestamp.fromDate(new Date(birthYear, birthMonth, birthDay));
}


async function generateSchoolSquads() {
  console.log('Starting generation of placeholder player data for school squads...');
  let successCount = 0;
  let errorCount = 0;
  let schoolsProcessed = 0;

  if (!schoolsData || !Array.isArray(schoolsData)) {
    console.error('Schools data is not available or not in the expected format. Check src/lib/schools-data.ts export.');
    process.exit(1);
  }

  console.log(`Found ${schoolsData.length} schools to process.`);

  for (const school of schoolsData) {
    console.log(`\nProcessing school: ${school.name} (ID: ${school.id})`);

    let primaryTeam: SchoolTeam | undefined = school.teams?.find(t => t.name.toLowerCase().includes("1st xi"));
    if (!primaryTeam && school.teams && school.teams.length > 0) {
      primaryTeam = school.teams[0]; // Default to the first team if "1st XI" not found
    }

    if (!primaryTeam || !primaryTeam.id) {
      console.warn(`  School ${school.name} does not have a primary team with an ID defined in its 'teams' array. Skipping player generation for this school.`);
      continue;
    }

    console.log(`  Generating players for team: ${primaryTeam.name} (Team ID: ${primaryTeam.id})`);

    const playersPerTeam = 12; // Generate 12 players per primary team
    for (let i = 1; i <= playersPerTeam; i++) {
      const playerName = `Player ${i} (${school.name} ${primaryTeam.name})`;
      
      // Use Firestore's auto-generated ID by not specifying a document ID
      const playerDocRef = db.collection('players').doc();

      const playerRole = roles[i % roles.length]; // Cycle through roles

      const playerData: Omit<PlayerProfile, 'id'> = {
        name: playerName,
        teamId: primaryTeam.id,
        avatar: `https://placehold.co/100x100.png`,
        role: playerRole,
        battingStyle: getRandomElement(battingStyles),
        bowlingStyle: playerRole.toLowerCase().includes("bowler") || playerRole.toLowerCase().includes("all-rounder") ? getRandomElement(bowlingStyles) : "N/A",
        bio: `Placeholder bio for ${playerName}, a dedicated member of ${school.name}'s ${primaryTeam.name}.`,
        stats: generatePlayerStats(),
        careerSpan: "Current School Season",
        dateOfBirth: generateRandomDateOfBirth().toDate().toISOString().split('T')[0], // Store as YYYY-MM-DD string
        // skills can be omitted or set to a default empty object
        skills: {},
      };
      
      // Transform dateOfBirth back to Firestore Timestamp for storage
      const playerDocumentData = {
        ...playerData,
        dateOfBirth: playerData.dateOfBirth ? Timestamp.fromDate(new Date(playerData.dateOfBirth)) : null,
      };


      try {
        console.log(`  Attempting to generate player: ${playerName} for team ID: ${primaryTeam.id}`);
        await playerDocRef.set(playerDocumentData);
        successCount++;
        console.log(`  Successfully generated player: ${playerName} with Firestore ID: ${playerDocRef.id}`);
      } catch (error) {
        errorCount++;
        console.error(`  Error generating player ${playerName}:`, error);
      }
    }
    schoolsProcessed++;
  }

  console.log('\nPlayer data generation complete.');
  console.log(`Schools processed: ${schoolsProcessed}`);
  console.log(`Successfully generated: ${successCount} players.`);
  console.log(`Failed to generate: ${errorCount} players.`);

  if (errorCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

generateSchoolSquads().catch(error => {
  console.error("Player generation script failed:", error);
  process.exit(1);
});
