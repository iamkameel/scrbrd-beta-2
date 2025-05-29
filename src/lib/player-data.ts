
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
  id: string; // Using string for ID for flexibility, e.g., "player-1"
  name: string;
  team: string; // Could be a team ID or name
  avatar: string;
  role: string; // e.g., "Opening Batsman", "Fast Bowler", "All-rounder"
  dateOfBirth?: string;
  battingStyle?: string; // e.g., "Right-hand bat", "Left-hand bat"
  bowlingStyle?: string; // e.g., "Right-arm fast", "Left-arm orthodox"
  bio?: string;
  stats: PlayerStats;
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
  },
  {
    id: "player-2",
    name: "Jane Smith",
    team: "Panthers Academy",
    avatar: "https://placehold.co/100x100.png",
    role: "Wicket-keeper Batsman",
    dateOfBirth: "2000-02-20",
    battingStyle: "Left-hand bat",
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
  },
  {
    id: "player-3",
    name: "Mike Brown",
    team: "Lions College",
    avatar: "https://placehold.co/100x100.png",
    role: "Opening Batsman",
    dateOfBirth: "1997-11-01",
    battingStyle: "Right-hand bat",
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
  },
];
