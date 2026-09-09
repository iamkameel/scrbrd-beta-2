import { SchoolSquad, CoachingStaffMember, PlayerMovementRecord, Player, SquadDivision } from "./types";

// ── 23 CANONICAL SQUAD DEFINITIONS ACROSS 4 DIVISIONS ────────────────
export interface SquadTemplate {
  name: string;
  shortCode: string;
  division: SquadDivision;
  tier: number;
  matchFormat: "50-Over / Declaration" | "50-Over" | "40-Over" | "35-Over" | "30-Over" | "20-Over";
  groundSlot: string;
  practiceSlot: string;
  quotaTarget: { blackAfricanMin: number; genericBlackMin: number };
}

export const SQUAD_TEMPLATES: SquadTemplate[] = [
  // ── OPEN DIVISION (1st XI to 7th XI) ──
  {
    name: "1st XI", shortCode: "1st", division: "Open", tier: 1,
    matchFormat: "50-Over / Declaration", groundSlot: "Main Oval / 1st XI Ground",
    practiceSlot: "Mon, Wed, Fri 15:00 - 17:30 (Nets A1-A4 & Main Pitch)",
    quotaTarget: { blackAfricanMin: 3, genericBlackMin: 4 },
  },
  {
    name: "2nd XI", shortCode: "2nd", division: "Open", tier: 2,
    matchFormat: "50-Over", groundSlot: "Commons Field / 2nd Oval",
    practiceSlot: "Mon, Wed, Fri 15:00 - 17:30 (Nets A5-A8)",
    quotaTarget: { blackAfricanMin: 3, genericBlackMin: 4 },
  },
  {
    name: "3rd XI", shortCode: "3rd", division: "Open", tier: 3,
    matchFormat: "40-Over", groundSlot: "Roy Couzens Oval",
    practiceSlot: "Tue, Thu 15:00 - 17:00 (Nets B1-B4)",
    quotaTarget: { blackAfricanMin: 2, genericBlackMin: 4 },
  },
  {
    name: "4th XI", shortCode: "4th", division: "Open", tier: 4,
    matchFormat: "35-Over", groundSlot: "Lutge Field A",
    practiceSlot: "Tue, Thu 15:00 - 17:00 (Nets B5-B8)",
    quotaTarget: { blackAfricanMin: 2, genericBlackMin: 4 },
  },
  {
    name: "5th XI", shortCode: "5th", division: "Open", tier: 5,
    matchFormat: "30-Over", groundSlot: "Lutge Field B",
    practiceSlot: "Mon, Wed 15:30 - 17:00 (Grass Nets C1-C3)",
    quotaTarget: { blackAfricanMin: 2, genericBlackMin: 3 },
  },
  {
    name: "6th XI", shortCode: "6th", division: "Open", tier: 6,
    matchFormat: "20-Over", groundSlot: "Memorial Lower Field",
    practiceSlot: "Mon, Wed 15:30 - 17:00 (Grass Nets C4-C6)",
    quotaTarget: { blackAfricanMin: 2, genericBlackMin: 3 },
  },
  {
    name: "7th XI", shortCode: "7th", division: "Open", tier: 7,
    matchFormat: "20-Over", groundSlot: "Founders Outer Meadow",
    practiceSlot: "Tue, Thu 15:30 - 17:00 (Grass Nets C7-C8)",
    quotaTarget: { blackAfricanMin: 1, genericBlackMin: 3 },
  },

  // ── U16 DIVISION (U16A to U16D) ──
  {
    name: "U16A", shortCode: "16A", division: "U16", tier: 1,
    matchFormat: "50-Over", groundSlot: "Roy Couzens Oval",
    practiceSlot: "Mon, Wed, Fri 15:00 - 17:15 (Nets A1-A3)",
    quotaTarget: { blackAfricanMin: 3, genericBlackMin: 4 },
  },
  {
    name: "U16B", shortCode: "16B", division: "U16", tier: 2,
    matchFormat: "40-Over", groundSlot: "Commons Lower Oval",
    practiceSlot: "Mon, Wed 15:00 - 17:00 (Nets A4-A6)",
    quotaTarget: { blackAfricanMin: 2, genericBlackMin: 4 },
  },
  {
    name: "U16C", shortCode: "16C", division: "U16", tier: 3,
    matchFormat: "35-Over", groundSlot: "Lutge Field C",
    practiceSlot: "Tue, Thu 15:00 - 17:00 (Nets B1-B3)",
    quotaTarget: { blackAfricanMin: 2, genericBlackMin: 3 },
  },
  {
    name: "U16D", shortCode: "16D", division: "U16", tier: 4,
    matchFormat: "30-Over", groundSlot: "Meadow Field 1",
    practiceSlot: "Tue, Thu 15:00 - 16:45 (Nets B4-B6)",
    quotaTarget: { blackAfricanMin: 2, genericBlackMin: 3 },
  },

  // ── U15 DIVISION (U15A to U15E) ──
  {
    name: "U15A", shortCode: "15A", division: "U15", tier: 1,
    matchFormat: "50-Over", groundSlot: "Lutge Field Oval",
    practiceSlot: "Mon, Wed, Fri 15:00 - 17:15 (Nets D1-D3)",
    quotaTarget: { blackAfricanMin: 3, genericBlackMin: 4 },
  },
  {
    name: "U15B", shortCode: "15B", division: "U15", tier: 2,
    matchFormat: "40-Over", groundSlot: "Lutge South Oval",
    practiceSlot: "Mon, Wed 15:00 - 17:00 (Nets D4-D6)",
    quotaTarget: { blackAfricanMin: 2, genericBlackMin: 4 },
  },
  {
    name: "U15C", shortCode: "15C", division: "U15", tier: 3,
    matchFormat: "35-Over", groundSlot: "Westville Primary Fields",
    practiceSlot: "Tue, Thu 15:00 - 17:00 (Nets E1-E3)",
    quotaTarget: { blackAfricanMin: 2, genericBlackMin: 3 },
  },
  {
    name: "U15D", shortCode: "15D", division: "U15", tier: 4,
    matchFormat: "30-Over", groundSlot: "Westville Primary Top",
    practiceSlot: "Tue, Thu 15:00 - 16:45 (Nets E4-E6)",
    quotaTarget: { blackAfricanMin: 2, genericBlackMin: 3 },
  },
  {
    name: "U15E", shortCode: "15E", division: "U15", tier: 5,
    matchFormat: "20-Over", groundSlot: "Civic Centre Field",
    practiceSlot: "Wed, Fri 15:00 - 16:30 (Grass Net E7)",
    quotaTarget: { blackAfricanMin: 2, genericBlackMin: 3 },
  },

  // ── U14 DIVISION (U14A to U14G) - GRADE 8 INTAKE ──
  {
    name: "U14A", shortCode: "14A", division: "U14", tier: 1,
    matchFormat: "50-Over", groundSlot: "Bowden's Field Oval (Morning) / Roy Couzens",
    practiceSlot: "Mon, Wed, Fri 14:45 - 17:00 (Junior Nets J1-J3)",
    quotaTarget: { blackAfricanMin: 3, genericBlackMin: 4 },
  },
  {
    name: "U14B", shortCode: "14B", division: "U14", tier: 2,
    matchFormat: "40-Over", groundSlot: "Commons Field (Morning)",
    practiceSlot: "Mon, Wed 14:45 - 16:45 (Junior Nets J4-J6)",
    quotaTarget: { blackAfricanMin: 2, genericBlackMin: 4 },
  },
  {
    name: "U14C", shortCode: "14C", division: "U14", tier: 3,
    matchFormat: "35-Over", groundSlot: "Lutge Field Junior A",
    practiceSlot: "Tue, Thu 14:45 - 16:45 (Junior Nets J7-J9)",
    quotaTarget: { blackAfricanMin: 2, genericBlackMin: 3 },
  },
  {
    name: "U14D", shortCode: "14D", division: "U14", tier: 4,
    matchFormat: "30-Over", groundSlot: "Lutge Field Junior B",
    practiceSlot: "Tue, Thu 14:45 - 16:30 (Junior Nets J10-J12)",
    quotaTarget: { blackAfricanMin: 2, genericBlackMin: 3 },
  },
  {
    name: "U14E", shortCode: "14E", division: "U14", tier: 5,
    matchFormat: "25-Over", groundSlot: "Civic Oval South",
    practiceSlot: "Mon, Wed 14:45 - 16:15 (Junior Nets J13-J14)",
    quotaTarget: { blackAfricanMin: 2, genericBlackMin: 3 },
  },
  {
    name: "U14F", shortCode: "14F", division: "U14", tier: 6,
    matchFormat: "20-Over", groundSlot: "Wandsbeck Green",
    practiceSlot: "Tue, Thu 14:45 - 16:15 (Grass Junior F1)",
    quotaTarget: { blackAfricanMin: 1, genericBlackMin: 3 },
  },
  {
    name: "U14G", shortCode: "14G", division: "U14", tier: 7,
    matchFormat: "20-Over", groundSlot: "Wandsbeck Lower Field",
    practiceSlot: "Wed, Fri 14:45 - 16:00 (Grass Junior G1)",
    quotaTarget: { blackAfricanMin: 1, genericBlackMin: 2 },
  },
];

// ── COACHING STAFF DIRECTORY (BY SCHOOL) ─────────────────────────────
export const COACHING_STAFF_REGISTRY: Record<string, CoachingStaffMember[]> = {
  WES: [
    {
      id: "c_wes_doc", schoolId: "WES", name: "Wayne Scott", email: "wscott@wbhs.co.za", phone: "+27 82 445 9182",
      assignedSquads: ["WES_1ST", "WES_2ND", "WES_U16A", "WES_U15A", "WES_U14A"],
      primaryRole: "Director of Cricket", csaAccreditation: "CSA Level 3 (High Performance)", yearsExperience: 18,
      bio: "Director of Cricket at Westville Boys' High. Former Dolphins player with extensive high-performance youth development pedigree.",
      activeManagedSquadId: "WES_1ST", isHeadOfCricket: true,
    },
    {
      id: "c_wes_1st", schoolId: "WES", name: "Wayne Scott", email: "wscott@wbhs.co.za", phone: "+27 82 445 9182",
      assignedSquads: ["WES_1ST"], primaryRole: "1st XI Head Coach", csaAccreditation: "CSA Level 3 (High Performance)", yearsExperience: 18,
      bio: "Head Coach of the 1st XI. Leads senior tactical preparation, derby gameplans, and national tournament campaigns.",
      activeManagedSquadId: "WES_1ST",
    },
    {
      id: "c_wes_2nd", schoolId: "WES", name: "Mark Steenkamp", email: "msteenkamp@wbhs.co.za", phone: "+27 83 221 4490",
      assignedSquads: ["WES_2ND"], primaryRole: "Squad Head Coach", csaAccreditation: "CSA Level 2 (Advanced)", yearsExperience: 11,
      bio: "2nd XI Head Coach. Prepares senior reserves for immediate promotion to 1st XI white-ball and declaration fixtures.",
      activeManagedSquadId: "WES_2ND",
    },
    {
      id: "c_wes_3rd", schoolId: "WES", name: "Craig Hendricks", email: "chendricks@wbhs.co.za", phone: "+27 84 901 8832",
      assignedSquads: ["WES_3RD", "WES_4TH"], primaryRole: "Squad Head Coach", csaAccreditation: "CSA Level 2 (Advanced)", yearsExperience: 9,
      bio: "3rd & 4th XI Head Coach and Senior Educator. Specializes in building team culture and middle-order game awareness.",
      activeManagedSquadId: "WES_3RD",
    },
    {
      id: "c_wes_5th", schoolId: "WES", name: "Johan Venter", email: "jventer@wbhs.co.za", phone: "+27 72 312 9081",
      assignedSquads: ["WES_5TH", "WES_6TH", "WES_7TH"], primaryRole: "Squad Head Coach", csaAccreditation: "Educator Coach", yearsExperience: 14,
      bio: "Manages Open participation squads (5th to 7th XI). Promotes sportsmanship, competitive matchplay, and fitness.",
      activeManagedSquadId: "WES_5TH",
    },
    {
      id: "c_wes_u16a", schoolId: "WES", name: "Ryan Cook", email: "rcook@wbhs.co.za", phone: "+27 82 890 1234",
      assignedSquads: ["WES_U16A"], primaryRole: "Squad Head Coach", csaAccreditation: "CSA Level 3 (High Performance)", yearsExperience: 12,
      bio: "U16A Head Coach. Prepares boys for the Grant Khomo U16 Week and the transition into senior Open cricket.",
      activeManagedSquadId: "WES_U16A",
    },
    {
      id: "c_wes_u16b", schoolId: "WES", name: "Garth Robinson", email: "grobinson@wbhs.co.za", phone: "+27 83 456 7890",
      assignedSquads: ["WES_U16B", "WES_U16C", "WES_U16D"], primaryRole: "Squad Head Coach", csaAccreditation: "CSA Level 2 (Advanced)", yearsExperience: 8,
      bio: "U16 Junior Academy Coach. Oversees U16B to U16D development pathways and technical batting foundations.",
      activeManagedSquadId: "WES_U16B",
    },
    {
      id: "c_wes_u15a", schoolId: "WES", name: "Justin Kemp", email: "jkemp@wbhs.co.za", phone: "+27 82 678 9012",
      assignedSquads: ["WES_U15A"], primaryRole: "Squad Head Coach", csaAccreditation: "CSA Level 3 (High Performance)", yearsExperience: 15,
      bio: "U15A Head Coach. Former Proteas international all-rounder focusing on power hitting, seam bowling, and mental resilience.",
      activeManagedSquadId: "WES_U15A",
    },
    {
      id: "c_wes_u15b", schoolId: "WES", name: "Bongani Cele", email: "bcele@wbhs.co.za", phone: "+27 76 543 2109",
      assignedSquads: ["WES_U15B", "WES_U15C"], primaryRole: "Squad Head Coach", csaAccreditation: "CSA Level 2 (Advanced)", yearsExperience: 7,
      bio: "U15B/C Head Coach and KZN Township Development Liaison. Focuses on spin bowling and fielding mechanics.",
      activeManagedSquadId: "WES_U15B",
    },
    {
      id: "c_wes_u15d", schoolId: "WES", name: "David Mthembu", email: "dmthembu@wbhs.co.za", phone: "+27 73 890 4567",
      assignedSquads: ["WES_U15D", "WES_U15E"], primaryRole: "Squad Head Coach", csaAccreditation: "CSA Level 1 (Foundation)", yearsExperience: 5,
      bio: "U15D & U15E Squad Coach. Dedicated to participation, match fitness, and bowling run-up fundamentals.",
      activeManagedSquadId: "WES_U15D",
    },
    {
      id: "c_wes_u14a", schoolId: "WES", name: "Morne van Wyk", email: "mvanwyk@wbhs.co.za", phone: "+27 82 123 4567",
      assignedSquads: ["WES_U14A"], primaryRole: "Squad Head Coach", csaAccreditation: "CSA Level 3 (High Performance)", yearsExperience: 16,
      bio: "U14A Head Coach. Former Proteas wicketkeeper-batsman leading the intake year's premier squad.",
      activeManagedSquadId: "WES_U14A",
    },
    {
      id: "c_wes_u14b", schoolId: "WES", name: "Sipho Khuzwayo", email: "skhuzwayo@wbhs.co.za", phone: "+27 84 321 6549",
      assignedSquads: ["WES_U14B", "WES_U14C"], primaryRole: "Squad Head Coach", csaAccreditation: "CSA Level 2 (Advanced)", yearsExperience: 6,
      bio: "U14B & U14C Coach. Integrates Grade 8 boys into high school cricket structures and team discipline.",
      activeManagedSquadId: "WES_U14B",
    },
    {
      id: "c_wes_u14d", schoolId: "WES", name: "Andrew Nel", email: "anel@wbhs.co.za", phone: "+27 79 456 1230",
      assignedSquads: ["WES_U14D", "WES_U14E", "WES_U14F", "WES_U14G"], primaryRole: "Squad Head Coach", csaAccreditation: "Educator Coach", yearsExperience: 10,
      bio: "Junior Intake Coordinator managing U14D through U14G matches and weekly fixture rotations.",
      activeManagedSquadId: "WES_U14D",
    },
    {
      id: "c_wes_bowling", schoolId: "WES", name: "Kyle Abbott", email: "kabbott@wbhs.co.za", phone: "+27 82 789 0123",
      assignedSquads: ["WES_1ST", "WES_2ND", "WES_U16A", "WES_U15A"], primaryRole: "Specialist Bowling Coach", csaAccreditation: "CSA Level 3 (High Performance)", yearsExperience: 14,
      bio: "Specialist Fast Bowling Consultant. Works with express seamers across 1st XI to U15A on biomechanics and seam presentation.",
      activeManagedSquadId: "WES_1ST",
    },
    {
      id: "c_wes_sc", schoolId: "WES", name: "Francois Marais", email: "fmarais@wbhs.co.za", phone: "+27 83 901 2345",
      assignedSquads: ["WES_1ST", "WES_2ND", "WES_U16A", "WES_U15A", "WES_U14A"], primaryRole: "Strength & Conditioning", csaAccreditation: "CSA Level 2 (Advanced)", yearsExperience: 11,
      bio: "High Performance S&C Coach managing bowling workload tolerance, Yo-Yo test protocols, and speed mechanics.",
      activeManagedSquadId: "WES_1ST",
    },
  ],
};

// ── GET SQUADS FOR SCHOOL (GENERATOR FOR 23 SQUADS) ─────────────────
export function getSchoolSquads(schoolId: string): SchoolSquad[] {
  const staff = COACHING_STAFF_REGISTRY[schoolId] || COACHING_STAFF_REGISTRY.WES;

  return SQUAD_TEMPLATES.map((tmpl, idx) => {
    const squadId = `${schoolId}_${tmpl.name.replace(/\s+/g, "").toUpperCase()}`;
    // Find matching coach
    const assignedCoach = staff.find(c => c.assignedSquads.includes(squadId)) || staff[1] || staff[0];

    const wins = Math.max(1, 8 - tmpl.tier);
    const losses = Math.min(6, tmpl.tier);
    const played = wins + losses;

    return {
      id: squadId,
      schoolId,
      name: tmpl.name,
      shortCode: tmpl.shortCode,
      division: tmpl.division,
      tier: tmpl.tier,
      headCoachId: assignedCoach.id,
      headCoachName: assignedCoach.name,
      headCoachTitle: assignedCoach.primaryRole === "Director of Cricket" ? "Director of Cricket" : `${tmpl.name} Head Coach`,
      assistantCoachName: tmpl.tier === 1 ? "Kyle Abbott" : undefined,
      managerName: tmpl.tier <= 2 ? "Graeme Sharples" : "School Sports Dept",
      assignedGround: tmpl.groundSlot,
      practiceSlot: tmpl.practiceSlot,
      squadCapCount: tmpl.tier === 1 ? 15 : 14,
      matchFormat: tmpl.matchFormat,
      seasonRecord: { played, won: wins, lost: losses, drawn: 0, tied: 0 },
      targetQuota: tmpl.quotaTarget,
    };
  });
}

// ── INITIAL PLAYER MOVEMENT & PROMOTION HISTORY ───────────────────────
export const INITIAL_PLAYER_MOVEMENTS: PlayerMovementRecord[] = [
  {
    id: "mov_1", playerId: "w_2nd_1", playerName: "Liam van der Merwe", schoolId: "WES",
    fromSquad: "2nd XI", toSquad: "1st XI", type: "promotion",
    reason: "Outstanding form with bat (84* vs Kearsney 2nd XI) and excellent strike rotation.",
    timestamp: "2026-03-05 16:30", authorizedBy: "Wayne Scott (DoC)", status: "approved",
  },
  {
    id: "mov_2", playerId: "w_u16_2", playerName: "Siyabonga Mkhize", schoolId: "WES",
    fromSquad: "U16A", toSquad: "2nd XI", type: "tactical_callup",
    reason: "Senior experience call-up following 5-wicket haul (5/22 vs Hilton U16A).",
    timestamp: "2026-03-03 11:15", authorizedBy: "Ryan Cook (U16A Coach)", status: "approved",
  },
  {
    id: "mov_3", playerId: "w5", playerName: "Kyle Jansen", schoolId: "WES",
    fromSquad: "1st XI", toSquad: "2nd XI", type: "form_reset",
    reason: "Confidence build in 2nd XI middle order to regain front-foot timing.",
    timestamp: "2026-02-27 18:00", authorizedBy: "Wayne Scott (1st XI Coach)", status: "approved",
  },
  {
    id: "mov_4", playerId: "w_u15_1", playerName: "Bandile Dlamini", schoolId: "WES",
    fromSquad: "U15A", toSquad: "U16A", type: "promotion",
    reason: "Fast-tracked into U16A following consecutive centuries in U15 national fixtures.",
    timestamp: "2026-02-20 14:20", authorizedBy: "Justin Kemp (U15A Coach)", status: "approved",
  },
  {
    id: "mov_5", playerId: "w_u14_1", playerName: "Kwazi Buthelezi", schoolId: "WES",
    fromSquad: "U14A", toSquad: "U15B", type: "tactical_callup",
    reason: "Spin bowling cover for mid-week declaration match.",
    timestamp: "2026-02-14 09:45", authorizedBy: "Morne van Wyk (U14A Coach)", status: "approved",
  },
];

// ── SURNAMES POOL FOR DYNAMIC ROSTER SEEDING ──────────────────────────
const FIRST_NAMES = [
  "Liam", "Matthew", "Siyabonga", "Ethan", "Bandile", "Joshua", "Kagiso", "Luka",
  "Thando", "Tristan", "Marcus", "Kwanele", "Noah", "Caleb", "Bhavesh", "Oliver",
  "Chadwick", "Nkosinathi", "Aiden", "Duran", "Shahil", "Bradley", "Siphesihle", "Tiaan"
];

const LAST_NAMES = [
  "Pretorius", "Mkhize", "Solomons", "Dlamini", "Campbell", "Ngcobo", "van Zyl",
  "Ndlovu", "Petersen", "Zuma", "Snyman", "Pillay", "Naicker", "Coetzee", "Khumalo",
  "Breetzke", "Govender", "Mbatha", "Vardhan", "Maharaj", "Nel", "Botha", "Steyn", "Zulu"
];

// ── GENERATE FULL 23-SQUAD PLAYER ROSTERS FOR A GIVEN SCHOOL ─────────
export function generateFullSchoolRoster(schoolId: string, basePlayers: Player[]): Player[] {
  const existingForSchool = basePlayers.filter(p => p.school === schoolId);
  const existingIds = new Set(existingForSchool.map(p => p.id));
  const fullRoster: Player[] = [...existingForSchool];

  const squads = getSchoolSquads(schoolId);

  squads.forEach((squad) => {
    // Check how many players exist for this squad
    const inSquad = fullRoster.filter(p => p.team === squad.name || p.squadId === squad.id);
    const needed = squad.squadCapCount - inSquad.length;

    if (needed > 0) {
      for (let i = 1; i <= needed; i++) {
        const idx = inSquad.length + i;
        const firstName = FIRST_NAMES[(idx * 3 + squad.tier * 2) % FIRST_NAMES.length];
        const lastName = LAST_NAMES[(idx * 5 + squad.tier * 7) % LAST_NAMES.length];
        const fullName = `${firstName} ${lastName}`;
        const playerId = `${schoolId.toLowerCase()}_${squad.shortCode.toLowerCase()}_${idx}`;

        if (!existingIds.has(playerId)) {
          existingIds.add(playerId);

          const role: "BAT" | "BOWL" | "ALL" | "WK" =
            idx === 1 || idx === 2 || idx === 3 || idx === 5 ? "BAT" :
            idx === 4 || idx === 7 ? "ALL" :
            idx === 6 ? "WK" : "BOWL";

          const age = squad.division === "U14" ? 14 :
                      squad.division === "U15" ? 15 :
                      squad.division === "U16" ? 16 :
                      squad.tier === 1 || squad.tier === 2 ? 17 + (idx % 2) : 16 + (idx % 3);

          const baseAvg = squad.tier === 1 ? 40 : squad.tier === 2 ? 34 : squad.tier === 3 ? 29 : 24;
          const avg = Math.round((baseAvg - (idx % 5) * 2.5 + Math.random() * 4) * 10) / 10;
          const sr = Math.round(105 + Math.random() * 30);
          const wkts = role === "BOWL" ? 12 + Math.floor(Math.random() * 12) : role === "ALL" ? 8 + Math.floor(Math.random() * 8) : 0;
          const econ = role !== "BAT" && role !== "WK" ? Math.round((5.2 + Math.random() * 2) * 10) / 10 : 0;

          const isBlackAfrican = lastName.includes("Mkhize") || lastName.includes("Dlamini") || lastName.includes("Ngcobo") || lastName.includes("Ndlovu") || lastName.includes("Zuma") || lastName.includes("Khumalo") || lastName.includes("Mbatha") || lastName.includes("Zulu");
          const isGenericBlack = lastName.includes("Solomons") || lastName.includes("Petersen") || lastName.includes("Pillay") || lastName.includes("Naicker") || lastName.includes("Govender") || lastName.includes("Maharaj") || lastName.includes("Vardhan");
          const saDemographic = isBlackAfrican ? "Black African" : isGenericBlack ? "Generic Black" : "Open";

          fullRoster.push({
            id: playerId,
            name: fullName,
            team: squad.name,
            squadId: squad.id,
            squadName: squad.name,
            school: schoolId,
            role,
            batHand: idx % 3 === 0 ? "L" : "R",
            bowlArm: idx % 4 === 0 ? "L" : "R",
            bowlStyle: idx % 3 === 1 ? "F" : idx % 3 === 2 ? "S" : "M",
            age,
            fitness: "fit",
            avg,
            sr,
            wkts,
            econ,
            cap: idx === 1 ? "c" : idx === 2 ? "vc" : undefined,
            form: [4, 5, 4, 5, 6, 4, 5],
            born: `200${10 - (age - 14)}-04-15`,
            hometown: "Durban Metro",
            houseAtSchool: "Wandsbeck House",
            height: "178cm",
            weight: "72kg",
            battingPos: idx,
            bio: `${squad.name} ${role === "BAT" ? "top-order batsman" : role === "BOWL" ? "frontline bowler" : role === "ALL" ? "all-rounder" : "wicketkeeper"} with high work ethic and consistency.`,
            careerTotals: {
              innings: 18 + Math.floor(avg),
              runs: Math.round(avg * 20),
              hs: Math.min(124, Math.round(avg * 2.1)),
              fifties: Math.floor(avg / 8),
              hundreds: avg > 45 ? 1 : 0,
              balls: wkts * 24,
              wktsTotal: wkts * 2,
              maidens: Math.floor(wkts * 0.5),
            },
            ageDivision: squad.division === "Open" ? (age >= 18 ? "1st XI" : "U17") : squad.division,
            saDemographic,
            quotaEligible: saDemographic !== "Open",
            bursaryScholar: isBlackAfrican && idx % 2 === 0,
            bursaryTrust: isBlackAfrican ? "Sunfoil Development Trust" : undefined,
            provincialPathway: squad.tier === 1 ? "Provincial School Talent Pool" : undefined,
          });
        }
      }
    }
  });

  return fullRoster;
}
