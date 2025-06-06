import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { schoolsData } from './src/lib/schools-data'; // Changed path from @/lib/schools-data
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
            credential: admin.credential.cert(serviceAccount),
        });
        console.log('Firebase Admin SDK initialized successfully for player generation.');
    }
    else {
        console.log('Firebase Admin SDK already initialized for player generation.');
    }
}
catch (error) {
    console.error('CRITICAL: Error initializing Firebase Admin SDK for player generation:', error);
    process.exit(1);
}
const db = admin.firestore();
const roles = ["Batsman", "Bowler", "All-rounder", "Wicket-keeper", "Opening Batsman", "Middle-order Batsman", "Fast Bowler", "Spinner"];
const battingStyles = ["Right-hand bat", "Left-hand bat"];
const bowlingStyles = ["Right-arm fast", "Left-arm fast", "Right-arm medium", "Left-arm medium", "Right-arm off-spin", "Right-arm leg-spin", "Left-arm orthodox", "Left-arm chinaman"];
function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Elizabeth", "William", "Linda", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Charles", "Christopher", "Sarah", "Daniel", "Karen", "Matthew", "Nancy", "Anthony", "Lisa", "Donald", "Betty", "Paul", "Margaret", "Liam", "Olivia", "Noah", "Emma", "Oliver", "Ava", "Elijah", "Sophia", "Lucas", "Isabella", "Mason", "Mia", "Logan", "Amelia", "Ethan", "Harper", "Aiden", "Evelyn"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Green", "Adams", "Baker", "Nelson"];
const generatedFullNames = new Set();
function generateUniqueFullName() {
    let fullName;
    let firstName = '';
    let lastName = '';
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
        return { firstName, lastName: `${lastName}${getRandomInt(1, 99)}` };
    }
    return { firstName, lastName };
}
function generatePlayerStats() {
    const hsRuns = getRandomInt(20, 100);
    const hsNotOut = Math.random() > 0.7 ? '*' : '';
    const bestBowlWickets = getRandomInt(1, 5);
    const bestBowlRuns = getRandomInt(10, 50);
    return {
        matchesPlayed: getRandomInt(5, 20),
        runs: getRandomInt(50, 500),
        average: parseFloat((Math.random() * 30 + 10).toFixed(2)),
        strikeRate: parseFloat((Math.random() * 50 + 70).toFixed(2)),
        highestScore: { value: `${hsRuns}${hsNotOut}` },
        bestBatting: { value: `${hsRuns}${hsNotOut}` }, // Simplified for placeholder
        wickets: getRandomInt(0, 30),
        bowlingAverage: parseFloat((Math.random() * 30 + 15).toFixed(2)),
        economyRate: parseFloat((Math.random() * 5 + 3).toFixed(2)),
        bestBowling: { value: `${bestBowlWickets}/${bestBowlRuns}` }, // Simplified
        catches: getRandomInt(1, 10),
        hundreds: Math.random() > 0.9 ? getRandomInt(1, 2) : 0,
        fifties: getRandomInt(0, 5),
        stumpings: getRandomInt(0, 5),
    };
}
function generateRandomDateOfBirth() {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - getRandomInt(14, 18); // Ages 14 to 18
    const birthMonth = getRandomInt(0, 11); // 0 for January, 11 for December
    const birthDay = getRandomInt(1, 28); // Simplified to avoid month length issues
    return Timestamp.fromDate(new Date(birthYear, birthMonth, birthDay));
}
function generatePlayerSkillsPlaceholder() {
    const randomSkill = () => getRandomInt(20, 60); // Generate skills between 20-60 for visibility
    return {
        technical: {
            battingTechnique: randomSkill(),
            shotSelection: randomSkill(),
            powerHitting: randomSkill(),
            runningBetweenWickets: randomSkill(),
            bowlingAccuracy: randomSkill(),
            bowlingVariation: randomSkill(),
            spinReading: randomSkill(),
            groundFielding: randomSkill(),
            catchingTechnique: randomSkill(),
            throwingAccuracy: randomSkill(),
        },
        tactical: {
            matchAwareness: randomSkill(),
            strikeRotation: randomSkill(),
            oppositionAnalysis: randomSkill(),
            fieldPlacement: randomSkill(),
            deathOversExecution: randomSkill(),
        },
        physicalMental: {
            speedAgility: randomSkill(),
            endurance: randomSkill(),
            strengthPower: randomSkill(),
            flexibility: randomSkill(),
            reactionTime: randomSkill(),
            concentration: randomSkill(),
            composure: randomSkill(),
            resilience: randomSkill(),
            decisionMaking: randomSkill(),
            coachability: randomSkill(),
        },
        teamLeadership: {
            communication: randomSkill(),
            teamSpirit: randomSkill(),
            leadership: randomSkill(),
            discipline: randomSkill(),
            workEthic: randomSkill(),
        }
    };
}
async function generateSchoolSquads() {
    console.log('\nStarting generation of placeholder player data for school squads...');
    let totalPlayersGenerated = 0;
    let totalErrorsGeneratingPlayers = 0;
    let schoolsProcessedCount = 0;
    let schoolsSkippedDueToMissingTeam = 0;
    // Debugging schoolsData import
    console.log(`DEBUG: Immediately after import - typeof schoolsData: ${typeof schoolsData}`);
    console.log(`DEBUG: Immediately after import - Array.isArray(schoolsData): ${Array.isArray(schoolsData)}`);
    if (schoolsData) {
        console.log(`DEBUG: Immediately after import - schoolsData.length: ${schoolsData.length}`);
    }
    if (!schoolsData || !Array.isArray(schoolsData) || schoolsData.length === 0) {
        console.error('CRITICAL: Schools data is not available, not an array, or is empty. Check src/lib/schools-data.ts export.');
        console.error('No players will be generated.');
        process.exit(1);
    }
    console.log(`Found ${schoolsData.length} schools to process from ./src/lib/schools-data.ts.`);
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
        let primaryTeam = school.teams.find(t => t.name.toLowerCase().includes("1st xi"));
        if (!primaryTeam) {
            primaryTeam = school.teams[0];
            console.log(`  No "1st XI" found for ${school.name}, defaulting to first team: ${primaryTeam.name} (ID: ${primaryTeam.id})`);
        }
        if (!primaryTeam || !primaryTeam.id) {
            console.warn(`  CRITICAL SKIP: School ${school.name} (ID: ${school.id}). Could not determine a primary team with a valid ID.`);
            console.warn(`  Ensure 'teams' array in 'schools-data.ts' for this school has at least one team object with an 'id' property.`);
            console.warn(`  Example team entry: { id: "schoolName_1stXI", name: "1st XI" }`);
            schoolsSkippedDueToMissingTeam++;
            continue;
        }
        const primaryTeamId = primaryTeam.id;
        console.log(`  Generating players for team: ${primaryTeam.name} (Team ID: ${primaryTeamId})`);
        generatedFullNames.clear();
        const playersPerTeam = 12;
        for (let i = 1; i <= playersPerTeam; i++) {
            const { firstName, lastName } = generateUniqueFullName();
            const playerName = `${firstName} ${lastName}`;
            const playerDocRef = db.collection('players').doc();
            const playerRole = roles[i % roles.length];
            const playerData = {
                name: playerName,
                teamId: primaryTeamId,
                avatar: `https://placehold.co/100x100.png`,
                role: playerRole,
                battingStyle: getRandomElement(battingStyles),
                bowlingStyle: playerRole.toLowerCase().includes("bowler") || playerRole.toLowerCase().includes("all-rounder") ? getRandomElement(bowlingStyles) : "N/A",
                bio: `Placeholder bio for ${playerName}, a dedicated member of ${school.name}'s ${primaryTeam.name}.`,
                stats: generatePlayerStats(),
                careerSpan: "Current School Season",
                dateOfBirth: generateRandomDateOfBirth().toDate(), // Store as JS Date object directly for Firestore
                skills: generatePlayerSkillsPlaceholder(),
            };
            const playerDocumentData = {
                ...playerData,
                // Firestore handles JS Date objects correctly, converting them to Timestamps.
                // No explicit Timestamp.fromDate needed here if playerData.dateOfBirth is already a Date.
            };
            try {
                await playerDocRef.set(playerDocumentData);
                totalPlayersGenerated++;
            }
            catch (error) {
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
        process.exit(1);
    }
    else if (totalPlayersGenerated === 0 && schoolsProcessedCount > 0) {
        console.warn("Script finished. No players were generated, but schools were processed. This might indicate an issue with team ID logic or player generation loop.");
        process.exit(1);
    }
    else if (totalPlayersGenerated === 0 && schoolsProcessedCount === 0) {
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
