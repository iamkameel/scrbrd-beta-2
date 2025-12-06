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
  bestBatting?: Omit<ScoreDetail, 'venue'>; // value, opponent, year
  bestBowling?: ScoreDetail; // value, opponent, year, venue
  catches?: number;
  stumpings?: number;
}

export interface PlayerStatsWithSeason extends PlayerStats {
  season: string;
}

export interface PlayerProfile {
  id: string;
  name: string;
  teamId: string; // Changed from team to teamId
  avatar: string;
  role: string;
  dateOfBirth?: Date; // Changed from string to Date
  battingStyle?: string;
  bowlingStyle?: string;
  bio?: string;
  stats: PlayerStats;
  careerSpan?: string;
  skills?: PlayerSkills;
  seasonalStats?: PlayerStatsWithSeason[];
}

export const playersData: PlayerProfile[] = [
  {
    id: "player-1",
    name: "John Doe",
    teamId: "1", // Corresponds to Northwood School 1st XI in detailedTeamsData
    avatar: "https://placehold.co/100x100.png",
    role: "All-rounder",
    dateOfBirth: new Date("1998-05-15"),
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
        value: "102*", opponent: "Panthers Academy", year: 2023, venue: "Northwood Main Oval",
      },
      bestBatting: {
        value: "102*", opponent: "Panthers Academy", year: 2023,
      },
      wickets: 60, // Added wickets for all-rounder
      bowlingAverage: 22.5,
      economyRate: 4.75,
      bestBowling: {
        value: "4/35", opponent: "Lions College", year: 2022, venue: "City Stadium",
      },
      catches: 25, stumpings: 0,
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
    seasonalStats: [
      {
        season: '2022',
        matchesPlayed: 25,
        runs: 550,
        average: 27.5,
        strikeRate: 105.0,
        highestScore: {
          value: '88', opponent: 'Lions College', year: 2022, venue: 'City Stadium',
        },
        bestBatting: {
          value: '88', opponent: 'Lions College', year: 2022,
        },
        wickets: 25,
        bowlingAverage: 28.0,
        economyRate: 5.0,
        bestBowling: {
          value: '3/40', opponent: 'Panthers Academy', year: 2022, venue: 'Northwood Main Oval',
        },
        catches: 10,
        stumpings: 0,
      },
      {
        season: '2023',
        matchesPlayed: 25,
        runs: 700,
        average: 35.0,
        strikeRate: 115.0,
        highestScore: {
          value: '102*', opponent: 'Panthers Academy', year: 2023, venue: 'Northwood Main Oval',
        },
        bestBatting: {
          value: '102*', opponent: 'Panthers Academy', year: 2023,
        },
        wickets: 35,
        bowlingAverage: 19.28,
        economyRate: 4.5,
        bestBowling: {
          value: '4/35', opponent: 'Panthers Academy', year: 2023, venue: 'Academy Ground',
        },
        catches: 15,
        stumpings: 0,
      },
    ],
  },

  {
    id: "player-2",
    name: "Jane Smith",
    teamId: "3", // Corresponds to Riverdale Cricket Club Seniors in detailedTeamsData
    avatar: "https://placehold.co/100x100.png",
    role: "Wicket-keeper Batsman",
    dateOfBirth: new Date("2000-02-20"),
    battingStyle: "Left-hand bat",
    careerSpan: "Academy Career: 2021 - Present",
    bio: "Jane is an agile wicket-keeper and a reliable top-order batsman. Her sharp reflexes behind the stumps and ability to build innings make her an invaluable asset to the Panthers.",
    stats: {
      matchesPlayed: 45,
      runs: 980,
      average: 28.0,
      strikeRate: 95.0,
      highestScore: {
        value: "85", opponent: "Eagles High", year: 2022, venue: "Panthers Home Ground"
      },
      bestBatting: {
        value: "85", opponent: "Eagles High", year: 2022,
      },
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
        catchingTechnique: 90,
        groundFielding: 75,
      },
      tactical: {
        matchAwareness: 70,
        strikeRotation: 68,
      },
      physicalMental: {
        speedAgility: 80,
        flexibility: 70,
        reactionTime: 85,
        concentration: 82,
        composure: 75,
      },
      teamLeadership: {
        communication: 78,
        teamSpirit: 70,
      }
    },
    seasonalStats: [
      {
        season: '2021',
        matchesPlayed: 20,
        runs: 350,
        average: 25.0,
        strikeRate: 90.0,
        highestScore: {
          value: '65', opponent: 'Eagles High', year: 2021, venue: 'Panthers Home Ground',
        },
        bestBatting: {
          value: '65', opponent: 'Eagles High', year: 2021,
        },
        hundreds: 0,
        fifties: 2,
        catches: 15,
        stumpings: 5,
      },
      {
        season: '2022',
        matchesPlayed: 25,
        runs: 630,
        average: 31.5,
        strikeRate: 100.0,
        highestScore: {
          value: '85', opponent: 'Eagles High', year: 2022, venue: 'Panthers Home Ground',
        },
        bestBatting: {
          value: '85', opponent: 'Eagles High', year: 2022,
        },
        hundreds: 0,
        fifties: 3,
        catches: 25,
        stumpings: 10,
      },
    ],
  },
  {
    id: "player-3",
    name: "Mike Brown",
    teamId: "4", // Corresponds to Hillcrest College U16 in detailedTeamsData
    avatar: "https://placehold.co/100x100.png",
    role: "Opening Batsman",
    dateOfBirth: new Date("1997-11-01"),
    battingStyle: "Right-hand bat",
    careerSpan: "College Career: 2019 - 2023",
    bio: "Mike is a classic opening batsman with a penchant for long innings. He provides solid starts for the Lions and is known for his excellent technique against the new ball.",
    stats: {
      matchesPlayed: 60,
      runs: 2100,
      average: 42.0,
      strikeRate: 75.5,
      highestScore: {
        value: "150", opponent: "Eagles High", year: 2021, venue: "Lions Main Ground"
      },
      bestBatting: {
        value: "150", opponent: "Eagles High", year: 2021,
      },
      hundreds: 3,
      fifties: 12,
      catches: 12,
    },
    skills: {
      technical: {
        battingTechnique: 90,
        shotSelection: 85,
        powerHitting: 70,
        runningBetweenWickets: 65,
      },
      tactical: {
        matchAwareness: 88,
        strikeRotation: 80,
        oppositionAnalysis: 75,
      },
      physicalMental: {
        endurance: 85,
        concentration: 90,
        composure: 80,
        resilience: 70,
        decisionMaking: 82,
      },
      teamLeadership: {
        leadership: 70,
        workEthic: 80,
      }
    },
    seasonalStats: [
      {
        season: '2019',
        matchesPlayed: 15,
        runs: 400,
        average: 26.67,
        strikeRate: 70.0,
        highestScore: {
          value: '70', opponent: 'Sharks United', year: 2019, venue: 'City Stadium',
        },
        bestBatting: {
          value: '70', opponent: 'Sharks United', year: 2019,
        },
        hundreds: 0,
        fifties: 3,
        catches: 5,
      },
      {
        season: '2020',
        matchesPlayed: 15,
        runs: 600,
        average: 40.0,
        strikeRate: 78.0,
        highestScore: {
          value: '110', opponent: 'Eagles High', year: 2020, venue: 'Lions Main Ground',
        },
        bestBatting: {
          value: '110', opponent: 'Eagles High', year: 2020,
        },
        hundreds: 1,
        fifties: 4,
        catches: 3,
      },
      {
        season: '2021',
        matchesPlayed: 15,
        runs: 700,
        average: 46.67,
        strikeRate: 80.0,
        highestScore: {
          value: '150', opponent: 'Eagles High', year: 2021, venue: 'Lions Main Ground',
        },
        bestBatting: {
          value: '150', opponent: 'Eagles High', year: 2021,
        },
        hundreds: 3,
        fifties: 5,
        catches: 4,
      },
    ],
  },
   {
    id: "player-4",
    name: "Sarah Wilson",
    teamId: "1", // Corresponds to Northwood School 1st XI in detailedTeamsData
    avatar: "https://placehold.co/100x100.png",
    role: "Fast Bowler",
    dateOfBirth: new Date("1999-07-22"),
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm fast",
    careerSpan: "School Career: 2020 - Present",
    bio: "Sarah leads the bowling attack for the Eagles with her express pace and ability to swing the ball. She is a genuine wicket-taker.",
    stats: {
      matchesPlayed: 40,
      runs: 150,
      average: 10.0,
      strikeRate: 80.0, // Added strike rate
      highestScore: {
        value: "35*", opponent: "Lions College", year: 2022, venue: "Lions College Oval"
      },
      bestBatting: {
        value: "35*", opponent: "Lions College", year: 2022,
      },
      wickets: 75,
      bowlingAverage: 18.5,
      economyRate: 4.2,
      bestBowling: {
        value: "6/20", opponent: "Panthers Academy", year: 2023, venue: "Academy Ground"
      },
      catches: 8,
    },
    skills: {
      technical: {
        bowlingAccuracy: 92,
        bowlingVariation: 75,
        powerHitting: 60,
      },
      tactical: {
        matchAwareness: 78,
        oppositionAnalysis: 80,
        fieldPlacement: 70,
        deathOversExecution: 75,
      },
      physicalMental: {
        speedAgility: 85,
        strengthPower: 80,
        endurance: 70,
        concentration: 75,
        resilience: 85,
        coachability: 78,
      },
      teamLeadership: {
        teamSpirit: 75,
        workEthic: 88,
      }
    },
    seasonalStats: [
      {
        season: '2020',
        matchesPlayed: 10,
        runs: 50,
        average: 7.14,
        strikeRate: 60.0,
        highestScore: {
          value: '15', opponent: 'Lions College', year: 2020, venue: 'Lions College Oval',
        },
        bestBatting: {
          value: '15', opponent: 'Lions College', year: 2020,
        },
        wickets: 15,
        bowlingAverage: 25.0,
        economyRate: 4.5,
        bestBowling: {
          value: '4/30', opponent: 'Panthers Academy', year: 2020, venue: 'Academy Ground',
        },
        catches: 2,
      },
      {
        season: '2021',
        matchesPlayed: 15,
        runs: 70,
        average: 8.75,
        strikeRate: 70.0,
        highestScore: {
          value: '20*', opponent: 'Sharks United', year: 2021, venue: 'City Stadium',
        },
        bestBatting: {
          value: '20*', opponent: 'Sharks United', year: 2021,
        },
        wickets: 25,
        bowlingAverage: 22.0,
        economyRate: 4.3,
        bestBowling: {
          value: '5/25', opponent: 'Lions College', year: 2021, venue: 'Lions College Oval',
        },
        catches: 3,
      },
    ],
  },

  // Add more players here as needed for comprehensive testing

];