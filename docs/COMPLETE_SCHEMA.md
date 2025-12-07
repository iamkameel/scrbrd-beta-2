# SCRBRD Complete Schema Documentation

> **Last Updated:** December 6, 2025  
> **Version:** 2.0 (FM-Style Player Attributes)

This document provides a comprehensive reference for all data schemas, types, and validation rules used in the SCRBRD cricket management platform.

---

## Table of Contents

1. [Collections Overview](#collections-overview)
2. [Geographic & Organizational Hierarchy](#1-geographic--organizational-hierarchy)
3. [Person & Role Profiles](#2-person--role-profiles)
4. [Teams & Squads](#3-teams--squads)
5. [Matches & Live Scoring](#4-matches--live-scoring)
6. [Fixtures & Scheduling](#5-fixtures--scheduling)
7. [Equipment & Transactions](#6-equipment--transactions)
8. [Analytics & Statistics](#7-analytics--statistics)
9. [Validation Schemas (Zod)](#8-validation-schemas-zod)
10. [Entity Relationships](#9-entity-relationships)
11. [Security Rules](#10-security-rules)

---

## Collections Overview

| Collection       | Purpose                              | Primary Key         |
|------------------|--------------------------------------|---------------------|
| `countries`      | Geographic hierarchy root            | Auto-generated `id` |
| `provinces`      | Regional divisions                   | Auto-generated `id` |
| `leagues`        | League/series/cup organizations      | Auto-generated `id` |
| `divisions`      | Age-group divisions within leagues   | Auto-generated `id` |
| `seasons`        | Season configurations                | Auto-generated `id` |
| `schools`        | School/organization info             | Auto-generated `id` |
| `fields`         | Venue/field data                     | Auto-generated `id` |
| `people`         | Players, coaches, officials, staff   | Auto-generated `id` |
| `teams`          | Team configurations                  | Auto-generated `id` |
| `squads`         | Seasonal squad compositions          | Auto-generated `id` |
| `matches`        | Match records & live scoring         | Auto-generated `id` |
| `equipment`      | Equipment inventory                  | Auto-generated `id` |
| `transactions`   | Financial records                    | Auto-generated `id` |
| `sponsors`       | Sponsorship data                     | Auto-generated `id` |
| `competitions`   | Tournament/competition metadata      | Auto-generated `id` |

---

## 1. Geographic & Organizational Hierarchy

### Country
```typescript
interface Country {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### Province
```typescript
interface Province {
  id: string;
  name: string;
  countryId: string;  // FK → Country
  createdAt?: string;
  updatedAt?: string;
}
```

### League
```typescript
type LeagueType = 'League' | 'Series' | 'Cup' | 'Friendly';

interface League {
  id: string;
  name: string;
  provinceId: string;  // FK → Province
  type: LeagueType;
  createdAt?: string;
  updatedAt?: string;
}
```

### Division
```typescript
type AgeGroup = 'Open' | 'U19' | 'U16' | 'U15' | 'U14' | 'U13';

interface Division {
  id: string;
  name: string;
  leagueId: string;   // FK → League
  ageGroup: AgeGroup;
  season?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### Season
```typescript
interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

### School
```typescript
interface School {
  id: string;
  name: string;
  abbreviation?: string;
  motto?: string;
  establishmentYear?: number;
  principal?: string;
  location?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactName?: string;
  logoUrl?: string;
  brandColors?: {
    primary: string;
    secondary: string;
  };
  divisionId?: string;
  provinceId?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### Field (Venue)
```typescript
type PitchType = "Natural Turf" | "Artificial Astro-Turf" | "Hybrid" | "Matting" | "Concrete" | "Indoor";
type ScoreboardType = "Manual" | "Digital (Basic)" | "Electronic LED" | "Video Screen";

interface Field {
  id: string;
  name: string;
  abbreviatedName?: string;
  nickName?: string;
  location?: string;
  status?: 'Available' | 'Maintenance' | 'Booked' | 'Closed';
  address?: string;
  coordinates?: { lat: number; lng: number };
  schoolId?: string;  // FK → School (optional)
  
  // Physical Specs
  capacity?: number;
  pitchCount?: number;
  boundaryMin?: number;
  boundaryMax?: number;
  pitchLength?: number;
  pitchWidth?: number;
  fieldSize?: 'Full Size' | 'Youth' | 'Training Area';
  
  // Surface
  pitchType?: PitchType;
  surfaceConditionRating?: number;  // 1-5
  surfaceDetails?: {
    grassCover?: number;
    moistureLevel?: string;
    firmness?: string;
  };
  
  // Facilities
  floodlights?: boolean;
  changingRoomsCount?: number;
  practiceNetsCount?: number;
  scoreboardType?: ScoreboardType;
  amenities?: string[];
  
  // Staffing
  contactPerson?: string;
  contactPhone?: string;
  groundsKeeperIds?: string[];
  
  createdAt?: string;
  updatedAt?: string;
}
```

---

## 2. Person & Role Profiles

### Base Person Entity
```typescript
interface Person {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  displayName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string | Timestamp | Date;
  nationality?: string;
  profileImageUrl?: string;
  status?: 'active' | 'injured' | 'inactive';
  
  // Role-Specific Profiles (FM-Style)
  playerProfile?: PlayerProfile;
  coachProfile?: CoachProfile;
  umpireProfile?: UmpireProfile;
  scorerProfile?: ScorerProfile;
  medicalProfile?: MedicalProfile;
  groundskeeperProfile?: GroundskeeperProfile;
  
  // Legacy Cricket Attributes
  battingStyle?: string;
  bowlingStyle?: string;
  battingHand?: 'RHB' | 'LHB';
  bowlingHand?: 'RHB' | 'LHB';
  playingRole?: 'Batsman' | 'Bowler' | 'AllRounder' | 'Wicketkeeper';
  primaryFieldingPosition?: string;
  
  // Links
  schoolId?: string;
  teamIds?: string[];
  assignedSchools?: string[];
  
  // Legacy Stats
  stats?: {
    matchesPlayed?: number;
    totalRuns?: number;
    wicketsTaken?: number;
    battingAverage?: number;
    bowlingAverage?: number;
    strikeRate?: number;
    economy?: number;
  };
  
  createdAt?: string;
  updatedAt?: string;
}
```

### Player Profile (FM-Style Detailed Attributes)
```typescript
interface PlayerProfile {
  // Core Identity
  primaryRole: string;           // e.g., "Opening Batsman", "Fast Bowler"
  battingStyle: string;          // e.g., "Right-hand Bat"
  bowlingStyle: string;          // e.g., "Right-arm Fast"
  preferredFormats: string[];    // ['T20', '50-over', '2-day']
  currentAbility: number;        // 1-20 or 1-100
  potentialAbility: number;      // 1-20 or 1-100
  reputation: number;            // 1-10
  heightCm?: number;
  weightKg?: number;
  
  // Attribute Blocks
  battingAttributes?: BattingAttributes;
  bowlingAttributes?: BowlingAttributes;
  fieldingAttributes?: FieldingAttributes;
  mentalAttributes?: MentalAttributes;
  physicalAttributes?: PhysicalAttributes;
  
  // Analysis & Development
  playerTraits?: PlayerTrait[];
  roleRatings?: RoleRating[];
  zoneAnalysis?: ZoneAnalysis[];
  coachReports?: CoachReport[];
  achievements?: Achievement[];
  seasonStats?: SeasonStats[];
}
```

#### Batting Attributes (1-20 Scale)
```typescript
interface BattingAttributes {
  frontFoot: number;
  backFoot: number;
  powerHitting: number;
  timing: number;
  shotRange: number;
  sweep: number;
  reverseSweep: number;
  spinReading: number;
  seamAdaptation: number;
  strikeRotation: number;
  finishing: number;
}
```

#### Bowling Attributes (1-20 Scale)
```typescript
interface BowlingAttributes {
  stockBallControl: number;
  variations: number;
  powerplaySkill: number;
  middleOversControl: number;
  deathOversSkill: number;
  lineLengthConsistency: number;
  spinManipulation: number;
  releaseMechanics: number;
  tacticalOverConstruction: number;
}
```

#### Fielding Attributes (1-20 Scale)
```typescript
interface FieldingAttributes {
  closeCatching: number;
  deepCatching: number;
  groundFielding: number;
  throwingPower: number;
  throwingAccuracy: number;
  reactionSpeed: number;
  anticipation: number;
}
```

#### Mental Attributes (1-20 Scale)
```typescript
interface MentalAttributes {
  temperament: number;
  gameAwareness: number;
  pressureHandling: number;
  patience: number;
  killerInstinct: number;
  decisionMaking: number;
  adaptability: number;
  workEthic: number;
  leadership: number;
  competitiveness: number;
}
```

#### Physical Attributes (1-20 Scale)
```typescript
interface PhysicalAttributes {
  speed: number;
  acceleration: number;
  agility: number;
  strength: number;
  stamina: number;
  balance: number;
  coreFitness: number;
  injuryResistance: number;
}
```

#### Supporting Types
```typescript
interface PlayerTrait {
  traitId: string;
  name: string;  // e.g., "Clutch Player", "Big Match Temperament"
}

interface RoleRating {
  roleRatingId: string;
  roleCode: string;    // e.g., "OPENER", "FINISHER", "DEATH_BOWLER"
  rating: number;      // 1-5 stars
}

interface SeasonStats {
  seasonStatsId: string;
  seasonId: string;
  teamId: string;
  format: string;
  matches: number;
  runs: number;
  battingAverage: number;
  strikeRate: number;
  wickets: number;
  economy: number;
  catches: number;
  momAwards: number;
}

interface ZoneAnalysis {
  zoneId: string;
  type: 'strength' | 'weakness';
  zoneLabel: string;
  description: string;
}

interface Achievement {
  achievementId: string;
  title: string;
  description: string;
  achievedOn: Timestamp | Date | string;
}

interface CoachReport {
  reportId: string;
  summary: string;
  pros: string;
  cons: string;
  createdAt: Timestamp | Date | string;
  coachId: string;
}
```

### Coach Profile
```typescript
interface CoachProfile {
  currentRole: string;
  qualificationLevel: string;
  coachingSince: number;
  primaryTeams: string[];
  preferredFormats: string[];
  philosophySummary: string;
  currentAbility: number;
  potentialAbility: number;
  reputation: number;
  
  coachingAttributes?: CoachingAttributes;
  tacticalAttributes?: TacticalAttributes;
  manManagementAttributes?: ManManagementAttributes;
  professionalAttributes?: ProfessionalAttributes;
  
  coachTraits?: string[];
  coachSeasonStats?: CoachSeasonStats[];
}

interface CoachingAttributes {
  battingCoaching: number;
  fastBowlingCoaching: number;
  spinBowlingCoaching: number;
  fieldingCoaching: number;
  wicketkeepingCoaching: number;
  youthDevelopment: number;
  seniorDevelopment: number;
  oneToOneCoaching: number;
  sessionPlanning: number;
  videoAnalysisUse: number;
}

interface TacticalAttributes {
  tacticsLimitedOvers: number;
  tacticsLongFormat: number;
  fieldSetting: number;
  bowlingChanges: number;
  battingOrderConstruction: number;
  inGameAdaptability: number;
  analyticsUse: number;
  oppositionAnalysis: number;
}

interface ManManagementAttributes {
  playerCommunication: number;
  parentCommunication: number;
  motivation: number;
  conflictManagement: number;
  disciplineStandards: number;
  leadershipPresence: number;
  playerWelfare: number;
  feedbackQuality: number;
}

interface ProfessionalAttributes {
  organisation: number;
  attentionToDetail: number;
  opennessToNewMethods: number;
  consistency: number;
  workEthic: number;
  pressureComposure: number;
  longTermPlanning: number;
}
```

### Umpire Profile
```typescript
interface UmpireProfile {
  certificationLevel: 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4' | 'Elite Panel' | string;
  homeAssociation: string;
  yearsActive: number;
  preferredFormats: string[];
  
  decisionAttributes?: UmpireDecisionAttributes;
  matchControlAttributes?: UmpireMatchControlAttributes;
  physicalAttributes?: UmpirePhysicalAttributes;
  
  matchesOfficiated?: number;
  umpireTraits?: string[];
}

interface UmpireDecisionAttributes {
  lbwJudgement: number;
  caughtBehindAccuracy: number;
  runOutPositioning: number;
  boundaryCalls: number;
  drsAccuracy: number;
  consistency: number;
}
```

### Scorer Profile
```typescript
interface ScorerProfile {
  certificationLevel: 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4' | string;
  preferredMethod: 'Digital' | 'Linear (Paper)' | 'Hybrid';
  experienceYears: number;
  
  technicalAttributes?: ScorerTechnicalAttributes;
  professionalAttributes?: ScorerProfessionalAttributes;
  
  matchesScored?: number;
  correctionRate?: number;
  scorerTraits?: string[];
}

interface ScorerTechnicalAttributes {
  softwareProficiency: number;
  lawKnowledge: number;
  linearScoring: number;
  digitalScoring: number;
  problemSolving: number;
}
```

### Medical Profile
```typescript
interface MedicalProfile {
  qualification: string;
  registrationNumber: string;
  specializations: string[];
  experienceYears: number;
  
  clinicalAttributes?: MedicalClinicalAttributes;
  rehabAttributes?: MedicalRehabAttributes;
  
  patientsTreated?: number;
  medicalTraits?: string[];
}
```

### Groundskeeper Profile
```typescript
interface GroundskeeperProfile {
  experienceYears: number;
  machineryLicenses: string[];
  primaryVenues: string[];
  
  pitchAttributes?: GroundskeeperPitchAttributes;
  outfieldAttributes?: GroundskeeperOutfieldAttributes;
  
  matchesPrepared?: number;
  avgPitchRating?: number;
  groundskeeperTraits?: string[];
}
```

---

## 3. Teams & Squads

### Team
```typescript
type OpenSuffix = '1st XI' | '2nd XI' | '3rd XI';
type YouthSuffix = 'U19A' | 'U19B' | 'U16A' | 'U16B' | 'U15A' | 'U15B' | 'U14A' | 'U14B' | 'U13A' | 'U13B';
type TeamSuffix = OpenSuffix | YouthSuffix | 'Development' | 'Academy' | string;

interface Team {
  id: string;
  name: string;
  abbreviatedName?: string;
  nickname?: string;
  schoolId: string;           // FK → School
  divisionId?: string;        // FK → Division
  suffix?: TeamSuffix;
  defaultCaptainId?: string;  // FK → Person
  defaultViceCaptainId?: string;
  coachIds?: string[];
  defaultScorerId?: string;
  teamColors?: {
    primary: string;
    secondary?: string;
  };
  logoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### Squad
```typescript
interface Squad {
  id: string;
  teamId: string;       // FK → Team
  season: string;
  squadName?: string;
  captainId?: string;
  viceCaptainId?: string;
  coachIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}
```

### Squad Player (Junction Table)
```typescript
interface SquadPlayer {
  id: string;
  squadId: string;      // FK → Squad
  playerId: string;     // FK → Person
  joinedAt?: Timestamp;
  isPrimary?: boolean;
  position?: string;
  isWicketkeeper?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

### Roster Member
```typescript
interface RosterMember {
  id: string;
  teamId: string;
  personId: string;
  role: string;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  jerseyNumber?: string;
  personName?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

---

## 4. Matches & Live Scoring

### Match
```typescript
type MatchState = 'SCHEDULED' | 'TEAM_SELECTION' | 'PRE_MATCH' | 'LIVE' | 'INNINGS_BREAK' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
type MatchStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed' | 'live';
type MatchFormat = 'T20' | 'ODI' | 'Test' | 'T10' | 'Other';

interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName?: string;
  awayTeamName?: string;
  matchDate: Timestamp | string;
  matchTime?: Timestamp;
  fieldId?: string;
  isDayNight?: boolean;
  
  // State Machine
  state?: MatchState;
  stateHistory?: Array<{
    from: string;
    to: string;
    timestamp: Timestamp | Date | string;
    triggeredBy: string;
    reason?: string;
  }>;
  
  // Legacy Status
  status: MatchStatus;
  isLive?: boolean;
  
  // Context
  venue?: string;
  location?: string;
  division?: string;
  leagueId?: string;
  seasonId?: string;
  
  // Match Configuration
  matchType?: MatchFormat;
  overs?: number;
  
  // Toss
  tossWinner?: string;
  tossChoice?: 'bat' | 'field';
  tossWinnerId?: string;
  tossDecision?: 'bat' | 'bowl';
  
  // Scores
  score?: {
    home?: string;
    away?: string;
  };
  homeScore?: number;
  awayScore?: number;
  result?: string;
  
  // Officials
  umpires?: string[];
  referee?: string;
  scorer?: string;
  
  // Team Selection
  teamSelection?: {
    home?: TeamLineup;
    away?: TeamLineup;
  };
  
  // Pre-Match
  preMatch?: PreMatchData;
  
  // Live Data
  liveData?: LiveMatchData;
  liveScore?: LiveScoreData;
  
  // Completion
  completion?: MatchCompletion;
  
  // Innings Data
  inningsData?: {
    firstInnings?: Innings;
    secondInnings?: Innings;
  };
  
  createdAt?: string;
  updatedAt?: string;
}

interface TeamLineup {
  playingXI: string[];
  reserves: string[];
  captain: string;
  viceCaptain?: string;
  confirmedAt?: Timestamp | Date | string;
  confirmedBy?: string;
}

interface PreMatchData {
  toss?: {
    winner: 'home' | 'away';
    decision: 'bat' | 'field';
    conductedAt: Timestamp | Date | string;
    conductedBy: string;
  };
  scorerChecklist?: {
    scorebookPrepared: boolean;
    teamSheetsReceived: boolean;
    umpiresBriefed: boolean;
    equipmentChecked: boolean;
    completedBy?: string;
    completedAt?: Timestamp | Date | string;
  };
  battingOrder?: {
    team: 'home' | 'away';
    order: string[];
  };
}

interface LiveMatchData {
  currentInnings: 1 | 2;
  currentOver: number;
  currentBall: number;
  striker: string;
  nonStriker: string;
  bowler: string;
  lastBallTimestamp: Timestamp | Date | string;
}

interface MatchCompletion {
  winner: 'home' | 'away' | 'tie' | 'draw' | 'no-result';
  margin?: string;
  completedAt: Timestamp | Date | string;
  finalResult: string;
  playerOfTheMatch?: string;
}
```

### Live Score (Real-time Scoring State)
```typescript
type BowlingAngle = 'Over the Wicket' | 'Round the Wicket';

interface LiveScore {
  matchId: string;
  status: 'live' | 'completed' | 'scheduled';
  inningsNumber: number;
  battingTeamId: string;
  bowlingTeamId: string;
  
  currentInnings: {
    runs: number;
    wickets: number;
    overs: number;
    balls: number;
    battingTeamId: string;
    bowlingTeamId: string;
    target?: number;
  };
  
  innings1?: InningsData;
  innings2?: InningsData;
  
  winnerId?: string;
  winMargin?: string;
  
  currentPlayers: {
    strikerId?: string;
    nonStrikerId?: string;
    bowlerId?: string;
    bowlingAngle?: BowlingAngle;
  };
  
  batsmen: LiveBatsman[];
  bowlers: LiveBowler[];
  
  ballHistory: Ball[];
  undoLog?: any[];
  
  extras?: {
    total: number;
    wides: number;
    noBalls: number;
    byes: number;
    legByes: number;
    partnership: number;
  };
  
  fallOfWickets?: LiveFallOfWicket[];
  partnerships?: Partnership[];
}

interface LiveBatsman {
  playerId: string;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOut: boolean;
  howOut?: string;
  bowlerId?: string;
}

interface LiveBowler {
  playerId: string;
  overs: number;
  balls: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
  economy: number;
  wides: number;
  noBalls: number;
}

interface Ball {
  runs: number;
  extras?: number;
  extrasType?: 'wide' | 'noball' | 'bye' | 'legbye';
  isWicket: boolean;
  wicketType?: string;
  playerOutId?: string;
  bowlerId?: string;
  batsmanId?: string;
  fielderId?: string;
  shotType?: string;
  coordinates?: { x: number; y: number };
  length?: 'Full' | 'Good' | 'Short' | 'Yorker';
  line?: 'Off Stump' | 'Middle Stump' | 'Leg Stump' | 'Wide Outside Off' | 'Wide Down Leg';
}
```

### Innings
```typescript
interface Innings {
  teamId: string;
  runs: number;
  wickets: number;
  overs: number;
  overHistory: Over[];
  battingCard?: BattingCardEntry[];
  bowlingCard?: BowlingCardEntry[];
  currentBatsmen?: string[];
  currentBowler?: string;
  
  batsmen?: Array<{
    playerId: string;
    runs: number;
    ballsFaced: number;
    fours?: number;
    sixes?: number;
    strikeRate?: number;
    isOut: boolean;
    dismissal?: string;
  }>;
  
  bowlers?: Array<{
    playerId: string;
    overs?: number;
    maidens?: number;
    runsConceded: number;
    wickets?: number;
    economy?: number;
  }>;
  
  extras?: {
    wides?: number;
    noballs?: number;
    byes?: number;
    legbyes?: number;
  };
}

interface Over {
  overNumber: number;
  balls: Ball[];
  bowlerId: string;
  runsConceded: number;
  wicketsTaken: number;
}

interface BattingCardEntry {
  playerId: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate?: number;
  dismissal?: string;
}

interface BowlingCardEntry {
  playerId: string;
  name: string;
  overs: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
  economyRate?: number;
}
```

---

## 5. Fixtures & Scheduling

### Fixture
```typescript
interface Fixture {
  id: string;
  matchId: string;
  scheduledAt: Timestamp;
  fieldId: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}
```

### Fixture Notification
```typescript
interface FixtureNotification {
  id: string;
  fixtureId: string;
  userIds: string[];
  notifiedAt: Timestamp;
  createdAt?: string;
  updatedAt?: string;
}
```

### Pre-Match Procedure
```typescript
interface PreMatchProcedure {
  id: string;
  fixtureId: string;
  coachesNotifiedAt?: Timestamp;
  captainNotifiedAt?: Timestamp;
  groundskeeperNotifiedAt?: Timestamp;
  playersNotifiedAt?: Timestamp;
  reservesNotifiedAt?: Timestamp;
  
  teamSelection?: {
    homePlayingXI: string[];
    homeReserves: string[];
    awayPlayingXI: string[];
    awayReserves: string[];
    selectedAt?: Timestamp;
    selectedBy?: string;
  };
  
  teamConfirmed?: {
    homeConfirmedAt?: Timestamp;
    homeConfirmedBy?: string;
    awayConfirmedAt?: Timestamp;
    awayConfirmedBy?: string;
  };
  
  scorerChecklist?: Array<{
    item: string;
    completed: boolean;
    completedBy?: string;
    completedAt?: Timestamp;
    approved?: boolean;
    approvedBy?: string;
    approvedAt?: Timestamp;
  }>;
  
  createdAt?: string;
  updatedAt?: string;
}
```

---

## 6. Equipment & Transactions

### Equipment
```typescript
interface Equipment {
  id: string;
  name: string;
  type: string;
  brand: string;
  category: string;
  status: 'Available' | 'In Use' | 'Maintenance';
  condition: 'New' | 'Good' | 'Fair' | 'Poor';
  quantity: number;
  assignedTo: string | null;
  cost?: number;
  schoolId?: string;
  purchaseDate?: string | Timestamp;
  lastMaintenanceDate?: string | Timestamp;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### Transaction
```typescript
interface Transaction {
  id: string;
  date: string;
  type: 'Income' | 'Expense';
  category: string;
  amount: number;
  description: string;
  status: 'Completed' | 'Pending' | 'Cancelled';
  paymentMethod?: string;
  reference?: string;
  schoolId?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### Sponsor
```typescript
interface Sponsor {
  id: string;
  name: string;
  industry: string;
  contributionAmount: number;
  active: boolean;
  logoUrl: string;
  website?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  tierLevel?: 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
  startDate?: string | Timestamp;
  endDate?: string | Timestamp;
  createdAt?: string;
  updatedAt?: string;
}
```

---

## 7. Analytics & Statistics

### Player Stats
```typescript
interface PlayerStats {
  matchesPlayed: number;
  inningsBatted: number;
  notOuts: number;
  totalRuns: number;
  highestScore: number;
  highestScoreNotOut: boolean;
  ballsFaced: number;
  battingAverage: number;
  strikeRate: number;
  hundreds: number;
  fifties: number;
  fours: number;
  sixes: number;
  oversBowled: number;
  runsConceded: number;
  maidens: number;
  wicketsTaken: number;
  bowlingAverage: number;
  economyRate: number;
  bestBowling: string;
  bestBowlingWickets: number;
  bestBowlingRuns: number;
  catches: number;
  stumpings: number;
}
```

### Team Stats
```typescript
interface TeamStats {
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  matchesDrawn: number;
  totalRunsScored: number;
  totalWicketsTaken: number;
  netRunRate: number;
}
```

### Head-to-Head Stats
```typescript
interface TeamHeadToHeadStats {
  id: string;
  teamAId: string;
  teamBId: string;
  matchesPlayed: number;
  teamAWins: number;
  teamBWins: number;
  draws: number;
  createdAt?: string;
  updatedAt?: string;
}
```

### Competition
```typescript
interface Competition {
  id: string;
  name: string;
  type: 'League' | 'Cup' | 'Tournament' | 'Festival' | 'Friendlies';
  competitionClass?: string;
  seasonId: string;
  seasonName: string;
  divisionId: string;
  divisionName: string;
  status: 'Draft' | 'In Progress' | 'Completed';
  winnerTeamId?: string;
  winnerTeamName?: string;
  winnerTeamLogoUrl?: string;
  teamIds?: string[];
  sponsorIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}
```

---

## 8. Validation Schemas (Zod)

### Player Validation
```typescript
const playerSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  dateOfBirth: z.string().min(1),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  schoolId: z.string().min(1),
  jerseyNumber: z.string().optional(),
  status: z.string().default('active'),
  role: z.string().default('Player'),
  primaryRole: z.string().default('Unknown'),
  battingStyle: z.string().default('Right-hand Bat'),
  bowlingStyle: z.string().default('Right-arm Medium'),
  
  // Nested attributes (all 1-20 scale with default 10)
  battingAttributes: battingAttributesSchema.optional(),
  bowlingAttributes: bowlingAttributesSchema.optional(),
  fieldingAttributes: fieldingAttributesSchema.optional(),
  mentalAttributes: mentalAttributesSchema.optional(),
  physicalAttributes: physicalAttributesSchema.optional(),
});
```

### Match Validation
```typescript
const matchSchema = z.object({
  homeTeamId: z.string().min(1, 'Home team is required'),
  awayTeamId: z.string().min(1, 'Away team is required'),
  venueId: z.string().min(1, 'Venue is required'),
  scheduledDate: z.string().min(1),
  scheduledTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
  format: z.enum(['T20', 'ODI', 'Test', 'First Class', 'Limited Overs', 'Other']),
  overs: z.string().optional(),
  competition: z.string().optional(),
  round: z.string().optional(),
  umpire1Id: z.string().optional(),
  umpire2Id: z.string().optional(),
  scorerId: z.string().optional(),
  broadcastUrl: z.string().url().optional(),
  notes: z.string().max(500).optional(),
});
```

### School Validation
```typescript
const schoolSchema = z.object({
  name: z.string().min(2).max(100),
  abbreviation: z.string().max(10).optional(),
  motto: z.string().max(200).optional(),
  establishmentYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
  principal: z.string().optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  logoUrl: z.string().url().optional(),
  brandColors: z.object({
    primary: z.string(),
    secondary: z.string(),
  }).optional(),
});
```

### Team Validation
```typescript
const teamSchema = z.object({
  name: z.string().min(2).max(100),
  abbreviatedName: z.string().max(10).optional(),
  nickname: z.string().optional(),
  schoolId: z.string().min(1),
  divisionId: z.string().optional(),
  suffix: z.string().optional(),
  teamColors: z.object({
    primary: z.string(),
    secondary: z.string().optional(),
  }).optional(),
  logoUrl: z.string().url().optional(),
});
```

---

## 9. Entity Relationships

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          GEOGRAPHIC HIERARCHY                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  Country (1) ──────┬──────> Province (N)                                     │
│                    │                                                         │
│                    └──────> League (N) ──────> Division (N)                  │
│                                                                              │
│  Province (1) ────────────> School (N) ──────> Team (N)                      │
│                                                                              │
│  Division (1) ────────────> Team (N)                                         │
│                              │                                               │
│                              └──────> Squad (N) ──────> SquadPlayer (N)      │
│                                                              │               │
│                                                              v               │
│                                                         Person (N)           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            MATCH & SCORING                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Match (1) ──────> Fixture (1)                                               │
│    │                                                                         │
│    ├──────> HomeTeam (Team)                                                  │
│    ├──────> AwayTeam (Team)                                                  │
│    ├──────> Field (Venue)                                                    │
│    ├──────> LiveScore (1)                                                    │
│    │           │                                                             │
│    │           ├──────> LiveBatsman (N)                                      │
│    │           ├──────> LiveBowler (N)                                       │
│    │           └──────> Ball[] (History)                                     │
│    │                                                                         │
│    └──────> Innings (2) ──────> Over (N) ──────> Ball (N)                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          PERSON & PROFILES                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Person (1) ──────┬──────> PlayerProfile (0..1)                              │
│                   │           ├──> BattingAttributes                         │
│                   │           ├──> BowlingAttributes                         │
│                   │           ├──> FieldingAttributes                        │
│                   │           ├──> MentalAttributes                          │
│                   │           ├──> PhysicalAttributes                        │
│                   │           ├──> PlayerTraits[]                            │
│                   │           ├──> RoleRatings[]                             │
│                   │           ├──> SeasonStats[]                             │
│                   │           └──> Achievements[]                            │
│                   │                                                          │
│                   ├──────> CoachProfile (0..1)                               │
│                   ├──────> UmpireProfile (0..1)                              │
│                   ├──────> ScorerProfile (0..1)                              │
│                   ├──────> MedicalProfile (0..1)                             │
│                   └──────> GroundskeeperProfile (0..1)                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Security Rules

### Recommended Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check authentication
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check admin role
    function isAdmin() {
      return isAuthenticated() && 
        request.auth.token.role in ['super_admin', 'admin', 'head_coach'];
    }
    
    // Helper function to check school membership
    function belongsToSchool(schoolId) {
      return isAuthenticated() && 
        request.auth.token.schoolId == schoolId;
    }
    
    // Read access for authenticated users
    match /{collection}/{document=**} {
      allow read: if isAuthenticated();
    }
    
    // Write access for admins
    match /people/{personId} {
      allow write: if isAdmin();
      allow update: if isAuthenticated() && request.auth.uid == resource.data.userId;
    }
    
    match /teams/{teamId} {
      allow write: if isAdmin();
    }
    
    match /matches/{matchId} {
      allow write: if isAdmin();
      allow update: if isAuthenticated() && 
        request.auth.token.role in ['scorer', 'head_coach', 'admin'];
    }
    
    match /schools/{schoolId} {
      allow write: if isAdmin();
    }
    
    match /equipment/{equipmentId} {
      allow write: if isAdmin();
    }
    
    match /transactions/{transactionId} {
      allow write: if isAdmin();
    }
  }
}
```

---

## Appendix: Data Access Patterns

### Server Actions
All data mutations go through server actions in `src/lib/actions/`:

| Action File              | Purpose                    |
|--------------------------|----------------------------|
| `playerActions.ts`       | Person CRUD operations     |
| `teamActions.ts`         | Team CRUD operations       |
| `matchActions.ts`        | Match CRUD & live scoring  |
| `equipmentActions.ts`    | Equipment management       |
| `transactionActions.ts`  | Financial transactions     |
| `sponsorActions.ts`      | Sponsor management         |
| `schoolActions.ts`       | School management          |
| `fieldActions.ts`        | Venue management           |

### Firestore Utilities
Generic and specific fetch functions in `src/lib/firestore.ts`:

```typescript
// Generic Operations
fetchCollection(collectionName)
fetchDocument(collectionName, docId)
createDocument(collectionName, data)
updateDocument(collectionName, docId, data)
deleteDocument(collectionName, docId)

// Specific Fetchers
fetchPlayers(limit?)
fetchTeams()
fetchMatches(limit?)
fetchFields()
fetchSponsors()
fetchTransactions()
fetchTopRunScorers(limit?)
fetchTopWicketTakers(limit?)
fetchSchools()
fetchDivisions()
fetchSeasons()
fetchLeagues()
```

---

*This schema documentation is auto-generated and should be kept in sync with the TypeScript interfaces in `src/types/firestore.ts`.*
