
// Placeholder player and team data for the team details page

import type { PlayerProfile } from "@/lib/player-data"; // Corrected import type

export interface Player {
  id: string;
  name: string;
  role: string; // e.g., Batsman, Bowler, All-rounder, Wicket-keeper
  avatar: string; // URL to placeholder image
  stats?: { // Optional stats object
    runs?: number;
    wickets?: number;
    catches?: number;
    matchesPlayed?: number;
  };
}

export interface TeamPerformanceStats {
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws?: number;
  winPercentage: string;
  titles?: number; // Optional: number of championships won
}

export interface Team {
  id: string;
  teamName: string;
  schoolId: string; // FK to School
  divisionId: string; // FK to Division
  ageGroup: string;
  division: string;
  mascot?: string;
  squad: PlayerProfile[];
  performanceStats: TeamPerformanceStats;
  // Fixtures will be filtered from a separate data source
  affiliation: string; // This should ideally be derived from schoolId or removed if schoolId is the source of truth for affiliation
}

// Sample detailed data for a few teams
export const detailedTeamsData: Team[] = [
  {
    id: "1",
    schoolId: "school-1-michaelhouse", // Updated
    divisionId: "1stxi", // Example valid division
    teamName: "1st XI",
    ageGroup: "Open",
    division: "A",
    mascot: "Stags", // Michaelhouse mascot example
    squad: [
      { id: "P101", name: "Ethan Miller", role: "Captain / Batsman", avatar: "https://placehold.co/100x100.png", stats: { runs: 1250, wickets: 5, catches: 20, matchesPlayed: 45 }, teamId: "1" },
      { id: "P102", name: "Olivia Garcia", role: "Vice-Captain / All-rounder", avatar: "https://placehold.co/100x100.png", stats: { runs: 980, wickets: 55, catches: 30, matchesPlayed: 42 }, teamId: "1" },
      { id: "P103", name: "Liam Davies", role: "Wicket-keeper / Batsman", avatar: "https://placehold.co/100x100.png", stats: { runs: 750, wickets: 0, catches: 75, matchesPlayed: 40 }, teamId: "1" },
      { id: "P104", name: "Sophia Wilson", role: "Opening Bowler", avatar: "https://placehold.co/100x100.png", stats: { runs: 150, wickets: 85, catches: 10, matchesPlayed: 38 }, teamId: "1" },
      { id: "P105", name: "Noah Brown", role: "Spinner", avatar: "https://placehold.co/100x100.png", stats: { runs: 200, wickets: 70, catches: 12, matchesPlayed: 35 }, teamId: "1" },
      { id: "P106", name: "Ava Jones", role: "Middle-order Batsman", avatar: "https://placehold.co/100x100.png", stats: { runs: 1100, wickets: 2, catches: 18, matchesPlayed: 43 }, teamId: "1" },
      { id: "P107", name: "Lucas Rodriguez", role: "Fast Bowler", avatar: "https://placehold.co/100x100.png", stats: { runs: 120, wickets: 78, catches: 9, matchesPlayed: 36 }, teamId: "1" },
      { id: "P108", name: "Isabella Smith", role: "All-rounder", avatar: "https://placehold.co/100x100.png", stats: { runs: 600, wickets: 40, catches: 25, matchesPlayed: 39 }, teamId: "1" },
      { id: "P109", name: "Mason Taylor", role: "Batsman", avatar: "https://placehold.co/100x100.png", stats: { runs: 850, wickets: 1, catches: 15, matchesPlayed: 37 }, teamId: "1" },
      { id: "P110", name: "Chloe Evans", role: "Bowler", avatar: "https://placehold.co/100x100.png", stats: { runs: 90, wickets: 60, catches: 8, matchesPlayed: 33 }, teamId: "1" },
      { id: "P111", name: "Jacob White", role: "Reserve Batsman", avatar: "https://placehold.co/100x100.png", stats: { runs: 300, wickets: 0, catches: 5, matchesPlayed: 15 }, teamId: "1" },
      { id: "P112", name: "Mia Harris", role: "Reserve Bowler", avatar: "https://placehold.co/100x100.png", stats: { runs: 50, wickets: 20, catches: 3, matchesPlayed: 12 }, teamId: "1" },
      { id: "P113", name: "William King", role: "Opening Batsman", avatar: "https://placehold.co/100x100.png", stats: { runs: 1050, wickets: 3, catches: 22, matchesPlayed: 41 }, teamId: "1" },
      { id: "P114", name: "Ella Wright", role: "Fielder", avatar: "https://placehold.co/100x100.png", stats: { runs: 80, wickets: 1, catches: 40, matchesPlayed: 30 }, teamId: "1" },
      { id: "P115", name: "James Lee", role: "All-rounder", avatar: "https://placehold.co/100x100.png", stats: { runs: 700, wickets: 30, catches: 28, matchesPlayed: 38 }, teamId: "1" },
    ],
    performanceStats: {
      matchesPlayed: 20,
      wins: 15,
      losses: 4,
      draws: 1,
      winPercentage: "75%",
      titles: 2,
    },
    affiliation: "Michaelhouse", // Updated to match school name
  },
  {
    id: "2",
    schoolId: "school-2-hilton-college", // Updated
    divisionId: "u15a", // Example valid division
    teamName: "U15A",
    ageGroup: "U15",
    division: "A",
    mascot: "Elephants", // Hilton College mascot example
    squad: [
      { id: "P201", name: "Aiden Clark", role: "Captain / Batsman", avatar: "https://placehold.co/100x100.png", stats: { runs: 800, wickets: 10, catches: 15, matchesPlayed: 30 }, teamId: "2" },
      { id: "P202", name: "Zoe Lewis", role: "Bowler", avatar: "https://placehold.co/100x100.png", stats: { runs: 100, wickets: 65, catches: 8, matchesPlayed: 28 }, teamId: "2" },
      { id: "P203", name: "Ryan Hall", role: "Wicket-keeper", avatar: "https://placehold.co/100x100.png", stats: { runs: 450, wickets: 0, catches: 50, matchesPlayed: 29 }, teamId: "2" },
      { id: "P204", name: "Grace Allen", role: "All-rounder", avatar: "https://placehold.co/100x100.png", stats: { runs: 500, wickets: 30, catches: 20, matchesPlayed: 27 }, teamId: "2" },
      { id: "P205", name: "Owen Young", role: "Batsman", avatar: "https://placehold.co/100x100.png", stats: { runs: 700, wickets: 2, catches: 10, matchesPlayed: 26 }, teamId: "2" },
      { id: "P206", name: "Lily Scott", role: "Spinner", avatar: "https://placehold.co/100x100.png", stats: { runs: 80, wickets: 50, catches: 5, matchesPlayed: 25 }, teamId: "2" },
      { id: "P207", name: "Carter Green", role: "Fast Bowler", avatar: "https://placehold.co/100x100.png", stats: { runs: 60, wickets: 60, catches: 7, matchesPlayed: 28 }, teamId: "2" },
      { id: "P208", name: "Nora Adams", role: "Batsman", avatar: "https://placehold.co/100x100.png", stats: { runs: 650, wickets: 1, catches: 12, matchesPlayed: 24 }, teamId: "2" },
      { id: "P209", name: "Isaac Baker", role: "All-rounder", avatar: "https://placehold.co/100x100.png", stats: { runs: 400, wickets: 25, catches: 18, matchesPlayed: 26 }, teamId: "2" },
      { id: "P210", name: "Hannah Nelson", role: "Bowler", avatar: "https://placehold.co/100x100.png", stats: { runs: 70, wickets: 45, catches: 6, matchesPlayed: 23 }, teamId: "2" },
      { id: "P211", name: "Caleb Hill", role: "Batsman", avatar: "https://placehold.co/100x100.png", stats: { runs: 550, wickets: 0, catches: 9, matchesPlayed: 22 }, teamId: "2" },
      { id: "P212", name: "Penelope Ramirez", role: "Fielder", avatar: "https://placehold.co/100x100.png", stats: { runs: 40, wickets: 0, catches: 30, matchesPlayed: 20 }, teamId: "2" },
    ],
    performanceStats: {
      matchesPlayed: 18,
      wins: 12,
      losses: 5,
      draws: 1,
      winPercentage: "67%",
      titles: 1,
    },
    affiliation: "Hilton College", // Updated
  },
  {
    id: "3",
    schoolId: "school-3-maritzburg-college", // Updated
    divisionId: "1stxi", // Example valid division
    teamName: "Seniors", // Note: This team name might be for a club, but assigned to a school for now.
    ageGroup: "Senior",
    division: "Premier League", // This might be more for a club league
    mascot: "Red Black White", // Maritzburg College mascot
    squad: [
      { id: "P301", name: "Logan Walker", role: "Captain / All-rounder", avatar: "https://placehold.co/100x100.png", stats: { runs: 2500, wickets: 150, catches: 50, matchesPlayed: 100 }, teamId: "3" },
      { id: "P302", name: "Victoria Perez", role: "Opening Batsman", avatar: "https://placehold.co/100x100.png", stats: { runs: 3200, wickets: 5, catches: 40, matchesPlayed: 95 }, teamId: "3" },
      { id: "P303", name: "Gabriel Roberts", role: "Fast Bowler", avatar: "https://placehold.co/100x100.png", stats: { runs: 500, wickets: 250, catches: 20, matchesPlayed: 90 }, teamId: "3" },
      { id: "P304", name: "Evelyn Turner", role: "Wicket-keeper / Batsman", avatar: "https://placehold.co/100x100.png", stats: { runs: 1800, wickets: 0, catches: 150, matchesPlayed: 88 }, teamId: "3" },
      { id: "P305", name: "Anthony Phillips", role: "Spinner", avatar: "https://placehold.co/100x100.png", stats: { runs: 600, wickets: 200, catches: 25, matchesPlayed: 85 }, teamId: "3" },
      { id: "P306", name: "Natalie Campbell", role: "Batsman", avatar: "https://placehold.co/100x100.png", stats: { runs: 2800, wickets: 2, catches: 30, matchesPlayed: 92 }, teamId: "3" },
      { id: "P307", name: "Christian Parker", role: "All-rounder", avatar: "https://placehold.co/100x100.png", stats: { runs: 1500, wickets: 100, catches: 45, matchesPlayed: 80 }, teamId: "3" },
      { id: "P308", name: "Aubrey Edwards", role: "Bowler", avatar: "https://placehold.co/100x100.png", stats: { runs: 300, wickets: 180, catches: 15, matchesPlayed: 78 }, teamId: "3" },
      { id: "P309", name: "Julian Collins", role: "Batsman", avatar: "https://placehold.co/100x100.png", stats: { runs: 2200, wickets: 1, catches: 28, matchesPlayed: 83 }, teamId: "3" },
      { id: "P310", name: "Skylar Stewart", role: "Fielder", avatar: "https://placehold.co/100x100.png", stats: { runs: 200, wickets: 0, catches: 60, matchesPlayed: 70 }, teamId: "3" },
      { id: "P311", name: "Aaron Morris", role: "Reserve All-rounder", avatar: "https://placehold.co/100x100.png", stats: { runs: 800, wickets: 50, catches: 22, matchesPlayed: 40 }, teamId: "3" },
    ],
    performanceStats: {
      matchesPlayed: 25,
      wins: 18,
      losses: 6,
      draws: 1,
      winPercentage: "72%",
      titles: 3,
    },
    affiliation: "Maritzburg College", // Updated
  },
  {
    id: "4",
    schoolId: "school-4-glenwood-high-school", // Updated
    divisionId: "u16b", // Example valid division
    teamName: "U16",
    ageGroup: "U16",
    division: "B",
    mascot: "Grasshoppers", // Glenwood mascot example
    squad: Array.from({ length: 14 }, (_, i) => ({
      id: `P4${101 + i}`,
      name: `Player GHS ${i + 1}`, // Changed to reflect Glenwood
      role: i % 4 === 0 ? "Batsman" : i % 4 === 1 ? "Bowler" : i % 4 === 2 ? "All-rounder" : "Wicket-keeper",
      avatar: "https://placehold.co/100x100.png",
      stats: { runs: Math.floor(Math.random() * 500) + 50, wickets: Math.floor(Math.random() * 30), catches: Math.floor(Math.random() * 20) + 5, matchesPlayed: Math.floor(Math.random() * 15) + 5 },
      teamId: "4"
    })),
    performanceStats: {
      matchesPlayed: 15,
      wins: 9,
      losses: 5,
      draws: 1,
      winPercentage: "60%",
    },
    affiliation: "Glenwood High School", // Updated
  },
  {
    id: "5",
    schoolId: "school-7-westville-boys-high-school", // Updated to Westville
    divisionId: "u16a", // Example valid division
    teamName: "Colts XI",
    ageGroup: "U16", // Assuming Colts are U16 for this example
    division: "A",
    mascot: "Griffin", // Westville mascot example
    squad: Array.from({ length: 15 }, (_, i) => ({
      id: `P5${101 + i}`,
      name: `Player WBHS ${i + 1}`, // Changed to reflect Westville
      role: i % 3 === 0 ? "Batsman" : i % 3 === 1 ? "Bowler" : "All-rounder",
      avatar: "https://placehold.co/100x100.png",
      stats: { runs: Math.floor(Math.random() * 600) + 100, wickets: Math.floor(Math.random() * 40), catches: Math.floor(Math.random() * 25) + 5, matchesPlayed: Math.floor(Math.random() * 20) + 10 },
      teamId: "5"
    })),
    performanceStats: {
      matchesPlayed: 19,
      wins: 14,
      losses: 4,
      draws: 1,
      winPercentage: "73.7%",
      titles: 1,
    },
    affiliation: "Westville Boys' High School", // Updated
  },
];
