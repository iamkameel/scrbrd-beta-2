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
  purple?: string;
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
  batting?: any;
  bowling?: any;
  ageDivision?: string;
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
  // South African Transformation & Quota System & Structural Dimensions
  academicGrade?: "Grade 7" | "Grade 8" | "Grade 9" | "Grade 10" | "Grade 11" | "Grade 12";
  ageGroupEligibility?: "U9" | "U11" | "U13" | "U14" | "U15" | "U16" | "Open" | "U19_PROVINCIAL" | "U19_NATIONAL";
  squadId?: string; // e.g. "WES_1ST", "WES_2ND", "WES_U16A", "WES_U14G"
  squadName?: string; // e.g. "1st XI", "2nd XI", "3rd XI", "4th XI", "5th XI", "6th XI", "7th XI", "U16A", "U15A", "U14A"
  teamClass?: string; // e.g. "1st XI", "2nd XI", "U15A", "Senior B"
  classRank?: number; // 1, 2, 3...
  saDemographic?: "Black African" | "Generic Black" | "Open";
  quotaEligible?: boolean;
  bursaryScholar?: boolean;
  bursaryTrust?: string;
  provincialPathway?: string;
  // Multi-squad / Multi-Level affiliation records
  pathwayAffiliations?: {
    level: "high_school" | "district" | "provincial" | "national" | "club";
    teamName: string;
    teamClass: string;
    ageCategory: string;
    season: string;
    isPlayingUp?: boolean;
    role: string;
  }[];
  eligibilityDispensation?: {
    type: "playing_down" | "over_age_medical" | "developmental";
    reason: string;
    approvedBy: string;
    approvedDate: string;
    status: "approved" | "pending" | "expired";
    auditLog: string[];
  };
}

export type AgeGroup = "U9" | "U11" | "U13" | "U14" | "U15" | "U16" | "Open" | "U19_PROVINCIAL" | "U19_NATIONAL";
export type SquadDivision = "Open" | "U16" | "U15" | "U14";
export type CompetitionGroupingType = "DIVISION" | "POOL" | "CONFERENCE" | "FESTIVAL_GROUP" | "DEVELOPMENT_BAND" | "KNOCKOUT_BRACKET";

// ── CANONICAL STRUCTURAL ENTITIES ─────────────────────
export interface StructuralAgeGroup {
  ageGroupId: string;
  name: string; // "U14", "U15", "U16", "Open", "U19 (Provincial/National only)"
  code: string;
  scopeLevel: "primary" | "high_school" | "provincial" | "national" | "club";
  minimumAge?: number;
  maximumAge?: number; // null for Open
  isOpenCategory: boolean;
  defaultCutoffRule: string; // e.g. "Born on or after 1 Jan in competition year"
  active: boolean;
}

export interface CompetitionDivision {
  divisionId: string;
  competitionId: string;
  seasonId: string;
  name: string; // "Premier Division", "A Division", "B Division", "Development Pool", "Highway Festival"
  code: string;
  groupingType: CompetitionGroupingType;
  tier?: number; // 1, 2, 3...
  standingsEnabled: boolean; // false for grassroots / festival pools
  promotionRules?: string;
  relegationRules?: string;
}

export interface TeamClassRecord {
  teamClassId: string;
  organisationId: string;
  ageGroupId: string;
  displayName: string; // "1st XI", "2nd XI", "U15A", "U15B", "Academy"
  classCode: string;
  classRank?: number; // 1 for 1st XI / U15A, 2 for 2nd XI / U15B
  classType: "XI_RANK" | "LETTER_RANK" | "ACADEMY" | "DEVELOPMENT" | "RESERVE" | "INVITATIONAL" | "OTHER";
}

export interface PlayerEligibilityRecord {
  eligibilityId: string;
  playerId: string;
  competitionId: string;
  seasonId: string;
  ageGroupId: string;
  verifiedDateOfBirth: string;
  academicGrade: string;
  status: "eligible" | "playing_up" | "dispensation_approved" | "ineligible";
  determinationMethod: "dob_verified" | "governing_body_rule" | "formal_exemption";
  exceptionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  auditTrail: string[];
}

export interface TeamRoleAssignment {
  assignmentId: string;
  teamId: string;
  teamName: string;
  playerId: string;
  playerName: string;
  competitionLevel: "school" | "district" | "provincial" | "national" | "club";
  role: "striker_bat" | "opening_bowler" | "wicketkeeper" | "allrounder" | "substitute";
  seasonId: string;
  isCaptain: boolean;
  isViceCaptain: boolean;
  isPlayingUp: boolean;
  status: "active" | "standby" | "completed";
}

// ── SPEC: PLAYER SKILL ASSESSMENT & LONGITUDINAL DEVELOPMENT ──
export type RubricVersion = "cricket-v1" | "cricket-v2";
export type SkillConfidence = "high" | "medium" | "low" | "not_observed" | "inherited";
export type AssessmentStatus = "draft" | "committed" | "superseded" | "voided";

export interface BehavioralAnchor {
  score: 20 | 40 | 60 | 80 | 100;
  anchorText: string;
}

export interface SkillRubricItem {
  key: string;
  name: string;
  category: "batting" | "bowling" | "fielding" | "tacticalMental" | "physical";
  description: string;
  anchors: Record<number, string>; // 20, 40, 60, 80, 100
  benchmarks: {
    U14: number; // e.g. 52
    U15: number; // e.g. 58
    U16: number; // e.g. 65
    Open: number; // e.g. 74
  };
}

export interface SkillAssessmentRecord {
  id: string;
  tenantId: string; // school / club ID (e.g. "WES", "HIL")
  playerId: string;
  playerName: string;
  rubricVersion: RubricVersion;

  assessedBy: string; // coach ID e.g. "c1"
  assessorName: string;
  assessorRole: string;
  assessedAt: string;
  committedAt: string | null; // null while draft

  ageGroup: "U14" | "U15" | "U16" | "Open"; // true age category
  squad: string; // e.g. "U15C", "U15B", "1st XI"
  window: string; // e.g. "2024-T3", "2025-T1", "2025-T3", "2026-T1"

  priorAssessmentId: string | null;
  status: AssessmentStatus;

  // Raw stored scores: 0-100 against fixed terminal standard (100 = provincial trial standard)
  scores: {
    batting: {
      footwork: number;
      frontFootDrive: number;
      backFootPullCut: number;
      defenseLeave: number;
      powerHitting: number;
      strikeRotation: number;
    };
    bowling: {
      seamRelease: number;
      lineLengthControl: number;
      paceVariations: number;
      deathYorkers: number;
      driftTurn: number;
    };
    fielding: {
      ringGroundwork: number;
      highCatching: number;
      directHitAccuracy: number;
      gloveworkSpeed: number;
      athleticismSlide: number;
    };
    tacticalMental: {
      matchIQ: number;
      pressureComposure: number;
      fieldSettingIntuition: number;
      coachabilityWorkEthic: number;
    };
    physical: {
      mobilityIndex: number;
      weeklyOverTolerance: number;
      yoyoLevel: number;
      sprint20m: number;
    };
  };

  confidence: Record<string, SkillConfidence>; // per-skill confidence rating
  notes?: string; // Narrative notes (POPIA restricted - stripped for Analyst role!)
  targetDevelopmentGoals?: string[];
  isDemo?: boolean;
}

export interface LongitudinalPoint {
  window: string;
  date: string;
  squad: string;
  ageGroup: string;
  assessedBy: string;
  storedScore: number; // 0-100 fixed standard
  ageRelativeIndex: number; // storedScore / benchmark (e.g. 1.05 = 5% above age par)
  delta: number; // change from prior assessment
  isPromotionEvent?: boolean;
  promotionDetails?: string;
  isInherited?: boolean;
  isNotObserved?: boolean;
  developmentAlert?: "sustained_growth" | "on_par" | "sustained_decline";
}

export interface POPIASubjectAccessExport {
  exportId: string;
  generatedAt: string;
  playerId: string;
  playerName: string;
  parentOrGuardianRequest: boolean;
  schoolId: string;
  totalAssessments: number;
  records: SkillAssessmentRecord[];
  disclaimer: string;
}

export interface SchoolSquad {
  id: string; // e.g. "WES_1ST", "WES_2ND", "WES_3RD", ... "WES_7TH", "WES_U16A", ... "WES_U14G"
  schoolId: string; // e.g. "WES"
  name: string; // e.g. "1st XI", "2nd XI", "3rd XI", "4th XI", "5th XI", "6th XI", "7th XI", "U16A", "U16B", "U16C", "U16D", "U15A", "U15B", "U15C", "U15D", "U15E", "U14A", "U14B", "U14C", "U14D", "U14E", "U14F", "U14G"
  shortCode: string; // e.g. "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "16A", "16B", "15A", "14A", "14G"
  division: SquadDivision;
  tier: number; // 1 (1st XI / A), 2 (2nd XI / B), 3 (3rd XI / C), 4 (4th XI / D), 5 (5th XI / E), 6 (6th XI / F), 7 (7th XI / G)
  headCoachId: string;
  headCoachName: string;
  headCoachTitle: string;
  assistantCoachName?: string;
  managerName?: string;
  assignedGround: string;
  practiceSlot: string;
  squadCapCount: number;
  classRank?: number;
  matchFormat: "50-Over / Declaration" | "50-Over" | "40-Over" | "35-Over" | "30-Over" | "25-Over" | "20-Over";
  captainId?: string;
  viceCaptainId?: string;
  seasonRecord: { played: number; won: number; lost: number; drawn: number; tied: number };
  targetQuota: { blackAfricanMin: number; genericBlackMin: number };
}

export interface CoachingStaffMember {
  id: string;
  schoolId: string;
  name: string;
  email: string;
  phone: string;
  assignedSquads: string[]; // squad IDs e.g. ["WES_1ST"], ["WES_2ND"], ["WES_U15A"]
  primaryRole: "Director of Cricket" | "1st XI Head Coach" | "Coach" | "Assistant Coach" | "Specialist Bowling Coach" | "Specialist Batting Coach" | "Strength & Conditioning";
  csaAccreditation: "CSA Level 3 (High Performance)" | "CSA Level 2 (Advanced)" | "CSA Level 1 (Foundation)" | "Educator Coach";
  yearsExperience: number;
  bio: string;
  activeManagedSquadId: string;
  isHeadOfCricket?: boolean;
}

export interface PlayerMovementRecord {
  id: string;
  playerId: string;
  playerName: string;
  schoolId: string;
  fromSquad: string;
  toSquad: string;
  type: "promotion" | "tactical_callup" | "form_reset" | "injury_cover" | "demotion";
  reason: string;
  timestamp: string;
  authorizedBy: string;
  status: "approved" | "pending" | "temporary";
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
  angle?: number; // 0 - 360 degrees
  distance?: number; // 0 - 120 meters
  stroke?: string;
  bowler?: string;
  over?: number | string;
  outcome?: "dot" | "single" | "double" | "boundary" | "six" | "wicket";
  x?: number;
  y?: number;
  sector?: string;
  batsman?: string;
  description?: string;
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
  schoolId?: string;
  name: string;
  surface: string;
  moisturePct: number;
  grassHeightMm: number;
  rollerCompaction: string;
  bounceRating: number; // out of 10
  paceRating: number; // out of 10
  outfieldSpeed: "Fast" | "Medium-Fast" | "Medium" | "Slow" | string;
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
