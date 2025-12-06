'use server';

import { setDocument } from "@/lib/firestore";
import { revalidatePath } from "next/cache";
import { Timestamp } from "firebase-admin/firestore";

/**
 * Sample data generator for SCRBRD testing.
 * Creates realistic South African cricket data across all collections.
 */

// Helper to create Firestore-compatible dates
const toTimestamp = (date: Date) => Timestamp.fromDate(date);
const randomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// South African Schools
const SA_SCHOOLS = [
    { id: 'school-1', name: 'Grey College', shortName: 'Grey', city: 'Bloemfontein', province: 'Free State' },
    { id: 'school-2', name: 'Hilton College', shortName: 'Hilton', city: 'Hilton', province: 'KwaZulu-Natal' },
    { id: 'school-3', name: 'Bishops', shortName: 'Bishops', city: 'Cape Town', province: 'Western Cape' },
    { id: 'school-4', name: 'St Stithians College', shortName: 'Saints', city: 'Johannesburg', province: 'Gauteng' },
    { id: 'school-5', name: 'Michaelhouse', shortName: 'MHS', city: 'Balgowan', province: 'KwaZulu-Natal' },
    { id: 'school-6', name: 'Pretoria Boys High', shortName: 'PBHS', city: 'Pretoria', province: 'Gauteng' },
    { id: 'school-7', name: 'Kearsney College', shortName: 'Kearsney', city: 'Botha\'s Hill', province: 'KwaZulu-Natal' },
    { id: 'school-8', name: 'Wynberg Boys High', shortName: 'WBHS', city: 'Cape Town', province: 'Western Cape' },
];

// Cricket-specific names
const FIRST_NAMES = ['Liam', 'Ethan', 'James', 'Noah', 'William', 'Oliver', 'Benjamin', 'Lucas', 'Mason', 'Alexander', 'Henry', 'Jacob', 'Michael', 'Daniel', 'Sipho', 'Thabo', 'Kagiso', 'Andile', 'Bandile', 'Themba'];
const LAST_NAMES = ['Van der Merwe', 'Botha', 'Pretorius', 'Nel', 'Steyn', 'Du Plessis', 'Coetzee', 'Nkomo', 'Dlamini', 'Zuma', 'Mkhize', 'Ndlovu', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Wilson', 'Taylor', 'Anderson'];

const BATTING_STYLES = ['Right-hand bat', 'Left-hand bat'];
const BOWLING_STYLES = ['Right-arm fast', 'Right-arm medium', 'Right-arm off-spin', 'Right-arm leg-spin', 'Left-arm fast', 'Left-arm orthodox', 'Does not bowl'];
const POSITIONS = ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper', 'Wicket-keeper batsman'];

const EQUIPMENT_TYPES = ['Bat', 'Pads', 'Gloves', 'Helmet', 'Ball', 'Stumps', 'Bails', 'Kit Bag', 'Thigh Guard', 'Arm Guard'];
const EQUIPMENT_BRANDS = ['Gray-Nicolls', 'Kookaburra', 'GM', 'SS', 'MRF', 'New Balance', 'Masuri', 'SG', 'DSC'];
const EQUIPMENT_CONDITIONS = ['New', 'Good', 'Fair', 'Poor'];
const EQUIPMENT_STATUSES = ['Available', 'In Use', 'Maintenance'];

const TRANSACTION_CATEGORIES = ['Equipment', 'Travel', 'Uniforms', 'Registration', 'Coaching', 'Venue Hire', 'Catering', 'Medical', 'Insurance', 'Sponsorship'];

function generatePlayer(schoolId: string, index: number) {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const dob = randomDate(new Date(2005, 0, 1), new Date(2010, 11, 31));

    return {
        id: `player-${schoolId}-${index}`,
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
        dateOfBirth: toTimestamp(dob),
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/ /g, '')}@school.co.za`,
        phoneNumber: `+27 ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`,
        role: 'player',
        schoolId,
        jerseyNumber: Math.floor(Math.random() * 99) + 1,
        battingStyle: BATTING_STYLES[Math.floor(Math.random() * BATTING_STYLES.length)],
        bowlingStyle: BOWLING_STYLES[Math.floor(Math.random() * BOWLING_STYLES.length)],
        primaryPosition: POSITIONS[Math.floor(Math.random() * POSITIONS.length)],
        heightCm: Math.floor(Math.random() * 40) + 160,
        weightKg: Math.floor(Math.random() * 30) + 55,
        status: 'active',
        skills: {
            batting: Math.floor(Math.random() * 50) + 50,
            bowling: Math.floor(Math.random() * 50) + 50,
            fielding: Math.floor(Math.random() * 40) + 60,
            wicketkeeping: Math.floor(Math.random() * 50) + 50,
            leadership: Math.floor(Math.random() * 40) + 60,
            fitness: Math.floor(Math.random() * 30) + 70,
            mental: Math.floor(Math.random() * 40) + 60,
        },
        stats: {
            matchesPlayed: Math.floor(Math.random() * 30) + 5,
            totalRuns: Math.floor(Math.random() * 800) + 100,
            wicketsTaken: Math.floor(Math.random() * 30),
            battingAverage: parseFloat((Math.random() * 40 + 15).toFixed(2)),
            bowlingAverage: parseFloat((Math.random() * 25 + 15).toFixed(2)),
            strikeRate: parseFloat((Math.random() * 60 + 80).toFixed(2)),
            economyRate: parseFloat((Math.random() * 4 + 4).toFixed(2)),
        },
        createdAt: toTimestamp(new Date()),
    };
}

function generateEquipment(schoolId: string, index: number) {
    const type = EQUIPMENT_TYPES[Math.floor(Math.random() * EQUIPMENT_TYPES.length)];
    const brand = EQUIPMENT_BRANDS[Math.floor(Math.random() * EQUIPMENT_BRANDS.length)];

    return {
        id: `equipment-${schoolId}-${index}`,
        name: `${brand} ${type}`,
        type,
        brand,
        condition: EQUIPMENT_CONDITIONS[Math.floor(Math.random() * EQUIPMENT_CONDITIONS.length)],
        status: EQUIPMENT_STATUSES[Math.floor(Math.random() * EQUIPMENT_STATUSES.length)],
        cost: Math.floor(Math.random() * 5000) + 500,
        purchaseDate: toTimestamp(randomDate(new Date(2022, 0, 1), new Date())),
        schoolId,
        assignedTo: null,
        createdAt: toTimestamp(new Date()),
    };
}

function generateTransaction(schoolId: string, index: number) {
    const isIncome = Math.random() > 0.4;
    const category = TRANSACTION_CATEGORIES[Math.floor(Math.random() * TRANSACTION_CATEGORIES.length)];

    return {
        id: `transaction-${schoolId}-${index}`,
        type: isIncome ? 'Income' : 'Expense',
        amount: Math.floor(Math.random() * 15000) + 500,
        category,
        description: `${isIncome ? 'Payment received for' : 'Payment for'} ${category.toLowerCase()}`,
        date: toTimestamp(randomDate(new Date(2024, 0, 1), new Date())),
        status: Math.random() > 0.2 ? 'Completed' : 'Pending',
        paymentMethod: ['Cash', 'EFT', 'Card', 'Cheque'][Math.floor(Math.random() * 4)],
        schoolId,
        createdAt: toTimestamp(new Date()),
    };
}

function generateMatch(homeTeamId: string, awayTeamId: string, homeTeamName: string, awayTeamName: string, index: number) {
    const matchDate = randomDate(new Date(2024, 6, 1), new Date(2025, 6, 1));
    const isPast = matchDate < new Date();
    const homeScore = isPast ? `${Math.floor(Math.random() * 150) + 100}/${Math.floor(Math.random() * 10)}` : undefined;
    const awayScore = isPast ? `${Math.floor(Math.random() * 150) + 100}/${Math.floor(Math.random() * 10)}` : undefined;

    return {
        id: `match-${index}`,
        homeTeamId,
        awayTeamId,
        homeTeamName,
        awayTeamName,
        dateTime: toTimestamp(matchDate),
        venue: `${homeTeamName} Cricket Oval`,
        matchType: 'League',
        format: ['T20', 'ODI', 'Limited Overs'][Math.floor(Math.random() * 3)],
        overs: [20, 50, 40][Math.floor(Math.random() * 3)],
        status: isPast ? 'completed' : 'scheduled',
        homeScore,
        awayScore,
        result: isPast ? (Math.random() > 0.5 ? `${homeTeamName} won by ${Math.floor(Math.random() * 50) + 10} runs` : `${awayTeamName} won by ${Math.floor(Math.random() * 8) + 1} wickets`) : undefined,
        createdAt: toTimestamp(new Date()),
    };
}

export async function generateSampleDataAction() {
    console.log("Generating comprehensive sample data...");

    try {
        // 1. Create Schools
        for (const school of SA_SCHOOLS) {
            await setDocument('schools', school.id, {
                ...school,
                address: `${Math.floor(Math.random() * 100) + 1} Sports Avenue`,
                postalCode: `${Math.floor(Math.random() * 9000) + 1000}`,
                country: 'South Africa',
                phoneNumber: `+27 ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`,
                email: `cricket@${school.shortName.toLowerCase()}.co.za`,
                logoUrl: null,
                primaryColor: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
                createdAt: toTimestamp(new Date()),
            });
        }
        console.log(`Created ${SA_SCHOOLS.length} schools`);

        // 2. Create Teams (1st XI and U15 for each school)
        const teams: Array<{ id: string; name: string; schoolId: string }> = [];
        for (const school of SA_SCHOOLS) {
            const firstXI = {
                id: `team-${school.id}-1st`,
                name: `${school.shortName} 1st XI`,
                schoolId: school.id,
                ageGroup: 'Open',
                status: 'active',
                createdAt: toTimestamp(new Date()),
            };
            const u15 = {
                id: `team-${school.id}-u15`,
                name: `${school.shortName} U15`,
                schoolId: school.id,
                ageGroup: 'U15',
                status: 'active',
                createdAt: toTimestamp(new Date()),
            };
            await setDocument('teams', firstXI.id, firstXI);
            await setDocument('teams', u15.id, u15);
            teams.push({ id: firstXI.id, name: firstXI.name, schoolId: school.id });
            teams.push({ id: u15.id, name: u15.name, schoolId: school.id });
        }
        console.log(`Created ${teams.length} teams`);

        // 3. Create Players (15 per school)
        let playerCount = 0;
        for (const school of SA_SCHOOLS) {
            for (let i = 0; i < 15; i++) {
                const player = generatePlayer(school.id, i);
                await setDocument('people', player.id, player);
                playerCount++;
            }
        }
        console.log(`Created ${playerCount} players`);

        // 4. Create Fields (1 per school)
        for (const school of SA_SCHOOLS) {
            const field = {
                id: `field-${school.id}`,
                name: `${school.name} Cricket Oval`,
                schoolId: school.id,
                address: `${school.city}, ${school.province}`,
                capacity: Math.floor(Math.random() * 3000) + 500,
                pitchType: ['Natural Turf', 'Artificial'][Math.floor(Math.random() * 2)],
                floodlights: Math.random() > 0.5,
                facilities: ['Pavilion', 'Practice Nets', 'Scoreboard', 'Seating'],
                maintenanceStatus: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)],
                createdAt: toTimestamp(new Date()),
            };
            await setDocument('fields', field.id, field);
        }
        console.log(`Created ${SA_SCHOOLS.length} fields`);

        // 5. Create Equipment (10 items per school)
        let equipmentCount = 0;
        for (const school of SA_SCHOOLS) {
            for (let i = 0; i < 10; i++) {
                const equipment = generateEquipment(school.id, i);
                await setDocument('equipment', equipment.id, equipment);
                equipmentCount++;
            }
        }
        console.log(`Created ${equipmentCount} equipment items`);

        // 6. Create Transactions (20 per school)
        let transactionCount = 0;
        for (const school of SA_SCHOOLS) {
            for (let i = 0; i < 20; i++) {
                const transaction = generateTransaction(school.id, i);
                await setDocument('transactions', transaction.id, transaction);
                transactionCount++;
            }
        }
        console.log(`Created ${transactionCount} transactions`);

        // 7. Create Matches (matchups between teams)
        let matchCount = 0;
        for (let i = 0; i < teams.length; i += 2) {
            if (i + 1 < teams.length) {
                const match = generateMatch(teams[i].id, teams[i + 1].id, teams[i].name, teams[i + 1].name, matchCount);
                await setDocument('matches', match.id, match);
                matchCount++;
            }
        }
        // Create some cross-school matches
        for (let i = 0; i < 10; i++) {
            const homeIdx = Math.floor(Math.random() * teams.length);
            let awayIdx = Math.floor(Math.random() * teams.length);
            while (awayIdx === homeIdx) {
                awayIdx = Math.floor(Math.random() * teams.length);
            }
            const match = generateMatch(teams[homeIdx].id, teams[awayIdx].id, teams[homeIdx].name, teams[awayIdx].name, matchCount + i);
            await setDocument('matches', match.id, match);
            matchCount++;
        }
        console.log(`Created ${matchCount} matches`);

        // 8. Create Sponsors
        const sponsors = [
            { id: 'sponsor-1', name: 'Standard Bank', industry: 'Banking', tierLevel: 'Platinum', contributionAmount: 500000 },
            { id: 'sponsor-2', name: 'Old Mutual', industry: 'Insurance', tierLevel: 'Gold', contributionAmount: 250000 },
            { id: 'sponsor-3', name: 'Castle Lager', industry: 'Beverage', tierLevel: 'Gold', contributionAmount: 200000 },
            { id: 'sponsor-4', name: 'Nike South Africa', industry: 'Sports Apparel', tierLevel: 'Silver', contributionAmount: 100000 },
            { id: 'sponsor-5', name: 'Vodacom', industry: 'Telecommunications', tierLevel: 'Silver', contributionAmount: 150000 },
        ];
        for (const sponsor of sponsors) {
            await setDocument('sponsors', sponsor.id, {
                ...sponsor,
                status: 'active',
                startDate: toTimestamp(new Date(2024, 0, 1)),
                endDate: toTimestamp(new Date(2025, 11, 31)),
                createdAt: toTimestamp(new Date()),
            });
        }
        console.log(`Created ${sponsors.length} sponsors`);

        // 9. Create Seasons
        const seasons = [
            { id: 'season-2024', name: '2024 Season', startDate: toTimestamp(new Date(2024, 0, 15)), endDate: toTimestamp(new Date(2024, 11, 15)), status: 'completed' },
            { id: 'season-2025', name: '2025 Season', startDate: toTimestamp(new Date(2025, 0, 15)), endDate: toTimestamp(new Date(2025, 11, 15)), status: 'active' },
        ];
        for (const season of seasons) {
            await setDocument('seasons', season.id, { ...season, createdAt: toTimestamp(new Date()) });
        }
        console.log(`Created ${seasons.length} seasons`);

        // 10. Create Divisions
        const divisions = [
            { id: 'div-premier', name: 'Premier League', seasonId: 'season-2025', season: '2025' },
            { id: 'div-championship', name: 'Championship', seasonId: 'season-2025', season: '2025' },
            { id: 'div-u15', name: 'U15 League', seasonId: 'season-2025', season: '2025' },
        ];
        for (const division of divisions) {
            await setDocument('divisions', division.id, { ...division, createdAt: toTimestamp(new Date()) });
        }
        console.log(`Created ${divisions.length} divisions`);

        console.log("Sample data generation complete!");
        revalidatePath('/');

        return {
            success: true,
            message: `Generated: ${SA_SCHOOLS.length} schools, ${teams.length} teams, ${playerCount} players, ${equipmentCount} equipment, ${transactionCount} transactions, ${matchCount} matches, ${sponsors.length} sponsors`
        };
    } catch (error) {
        console.error("Sample data generation failed:", error);
        return { success: false, message: `Generation failed: ${(error as Error).message}` };
    }
}
