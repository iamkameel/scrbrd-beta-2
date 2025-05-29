
export interface Fixture {
  id: number;
  teamA: string;
  teamB: string;
  date: string;
  time: string;
  location: string;
  status: "Scheduled" | "Upcoming" | "Live" | "Completed" | "Match Abandoned" | "Rain-Delay" | "Play Suspended";
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
    status: "Scheduled", // Changed from Upcoming
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
    status: "Completed" // Changed from Past
  },
  { 
    id: 4, 
    teamA: "Michaelhouse Colts XI", 
    teamB: "Northwood School U15A", 
    date: "2024-09-29", 
    time: "10:00 AM", 
    location: "Michaelhouse Oval", 
    status: "Upcoming" 
  },
  { 
    id: 5, 
    teamA: "Panthers Academy", 
    teamB: "Hillcrest College U16", 
    date: "2024-08-17", 
    time: "01:00 PM", 
    location: "Academy Ground", 
    status: "Completed" // Changed from Past
  },
  { 
    id: 6, 
    teamA: "Northwood School 1st XI", 
    teamB: "Michaelhouse Colts XI", 
    date: "2024-07-20", 
    time: "10:00 AM", 
    location: "Northwood Main Oval", 
    status: "Completed" // Changed from Past
  },
  {
    id: 7,
    teamA: "Durban High School (DHS) 1st XI",
    teamB: "Glenwood High School 1st XI",
    date: "2024-10-05",
    time: "09:00 AM",
    location: "DHS Memorial Ground",
    status: "Live",
    umpires: ["Mr. G. Adams", "Ms. H. Bell"],
    scorers: ["Mr. I. Cole (DHS)", "Ms. J. Dean (Glenwood)"]
  },
  {
    id: 8,
    teamA: "Kearsney College U14A",
    teamB: "Westville Boys' High U14A",
    date: "2024-10-12",
    time: "01:30 PM",
    location: "Kearsney AH Smith Oval",
    status: "Rain-Delay" 
  },
   {
    id: 9,
    teamA: "Clifton School U15A",
    teamB: "St Charles College U15A",
    date: "2024-08-25",
    time: "10:00 AM",
    location: "Clifton Riverside",
    status: "Match Abandoned"
  },
  {
    id: 10,
    teamA: "Maritzburg College 2nd XI",
    teamB: "Hilton College 2nd XI",
    date: "2024-10-19",
    time: "09:45 AM",
    location: "Goldstones",
    status: "Play Suspended"
  },
];
