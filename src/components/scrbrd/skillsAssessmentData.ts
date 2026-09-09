import {
  SkillRubricItem,
  SkillAssessmentRecord,
  StructuralAgeGroup,
  CompetitionDivision,
  TeamClassRecord,
  LongitudinalPoint,
  POPIASubjectAccessExport
} from "./types";

// ── 1. CANONICAL STRUCTURAL AGE GROUPS ─────────────────
// Strict rule: High-school U17+ is OPEN. No default high-school U19!
export const CANONICAL_AGE_GROUPS: StructuralAgeGroup[] = [
  {
    ageGroupId: "AG_U9",
    name: "U9 (Junior Primary)",
    code: "U9",
    scopeLevel: "primary",
    minimumAge: 7,
    maximumAge: 9,
    isOpenCategory: false,
    defaultCutoffRule: "Under 9 on 1 January of competition year",
    active: true,
  },
  {
    ageGroupId: "AG_U11",
    name: "U11 (Primary School)",
    code: "U11",
    scopeLevel: "primary",
    minimumAge: 9,
    maximumAge: 11,
    isOpenCategory: false,
    defaultCutoffRule: "Under 11 on 1 January of competition year",
    active: true,
  },
  {
    ageGroupId: "AG_U13",
    name: "U13 (Senior Primary)",
    code: "U13",
    scopeLevel: "primary",
    minimumAge: 11,
    maximumAge: 13,
    isOpenCategory: false,
    defaultCutoffRule: "Under 13 on 1 January of competition year",
    active: true,
  },
  {
    ageGroupId: "AG_U14",
    name: "U14 (Grade 8 Intake)",
    code: "U14",
    scopeLevel: "high_school",
    minimumAge: 13,
    maximumAge: 14,
    isOpenCategory: false,
    defaultCutoffRule: "Under 14 on 1 January of competition year",
    active: true,
  },
  {
    ageGroupId: "AG_U15",
    name: "U15 (Junior High)",
    code: "U15",
    scopeLevel: "high_school",
    minimumAge: 14,
    maximumAge: 15,
    isOpenCategory: false,
    defaultCutoffRule: "Under 15 on 1 January of competition year",
    active: true,
  },
  {
    ageGroupId: "AG_U16",
    name: "U16 (Intermediate High)",
    code: "U16",
    scopeLevel: "high_school",
    minimumAge: 15,
    maximumAge: 16,
    isOpenCategory: false,
    defaultCutoffRule: "Under 16 on 1 January of competition year",
    active: true,
  },
  {
    ageGroupId: "AG_OPEN",
    name: "Open (Senior High & 1st XI - 7th XI)",
    code: "Open",
    scopeLevel: "high_school",
    minimumAge: 14, // Capable juniors may play up into Open
    isOpenCategory: true,
    defaultCutoffRule: "Unrestricted senior school age category (U17, U18, U19+ enrolled pupils)",
    active: true,
  },
  {
    ageGroupId: "AG_U19_PROV",
    name: "U19 Provincial Representative",
    code: "U19_PROV",
    scopeLevel: "provincial",
    minimumAge: 16,
    maximumAge: 19,
    isOpenCategory: false,
    defaultCutoffRule: "Under 19 on 1 September of tournament season (CSA Provincial Pathway)",
    active: true,
  },
  {
    ageGroupId: "AG_U19_NAT",
    name: "U19 National Youth Pathway",
    code: "U19_NAT",
    scopeLevel: "national",
    minimumAge: 16,
    maximumAge: 19,
    isOpenCategory: false,
    defaultCutoffRule: "ICC U19 World Cup eligibility regulations",
    active: true,
  },
];

// ── 2. CANONICAL COMPETITION DIVISIONS & TIERS ────────
export const CANONICAL_DIVISIONS: CompetitionDivision[] = [
  {
    divisionId: "DIV_PREMIER",
    competitionId: "COMP_KZN_COASTAL_LEAGUE",
    seasonId: "2026",
    name: "Schools Premier Division",
    code: "PREM",
    groupingType: "DIVISION",
    tier: 1,
    standingsEnabled: true,
    promotionRules: "Automatic qualification to CSA Top Schools T20 / 50-Over National Final",
    relegationRules: "Bottom placed side enters relegation playoff against A Division winner",
  },
  {
    divisionId: "DIV_A_DIV",
    competitionId: "COMP_KZN_COASTAL_LEAGUE",
    seasonId: "2026",
    name: "A Division (Championship Tier)",
    code: "A_DIV",
    groupingType: "DIVISION",
    tier: 2,
    standingsEnabled: true,
    promotionRules: "Winner promoted to Premier Division",
  },
  {
    divisionId: "DIV_B_DIV",
    competitionId: "COMP_KZN_COASTAL_LEAGUE",
    seasonId: "2026",
    name: "B Division (Senior Reserve Tier)",
    code: "B_DIV",
    groupingType: "DIVISION",
    tier: 3,
    standingsEnabled: true,
  },
  {
    divisionId: "DIV_REGIONAL_POOL",
    competitionId: "COMP_HIGHWAY_FESTIVAL",
    seasonId: "2026",
    name: "Highway Regional Pool North",
    code: "POOL_N",
    groupingType: "POOL",
    tier: 1,
    standingsEnabled: true,
  },
  {
    divisionId: "DIV_FESTIVAL_GROUP",
    competitionId: "COMP_MICHAELMAS_FESTIVAL",
    seasonId: "2026",
    name: "Michaelmas Festival Grouping",
    code: "FEST_GRP",
    groupingType: "FESTIVAL_GROUP",
    standingsEnabled: false, // Grassroots / Festival pools do not force ladder standings!
  },
  {
    divisionId: "DIV_DEV_BAND",
    competitionId: "COMP_DEVELOPMENT_SERIES",
    seasonId: "2026",
    name: "CSA Grassroots Development Band",
    code: "DEV_BAND",
    groupingType: "DEVELOPMENT_BAND",
    standingsEnabled: false,
  },
];

// ── 3. CANONICAL TEAM CLASSES (ORGANISATIONAL RANK) ───
export const CANONICAL_TEAM_CLASSES: TeamClassRecord[] = [
  { teamClassId: "TC_1ST", organisationId: "WES", ageGroupId: "AG_OPEN", displayName: "1st XI", classCode: "1st", classRank: 1, classType: "XI_RANK" },
  { teamClassId: "TC_2ND", organisationId: "WES", ageGroupId: "AG_OPEN", displayName: "2nd XI", classCode: "2nd", classRank: 2, classType: "XI_RANK" },
  { teamClassId: "TC_3RD", organisationId: "WES", ageGroupId: "AG_OPEN", displayName: "3rd XI", classCode: "3rd", classRank: 3, classType: "XI_RANK" },
  { teamClassId: "TC_4TH", organisationId: "WES", ageGroupId: "AG_OPEN", displayName: "4th XI", classCode: "4th", classRank: 4, classType: "XI_RANK" },
  { teamClassId: "TC_5TH", organisationId: "WES", ageGroupId: "AG_OPEN", displayName: "5th XI", classCode: "5th", classRank: 5, classType: "XI_RANK" },
  { teamClassId: "TC_6TH", organisationId: "WES", ageGroupId: "AG_OPEN", displayName: "6th XI", classCode: "6th", classRank: 6, classType: "XI_RANK" },
  { teamClassId: "TC_7TH", organisationId: "WES", ageGroupId: "AG_OPEN", displayName: "7th XI", classCode: "7th", classRank: 7, classType: "XI_RANK" },

  { teamClassId: "TC_16A", organisationId: "WES", ageGroupId: "AG_U16", displayName: "U16A", classCode: "16A", classRank: 1, classType: "LETTER_RANK" },
  { teamClassId: "TC_16B", organisationId: "WES", ageGroupId: "AG_U16", displayName: "U16B", classCode: "16B", classRank: 2, classType: "LETTER_RANK" },
  { teamClassId: "TC_16C", organisationId: "WES", ageGroupId: "AG_U16", displayName: "U16C", classCode: "16C", classRank: 3, classType: "LETTER_RANK" },
  { teamClassId: "TC_16D", organisationId: "WES", ageGroupId: "AG_U16", displayName: "U16D", classCode: "16D", classRank: 4, classType: "LETTER_RANK" },

  { teamClassId: "TC_15A", organisationId: "WES", ageGroupId: "AG_U15", displayName: "U15A", classCode: "15A", classRank: 1, classType: "LETTER_RANK" },
  { teamClassId: "TC_15B", organisationId: "WES", ageGroupId: "AG_U15", displayName: "U15B", classCode: "15B", classRank: 2, classType: "LETTER_RANK" },
  { teamClassId: "TC_15C", organisationId: "WES", ageGroupId: "AG_U15", displayName: "U15C", classCode: "15C", classRank: 3, classType: "LETTER_RANK" },
  { teamClassId: "TC_15D", organisationId: "WES", ageGroupId: "AG_U15", displayName: "U15D", classCode: "15D", classRank: 4, classType: "LETTER_RANK" },
  { teamClassId: "TC_15E", organisationId: "WES", ageGroupId: "AG_U15", displayName: "U15E", classCode: "15E", classRank: 5, classType: "LETTER_RANK" },

  { teamClassId: "TC_14A", organisationId: "WES", ageGroupId: "AG_U14", displayName: "U14A", classCode: "14A", classRank: 1, classType: "LETTER_RANK" },
  { teamClassId: "TC_14B", organisationId: "WES", ageGroupId: "AG_U14", displayName: "U14B", classCode: "14B", classRank: 2, classType: "LETTER_RANK" },
  { teamClassId: "TC_14C", organisationId: "WES", ageGroupId: "AG_U14", displayName: "U14C", classCode: "14C", classRank: 3, classType: "LETTER_RANK" },
  { teamClassId: "TC_14D", organisationId: "WES", ageGroupId: "AG_U14", displayName: "U14D", classCode: "14D", classRank: 4, classType: "LETTER_RANK" },
  { teamClassId: "TC_14E", organisationId: "WES", ageGroupId: "AG_U14", displayName: "U14E", classCode: "14E", classRank: 5, classType: "LETTER_RANK" },
  { teamClassId: "TC_14F", organisationId: "WES", ageGroupId: "AG_U14", displayName: "U14F", classCode: "14F", classRank: 6, classType: "LETTER_RANK" },
  { teamClassId: "TC_14G", organisationId: "WES", ageGroupId: "AG_U14", displayName: "U14G", classCode: "14G", classRank: 7, classType: "LETTER_RANK" },
];

// ── 4. OFFICIAL RUBRIC "cricket-v1" WITH 20-PT BEHAVIORAL ANCHORS ──
export const CRICKET_V1_RUBRIC: Record<string, SkillRubricItem> = {
  // BATTING
  footwork: {
    key: "footwork",
    name: "Crease Depth & Footwork",
    category: "batting",
    description: "Ability to transfer weight, commit to front/back foot, and adjust to varied length and pace.",
    anchors: {
      20: "Feet static; plays at the ball from the crease regardless of length.",
      40: "Moves to the ball but late; commits front-foot only.",
      60: "Reads length reliably; both front and back foot available; occasional late commitment against pace.",
      80: "Decisive early movement; uses depth of crease; adjusts to spin and pace without resetting technique.",
      100: "Movement is pre-emptive and repeatable under match pressure against provincial-standard bowling.",
    },
    benchmarks: { U14: 52, U15: 58, U16: 65, Open: 74 },
  },
  frontFootDrive: {
    key: "frontFootDrive",
    name: "Front Foot Cover & Straight Drive",
    category: "batting",
    description: "High elbow, head over the ball, controlled weight transfer through mid-off and extra cover.",
    anchors: {
      20: "Swings with bottom hand across the line; head falls away to leg side.",
      40: "Reaches with hands ahead of front foot; frequently lofts through cover.",
      60: "Good head position and high front elbow; consistently drives along the turf in V.",
      80: "Crisp weight transfer into contact; pierces packed ring fields against 130km/h seam.",
      100: "Flawless elite timing, balance, and stroke placement against express pace and swinging new ball.",
    },
    benchmarks: { U14: 54, U15: 60, U16: 68, Open: 78 },
  },
  backFootPullCut: {
    key: "backFootPullCut",
    name: "Back Foot Pull & Square Cut",
    category: "batting",
    description: "Execution of horizontal bat strokes off short balls with head balance and rolling of wrists.",
    anchors: {
      20: "Backs away to leg stump; blind swat without looking at ball contact point.",
      40: "Plays cut with flat feet; top edge danger on rising deliveries.",
      60: "Gets back and across on toes; rolls wrists on pull down into ground.",
      80: "Explosive hip turn; dispatches short-of-length bowling to square boundaries with control.",
      100: "Mastery against 140km/h bouncers; executes upper cut and controlled hook with effortless poise.",
    },
    benchmarks: { U14: 50, U15: 56, U16: 64, Open: 75 },
  },
  defenseLeave: {
    key: "defenseLeave",
    name: "Forward Defence & Off-Stump Leave",
    category: "batting",
    description: "Soft hands, bat behind pad, judgment of 4th/5th stump corridor in red-ball and testing spells.",
    anchors: {
      20: "Pokes at balls outside off stump; hard hands pushing away from the body.",
      40: "Defends with stiff wrists; struggles to judge leaving line on 4th stump.",
      60: "Solid forward block under the eyes; leaves comfortably outside off stump.",
      80: "Dead-bats good length deliveries into the ground; immaculate corridor judgment.",
      100: "Impenetrable defensive wall against reverse swing and top-tier spin under declaration pressure.",
    },
    benchmarks: { U14: 53, U15: 59, U16: 67, Open: 76 },
  },
  powerHitting: {
    key: "powerHitting",
    name: "Boundary Clearance & Death Power",
    category: "batting",
    description: "Bat speed, base stability, and lofted stroke execution over 30-yard circle into the stands.",
    anchors: {
      20: "Lacks core rotation; mis-hits sliced into the infield.",
      40: "Hits hard but lacks elevation control; vulnerable to yorkers.",
      60: "Strong base; clears long-on and mid-wicket boundaries off length balls.",
      80: "360-degree boundary threat; strikes at >140 SR at death overs against varied attacks.",
      100: "Elite power and range hitting (90m+ distance) with repeatable technique under pressure.",
    },
    benchmarks: { U14: 48, U15: 55, U16: 63, Open: 75 },
  },
  strikeRotation: {
    key: "strikeRotation",
    name: "Strike Rotation & Gap Placement",
    category: "batting",
    description: "Nudging into pockets, calling between wickets, and converting dot balls into continuous singles.",
    anchors: {
      20: "Stuck on the crease; high dot-ball percentage (>75%).",
      40: "Looks for singles but hesitates in calling; struggles against ring fielders.",
      60: "Soft hands into gaps at point and square leg; reliable partner running.",
      80: "Manipulates field placements; keeps strike rotating even in tight middle-overs spells.",
      100: "Master tactician of field geometry; keeps dot-ball percentage below 25% under intense pressure.",
    },
    benchmarks: { U14: 51, U15: 57, U16: 65, Open: 74 },
  },

  // BOWLING
  seamRelease: {
    key: "seamRelease",
    name: "Seam Presentation & Upright Release",
    category: "bowling",
    description: "Releasing ball with steady upright seam rotation to achieve conventional and late movement.",
    anchors: {
      20: "Scrambled seam wobbling in air; wrist collapses at point of delivery.",
      40: "Seam points at slips occasionally; inconsistent wrist position.",
      60: "Upright seam presentation 4 out of 6 balls; generates consistent natural angle.",
      80: "Bolt-upright seam rotating cleanly; extracts late swing and seam movement off pitch.",
      100: "World-class seam control; alters wobble, outswing, and inswing release at will.",
    },
    benchmarks: { U14: 50, U15: 57, U16: 66, Open: 77 },
  },
  lineLengthControl: {
    key: "lineLengthControl",
    name: "Repeatable Line & Length Control",
    category: "bowling",
    description: "Landing in the corridor of uncertainty (6-8m from stumps on off stump) over extended spells.",
    anchors: {
      20: "Stuffs delivery down leg or sprays wide; delivers 2-3 bad boundary balls per over.",
      40: "Can hold length for 2-3 balls before drifting short or over-pitching.",
      60: "Hits consistent good length 4+ balls per over; restricts boundary scoring.",
      80: "Relentless pressure; can bowl 6 consecutive dot balls to a set top-order batter.",
      100: "Laser precision; sets up batters across multiple overs with meticulous planning and accuracy.",
    },
    benchmarks: { U14: 52, U15: 58, U16: 67, Open: 78 },
  },
  paceVariations: {
    key: "paceVariations",
    name: "Pace Variations & Slower Balls",
    category: "bowling",
    description: "Back-of-the-hand, knuckleball, off-cutter, and change-of-pace without telegraphing arm action.",
    anchors: {
      20: "Drops arm speed noticeably; batter reads change before release.",
      40: "Has one slower ball but lacks execution accuracy; prone to full tosses.",
      60: "Deceptive slower ball with identical arm action; deceives middle-order batters.",
      80: "Arsenal of off-cutters, knuckles, and bouncers delivered with deceptive arm speed.",
      100: "Elite variation mastery; controls dip, grip, and trajectory to dismantle death-overs hitting.",
    },
    benchmarks: { U14: 46, U15: 53, U16: 62, Open: 73 },
  },
  deathYorkers: {
    key: "deathYorkers",
    name: "Death Overs Yorker Execution",
    category: "bowling",
    description: "Pinpoint blockhole delivery at the batsman's toes and wide outside off under death pressure.",
    anchors: {
      20: "Attempts yorker and serves waist-high full tosses or slot balls.",
      40: "Hits base of stumps 1 in 4 attempts; vulnerable under pressure.",
      60: "Reliably lands blockhole deliveries in 40% of death over balls.",
      80: "Nails yorkers at toes and wide guideline under tight scoreboard chase.",
      100: "Near-unplayable death specialist; delivers 4+ perfect yorkers per death over.",
    },
    benchmarks: { U14: 45, U15: 52, U16: 63, Open: 76 },
  },
  driftTurn: {
    key: "driftTurn",
    name: "Drift, Dip & Revolutions (Spin)",
    category: "bowling",
    description: "Over-spin revolutions, flight, dip into the pitch, and sharp lateral turn off the surface.",
    anchors: {
      20: "Pushes ball flat with no revolutions; no drift or turn.",
      40: "Spins ball occasionally but lacks dip; easily played off the back foot.",
      60: "Imparts 1800+ RPM; extracts noticeable drift away and sharp turn back.",
      80: "Masters trajectory, flight, and change of revs; beats outside edge repeatedly.",
      100: "Magical spin artistry; dips and grips on unresponsive flat wickets against elite batters.",
    },
    benchmarks: { U14: 48, U15: 55, U16: 65, Open: 77 },
  },

  // FIELDING
  ringGroundwork: {
    key: "ringGroundwork",
    name: "Ring Fielding & Lateral Groundwork",
    category: "fielding",
    description: "Anticipation off the bat, aggressive attacking pickup, and clean transfer to throwing arm.",
    anchors: {
      20: "Flat-footed; allows balls to pass through legs on the boundary/infield.",
      40: "Stops ball on second attempt; slow to pick up and release throw.",
      60: "Aggressive attack of the ball; cuts off singles consistently inside 30 yards.",
      80: "Explosive dive and slide; saves 8-12 runs per match in the inner ring.",
      100: "Provincial trial benchmark; acrobatic stops and rapid one-motion pickup and release.",
    },
    benchmarks: { U14: 53, U15: 59, U16: 68, Open: 78 },
  },
  highCatching: {
    key: "highCatching",
    name: "High Skyer & Slip Catching",
    category: "fielding",
    description: "Judging swirling high catches under stadium lights and reaction catches in slips cordon.",
    anchors: {
      20: "Misjudges ball flight; drops regulation waist-high chances.",
      40: "Catches in chest only; struggles with high skyers or low edges.",
      60: "Steady reverse cup and orthodox slip technique; 80%+ catch retention rate.",
      80: "Fearless under swirling skiers; takes sharp half-chances in slips and gully.",
      100: "Flawless hands; 95%+ catch conversion rate in high-pressure match situations.",
    },
    benchmarks: { U14: 54, U15: 60, U16: 67, Open: 79 },
  },
  directHitAccuracy: {
    key: "directHitAccuracy",
    name: "Direct Hit Run-Out Throwing",
    category: "fielding",
    description: "One-stump direct hit accuracy from 20-40 meters while off balance or on the run.",
    anchors: {
      20: "Throws wide to keeper; rarely threatens the stumps.",
      40: "Can throw accurately only after taking 3-4 balancing steps.",
      60: "Hits the stumps 1 in 3 direct-hit attempts from 25 meters.",
      80: "Explosive throw on the turn; hits 1 stump consistently from backward point/cover.",
      100: "Lethal direct-hit weapon; creates match-turning run-outs from impossible angles.",
    },
    benchmarks: { U14: 49, U15: 55, U16: 64, Open: 76 },
  },

  // TACTICAL & MENTAL
  matchIQ: {
    key: "matchIQ",
    name: "Match Situation IQ & Awareness",
    category: "tacticalMental",
    description: "Understanding DLS par scores, match momentum, pitch degradation, and tactical shifts.",
    anchors: {
      20: "Unaware of match situation; plays reckless shots when team is 20/3.",
      40: "Follows coach instructions but cannot adapt independently on the field.",
      60: "Reads game situation well; manages partnership building and run chases.",
      80: "Proactive on-field leader; anticipates opponent tactics and capitalizes on weaknesses.",
      100: "Master strategist; orchestrates match-winning counter-strategies in championship finals.",
    },
    benchmarks: { U14: 50, U15: 57, U16: 66, Open: 78 },
  },
  pressureComposure: {
    key: "pressureComposure",
    name: "Composure Under Scoreboard Pressure",
    category: "tacticalMental",
    description: "Maintaining technical discipline and calm emotional focus during derby and playoff pressure.",
    anchors: {
      20: "Panics under pressure; loses temper or collapses emotionally.",
      40: "Performs in low-pressure fixtures but tightens up in key derbies.",
      60: "Maintains clear head in tight finishes; handles verbal chatter with composure.",
      80: "Thrives in high-stakes environments; elevates performance in front of 5000+ derby crowds.",
      100: "Ice in the veins; clinical execution in Super Overs and final-over tournament deciders.",
    },
    benchmarks: { U14: 51, U15: 58, U16: 67, Open: 79 },
  },

  // PHYSICAL
  mobilityIndex: {
    key: "mobilityIndex",
    name: "Rotational Mobility & Core Stability",
    category: "physical",
    description: "Thoracic spine rotation, hamstring elasticity, and hip mobility for explosive athletic movements.",
    anchors: {
      20: "Severe stiffness; limited shoulder and hip rotation; high injury risk.",
      40: "Basic mobility but tight posterior chain; struggles with low squats.",
      60: "Good athletic flexibility; meets CSA junior physical screening standards.",
      80: "Excellent rotational power and core stability; rapid recovery post-match.",
      100: "Peak high-performance athletic standard; flawless biomechanical screening.",
    },
    benchmarks: { U14: 55, U15: 62, U16: 70, Open: 82 },
  },
  weeklyOverTolerance: {
    key: "weeklyOverTolerance",
    name: "Weekly Bowling Over Workload Capacity",
    category: "physical",
    description: "Workload stamina to bowl 15-25 overs in multi-day fixtures without breakdown or pace drop.",
    anchors: {
      20: "Fatiques after 3 overs; pace drops by >15 km/h; bowling action breaks down.",
      40: "Can manage 6 overs per day; sore lower back following spell.",
      60: "Bowls 12 overs across two innings comfortably with steady energy.",
      80: "Robust workhorse capacity (18-24 overs/week) with disciplined recovery protocols.",
      100: "Elite stamina; maintains 135km/h+ velocity into 3rd spell on Day 2 of time cricket.",
    },
    benchmarks: { U14: 48, U15: 55, U16: 66, Open: 78 },
  },
};

// ── 5. IMMUTABLE APPEND-ONLY ASSESSMENT LOG ───────────
// Real historical series showing longitudinal player development across terms, coaches, and promotions
export const INITIAL_ASSESSMENT_LOG: SkillAssessmentRecord[] = [
  // ── KYLE PILLAY (p1) LONGITUDINAL PROGRESSION (U15C -> U15B -> U16B -> U16A) ──
  {
    id: "asm_p1_2024_t3",
    tenantId: "WES",
    playerId: "p1",
    playerName: "Kyle Pillay",
    rubricVersion: "cricket-v1",
    assessedBy: "c15c",
    assessorName: "Mark van Wyk",
    assessorRole: "U15C Head Coach",
    assessedAt: "2024-09-15T14:30:00Z",
    committedAt: "2024-09-15T16:00:00Z",
    ageGroup: "U15",
    squad: "U15C",
    window: "2024-T3",
    priorAssessmentId: null,
    status: "committed",
    scores: {
      batting: { footwork: 54, frontFootDrive: 56, backFootPullCut: 52, defenseLeave: 55, powerHitting: 50, strikeRotation: 53 },
      bowling: { seamRelease: 45, lineLengthControl: 46, paceVariations: 40, deathYorkers: 38, driftTurn: 42 },
      fielding: { ringGroundwork: 56, highCatching: 58, directHitAccuracy: 50, gloveworkSpeed: 50, athleticismSlide: 54 },
      tacticalMental: { matchIQ: 52, pressureComposure: 51, fieldSettingIntuition: 50, coachabilityWorkEthic: 82 },
      physical: { mobilityIndex: 58, weeklyOverTolerance: 48, yoyoLevel: 17.5, sprint20m: 3.12 },
    },
    confidence: { footwork: "high", frontFootDrive: "high", defenseLeave: "medium", bowling: "low", fielding: "high" },
    notes: "Solid work ethic. Footwork was static in early nets but responded well to weighted bat drills. Promoted to U15B for next term.",
    targetDevelopmentGoals: ["Eliminate front foot reach on driving", "Improve slip catching cup"],
  },
  {
    id: "asm_p1_2025_t1",
    tenantId: "WES",
    playerId: "p1",
    playerName: "Kyle Pillay",
    rubricVersion: "cricket-v1",
    assessedBy: "c15b",
    assessorName: "Garth Simpson",
    assessorRole: "U15B Head Coach",
    assessedAt: "2025-02-20T15:00:00Z",
    committedAt: "2025-02-20T17:30:00Z",
    ageGroup: "U15",
    squad: "U15B",
    window: "2025-T1",
    priorAssessmentId: "asm_p1_2024_t3",
    status: "committed",
    scores: {
      batting: { footwork: 61, frontFootDrive: 64, backFootPullCut: 58, defenseLeave: 62, powerHitting: 56, strikeRotation: 60 },
      bowling: { seamRelease: 48, lineLengthControl: 50, paceVariations: 44, deathYorkers: 42, driftTurn: 45 },
      fielding: { ringGroundwork: 64, highCatching: 66, directHitAccuracy: 58, gloveworkSpeed: 52, athleticismSlide: 62 },
      tacticalMental: { matchIQ: 60, pressureComposure: 58, fieldSettingIntuition: 56, coachabilityWorkEthic: 86 },
      physical: { mobilityIndex: 65, weeklyOverTolerance: 52, yoyoLevel: 18.2, sprint20m: 3.02 },
    },
    confidence: { footwork: "high", frontFootDrive: "high", defenseLeave: "high", strikeRotation: "high" },
    notes: "Noticeable technical leap. Footwork index rose from 54 to 61 (above U15 age par of 58). Weight transfer through cover is clean.",
    targetDevelopmentGoals: ["Power hitting base stabilization", "Short ball evasion against express pace"],
  },
  {
    id: "asm_p1_2025_t3",
    tenantId: "WES",
    playerId: "p1",
    playerName: "Kyle Pillay",
    rubricVersion: "cricket-v1",
    assessedBy: "c16b",
    assessorName: "Shaun Pollock Jr.",
    assessorRole: "U16B Head Coach",
    assessedAt: "2025-09-18T14:45:00Z",
    committedAt: "2025-09-18T16:15:00Z",
    ageGroup: "U16",
    squad: "U16B",
    window: "2025-T3",
    priorAssessmentId: "asm_p1_2025_t1",
    status: "committed",
    scores: {
      batting: { footwork: 66, frontFootDrive: 70, backFootPullCut: 65, defenseLeave: 68, powerHitting: 64, strikeRotation: 67 },
      bowling: { seamRelease: 50, lineLengthControl: 52, paceVariations: 48, deathYorkers: 44, driftTurn: 48 },
      fielding: { ringGroundwork: 72, highCatching: 74, directHitAccuracy: 66, gloveworkSpeed: 55, athleticismSlide: 70 },
      tacticalMental: { matchIQ: 68, pressureComposure: 66, fieldSettingIntuition: 65, coachabilityWorkEthic: 90 },
      physical: { mobilityIndex: 72, weeklyOverTolerance: 58, yoyoLevel: 18.8, sprint20m: 2.94 },
    },
    confidence: { footwork: "high", frontFootDrive: "high", powerHitting: "medium", defenseLeave: "high" },
    notes: "Consistent run-scorer in Saturday derbies. Held above par for U16 (score 66 vs 65 par). Recommended for U16A call-up in Term 1 2026.",
    targetDevelopmentGoals: ["Back-foot pull shot wrist roll", "Leadership in batting partnerships"],
  },
  {
    id: "asm_p1_2026_t1",
    tenantId: "WES",
    playerId: "p1",
    playerName: "Kyle Pillay",
    rubricVersion: "cricket-v1",
    assessedBy: "c16a",
    assessorName: "Wayne Scott",
    assessorRole: "1st XI & U16A High Performance Director",
    assessedAt: "2026-02-14T11:00:00Z",
    committedAt: "2026-02-14T12:30:00Z",
    ageGroup: "U16",
    squad: "U16A",
    window: "2026-T1",
    priorAssessmentId: "asm_p1_2025_t3",
    status: "committed",
    scores: {
      batting: { footwork: 69, frontFootDrive: 74, backFootPullCut: 69, defenseLeave: 72, powerHitting: 70, strikeRotation: 71 },
      bowling: { seamRelease: 52, lineLengthControl: 54, paceVariations: 50, deathYorkers: 46, driftTurn: 50 },
      fielding: { ringGroundwork: 78, highCatching: 79, directHitAccuracy: 72, gloveworkSpeed: 58, athleticismSlide: 76 },
      tacticalMental: { matchIQ: 75, pressureComposure: 74, fieldSettingIntuition: 72, coachabilityWorkEthic: 94 },
      physical: { mobilityIndex: 78, weeklyOverTolerance: 62, yoyoLevel: 19.3, sprint20m: 2.88 },
    },
    confidence: { footwork: "high", frontFootDrive: "high", backFootPullCut: "high", pressureComposure: "high" },
    notes: "Outstanding progress. Footwork score 69 is 1.06x U16 benchmark (65). Poised for senior Open 1st XI shadow squad trials.",
    targetDevelopmentGoals: ["Senior school Open 1st XI transition", "Handling express 135km/h+ bounce"],
  },

  // ── MONAGENG MOLEFE (p2) LONGITUDINAL PROGRESSION (U15A -> U16A -> Open 1st XI) ──
  {
    id: "asm_p2_2024_t3",
    tenantId: "WES",
    playerId: "p2",
    playerName: "Monageng Molefe",
    rubricVersion: "cricket-v1",
    assessedBy: "c15a",
    assessorName: "Wayne Scott",
    assessorRole: "U15A Head Coach",
    assessedAt: "2024-09-12T10:00:00Z",
    committedAt: "2024-09-12T11:30:00Z",
    ageGroup: "U15",
    squad: "U15A",
    window: "2024-T3",
    priorAssessmentId: null,
    status: "committed",
    scores: {
      batting: { footwork: 64, frontFootDrive: 68, backFootPullCut: 66, defenseLeave: 65, powerHitting: 60, strikeRotation: 62 },
      bowling: { seamRelease: 72, lineLengthControl: 70, paceVariations: 64, deathYorkers: 62, driftTurn: 50 },
      fielding: { ringGroundwork: 74, highCatching: 76, directHitAccuracy: 70, gloveworkSpeed: 55, athleticismSlide: 72 },
      tacticalMental: { matchIQ: 70, pressureComposure: 72, fieldSettingIntuition: 68, coachabilityWorkEthic: 92 },
      physical: { mobilityIndex: 74, weeklyOverTolerance: 68, yoyoLevel: 19.0, sprint20m: 2.90 },
    },
    confidence: { seamRelease: "high", lineLengthControl: "high", footwork: "high" },
    notes: "Special pace talent. Upright seam release is naturally gifted. Bowls 125km/h at U15. Handled with workload care.",
    targetDevelopmentGoals: ["Maintain upright seam on second spell", "Death overs yorker consistency"],
  },
  {
    id: "asm_p2_2025_t3",
    tenantId: "WES",
    playerId: "p2",
    playerName: "Monageng Molefe",
    rubricVersion: "cricket-v1",
    assessedBy: "c16a",
    assessorName: "Wayne Scott",
    assessorRole: "U16A Head Coach",
    assessedAt: "2025-09-20T14:00:00Z",
    committedAt: "2025-09-20T15:30:00Z",
    ageGroup: "U16",
    squad: "U16A",
    window: "2025-T3",
    priorAssessmentId: "asm_p2_2024_t3",
    status: "committed",
    scores: {
      batting: { footwork: 70, frontFootDrive: 75, backFootPullCut: 72, defenseLeave: 70, powerHitting: 68, strikeRotation: 69 },
      bowling: { seamRelease: 82, lineLengthControl: 80, paceVariations: 74, deathYorkers: 72, driftTurn: 55 },
      fielding: { ringGroundwork: 82, highCatching: 84, directHitAccuracy: 78, gloveworkSpeed: 60, athleticismSlide: 80 },
      tacticalMental: { matchIQ: 78, pressureComposure: 82, fieldSettingIntuition: 76, coachabilityWorkEthic: 96 },
      physical: { mobilityIndex: 82, weeklyOverTolerance: 78, yoyoLevel: 19.8, sprint20m: 2.80 },
    },
    confidence: { seamRelease: "high", lineLengthControl: "high", deathYorkers: "high" },
    notes: "Dominant all-round season. Seam release scored 82 (well above U16 benchmark of 66). Called up to Open 1st XI and KZN U19 representative squad.",
    targetDevelopmentGoals: ["New ball outswinger wrist snap", "Yorker execution at 135 km/h"],
  },
  {
    id: "asm_p2_2026_t1",
    tenantId: "WES",
    playerId: "p2",
    playerName: "Monageng Molefe",
    rubricVersion: "cricket-v1",
    assessedBy: "c1st",
    assessorName: "Wayne Scott",
    assessorRole: "1st XI Head Coach",
    assessedAt: "2026-02-18T10:00:00Z",
    committedAt: "2026-02-18T11:45:00Z",
    ageGroup: "Open",
    squad: "1st XI",
    window: "2026-T1",
    priorAssessmentId: "asm_p2_2025_t3",
    status: "committed",
    scores: {
      batting: { footwork: 76, frontFootDrive: 82, backFootPullCut: 78, defenseLeave: 76, powerHitting: 75, strikeRotation: 74 },
      bowling: { seamRelease: 88, lineLengthControl: 85, paceVariations: 80, deathYorkers: 82, driftTurn: 60 },
      fielding: { ringGroundwork: 88, highCatching: 90, directHitAccuracy: 84, gloveworkSpeed: 64, athleticismSlide: 86 },
      tacticalMental: { matchIQ: 86, pressureComposure: 88, fieldSettingIntuition: 85, coachabilityWorkEthic: 98 },
      physical: { mobilityIndex: 88, weeklyOverTolerance: 84, yoyoLevel: 20.2, sprint20m: 2.74 },
    },
    confidence: { seamRelease: "high", lineLengthControl: "high", paceVariations: "high", deathYorkers: "high" },
    notes: "Performing at senior provincial trial standard (seam score 88 vs Open benchmark of 77). Key strike weapon for Westville Open 1st XI.",
    targetDevelopmentGoals: ["CSA Cubs Week selection", "Reverse swing maintenance"],
  },
];

// ── 6. DERIVED READ ENGINE & LONGITUDINAL TRAJECTORY ──
export function getLatestCommittedAssessment(
  playerId: string,
  assessmentLog: SkillAssessmentRecord[] = INITIAL_ASSESSMENT_LOG
): SkillAssessmentRecord | null {
  const playerRecords = assessmentLog.filter(
    r => r.playerId === playerId && (r.status === "committed" || r.status === "superseded")
  );
  if (playerRecords.length === 0) return null;

  // Order by committedAt descending
  playerRecords.sort((a, b) => {
    const timeA = a.committedAt ? new Date(a.committedAt).getTime() : 0;
    const timeB = b.committedAt ? new Date(b.committedAt).getTime() : 0;
    return timeB - timeA;
  });

  return playerRecords[0];
}

export function calculateAgeRelativeIndex(
  storedScore: number,
  ageGroup: "U14" | "U15" | "U16" | "Open",
  skillKey: string
): { index: number; benchmark: number; statusText: string } {
  const rubric = CRICKET_V1_RUBRIC[skillKey];
  const benchmark = rubric?.benchmarks[ageGroup] || 60;
  const index = Number((storedScore / benchmark).toFixed(2));

  let statusText = "On Par";
  if (index >= 1.15) statusText = "Elite (15%+ Above Age Par)";
  else if (index >= 1.05) statusText = "Above Age Par";
  else if (index <= 0.88) statusText = "Below Par (Priority Focus)";

  return { index, benchmark, statusText };
}

export function getLongitudinalTrajectory(
  playerId: string,
  skillKey: string,
  category: "batting" | "bowling" | "fielding" | "tacticalMental" | "physical",
  assessmentLog: SkillAssessmentRecord[] = INITIAL_ASSESSMENT_LOG
): LongitudinalPoint[] {
  const playerRecords = assessmentLog
    .filter(r => r.playerId === playerId && (r.status === "committed" || r.status === "superseded"))
    .sort((a, b) => {
      const timeA = a.committedAt ? new Date(a.committedAt).getTime() : 0;
      const timeB = b.committedAt ? new Date(b.committedAt).getTime() : 0;
      return timeA - timeB;
    });

  const points: LongitudinalPoint[] = [];
  let priorScore: number | null = null;
  let priorSquad: string | null = null;

  playerRecords.forEach(rec => {
    const categoryScores = (rec.scores as Record<string, Record<string, number>>)[category] || {};
    const storedScore = categoryScores[skillKey] ?? 60;
    const ageRel = calculateAgeRelativeIndex(storedScore, rec.ageGroup, skillKey);
    const delta = priorScore !== null ? storedScore - priorScore : 0;
    const isPromotion = priorSquad !== null && priorSquad !== rec.squad;

    let alert: "sustained_growth" | "on_par" | "sustained_decline" = "on_par";
    if (delta > 3) alert = "sustained_growth";
    else if (delta < -3) alert = "sustained_decline";

    points.push({
      window: rec.window,
      date: rec.committedAt ? rec.committedAt.split("T")[0] : rec.assessedAt.split("T")[0],
      squad: rec.squad,
      ageGroup: rec.ageGroup,
      assessedBy: rec.assessorName,
      storedScore,
      ageRelativeIndex: ageRel.index,
      delta,
      isPromotionEvent: isPromotion,
      promotionDetails: isPromotion ? `Promoted from ${priorSquad} to ${rec.squad}` : undefined,
      isInherited: rec.confidence[skillKey] === "inherited",
      isNotObserved: rec.confidence[skillKey] === "not_observed",
      developmentAlert: alert,
    });

    priorScore = storedScore;
    priorSquad = rec.squad;
  });

  return points;
}

// ── 7. POPIA ACCESS CONTROL & EXPORT ENGINE ────────────
export function checkPOPIAAccess(
  userRole: string,
  field: "scores" | "notes" | "history" | "deIdentifiedOnly"
): { granted: boolean; notice: string } {
  // Analyst Role Policy: De-identified scores ONLY, Narrative notes STRIPPED!
  if (userRole === "Analyst" || userRole === "scout") {
    if (field === "notes") {
      return {
        granted: false,
        notice: "POPIA Policy: Narrative coach notes contain subjective personal evaluations of minors and are restricted from Analyst/Scout view.",
      };
    }
    return { granted: true, notice: "Access granted under de-identified statistical terms." };
  }

  // Coach (Other Team) Policy: Current scores only, no historical progression, no notes
  if (userRole === "Coach (other team)") {
    if (field === "notes" || field === "history") {
      return {
        granted: false,
        notice: "POPIA Policy: Cross-team coaches can only view current verified scores; historical longitudinal logs and coach prose are restricted.",
      };
    }
    return { granted: true, notice: "Current score access granted." };
  }

  // Head Coach / Sportsmaster / Admin: Full Access
  return { granted: true, notice: "Full authenticated governance access granted." };
}

export function generateSubjectAccessRequestExport(
  playerId: string,
  playerName: string,
  schoolId: string,
  assessmentLog: SkillAssessmentRecord[] = INITIAL_ASSESSMENT_LOG
): POPIASubjectAccessExport {
  const records = assessmentLog.filter(r => r.playerId === playerId);
  return {
    exportId: `SAR_${playerId}_${Date.now()}`,
    generatedAt: new Date().toISOString(),
    playerId,
    playerName,
    parentOrGuardianRequest: true,
    schoolId,
    totalAssessments: records.length,
    records,
    disclaimer:
      "This complete evaluative file has been compiled in accordance with the Protection of Personal Information Act (POPIA) for parent/guardian review. Contains all historical, committed, and superseded assessment records.",
  };
}
