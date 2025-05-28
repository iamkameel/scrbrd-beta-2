
// Placeholder player and team data for the team details page

export interface Player {
  id: string;
  name: string;
  role: string; // e.g., Batsman, Bowler, All-rounder, Wicket-keeper
  avatar: string; // URL to placeholder image
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
  id: number;
  teamName: string;
  affiliation: string;
  ageGroup: string;
  division: string;
  mascot?: string;
  squad: Player[];
  performanceStats: TeamPerformanceStats;
  // Fixtures will be filtered from a separate data source
}

// Sample detailed data for a few teams
export const detailedTeamsData: Team[] = [
  {
    id: 1,
    teamName: "1st XI",
    affiliation: "Northwood School",
    ageGroup: "Open",
    division: "A",
    mascot: "Knights",
    squad: [
      { id: "P101", name: "Ethan Miller", role: "Captain / Batsman", avatar: "https://placehold.co/100x100.png" },
      { id: "P102", name: "Olivia Garcia", role: "Vice-Captain / All-rounder", avatar: "https://placehold.co/100x100.png" },
      { id: "P103", name: "Liam Davies", role: "Wicket-keeper / Batsman", avatar: "https://placehold.co/100x100.png" },
      { id: "P104", name: "Sophia Wilson", role: "Opening Bowler", avatar: "https://placehold.co/100x100.png" },
      { id: "P105", name: "Noah Brown", role: "Spinner", avatar: "https://placehold.co/100x100.png" },
      { id: "P106", name: "Ava Jones", role: "Middle-order Batsman", avatar: "https://placehold.co/100x100.png" },
      { id: "P107", name: "Lucas Rodriguez", role: "Fast Bowler", avatar: "https://placehold.co/100x100.png" },
      { id: "P108", name: "Isabella Smith", role: "All-rounder", avatar: "https://placehold.co/100x100.png" },
      { id: "P109", name: "Mason Taylor", role: "Batsman", avatar: "https://placehold.co/100x100.png" },
      { id: "P110", name: "Chloe Evans", role: "Bowler", avatar: "https://placehold.co/100x100.png" },
      { id: "P111", name: "Jacob White", role: "Reserve Batsman", avatar: "https://placehold.co/100x100.png" },
      { id: "P112", name: "Mia Harris", role: "Reserve Bowler", avatar: "https://placehold.co/100x100.png" },
      { id: "P113", name: "William King", role: "Opening Batsman", avatar: "https://placehold.co/100x100.png" },
      { id: "P114", name: "Ella Wright", role: "Fielder", avatar: "https://placehold.co/100x100.png" },
      { id: "P115", name: "James Lee", role: "All-rounder", avatar: "https://placehold.co/100x100.png" },
    ],
    performanceStats: {
      matchesPlayed: 20,
      wins: 15,
      losses: 4,
      draws: 1,
      winPercentage: "75%",
      titles: 2,
    },
  },
  {
    id: 2,
    teamName: "U15A",
    affiliation: "Northwood School",
    ageGroup: "U15",
    division: "A",
    mascot: "Knights",
    squad: [
      { id: "P201", name: "Aiden Clark", role: "Captain / Batsman", avatar: "https://placehold.co/100x100.png" },
      { id: "P202", name: "Zoe Lewis", role: "Bowler", avatar: "https://placehold.co/100x100.png" },
      { id: "P203", name: "Ryan Hall", role: "Wicket-keeper", avatar: "https://placehold.co/100x100.png" },
      { id: "P204", name: "Grace Allen", role: "All-rounder", avatar: "https://placehold.co/100x100.png" },
      { id: "P205", name: "Owen Young", role: "Batsman", avatar: "https://placehold.co/100x100.png" },
      { id: "P206", name: "Lily Scott", role: "Spinner", avatar: "https://placehold.co/100x100.png" },
      { id: "P207", name: "Carter Green", role: "Fast Bowler", avatar: "https://placehold.co/100x100.png" },
      { id: "P208", name: "Nora Adams", role: "Batsman", avatar: "https://placehold.co/100x100.png" },
      { id: "P209", name: "Isaac Baker", role: "All-rounder", avatar: "https://placehold.co/100x100.png" },
      { id: "P210", name: "Hannah Nelson", role: "Bowler", avatar: "https://placehold.co/100x100.png" },
      { id: "P211", name: "Caleb Hill", role: "Batsman", avatar: "https://placehold.co/100x100.png" },
      { id: "P212", name: "Penelope Ramirez", role: "Fielder", avatar: "https://placehold.co/100x100.png" },
    ],
    performanceStats: {
      matchesPlayed: 18,
      wins: 12,
      losses: 5,
      draws: 1,
      winPercentage: "67%",
      titles: 1,
    },
  },
  {
    id: 3,
    teamName: "Seniors",
    affiliation: "Riverdale Cricket Club",
    ageGroup: "Senior",
    division: "Premier League",
    mascot: "Panthers",
    squad: [
      { id: "P301", name: "Logan Walker", role: "Captain / All-rounder", avatar: "https://placehold.co/100x100.png" },
      { id: "P302", name: "Victoria Perez", role: "Opening Batsman", avatar: "https://placehold.co/100x100.png" },
      { id: "P303", name: "Gabriel Roberts", role: "Fast Bowler", avatar: "https://placehold.co/100x100.png" },
      { id: "P304", name: "Evelyn Turner", role: "Wicket-keeper / Batsman", avatar: "https://placehold.co/100x100.png" },
      { id: "P305", name: "Anthony Phillips", role: "Spinner", avatar: "https://placehold.co/100x100.png" },
      { id: "P306", name: "Natalie Campbell", role: "Batsman", avatar: "https://placehold.co/100x100.png" },
      { id: "P307", name: "Christian Parker", role: "All-rounder", avatar: "https://placehold.co/100x100.png" },
      { id: "P308", name: "Aubrey Edwards", role: "Bowler", avatar: "https://placehold.co/100x100.png" },
      { id: "P309", name: "Julian Collins", role: "Batsman", avatar: "https://placehold.co/100x100.png" },
      { id: "P310", name: "Skylar Stewart", role: "Fielder", avatar: "https://placehold.co/100x100.png" },
      { id: "P311", name: "Aaron Morris", role: "Reserve All-rounder", avatar: "https://placehold.co/100x100.png" },
    ],
    performanceStats: {
      matchesPlayed: 25,
      wins: 18,
      losses: 6,
      draws: 1,
      winPercentage: "72%",
      titles: 3,
    },
  },
  // Add more teams as needed, copying the structure from teamsData in /src/app/teams/page.tsx for basic info
  // and then adding squad and performanceStats.
  {
    id: 4,
    teamName: "U16",
    affiliation: "Hillcrest College",
    ageGroup: "U16",
    division: "B",
    mascot: "Lions",
    squad: Array.from({ length: 14 }, (_, i) => ({
      id: `P4${101 + i}`,
      name: `Player HC ${i + 1}`,
      role: i % 4 === 0 ? "Batsman" : i % 4 === 1 ? "Bowler" : i % 4 === 2 ? "All-rounder" : "Wicket-keeper",
      avatar: "https://placehold.co/100x100.png",
    })),
    performanceStats: {
      matchesPlayed: 15,
      wins: 9,
      losses: 5,
      draws: 1,
      winPercentage: "60%",
    },
  },
  {
    id: 5,
    teamName: "Colts XI",
    affiliation: "Michaelhouse",
    ageGroup: "U16",
    division: "A",
    mascot: "Knights", // Michaelhouse mascot can vary, using generic 'Knights' if not specific
    squad: Array.from({ length: 15 }, (_, i) => ({
      id: `P5${101 + i}`,
      name: `Player MH ${i + 1}`,
      role: i % 3 === 0 ? "Batsman" : i % 3 === 1 ? "Bowler" : "All-rounder",
      avatar: "https://placehold.co/100x100.png",
    })),
    performanceStats: {
      matchesPlayed: 19,
      wins: 14,
      losses: 4,
      draws: 1,
      winPercentage: "73.7%",
      titles: 1,
    },
  },
];
