
export interface Result {
  id: number; // Unique ID for the result itself
  fixtureId: number; // Corresponds to Fixture.id in fixtures-data.ts
  teamA: string;
  teamAScore: string;
  teamB: string;
  teamBScore: string;
  winner: string;
  margin: string;
  playerOfTheMatch: string;
}

export const resultsData: Result[] = [
  {
    id: 1,
    fixtureId: 3, // Corresponds to Riverdale Cricket Club Seniors vs Sharks United
    teamA: "Riverdale Cricket Club Seniors", teamAScore: "185/7 (20 Ov)",
    teamB: "Sharks United", teamBScore: "170/9 (20 Ov)",
    winner: "Riverdale Cricket Club Seniors", margin: "15 runs",
    playerOfTheMatch: "L. Walker (Riverdale - 55 runs, 2 wkts)"
  },
  {
    id: 2,
    fixtureId: 5, // Corresponds to Panthers Academy vs Hillcrest College U16
    teamA: "Panthers Academy", teamAScore: "150/8 (20 Ov)",
    teamB: "Hillcrest College U16", teamBScore: "151/5 (18.3 Ov)",
    winner: "Hillcrest College U16", margin: "5 wickets",
    playerOfTheMatch: "Player HC 3 (Hillcrest - 65* runs)"
  },
  {
    id: 3,
    fixtureId: 6, // Corresponds to Northwood School 1st XI vs Michaelhouse Colts XI
    teamA: "Northwood School 1st XI", teamAScore: "205/4 (20 Ov)",
    teamB: "Michaelhouse Colts XI", teamBScore: "180/9 (20 Ov)",
    winner: "Northwood School 1st XI", margin: "25 runs",
    playerOfTheMatch: "E. Miller (Northwood - 88* runs)"
  },
  // Example of a result for a fixture that might not be in the top teams' lists but exists in general fixtures
  {
    id: 4, // New ID for this result
    fixtureId: 2, // Assuming fixture with ID 2 is 'Past', (Hillcrest College U16 vs Knights School)
                 // Need to ensure fixture ID 2 in fixtures-data.ts is marked 'Past' for this to be logical.
                 // For now, let's assume it's a placeholder. If fixture 2 is 'Upcoming', this result wouldn't typically exist.
    teamA: "Hillcrest College U16", teamAScore: "170/6 (20 Ov)",
    teamB: "Knights School", teamBScore: "165/8 (20 Ov)",
    winner: "Hillcrest College U16", margin: "5 runs",
    playerOfTheMatch: "Jane Doe (Hillcrest - 45 runs, 1 wkt)"
  }
];
