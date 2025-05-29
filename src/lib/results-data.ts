
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

export interface BallEvent {
  over: number;
  ball: number;
  batsman: string;
  bowler: string;
  runs: number;
  isExtra: boolean;
  extraType?: string; // e.g., "wide", "no-ball", "bye", "leg-bye"
  isWicket: boolean;
  wicketType?: string; // e.g., "caught", "bowled", "lbw"
  dismissedBatsman?: string;
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
  ballEvents?: BallEvent[]; // Optional field for ball-by-ball data
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
            { score: 140, wicket: 4, batsmanOut: "D. East", over: "15.3" },
            { score: 150, wicket: 5, batsmanOut: "E. Player", over: "16.4" },
            { score: 180, wicket: 6, batsmanOut: "F. Player", over: "19.2" },
        ],
        ballEvents: [
          // Dummy ball-by-ball data for the first few overs
          { over: 0, ball: 1, batsman: "A. North", bowler: "J. Fast", runs: 0, isExtra: false, isWicket: false },
          { over: 0, ball: 2, batsman: "A. North", bowler: "J. Fast", runs: 1, isExtra: false, isWicket: false },
          { over: 0, ball: 3, batsman: "B. South", bowler: "J. Fast", runs: 0, isExtra: false, isWicket: false },
          { over: 0, ball: 4, batsman: "B. South", bowler: "J. Fast", runs: 4, isExtra: false, isWicket: false },
          { over: 0, ball: 5, batsman: "B. South", bowler: "J. Fast", runs: 0, isExtra: false, isWicket: false },
          { over: 0, ball: 6, batsman: "B. South", bowler: "J. Fast", runs: 1, isExtra: false, isWicket: false }, // End of over 1 (Score: 6/0)

          { over: 1, ball: 1, batsman: "A. North", bowler: "S. Archer", runs: 2, isExtra: false, isWicket: false },
          { over: 1, ball: 2, batsman: "A. North", bowler: "S. Archer", runs: 0, isExtra: false, isWicket: false },
          { over: 1, ball: 3, batsman: "A. North", bowler: "S. Archer", runs: 6, isExtra: false, isWicket: false },
          { over: 1, ball: 4, batsman: "A. North", bowler: "S. Archer", runs: 0, isExtra: false, isWicket: false },
          { over: 1, ball: 5, batsman: "A. North", bowler: "S. Archer", runs: 4, isExtra: false, isWicket: false },
          { over: 1, ball: 6, batsman: "A. North", bowler: "S. Archer", runs: 1, isExtra: false, isWicket: false }, // End of over 2 (Score: 19/0)

          { over: 2, ball: 1, batsman: "B. South", bowler: "J. Fast", runs: 0, isExtra: false, isWicket: false },
          { over: 2, ball: 2, batsman: "B. South", bowler: "J. Fast", runs: 1, isExtra: false, isWicket: false },
          { over: 2, ball: 3, batsman: "A. North", bowler: "J. Fast", runs: 1, isExtra: false, isWicket: false },
          { over: 2, ball: 4, batsman: "B. South", bowler: "J. Fast", runs: 0, isExtra: false, isWicket: false },
          { over: 2, ball: 5, batsman: "B. South", bowler: "J. Fast", runs: 2, isExtra: false, isWicket: false },
          { over: 2, ball: 6, batsman: "B. South", bowler: "J. Fast", runs: 0, isExtra: false, isWicket: false }, // End of over 3 (Score: 23/0)

          { over: 3, ball: 1, batsman: "A. North", bowler: "S. Archer", runs: 1, isExtra: false, isWicket: false },
          { over: 3, ball: 2, batsman: "B. South", bowler: "S. Archer", runs: 1, isExtra: false, isWicket: false },
          { over: 3, ball: 3, batsman: "A. North", bowler: "S. Archer", runs: 0, isExtra: false, isWicket: false },
          { over: 3, ball: 4, batsman: "A. North", bowler: "S. Archer", runs: 4, isExtra: false, isWicket: false },
          { over: 3, ball: 5, batsman: "A. North", bowler: "S. Archer", runs: 0, isExtra: false, isWicket: false },
          { over: 3, ball: 6, batsman: "A. North", bowler: "S. Archer", runs: 1, isExtra: false, isWicket: false }, // End of over 4 (Score: 30/0)

          { over: 4, ball: 1, batsman: "B. South", bowler: "J. Fast", runs: 0, isExtra: false, isWicket: false },
          { over: 4, ball: 2, batsman: "B. South", bowler: "J. Fast", runs: 0, isExtra: false, isWicket: true, wicketType: "lbw", dismissedBatsman: "B. South" }, // Wicket!
          // Partnership 1: A. North & B. South (30 runs)

          { over: 4, ball: 3, batsman: "L. Walker", bowler: "J. Fast", runs: 1, isExtra: false, isWicket: false },
          { over: 4, ball: 4, batsman: "A. North", bowler: "J. Fast", runs: 0, isExtra: false, isWicket: false },
          { over: 4, ball: 5, batsman: "A. North", bowler: "J. Fast", runs: 4, isExtra: false, isWicket: false },
          { over: 4, ball: 6, batsman: "A. North", bowler: "J. Fast", runs: 1, isExtra: false, isWicket: false }, // End of over 5 (Score: 36/1)
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
          { name: "L. Player", dismissal: "c Keeper b E. Player", runs: 5, balls: 8, fours: 0, sixes: 0, strikeRate: "62.50"},
          { name: "M. Player", dismissal: "st F. Player b A. North", runs: 12, balls: 10, fours: 1, sixes: 0, strikeRate: "120.00"},
          { name: "N. Player", dismissal: "run out (B. South)", runs: 8, balls: 7, fours: 1, sixes: 0, strikeRate: "114.28"},
          { name: "O. Player", dismissal: "b D. East", runs: 2, balls: 4, fours: 0, sixes: 0, strikeRate: "50.00"},
        ],
        extras: { total: 8, details: "(LB: 3, W: 4, NB: 1)" },
        totalScoreString: "170/9",
        oversPlayed: "20 overs",
        bowlingScores: [
          { name: "L. Walker", overs: "4.0", maidens: 0, runsConceded: 25, wickets: 2, economyRate: "6.25" },
          { name: "D. East", overs: "4.0", maidens: 0, runsConceded: 35, wickets: 2, economyRate: "8.75" },
          { name: "A. North", overs: "4.0", maidens: 0, runsConceded: 30, wickets: 2, economyRate: "7.50" },
          { name: "E. Player", overs: "4.0", maidens: 0, runsConceded: 40, wickets: 1, economyRate: "10.00" },
          { name: "F. Player", overs: "4.0", maidens: 0, runsConceded: 32, wickets: 1, economyRate: "8.00" },
        ],
        fallOfWickets: [
          { score: 40, wicket: 1, batsmanOut: "G. Shark", over: "5.1" },
          { score: 65, wicket: 2, batsmanOut: "H. Fish", over: "8.3" },
          { score: 90, wicket: 3, batsmanOut: "J. Player", over: "11.5" },
          { score: 110, wicket: 4, batsmanOut: "K. Player", over: "14.2" },
          { score: 120, wicket: 5, batsmanOut: "L. Player", over: "16.1" },
          { score: 145, wicket: 6, batsmanOut: "M. Player", over: "18.0" },
          { score: 158, wicket: 7, batsmanOut: "N. Player", over: "19.0" },
          { score: 165, wicket: 8, batsmanOut: "O. Player", over: "19.4" },
        ]
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

