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
        console.log('Firebase Admin SDK initialized successfully for fixture import.');
    }
    else {
        console.log('Firebase Admin SDK already initialized for fixture import.');
    }
}
catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    process.exit(1); // Exit if initialization fails
}
const db = admin.firestore();
const deriveAgeGroup = (teamAId, teamBId) => {
    const idsToTest = [teamAId.toLowerCase(), teamBId.toLowerCase()];
    for (const id of idsToTest) {
        if (id.includes('_u19'))
            return 'U19';
        if (id.includes('_u16'))
            return 'U16';
        if (id.includes('_u15'))
            return 'U15';
        if (id.includes('_u14'))
            return 'U14';
        if (id.includes('_u13'))
            return 'U13';
    }
    return 'Open'; // Default if no specific age group found
};
const importFixturesData = async () => {
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
                const dateTimeString = `${sourceFixture.date} ${sourceFixture.time}`;
                let parsedDate = parse(dateTimeString, 'yyyy-MM-dd hh:mm a', new Date());
                if (isNaN(parsedDate.getTime())) {
                    parsedDate = parse(dateTimeString, 'yyyy-MM-dd HH:mm', new Date());
                }
                if (isNaN(parsedDate.getTime())) {
                    console.warn(`Could not parse date/time for fixture ID ${fixtureId}: ${dateTimeString}. Skipping timestamp.`);
                    scheduledDateTime = null;
                }
                else {
                    scheduledDateTime = Timestamp.fromDate(parsedDate);
                }
            }
            catch (e) {
                console.warn(`Error parsing date/time for fixture ID ${fixtureId}: ${sourceFixture.date} ${sourceFixture.time}. Error: ${e}`);
                scheduledDateTime = null;
            }
            const derivedAgeGroup = deriveAgeGroup(sourceFixture.teamAId, sourceFixture.teamBId);
            const fixtureData = {
                // fixtureId: fixtureId, // Doc ID will be fixtureId
                homeTeamId: sourceFixture.teamAId,
                awayTeamId: sourceFixture.teamBId,
                matchType: 'T20', // Defaulting as it's not in sourceFixtures
                venueId: sourceFixture.location,
                scheduledDate: scheduledDateTime,
                time: sourceFixture.time,
                overs: 20, // Defaulting for T20
                ageGroup: derivedAgeGroup, // Using derived age group
                status: sourceFixture.status,
                transportId: null,
                createdBy: 'system_import_script',
                umpireIds: sourceFixture.umpires || [],
                scorerId: (sourceFixture.scorers && sourceFixture.scorers.length > 0) ? sourceFixture.scorers[0] : null,
                groundkeeperId: null,
                toss: null,
                createdAt: Timestamp.now(),
                // Fields for fixture classification on create page
                openClass: derivedAgeGroup === 'Open' ? '1st XI' : null, // Example default for Open
                ageSpecificClass: derivedAgeGroup !== 'Open' ? 'A' : null, // Example default for age-specific
            };
            await collectionRef.doc(fixtureId).set(fixtureData);
            successCount++;
            console.log(`Successfully imported fixture with ID: ${fixtureId}`);
        }
        catch (error) {
            errorCount++;
            console.error(`Error importing fixture with ID ${sourceFixture.id}:`, error);
        }
    }
    console.log('Import complete.');
    console.log(`Successful imports: ${successCount}`);
    console.log(`Failed imports: ${errorCount}`);
    if (errorCount > 0) {
        process.exit(1); // Exit with an error code if there were failures
    }
    else {
        process.exit(0); // Exit successfully
    }
};
importFixturesData();
