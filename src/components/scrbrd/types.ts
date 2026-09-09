export interface Theme {
  bg: string;
  surf0: string;
  surf1: string;
  surf2: string;
  surf3: string;
  border: string;
  borderMed: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  cardBg: string;
  isDark: boolean;
  indigo: string;
  sky: string;
  emerald: string;
  amber: string;
  rose: string;
  orange: string;
  violet: string;
  cyan: string;
  teal: string;
  lime: string;
  pink: string;
  gradMain: string;
  gradGold: string;
  gradLive: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  pill: string;
  mono: string;
  head: string;
  body: string;
}

export interface SchoolRegistryItem {
  id: string;
  name: string;
  shortName: string;
  city: string;
  province: string;
  region: string;
  colors: [string, string] | string[];
  motto: string;
  crestIcon: string;
  founded: number;
  headOfCricket: string;
  fields: string[];
  mainOval: string;
  trophies: string[];
  stats: {
    titles: number;
    winRate: string;
    provincialReps: number;
    activePlayers: number;
    leaguePos: string;
    form: ("W" | "L" | "D")[];
  };
  derbyRival: string;
  derbyName: string;
  about: string;
}

export interface Player {
  id: string;
  name: string;
  team: string; // e.g. "1st XI", "U16A", "U15A", "U14A"
  school: string; // School ID (e.g. "WES", "HIL", "MIC", "MCB", "KEA", "DHS", "GLE", "CLF")
  role: "BAT" | "BOWL" | "ALL" | "WK";
  batHand: "R" | "L";
  bowlArm: "R" | "L";
  bowlStyle: "F" | "M" | "S";
  age: number;
  fitness: "fit" | "injured" | "rehab";
  avg: number;
  sr: number;
  wkts: number;
  econ: number;
  cap?: string;
  form?: number[];
  born?: string;
  hometown?: string;
  houseAtSchool?: string;
  height?: string;
  weight?: string;
  battingPos?: number;
  bio?: string;
  careerTotals?: {
    innings: number;
    runs: number;
    hs: number;
    fifties: number;
    hundreds: number;
    balls: number;
    wktsTotal: number;
    maidens: number;
    stumpings?: number;
    catches?: number;
  };
  seasonForm?: {
    opp: string;
    runs: number;
    wkts: number;
    date: string;
    result: string;
  }[];
}

export interface Match {
  id: string;
  schoolId?: string; // Home or host school ID
  homeTeam: string;
  awayTeam: string;
  venue: string;
  date: string;
  time: string;
  format?: "T20" | "50-Over" | "Declaration";
  ageGroup?: "1st XI" | "U16A" | "U15A" | "U14A";
  status: "live" | "complete" | "upcoming";
  currentScore?: string;
  target?: string;
  summary?: string;
  result?: string;
  liveOvers?: string;
  battingTeam?: string;
  strikerSummary?: string;
  transport?: {
    bus: string;
    driver: string;
    depart: string;
    return: string;
  };
}

export interface Competition {
  id: string;
  name: string;
  format: string;
  season: string;
  table: {
    team: string;
    schoolId?: string;
    P: number;
    W: number;
    L: number;
    pts: number;
    nrr: number;
  }[];
}

export interface DerbyRecord {
  pairKey: string;
  schoolA: string;
  schoolB: string;
  derbyTitle: string;
  sinceYear: number;
  totalClashes: number;
  winsA: number;
  winsB: number;
  draws: number;
  recentEncounters: {
    year: number;
    venue: string;
    winner: string;
    margin: string;
    starPerformer: string;
  }[];
  trophyName: string;
}

export interface ShotBall {
  id: string;
  runs: number;
  angle: number; // 0 - 360 degrees
  distance: number; // 0 - 120 meters
  stroke: string;
  bowler: string;
  over: number;
  outcome: "dot" | "single" | "double" | "boundary" | "six" | "wicket";
}

export interface Vehicle {
  id: string;
  model: string;
  capacity: number;
  plate: string;
  assignedDriver: string;
  status: "available" | "in-transit" | "maintenance";
  nextInspection: string;
  fuelPct: number;
  mileageKm: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  prdpStatus: "valid" | "renewing" | "expired";
  assignedVehicle: string;
  activeTrip?: string;
}

export interface Drill {
  id: string;
  name: string;
  category: "batting" | "bowling" | "fielding" | "fitness" | "tactical";
  durationMins: number;
  intensity: "low" | "medium" | "high";
  equipment: string[];
  description: string;
  keyCoachingPoints: string[];
}

export interface PitchCondition {
  groundId: string;
  schoolId: string;
  name: string;
  surface: string;
  moisturePct: number;
  grassHeightMm: number;
  rollerCompaction: string;
  bounceRating: number; // out of 10
  paceRating: number; // out of 10
  outfieldSpeed: "Fast" | "Medium" | "Slow";
  coversStatus: "off" | "on" | "standby";
  drainageTimeMin: number;
  curatorNotes: string;
  lastMaintained: string;
}

// ── COMMERCIAL & SPONSORSHIP ENGINE ───────────────────
export interface SponsorshipCampaign {
  id: string;
  sponsorName: string;
  logoText: string;
  logoBg: string;
  brandCategory: "Automotive" | "Banking" | "Sportswear" | "Nutrition" | "Education" | "Telecom";
  scopeType: "platform" | "region" | "competition" | "school" | "fixture";
  scopeId: string; // e.g. "WES", "DHS", "NOR", "KZN-T20", "all"
  inventoryType:
    | "PUBLIC_HOME_HERO"
    | "LIVE_MATCH_SCORE_BUG"
    | "WAGON_WHEEL_SAFE_ZONE"
    | "BOUNDARY_FOUR_MOMENT"
    | "SIX_TRACKER_MOMENT"
    | "WICKET_EVENT_MOMENT"
    | "PLAYER_OF_MATCH"
    | "SCORECARD_FOOTER";
  status: "active" | "scheduled" | "review" | "paused";
  startDate: string;
  endDate: string;
  contractValueZar: number;
  revenueShareSchoolPct: number;
  revenueSharePlatformPct: number;
  impressions: number;
  viewableImpressions: number;
  clickThroughs: number;
  exclusivityProtected: boolean;
  ctaText?: string;
  targetUrl?: string;
}

// ── POPIA & RBAC GOVERNANCE ───────────────────────────
export interface POPIAPermissionPolicy {
  role: string;
  can: string; // "crud", "cru", "ru", "r"
  scope: "all" | "school" | "team" | "own" | "none";
  only?: string[];
  deny?: Record<string, string[]>;
  sensitivityMax: number; // 0 to 4
  description: string;
}

// ── SCOUTING & TALENT DISCOVERY ───────────────────────
export interface ScoutProfile {
  id: string;
  name: string;
  organisation: string; // e.g. "KZN Inland Cricket Union", "Hollywoodbets Dolphins Academy", "Cricket South Africa (CSA)", "TUKS Cricket Academy"
  role: "Regional Selector" | "High Performance Scout" | "University Recruiter" | "Provincial Coach";
  verificationStatus: "verified" | "pending" | "suspended";
  verifiedDate: string;
  shortlistCount: number;
  savedQueriesCount: number;
  scoutingScope: string;
}

export interface TalentFilterCriteria {
  role: string;
  ageGroup: string;
  minAvg: number;
  minSr: number;
  minWkts: number;
  batHand?: string;
  bowlStyle?: string;
  scoutingDiscoverability: "approved_scout_network" | "public" | "all";
  evidenceThreshold: number; // Minimum innings recorded
}

// ── EVENT-SOURCED CRICKETOS DELIVERY ENGINE ───────────
export interface DeliveryEvent {
  eventId: string;
  fixtureId: string;
  inningsId: number;
  sequenceNumber: number;
  clientEventId: string;
  over: number;
  ball: number;
  bowlerId: string;
  bowlerName: string;
  strikerId: string;
  strikerName: string;
  nonStrikerId: string;
  nonStrikerName: string;
  runsBat: number;
  extraType?: "wd" | "nb" | "b" | "lb" | "penalty";
  extraRuns: number;
  totalRuns: number;
  isLegalBall: boolean;
  isWicket: boolean;
  wicketType?: "bowled" | "caught" | "lbw" | "run_out" | "stumped" | "hit_wicket";
  dismissedPlayerId?: string;
  dismissedPlayerName?: string;
  catcherOrFielderName?: string;
  shotType?: string;
  shotTrajectory?: "ground" | "aerial" | "controlled_aerial" | "miscued";
  contactQuality?: "middle" | "outside_edge" | "inside_edge" | "top_edge" | "beat" | "body";
  fieldZone?: string; // 12 field segments
  angleDeg?: number;
  distanceMeters?: number;
  commentary: string;
  captureProfile: "FULL" | "STANDARD" | "QUICK";
  queueStatus: "locally_committed" | "queued" | "syncing" | "acknowledged";
  clientCreatedAt: string;
  scorerDeviceId: string;
  supersedesEventId?: string;
}

// ── SCORECARD & PHASE SCORING INTERFACES ──────────────
export interface BattingEntry {
  id: string;
  playerId?: string;
  name: string;
  dismissal: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  sr: number;
  isNotOut: boolean;
  battingPos: number;
}

export interface BowlingEntry {
  id: string;
  playerId?: string;
  name: string;
  overs: string;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
  dots: number;
  fours: number;
  sixes: number;
  wides: number;
  noBalls: number;
}

export interface FallOfWicket {
  wicketNumber: number;
  score: number;
  player: string;
  over: string;
}

export interface PartnershipRecord {
  wicket: number;
  runs: number;
  balls: number;
  player1: { name: string; runs: number; balls: number };
  player2: { name: string; runs: number; balls: number };
  unbroken?: boolean;
}

export interface ExtrasBreakdown {
  byes: number;
  legByes: number;
  wides: number;
  noBalls: number;
  penalties: number;
  total: number;
}

export interface PhaseStats {
  name: "Powerplay" | "Middle Overs" | "Death Overs";
  oversRange: string;
  runs: number;
  wickets: number;
  runRate: number;
  dots: number;
  fours: number;
  sixes: number;
  dotPct: number;
  boundaryPct: number;
  strikeRotPct: number;
  parScore: number;
}

export interface PhaseBreakdown {
  powerplay: PhaseStats;
  middle: PhaseStats;
  death: PhaseStats;
}

export interface InningsScorecard {
  inningsNumber: number;
  teamName: string;
  teamShort: string;
  totalRuns: number;
  totalWickets: number;
  overs: string;
  runRate: number;
  batting: BattingEntry[];
  didNotBat: string[];
  bowling: BowlingEntry[];
  extras: ExtrasBreakdown;
  fow: FallOfWicket[];
  partnerships: PartnershipRecord[];
  phases: PhaseBreakdown;
}

export interface OverProgressionItem {
  over: number;
  runs: number;
  wickets: number;
  bowler: string;
  phase: "powerplay" | "middle" | "death";
  totalSoFar: number;
}

export interface WormDataPoint {
  over: number;
  team1Runs: number;
  team2Runs?: number;
  team1Wickets?: number;
  team2Wickets?: number;
  targetLine?: number;
}

export interface MatchScorecard {
  matchId: string;
  title: string;
  venue: string;
  date: string;
  format: "T20" | "50-Over" | "Declaration";
  ageGroup: string;
  toss: string;
  result?: string;
  status: "live" | "complete" | "upcoming";
  playerOfMatch?: string;
  umpires: string[];
  scorers: string[];
  dlsApplied?: boolean;
  dlsTarget?: number;
  innings1: InningsScorecard;
  innings2?: InningsScorecard;
  manhattan: OverProgressionItem[];
  worm: WormDataPoint[];
  winProb: {
    teamA: number;
    teamB: number;
    teamAName: string;
    teamBName: string;
    momentumText: string;
  };
}
