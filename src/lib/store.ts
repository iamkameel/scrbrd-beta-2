export interface PlayerStats {
  matchesPlayed: number;
  totalRuns?: number;
  battingAverage?: number;
  strikeRate?: number;
  hundreds?: number;
  fifties?: number;
  wicketsTaken?: number;
  bowlingAverage?: number;
  economyRate?: number;
  bestBowling?: string;
}

export interface PlayerSkills {
  batting: number;
  bowling: number;
  fielding: number;
  fitness: number;
  mental: number;
}

export interface Player {
  personId: string;
  firstName: string;
  lastName: string;
  displayName?: string; // Added for UI
  email: string; // Added for User Management
  role: string;
  activeRole: string; // Added for scouting context
  status: 'active' | 'injured' | 'inactive';
  dateOfBirth: string; // Added for age calculation
  physicalAttributes?: {
    height: number; // cm
    weight: number; // kg
    battingHand: 'Right' | 'Left';
    bowlingStyle?: string;
  };
  skills: PlayerSkills;
  stats: PlayerStats;
  profileImageUrl: string;
  assignedSchools?: string[];
  teamIds?: string[];
  phone?: string;
  qualifications?: string[];
  performanceHistory?: PerformanceHistoryItem[];
  trainingLogs?: TrainingLog[];
}

export interface PerformanceHistoryItem {
  matchId: string;
  date: string;
  runs?: number;
  wickets?: number;
  opponent: string;
}

export interface TrainingLog {
  sessionId: string;
  type: string;
  date: string;
  durationMinutes: number;
  notes?: string;
  intensity: 'High' | 'Medium' | 'Low';
}

export interface Over {
  overNumber: number;
  runs: number;
  wickets: number;
  bowler: string;
  balls: Ball[];
}

export interface Ball {
  ballNumber: number;
  runs: number;
  isWicket: boolean;
  isWide: boolean;
  isNoBall: boolean;
  batsman: string;
  bowler: string;
}

export interface Innings {
  overs: Over[];
  totalRuns: number;
  totalWickets: number;
  overHistory?: Over[];
}

export interface Equipment {
  itemId: string;
  name: string;
  type: string;
  brand: string;
  category: string;
  status: string;
  condition: string;
  quantity: number;
  assignedTo: string | null;
  cost?: number;
}

export interface Transaction {
  transactionId: string;
  date: string;
  type: string;
  category: string;
  amount: number;
  description: string;
  status: string;
}

export interface Sponsor {
  sponsorId: string;
  name: string;
  industry: string;
  contributionAmount: number;
  active: boolean;
  logoUrl: string;
  website?: string;
}

export interface Match {
  matchId: string;
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  dateTime: string;
  status: 'scheduled' | 'live' | 'completed';
  venue: string;
  fieldId?: string;
  result?: string;
  matchType?: 'T20' | 'ODI' | 'Test' | 'Other';
  overs?: number;
  tossWinnerId?: string;
  tossDecision?: 'bat' | 'bowl';
  homeScore?: number;
  awayScore?: number;
  liveScore?: {
    runs: number;
    wickets: number;
    overs: number;
    battingTeam: string;
  };
  inningsData?: {
    firstInnings: Innings;
    secondInnings?: Innings;
  };
  score?: {
    teamA?: string;
    teamB?: string;
    home?: string;
    away?: string;
  };
}

export type Person = Player; // Alias for backward compatibility if needed

export interface Team {
  teamId: string;
  name: string;
  teamColors: { primary: string; secondary?: string };
  schoolId: string;
  division: string;
  logoUrl: string;
}

export interface Division {
  divisionId: string;
  name: string;
  ageGroup: string;
  teams: string[];
  season: string;
}

export interface Field {
  fieldId: string;
  name: string;
  schoolId: string;
  schoolName: string;
  pitchType: string;
  facilities: string[];
  status: string;
  location: string;
  size: string;
  amenities: string[];
}

export interface School {
  schoolId: string;
  name: string;
  abbreviation: string;
  motto: string;
  establishmentYear: number;
  principal: string;
  location: string;
  phone: string;
  website: string;
  logoUrl: string;
  brandColors: {
    primary: string;
    secondary: string;
  };
}

export interface Season {
  seasonId: string;
  name: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

export interface RosterItem {
  assignmentId: string;
  personId: string;
  teamId: string;
  personName: string;
  role: string;
  status: string;
  isCaptain: boolean;
  isViceCaptain: boolean;
  jerseyNumber: number;
}

export interface Vehicle {
  vehicleId: string;
  name: string;
  type: string;
  capacity: number;
  licensePlate: string;
  status: string;
}

export interface Trip {
  tripId: string;
  vehicleId: string;
  date: string;
  destination: string;
  purpose: string;
  passengers: number;
  passengerCount?: number; // Alias for passengers
  status: string;
  driverName?: string;
}

export interface StaffProfile {
  staffId: string;
  schoolId: string;
  name: string;
  title: string;
  role: 'Principal' | 'Director of Sport' | 'Head Coach' | 'Admin' | 'Other';
  bio?: string;
  email?: string;
  phone?: string;
  imageUrl?: string;
}

export interface NewsPost {
  newsId: string;
  schoolId: string;
  title: string;
  excerpt: string;
  content?: string;
  date: string;
  imageUrl?: string;
  author?: string;
  tags?: string[];
}

export interface SchoolStats {
  statsId: string;
  schoolId: string;
  totalTeams: number;
  activePlayers: number;
  coachingStaff: number;
  upcomingFixtures: number;
  lastUpdated: string;
}

export interface Store {
  currentUser: {
    name: string;
    role: string;
  };
  people: Player[];
  matches: Match[];
  divisions: Division[];
  teams: Team[];
  equipment: Equipment[];
  fields: Field[];
  schools: School[];
  seasons: Season[];
  rosters: RosterItem[];
  transactions: Transaction[];
  sponsors: Sponsor[];
  vehicles: Vehicle[];
  trips: Trip[];
  staffProfiles: StaffProfile[];
  newsPosts: NewsPost[];
  schoolStats: SchoolStats[];
}

export const store: Store = {
  currentUser: {
    name: "Kameel Kalyan",
    role: "Admin"
  },
  people: [
    {
      personId: "p1",
      firstName: "Virat",
      lastName: "Kohli",
      displayName: "Virat Kohli",
      email: "virat.kohli@bcci.tv",
      role: "Player",
      activeRole: "Batsman",
      status: "active",
      dateOfBirth: "1988-11-05",
      physicalAttributes: {
        height: 175,
        weight: 70,
        battingHand: "Right",
        bowlingStyle: "Right-arm medium"
      },
      skills: {
        batting: 19,
        bowling: 6,
        fielding: 18,
        fitness: 19,
        mental: 20
      },
      stats: {
        matchesPlayed: 250,
        totalRuns: 12000,
        battingAverage: 58.5,
        strikeRate: 93.2,
        hundreds: 43,
        fifties: 62
      },
      profileImageUrl: "https://ui-avatars.com/api/?name=Virat+Kohli&background=10b981&color=fff",
      assignedSchools: ["s1"],
      teamIds: ["t1"]
    },
    {
      personId: "p2",
      firstName: "Jasprit",
      lastName: "Bumrah",
      displayName: "Jasprit Bumrah",
      email: "j.bumrah@mumbaiindians.com",
      role: "Player",
      activeRole: "Bowler",
      status: "active",
      dateOfBirth: "1993-12-06",
      physicalAttributes: {
        height: 178,
        weight: 70,
        battingHand: "Right",
        bowlingStyle: "Right-arm fast"
      },
      skills: {
        batting: 4,
        bowling: 20,
        fielding: 15,
        fitness: 18,
        mental: 18
      },
      stats: {
        matchesPlayed: 120,
        wicketsTaken: 250,
        bowlingAverage: 21.4,
        economyRate: 4.5,
        bestBowling: "6/19"
      },
      profileImageUrl: "https://ui-avatars.com/api/?name=Jasprit+Bumrah&background=f59e0b&color=fff",
      assignedSchools: ["s1"],
      teamIds: ["t1"]
    },
    {
      personId: "p3",
      firstName: "Ben",
      lastName: "Stokes",
      displayName: "Ben Stokes",
      email: "ben.stokes@ecb.co.uk",
      role: "Player",
      activeRole: "All-Rounder",
      status: "injured",
      dateOfBirth: "1991-06-04",
      physicalAttributes: {
        height: 185,
        weight: 80,
        battingHand: "Left",
        bowlingStyle: "Right-arm fast-medium"
      },
      skills: {
        batting: 17,
        bowling: 16,
        fielding: 19,
        fitness: 17,
        mental: 19
      },
      stats: {
        matchesPlayed: 150,
        totalRuns: 4500,
        wicketsTaken: 180,
        battingAverage: 38.2,
        bowlingAverage: 28.5
      },
      profileImageUrl: "https://ui-avatars.com/api/?name=Ben+Stokes&background=ef4444&color=fff",
      assignedSchools: ["s2"],
      teamIds: ["t2"]
    },
    {
      personId: "p4",
      firstName: "Kane",
      lastName: "Williamson",
      displayName: "Kane Williamson",
      email: "kane.w@nzc.nz",
      role: "Player",
      activeRole: "Batsman",
      status: "active",
      dateOfBirth: "1990-08-08",
      physicalAttributes: {
        height: 173,
        weight: 68,
        battingHand: "Right",
        bowlingStyle: "Right-arm offbreak"
      },
      skills: {
        batting: 18,
        bowling: 8,
        fielding: 16,
        fitness: 16,
        mental: 20
      },
      stats: {
        matchesPlayed: 160,
        totalRuns: 6000,
        battingAverage: 48.5,
        strikeRate: 125.0,
        hundreds: 20,
        fifties: 40
      },
      profileImageUrl: "https://ui-avatars.com/api/?name=Kane+Williamson&background=000000&color=fff",
      assignedSchools: ["s3"],
      teamIds: ["t3"]
    },
    {
      personId: "p5",
      firstName: "Rashid",
      lastName: "Khan",
      displayName: "Rashid Khan",
      email: "rashid.k@acb.af",
      role: "Player",
      activeRole: "Bowler",
      status: "active",
      dateOfBirth: "1998-09-20",
      physicalAttributes: {
        height: 168,
        weight: 65,
        battingHand: "Right",
        bowlingStyle: "Right-arm legbreak"
      },
      skills: {
        batting: 12,
        bowling: 19,
        fielding: 17,
        fitness: 18,
        mental: 16
      },
      stats: {
        matchesPlayed: 100,
        wicketsTaken: 200,
        bowlingAverage: 18.5,
        economyRate: 6.2,
        bestBowling: "5/10"
      },
      profileImageUrl: "https://ui-avatars.com/api/?name=Rashid+Khan&background=0000FF&color=fff",
      assignedSchools: ["s1"],
      teamIds: ["t4"]
    }
  ],
  matches: [
    {
      matchId: "m1",
      teamAId: "t1",
      teamBId: "t4",
      teamAName: "Royal Challengers",
      teamBName: "Super Kings",
      dateTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      status: "scheduled",
      venue: "Main Oval",
      fieldId: "f1",
      matchType: "T20",
      overs: 20
    },
    {
      matchId: "m2",
      teamAId: "t2",
      teamBId: "t3",
      teamAName: "Mumbai Indians",
      teamBName: "Capitals",
      dateTime: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      status: "completed",
      result: "Mumbai Indians won by 5 wickets",
      venue: "Piley Rees",
      fieldId: "f2",
      matchType: "T20",
      overs: 20,
      tossWinnerId: "t3",
      tossDecision: "bat",
      score: {
        home: "180/5",
        away: "178/8"
      },
      homeScore: 180,
      awayScore: 178,
      inningsData: {
        firstInnings: {
          totalRuns: 178,
          totalWickets: 8,
          overs: [],
          overHistory: []
        },
        secondInnings: {
          totalRuns: 180,
          totalWickets: 5,
          overs: [],
          overHistory: []
        }
      }
    },
    {
      matchId: "m3",
      teamAId: "t3",
      teamBId: "t4",
      teamAName: "Capitals",
      teamBName: "Super Kings",
      dateTime: new Date().toISOString(), // Today
      status: "live",
      matchType: "T20",
      overs: 20,
      liveScore: {
        runs: 145,
        wickets: 3,
        overs: 15.4,
        battingTeam: "Capitals"
      },
      venue: "Hilton Oval",
      fieldId: "f3"
    }
  ],
  divisions: [
    {
      divisionId: "d1",
      name: "Under 15",
      ageGroup: "U15",
      teams: ["t1", "t2", "t3", "t4"],
      season: "2024"
    },
    {
      divisionId: "d2",
      name: "Under 17",
      ageGroup: "U17",
      teams: ["t5", "t6", "t7", "t8"],
      season: "2024"
    },
    {
      divisionId: "d3",
      name: "Under 19",
      ageGroup: "U19",
      teams: ["t9", "t10", "t11", "t12"],
      season: "2024"
    }
  ],
  teams: [
    {
      teamId: "t1",
      name: "Royal Challengers",
      teamColors: { primary: "#FF0000", secondary: "#FFD700" },
      schoolId: "s1",
      division: "d1",
      logoUrl: "" // Will use school logo as fallback
    },
    {
      teamId: "t2",
      name: "Mumbai Indians",
      teamColors: { primary: "#005DA0", secondary: "#FFFFFF" },
      schoolId: "s2",
      division: "d1",
      logoUrl: ""
    },
    {
      teamId: "t3",
      name: "Capitals",
      teamColors: { primary: "#282968", secondary: "#FFFFFF" },
      schoolId: "s3",
      division: "d1",
      logoUrl: ""
    },
    {
      teamId: "t4",
      name: "Super Kings",
      teamColors: { primary: "#FDB913", secondary: "#000000" },
      schoolId: "s1",
      division: "d1",
      logoUrl: ""
    }
  ],
  equipment: [
    {
      itemId: "e1",
      name: "Cricket Bat - Kookaburra",
      type: "Bat",
      brand: "Kookaburra",
      category: "Batting",
      status: "Available",
      condition: "Good",
      quantity: 12,
      assignedTo: null,
      cost: 3500
    },
    {
      itemId: "e2",
      name: "Cricket Ball - Duke",
      type: "Ball",
      brand: "Duke",
      category: "Bowling",
      status: "Available",
      condition: "New",
      quantity: 24,
      assignedTo: null,
      cost: 800
    },
    {
      itemId: "e3",
      name: "Batting Pads",
      type: "Pads",
      brand: "Gray-Nicolls",
      category: "Protection",
      status: "In Use",
      condition: "Good",
      quantity: 8,
      assignedTo: "Team A",
      cost: 1200
    }
  ],
  fields: [
    {
      fieldId: "f1",
      name: "Main Oval",
      schoolId: "s1",
      schoolName: "St. John's College",
      pitchType: "Turf",
      facilities: ["Pavilion", "Scoreboard", "Seating"],
      status: "Available",
      location: "St. John's College Campus",
      size: "Full Size",
      amenities: ["Changing Rooms", "Nets", "Lights"]
    },
    {
      fieldId: "f2",
      name: "Piley Rees",
      schoolId: "s2",
      schoolName: "Bishops Diocesan College",
      pitchType: "Turf",
      facilities: ["Pavilion", "Scoreboard"],
      status: "Available",
      location: "Bishops Campus",
      size: "Full Size",
      amenities: ["Changing Rooms", "Nets"]
    },
    {
      fieldId: "f3",
      name: "Hilton Oval",
      schoolId: "s3",
      schoolName: "Hilton College",
      pitchType: "Turf",
      facilities: ["Pavilion", "Scoreboard", "Seating", "Press Box"],
      status: "Available",
      location: "Hilton College Campus",
      size: "Full Size",
      amenities: ["Changing Rooms", "Nets", "Gym"]
    }
  ],
  schools: [
    {
      schoolId: "s1",
      name: "Westville Boys' High School",
      abbreviation: "WBHS",
      motto: "Incepto Ne Desistam",
      establishmentYear: 1952,
      principal: "Mr. Brian North",
      location: "Jan Hofmeyr Road, Westville, Durban, KwaZulu-Natal",
      phone: "+27 31 266 7777",
      website: "https://wbhs.co.za",
      logoUrl: "https://ui-avatars.com/api/?name=WBHS&background=003D7A&color=fff",
      brandColors: {
        primary: "#003D7A", // WBHS Blue
        secondary: "#FFD700" // Gold
      }
    },
    {
      schoolId: "s2",
      name: "St Stithians College",
      abbreviation: "Saints",
      motto: "In Fide Constans",
      establishmentYear: 1953,
      principal: "Dr. Tim Nuttall",
      location: "40 Peter Place, Lyme Park, Sandton, Johannesburg",
      phone: "+27 11 577 1000",
      website: "https://stithian.com",
      logoUrl: "https://ui-avatars.com/api/?name=Saints&background=00205B&color=fff",
      brandColors: {
        primary: "#00205B", // Saints Blue
        secondary: "#C8102E" // Saints Red
      }
    },
    {
      schoolId: "s3",
      name: "Hilton College",
      abbreviation: "Hilton",
      motto: "Keep the Faith",
      establishmentYear: 1872,
      principal: "Mr. George Harris",
      location: "Hilton, KwaZulu-Natal",
      phone: "+27 33 234 1111",
      website: "https://hiltoncollege.com",
      logoUrl: "https://ui-avatars.com/api/?name=Hilton&background=8B0000&color=fff",
      brandColors: {
        primary: "#8B0000", // Maroon
        secondary: "#FFD700" // Gold
      }
    }
  ],
  staffProfiles: [
    {
      staffId: "staff1",
      schoolId: "s1",
      name: "Mr. Brian North",
      title: "Principal",
      role: "Principal",
      bio: "Brian North has been the Principal of Westville Boys' High School since 2015, bringing a wealth of experience in educational leadership.",
      email: "principal@wbhs.co.za",
      phone: "+27 31 266 7777",
      imageUrl: "https://ui-avatars.com/api/?name=Brian+North&background=003D7A&color=fff"
    },
    {
      staffId: "staff2",
      schoolId: "s1",
      name: "Mr. Christo Esau",
      title: "Director of Cricket",
      role: "Director of Sport",
      bio: "Level 4 cricket coach, recognized as 'Coaches' Coach of the Year'. Leads WBHS cricket program to national excellence.",
      email: "cesau@wbhs.co.za",
      imageUrl: "https://ui-avatars.com/api/?name=Christo+Esau&background=003D7A&color=fff"
    },
    {
      staffId: "staff3",
      schoolId: "s1",
      name: "Mr. Richard Wissing",
      title: "1st XI Cricket Coach",
      role: "Head Coach",
      bio: "Award-winning coach of WBHS 1st XI. Recognized as Coach of the Year for guiding the team to provincial and national success.",
      email: "rwissing@wbhs.co.za",
      imageUrl: "https://ui-avatars.com/api/?name=Richard+Wissing&background=003D7A&color=fff"
    },
    {
      staffId: "staff4",
      schoolId: "s2",
      name: "Dr. Tim Nuttall",
      title: "Principal",
      role: "Principal",
      bio: "Principal of St Stithians College, overseeing one of South Africa's premier educational institutions.",
      email: "principal@stithian.com",
      phone: "+27 11 577 1000",
      imageUrl: "https://ui-avatars.com/api/?name=Tim+Nuttall&background=00205B&color=fff"
    },
    {
      staffId: "staff5",
      schoolId: "s2",
      name: "Mr. David Naidoo",
      title: "Director of Cricket",
      role: "Director of Sport",
      bio: "Oversees Saints' cricket program which has produced numerous international players including Kagiso Rabada and Ryan Rickelton.",
      email: "dnaidoo@stithian.com",
      imageUrl: "https://ui-avatars.com/api/?name=David+Naidoo&background=00205B&color=fff"
    },
    {
      staffId: "staff6",
      schoolId: "s3",
      name: "Mr. George Harris",
      title: "Principal",
      role: "Principal",
      bio: "Principal of Hilton College, maintaining the school's rich sporting and academic traditions since its establishment in 1872.",
      email: "principal@hiltoncollege.com",
      phone: "+27 33 234 1111",
      imageUrl: "https://ui-avatars.com/api/?name=George+Harris&background=8B0000&color=fff"
    }
  ],
  newsPosts: [
    {
      newsId: "news1",
      schoolId: "s1",
      title: "WBHS Crowned 2025 W100 Cricket Champions",
      excerpt: "Westville Boys' High School defeated Durban High School to claim the prestigious W100 Cricket Championship title.",
      content: "In a thrilling final, WBHS demonstrated exceptional teamwork and skill to secure victory. Seth Simpson played a pivotal role in the team's success.",
      date: "2025-03-15",
      imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1200",
      author: "WBHS Communications",
      tags: ["Cricket", "Championship", "W100"]
    },
    {
      newsId: "news2",
      schoolId: "s1",
      title: "WBHS Cricket Named Sports Code of the Year 2022",
      excerpt: "The exceptional 2022 season saw WBHS cricket earn the prestigious 'Spor ts Code of the Year' award.",
      content: "With the 1st XI winning over 75% of their 43 matches, becoming KZN 100-Ball champions, and finishing third at the North-South T20 in Pretoria, WBHS cricket dominated the 2022 season.",
      date: "2022-12-10",
      imageUrl: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?q=80&w=1200",
      author: "WBHS Communications",
      tags: ["Cricket", "Achievement", "Awards"]
    },
    {
      newsId: "news3",
      schoolId: "s2",
      title: "Four Saints Players in Proteas Test Squad",
      excerpt: "St Stithians celebrates having four alumni in the South African Test squad against Pakistan.",
      content: "Kagiso Rabada, Ryan Rickelton, Wiaan Mulder, and Kwena Maphaka all represented Saints before donning the Proteas jersey, showcasing the school's world-class cricket development program.",
      date: "2024-12-20",
      imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200",
      author: "Saints Communications",
      tags: ["Cricket", "Proteas", "Alumni"]
    },
    {
      newsId: "news4",
      schoolId: "s2",
      title: "Saints Maintain 'Blue Chip' Cricket Status",
      excerpt: "St Stithians College continues its tradition of excellence, earning Blue Chip recognition from Cricket South Africa.",
      content: "With 7 turf pitches, 17 astro nets, and a proven track record of developing international players, Saints' cricket program remains among the best in the country.",
      date: "2025-01-10",
      imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1200",
      author: "Saints Communications",
      tags: ["Cricket", "Blue Chip", "Facilities"]
    },
    {
      newsId: "news5",
      schoolId: "s3",
      title: "Hilton College Cricket Facilities Upgraded",
      excerpt: "Major improvements to Hilton's cricket infrastructure include five new indoor nets and enhanced turf wickets.",
      content: "Hilton College continues to invest in its sporting facilities, ensuring students train in world-class conditions. The college now boasts 8 turf wickets and 5 state-of-the-art indoor cricket nets.",
      date: "2024-11-05",
      imageUrl: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e9 72?q=80&w=1200",
      author: "Hilton Communications",
      tags: ["Cricket", "Facilities", "Infrastructure"]
    }
  ],
  schoolStats: [
    {
      statsId: "stats1",
      schoolId: "s1",
      totalTeams: 15,
      activePlayers: 280,
      coachingStaff: 12,
      upcomingFixtures: 24,
      lastUpdated: "2025-11-29"
    },
    {
      statsId: "stats2",
      schoolId: "s2",
      totalTeams: 18,
      activePlayers: 320,
      coachingStaff: 15,
      upcomingFixtures: 28,
      lastUpdated: "2025-11-29"
    },
    {
      statsId: "stats3",
      schoolId: "s3",
      totalTeams: 12,
      activePlayers: 245,
      coachingStaff: 10,
      upcomingFixtures: 18,
      lastUpdated: "2025-11-29"
    }
  ],
  seasons: [
    {
      seasonId: "season1",
      name: "2024 Season",
      startDate: "2024-01-15",
      endDate: "2024-11-30",
      active: true
    },
    {
      seasonId: "season2",
      name: "2023 Season",
      startDate: "2023-01-15",
      endDate: "2023-11-30",
      active: false
    }
  ],
  rosters: [
    {
      assignmentId: "r1",
      personId: "p1",
      teamId: "t1",
      personName: "Virat Kohli",
      role: "Batsman",
      status: "active",
      isCaptain: true,
      isViceCaptain: false,
      jerseyNumber: 18
    },
    {
      assignmentId: "r2",
      personId: "p2",
      teamId: "t1",
      personName: "Jasprit Bumrah",
      role: "Bowler",
      status: "active",
      isCaptain: true,
      isViceCaptain: false,
      jerseyNumber: 93
    },
    {
      assignmentId: "r3",
      personId: "p3",
      teamId: "t2",
      personName: "Ben Stokes",
      role: "All-Rounder",
      status: "active",
      isCaptain: true,
      isViceCaptain: false,
      jerseyNumber: 55
    },
    {
      assignmentId: "r4",
      personId: "p4",
      teamId: "t3",
      personName: "Kane Williamson",
      role: "Batsman",
      status: "active",
      isCaptain: true,
      isViceCaptain: false,
      jerseyNumber: 22
    },
    {
      assignmentId: "r5",
      personId: "p5",
      teamId: "t4",
      personName: "Rashid Khan",
      role: "Bowler",
      status: "active",
      isCaptain: true,
      isViceCaptain: false,
      jerseyNumber: 19
    }
  ],
  transactions: [
    { transactionId: 'tr1', date: '2024-01-10', type: 'Expense', category: 'Equipment', amount: 1200, description: 'New season kit purchase', status: 'Completed' },
    { transactionId: 'tr2', date: '2024-02-01', type: 'Income', category: 'Sponsorship', amount: 5000, description: 'Annual sponsorship payment', status: 'Completed' },
    { transactionId: 'tr3', date: '2024-03-15', type: 'Expense', category: 'Venue Hire', amount: 500, description: 'Field maintenance', status: 'Pending' }
  ],
  sponsors: [
    { sponsorId: 'sp1', name: 'Standard Bank', industry: 'Banking', contributionAmount: 50000, active: true, logoUrl: 'https://ui-avatars.com/api/?name=SB&background=003366&color=fff', website: 'https://standardbank.co.za' },
    { sponsorId: 'sp2', name: 'Kookaburra', industry: 'Sports Equipment', contributionAmount: 25000, active: true, logoUrl: 'https://ui-avatars.com/api/?name=KB&background=006400&color=fff', website: 'https://kookaburra.com' }
  ],
  vehicles: [
    { vehicleId: 'v1', name: 'Team Bus 1', type: 'Bus', capacity: 30, licensePlate: 'ABC 123 GP', status: 'Available' },
    { vehicleId: 'v2', name: 'Minibus 1', type: 'Minibus', capacity: 15, licensePlate: 'XYZ 789 GP', status: 'In Use' }
  ],
  trips: [
    { tripId: 'tr1', vehicleId: 'v1', date: '2024-03-15', destination: 'St. John\'s College', purpose: 'Match Transport', passengers: 25, status: 'Scheduled', driverName: 'John Smith' }
  ]
};


export const getLiveMatches = () => store.matches.filter(m => m.status === 'live');
export const getUpcomingMatches = () => store.matches.filter(m => m.status === 'scheduled');

// Helper functions for awards and analysis
export const getTopRunScorers = (limit?: number) => {
  const scorers = store.people
    .filter(p => p.stats.totalRuns)
    .sort((a, b) => (b.stats.totalRuns || 0) - (a.stats.totalRuns || 0));
  return limit ? scorers.slice(0, limit) : scorers.slice(0, 10);
};

export const getTopWicketTakers = (limit?: number) => {
  const takers = store.people
    .filter(p => p.stats.wicketsTaken)
    .sort((a, b) => (b.stats.wicketsTaken || 0) - (a.stats.wicketsTaken || 0));
  return limit ? takers.slice(0, limit) : takers.slice(0, 10);
};

export const getLeagueStandings = () => {
  // Mock league standings - in real app this would calculate from match results
  return [
    { team: { teamId: "t1", name: "Royal Challengers", teamColors: { primary: "#FF0000" } }, played: 10, won: 7, lost: 3, points: 14 },
    { team: { teamId: "t2", name: "Mumbai Indians", teamColors: { primary: "#005DA0" } }, played: 10, won: 6, lost: 4, points: 12 },
    { team: { teamId: "t3", name: "Capitals", teamColors: { primary: "#282968" } }, played: 10, won: 5, lost: 5, points: 10 },
    { team: { teamId: "t4", name: "Super Kings", teamColors: { primary: "#FDB913" } }, played: 10, won: 4, lost: 6, points: 8 },
  ];
};

// Helper functions for schools
export const getTeamsBySchool = (schoolId: string) => {
  return store.teams.filter(t => t.schoolId === schoolId);
};

export const getPeopleBySchool = (schoolId: string) => {
  return store.people.filter(p => p.assignedSchools?.includes(schoolId));
};

export const createSchool = async (schoolData: Partial<School>) => {
  const newSchool: School = {
    schoolId: `s${store.schools.length + 1}`,
    name: schoolData.name || '',
    abbreviation: schoolData.abbreviation || '',
    motto: schoolData.motto || '',
    establishmentYear: schoolData.establishmentYear || new Date().getFullYear(),
    principal: schoolData.principal || '',
    location: schoolData.location || '',
    phone: schoolData.phone || '',
    website: '',
    logoUrl: schoolData.logoUrl || '',
    brandColors: {
      primary: schoolData.brandColors?.primary || '#000000',
      secondary: schoolData.brandColors?.secondary || '#FFFFFF',
    },
  };
  store.schools.push(newSchool);
  return newSchool;
};

export const updateSchool = async (schoolId: string, schoolData: Partial<School>) => {
  const index = store.schools.findIndex(s => s.schoolId === schoolId);
  if (index === -1) throw new Error('School not found');

  store.schools[index] = {
    ...store.schools[index],
    ...schoolData,
    schoolId, // Preserve the ID
  };
  return store.schools[index];
};

export const createEquipment = async (data: Partial<Equipment>) => {
  const newEquipment: Equipment = {
    itemId: `e${store.equipment.length + 1}`,
    name: data.name || '',
    type: data.type || '',
    brand: data.brand || '',
    category: data.category || '',
    status: data.status || 'Available',
    condition: data.condition || 'New',
    quantity: data.quantity || 1,
    assignedTo: data.assignedTo || null,
    cost: data.cost,
  };
  store.equipment.push(newEquipment);
  return newEquipment;
};

export const updateEquipment = async (itemId: string, data: Partial<Equipment>) => {
  const index = store.equipment.findIndex(e => e.itemId === itemId);
  if (index === -1) throw new Error('Equipment not found');

  store.equipment[index] = {
    ...store.equipment[index],
    ...data,
    itemId, // Preserve the ID
  };
  return store.equipment[index];
};

export const createTransaction = async (data: Partial<Transaction>) => {
  const newTransaction: Transaction = {
    transactionId: `tr${store.transactions.length + 1}`,
    date: data.date || new Date().toISOString().split('T')[0],
    type: data.type || 'Expense',
    category: data.category || '',
    amount: data.amount || 0,
    description: data.description || '',
    status: data.status || 'Pending',
  };
  store.transactions.push(newTransaction);
  return newTransaction;
};

export const updateTransaction = async (transactionId: string, data: Partial<Transaction>) => {
  const index = store.transactions.findIndex(t => t.transactionId === transactionId);
  if (index === -1) throw new Error('Transaction not found');

  store.transactions[index] = {
    ...store.transactions[index],
    ...data,
    transactionId, // Preserve the ID
  };
  return store.transactions[index];
};

// Helper functions for teams
export const getRosterByTeam = (teamId: string) => {
  return store.rosters.filter(r => r.teamId === teamId);
};

// Helper functions for seasons
export const getActiveSeason = () => {
  return {
    seasonId: "s1",
    name: "2024 Season",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    isActive: true
  };
};

// Delete functions
export const deleteSchool = async (schoolId: string): Promise<void> => {
  const index = store.schools.findIndex(s => s.schoolId === schoolId);
  if (index === -1) throw new Error('School not found');
  store.schools.splice(index, 1);
};

export const deleteTeam = async (teamId: string): Promise<void> => {
  const index = store.teams.findIndex(t => t.teamId === teamId);
  if (index === -1) throw new Error('Team not found');
  store.teams.splice(index, 1);
};

export const deleteSeason = async (seasonId: string): Promise<void> => {
  const index = store.seasons.findIndex(s => s.seasonId === seasonId);
  if (index === -1) throw new Error('Season not found');
  store.seasons.splice(index, 1);
};

