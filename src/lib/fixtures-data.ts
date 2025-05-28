
export interface Fixture {
  id: number;
  teamA: string;
  teamB: string;
  date: string;
  time: string;
  location: string;
  status: "Upcoming" | "Past" | "Live"; // Added "Live" status
  umpires?: string[];
  scorers?: string[];
}

export const fixtures: Fixture[] = [
  { 
    id: 1, 
    teamA: "Northwood School 1st XI", 
    teamB: "Panthers Academy", 
    date: "2024-09-15", 
    time: "10:00 AM", 
    location: "Northwood Main Oval", 
    status: "Upcoming",
    umpires: ["Mr. A. Smith", "Ms. B. Jones"],
    scorers: ["Mr. C. Davis (Northwood)", "Ms. D. Wilson (Panthers)"]
  },
  { 
    id: 2, 
    teamA: "Hillcrest College U16", 
    teamB: "Knights School", 
    date: "2024-09-22", 
    time: "02:00 PM", 
    location: "Hillcrest College Green", 
    status: "Upcoming",
    umpires: ["Mr. E. Evans"],
    scorers: ["Mr. F. Green (Hillcrest)"]
  },
  { 
    id: 3, 
    teamA: "Riverdale Cricket Club Seniors", 
    teamB: "Sharks United", 
    date: "2024-08-10", 
    time: "09:30 AM", 
    location: "City Stadium", 
    status: "Past" 
  },
  { 
    id: 4, 
    teamA: "Michaelhouse Colts XI", 
    teamB: "Northwood School U15A", 
    date: "2024-09-29", 
    time: "10:00 AM", 
    location: "Michaelhouse Oval", 
    status: "Upcoming" 
    // No umpires or scorers assigned yet for this fixture
  },
  { 
    id: 5, 
    teamA: "Panthers Academy", 
    teamB: "Hillcrest College U16", 
    date: "2024-08-17", 
    time: "01:00 PM", 
    location: "Academy Ground", 
    status: "Past" 
  },
  { 
    id: 6, 
    teamA: "Northwood School 1st XI", 
    teamB: "Michaelhouse Colts XI", 
    date: "2024-07-20", 
    time: "10:00 AM", 
    location: "Northwood Main Oval", 
    status: "Past" 
  },
];

// Helper function to get team name including affiliation if it's part of a known structure
// This is a conceptual helper, actual team naming in fixtures should be consistent.
// For this prototype, teamA and teamB in fixtures should match affiliation + teamName from detailedTeamsData
// e.g. "Northwood School 1st XI"
