import {
  Player,
  Match,
  Competition,
  Theme,
  ShotBall,
  SchoolRegistryItem,
  DerbyRecord,
  PitchCondition,
} from "./types";

// ── LOGO ──────────────────────────────────────────────
export const SCRBRD_LOGO = "/scrbrd-logo.svg";

// ── THEME ENGINE ──────────────────────────────────────
export const DARK_THEME = {
  bg: "#060910", surf0: "#0a0f1a", surf1: "#0f1621",
  surf2: "#151d2e", surf3: "#1c2640",
  border: "rgba(255,255,255,0.07)", borderMed: "rgba(255,255,255,0.14)",
  textPrimary: "#f0f4ff", textSecondary: "#8b9bc4", textMuted: "#94a3b8", // WCAG 2.1 AA Compliant (7.19:1)
  cardBg: "rgba(255,255,255,0.03)", isDark: true,
};

export const LIGHT_THEME = {
  bg: "#f4f7fb", surf0: "#ffffff", surf1: "#ffffff",
  surf2: "#f8fafc", surf3: "#edf2f7",
  border: "rgba(0,0,0,0.08)", borderMed: "rgba(0,0,0,0.14)",
  textPrimary: "#0f172a", textSecondary: "#334155", textMuted: "#64748b",
  cardBg: "rgba(255,255,255,0.85)", isDark: false,
};

export const THEME_ACCENTS = {
  indigo: "#6366f1", sky: "#0ea5e9", emerald: "#10b981", amber: "#f59e0b",
  rose: "#f43f5e", orange: "#f97316", violet: "#8b5cf6", cyan: "#06b6d4",
  teal: "#14b8a6", lime: "#84cc16", pink: "#ec4899",
  gradMain: "linear-gradient(135deg,#6366f1,#0ea5e9)",
  gradGold: "linear-gradient(135deg,#f59e0b,#f97316)",
  gradLive: "linear-gradient(135deg,#10b981,#06b6d4)",
  sm: "6px", md: "10px", lg: "14px", xl: "18px", pill: "999px",
  mono: "var(--font-dm-mono), 'DM Mono', monospace",
  head: "var(--font-open-sans), 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  body: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

export const makeTheme = (isDark: boolean): Theme => ({
  ...(isDark ? DARK_THEME : LIGHT_THEME),
  ...THEME_ACCENTS,
});

// ── ROLES TAXONOMY (17 CANONICAL ROLES + SCOUT) ───────
export const ROLE_LAYERS = [
  { id: "platform", label: "Platform Governance", color: "#8b5cf6" },
  { id: "competition", label: "Competition & Governing Body", color: "#6366f1" },
  { id: "school", label: "School Governance", color: "#0ea5e9" },
  { id: "sporting", label: "Sporting Operations", color: "#10b981" },
  { id: "participant", label: "Participants", color: "#f59e0b" },
  { id: "external", label: "External / Commercial", color: "#4a5570" },
];

export const ROLES: Record<string, { label: string; layer: string; color: string; icon: string; scope: string; sensitivity: number; nav: string[]; purpose: string }> = {
  superadmin: {
    label: "Super Admin", layer: "platform", color: "#8b5cf6", icon: "⚡", scope: "platform", sensitivity: 4,
    nav: ["dashboard", "register", "notifications", "matches", "competitions", "promotion_demotion", "leagues", "analyst_cockpit", "squad", "profiles", "analytics", "skills", "scouting", "compare", "statsguru", "sponsorship", "broadcast", "training", "injuries", "logistics", "fields", "staff", "calendar", "governance", "rulebook", "pitchdeck", "settings"],
    purpose: "Full platform governance across all school tenants, competitions, and security policies",
  },
  platformsupport: {
    label: "Platform Support", layer: "platform", color: "#a855f7", icon: "🛡️", scope: "platform", sensitivity: 2,
    nav: ["dashboard", "register", "notifications", "matches", "squad", "logistics", "fields", "staff", "calendar", "governance"],
    purpose: "Technical operations and customer support with automated PII redaction",
  },
  headmaster: {
    label: "Headmaster / Executive", layer: "school", color: "#4338ca", icon: "🏛️", scope: "school", sensitivity: 3,
    nav: ["dashboard", "register", "notifications", "matches", "competitions", "promotion_demotion", "leagues", "squad", "profiles", "compare", "sponsorship", "broadcast", "logistics", "fields", "calendar"],
    purpose: "Institutional executive oversight — fixtures, prestige, honors, commercial rights",
  },
  schooladmin: {
    label: "School Admin", layer: "school", color: "#6366f1", icon: "🏫", scope: "school", sensitivity: 3,
    nav: ["dashboard", "register", "notifications", "matches", "competitions", "promotion_demotion", "squad", "profiles", "analytics", "compare", "sponsorship", "broadcast", "logistics", "fields", "staff", "calendar", "settings"],
    purpose: "Main school-level controller — teams, staff, registrations, fixture scheduling",
  },
  financeadmin: {
    label: "Finance Admin", layer: "school", color: "#10b981", icon: "💳", scope: "school", sensitivity: 3,
    nav: ["dashboard", "register", "notifications", "sponsorship", "broadcast", "logistics", "calendar", "settings"],
    purpose: "Commercial sponsorship accounting, invoices, and billing reconciliation — zero minor PII",
  },
  sportsmaster: {
    label: "Sportsmaster", layer: "sporting", color: "#f59e0b", icon: "🏅", scope: "school", sensitivity: 2,
    nav: ["dashboard", "register", "notifications", "matches", "competitions", "promotion_demotion", "leagues", "analyst_cockpit", "squad", "profiles", "analytics", "skills", "compare", "calendar", "settings"],
    purpose: "High-level school sports programme oversight across all codes and fixtures",
  },
  doc: {
    label: "Director of Cricket", layer: "sporting", color: "#0d9488", icon: "🏆", scope: "school", sensitivity: 2,
    nav: ["dashboard", "register", "notifications", "matches", "competitions", "promotion_demotion", "leagues", "analyst_cockpit", "squad", "profiles", "analytics", "skills", "scouting", "compare", "training", "injuries", "logistics", "fields", "staff", "calendar", "settings"],
    purpose: "Institutional Director of Cricket — oversight of all 23 squads (1st-7th XI, U16A-D, U15A-E, U14A-G), coach assignments, and talent pipeline",
  },
  headcoach: {
    label: "1st XI Head Coach", layer: "sporting", color: "#059669", icon: "⭐", scope: "team", sensitivity: 2,
    nav: ["dashboard", "register", "notifications", "matches", "analyst_cockpit", "squad", "profiles", "analytics", "skills", "scouting", "compare", "training", "injuries", "logistics", "fields", "calendar"],
    purpose: "Elite 1st XI leadership — selection, match plans, skills matrices, opposition scouting",
  },
  coach: {
    label: "Coach", layer: "sporting", color: "#10b981", icon: "🎯", scope: "team", sensitivity: 2,
    nav: ["dashboard", "register", "notifications", "matches", "analyst_cockpit", "squad", "profiles", "analytics", "skills", "compare", "training", "injuries", "logistics", "fields", "calendar"],
    purpose: "Age-group coaching — squad development, training drills, match preparation across junior and open tiers",
  },
  assistant: {
    label: "Coaching Assistant", layer: "sporting", color: "#22d3ee", icon: "🤝", scope: "team", sensitivity: 2,
    nav: ["dashboard", "register", "notifications", "matches", "squad", "profiles", "skills", "training", "injuries", "calendar"],
    purpose: "Team sporting support — attendance logging, skill ratings, drill execution",
  },
  analyst: {
    label: "Performance Analyst", layer: "sporting", color: "#0284c7", icon: "📊", scope: "school", sensitivity: 1,
    nav: ["dashboard", "register", "notifications", "matches", "analyst_cockpit", "profiles", "analytics", "skills", "scouting", "compare", "statsguru", "calendar"],
    purpose: "Match telemetry, 360° wagon wheels, Hawk-Eye DRS, pitch landing heatmaps, and opposition dossiers",
  },
  medical: {
    label: "Medical / Physio", layer: "school", color: "#f43f5e", icon: "⚕️", scope: "school", sensitivity: 4,
    nav: ["dashboard", "register", "notifications", "injuries", "squad", "profiles", "training", "calendar"],
    purpose: "Health and welfare oversight — clinical diagnoses, clearances, rehabilitation pipelines",
  },
  scorer: {
    label: "Official Scorer", layer: "sporting", color: "#f97316", icon: "📋", scope: "fixture", sensitivity: 1,
    nav: ["dashboard", "register", "notifications", "matches", "calendar"],
    purpose: "Authoritative ball-by-ball event logging with exclusive scorer token",
  },
  driver: {
    label: "Fleet Driver", layer: "school", color: "#06b6d4", icon: "🚌", scope: "route", sensitivity: 2,
    nav: ["dashboard", "notifications", "logistics", "calendar"],
    purpose: "Student transport logistics — route tracking, departure times, passenger manifests",
  },
  groundskeeper: {
    label: "Groundskeeper / Curator", layer: "school", color: "#14b8a6", icon: "🌿", scope: "venue", sensitivity: 2,
    nav: ["dashboard", "notifications", "fields", "calendar"],
    purpose: "Pitch and turfgrass prep — moisture telemetry, compaction rolling, toss advice",
  },
  player: {
    label: "Student Athlete", layer: "participant", color: "#0ea5e9", icon: "🏏", scope: "self", sensitivity: 1,
    nav: ["dashboard", "register", "notifications", "matches", "profiles", "analytics", "skills", "compare", "training", "injuries", "calendar"],
    purpose: "Participant self-management — personal stats, skills trajectory, training logs",
  },
  parent: {
    label: "Parent / Guardian", layer: "participant", color: "#f59e0b", icon: "👪", scope: "linked-child", sensitivity: 2,
    nav: ["dashboard", "register", "notifications", "matches", "competitions", "profiles", "logistics", "calendar"],
    purpose: "Support verified linked child — legal consent, bus schedules, live match scoring",
  },
  spectator: {
    label: "Spectator / Alumni", layer: "external", color: "#94a3b8", icon: "👀", scope: "public", sensitivity: 0,
    nav: ["dashboard", "register", "notifications", "matches", "competitions", "leagues", "rulebook", "pitchdeck"],
    purpose: "Public match centre, live scorecards, tournament standings, alumni updates",
  },
  scout: {
    label: "Verified Scout", layer: "external", color: "#e11d48", icon: "🔍", scope: "authorised", sensitivity: 1,
    nav: ["dashboard", "register", "notifications", "scouting", "compare", "profiles", "analytics", "skills", "matches"],
    purpose: "Authorized talent discovery on approved player profiles — zero private PII exposure",
  },
};

export const NAV_META: Record<string, { icon: string; label: string }> = {
  dashboard: { icon: "⚡", label: "Dashboard" },
  register: { icon: "📑", label: "Master Register" },
  matches: { icon: "🏏", label: "Matches" },
  competitions: { icon: "🏆", label: "Competitions" },
  promotion_demotion: { icon: "⚔️", label: "Promotion & Demotion" },
  leagues: { icon: "📋", label: "Leagues" },
  analyst_cockpit: { icon: "🔬", label: "Analyst Cockpit" },
  squad: { icon: "👥", label: "Squad" },
  profiles: { icon: "👤", label: "Profiles" },
  analytics: { icon: "📊", label: "Analytics" },
  skills: { icon: "🎯", label: "Skills" },
  scouting: { icon: "🔍", label: "Scouting Hub" },
  compare: { icon: "⚔️", label: "H2H Compare" },
  sponsorship: { icon: "💰", label: "Commercial Rights" },
  broadcast: { icon: "📡", label: "Broadcast & Media" },
  training: { icon: "💪", label: "Training" },
  injuries: { icon: "🏥", label: "Injuries" },
  logistics: { icon: "🚌", label: "Logistics" },
  calendar: { icon: "📅", label: "Calendar" },
  fields: { icon: "🌿", label: "Fields" },
  staff: { icon: "🔧", label: "Staff" },
  governance: { icon: "⚖️", label: "POPIA Governance" },
  notifications: { icon: "📥", label: "Inbox & Alerts" },
  inbox: { icon: "📥", label: "Inbox & Alerts" },
  settings: { icon: "⚙️", label: "Settings" },
  management: { icon: "🛠️", label: "Management" },
  rulebook: { icon: "📖", label: "Rulebook" },
  pitchdeck: { icon: "📐", label: "Pitch Deck" },
  statsguru: { icon: "📊", label: "StatsGuru Query" },
};

// ── POPIA POLICIES & RBAC CHOKE POINT ─────────────────
export const POPIA_POLICIES: Record<string, any> = {
  superadmin: { can: "crud", scope: "all", sensitivityMax: 4, desc: "Full platform root authority" },
  platformsupport: { can: "ru", scope: "all", deny: { "*": ["pii", "clinical"] }, sensitivityMax: 2, desc: "Support access with automatic PII masking" },
  headmaster: { can: "r", scope: "school", deny: { injuries: ["clinicalNotes"] }, sensitivityMax: 3, desc: "School governance without clinical medical files" },
  schooladmin: { can: "crud", scope: "school", deny: { injuries: ["clinicalNotes"] }, sensitivityMax: 3, desc: "School tenant administrator" },
  financeadmin: { can: "cru", scope: "school", only: ["finance", "invoices", "sponsorship", "billing"], deny: { profiles: ["born", "houseAtSchool", "height", "weight", "guardian"] }, sensitivityMax: 3, desc: "Commercial & invoice management, zero minor PII access" },
  sportsmaster: { can: "cru", scope: "school", sensitivityMax: 2, desc: "School sports operations and fixture scheduling" },
  doc: { can: "cru", scope: "school", deny: { injuries: ["clinicalNotes"] }, sensitivityMax: 2, desc: "Director of Cricket with oversight across all 23 squads" },
  headcoach: { can: "cru", scope: "team", deny: { injuries: ["clinicalNotes"] }, sensitivityMax: 2, desc: "1st XI leadership, skills matrices, selection" },
  coach: { can: "cru", scope: "team", deny: { injuries: ["clinicalNotes"] }, sensitivityMax: 2, desc: "Team coaching and training drills" },
  assistant: { can: "ru", scope: "team", sensitivityMax: 2, desc: "Coaching support and training logs" },
  analyst: { can: "cru", scope: "school", deny: { "*": ["pii", "guardian", "contact"] }, sensitivityMax: 1, desc: "Match telemetry with anonymized athlete identifiers" },
  medical: { can: "crud", scope: "school", only: ["injuries", "medical", "profiles", "squad", "training"], sensitivityMax: 4, desc: "Full clinical physiotherapy & Return-to-Play pipelines" },
  scorer: { can: "cru", scope: "fixture", only: ["scoring", "matches", "fixtures"], sensitivityMax: 1, desc: "Exclusive ball-by-ball scoring lease on assigned fixture" },
  driver: { can: "ru", scope: "route", only: ["logistics", "transport", "manifest"], sensitivityMax: 2, desc: "Vehicle telemetry, bus routes, passenger manifests" },
  groundskeeper: { can: "cru", scope: "venue", only: ["fields", "pitches", "weather"], sensitivityMax: 2, desc: "Curator reports, soil moisture, compaction, rolling" },
  player: { can: "ru", scope: "own", sensitivityMax: 1, desc: "Self athlete view — development, schedule, personal stats" },
  parent: { can: "r", scope: "own", only: ["profiles", "fixtures", "transport", "consent", "invoices"], sensitivityMax: 2, desc: "Verified linked child across school boundaries" },
  spectator: { can: "r", scope: "none", sensitivityMax: 0, desc: "Level 0 Public scoreboards, live scores, published tables" },
  scout: { can: "cru", scope: "all", only: ["scouting", "profiles", "matches", "analytics", "skills"], deny: { profiles: ["phone", "address", "guardian", "medical", "discipline"] }, sensitivityMax: 1, desc: "Verified talent discovery on approved player profiles — zero PII" },
};


// ── SCHOOLS REGISTRY WITH DISTINCT DATA ────────────────
export const SCHOOLS_REGISTRY: SchoolRegistryItem[] = [
  {
    id: "WES",
    name: "Westville Boys' High School",
    shortName: "Westville",
    city: "Westville",
    province: "KwaZulu-Natal",
    region: "Coastal",
    colors: ["#800000", "#C0C0C0"],
    motto: "Incepto Ne Desistam",
    crestIcon: "🛡️",
    founded: 1955,
    headOfCricket: "Wayne Scott",
    fields: ["Bowden's Field Oval", "Commons Field", "Roy Couzens Oval", "Lutge Field"],
    mainOval: "Bowden's Field Oval",
    trophies: ["KZN T20 Champions 2024", "Clifton Festival Winners 2023", "U15 National T20 Gold 2019"],
    stats: { titles: 8, winRate: "78%", provincialReps: 14, activePlayers: 53, leaguePos: "1st", form: ["W", "W", "W", "L", "W"] },
    derbyRival: "KEA",
    derbyName: "The Highway Derby",
    about: "Prominent coastal cricket powerhouse known for high-octane batting and fielding intensity.",
  },
  {
    id: "HIL",
    name: "Hilton College",
    shortName: "Hilton",
    city: "Hilton",
    province: "KwaZulu-Natal",
    region: "Midlands",
    colors: ["#0b2341", "#c8a951"],
    motto: "Orando et Laborando",
    crestIcon: "⚜️",
    founded: 1872,
    headOfCricket: "Dale Benkenstein",
    fields: ["Weightman-Smith Oval", "Hart-Davis Oval", "Mansfield Field", "Ellis Field"],
    mainOval: "Weightman-Smith Oval",
    trophies: ["National Schools T20 Champions 2021", "Midlands League Champions 2023", "Oppenheimer Shield 2024"],
    stats: { titles: 12, winRate: "82%", provincialReps: 18, activePlayers: 64, leaguePos: "1st (Midlands)", form: ["W", "W", "W", "W", "L"] },
    derbyRival: "MIC",
    derbyName: "The Midlands Classical Derby",
    about: "World-class independent boarding school estate perched high in the Midlands with historic turf pitches.",
  },
  {
    id: "MIC",
    name: "Michaelhouse",
    shortName: "Michaelhouse",
    city: "Balgowan",
    province: "KwaZulu-Natal",
    region: "Midlands",
    colors: ["#7a1828", "#d4af37"],
    motto: "Quis ut Deus",
    crestIcon: "⚔️",
    founded: 1896,
    headOfCricket: "Murray McDonald",
    fields: ["Roy Gathorne Oval", "Hannah's Field", "Meadow's Oval", "Tarpey Field"],
    mainOval: "Roy Gathorne Oval",
    trophies: ["St David's Festival Winners 2024", "Midlands U17 Trophy 2022", "KZN Independent Cup 2023"],
    stats: { titles: 9, winRate: "74%", provincialReps: 15, activePlayers: 58, leaguePos: "2nd (Midlands)", form: ["W", "W", "L", "W", "W"] },
    derbyRival: "HIL",
    derbyName: "The Midlands Classical Derby",
    about: "Historic Balgowan campus famed for traditional declaration time cricket, lush boundaries, and mist-affected seam.",
  },
  {
    id: "MCB",
    name: "Maritzburg College",
    shortName: "College",
    city: "Pietermaritzburg",
    province: "KwaZulu-Natal",
    region: "Midlands Inland",
    colors: ["#c8102e", "#1e293b"],
    motto: "Pro Aris et Focis",
    crestIcon: "🚩",
    founded: 1863,
    headOfCricket: "Kyle Nipper",
    fields: ["Goldstones Oval", "Barns Field", "Pape's Field", "Snow's Field"],
    mainOval: "Goldstones Oval",
    trophies: ["Fichardt Week Winners 2024", "National 50-Over Finalist 2023", "KZN Inland Double 2022"],
    stats: { titles: 15, winRate: "79%", provincialReps: 22, activePlayers: 72, leaguePos: "1st (Inland)", form: ["W", "W", "W", "W", "W"] },
    derbyRival: "GLE",
    derbyName: "The Red-Black-White Traditional",
    about: "The oldest school in PMB, legendary for fierce competitive spirit and producing Proteas test cricketers.",
  },
  {
    id: "KEA",
    name: "Kearsney College",
    shortName: "Kearsney",
    city: "Botha's Hill",
    province: "KwaZulu-Natal",
    region: "Valley of 1000 Hills",
    colors: ["#003087", "#eaaa00"],
    motto: "Carpe Diem",
    crestIcon: "🦁",
    founded: 1921,
    headOfCricket: "Andre van Zyl",
    fields: ["AH Smith Oval", "Matterson Field", "Silcock Field", "Hopkins Field"],
    mainOval: "AH Smith Oval",
    trophies: ["Kearsney Festival Champions 2024", "Sunfoil Night League 2023"],
    stats: { titles: 7, winRate: "71%", provincialReps: 12, activePlayers: 48, leaguePos: "3rd (Coastal)", form: ["W", "L", "W", "W", "L"] },
    derbyRival: "WES",
    derbyName: "The Highway Derby",
    about: "Perched atop Botha's Hill, renowned for hosting South Africa's premier independent school cricket festival.",
  },
  {
    id: "DHS",
    name: "Durban High School",
    shortName: "DHS",
    city: "Durban",
    province: "KwaZulu-Natal",
    region: "Coastal",
    colors: ["#004d25", "#d97706"],
    motto: "Deo Danti Dedit",
    crestIcon: "🐎",
    founded: 1866,
    headOfCricket: "Fabian Lazarus",
    fields: ["The Memorial Ground", "Seabreeze Oval", "Top Field"],
    mainOval: "The Memorial Ground",
    trophies: ["Coastal Derby Shield 2023", "Sunfoil Provincial Cup 2022"],
    stats: { titles: 11, winRate: "76%", provincialReps: 16, activePlayers: 54, leaguePos: "2nd (Coastal)", form: ["W", "W", "W", "L", "W"] },
    derbyRival: "GLE",
    derbyName: "The Durban Classic Derby",
    about: "Historic Berea institution with an illustrious cricket pedigree, famous for fast sea-breeze reverse swing.",
  },
  {
    id: "GLE",
    name: "Glenwood High School",
    shortName: "Glenwood",
    city: "Durban",
    province: "KwaZulu-Natal",
    region: "Coastal",
    colors: ["#15803d", "#f8fafc"],
    motto: "Nihil Humani Alienum",
    crestIcon: "🌲",
    founded: 1910,
    headOfCricket: "Brandon Scullard",
    fields: ["Dixons Oval", "The Subway Field", "Trevor Goddard Oval"],
    mainOval: "Dixons Oval",
    trophies: ["KZN Super 8 Winners 2022", "Green Machine Trophy 2024"],
    stats: { titles: 6, winRate: "68%", provincialReps: 10, activePlayers: 46, leaguePos: "4th (Coastal)", form: ["L", "W", "W", "L", "W"] },
    derbyRival: "DHS",
    derbyName: "The Durban Classic Derby",
    about: "Known as the Green Machine, tough, disciplined coastal contenders with explosive bowling units.",
  },
  {
    id: "CLF",
    name: "Clifton School",
    shortName: "Clifton",
    city: "Durban",
    province: "KwaZulu-Natal",
    region: "Coastal",
    colors: ["#065f46", "#06b6d4"],
    motto: "Prodesse Quam Conspici",
    crestIcon: "⚓",
    founded: 1924,
    headOfCricket: "Wayne Phillips",
    fields: ["Riverside Sports Complex", "Stubbs Oval", "Northlands Field"],
    mainOval: "Riverside Sports Complex",
    trophies: ["Clifton T20 Shield 2023", "Independent U15 Trophy 2024"],
    stats: { titles: 4, winRate: "65%", provincialReps: 9, activePlayers: 42, leaguePos: "5th (Coastal)", form: ["W", "L", "L", "W", "W"] },
    derbyRival: "DHS",
    derbyName: "The Berea Derby",
    about: "Rapidly rising Durban school, known for modern tactical fielding setups and white-ball mastery.",
  },
  {
    id: "NOR",
    name: "Northwood School",
    shortName: "Northwood",
    city: "Durban North",
    province: "KwaZulu-Natal",
    region: "Coastal",
    colors: ["#002b49", "#f8fafc"],
    motto: "Per Ardua Ad Alta",
    crestIcon: "⚔️",
    founded: 1948,
    headOfCricket: "Morné van Vuuren",
    fields: ["Founders Field Oval", "Lower Field", "Baumann Field", "Smuts Oval"],
    mainOval: "Founders Field Oval",
    trophies: ["Clifton T20 Finalist 2024", "Coastal U16 Shield 2023", "Durban North Derby Trophy 2024"],
    stats: { titles: 7, winRate: "73%", provincialReps: 13, activePlayers: 52, leaguePos: "3rd (Coastal)", form: ["W", "W", "L", "W", "W"] },
    derbyRival: "CLF",
    derbyName: "The Durban North Coastal Derby",
    about: "The Knights of Durban North, renowned for hard-hitting all-rounders, aggressive fielding and relentless seam bowling on Founders Oval.",
  },
];

// ── SA TRANSFORMATION & QUOTA DEMOGRAPHIC DETECTION ──────
function detectSADemographic(name: string): "Black African" | "Generic Black" | "Open" {
  const n = name.toLowerCase();
  const blackAfricanSurnames = [
    "ngcobo", "nxumalo", "mthembu", "khumalo", "dlamini", "sithole", "mposula", "ntini",
    "cele", "zuma", "ndlovu", "mchunu", "zungu", "buthelezi", "khoza", "sibiya", "mbatha",
    "mtshali", "mkhize", "vilakazi", "moyo", "shabalala", "biyela", "nkosi", "madonsela", "zulu"
  ];
  const genericBlackSurnames = [
    "solomons", "petersen", "naidoo", "govender", "pillay", "jacobs", "da costa", "chetty",
    "moodley", "adams", "hendricks", "daniels", "van niekerk", "coetzee", "abrahams", "padayachee",
    "reddy", "maharaj", "singh", "patel", "isaacs", "arendse", "fortune", "klaasen", "september",
    "ramlall", "brijlal"
  ];

  for (const s of blackAfricanSurnames) {
    if (n.includes(s)) return "Black African";
  }
  for (const s of genericBlackSurnames) {
    if (n.includes(s)) return "Generic Black";
  }
  return "Open";
}

// ── FULL AUTHENTIC PLAYER ROSTERS BY SCHOOL (Complete Playing XI for all 9 schools) ──
function makeP(
  id: string, name: string, school: string, role: "BAT" | "BOWL" | "ALL" | "WK",
  pos: number, batHand: "R" | "L", bowlArm: "R" | "L", bowlStyle: "F" | "M" | "S",
  age: number, avg: number, sr: number, wkts: number, econ: number,
  hometown: string, house: string, bio: string, cap?: "c" | "vc",
  teamOverride?: string, customDemographic?: "Black African" | "Generic Black" | "Open", customBursary?: boolean
): Player {
  const team = teamOverride || (age <= 14 ? "U14A" : age === 15 ? "U15A" : age === 16 ? "U16A" : "1st XI");
  const ageGroupEligibility: "U14" | "U15" | "U16" | "Open" =
    age <= 14 ? "U14" : age === 15 ? "U15" : age === 16 ? "U16" : "Open";
  const academicGrade: "Grade 8" | "Grade 9" | "Grade 10" | "Grade 11" | "Grade 12" =
    age <= 14 ? "Grade 8" : age === 15 ? "Grade 9" : age === 16 ? "Grade 10" : age === 17 ? "Grade 11" : "Grade 12";
  const teamClass = team;
  const classRank = team.includes("1st") || team.endsWith("A") ? 1 : team.includes("2nd") || team.endsWith("B") ? 2 : 3;

  const saDemographic = customDemographic || detectSADemographic(name);
  const quotaEligible = saDemographic === "Black African" || saDemographic === "Generic Black";
  const bursaryScholar = customBursary !== undefined
    ? customBursary
    : (quotaEligible && (pos % 2 === 0 || hometown.includes("Umlazi") || hometown.includes("KwaMashu") || hometown.includes("Chatsworth") || hometown.includes("Phoenix") || hometown.includes("Berea") || hometown.includes("Pietermaritzburg")));
  const bursaryTrust = bursaryScholar
    ? (saDemographic === "Black African" ? "Sunfoil Township Development Trust" : "KZN Cricket Union Transformation Bursary")
    : undefined;
  const provincialPathway = age >= 17 ? "Khaya Majola U19 Week" : age === 16 ? "Grant Khomo U16 Week" : age === 15 ? "U15 National Week" : "U14 Regional Talent Development";

  // Multi-squad / pathway affiliations across levels (School Open + Provincial U19 + National U19)
  const pathwayAffiliations = [
    {
      level: "high_school" as const,
      teamName: `${school} ${team}`,
      teamClass,
      ageCategory: ageGroupEligibility,
      season: "2026",
      isPlayingUp: (age <= 16 && team.includes("1st XI")),
      role: role === "WK" ? "Wicketkeeper" : role === "BOWL" ? "Opening Seamer" : "Top Order Bat",
    },
    ...(age >= 16 ? [{
      level: "provincial" as const,
      teamName: "KZN Coastal U19 Representative Squad",
      teamClass: "U19 Provincial",
      ageCategory: "U19_PROVINCIAL",
      season: "2026",
      isPlayingUp: age === 16,
      role: role === "ALL" ? "Allrounder" : "Strike Player",
    }] : []),
  ];

  return {
    id, name, team, school, role, batHand, bowlArm, bowlStyle, age, fitness: "fit",
    avg, sr, wkts, econ, cap, form: [4, 5, 4, 6, 5, 4, 5, 6],
    born: `200${age === 18 ? 6 : age === 17 ? 7 : age === 16 ? 8 : age === 15 ? 9 : 0}-05-12`, hometown, houseAtSchool: house,
    height: "182cm", weight: "76kg", battingPos: pos, bio,
    careerTotals: { innings: 25 + Math.floor(avg), runs: Math.round(avg * 28), hs: Math.min(138, Math.round(avg * 2.2)), fifties: Math.floor(avg / 6), hundreds: avg > 45 ? 2 : 0, balls: wkts * 24, wktsTotal: wkts * 2, maidens: Math.floor(wkts * 0.6) },
    academicGrade,
    ageGroupEligibility,
    teamClass,
    classRank,
    saDemographic,
    quotaEligible,
    bursaryScholar,
    bursaryTrust,
    provincialPathway,
    pathwayAffiliations,
  };
}

export const PLAYERS: Player[] = [
  // ── WESTVILLE BOYS' HIGH (WES) ──
  makeP("w1", "James Whitfield", "WES", "BAT", 1, "R", "R", "M", 17, 48.2, 135.4, 8, 7.2, "Westville", "School House", "Captain & opening bat. Classical driver and anchor.", "c"),
  makeP("w2", "Ryan Campbell", "WES", "BAT", 2, "L", "R", "M", 17, 42.5, 128.0, 0, 0.0, "Pinetown", "Wandsbeck", "Aggressive left-hand opener, explosive powerplay striker.", "vc"),
  makeP("w3", "Theo Pretorius", "WES", "BAT", 3, "R", "R", "M", 16, 39.8, 122.5, 4, 7.8, "Westville", "School House", "Technically solid #3 batsman with high conversion rate."),
  makeP("w4", "Ethan Solomons", "WES", "ALL", 4, "L", "L", "S", 17, 36.8, 142.0, 15, 7.1, "Kloof", "Outeniqua", "Dynamic left-hand middle-order bat and slow left-arm spinner."),
  makeP("w5", "Kyle Jansen", "WES", "BAT", 5, "R", "R", "M", 18, 33.4, 118.0, 2, 8.2, "Durban", "Inanda", "Middle-order accumulator and tactical runner between wickets."),
  makeP("w6", "Marcus Ngcobo", "WES", "WK", 6, "R", "R", "M", 17, 29.4, 118.5, 0, 0.0, "Durban", "Inanda", "Lightning gloveman with 28 dismissals this season."),
  makeP("w7", "Tristan Snyman", "WES", "ALL", 7, "R", "R", "M", 17, 26.0, 131.0, 18, 6.7, "Hillcrest", "Outeniqua", "Seam-bowling all-rounder with strong death-over capability."),
  makeP("w8", "Luca De Villiers", "WES", "BOWL", 8, "R", "R", "F", 18, 14.5, 98.0, 24, 6.8, "Pinetown", "Wandsbeck", "Opening strike fast bowler. Hits 132 km/h with late outswing."),
  makeP("w9", "Aiden Petersen", "WES", "BOWL", 9, "R", "R", "S", 18, 11.2, 84.0, 19, 5.9, "Westville", "Wandsbeck", "Premier leg-spinner with sharp drift and wrong'un."),
  makeP("w10", "Matthew Breetzke", "WES", "BOWL", 10, "R", "L", "F", 17, 9.6, 75.0, 17, 6.1, "Cowies Hill", "School House", "Left-arm fast bowler creating awkward angles into right-handers."),
  makeP("w11", "Chadwick Foster", "WES", "BOWL", 11, "R", "R", "S", 16, 7.0, 60.0, 14, 5.4, "Westville", "Inanda", "Off-spinner with excellent economy and control in middle overs."),

  // ── HILTON COLLEGE (HIL) ──
  makeP("h1", "Matthew Stewart", "HIL", "BAT", 1, "R", "R", "M", 18, 54.6, 138.2, 5, 6.9, "Nottingham Road", "Pearce House", "Captain of Hilton 1st XI. Powerhouse opening batter, SA U19 prospect.", "c"),
  makeP("h2", "Oliver Da Costa", "HIL", "BAT", 2, "R", "R", "M", 17, 38.4, 120.0, 0, 0.0, "Hilton", "Ellis House", "Tenacious opening batsman who wears down new-ball attacks."),
  makeP("h3", "Jonathan van Zyl", "HIL", "WK", 3, "L", "R", "M", 17, 42.1, 126.0, 0, 0.0, "Underberg", "Ellis House", "Stylish left-handed wicketkeeper-batsman with sublime timing.", "vc"),
  makeP("h4", "Luke Campbell", "HIL", "ALL", 4, "R", "R", "S", 17, 38.0, 115.0, 22, 6.1, "Hilton", "Falcon House", "Leg-spin all-rounder. Master of tactical field settings."),
  makeP("h5", "Ben Armstrong", "HIL", "BAT", 5, "R", "R", "M", 18, 34.2, 124.0, 3, 7.5, "Pietermaritzburg", "Churchill House", "Aggressive middle-order boundary hitter down the ground."),
  makeP("h6", "Ross Boast", "HIL", "ALL", 6, "L", "L", "M", 17, 28.5, 110.0, 16, 6.4, "Karkloof", "Pearce House", "Left-arm seam all-rounder effective on lively Midlands tracks."),
  makeP("h7", "David Kitshoff", "HIL", "ALL", 7, "R", "R", "F", 16, 22.0, 115.0, 18, 6.2, "Howick", "Falcon House", "Pace bowler and hard-hitting lower-order batsman."),
  makeP("h8", "Christopher Dyer", "HIL", "BOWL", 8, "R", "R", "F", 18, 9.8, 72.0, 31, 5.8, "Pietermaritzburg", "Churchill House", "Express strike bowler. Generated 135 km/h with lethal yorker."),
  makeP("h9", "Nicholas Sclater", "HIL", "BOWL", 9, "R", "R", "S", 17, 8.5, 68.0, 20, 5.5, "Hilton", "Ellis House", "Deceptive off-spinner with brilliant flight and variation."),
  makeP("h10", "Michael Hathorn", "HIL", "BOWL", 10, "L", "L", "F", 18, 6.2, 55.0, 23, 5.9, "Pietermaritzburg", "Pearce House", "Tall left-arm seamer extracting steep bounce."),
  makeP("h11", "Liam O'Connor", "HIL", "BOWL", 11, "R", "R", "F", 17, 5.0, 50.0, 19, 6.0, "Durban", "Churchill House", "Accurate line-and-length fast-medium bowler."),

  // ── MICHAELHOUSE (MIC) ──
  makeP("m1_p", "Murray Baker", "MIC", "BAT", 1, "L", "R", "M", 17, 51.2, 128.5, 0, 0.0, "Mooi River", "West", "Prolific left-handed opener. Negotiates swinging new ball expertly."),
  makeP("m2_p", "Jack Waterhouse", "MIC", "BAT", 2, "R", "R", "M", 18, 39.0, 121.0, 0, 0.0, "Balgowan", "Founders", "Solid opening batsman with crisp cut and pull shots.", "vc"),
  makeP("m3_p", "Sebastian Hofmeyr", "MIC", "BAT", 3, "R", "R", "M", 17, 41.5, 125.0, 2, 7.8, "Nottingham Road", "Pascoe", "Graceful #3 batsman with expansive cover drive."),
  makeP("m4_p", "Hayden Higgs", "MIC", "ALL", 4, "R", "R", "F", 18, 46.5, 131.0, 26, 6.4, "Balgowan", "Founders", "Captain of Michaelhouse. Premier all-rounder in KZN inland.", "c"),
  makeP("m5_p", "Alexander Vermeulen", "MIC", "BAT", 5, "R", "R", "M", 18, 35.0, 116.0, 4, 7.2, "Pietermaritzburg", "East", "Composed middle-order batsman and agile slip fielder."),
  makeP("m6_p", "Cameron Strudwick", "MIC", "WK", 6, "R", "R", "M", 16, 35.4, 112.0, 0, 0.0, "Pietermaritzburg", "Baines", "Grade 11 gloveman. Clean striker of the cricket ball."),
  makeP("m7_p", "Thomas Griffin", "MIC", "ALL", 7, "L", "L", "S", 17, 27.2, 119.0, 19, 5.7, "Underberg", "West", "Left-arm orthodox spinner and dangerous lower-order batsman."),
  makeP("m8_p", "Graydon Leslie", "MIC", "BOWL", 8, "L", "L", "F", 17, 12.0, 80.0, 28, 5.9, "Hilton", "Pascoe", "Left-arm fast bowler who angles across right-handers."),
  makeP("m9_p", "Luke Johnston", "MIC", "BOWL", 9, "R", "R", "F", 18, 8.4, 70.0, 24, 6.1, "Durban", "Founders", "Skiddy fast bowler with effective slower ball disguise."),
  makeP("m10_p", "Karan Naidoo", "MIC", "BOWL", 10, "R", "R", "S", 17, 7.1, 62.0, 21, 5.2, "Pietermaritzburg", "East", "Frontline off-spinner with subtle drift and arm-ball."),
  makeP("m11_p", "William Gilson", "MIC", "BOWL", 11, "R", "R", "F", 17, 4.8, 48.0, 17, 6.3, "Mooi River", "Baines", "Tall seam bowler providing early breakthroughs."),

  // ── MARITZBURG COLLEGE (MCB) ──
  makeP("c1", "Bryn Brokensha", "MCB", "BAT", 1, "R", "R", "F", 18, 38.0, 125.0, 34, 5.6, "Howick", "Nathan's House", "Fierce competitor and strike fast bowler who also opens batting.", "vc"),
  makeP("c2", "Oliver Thompson", "MCB", "BAT", 2, "L", "R", "M", 17, 44.0, 122.0, 0, 0.0, "Pietermaritzburg", "Clark's House", "Classic left-handed opener who blunts opening attacks."),
  makeP("c3", "Chad Mason", "MCB", "BAT", 3, "R", "R", "M", 18, 53.0, 136.0, 4, 7.0, "Pietermaritzburg", "Clark's House", "Captain of College 1st XI. Fearless stroke-maker on Goldstones.", "c"),
  makeP("c4", "Luc Jacobs", "MCB", "ALL", 4, "L", "R", "S", 17, 39.8, 124.0, 21, 5.8, "Pietermaritzburg", "Forder's House", "Right-arm off-spinner and left-hand stroke player."),
  makeP("c5", "Liam Armstrong", "MCB", "BAT", 5, "R", "R", "M", 18, 36.5, 128.0, 6, 7.4, "Pietermaritzburg", "Snow's House", "Aggressive middle-order anchor with strong sweep shot."),
  makeP("c6", "Sphamandla Dlamini", "MCB", "WK", 6, "R", "R", "M", 17, 32.5, 119.0, 0, 0.0, "Edendale", "Snow's House", "Acrobatic wicketkeeper with 32 dismissals this season."),
  makeP("c7", "Caleb Thomas", "MCB", "ALL", 7, "R", "R", "M", 17, 28.0, 120.0, 17, 6.2, "Hilton", "Forder's House", "Reliable medium-pacer and powerful pinch-hitter."),
  makeP("c8", "Sanele Mthembu", "MCB", "BOWL", 8, "R", "R", "F", 18, 11.0, 75.0, 26, 5.9, "Pietermaritzburg", "Clark's House", "Opening fast bowler with venomous outswinger."),
  makeP("c9", "Kyle Willows", "MCB", "BOWL", 9, "R", "R", "S", 17, 9.2, 68.0, 23, 5.4, "Howick", "Nathan's House", "Accurate leg-spinner who runs through middle orders."),
  makeP("c10", "Darryl Van Niekerk", "MCB", "BOWL", 10, "L", "L", "F", 17, 6.8, 54.0, 20, 6.0, "Pietermaritzburg", "Snow's House", "Left-arm swing bowler who attacks the stumps."),
  makeP("c11", "Ayanda Khumalo", "MCB", "BOWL", 11, "R", "R", "M", 16, 4.5, 45.0, 15, 5.8, "Pietermaritzburg", "Forder's House", "Disciplined seam bowler keeping strict lines."),

  // ── KEARSNEY COLLEGE (KEA) ──
  makeP("k1", "Jethro Brophy", "KEA", "BAT", 1, "R", "R", "M", 17, 43.5, 126.0, 0, 0.0, "Hillcrest", "Gaba", "Solid opening batsman with excellent back-foot punches.", "vc"),
  makeP("k2", "Keegan de Jager", "KEA", "BAT", 2, "L", "R", "M", 18, 39.2, 122.0, 0, 0.0, "Kloof", "Pembroke", "Fluid left-hand opener, strong through the point region."),
  makeP("k3", "Dylan Wiggett", "KEA", "BAT", 3, "R", "R", "M", 17, 41.0, 127.0, 3, 7.6, "Botha's Hill", "Finningley", "Calm top-order anchor with great tactical awareness."),
  makeP("k4", "Ross Coetzee", "KEA", "ALL", 4, "R", "R", "M", 18, 45.0, 129.0, 18, 6.5, "Botha's Hill", "Gaba", "Captain of Kearsney. Classical batsman and huge six-hitter.", "c"),
  makeP("k5", "Murray Weyer", "KEA", "BAT", 5, "R", "R", "M", 17, 34.5, 120.0, 4, 7.5, "Hillcrest", "Sheffield", "Dependable middle-order batsman in high-pressure situations."),
  makeP("k6", "Cameron Veenstra", "KEA", "WK", 6, "R", "R", "M", 18, 31.0, 115.0, 0, 0.0, "Gillitts", "Pembroke", "Sharp gloveman with quick hands up to the stumps."),
  makeP("k7", "Jack O'Donovan", "KEA", "ALL", 7, "L", "L", "S", 17, 26.4, 118.0, 19, 5.8, "Kloof", "Finningley", "Left-arm orthodox spinner and clean striker of the ball."),
  makeP("k8", "Hayden Bishop", "KEA", "BOWL", 8, "R", "R", "F", 17, 15.0, 85.0, 22, 6.2, "Kloof", "Finningley", "Tall fast-medium bowler extracting steep hillside bounce."),
  makeP("k9", "Lithitha Sityana", "KEA", "BOWL", 9, "R", "R", "F", 18, 8.5, 70.0, 25, 5.9, "Durban", "Gaba", "Frontline strike pacer with deadly inswinging yorkers."),
  makeP("k10", "Matthew Bergset", "KEA", "BOWL", 10, "R", "R", "S", 17, 7.2, 60.0, 18, 5.4, "Hillcrest", "Sheffield", "Clever off-spinner who breaks partnerships."),
  makeP("k11", "Luke Dudley", "KEA", "BOWL", 11, "R", "R", "F", 16, 5.1, 50.0, 16, 6.4, "Botha's Hill", "Pembroke", "Young fast bowler with promising pace and carry."),

  // ── DURBAN HIGH SCHOOL (DHS) ──
  makeP("d1", "Semal Pillay", "DHS", "BAT", 1, "R", "R", "M", 18, 49.5, 133.0, 6, 6.8, "Durban", "Campbell", "Captain of DHS 1st XI. Sublime front-foot driver with wristy grace.", "c"),
  makeP("d2", "Taine Havermann", "DHS", "BAT", 2, "L", "R", "M", 17, 41.2, 125.0, 0, 0.0, "Berea", "Swales", "Solid left-hand opener who sets up the innings.", "vc"),
  makeP("d3", "Ethan Cooper", "DHS", "BAT", 3, "R", "R", "M", 17, 38.6, 124.0, 4, 7.2, "Durban", "Gracey", "Aggressive #3 strokeplayer with rapid scoring rate."),
  makeP("d4", "Josh van Biljon", "DHS", "ALL", 4, "R", "R", "M", 18, 37.0, 130.0, 16, 6.3, "Morningside", "Campbell", "Seam all-rounder who steadies the middle overs."),
  makeP("d5", "Zack Jacobs", "DHS", "BAT", 5, "R", "R", "M", 17, 32.4, 118.0, 2, 7.9, "Durban", "Swales", "Middle-order accumulator and expert rotating strike."),
  makeP("d6", "Kwanele Zuma", "DHS", "WK", 6, "R", "R", "M", 17, 30.0, 114.0, 0, 0.0, "Umlazi", "Gracey", "Agile wicketkeeper with lightning reaction times."),
  makeP("d7", "Bhavesh Naicker", "DHS", "ALL", 7, "R", "R", "S", 18, 25.8, 122.0, 21, 5.6, "Chatsworth", "Campbell", "Leading off-spin all-rounder with vast match experience."),
  makeP("d8", "Bayanda Majola", "DHS", "BOWL", 8, "R", "R", "F", 17, 12.8, 76.0, 29, 5.7, "Umlazi", "Swales", "Express coastal pace tearing through top orders."),
  makeP("d9", "Darren Govender", "DHS", "BOWL", 9, "R", "R", "S", 17, 9.4, 65.0, 22, 5.3, "Durban", "Gracey", "Leg-spin specialist with sharp turn and deceptive flipper."),
  makeP("d10", "Lwandle Ndlovu", "DHS", "BOWL", 10, "L", "L", "F", 18, 6.5, 52.0, 20, 6.1, "Durban", "Swales", "Left-arm swing bowler challenging outside edges."),
  makeP("d11", "Jared Pearson", "DHS", "BOWL", 11, "R", "R", "F", 16, 4.2, 44.0, 15, 6.0, "Westville", "Campbell", "Accurate death bowler nailing yorkers."),

  // ── GLENWOOD HIGH SCHOOL (GLE) ──
  makeP("g1", "Bandile Mbatha", "GLE", "BAT", 1, "L", "R", "M", 18, 44.2, 127.0, 7, 6.9, "Durban", "Gibson", "Captain of Glenwood Green Machine. Gritty left-handed leader.", "c"),
  makeP("g2", "Slade van Staden", "GLE", "BAT", 2, "R", "R", "M", 17, 40.5, 131.0, 0, 0.0, "Glenwood", "Blamey", "Aggressive opener targeting powerplay boundaries.", "vc"),
  makeP("g3", "Ntando Soni", "GLE", "BAT", 3, "R", "R", "M", 17, 37.8, 120.0, 3, 7.4, "Durban", "Early", "Classy top-order player with strong on-side play."),
  makeP("g4", "Khelan Moodley", "GLE", "ALL", 4, "R", "R", "S", 18, 35.0, 125.0, 18, 5.9, "Queensburgh", "Gibson", "Key all-rounder bowling off-spin and batting with poise."),
  makeP("g5", "Kyle Bryan", "GLE", "BAT", 5, "L", "R", "M", 17, 31.6, 116.0, 2, 8.0, "Durban", "McCann", "Middle-order left-hander who pierces packed fields."),
  makeP("g6", "Thabiso Ngcobo", "GLE", "WK", 6, "R", "R", "M", 17, 28.0, 110.0, 0, 0.0, "Durban", "Blamey", "Reliable wicketkeeper with athletic stumpings."),
  makeP("g7", "Jordan Grobbelaar", "GLE", "ALL", 7, "R", "R", "F", 18, 24.5, 128.0, 20, 6.3, "Yellowwood Park", "Early", "Power hitter down the order and fiery seam bowler."),
  makeP("g8", "Sibonelo Radebe", "GLE", "BOWL", 8, "R", "R", "F", 18, 11.2, 74.0, 27, 5.8, "Durban", "Gibson", "Opening strike fast bowler with steep bounce on Dixon's."),
  makeP("g9", "Duran Pillay", "GLE", "BOWL", 9, "R", "R", "S", 17, 8.0, 62.0, 22, 5.2, "Durban", "McCann", "Flighted leg-spinner troubling batsmen with drift."),
  makeP("g10", "Mason Riekert", "GLE", "BOWL", 10, "L", "L", "F", 17, 6.0, 50.0, 19, 6.2, "Queensburgh", "Blamey", "Left-arm paceman creating sharp angles across righties."),
  makeP("g11", "Liam Nel", "GLE", "BOWL", 11, "R", "R", "M", 16, 4.0, 42.0, 14, 5.6, "Glenwood", "Early", "Disciplined line-and-length bowler."),

  // ── CLIFTON SCHOOL (CLF) ──
  makeP("cl1", "Ronan Vardhan", "CLF", "ALL", 1, "R", "R", "S", 18, 41.8, 130.0, 20, 6.3, "Durban North", "Crosby", "Captain of Clifton. Intelligent stroke-maker and leg-spinner.", "c"),
  makeP("cl2", "Shahil Maharaj", "CLF", "BAT", 2, "L", "R", "M", 17, 39.0, 123.0, 0, 0.0, "Durban North", "Trojan", "Free-flowing left-handed opener with crisp cuts.", "vc"),
  makeP("cl3", "Caleb Roux", "CLF", "BAT", 3, "R", "R", "M", 18, 36.4, 119.0, 2, 7.5, "Morningside", "Barbarian", "Solid top-order anchor who builds crucial partnerships."),
  makeP("cl4", "Oliver Mitchell", "CLF", "BAT", 4, "R", "R", "M", 17, 34.0, 122.0, 4, 7.8, "Durban", "Crusader", "Versatile batsman with strong boundary-finding ability."),
  makeP("cl5", "Gabriel Montgomery", "CLF", "ALL", 5, "R", "R", "M", 17, 30.5, 126.0, 16, 6.5, "Berea", "Crosby", "Medium-pace all-rounder who breaks partnerships."),
  makeP("cl6", "Connor White", "CLF", "WK", 6, "R", "R", "M", 17, 27.0, 112.0, 0, 0.0, "Durban North", "Trojan", "Nimble gloveman with pristine wicketkeeping records."),
  makeP("cl7", "Kavir Ramlall", "CLF", "ALL", 7, "L", "L", "S", 18, 23.0, 115.0, 18, 5.5, "Durban", "Barbarian", "Left-arm orthodox spinner providing exceptional control."),
  makeP("cl8", "Joshua Kennedy", "CLF", "BOWL", 8, "R", "R", "F", 18, 10.5, 78.0, 24, 6.0, "Durban North", "Crusader", "Opening pace bowler with deceptive late swing."),
  makeP("cl9", "Timothy Saulez", "CLF", "BOWL", 9, "R", "R", "S", 17, 7.8, 60.0, 19, 5.4, "Berea", "Crosby", "Clever off-spinner with excellent change of pace."),
  makeP("cl10", "Ethan Brijlal", "CLF", "BOWL", 10, "L", "L", "F", 17, 5.5, 48.0, 17, 6.1, "Durban", "Trojan", "Left-arm seamer targeting batsman's pads."),
  makeP("cl11", "Luke Acton", "CLF", "BOWL", 11, "R", "R", "F", 16, 3.8, 40.0, 13, 6.3, "Durban North", "Barbarian", "Young energetic fast bowler with good seam position."),

  // ── NORTHWOOD SCHOOL (NOR) ──
  makeP("no1", "Ross Barnes", "NOR", "WK", 1, "R", "R", "M", 18, 39.4, 126.0, 0, 0.0, "Umhlanga", "Smuts", "Wicketkeeper-batsman. Sharp glovework and dependable opener.", "vc"),
  makeP("no2", "David Wilson", "NOR", "BAT", 2, "L", "R", "M", 17, 37.5, 124.0, 0, 0.0, "Durban North", "Knights", "Fluid left-hand opener, punishing short-pitched bowling."),
  makeP("no3", "Bradley Nel", "NOR", "BAT", 3, "R", "R", "M", 18, 42.0, 129.0, 3, 7.2, "La Lucia", "Founders", "Prolific #3 batsman who commands the crease."),
  makeP("no4", "Ryan Brand", "NOR", "ALL", 4, "R", "R", "M", 18, 46.5, 134.0, 19, 6.4, "Durban North", "Founders", "Captain of Northwood Knights. Explosive batsman and bowler.", "c"),
  makeP("no5", "Jason Botha", "NOR", "BAT", 5, "R", "R", "M", 17, 33.0, 118.0, 2, 8.0, "Durban North", "Smuts", "Sturdy middle-order batsman and superb outfielder."),
  makeP("no6", "Ntlakanipho Zulu", "NOR", "ALL", 6, "R", "R", "S", 17, 29.0, 122.0, 17, 5.8, "KwaMashu", "Knights", "Off-spin all-rounder providing depth and big hits."),
  makeP("no7", "Matthew Savage", "NOR", "ALL", 7, "L", "L", "M", 18, 25.5, 125.0, 16, 6.3, "Umdloti", "Founders", "Left-arm medium pacer with lethal cutter deliveries."),
  makeP("no8", "Callum Henderson", "NOR", "BOWL", 8, "R", "R", "F", 17, 14.2, 82.0, 27, 5.6, "La Lucia", "Knights", "Strike fast bowler for Northwood with menacing outswing."),
  makeP("no9", "Keegan Crawford", "NOR", "BOWL", 9, "R", "R", "S", 18, 8.0, 64.0, 23, 5.3, "Durban North", "Smuts", "Frontline leg-spinner with quick arm action."),
  makeP("no10", "Tiaan Steyn", "NOR", "BOWL", 10, "L", "L", "F", 17, 5.8, 50.0, 18, 6.0, "La Lucia", "Founders", "Left-arm fast bowler who generates steep carry."),
  makeP("no11", "Siphesihle Mkhize", "NOR", "BOWL", 11, "R", "R", "F", 16, 4.0, 42.0, 15, 6.2, "Durban North", "Knights", "Promising young seamer with immaculate discipline."),

  // ── JUNIOR AGE DIVISIONS (U16, U15, U14) & TRANSFORMATION PATHWAY TALENT ──
  // Westville Juniors
  makeP("w_u16_1", "Liam van Schalkwyk", "WES", "BAT", 1, "R", "R", "M", 16, 44.5, 126.0, 4, 6.8, "Westville", "School House", "Prolific U16A top-order stroke-maker and captain.", "c", "U16A"),
  makeP("w_u16_2", "Siyabonga Mkhize", "WES", "ALL", 4, "R", "R", "F", 16, 36.8, 138.0, 21, 5.2, "KwaMashu", "Outeniqua", "Dynamic seam all-rounder from KwaMashu hub, Sunfoil bursary scholar.", undefined, "U16A", "Black African", true),
  makeP("w_u16_3", "Kieran Padayachee", "WES", "BOWL", 8, "R", "R", "S", 16, 12.0, 75.0, 23, 4.9, "Westville", "Wandsbeck", "Sharp leg-spinner with exceptional googly and drift.", undefined, "U16A", "Generic Black", false),
  makeP("w_u15_1", "Bandile Dlamini", "WES", "BAT", 2, "R", "R", "M", 15, 49.2, 134.0, 0, 0.0, "Umlazi", "School House", "U15 provincial run-machine with classical front-foot technique.", undefined, "U15A", "Black African", true),
  makeP("w_u15_2", "Troy Reynolds", "WES", "BOWL", 9, "R", "R", "F", 15, 8.0, 58.0, 20, 5.1, "Kloof", "Inanda", "Tall U15 fast bowler hitting the deck hard with good bounce.", undefined, "U15A"),
  makeP("w_u14_1", "Kwazi Buthelezi", "WES", "ALL", 5, "L", "L", "S", 14, 42.0, 120.0, 17, 4.8, "Clermont", "Outeniqua", "Exciting U14 talent from Clermont development clinic. Left-arm orthodox spinner.", undefined, "U14A", "Black African", true),
  makeP("w_u14_2", "Noah Harris", "WES", "BAT", 1, "R", "R", "M", 14, 38.5, 118.0, 0, 0.0, "Westville", "School House", "Compact opening batsman with strong back-foot defensive play.", "c", "U14A"),

  // Hilton Juniors
  makeP("h_u16_1", "Kagiso Mposula", "HIL", "BOWL", 8, "R", "R", "F", 16, 11.4, 78.0, 26, 5.1, "Pietermaritzburg", "Churchill House", "Fierce outswing fast bowler, Grant Khomo U16 week candidate.", undefined, "U16A", "Black African", true),
  makeP("h_u16_2", "Rupert Fenwick", "HIL", "BAT", 3, "R", "R", "M", 16, 41.2, 120.0, 2, 7.0, "Hilton", "Pearce House", "Dependable top-order accumulator for Hilton U16A.", "c", "U16A"),
  makeP("h_u15_1", "Thando Ntini-Ndlovu", "HIL", "ALL", 6, "R", "R", "M", 15, 38.0, 124.0, 19, 5.0, "Midlands", "Falcon House", "Athletic all-rounder, middle overs control and stroke maker.", undefined, "U15A", "Black African", true),
  makeP("h_u15_2", "Giles Montgomery", "HIL", "WK", 2, "L", "R", "M", 15, 34.5, 116.0, 0, 0.0, "Hilton", "Ellis House", "U15 wicketkeeper with sharp leg-side takes and steady opener.", undefined, "U15A"),
  makeP("h_u14_1", "Nkosana Zulu", "HIL", "BAT", 1, "R", "R", "M", 14, 46.5, 125.0, 3, 6.8, "Edendale", "Churchill House", "Township talent scholar, prolific boundary hitter down the ground.", "c", "U14A", "Black African", true),
  makeP("h_u14_2", "Max Campbell", "HIL", "BOWL", 10, "R", "R", "F", 14, 9.5, 62.0, 18, 4.6, "Nottingham Road", "Pearce House", "Accurate seamer with natural wobble seam on Midlands turf.", undefined, "U14A"),

  // DHS Juniors
  makeP("d_u16_1", "Sipho Sithole", "DHS", "BOWL", 8, "R", "R", "F", 16, 9.8, 68.0, 27, 4.9, "KwaMashu", "Blackmore", "Express pace bowler, clocking 128 km/h at U16 level. Sunfoil scholar.", undefined, "U16A", "Black African", true),
  makeP("d_u16_2", "Darren Chetty", "DHS", "BAT", 2, "L", "R", "M", 16, 43.6, 128.0, 0, 0.0, "Berea", "Campbell", "Wristy left-handed stroke-maker and explosive opener.", "vc", "U16A", "Generic Black", false),
  makeP("d_u15_1", "Ayanda Khumalo", "DHS", "BAT", 3, "R", "R", "M", 15, 52.4, 132.0, 3, 6.5, "Umlazi", "Blackmore", "Top-scoring U15 batsman in KZN schools circuit with four hundreds.", "c", "U15A", "Black African", true),
  makeP("d_u15_2", "Jaden Moodley", "DHS", "ALL", 5, "R", "R", "S", 15, 37.0, 118.0, 18, 5.1, "Chatsworth", "Swales", "Spin bowling all-rounder with composed temperament.", undefined, "U15A", "Generic Black", true),
  makeP("d_u14_1", "Lwazi Mbatha", "DHS", "BOWL", 9, "L", "L", "F", 14, 10.2, 60.0, 22, 4.7, "Chesterville", "Blackmore", "Raw left-arm fast bowler with steep angle and sharp bouncer.", undefined, "U14A", "Black African", true),
  makeP("d_u14_2", "Keagan Naidoo", "DHS", "BAT", 4, "R", "R", "M", 14, 40.8, 115.0, 0, 0.0, "Durban", "Campbell", "Technical middle-order stabilizer and tactician.", undefined, "U14A", "Generic Black", false),

  // Michaelhouse & Maritzburg College Juniors
  makeP("m_u16_1", "Loyiso Nxumalo", "MIC", "BAT", 1, "L", "R", "M", 16, 45.8, 122.0, 0, 0.0, "Underberg", "West", "Classy left-handed stroke-maker on Meadows, bursary scholar.", "c", "U16A", "Black African", true),
  makeP("m_u16_2", "Dylan Botha", "MIC", "BOWL", 8, "R", "R", "F", 16, 8.9, 65.0, 21, 4.8, "Balgowan", "Founders", "Accurate medium-fast bowler with tight channels.", undefined, "U16A"),
  makeP("mc_u16_1", "Sandile Mthembu", "MCB", "ALL", 4, "R", "R", "F", 16, 39.4, 130.0, 20, 5.3, "Sobantu", "Forder", "Aggressive striker and seam bowler for College U16A. Sunfoil scholar.", "vc", "U16A", "Black African", true),
  makeP("mc_u15_1", "Connor McIntosh", "MCB", "BAT", 3, "R", "R", "M", 15, 42.0, 124.0, 2, 7.2, "Pietermaritzburg", "Clark", "Hard-hitting top-order batsman with rapid boundary tally.", undefined, "U15A"),
  makeP("mc_u14_1", "Khaya Biyela", "MCB", "BOWL", 8, "R", "R", "F", 14, 8.5, 55.0, 21, 4.5, "Edendale", "Forder", "Young fast-bowling prodigy from Edendale development hub.", undefined, "U14A", "Black African", true),
];

// ── AUTHENTIC MATCH FIXTURES & LIVE CIRCUIT ───────────
export const MATCHES: Match[] = [
  {
    id: "m1", schoolId: "WES", homeTeam: "Westville 1st XI", awayTeam: "Kearsney College 1st XI",
    venue: "Bowden's Field Oval, Westville", date: "2026-03-08", time: "09:30", status: "live",
    format: "T20", ageGroup: "1st XI", currentScore: "142/3 (14.2 ov)", target: "187",
    battingTeam: "Westville", strikerSummary: "J. Whitfield 67* (44) · E. Solomons 31* (29)",
    liveOvers: "14.2 ov", summary: "Highway Derby: Westville need 45 runs from 34 balls with 7 wickets in hand.",
    transport: { bus: "ND 849-211", driver: "Themba Nxumalo", depart: "07:30", return: "18:00" },
  },
  {
    id: "m2", schoolId: "HIL", homeTeam: "Hilton College 1st XI", awayTeam: "Michaelhouse 1st XI",
    venue: "Weightman-Smith Oval, Hilton", date: "2026-03-08", time: "09:30", status: "live",
    format: "Declaration", ageGroup: "1st XI", currentScore: "214/4 (48.1 ov)", target: "Declaration",
    battingTeam: "Hilton College", strikerSummary: "M. Stewart 104* (132) · L. Campbell 48* (61)",
    liveOvers: "48.1 ov", summary: "The Midlands Derby: Hilton dominate opening sessions with a masterclass hundred by captain Matt Stewart.",
    transport: { bus: "NP 412-990", driver: "Sipho Radebe", depart: "07:00", return: "19:00" },
  },
  {
    id: "m3", schoolId: "MCB", homeTeam: "Maritzburg College 1st XI", awayTeam: "Glenwood 1st XI",
    venue: "Goldstones Oval, PMB", date: "2026-03-08", time: "09:30", status: "live",
    format: "50-Over", ageGroup: "1st XI", currentScore: "189/6 (36.4 ov)", target: "245",
    battingTeam: "Maritzburg College", strikerSummary: "C. Mason 81 (89) · L. Jacobs 34* (40)",
    liveOvers: "36.4 ov", summary: "College chase 245 in red-and-black territory, need 57 runs from 80 balls.",
    transport: { bus: "NP 778-001", driver: "David Mvelase", depart: "08:00", return: "18:00" },
  },
  {
    id: "m4", schoolId: "DHS", homeTeam: "Durban High School 1st XI", awayTeam: "Clifton 1st XI",
    venue: "The Memorial Ground, Durban", date: "2026-03-08", time: "09:30", status: "live",
    format: "T20", ageGroup: "1st XI", currentScore: "98/2 (11.0 ov)", target: "162",
    battingTeam: "DHS", strikerSummary: "S. Pillay 58* (38) · K. Moodley 22 (20)",
    liveOvers: "11.0 ov", summary: "Berea Derby: DHS require 64 runs off 54 balls at home under sea breeze.",
  },
  {
    id: "m5", schoolId: "MIC", homeTeam: "Michaelhouse 1st XI", awayTeam: "St Charles College",
    venue: "Roy Gathorne Oval, Balgowan", date: "2026-02-28", time: "09:30", status: "complete",
    format: "50-Over", ageGroup: "1st XI", result: "Michaelhouse won by 5 wickets",
    summary: "St Charles 198 all out (44.2 ov) · Michaelhouse 201/5 (41.1 ov). H. Higgs 4/31 & 62*.",
  },
  {
    id: "m6", schoolId: "WES", homeTeam: "Westville 1st XI", awayTeam: "Michaelhouse 1st XI",
    venue: "Meadow's Oval, Balgowan", date: "2026-02-21", time: "09:00", status: "complete",
    format: "50-Over", ageGroup: "1st XI", result: "Westville won by 4 wickets",
    summary: "Michaelhouse 168/8 (20 ov) · Westville 172/6 (19.1 ov). L. De Villiers 4/22.",
  },
  {
    id: "m7", schoolId: "HIL", homeTeam: "Hilton College U16A", awayTeam: "Maritzburg College U16A",
    venue: "Hart-Davis Oval, Hilton", date: "2026-03-14", time: "09:00", status: "upcoming",
    format: "50-Over", ageGroup: "U16A", summary: "Junior classic clash between premier Midlands rugby and cricket boarding schools.",
  },
  {
    id: "m8", schoolId: "WES", homeTeam: "Durban High School", awayTeam: "Westville 1st XI",
    venue: "The Memorial Ground, Durban", date: "2026-03-14", time: "09:00", status: "upcoming",
    format: "50-Over", ageGroup: "1st XI", summary: "KZN Traditional Coastal Derby clash on the coast.",
    transport: { bus: "ND 849-211", driver: "Themba Nxumalo", depart: "06:30", return: "18:30" },
  },
  {
    id: "m9", schoolId: "KEA", homeTeam: "Kearsney College 1st XI", awayTeam: "Hilton College 1st XI",
    venue: "AH Smith Oval, Botha's Hill", date: "2026-03-21", time: "09:30", status: "upcoming",
    format: "Declaration", ageGroup: "1st XI", summary: "Valley of 1000 Hills classic fixture.",
  },
];

// ── DERBY RECORDS MATRIX ──────────────────────────────
export const DERBY_RECORDS: Record<string, DerbyRecord> = {
  "HIL_MIC": {
    pairKey: "HIL_MIC",
    schoolA: "Hilton College",
    schoolB: "Michaelhouse",
    derbyTitle: "The Midlands Classical Derby",
    sinceYear: 1898,
    totalClashes: 206,
    winsA: 108,
    winsB: 84,
    draws: 14,
    trophyName: "The Oppenheimer Memorial Shield",
    recentEncounters: [
      { year: 2025, venue: "Roy Gathorne Oval", winner: "Hilton", margin: "38 runs", starPerformer: "M. Stewart 84 (71)" },
      { year: 2024, venue: "Weightman-Smith Oval", winner: "Michaelhouse", margin: "3 wickets", starPerformer: "H. Higgs 5/38" },
      { year: 2023, venue: "Roy Gathorne Oval", winner: "Hilton", margin: "7 wickets", starPerformer: "C. Dyer 4/21" },
    ],
  },
  "WES_KEA": {
    pairKey: "WES_KEA",
    schoolA: "Westville Boys' High",
    schoolB: "Kearsney College",
    derbyTitle: "The Highway Derby",
    sinceYear: 1958,
    totalClashes: 114,
    winsA: 64,
    winsB: 45,
    draws: 5,
    trophyName: "The M13 Highway Trophy",
    recentEncounters: [
      { year: 2025, venue: "AH Smith Oval", winner: "Westville", margin: "14 runs", starPerformer: "J. Whitfield 91 (82)" },
      { year: 2024, venue: "Bowden's Field", winner: "Kearsney", margin: "4 wickets", starPerformer: "R. Coetzee 76*" },
      { year: 2023, venue: "AH Smith Oval", winner: "Westville", margin: "6 wickets", starPerformer: "L. De Villiers 4/19" },
    ],
  },
  "MCB_GLE": {
    pairKey: "MCB_GLE",
    schoolA: "Maritzburg College",
    schoolB: "Glenwood High",
    derbyTitle: "The Red-Black-White Traditional",
    sinceYear: 1922,
    totalClashes: 168,
    winsA: 98,
    winsB: 61,
    draws: 9,
    trophyName: "The Traditional Schools Cup",
    recentEncounters: [
      { year: 2025, venue: "Goldstones", winner: "College", margin: "62 runs", starPerformer: "C. Mason 112 (104)" },
      { year: 2024, venue: "Dixons Oval", winner: "Glenwood", margin: "2 wickets", starPerformer: "B. Mbatha 88" },
    ],
  },
  "DHS_CLF": {
    pairKey: "DHS_CLF",
    schoolA: "Durban High School",
    schoolB: "Clifton School",
    derbyTitle: "The Berea Derby",
    sinceYear: 1974,
    totalClashes: 72,
    winsA: 44,
    winsB: 24,
    draws: 4,
    trophyName: "The Berea Shield",
    recentEncounters: [
      { year: 2025, venue: "The Memorial Ground", winner: "DHS", margin: "45 runs", starPerformer: "S. Pillay 78" },
      { year: 2024, venue: "Riverside", winner: "Clifton", margin: "5 wickets", starPerformer: "R. Vardhan 4/29" },
    ],
  },
  "NOR_CLF": {
    pairKey: "NOR_CLF",
    schoolA: "Northwood School",
    schoolB: "Clifton School",
    derbyTitle: "The Durban North Coastal Derby",
    sinceYear: 1968,
    totalClashes: 86,
    winsA: 49,
    winsB: 32,
    draws: 5,
    trophyName: "The Coastal Knights Cup",
    recentEncounters: [
      { year: 2025, venue: "Founders Field Oval", winner: "Northwood", margin: "28 runs", starPerformer: "R. Brand 81 (64) & 3/24" },
      { year: 2024, venue: "Riverside Sports Complex", winner: "Clifton", margin: "4 wickets", starPerformer: "R. Vardhan 64*" },
      { year: 2023, venue: "Founders Field Oval", winner: "Northwood", margin: "6 wickets", starPerformer: "C. Henderson 4/18" },
    ],
  },
};

// ── PITCH CONDITIONS PER SCHOOL VENUE ─────────────────
export const SCHOOL_PITCH_CONDITIONS: Record<string, PitchCondition> = {
  WES: {
    groundId: "g_wes_1", schoolId: "WES", name: "Bowden's Field Oval", surface: "Kikuyu grass over red dolerite clay",
    moisturePct: 24, grassHeightMm: 4.2, rollerCompaction: "Heavy 2.5T cylinder (3 passes)",
    bounceRating: 8.5, paceRating: 8.0, outfieldSpeed: "Fast", coversStatus: "off",
    drainageTimeMin: 25, curatorNotes: "Good hard deck with consistent true bounce. Offers turn for wrist spin from over 12.",
    lastMaintained: "2026-03-08 07:15",
  },
  HIL: {
    groundId: "g_hil_1", schoolId: "HIL", name: "Weightman-Smith Oval", surface: "Couch blend over shale bedrock",
    moisturePct: 28, grassHeightMm: 5.0, rollerCompaction: "Tandem roller 3.0T",
    bounceRating: 9.2, paceRating: 9.0, outfieldSpeed: "Fast", coversStatus: "off",
    drainageTimeMin: 18, curatorNotes: "High altitude Midlands pitch. Excellent carry through to the keeper. Early seam movement in session 1.",
    lastMaintained: "2026-03-08 06:45",
  },
  MIC: {
    groundId: "g_mic_1", schoolId: "MIC", name: "Roy Gathorne Oval", surface: "Fine Kikuyu over loamy alluvial soil",
    moisturePct: 31, grassHeightMm: 5.8, rollerCompaction: "Standard 2T roller",
    bounceRating: 7.8, paceRating: 7.5, outfieldSpeed: "Medium", coversStatus: "off",
    drainageTimeMin: 30, curatorNotes: "Balgowan morning mist kept morning moisture high. Ball swinging both ways under cloud cover.",
    lastMaintained: "2026-03-08 06:30",
  },
  MCB: {
    groundId: "g_mcb_1", schoolId: "MCB", name: "Goldstones Oval", surface: "Bermuda grass over black turf clay",
    moisturePct: 21, grassHeightMm: 3.8, rollerCompaction: "Heavy 3.2T multi-wheel roller",
    bounceRating: 8.8, paceRating: 8.4, outfieldSpeed: "Fast", coversStatus: "off",
    drainageTimeMin: 20, curatorNotes: "Dry, rock-hard batting paradise. Expect 250+ scores. Reverse swing likely after 25 overs.",
    lastMaintained: "2026-03-08 07:00",
  },
  KEA: {
    groundId: "g_kea_1", schoolId: "KEA", name: "AH Smith Oval", surface: "Kikuyu on sandstone foundation",
    moisturePct: 25, grassHeightMm: 4.5, rollerCompaction: "2.2T vibratory roller",
    bounceRating: 8.2, paceRating: 8.1, outfieldSpeed: "Fast", coversStatus: "off",
    drainageTimeMin: 22, curatorNotes: "Hilltop breeze assists outswing toward the scoreboard. Consistent bounce with small short boundaries.",
    lastMaintained: "2026-03-08 07:20",
  },
  DHS: {
    groundId: "g_dhs_1", schoolId: "DHS", name: "The Memorial Ground", surface: "Coastal Buffalo/Kikuyu mix",
    moisturePct: 26, grassHeightMm: 4.0, rollerCompaction: "2.5T roller",
    bounceRating: 8.0, paceRating: 8.3, outfieldSpeed: "Fast", coversStatus: "off",
    drainageTimeMin: 25, curatorNotes: "Sea-level humidity enables late reverse swing with older ball. True bounce off the center block.",
    lastMaintained: "2026-03-08 07:10",
  },
  GLE: {
    groundId: "g_gle_1", schoolId: "GLE", name: "Dixons Oval", surface: "Coastal Couch grass",
    moisturePct: 27, grassHeightMm: 4.8, rollerCompaction: "2.0T roller",
    bounceRating: 7.9, paceRating: 8.0, outfieldSpeed: "Medium", coversStatus: "off",
    drainageTimeMin: 28, curatorNotes: "Dixon's subway end produces sharp skid. Pitch holding together well under sunny skies.",
    lastMaintained: "2026-03-08 07:00",
  },
  CLF: {
    groundId: "g_clf_1", schoolId: "CLF", name: "Riverside Sports Complex", surface: "Kikuyu blend",
    moisturePct: 23, grassHeightMm: 4.0, rollerCompaction: "2.2T roller",
    bounceRating: 7.6, paceRating: 7.4, outfieldSpeed: "Fast", coversStatus: "off",
    drainageTimeMin: 24, curatorNotes: "Flat modern batting wicket, lightning outfield, high value for straight lofted shots.",
    lastMaintained: "2026-03-08 07:30",
  },
  NOR: {
    groundId: "g_nor_1", schoolId: "NOR", name: "Founders Field Oval", surface: "Kikuyu with coastal sand topdress",
    moisturePct: 22, grassHeightMm: 3.9, rollerCompaction: "2.8T heavy roller (4 passes)",
    bounceRating: 8.6, paceRating: 8.5, outfieldSpeed: "Fast", coversStatus: "off",
    drainageTimeMin: 19, curatorNotes: "Hard, bouncy coastal track. Sea breeze blows across the pitch from the north-east, favoring express seamers.",
    lastMaintained: "2026-03-08 07:15",
  },
};

export function getSchoolFieldConditions(schoolId: string): PitchCondition[] {
  const school = SCHOOLS_REGISTRY.find(s => s.id === schoolId || s.shortName === schoolId) || SCHOOLS_REGISTRY[0];
  const fieldsList = school.fields && school.fields.length > 0
    ? school.fields
    : [school.mainOval || "Main Oval"];

  const customDetails: Record<string, Partial<PitchCondition>> = {
    // Westville
    "Bowden's Field Oval": {
      groundId: "g_wes_1",
      surface: "Bulli Clay & Kikuyu Grass Outfield",
      moisturePct: 24, grassHeightMm: 4.2, rollerCompaction: "Heavy 2.5T cylinder (3 passes)",
      bounceRating: 8.5, paceRating: 8.0, outfieldSpeed: "Fast", coversStatus: "off",
      drainageTimeMin: 25, curatorNotes: "1st XI Main Oval. Good hard deck with consistent true bounce. Offers turn for wrist spin from over 12.",
    },
    "Commons Field": {
      groundId: "g_wes_2",
      surface: "Turf Bulli Strip with natural camber",
      moisturePct: 21, grassHeightMm: 5.0, rollerCompaction: "1.8T tandem roller (2 passes)",
      bounceRating: 7.6, paceRating: 7.4, outfieldSpeed: "Medium-Fast", coversStatus: "off",
      drainageTimeMin: 35, curatorNotes: "2nd XI / U15A Field. Slight natural slope toward south boundary. Firm surface providing even bounce.",
    },
    "Roy Couzens Oval": {
      groundId: "g_wes_3",
      surface: "Turf Strip with Kikuyu Outfield",
      moisturePct: 22, grassHeightMm: 5.5, rollerCompaction: "1.5T roller (2 passes)",
      bounceRating: 7.2, paceRating: 7.0, outfieldSpeed: "Medium", coversStatus: "off",
      drainageTimeMin: 40, curatorNotes: "Junior Oval (U14A). Boundary markers set at 55m. Good grass cover protecting young seamers.",
    },
    "Lutge Field": {
      groundId: "g_wes_4",
      surface: "Synthetic Turf Wicket on Hard Base",
      moisturePct: 18, grassHeightMm: 6.0, rollerCompaction: "Light roller",
      bounceRating: 8.0, paceRating: 8.2, outfieldSpeed: "Fast", coversStatus: "off",
      drainageTimeMin: 20, curatorNotes: "Open practice field / U14B. Synthetic match strip in top condition. Rapid outfield pace.",
    },
    // Hilton
    "Weightman-Smith Oval": {
      groundId: "g_hil_1",
      surface: "Couch blend over shale bedrock",
      moisturePct: 28, grassHeightMm: 5.0, rollerCompaction: "Tandem roller 3.0T",
      bounceRating: 9.2, paceRating: 9.0, outfieldSpeed: "Fast", coversStatus: "off",
      drainageTimeMin: 18, curatorNotes: "High altitude Midlands pitch. Excellent carry through to keeper. Early seam movement.",
    },
    "Hart-Davis Oval": {
      groundId: "g_hil_2",
      surface: "Midlands Couch over clay",
      moisturePct: 26, grassHeightMm: 5.2, rollerCompaction: "2.2T roller",
      bounceRating: 8.4, paceRating: 8.2, outfieldSpeed: "Fast", coversStatus: "off",
      drainageTimeMin: 22, curatorNotes: "2nd XI Field. Firm strip with good bounce. Slightly dry at bowler footmarks.",
    },
    "Mansfield Field": {
      groundId: "g_hil_3",
      surface: "Turf strip over loamy soil",
      moisturePct: 27, grassHeightMm: 5.5, rollerCompaction: "2.0T roller",
      bounceRating: 7.8, paceRating: 7.6, outfieldSpeed: "Medium", coversStatus: "off",
      drainageTimeMin: 25, curatorNotes: "U15A Field. Good even grass cover. True bounce for spinners and seamers.",
    },
    "Ellis Field": {
      groundId: "g_hil_4",
      surface: "Turf strip with Kikuyu outfield",
      moisturePct: 25, grassHeightMm: 5.8, rollerCompaction: "1.8T roller",
      bounceRating: 7.5, paceRating: 7.2, outfieldSpeed: "Medium", coversStatus: "off",
      drainageTimeMin: 30, curatorNotes: "U14A Field. Well irrigated with consistent bounce suitable for junior development.",
    },
    // Michaelhouse
    "Roy Gathorne Oval": {
      groundId: "g_mic_1",
      surface: "Fine Kikuyu over loamy alluvial soil",
      moisturePct: 31, grassHeightMm: 5.8, rollerCompaction: "Standard 2T roller",
      bounceRating: 7.8, paceRating: 7.5, outfieldSpeed: "Medium", coversStatus: "off",
      drainageTimeMin: 30, curatorNotes: "Balgowan morning mist kept morning moisture high. Ball swinging under cloud cover.",
    },
    "Hannah's Field": {
      groundId: "g_mic_2",
      surface: "Kikuyu turf on loamy soil",
      moisturePct: 29, grassHeightMm: 5.5, rollerCompaction: "1.8T roller",
      bounceRating: 7.4, paceRating: 7.2, outfieldSpeed: "Medium", coversStatus: "off",
      drainageTimeMin: 35, curatorNotes: "2nd XI Field. Morning dew clearing nicely. Slow pitch offering spin.",
    },
    "Meadow's Oval": {
      groundId: "g_mic_3",
      surface: "Turf strip",
      moisturePct: 30, grassHeightMm: 5.6, rollerCompaction: "1.8T roller",
      bounceRating: 7.2, paceRating: 7.0, outfieldSpeed: "Medium", coversStatus: "off",
      drainageTimeMin: 32, curatorNotes: "U15A Field. Soft surface early, expected to dry into a smooth deck by noon.",
    },
    "Tarpey Field": {
      groundId: "g_mic_4",
      surface: "Turf strip with Kikuyu outfield",
      moisturePct: 28, grassHeightMm: 6.0, rollerCompaction: "1.5T roller",
      bounceRating: 7.0, paceRating: 6.8, outfieldSpeed: "Medium", coversStatus: "off",
      drainageTimeMin: 40, curatorNotes: "U14A Field. Lush outfield with consistent low bounce.",
    },
  };

  return fieldsList.map((fieldName, idx) => {
    const detail = customDetails[fieldName];
    if (detail) {
      return {
        groundId: detail.groundId || `g_${school.id.toLowerCase()}_${idx + 1}`,
        schoolId: school.id,
        name: fieldName,
        surface: detail.surface || "Kikuyu grass over clay base",
        moisturePct: detail.moisturePct ?? (24 - idx * 2),
        grassHeightMm: detail.grassHeightMm ?? (4.2 + idx * 0.4),
        rollerCompaction: detail.rollerCompaction || "2.0T roller",
        bounceRating: detail.bounceRating ?? (8.2 - idx * 0.3),
        paceRating: detail.paceRating ?? (8.0 - idx * 0.3),
        outfieldSpeed: detail.outfieldSpeed || (idx === 0 ? "Fast" : "Medium"),
        coversStatus: detail.coversStatus || "off",
        drainageTimeMin: detail.drainageTimeMin ?? (25 + idx * 5),
        curatorNotes: detail.curatorNotes || `${fieldName} in solid match condition. Prepared for ${school.shortName} home fixtures.`,
        lastMaintained: "2026-03-08 07:15",
      };
    }

    const isMain = idx === 0;
    return {
      groundId: `g_${school.id.toLowerCase()}_${idx + 1}`,
      schoolId: school.id,
      name: fieldName,
      surface: isMain ? "Kikuyu grass over black clay base" : "Turf strip with Kikuyu outfield",
      moisturePct: Math.max(16, 25 - idx * 2),
      grassHeightMm: Number((4.0 + idx * 0.4).toFixed(1)),
      rollerCompaction: isMain ? "Heavy 2.5T roller (3 passes)" : "2.0T roller (2 passes)",
      bounceRating: Number(Math.max(6.5, 8.5 - idx * 0.4).toFixed(1)),
      paceRating: Number(Math.max(6.5, 8.2 - idx * 0.4).toFixed(1)),
      outfieldSpeed: isMain ? "Fast" : "Medium-Fast",
      coversStatus: "off",
      drainageTimeMin: 22 + idx * 4,
      curatorNotes: isMain
        ? `Primary 1st XI Wicket at ${school.name}. Rock-hard base with consistent true bounce and fast outfield.`
        : `${fieldName} at ${school.shortName}. Well-maintained for junior and division league fixtures.`,
      lastMaintained: "2026-03-08 07:15",
    };
  });
}

export const COMPETITIONS: Competition[] = [
  {
    id: "c1", name: "KZN Coastal & Midlands Super League 2026", format: "T20 & 50-Over", season: "2026",
    table: [
      { team: "Westville Boys' High 1st XI", schoolId: "WES", P: 6, W: 5, L: 1, pts: 10, nrr: 1.42 },
      { team: "Hilton College 1st XI", schoolId: "HIL", P: 6, W: 5, L: 1, pts: 10, nrr: 1.38 },
      { team: "Maritzburg College 1st XI", schoolId: "MCB", P: 6, W: 4, L: 2, pts: 8, nrr: 0.95 },
      { team: "Michaelhouse 1st XI", schoolId: "MIC", P: 6, W: 4, L: 2, pts: 8, nrr: 0.62 },
      { team: "Durban High School 1st XI", schoolId: "DHS", P: 6, W: 3, L: 3, pts: 6, nrr: 0.25 },
      { team: "Kearsney College 1st XI", schoolId: "KEA", P: 6, W: 2, L: 4, pts: 4, nrr: -0.42 },
      { team: "Glenwood High 1st XI", schoolId: "GLE", P: 6, W: 1, L: 5, pts: 2, nrr: -1.15 },
      { team: "Clifton School 1st XI", schoolId: "CLF", P: 6, W: 1, L: 5, pts: 2, nrr: -1.35 },
    ],
  },
];

export const WEATHER: Record<string, { tempC: number; condition: string; icon: string }> = {
  m1: { tempC: 27, condition: "Sunny & Humid", icon: "☀️" },
  m2: { tempC: 22, condition: "Crisp Midlands Sun", icon: "🌤️" },
  m3: { tempC: 29, condition: "Hot & Clear", icon: "☀️" },
  m4: { tempC: 26, condition: "Sea Breeze / Sunny", icon: "🌊" },
  m5: { tempC: 20, condition: "Mild / Overcast", icon: "⛅" },
  m6: { tempC: 22, condition: "Clear Skies", icon: "🌤️" },
  m7: { tempC: 23, condition: "Partly Cloudy", icon: "⛅" },
  m8: { tempC: 28, condition: "Sunny", icon: "☀️" },
  m9: { tempC: 25, condition: "Pleasant Hilltop", icon: "🌤️" },
};

export const INJURIES = [
  { id: "inj1", player: "p5", schoolId: "WES", type: "Hamstring Strain", phase: "Stage 2 Rehab", dateInj: "2026-02-22", rtw: "2026-03-15", restricted: true },
  { id: "inj2", player: "p14", schoolId: "HIL", type: "Ankle Sprain", phase: "Stage 3 Skill Rehab", dateInj: "2026-02-28", rtw: "2026-03-18", restricted: true },
  { id: "inj3", player: "p24", schoolId: "MIC", type: "Finger Dislocation", phase: "Stage 4 Return to Play", dateInj: "2026-03-01", rtw: "2026-03-12", restricted: false },
  { id: "inj4", player: "p33", schoolId: "MCB", type: "Groin Tightness", phase: "Stage 1 Acute Rest", dateInj: "2026-03-05", rtw: "2026-03-20", restricted: true },
];

export const SKILLS_MATRIX: Record<string, any> = {
  p1: {
    batting: { driving: 94, cutting: 88, pulling: 82, defense: 95, running: 90 },
    bowling: { accuracy: 72, seam: 70, pace: 68 },
    fielding: { catching: 92, throwing: 86, agility: 88 },
  },
  p11: {
    batting: { driving: 96, cutting: 92, pulling: 95, defense: 91, running: 88 },
    bowling: { accuracy: 74, seam: 75, pace: 70 },
    fielding: { catching: 94, throwing: 90, agility: 92 },
  },
  p21: {
    batting: { driving: 90, cutting: 85, pulling: 92, defense: 88, running: 86 },
    bowling: { accuracy: 89, seam: 91, pace: 90, bouncer: 94 },
    fielding: { catching: 91, throwing: 93, agility: 89 },
  },
  p31: {
    batting: { driving: 93, cutting: 91, pulling: 94, defense: 89, running: 92 },
    bowling: { accuracy: 70, seam: 68, pace: 65 },
    fielding: { catching: 89, throwing: 88, agility: 90 },
  },
};

export const USERS_INITIAL = [
  { id: "u1", name: "Craig Hendricks", email: "chendricks@wbhs.co.za", role: "coach", schoolId: "WES", status: "active" },
  { id: "u2", name: "Dale Benkenstein", email: "db@hiltoncollege.com", role: "coach", schoolId: "HIL", status: "active" },
  { id: "u3", name: "Murray McDonald", email: "mmcdonald@michaelhouse.org", role: "coach", schoolId: "MIC", status: "active" },
  { id: "u4", name: "Kyle Nipper", email: "k.nipper@mcollege.co.za", role: "coach", schoolId: "MCB", status: "active" },
  { id: "u5", name: "Graeme Sharples", email: "gsharples@wbhs.co.za", role: "schooladmin", schoolId: "WES", status: "active" },
  { id: "u6", name: "Brian Wessels", email: "bwessels@wbhs.co.za", role: "scorer", schoolId: "WES", status: "active" },
  { id: "u7", name: "Dr Siphamandla Khumalo", email: "skhumalo@med.wbhs.co.za", role: "medical", schoolId: "WES", status: "active" },
  { id: "u8", name: "Themba Nxumalo", email: "tnxumalo@fleet.wbhs.co.za", role: "driver", schoolId: "WES", status: "active" },
  { id: "u9", name: "Ernest Mzimba", email: "emzimba@grounds.wbhs.co.za", role: "grounds", schoolId: "WES", status: "active" },
];

export const SHOT_DATA_SAMPLE: ShotBall[] = [
  { id: "s1", runs: 4, angle: 120, distance: 92, stroke: "Cover Drive", bowler: "T. Smith", over: 1.2, outcome: "boundary" },
  { id: "s2", runs: 1, angle: 45, distance: 58, stroke: "Square Cut", bowler: "T. Smith", over: 1.4, outcome: "single" },
  { id: "s3", runs: 6, angle: 215, distance: 104, stroke: "Pull Shot", bowler: "M. Ndlovu", over: 2.3, outcome: "six" },
  { id: "s4", runs: 2, angle: 330, distance: 68, stroke: "Flick to Leg", bowler: "M. Ndlovu", over: 2.5, outcome: "double" },
  { id: "s5", runs: 4, angle: 165, distance: 95, stroke: "Straight Drive", bowler: "K. Pillay", over: 3.1, outcome: "boundary" },
  { id: "s6", runs: 0, angle: 90, distance: 22, stroke: "Forward Defensive", bowler: "K. Pillay", over: 3.2, outcome: "dot" },
  { id: "s7", runs: 1, angle: 260, distance: 65, stroke: "Mid-Wicket On Drive", bowler: "K. Pillay", over: 3.4, outcome: "single" },
  { id: "s8", runs: 4, angle: 30, distance: 90, stroke: "Late Cut", bowler: "T. Smith", over: 4.2, outcome: "boundary" },
  { id: "s9", runs: 6, angle: 180, distance: 108, stroke: "Lofted Drive Long-Off", bowler: "T. Smith", over: 4.6, outcome: "six" },
  { id: "s10", runs: 0, angle: 100, distance: 15, stroke: "Inside Edge / Defense", bowler: "M. Ndlovu", over: 5.1, outcome: "dot" },
  { id: "s11", runs: 4, angle: 240, distance: 93, stroke: "Square Leg Sweep", bowler: "K. Pillay", over: 6.2, outcome: "boundary" },
  { id: "s12", runs: 2, angle: 310, distance: 70, stroke: "Glance Fine Leg", bowler: "K. Pillay", over: 6.5, outcome: "double" },
];

export const pctDays = (dateA: string, dateB: string): number => {
  const tA = new Date(dateA).getTime();
  const tB = new Date(dateB).getTime();
  const now = new Date().getTime();
  if (now >= tB) return 100;
  if (now <= tA) return 10;
  const pct = Math.round(((now - tA) / (tB - tA)) * 100);
  return Math.min(100, Math.max(10, pct));
};

// ── COMMERCIAL & SPONSORSHIP CAMPAIGNS ────────────────
export const SPONSORSHIP_CAMPAIGNS: any[] = [
  {
    id: "camp1",
    sponsorName: "Bidvest McCarthy Durban",
    logoText: "McCarthy Toyota & Ford",
    logoBg: "#b91c1c",
    brandCategory: "Automotive",
    scopeType: "region",
    scopeId: "Coastal",
    inventoryType: "LIVE_MATCH_SCORE_BUG",
    status: "active",
    startDate: "2026-01-15",
    endDate: "2026-04-30",
    contractValueZar: 145000,
    revenueShareSchoolPct: 80,
    revenueSharePlatformPct: 20,
    impressions: 48200,
    viewableImpressions: 44100,
    clickThroughs: 1840,
    exclusivityProtected: true,
    ctaText: "Exclusive School Staff & Parent Vehicle Offers",
  },
  {
    id: "camp2",
    sponsorName: "Standard Bank Schools",
    logoText: "Standard Bank",
    logoBg: "#0033a0",
    brandCategory: "Banking",
    scopeType: "competition",
    scopeId: "c1",
    inventoryType: "PUBLIC_HOME_HERO",
    status: "active",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    contractValueZar: 280000,
    revenueShareSchoolPct: 75,
    revenueSharePlatformPct: 25,
    impressions: 112400,
    viewableImpressions: 104500,
    clickThroughs: 3910,
    exclusivityProtected: true,
    ctaText: "NextGen Youth Accounts & Sports Bursaries",
  },
  {
    id: "camp3",
    sponsorName: "Kookaburra South Africa",
    logoText: "Kookaburra SA",
    logoBg: "#15803d",
    brandCategory: "Sportswear",
    scopeType: "platform",
    scopeId: "all",
    inventoryType: "WAGON_WHEEL_SAFE_ZONE",
    status: "active",
    startDate: "2026-02-01",
    endDate: "2026-06-30",
    contractValueZar: 95000,
    revenueShareSchoolPct: 80,
    revenueSharePlatformPct: 20,
    impressions: 63800,
    viewableImpressions: 59200,
    clickThroughs: 2150,
    exclusivityProtected: true,
    ctaText: "Official Match Ball of KZN School Cricket",
  },
  {
    id: "camp4",
    sponsorName: "FutureLife High Performance",
    logoText: "FutureLife",
    logoBg: "#0284c7",
    brandCategory: "Nutrition",
    scopeType: "school",
    scopeId: "WES",
    inventoryType: "SIX_TRACKER_MOMENT",
    status: "active",
    startDate: "2026-01-10",
    endDate: "2026-05-15",
    contractValueZar: 65000,
    revenueShareSchoolPct: 85,
    revenueSharePlatformPct: 15,
    impressions: 31200,
    viewableImpressions: 29800,
    clickThroughs: 1420,
    exclusivityProtected: true,
    ctaText: "Fuel Your Match Day — Nutrition Guide",
  },
  {
    id: "camp5",
    sponsorName: "FNB Private Wealth",
    logoText: "FNB",
    logoBg: "#0d9488",
    brandCategory: "Banking",
    scopeType: "school",
    scopeId: "HIL",
    inventoryType: "SCORECARD_FOOTER",
    status: "active",
    startDate: "2026-02-01",
    endDate: "2026-07-31",
    contractValueZar: 85000,
    revenueShareSchoolPct: 85,
    revenueSharePlatformPct: 15,
    impressions: 24100,
    viewableImpressions: 22800,
    clickThroughs: 980,
    exclusivityProtected: false,
    ctaText: "Hilton College Foundation Benefactor Partner",
  },
];

// ── VERIFIED SCOUT NETWORK PROFILES ───────────────────
export const VERIFIED_SCOUTS: any[] = [
  {
    id: "scout_1",
    name: "Lance Klusener",
    organisation: "Hollywoodbets Dolphins Academy",
    role: "High Performance Scout",
    verificationStatus: "verified",
    verifiedDate: "2025-11-14",
    shortlistCount: 14,
    savedQueriesCount: 6,
    scoutingScope: "KZN Coastal & Inland U16/U18",
  },
  {
    id: "scout_2",
    name: "Yusuf Abdulla",
    organisation: "KZN Inland Cricket Union",
    role: "Regional Selector",
    verificationStatus: "verified",
    verifiedDate: "2025-10-02",
    shortlistCount: 22,
    savedQueriesCount: 9,
    scoutingScope: "Pietermaritzburg & Midlands Districts",
  },
  {
    id: "scout_3",
    name: "Vincent Barnes",
    organisation: "Cricket South Africa (CSA)",
    role: "National Talent Scout",
    verificationStatus: "verified",
    verifiedDate: "2025-09-18",
    shortlistCount: 38,
    savedQueriesCount: 15,
    scoutingScope: "National U19 & Coke Week Pathways",
  },
  {
    id: "scout_4",
    name: "Neil Levenson",
    organisation: "TUKS Cricket Academy / Pretoria",
    role: "University Recruiter",
    verificationStatus: "verified",
    verifiedDate: "2026-01-10",
    shortlistCount: 11,
    savedQueriesCount: 4,
    scoutingScope: "Tertiary Bursaries & High-Performance Contracts",
  },
];

// ── POPIA DATA CHOKE POINT ────────────────────────────
export function getData(resource: string, role: string, activeSchoolId: string) {
  const policy = POPIA_POLICIES[role] || POPIA_POLICIES.spectator;

  if (resource === "players" || resource === "squad" || resource === "profiles") {
    let list = PLAYERS;
    if (policy.scope === "school" && role !== "superadmin" && role !== "platformsupport") {
      list = list.filter((p) => p.school === activeSchoolId);
    }
    // Field-level redaction
    return list.map((p) => {
      const copy = { ...p };
      if (role === "financeadmin" || role === "spectator" || role === "scout") {
        delete copy.born;
        delete copy.houseAtSchool;
        delete copy.height;
        delete copy.weight;
      }
      return copy;
    });
  }

  if (resource === "injuries") {
    if (role === "spectator" || role === "financeadmin" || role === "scout") {
      return []; // Strict zero clinical injury disclosure
    }
    let list = INJURIES;
    if (policy.scope === "school" && role !== "superadmin") {
      list = list.filter((i) => i.schoolId === activeSchoolId);
    }
    if (role === "coach" || role === "headcoach" || role === "assistant") {
      // Coaches see fitness/phase but not private clinical diagnosis
      return list.map((i) => ({
        id: i.id,
        player: i.player,
        schoolId: i.schoolId,
        phase: i.phase,
        restricted: i.restricted,
        rtw: i.rtw,
      }));
    }
    return list;
  }

  if (resource === "sponsorship") {
    return SPONSORSHIP_CAMPAIGNS;
  }

  if (resource === "scouting") {
    return VERIFIED_SCOUTS;
  }

  if (resource === "pitch") {
    return SCHOOL_PITCH_CONDITIONS[activeSchoolId] || SCHOOL_PITCH_CONDITIONS.WES;
  }

  return [];
}

