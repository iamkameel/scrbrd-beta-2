
export interface ScoredMatch {
  fixtureId: number;
  matchDescription: string; // e.g., "Team A vs Team B"
  date: string;
  result?: string; // e.g., "Team A won by 5 wickets"
}

export interface ScorerProfile {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  certificationLevel: "Club Scorer" | "Level 1" | "Level 2" | "Advanced";
  availability: "Weekends Only" | "Weekdays Available" | "Fully Available";
  experienceYears: number;
  assignedMatchesCount: number;
  reliabilityScore?: number; // Optional: 0-100
  associatedSchoolOrClub?: string;
  bio?: string;
  recentMatchesScored: ScoredMatch[];
}

export const scorersData: ScorerProfile[] = [
  {
    id: "scorer-1",
    name: "Alice Wonderland",
    avatar: "https://placehold.co/100x100.png",
    email: "alice.w@example.com",
    phone: "555-0101",
    certificationLevel: "Level 2",
    availability: "Weekends Only",
    experienceYears: 5,
    assignedMatchesCount: 75,
    reliabilityScore: 95,
    associatedSchoolOrClub: "Northwood School",
    bio: "Dedicated Level 2 scorer with 5 years of experience, primarily covering school league matches. Known for accuracy and attention to detail.",
    recentMatchesScored: [
      { fixtureId: 1, matchDescription: "Northwood School 1st XI vs Panthers Academy", date: "2024-09-15", result: "Pending" },
      { fixtureId: 3, matchDescription: "Riverdale Cricket Club Seniors vs Sharks United", date: "2024-08-10", result: "Riverdale won by 15 runs" },
    ],
  },
  {
    id: "scorer-2",
    name: "Bob The Builder",
    avatar: "https://placehold.co/100x100.png",
    email: "bob.b@example.com",
    phone: "555-0102",
    certificationLevel: "Advanced",
    availability: "Fully Available",
    experienceYears: 10,
    assignedMatchesCount: 210,
    reliabilityScore: 98,
    associatedSchoolOrClub: "KZN Cricket Union",
    bio: "Advanced scorer with a decade of experience across various levels including provincial games. Available for all fixture types.",
    recentMatchesScored: [
      { fixtureId: 5, matchDescription: "Panthers Academy vs Hillcrest College U16", date: "2024-08-17", result: "Hillcrest won by 5 wickets" },
      { fixtureId: 7, matchDescription: "DHS 1st XI vs Glenwood 1st XI", date: "2024-10-05", result: "Live" },
    ],
  },
  {
    id: "scorer-3",
    name: "Charlie Brown",
    avatar: "https://placehold.co/100x100.png",
    email: "charlie.b@example.com",
    phone: "555-0103",
    certificationLevel: "Level 1",
    availability: "Weekdays Available",
    experienceYears: 2,
    assignedMatchesCount: 30,
    associatedSchoolOrClub: "Westville Boys' High School",
    bio: "Enthusiastic Level 1 scorer, quick learner and available for weekday matches. Primarily supports WBHS fixtures.",
    recentMatchesScored: [
      { fixtureId: 2, matchDescription: "Hillcrest College U16 vs Knights School", date: "2024-09-22", result: "Pending" },
    ],
  },
  {
    id: "scorer-4",
    name: "Diana Prince",
    avatar: "https://placehold.co/100x100.png",
    email: "diana.p@example.com",
    phone: "555-0104",
    certificationLevel: "Club Scorer",
    availability: "Weekends Only",
    experienceYears: 1,
    assignedMatchesCount: 15,
    reliabilityScore: 90,
    bio: "New club scorer, keen to gain more experience. Reliable for weekend club games.",
    recentMatchesScored: [],
  },
];
