'use client';

import React, { useState, useMemo } from 'react';
import { Theme } from './types';

interface RulebookViewProps {
  theme: Theme;
}

interface RuleClause {
  id: string;
  code: string;
  category: 'Playing Conditions' | 'Fast Bowling' | 'Curator & Turf' | 'Discipline & Conduct' | 'Medical & Safety';
  title: string;
  summary: string;
  fullText: string;
  severity?: 'Mandatory' | 'Guideline' | 'Penalty Enforced';
  applicableAges: string;
}

const OFFICIAL_RULES: RuleClause[] = [
  {
    id: 'rc-1',
    code: 'CSA-YP-4.1',
    category: 'Fast Bowling',
    title: 'CSA Youth Pace Bowling Workload Directives',
    severity: 'Mandatory',
    applicableAges: 'U14, U15, U16, 1st XI (Open)',
    summary: 'Strict limitations on consecutive overs and daily totals to prevent adolescent lumbar stress fractures.',
    fullText: `1. U14 Age Group: Maximum of 5 consecutive overs per spell. Maximum of 10 overs per match day. Must rest for double the duration of the spell before bowling again.
2. U15 Age Group: Maximum of 6 consecutive overs per spell. Maximum of 12 overs per match day. Minimum 30-minute recovery window between spells.
3. U16 Age Group: Maximum of 6 consecutive overs per spell. Maximum of 14 overs per match day.
4. Open Tier (1st–3rd XI): Maximum of 7 consecutive overs per spell. Maximum of 16 overs in a 50-over match, or 20 overs per day in two-day declaration fixtures.
5. Penalty: Any school in breach forfeits 10 penalty runs to the batting side, and the bowler is immediately suspended from bowling for the remainder of the innings.`,
  },
  {
    id: 'rc-2',
    code: 'MCC-CSA-2.4',
    category: 'Medical & Safety',
    title: 'Concussion Replacement Protocol (Law 1.2 Modified)',
    severity: 'Mandatory',
    applicableAges: 'All Divisions (U14A to 1st XI)',
    summary: 'Standardized procedure for immediate medical evaluation and like-for-like replacement of head-impact casualties.',
    fullText: `1. Mandatory 10-Minute Clinical Assessment: If a player is struck on the helmet or suffers a sudden deceleration impact, play must be halted immediately. The accredited school physiotherapist or designated medical liaison must conduct an on-field SCAT-5 assessment.
2. Like-for-Like Replacement: If diagnosed with suspected concussion, the player is withdrawn. The opposing captain and match umpires must approve a like-for-like substitute (e.g. specialist batsman for specialist batsman; spinner for spinner).
3. Batting/Bowling Entitlement: The approved concussion substitute may bat and bowl without limitation in the remaining innings.
4. Mandatory 7-Day Stand-down: Any player diagnosed with a concussion enters the SCRBRD Medical Protocol and is barred from sporting activities for a minimum of 7 days, requiring specialist neurological clearance before resumption.`,
  },
  {
    id: 'rc-3',
    code: 'KZN-PC-1.1',
    category: 'Playing Conditions',
    title: '50-Over Limited Overs Match Structure & Fielding Circles',
    severity: 'Mandatory',
    applicableAges: '1st XI, 2nd XI & U16A Premier',
    summary: 'Over rates, powerplay sector restrictions, and inner-ring fielding rings.',
    fullText: `1. Match Duration: 50 six-ball overs per team. Scheduled playing time: 3 hours 30 minutes per innings, with a 30-minute interval between innings.
2. Target Over Rate: 15.0 overs per hour. If the bowling team fails to bowl their 50th over within 3 hours 20 minutes, an additional fielder must be placed inside the 30-yard ring for every subsequent over until completion.
3. Powerplay 1 (Overs 1–10): Maximum of 2 fielders permitted outside the 30-yard inner circle.
4. Powerplay 2 (Overs 11–40): Maximum of 4 fielders permitted outside the inner circle.
5. Powerplay 3 (Overs 41–50): Maximum of 5 fielders permitted outside the inner circle.
6. Short-Pitched Deliveries (Bouncers): Maximum of one ball passing above shoulder height per over. A second delivery above shoulder height is called 'No Ball' by the square-leg umpire.`,
  },
  {
    id: 'rc-4',
    code: 'TURF-REG-3.2',
    category: 'Curator & Turf',
    title: 'Match-Day Pitch Preparation, Rolling & Water Cut-offs',
    severity: 'Penalty Enforced',
    applicableAges: 'All Turf Oval Grounds',
    summary: 'Curator guidelines for Bulli clay compaction, roller weight classes, and watering bans.',
    fullText: `1. Watering Prohibition: Artificial watering or deep-soaking of the designated match strip must cease exactly 48 hours prior to scheduled coin toss. Light surface misting for morning binding must cease 16 hours prior to toss.
2. Rolling Privileges: The batting captain has the right to select either a light roller (under 1.0 tonne) or a heavy roller (1.8–2.5 tonnes) for rolling not exceeding 7 minutes prior to the start of each innings.
3. Crease Markings: Bowling crease (8ft 8in / 2.64m), popping crease (4ft / 1.22m forward of bowling crease), and return creases must be marked in non-toxic white acrylic emulsion.
4. Mowing Height: Match pitch grass height must measure between 3.5mm and 4.5mm on morning of play. Outfield cut must not exceed 12.0mm.`,
  },
  {
    id: 'rc-5',
    code: 'DISC-CODE-5.0',
    category: 'Discipline & Conduct',
    title: 'Code of Conduct, Demerit Ladders & Disciplinary Hearings',
    severity: 'Penalty Enforced',
    applicableAges: 'All Coaches, Players & Staff',
    summary: 'Four-tier offense classification, demerit point accumulation, and sanction ladders.',
    fullText: `1. Level 1 Offenses: Excessive or orchestrated appealing; dissent by word or action; obscene or offensive language directed at no one in particular. Penalty: Official warning + 1 demerit point.
2. Level 2 Offenses: Serious dissent; throwing ball at or near player/umpire; inappropriate physical contact; public criticism of umpires. Penalty: 2 to 3 demerit points + automatic 1-match suspension.
3. Level 3 Offenses: Intimidation of an umpire; threatening physical harm; derogatory racial, religious, or discriminatory slurs. Penalty: 4 to 5 demerit points + immediate 4-match suspension and Disciplinary Hearing.
4. Level 4 Offenses: Act of physical violence; bringing the game or school institution into disrepute. Penalty: Indefinite expulsion from KZN Schools Cricket League.
5. Demerit Accumulation: 4 demerit points within a 12-month rolling window converts to an automatic 2-match ban.`,
  },
  {
    id: 'rc-6',
    code: 'KZN-WEATHER-2.1',
    category: 'Playing Conditions',
    title: 'Wet Weather, Lightning Ground Hazards & DLS Target Recalculation',
    severity: 'Mandatory',
    applicableAges: 'All Match Tiers',
    summary: '30/30 Lightning rule, minimum overs for valid result, and Duckworth-Lewis-Stern calculation protocols.',
    fullText: `1. 30/30 Lightning Safety Rule: If lightning is detected within 10km (or the flash-to-bang interval is less than 30 seconds), play must be suspended immediately. Players and spectators must evacuate to safe, fully enclosed structures. Play shall not resume until 30 minutes after the last observed lightning flash.
2. Minimum Overs for Valid Result:
   - 50-Over Matches: A minimum of 20 overs per side must be completed to constitute a match. If rain prevents the second team from completing 20 overs, the fixture is declared 'No Result / Match Abandoned'.
   - T20 Matches: A minimum of 5 overs per side must be completed.
3. Interrupted Matches: Target recalculation must be performed using standard Duckworth-Lewis-Stern (DLS) algorithms. In junior divisions (U14–U15), average run rate (ARR) may be utilized only with prior written agreement of both Directors of Cricket.`,
  },
  {
    id: 'rc-7',
    code: 'CSA-BALL-1.8',
    category: 'Playing Conditions',
    title: 'Official Match Ball Specifications & Replacement Vault',
    severity: 'Mandatory',
    applicableAges: 'All Grades',
    summary: 'Standardized ball weights, grades, and replacement protocol for lost or misshapen balls.',
    fullText: `1. 1st XI Premier League: Red 4-piece 156g Kookaburra Turf Master or Duke Special School Match ball.
2. Junior Divisions (U14 & U15): 4-piece 142g or 156g red cricket ball compliant with CSA youth specifications.
3. T20 Night Fixtures: White Kookaburra Club match ball (156g). Black sight-screens required.
4. Ball Replacement: If a ball is lost, damaged, or fails the umpire's ring gauge, it must be replaced by a ball of equivalent wear and condition from the official Reserve Ball Vault maintained by the home school curator.`,
  },
];

interface QuizScenario {
  id: string;
  title: string;
  scenarioText: string;
  options: { text: string; isCorrect: boolean; feedback: string }[];
  ruleCode: string;
}

const ADJUDICATION_SCENARIOS: QuizScenario[] = [
  {
    id: 'sc1',
    title: 'Short-Pitched Delivery (Bouncer) Enforcement',
    scenarioText: 'In the 28th over of a 1st XI 50-over fixture, the fast bowler bowls a delivery passing above the batsman’s shoulder. The umpire signals one for the over. Three balls later, the bowler bowls another delivery above head height.',
    options: [
      { text: 'Call Wide Ball only.', isCorrect: false, feedback: 'Incorrect. While it passed above head height, a second short-pitched ball in the over triggers a specific mandatory call.' },
      { text: 'Call No-Ball, signal one penalty run, and issue an official first and final warning for dangerous bowling.', isCorrect: true, feedback: 'Correct! Under Law 41.6 & KZN-PC-1.1, a second short-pitched delivery above shoulder height in one over is an automatic No-Ball and first warning.' },
      { text: 'Call Dead Ball and replay the delivery.', isCorrect: false, feedback: 'Incorrect. The ball was live and legitimate until exceeding the limit.' },
    ],
    ruleCode: 'KZN-PC-1.1 & Law 41.6',
  },
  {
    id: 'sc2',
    title: 'Suspected Concussion & Replacement Dispute',
    scenarioText: 'A batsman is struck firmly on the grill of the helmet. The physio diagnoses a suspected concussion and requests a like-for-like replacement. The fielding captain refuses, arguing the substitute is a better player.',
    options: [
      { text: 'The fielding captain has veto power over medical substitutes.', isCorrect: false, feedback: 'Incorrect. Under child safeguarding and CSA-2.4, player safety overrides captain vetoes.' },
      { text: 'The match umpires and accredited physio have final authority to approve a like-for-like replacement; the captain’s refusal is dismissed.', isCorrect: true, feedback: 'Correct! Under MCC-CSA-2.4, the accredited medical staff and umpires govern like-for-like approval to prioritize athlete welfare.' },
      { text: 'The injured player must bat on or retire hurt without a replacement.', isCorrect: false, feedback: 'Incorrect. Concussion replacement rules allow a full active substitute.' },
    ],
    ruleCode: 'MCC-CSA-2.4 (Law 1.2)',
  },
  {
    id: 'sc3',
    title: 'Lightning Storm Within 10km Radius',
    scenarioText: 'The sky directly above the oval is clear, but thunder is heard and the coach’s lightning detector registers a strike 7km away. Both captains want to play the final 2 overs to get a result.',
    options: [
      { text: 'Allow the 2 overs if both head coaches sign a waiver.', isCorrect: false, feedback: 'Incorrect. Safety protocols cannot be waived under school insurance policies.' },
      { text: 'Mandatory immediate suspension of play under the 30/30 rule; evacuate players and spectators to enclosed buildings.', isCorrect: true, feedback: 'Correct! The 30/30 Lightning rule is absolute. Play cannot resume until 30 minutes after the last observed lightning strike.' },
      { text: 'Bowl spinners only to finish the overs quickly.', isCorrect: false, feedback: 'Incorrect. Lightning hazards apply equally regardless of bowling style.' },
    ],
    ruleCode: 'KZN-WEATHER-2.1',
  },
];

export default function RulebookView({ theme: D }: RulebookViewProps) {
  const [activeTab, setActiveTab] = useState<'rules' | 'workload_calculator' | 'scenario_quiz' | 'demerit_calc'>('rules');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedClauseId, setExpandedClauseId] = useState<string | null>('rc-1');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Workload Calculator State
  const [calcAgeGroup, setCalcAgeGroup] = useState<'U14' | 'U15' | 'U16' | 'Open'>('U15');
  const [currentSpellOvers, setCurrentSpellOvers] = useState<number>(4);
  const [totalOversToday, setTotalOversToday] = useState<number>(8);

  // Workload Limits Table
  const workloadLimits = {
    U14: { maxSpell: 5, maxDaily: 10, restMultiplier: 2 },
    U15: { maxSpell: 6, maxDaily: 12, restMultiplier: 2 },
    U16: { maxSpell: 6, maxDaily: 14, restMultiplier: 2 },
    Open: { maxSpell: 7, maxDaily: 16, restMultiplier: 2 },
  };

  const currentLimit = workloadLimits[calcAgeGroup];
  const isSpellBreached = currentSpellOvers > currentLimit.maxSpell;
  const isDailyBreached = totalOversToday > currentLimit.maxDaily;
  const isBreached = isSpellBreached || isDailyBreached;
  const dailyOversRemaining = Math.max(0, currentLimit.maxDaily - totalOversToday);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number | null>>({});

  // Demerit Calculator State
  const [selectedOffenseLevel, setSelectedOffenseLevel] = useState<number>(1);
  const [selectedOffenseIndex, setSelectedOffenseIndex] = useState<number>(0);

  const offenseMatrix = [
    { level: 1, name: 'Level 1: Minor Misconduct', offenses: ['Excessive appealing after umpire decision', 'Dissent by gesture or muttering', 'Swearing in general frustration'], demerits: 1, sanction: 'Official Warning + 1 Demerit Point' },
    { level: 2, name: 'Level 2: Serious Dissent & Aggression', offenses: ['Throwing the ball dangerously near batsman/umpire', 'Direct personal dissent towards umpire', 'Inappropriate physical contact during celebration'], demerits: 3, sanction: 'Automatic 1-Match Suspension + 3 Demerits' },
    { level: 3, name: 'Level 3: Intimidation & Threat', offenses: ['Intimidating an umpire physically or verbally', 'Threatening physical violence against opponent', 'Racial, religious, or discriminatory slurs'], demerits: 5, sanction: 'Immediate 4-Match Suspension + Disciplinary Panel' },
    { level: 4, name: 'Level 4: Physical Violence & Disrepute', offenses: ['Physical assault on umpire, player or spectator', 'Deliberate ball tampering or match manipulation', 'Gross institutional disrepute'], demerits: 8, sanction: 'Indefinite League Expulsion + School Sanction' },
  ];

  const activeLevelData = offenseMatrix[selectedOffenseLevel - 1];

  const categories = ['All', 'Playing Conditions', 'Fast Bowling', 'Curator & Turf', 'Discipline & Conduct', 'Medical & Safety'];

  const filteredRules = useMemo(() => {
    return OFFICIAL_RULES.filter(rule => {
      const matchCat = selectedCategory === 'All' || rule.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.fullText.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div
        style={{
          padding: '24px',
          background: `linear-gradient(135deg, ${D.surf1} 0%, ${D.surf2} 100%)`,
          borderRadius: D.lg,
          border: `1px solid ${D.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>📖</span>
            <h1 style={{ fontFamily: D.head, fontSize: '20px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
              KZN Schools Cricket Union Regulatory Suite & Decision Engine
            </h1>
          </div>
          <p style={{ fontFamily: D.body, fontSize: '13px', color: D.textSecondary, marginTop: '6px', maxWidth: '750px', lineHeight: 1.6 }}>
            Interactive CSA youth directives, match adjudication simulators, pace bowling workload calculators, and official governing code.
          </p>
        </div>

        {/* Top Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'rules', label: '📖 Official Clauses', icon: '📜' },
            { id: 'workload_calculator', label: '⚡ Pace Workload Calculator', icon: '⏱️' },
            { id: 'scenario_quiz', label: '⚖️ Umpire Decision Simulator', icon: '🎯' },
            { id: 'demerit_calc', label: '🚨 Demerit & Sanction Matrix', icon: '⚖️' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '8px 14px',
                borderRadius: D.pill,
                background: activeTab === tab.id ? D.indigo : D.surf2,
                border: `1px solid ${activeTab === tab.id ? D.indigo : D.border}`,
                color: activeTab === tab.id ? '#fff' : D.textSecondary,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE MODULE 1: FAST BOWLER WORKLOAD CALCULATOR                     */}
      {/* ========================================================================= */}
      {activeTab === 'workload_calculator' && (
        <div
          style={{
            padding: '24px',
            background: D.surf1,
            borderRadius: D.lg,
            border: `1px solid ${isBreached ? D.rose : D.emerald}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.textPrimary }}>
                ⚡ CSA Youth Fast Bowling Workload Compliance Calculator (Directive 4.1)
              </div>
              <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted }}>
                Calculate legal spell limits, lumbar spine injury safeguards, and mandatory rest intervals in real time
              </div>
            </div>

            <span
              style={{
                padding: '4px 12px',
                borderRadius: D.pill,
                background: isBreached ? `${D.rose}20` : `${D.emerald}20`,
                color: isBreached ? D.rose : D.emerald,
                fontFamily: D.mono,
                fontSize: '11px',
                fontWeight: 800,
                border: `1px solid ${isBreached ? D.rose : D.emerald}40`,
              }}
            >
              {isBreached ? '⚠️ BREACH: PENALTY RUNS' : '✓ LEGAL WORKLOAD STATUS'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {/* Age Group Selector */}
            <div style={{ padding: '14px', background: D.surf2, borderRadius: D.md }}>
              <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '6px' }}>
                BOWLER AGE GROUP:
              </label>
              <select
                value={calcAgeGroup}
                onChange={e => setCalcAgeGroup(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: D.sm,
                  background: D.surf1,
                  border: `1px solid ${D.border}`,
                  color: D.textPrimary,
                  fontFamily: D.body,
                  fontSize: '13px',
                }}
              >
                <option value="U14">U14 (Max 5/spell, 10/day)</option>
                <option value="U15">U15 (Max 6/spell, 12/day)</option>
                <option value="U16">U16 (Max 6/spell, 14/day)</option>
                <option value="Open">Open 1st XI (Max 7/spell, 16/day)</option>
              </select>
            </div>

            {/* Current Spell Overs Slider */}
            <div style={{ padding: '14px', background: D.surf2, borderRadius: D.md }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>
                <span>CURRENT SPELL OVERS</span>
                <strong style={{ color: isSpellBreached ? D.rose : D.textPrimary }}>{currentSpellOvers} Overs</strong>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={currentSpellOvers}
                onChange={e => setCurrentSpellOvers(Number(e.target.value))}
                style={{ width: '100%', marginTop: '8px' }}
              />
              <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, marginTop: '4px' }}>
                Legal Max: {currentLimit.maxSpell} overs per spell
              </div>
            </div>

            {/* Total Overs Today Slider */}
            <div style={{ padding: '14px', background: D.surf2, borderRadius: D.md }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>
                <span>TOTAL OVERS TODAY</span>
                <strong style={{ color: isDailyBreached ? D.rose : D.textPrimary }}>{totalOversToday} Overs</strong>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={totalOversToday}
                onChange={e => setTotalOversToday(Number(e.target.value))}
                style={{ width: '100%', marginTop: '8px' }}
              />
              <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, marginTop: '4px' }}>
                Legal Max: {currentLimit.maxDaily} overs per day
              </div>
            </div>
          </div>

          {/* Real-time Telemetry Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '16px', background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}` }}>
              <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>LEGAL OVERS REMAINING TODAY</div>
              <div style={{ fontFamily: D.head, fontSize: '24px', fontWeight: 800, color: dailyOversRemaining > 0 ? D.emerald : D.rose }}>
                {dailyOversRemaining} Overs
              </div>
              <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary, marginTop: '4px' }}>
                {dailyOversRemaining === 0 ? 'Quota fully exhausted for the day' : `Safe to bowl up to ${dailyOversRemaining} more overs`}
              </div>
            </div>

            <div style={{ padding: '16px', background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}` }}>
              <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>MANDATORY SPELL REST REQUIRED</div>
              <div style={{ fontFamily: D.head, fontSize: '24px', fontWeight: 800, color: D.sky }}>
                {currentSpellOvers * 2} Overs Rest
              </div>
              <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary, marginTop: '4px' }}>
                Must rest double the spell duration (or min 30 mins) before bowling again
              </div>
            </div>

            <div style={{ padding: '16px', background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}` }}>
              <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>LEGAL PENALTY STATUS</div>
              <div style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: isBreached ? D.rose : D.emerald, marginTop: '6px' }}>
                {isBreached ? '10 Penalty Runs + Bowler Suspended' : 'No Penalties Incurred'}
              </div>
              <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary, marginTop: '4px' }}>
                Governed under CSA Youth Policy Section 4.1 Clause 5
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE MODULE 2: UMPIRE DECISION SIMULATOR (SCENARIO QUIZ)           */}
      {/* ========================================================================= */}
      {activeTab === 'scenario_quiz' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '16px 20px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}` }}>
            <div style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800, color: D.textPrimary }}>
              ⚖️ Match Adjudication & Umpire Scenario Simulator
            </div>
            <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted, marginTop: '2px' }}>
              Test your knowledge on complex match-day disputes, player safety dilemmas, and high-pressure rule interpretations
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {ADJUDICATION_SCENARIOS.map((sc, idx) => {
              const selectedOptIndex = quizAnswers[sc.id];

              return (
                <div
                  key={sc.id}
                  style={{
                    padding: '20px',
                    background: D.surf1,
                    borderRadius: D.lg,
                    border: `1px solid ${D.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.sky }}>
                      SCENARIO 0{idx + 1}: {sc.title}
                    </span>
                    <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                      RULE: {sc.ruleCode}
                    </span>
                  </div>

                  <p style={{ fontFamily: D.body, fontSize: '13px', color: D.textPrimary, lineHeight: 1.6, margin: 0 }}>
                    {sc.scenarioText}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sc.options.map((opt, optIdx) => {
                      const isChosen = selectedOptIndex === optIdx;

                      return (
                        <div
                          key={optIdx}
                          onClick={() => setQuizAnswers(prev => ({ ...prev, [sc.id]: optIdx }))}
                          style={{
                            padding: '12px 16px',
                            borderRadius: D.md,
                            background: isChosen
                              ? opt.isCorrect ? `${D.emerald}20` : `${D.rose}20`
                              : D.surf2,
                            border: `1px solid ${isChosen ? (opt.isCorrect ? D.emerald : D.rose) : D.border}`,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontFamily: D.mono, fontSize: '12px', fontWeight: 800, color: isChosen ? (opt.isCorrect ? D.emerald : D.rose) : D.textMuted }}>
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span style={{ fontFamily: D.body, fontSize: '13px', color: D.textPrimary }}>
                              {opt.text}
                            </span>
                          </div>

                          {isChosen && (
                            <div style={{ fontFamily: D.body, fontSize: '12px', color: opt.isCorrect ? D.emerald : D.rose, marginTop: '4px', paddingLeft: '22px' }}>
                              {opt.feedback}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE MODULE 3: DEMERIT & DISCIPLINARY MATRIX                       */}
      {/* ========================================================================= */}
      {activeTab === 'demerit_calc' && (
        <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <div style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.textPrimary }}>
              🚨 Interactive Disciplinary Sanction & Demerit Point Calculator
            </div>
            <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted }}>
              Select offense levels and specific breaches to evaluate disciplinary hearing tiers and suspension durations
            </div>
          </div>

          {/* Level Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {offenseMatrix.map(lvl => (
              <button
                key={lvl.level}
                onClick={() => {
                  setSelectedOffenseLevel(lvl.level);
                  setSelectedOffenseIndex(0);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: D.pill,
                  background: selectedOffenseLevel === lvl.level ? D.indigo : D.surf2,
                  border: `1px solid ${selectedOffenseLevel === lvl.level ? D.indigo : D.border}`,
                  color: selectedOffenseLevel === lvl.level ? '#fff' : D.textSecondary,
                  fontFamily: D.head,
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Level {lvl.level}
              </button>
            ))}
          </div>

          {/* Offense Selector */}
          <div style={{ padding: '16px', background: D.surf2, borderRadius: D.md, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
              {activeLevelData.name}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeLevelData.offenses.map((off, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedOffenseIndex(idx)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: D.sm,
                    background: selectedOffenseIndex === idx ? D.surf1 : 'transparent',
                    border: `1px solid ${selectedOffenseIndex === idx ? D.indigo : 'transparent'}`,
                    cursor: 'pointer',
                    fontFamily: D.body,
                    fontSize: '13px',
                    color: D.textPrimary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <span style={{ color: D.sky }}>•</span>
                  <span>{off}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Computed Sanction Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '16px', background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}` }}>
              <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>DEMERIT POINTS ASSIGNED</div>
              <div style={{ fontFamily: D.head, fontSize: '24px', fontWeight: 800, color: D.amber }}>
                +{activeLevelData.demerits} Points
              </div>
              <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary, marginTop: '4px' }}>
                Accumulates on 12-month rolling license
              </div>
            </div>

            <div style={{ padding: '16px', background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}` }}>
              <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>MANDATORY SANCTION</div>
              <div style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.rose, marginTop: '4px' }}>
                {activeLevelData.sanction}
              </div>
              <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary, marginTop: '4px' }}>
                Immediate match report submission required within 12 hours
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STANDARD RULES ACCORDION VIEW                                             */}
      {/* ========================================================================= */}
      {activeTab === 'rules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Search & Category Filter Bar */}
          <div
            style={{
              padding: '16px',
              background: D.surf1,
              borderRadius: D.lg,
              border: `1px solid ${D.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search regulations, MCC Laws, fast bowling limits, or demerit points..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  flex: '1 1 300px',
                  padding: '10px 14px',
                  background: D.surf2,
                  border: `1px solid ${D.border}`,
                  borderRadius: D.md,
                  color: D.textPrimary,
                  fontFamily: D.body,
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    padding: '10px 16px',
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    borderRadius: D.md,
                    color: D.textMuted,
                    cursor: 'pointer',
                    fontFamily: D.head,
                    fontSize: '11px',
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Categories */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: D.pill,
                    background: selectedCategory === cat ? D.indigo : D.surf2,
                    border: `1px solid ${selectedCategory === cat ? D.indigo : D.border}`,
                    color: selectedCategory === cat ? '#fff' : D.textMuted,
                    fontFamily: D.head,
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Rules Accordion List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredRules.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', background: D.surf1, borderRadius: D.lg, color: D.textMuted, fontFamily: D.body }}>
                No regulatory clauses match your search term &ldquo;{searchQuery}&rdquo;.
              </div>
            ) : (
              filteredRules.map(rule => {
                const isExpanded = expandedClauseId === rule.id;
                return (
                  <div
                    key={rule.id}
                    style={{
                      background: D.surf1,
                      borderRadius: D.lg,
                      border: `1px solid ${isExpanded ? D.indigo : D.border}`,
                      overflow: 'hidden',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    {/* Clause Summary Header */}
                    <div
                      onClick={() => setExpandedClauseId(isExpanded ? null : rule.id)}
                      style={{
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        background: isExpanded ? `${D.indigo}10` : 'transparent',
                        userSelect: 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                        <span
                          onClick={e => {
                            e.stopPropagation();
                            handleCopyCode(rule.code);
                          }}
                          title="Click to copy rule code"
                          style={{
                            padding: '3px 8px',
                            background: D.surf2,
                            borderRadius: D.sm,
                            border: `1px solid ${D.border}`,
                            fontFamily: D.mono,
                            fontSize: '11px',
                            fontWeight: 700,
                            color: D.sky,
                            cursor: 'pointer',
                          }}
                        >
                          {copiedCode === rule.code ? 'COPIED!' : rule.code}
                        </span>

                        <span style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary }}>
                          {rule.title}
                        </span>

                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: D.pill,
                            background:
                              rule.severity === 'Mandatory'
                                ? `${D.rose}20`
                                : rule.severity === 'Penalty Enforced'
                                ? `${D.amber}20`
                                : `${D.emerald}20`,
                            color:
                              rule.severity === 'Mandatory'
                                ? D.rose
                                : rule.severity === 'Penalty Enforced'
                                ? D.amber
                                : D.emerald,
                            fontFamily: D.mono,
                            fontSize: '9px',
                            fontWeight: 800,
                          }}
                        >
                          {rule.severity || 'Guideline'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                          {rule.applicableAges}
                        </span>
                        <span style={{ fontSize: '14px', color: D.textMuted, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                          ▼
                        </span>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div style={{ padding: '0 20px 20px 20px', borderTop: `1px solid ${D.border}`, paddingTop: '16px' }}>
                        <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textSecondary, marginBottom: '14px', fontStyle: 'italic' }}>
                          {rule.summary}
                        </div>

                        <div
                          style={{
                            padding: '16px',
                            background: D.surf2,
                            borderRadius: D.md,
                            fontFamily: D.mono,
                            fontSize: '12px',
                            color: D.textPrimary,
                            lineHeight: 1.8,
                            whiteSpace: 'pre-line',
                          }}
                        >
                          {rule.fullText}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
                          <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                            CATEGORY: <strong style={{ color: D.textSecondary }}>{rule.category}</strong> · JURISDICTION: <strong>KZN HIGH SCHOOLS CODE</strong>
                          </span>
                          <button
                            onClick={() => handleCopyCode(`${rule.code} - ${rule.title}\n\n${rule.fullText}`)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: D.pill,
                              background: 'transparent',
                              border: `1px solid ${D.border}`,
                              color: D.textSecondary,
                              fontFamily: D.head,
                              fontSize: '10px',
                              cursor: 'pointer',
                            }}
                          >
                            📋 Copy Official Text
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
