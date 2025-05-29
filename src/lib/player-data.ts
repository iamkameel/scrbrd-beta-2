
export interface PlayerSkills {
  technical?: {
    battingTechnique?: number;
    shotSelection?: number;
    powerHitting?: number;
    runningBetweenWickets?: number;
    bowlingAccuracy?: number;
    bowlingVariation?: number;
    spinReading?: number;
    groundFielding?: number;
    catchingTechnique?: number;
    throwingAccuracy?: number;
  };
  tactical?: { // Maps to "Tactical Awareness"
    matchAwareness?: number;
    strikeRotation?: number;
    oppositionAnalysis?: number;
    fieldPlacement?: number;
    deathOversExecution?: number;
  };
  physicalMental?: { // Combines "Physical Fitness" and "Mental Attributes"
    // Physical Fitness
    speedAgility?: number;
    endurance?: number;
    strengthPower?: number; // from strengthPower
    flexibility?: number;
    reactionTime?: number;
    // Mental Attributes
    concentration?: number;
    composure?: number;
    resilience?: number;
    decisionMaking?: number;
    coachability?: number;
  };
  teamLeadership?: { // Maps to "Team & Leadership"
    communication?: number;
    teamSpirit?: number;
    leadership?: number;
    discipline?: number;
    workEthic?: number;
  };
}

export interface ScoreDetail {
  value: string;
  opponent?: string;
  year?: number;
  venue?: string;
}

export interface PlayerStats {
  matchesPlayed?: number;
  runs?: number;
  average?: number | string;
  strikeRate?: number | string;
  highestScore?: ScoreDetail;
  hundreds?: number;
  fifties?: number;
  wickets?: number;
  bowlingAverage?: number | string;
  economyRate?: number | string;
  bestBowling?: ScoreDetail;
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
  careerSpan?: string;
  skills?: PlayerSkills;
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
      highestScore: {
        value: "102*",
        opponent: "Panthers Academy",
        year: 2023,
        venue: "Northwood Main Oval",
      },
      hundreds: 1,
      fifties: 7,
      wickets: 65,
      bowlingAverage: 22.5,
      economyRate: 4.75,
      bestBowling: {
        value: "4/35",
        opponent: "Lions College",
        year: 2022,
        venue: "City Stadium",
      },
      catches: 25,
      stumpings: 0,
    },
    skills: {
      technical: {
        battingTechnique: 82,
        shotSelection: 78,
        powerHitting: 75,
        runningBetweenWickets: 70,
        bowlingAccuracy: 77,
        bowlingVariation: 72,
        groundFielding: 80,
        catchingTechnique: 85,
        throwingAccuracy: 73,
      },
      tactical: {
        matchAwareness: 80,
        strikeRotation: 75,
        oppositionAnalysis: 70,
        fieldPlacement: 68,
      },
      physicalMental: {
        speedAgility: 88,
        endurance: 82,
        strengthPower: 78,
        reactionTime: 75,
        concentration: 76,
        composure: 72,
        resilience: 79,
        decisionMaking: 73,
      },
      teamLeadership: {
        communication: 70,
        teamSpirit: 85,
        leadership: 65,
      }
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
      highestScore: { value: "85" },
      hundreds: 0,
      fifties: 5,
      catches: 40,
      stumpings: 15,
    },
    skills: {
      technical: {
        battingTechnique: 78,
        shotSelection: 80,
        runningBetweenWickets: 72,
        catchingTechnique: 90, // Wicket-keeper specific
        groundFielding: 75,
      },
      tactical: {
        matchAwareness: 70,
        strikeRotation: 68,
      },
      physicalMental: {
        speedAgility: 80,
        flexibility: 70, // Good for keepers
        reactionTime: 85,
        concentration: 82,
        composure: 75,
      },
      teamLeadership: {
        communication: 78,
        teamSpirit: 70,
      }
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
      highestScore: {
        value: "150",
        opponent: "Eagles High",
        year: 2021,
        venue: "Lions Main Ground"
      },
      hundreds: 3,
      fifties: 12,
      catches: 12,
    },
    skills: {
      technical: {
        battingTechnique: 90,
        shotSelection: 85,
        powerHitting: 70, // More about placement and timing for him
        runningBetweenWickets: 65,
      },
      tactical: {
        matchAwareness: 88,
        strikeRotation: 80,
        oppositionAnalysis: 75,
      },
      physicalMental: {
        endurance: 85, // For long innings
        concentration: 90,
        composure: 80,
        resilience: 70,
        decisionMaking: 82,
      },
      teamLeadership: {
        leadership: 70, // Perhaps a senior player
        workEthic: 80,
      }
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
      bestBowling: {
        value: "6/20",
        opponent: "Panthers Academy",
        year: 2023,
        venue: "Academy Ground"
      },
      catches: 8,
    },
    skills: {
      technical: {
        bowlingAccuracy: 92,
        bowlingVariation: 75, // e.g., swing, seam
        powerHitting: 60, // For lower order batting
      },
      tactical: {
        matchAwareness: 78,
        oppositionAnalysis: 80, // Key for a bowler
        fieldPlacement: 70, // Understanding fields set for her
        deathOversExecution: 75, // If she bowls at the death
      },
      physicalMental: {
        speedAgility: 85, // For run-up and fielding
        strengthPower: 80, // For bowling pace
        endurance: 70,
        concentration: 75,
        resilience: 85, // Important for bowlers after being hit
        coachability: 78,
      },
      teamLeadership: {
        teamSpirit: 75,
        workEthic: 88,
      }
    },
  },
];
