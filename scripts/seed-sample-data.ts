/**
 * Sample Data Seeder for SCRBRD
 * 
 * Run this script to populate Firestore with realistic cricket teams and matches
 * 
 * Usage: npx tsx scripts/seed-sample-data.ts
 */

import { db } from '../src/lib/firebase';
import { collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';

// South African School Cricket Teams
const sampleTeams = [
  {
    id: 'team-wbhs-1st',
    name: 'Westville Boys 1st XI',
    schoolId: 's1',
    division: 'd1',
    teamColors: { primary: '#003D7A', secondary: '#FFD700' },
    logoUrl: 'https://ui-avatars.com/api/?name=WBHS&background=003D7A&color=fff'
  },
  {
    id: 'team-saints-1st',
    name: 'St Stithians 1st XI',
    schoolId: 's2',
    division: 'd1',
    teamColors: { primary: '#00205B', secondary: '#C8102E' },
    logoUrl: 'https://ui-avatars.com/api/?name=Saints&background=00205B&color=fff'
  },
  {
    id: 'team-hilton-1st',
    name: 'Hilton College 1st XI',
    schoolId: 's3',
    division: 'd1',
    teamColors: { primary: '#8B0000', secondary: '#FFD700' },
    logoUrl: 'https://ui-avatars.com/api/?name=Hilton&background=8B0000&color=fff'
  },
  {
    id: 'team-bishops-1st',
    name: 'Bishops 1st XI',
    schoolId: 's2',
    division: 'd1',
    teamColors: { primary: '#002147', secondary: '#FFFFFF' },
    logoUrl: 'https://ui-avatars.com/api/?name=Bishops&background=002147&color=fff'
  },
  {
    id: 'team-kingswood-1st',
    name: 'Kingswood College 1st XI',
    schoolId: 's1',
    division: 'd1',
    teamColors: { primary: '#006400', secondary: '#FFD700' },
    logoUrl: 'https://ui-avatars.com/api/?name=KC&background=006400&color=fff'
  }
];

// Upcoming Matches
const sampleMatches = [
  {
    id: 'match-wbhs-saints',
    homeTeamId: 'team-wbhs-1st',
    awayTeamId: 'team-saints-1st',
    matchDate: new Date('2025-12-05T10:00:00'),
    dateTime: new Date('2025-12-05T10:00:00').toISOString(),
    venue: 'Westville Boys Main Oval',
    fieldId: 'f1',
    status: 'scheduled',
    state: 'SCHEDULED',
    matchType: 'T20',
    overs: 20,
    division: 'd1',
    leagueId: 'league1'
  },
  {
    id: 'match-hilton-bishops',
    homeTeamId: 'team-hilton-1st',
    awayTeamId: 'team-bishops-1st',
    matchDate: new Date('2025-12-07T14:00:00'),
    dateTime: new Date('2025-12-07T14:00:00').toISOString(),
    venue: 'Hilton Oval',
    fieldId: 'f3',
    status: 'scheduled',
    state: 'SCHEDULED',
    matchType: 'ODI',
    overs: 50,
    division: 'd1',
    leagueId: 'league1'
  },
  {
    id: 'match-kingswood-saints',
    homeTeamId: 'team-kingswood-1st',
    awayTeamId: 'team-saints-1st',
    matchDate: new Date('2025-12-10T10:00:00'),
    dateTime: new Date('2025-12-10T10:00:00').toISOString(),
    venue: 'Kingswood Field',
    status: 'scheduled',
    state: 'SCHEDULED',
    matchType: 'T20',
    overs: 20,
    division: 'd1',
    leagueId: 'league1'
  },
  {
    id: 'match-wbhs-hilton-completed',
    homeTeamId: 'team-wbhs-1st',
    awayTeamId: 'team-hilton-1st',
    matchDate: new Date('2025-11-28T10:00:00'),
    dateTime: new Date('2025-11-28T10:00:00').toISOString(),
    venue: 'Westville Boys Main Oval',
    fieldId: 'f1',
    status: 'completed',
    state: 'COMPLETED',
    matchType: 'T20',
    overs: 20,
    division: 'd1',
    leagueId: 'league1',
    result: 'Westville Boys 1st XI won by 45 runs',
    score: {
      home: '187/6',
      away: '142/9'
    },
    tossWinner: 'Westville Boys 1st XI',
    tossChoice: 'bat'
  }
];

async function seedData() {
  console.log('🌱 Starting data seeding...\n');

  try {
    // 1. Seed Teams
    console.log('📝 Seeding Teams...');
    for (const team of sampleTeams) {
      await setDoc(doc(db, 'teams', team.id), team);
      console.log(`  ✅ Created: ${team.name}`);
    }
    console.log(`✅ Seeded ${sampleTeams.length} teams\n`);

    // 2. Seed Matches
    console.log('📝 Seeding Matches...');
    for (const match of sampleMatches) {
      await setDoc(doc(db, 'matches', match.id), match);
      const homeTeam = sampleTeams.find(t => t.id === match.homeTeamId);
      const awayTeam = sampleTeams.find(t => t.id === match.awayTeamId);
      console.log(`  ✅ Created: ${homeTeam?.name} vs ${awayTeam?.name}`);
    }
    console.log(`✅ Seeded ${sampleMatches.length} matches\n`);

    console.log('🎉 Sample data seeding complete!\n');
    console.log('📊 Summary:');
    console.log(`  - ${sampleTeams.length} teams`);
    console.log(`  - ${sampleMatches.length} matches`);
    console.log(`  - 3 upcoming matches`);
    console.log(`  - 1 completed match`);
    console.log('\n✨ Navigate to http://localhost:3000/matches to see the results!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

// Optional: Clean existing data first
async function cleanData() {
  console.log('🧹 Cleaning existing sample data...\n');
  
  try {
    // Delete sample teams
    for (const team of sampleTeams) {
      await deleteDoc(doc(db, 'teams', team.id));
    }
    
    // Delete sample matches
    for (const match of sampleMatches) {
      await deleteDoc(doc(db, 'matches', match.id));
    }
    
    console.log('✅ Existing sample data cleaned\n');
  } catch (error) {
    console.log('⚠️  No existing data to clean (this is fine)\n');
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const shouldClean = args.includes('--clean');

  if (shouldClean) {
    await cleanData();
  }

  await seedData();
  process.exit(0);
}

main().catch(console.error);
