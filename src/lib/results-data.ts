
export interface BatsmanScore {
  name: string;
  dismissal: string; 
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: string; 
}

export interface BowlerScore {
  name: string;
  overs: string;
  maidens: number;
  runsConceded: number;
  wickets: number;
  economyRate: string;
}

export interface FallOfWicket {
  score: number; 
  wicket: number; 
  batsmanOut: string;
  over: string; 
}

export interface InningsData {
  inningsNumber: number;
  battingTeam: string;
  bowlingTeam: string;
  battingScores: BatsmanScore[];
  extras: {
    total: number;
    details: string; // e.g., (B: 2, LB: 1, W: 5, NB: 0)
  };
  totalScoreString: string; // e.g., "185/7"
  oversPlayed: string; // e.g., "20 overs"
  bowlingScores: BowlerScore[];
  fallOfWickets?: FallOfWicket[];
}

export interface Result {
  id: number; // Unique ID for the result itself
  fixtureId: number; // Corresponds to Fixture.id in fixtures-data.ts
  teamA: string;
  teamAScore: string; // Summary score string
  teamB: string;
  teamBScore: string; // Summary score string
  winner: string;
  margin: string;
  playerOfTheMatch: string;
  innings?: InningsData[]; // Array of detailed innings
}

export const resultsData: Result[] = [
  {
    id: 1,
    fixtureId: 3, // Corresponds to Riverdale Cricket Club Seniors vs Sharks United
    teamA: "Riverdale Cricket Club Seniors", teamAScore: "185/7",
    teamB: "Sharks United", teamBScore: "170/9",
    winner: "Riverdale Cricket Club Seniors", margin: "15 runs",
    playerOfTheMatch: "L. Walker (Riverdale - 55 runs, 2 wkts)",
    innings: [
      {
        inningsNumber: 1,
        battingTeam: "Riverdale Cricket Club Seniors",
        bowlingTeam: "Sharks United",
        battingScores: [
          { name: "A. North", dismissal: "c Sub b S. Archer", runs: 25, balls: 20, fours: 3, sixes: 1, strikeRate: "125.00" },
          { name: "B. South", dismissal: "lbw b J. Fast", runs: 10, balls: 15, fours: 1, sixes: 0, strikeRate: "66.67" },
          { name: "L. Walker", dismissal: "not out", runs: 55, balls: 40, fours: 5, sixes: 2, strikeRate: "137.50" },
          { name: "C. West", dismissal: "b J. Fast", runs: 30, balls: 25, fours: 4, sixes: 0, strikeRate: "120.00" },
          { name: "D. East", dismissal: "run out (P. Quick)", runs: 15, balls: 10, fours: 2, sixes: 0, strikeRate: "150.00" },
          { name: "E. Player", dismissal: "c Keeper b S. Archer", runs: 5, balls: 5, fours: 0, sixes: 0, strikeRate: "100.00" },
          { name: "F. Player", dismissal: "b M. Spinner", runs: 20, balls: 15, fours: 1, sixes: 1, strikeRate: "133.33" },
        ],
        extras: { total: 10, details: "(B: 2, LB: 1, W: 5, NB: 2)" },
        totalScoreString: "185/7",
        oversPlayed: "20 overs",
        bowlingScores: [
          { name: "J. Fast", overs: "4.0", maidens: 0, runsConceded: 30, wickets: 2, economyRate: "7.50" },
          { name: "S. Archer", overs: "4.0", maidens: 0, runsConceded: 40, wickets: 2, economyRate: "10.00" },
          { name: "M. Spinner", overs: "4.0", maidens: 0, runsConceded: 35, wickets: 1, economyRate: "8.75" },
          { name: "P. Medium", overs: "4.0", maidens: 0, runsConceded: 40, wickets: 0, economyRate: "10.00" },
          { name: "K. Allround", overs: "4.0", maidens: 0, runsConceded: 30, wickets: 0, economyRate: "7.50" },
        ],
        fallOfWickets: [
            { score: 30, wicket: 1, batsmanOut: "B. South", over: "4.2" },
            { score: 70, wicket: 2, batsmanOut: "A. North", over: "8.5" },
            { score: 120, wicket: 3, batsmanOut: "C. West", over: "13.1" },
        ]
      },
      {
        inningsNumber: 2,
        battingTeam: "Sharks United",
        bowlingTeam: "Riverdale Cricket Club Seniors",
        battingScores: [
          { name: "G. Shark", dismissal: "b L. Walker", runs: 30, balls: 25, fours: 4, sixes: 0, strikeRate: "120.00" },
          { name: "H. Fish", dismissal: "c C. West b D. East", runs: 20, balls: 18, fours: 2, sixes: 0, strikeRate: "111.11" },
          { name: "I. Player", dismissal: "not out", runs: 45, balls: 35, fours: 3, sixes: 1, strikeRate: "128.57" },
          { name: "J. Player", dismissal: "b L. Walker", runs: 15, balls: 15, fours: 1, sixes: 0, strikeRate: "100.00" },
          { name: "K. Player", dismissal: "lbw b A. North", runs: 10, balls: 10, fours: 1, sixes: 0, strikeRate: "100.00" },
        ],
        extras: { total: 8, details: "(LB: 3, W: 4, NB: 1)" },
        totalScoreString: "170/9",
        oversPlayed: "20 overs",
        bowlingScores: [
          { name: "L. Walker", overs: "4.0", maidens: 0, runsConceded: 25, wickets: 2, economyRate: "6.25" },
          { name: "D. East", overs: "4.0", maidens: 0, runsConceded: 35, wickets: 1, economyRate: "8.75" },
          { name: "A. North", overs: "4.0", maidens: 0, runsConceded: 30, wickets: 1, economyRate: "7.50" },
          { name: "E. Player", overs: "4.0", maidens: 0, runsConceded: 40, wickets: 0, economyRate: "10.00" },
          { name: "F. Player", overs: "4.0", maidens: 0, runsConceded: 32, wickets: 0, economyRate: "8.00" },
        ],
      }
    ]
  },
  {
    id: 2,
    fixtureId: 5, // Corresponds to Panthers Academy vs Hillcrest College U16
    teamA: "Panthers Academy", teamAScore: "150/8",
    teamB: "Hillcrest College U16", teamBScore: "151/5",
    winner: "Hillcrest College U16", margin: "5 wickets",
    playerOfTheMatch: "Player HC 3 (Hillcrest - 65* runs)"
    // No detailed innings for this one yet
  },
  {
    id: 3,
    fixtureId: 6, // Corresponds to Northwood School 1st XI vs Michaelhouse Colts XI
    teamA: "Northwood School 1st XI", teamAScore: "205/4",
    teamB: "Michaelhouse Colts XI", teamBScore: "180/9",
    winner: "Northwood School 1st XI", margin: "25 runs",
    playerOfTheMatch: "E. Miller (Northwood - 88* runs)"
    // No detailed innings for this one yet
  },
  {
    id: 4,
    fixtureId: 2, 
    teamA: "Hillcrest College U16", teamAScore: "170/6",
    teamB: "Knights School", teamBScore: "165/8",
    winner: "Hillcrest College U16", margin: "5 runs",
    playerOfTheMatch: "Jane Doe (Hillcrest - 45 runs, 1 wkt)"
    // No detailed innings for this one yet
  }
];
