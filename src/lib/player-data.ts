
export interface PlayerSkills {
  technical?: { // Made categories optional
    batting?: number;
    bowling?: number;
    fielding?: number;
    allRounder?: number; // Added from OCR
    power?: number; // Added from OCR
  };
  tactical?: {
    experience?: number;
    strategy?: number;
    consistency?: number;
    leadership?: number; // Added from OCR
    versatility?: number; // Added from OCR
  };
  physicalMental?: {
    fitness?: number;
    strength?: number; // Added from OCR
    speed?: number; // Added from OCR
    concentration?: number;
    aggression?: number;
  };
}

export interface PlayerStats {
  matchesPlayed?: number;
  runs?: number;
  average?: number | string;
  strikeRate?: number | string;
  highestScore?: string;
  hundreds?: number;
  fifties?: number;
  wickets?: number;
  bowlingAverage?: number | string;
  economyRate?: number | string;
  bestBowling?: string; // e.g., "5/25"
  catches?: number;
  stumpings?: number;
}

export interface PlayerProfile {
  id: string;
  name: string;
  team: string;
  avatar: string;
  role: string;
  dateOfBirth?: string;
  battingStyle?: string;
  bowlingStyle?: string;
  bio?: string;
  stats: PlayerStats;
  careerSpan?: string; // e.g., "INTL: 2018 - Present"
  skills?: PlayerSkills; // Added skills
}

export const playersData: PlayerProfile[] = [
  {
    id: "player-1",
    name: "John Doe",
    team: "Eagles High School",
    avatar: "https://placehold.co/100x100.png",
    role: "All-rounder",
    dateOfBirth: "1998-05-15",
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm medium",
    careerSpan: "School Career: 2020 - Present",
    bio: "John is a dynamic all-rounder known for his aggressive batting and consistent bowling. He has been a key player for the Eagles, often turning matches with his versatile performances.",
    stats: {
      matchesPlayed: 50,
      runs: 1250,
      average: 31.25,
      strikeRate: 110.5,
      highestScore: "102*",
      hundreds: 1,
      fifties: 7,
      wickets: 50,
      bowlingAverage: 22.5,
      economyRate: 4.75,
      bestBowling: "4/35",
      catches: 25,
      stumpings: 0,
    },
    skills: {
      technical: { batting: 80, bowling: 75, fielding: 82, allRounder: 85, power: 78 },
      tactical: { experience: 70, strategy: 72, consistency: 65, leadership: 60, versatility: 80 },
      physicalMental: { fitness: 88, strength: 75, speed: 70, concentration: 68, aggression: 75 },
    },
  },
  {
    id: "player-2",
    name: "Jane Smith",
    team: "Panthers Academy",
    avatar: "https://placehold.co/100x100.png",
    role: "Wicket-keeper Batsman",
    dateOfBirth: "2000-02-20",
    battingStyle: "Left-hand bat",
    careerSpan: "Academy Career: 2021 - Present",
    bio: "Jane is an agile wicket-keeper and a reliable top-order batsman. Her sharp reflexes behind the stumps and ability to build innings make her an invaluable asset to the Panthers.",
    stats: {
      matchesPlayed: 45,
      runs: 980,
      average: 28.0,
      strikeRate: 95.0,
      highestScore: "85",
      hundreds: 0,
      fifties: 5,
      catches: 40,
      stumpings: 15,
    },
    skills: {
      technical: { batting: 78, fielding: 90, power: 65 },
      tactical: { experience: 65, strategy: 70, consistency: 75, leadership: 50 },
      physicalMental: { fitness: 80, strength: 60, speed: 75, concentration: 72, aggression: 60 },
    },
  },
  {
    id: "player-3",
    name: "Mike Brown",
    team: "Lions College",
    avatar: "https://placehold.co/100x100.png",
    role: "Opening Batsman",
    dateOfBirth: "1997-11-01",
    battingStyle: "Right-hand bat",
    careerSpan: "College Career: 2019 - 2023",
    bio: "Mike is a classic opening batsman with a penchant for long innings. He provides solid starts for the Lions and is known for his excellent technique against the new ball.",
    stats: {
      matchesPlayed: 60,
      runs: 2100,
      average: 42.0,
      strikeRate: 75.5,
      highestScore: "150",
      hundreds: 3,
      fifties: 12,
      catches: 12,
    },
    skills: {
      technical: { batting: 90, power: 70 },
      tactical: { experience: 85, strategy: 80, consistency: 88, leadership: 70 },
      physicalMental: { fitness: 75, strength: 65, speed: 60, concentration: 85, aggression: 50 },
    },
  },
   {
    id: "player-4",
    name: "Sarah Wilson",
    team: "Eagles High School",
    avatar: "https://placehold.co/100x100.png",
    role: "Fast Bowler",
    dateOfBirth: "1999-07-22",
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm fast",
    careerSpan: "School Career: 2020 - Present",
    bio: "Sarah leads the bowling attack for the Eagles with her express pace and ability to swing the ball. She is a genuine wicket-taker.",
    stats: {
      matchesPlayed: 40,
      runs: 150,
      average: 10.0,
      wickets: 75,
      bowlingAverage: 18.5,
      economyRate: 4.2,
      bestBowling: "6/20",
      catches: 8,
    },
    skills: {
      technical: { bowling: 92, power: 60 }, // Power more related to batting, but could be bowling power too
      tactical: { experience: 75, strategy: 78, consistency: 70 },
      physicalMental: { fitness: 85, strength: 70, speed: 80, concentration: 75, aggression: 85 },
    },
  },
];
