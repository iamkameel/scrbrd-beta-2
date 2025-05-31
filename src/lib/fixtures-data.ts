export interface Fixture {
  id: number;
  teamAId: string;
  teamBId: string;
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
    teamAId: "team_northwood_1st",
    teamBId: "team_panthers_academy",
    date: "2024-09-15",
    time: "10:00 AM",
    location: "Northwood Main Oval",
    status: "Upcoming",
    umpires: ["Mr. A. Smith", "Ms. B. Jones"],
    scorers: ["Mr. C. Davis (Northwood)", "Ms. D. Wilson (Panthers)"]
  },
  {
    id: 2,
    teamAId: "team_hillcrest_u16",
    teamBId: "team_knights_school",
    date: "2024-09-22",
    time: "02:00 PM",
    location: "Hillcrest College Green",
    status: "Scheduled", // Changed from Upcoming
    umpires: ["Mr. E. Evans"],
    scorers: ["Mr. F. Green (Hillcrest)"]
  },
  {
    id: 3,
    teamAId: "team_riverdale_seniors",
    teamBId: "team_sharks_united",
    date: "2024-08-10",
    time: "09:30 AM",
    location: "City Stadium",
    status: "Completed" // Changed from Past
  },
  {
    id: 4,
    teamAId: "team_michaelhouse_colts",
    teamBId: "team_northwood_u15a",
    date: "2024-09-29",
    time: "10:00 AM",
    location: "Michaelhouse Oval",
    status: "Upcoming"
  },
  {
    id: 5,
    teamAId: "team_panthers_academy",
    teamBId: "team_hillcrest_u16",
    date: "2024-08-17",
    time: "01:00 PM",
    location: "Academy Ground",
    status: "Completed" // Changed from Past
  },
  {
    id: 6,
    teamAId: "team_northwood_1st",
    teamBId: "team_michaelhouse_colts",
    date: "2024-07-20",
    time: "10:00 AM",
    location: "Northwood Main Oval",
    status: "Completed" // Changed from Past
  },
  {
    id: 7,
    teamAId: "team_dhs_1st",
    teamBId: "team_glenwood_1st",
    date: "2024-10-05",
    time: "09:00 AM",
    location: "DHS Memorial Ground",
    status: "Live",
    umpires: ["Mr. G. Adams", "Ms. H. Bell"],
    scorers: ["Mr. I. Cole (DHS)", "Ms. J. Dean (Glenwood)"]
  },
  {
    id: 8,
    teamAId: "team_kearsney_u14a",
    teamBId: "team_wbhs_u14a",
    date: "2024-10-12",
    time: "01:30 PM",
    location: "Kearsney AH Smith Oval",
    status: "Rain-Delay"
  },
   {
    id: 9,
    teamAId: "team_clifton_u15a",
    teamBId: "team_stcharles_u15a",
    date: "2024-08-25",
    time: "10:00 AM",
    location: "Clifton Riverside",
    status: "Match Abandoned"
  },
  {
    id: 10,
    teamAId: "team_maritzburg_2nd",
    teamBId: "team_hilton_2nd",
    date: "2024-10-19",
    time: "09:45 AM",
    location: "Goldstones",
    status: "Play Suspended"
  },
];