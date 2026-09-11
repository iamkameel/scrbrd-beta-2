export interface DismissalStat {
  dismissals: number;
  avg: number;
  dotPct: number;
}

export interface BatterScoutProfile {
  id: string;
  name: string;
  number: number;
  role: string;
  battingStance: 'RHB' | 'LHB';
  seasonAvg: number;
  strikeRate: number;
  boundaryPct: number;
  dotBallPct: number;
  primaryScoringZone: string;
  keyWeakness: string;
  tacticalPlan: string;
  recommendedField: string;
  recommendedBowlerType: string;
  dismissalsByBowlingType: {
    rightArmPace: DismissalStat;
    leftArmPace: DismissalStat;
    offSpin: DismissalStat;
    legSpin: DismissalStat;
    leftArmOrthodox: DismissalStat;
  };
  pitchVulnerabilityHotspot: {
    line: 'wide_off' | '4th_stump' | 'off_stump' | 'middle_leg' | 'down_leg';
    length: 'yorker' | 'good_length' | 'back_of_length' | 'short';
    riskPct: number;
  };
}

export interface BowlerScoutProfile {
  id: string;
  name: string;
  number: number;
  bowlingStyle: string;
  avgSpeedKmH: number;
  stockBall: string;
  wicketBall: string;
  deathVariation: string;
  economyPowerplay: number;
  economyMiddle: number;
  economyDeath: number;
  counterStrategy: string;
}

export interface PhaseTendency {
  runRate: number;
  dotBallPct: number;
  boundaryPct: number;
  wicketsLostAvg: number;
  primaryAttackZones: string[];
  tacticalAdvice: string;
}

export interface OppositionDossier {
  id: string;
  schoolName: string;
  shortName: string;
  homeGround: string;
  captain: string;
  headCoach: string;
  accentColor: string;
  overallRating: number;
  recentForm: ('W' | 'L' | 'D' | 'T')[];
  pitchCharacteristics: string;
  keyBattingThreatsSummary: string;
  exploitableVulnerabilitiesSummary: string;
  bowlingAttackOverview: string;
  tacticalKeyDirectives: string[];
  batters: BatterScoutProfile[];
  bowlers: BowlerScoutProfile[];
  phaseTendencies: {
    powerplay: PhaseTendency;
    middle: PhaseTendency;
    death: PhaseTendency;
  };
}

export const OPPOSITION_DOSSIERS: OppositionDossier[] = [
  {
    id: 'hilton',
    schoolName: 'Hilton College 1st XI',
    shortName: 'Hilton',
    homeGround: 'Weightman-Smith Oval',
    captain: 'Jonathan van Zyl',
    headCoach: 'Dale Benkenstein',
    accentColor: '#1e3a8a',
    overallRating: 91,
    recentForm: ['W', 'W', 'W', 'L', 'W'],
    pitchCharacteristics: 'True bounce, high morning moisture providing lateral seam (+1.8° seam deviation) until lunch, lightning-fast outfield.',
    keyBattingThreatsSummary: 'Explosive top 3; score heavily against right-arm medium pace in Powerplay (8.8 RPO). Excellent pullers of the short ball.',
    exploitableVulnerabilitiesSummary: 'High false shot frequency (38%) against Left-Arm Orthodox spin drifting across the right-handers between overs 7-14.',
    bowlingAttackOverview: 'Frontline pace attack averaging 128-134 km/h with steep bounce. Weakness in 5th bowler quota (concedes 8.9 RPO).',
    tacticalKeyDirectives: [
      'Bowl back-of-a-length 4th stump channel to van Zyl with deep point & backward point saving 1.',
      'Deploy Left-Arm Spin early in over 6 to throttle middle-overs run rate.',
      'Target Henderson with straight drives; he over-pitches when looking for swing.',
      'Protect square boundaries on weightman-smith slope.',
    ],
    batters: [
      {
        id: 'h_bat_1',
        name: 'Jonathan van Zyl',
        number: 7,
        role: 'Top Order Anchor / Aggressor',
        battingStance: 'RHB',
        seasonAvg: 58.4,
        strikeRate: 142.6,
        boundaryPct: 64,
        dotBallPct: 34,
        primaryScoringZone: 'Extra Cover & Mid-Wicket',
        keyWeakness: 'Prods tentatively at 4th stump out-swing when moving feet forward.',
        tacticalPlan: 'Tempt with full outswinger outside off with 2 slips and deep extra cover.',
        recommendedField: '2 Slips, Gully, Deep Cover, Long-off, Deep Mid-Wicket',
        recommendedBowlerType: 'Right-Arm Fast Outswing',
        dismissalsByBowlingType: {
          rightArmPace: { dismissals: 4, avg: 32.0, dotPct: 36 },
          leftArmPace: { dismissals: 2, avg: 44.0, dotPct: 28 },
          offSpin: { dismissals: 1, avg: 62.0, dotPct: 22 },
          legSpin: { dismissals: 2, avg: 28.5, dotPct: 42 },
          leftArmOrthodox: { dismissals: 5, avg: 19.4, dotPct: 52 },
        },
        pitchVulnerabilityHotspot: {
          line: '4th_stump',
          length: 'good_length',
          riskPct: 82,
        },
      },
      {
        id: 'h_bat_2',
        name: 'Matthew Boast',
        number: 11,
        role: 'Power All-Rounder',
        battingStance: 'RHB',
        seasonAvg: 41.2,
        strikeRate: 168.0,
        boundaryPct: 76,
        dotBallPct: 44,
        primaryScoringZone: 'Long-on to Cow Corner',
        keyWeakness: 'Susceptible to steep bouncers directed into the badge and throat.',
        tacticalPlan: 'Bowl 8.5m ribcage bouncers with deep square leg and fine leg out.',
        recommendedField: 'Deep Square Leg, Deep Fine Leg, Long-on, Deep Mid-Wicket',
        recommendedBowlerType: 'Right-Arm Express Bouncer',
        dismissalsByBowlingType: {
          rightArmPace: { dismissals: 5, avg: 22.0, dotPct: 46 },
          leftArmPace: { dismissals: 3, avg: 26.0, dotPct: 40 },
          offSpin: { dismissals: 2, avg: 38.0, dotPct: 30 },
          legSpin: { dismissals: 1, avg: 52.0, dotPct: 25 },
          leftArmOrthodox: { dismissals: 2, avg: 35.0, dotPct: 38 },
        },
        pitchVulnerabilityHotspot: {
          line: 'middle_leg',
          length: 'short',
          riskPct: 78,
        },
      },
      {
        id: 'h_bat_3',
        name: 'Liam Campbell',
        number: 3,
        role: 'Left-Hand Stroke Player',
        battingStance: 'LHB',
        seasonAvg: 46.5,
        strikeRate: 124.0,
        boundaryPct: 48,
        dotBallPct: 42,
        primaryScoringZone: 'Point & Square Cut',
        keyWeakness: 'Struggles with off-spin drifting away towards off-stump from over the wicket.',
        tacticalPlan: 'Off-spinner from around the wicket pitching on off-and-middle turning away.',
        recommendedField: 'Short 3rd Man, Backward Point, Slip, Long-off, Deep Cover',
        recommendedBowlerType: 'Right-Arm Off-Break',
        dismissalsByBowlingType: {
          rightArmPace: { dismissals: 2, avg: 48.0, dotPct: 32 },
          leftArmPace: { dismissals: 1, avg: 55.0, dotPct: 28 },
          offSpin: { dismissals: 6, avg: 16.5, dotPct: 58 },
          legSpin: { dismissals: 1, avg: 42.0, dotPct: 30 },
          leftArmOrthodox: { dismissals: 1, avg: 45.0, dotPct: 34 },
        },
        pitchVulnerabilityHotspot: {
          line: 'off_stump',
          length: 'good_length',
          riskPct: 86,
        },
      },
    ],
    bowlers: [
      {
        id: 'h_bowl_1',
        name: 'Kyle Henderson',
        number: 18,
        bowlingStyle: 'Right-Arm Fast',
        avgSpeedKmH: 133,
        stockBall: 'Heavy deck ball on 4th stump angling in',
        wicketBall: 'Sharp 134 km/h bouncer hitting ribcage',
        deathVariation: 'Wide dipping yorker outside off',
        economyPowerplay: 5.6,
        economyMiddle: 6.2,
        economyDeath: 8.4,
        counterStrategy: 'Step across and work behind square leg on hip; avoid driving on the up in first 3 overs.',
      },
      {
        id: 'h_bowl_2',
        name: 'Ethan Meyer',
        number: 22,
        bowlingStyle: 'Left-Arm Orthodox Spin',
        avgSpeedKmH: 86,
        stockBall: 'Flighted arm ball drifting in, turning away',
        wicketBall: 'Undercut slider holding its line onto off-stump',
        deathVariation: 'Flat 94 km/h dart at batter toes',
        economyPowerplay: 6.8,
        economyMiddle: 4.8,
        economyDeath: 9.1,
        counterStrategy: 'Use feet to come down pitch and hit straight down the ground; do not cut off middle stump.',
      },
    ],
    phaseTendencies: {
      powerplay: {
        runRate: 8.8,
        dotBallPct: 42,
        boundaryPct: 24,
        wicketsLostAvg: 1.1,
        primaryAttackZones: ['Extra Cover', 'Mid-Wicket Loft', 'Fine Leg Flick'],
        tacticalAdvice: 'Post boundary riders at deep point and long-on immediately; avoid standard 2-slip attack past over 2.',
      },
      middle: {
        runRate: 6.2,
        dotBallPct: 48,
        boundaryPct: 14,
        wicketsLostAvg: 2.6,
        primaryAttackZones: ['Cover Sweep', 'Mid-Wicket Push', 'Straight V'],
        tacticalAdvice: 'Build dot pressure with twin spinners; 74% of their dismissals occur when RPO falls below 5.5.',
      },
      death: {
        runRate: 11.2,
        dotBallPct: 26,
        boundaryPct: 32,
        wicketsLostAvg: 3.4,
        primaryAttackZones: ['Cow Corner', 'Square Ramp', 'Long-off'],
        tacticalAdvice: 'Wide yorkers and slow off-cutters outside off stump are 82% effective at preventing boundaries.',
      },
    },
  },
  {
    id: 'bishops',
    schoolName: 'Bishops Diocesan College 1st XI',
    shortName: 'Bishops',
    homeGround: 'Frank Reid Oval',
    captain: 'Kashief Joseph',
    headCoach: 'Bradley Player',
    accentColor: '#831843',
    overallRating: 89,
    recentForm: ['W', 'W', 'L', 'W', 'W'],
    pitchCharacteristics: 'High-scoring Frank Reid track with short square boundaries, low variable bounce in afternoon session.',
    keyBattingThreatsSummary: 'Dominant 360-degree sweepers; score at 9.4 RPO when facing finger-spin.',
    exploitableVulnerabilitiesSummary: 'Prone to collapses against skiddy 125+ km/h pace bowling into the stumps.',
    bowlingAttackOverview: 'Disciplined seam attack that relies on building dot ball pressure outside off-stump.',
    tacticalKeyDirectives: [
      'Maintain short fine leg and backward square leg to eliminate the reverse-sweep.',
      'Fast bowlers bowl back of length at the stumps; do not offer width on short boundary side.',
      'Attack the number 5 and 6 batsmen immediately with front-line quicks.',
    ],
    batters: [
      {
        id: 'b_bat_1',
        name: 'Kashief Joseph',
        number: 4,
        role: 'Dynamic Stroke Maker / Captain',
        battingStance: 'RHB',
        seasonAvg: 52.8,
        strikeRate: 154.2,
        boundaryPct: 70,
        dotBallPct: 31,
        primaryScoringZone: 'Backward Point & Fine Sweep',
        keyWeakness: 'Premeditates the paddle sweep when spinners bowl straight.',
        tacticalPlan: 'Fire full yorker-length leg breaks into leg-stump when he crouches to sweep.',
        recommendedField: 'Short Fine Leg, Deep Square Leg, Backward Point, Sweeper Cover',
        recommendedBowlerType: 'Right-Arm Wrist Spin',
        dismissalsByBowlingType: {
          rightArmPace: { dismissals: 3, avg: 38.0, dotPct: 34 },
          leftArmPace: { dismissals: 1, avg: 64.0, dotPct: 26 },
          offSpin: { dismissals: 2, avg: 42.0, dotPct: 28 },
          legSpin: { dismissals: 4, avg: 22.5, dotPct: 48 },
          leftArmOrthodox: { dismissals: 2, avg: 36.0, dotPct: 35 },
        },
        pitchVulnerabilityHotspot: {
          line: 'middle_leg',
          length: 'yorker',
          riskPct: 88,
        },
      },
      {
        id: 'b_bat_2',
        name: 'Alexander Louw',
        number: 8,
        role: 'Top Order Opener',
        battingStance: 'LHB',
        seasonAvg: 39.4,
        strikeRate: 122.0,
        boundaryPct: 44,
        dotBallPct: 46,
        primaryScoringZone: 'Cover Drive & Mid-Off',
        keyWeakness: 'Drives loosely at balls moving away outside off without footwork.',
        tacticalPlan: 'Hold 4th stump good length line; bowl seamers angled across.',
        recommendedField: '2 Slips, Gully, Backward Point, Mid-Off',
        recommendedBowlerType: 'Left-Arm Fast / Right-Arm Angle',
        dismissalsByBowlingType: {
          rightArmPace: { dismissals: 4, avg: 24.0, dotPct: 42 },
          leftArmPace: { dismissals: 3, avg: 19.5, dotPct: 52 },
          offSpin: { dismissals: 2, avg: 34.0, dotPct: 36 },
          legSpin: { dismissals: 1, avg: 45.0, dotPct: 30 },
          leftArmOrthodox: { dismissals: 1, avg: 50.0, dotPct: 28 },
        },
        pitchVulnerabilityHotspot: {
          line: '4th_stump',
          length: 'good_length',
          riskPct: 84,
        },
      },
    ],
    bowlers: [
      {
        id: 'b_bowl_1',
        name: 'Tiaan Louw',
        number: 14,
        bowlingStyle: 'Right-Arm Fast-Medium',
        avgSpeedKmH: 127,
        stockBall: 'In-dipper pitching 5th stump heading towards middle',
        wicketBall: 'Slower ball off-cutter dropping short of length',
        deathVariation: 'Back of the hand slower ball',
        economyPowerplay: 5.2,
        economyMiddle: 5.9,
        economyDeath: 9.6,
        counterStrategy: 'Wait for slower variations and hit in front of square; avoid driving against inward seam movement early.',
      },
    ],
    phaseTendencies: {
      powerplay: {
        runRate: 8.2,
        dotBallPct: 40,
        boundaryPct: 22,
        wicketsLostAvg: 1.3,
        primaryAttackZones: ['Square Leg Flick', 'Cover Drive', 'Third Man Edge'],
        tacticalAdvice: 'Do not feed width; keep third man back and plug cover boundary.',
      },
      middle: {
        runRate: 7.4,
        dotBallPct: 36,
        boundaryPct: 18,
        wicketsLostAvg: 2.1,
        primaryAttackZones: ['Reverse Sweep', 'Mid-Wicket Pull', 'Long-on Drive'],
        tacticalAdvice: 'Bowl straight and full to induce mistimed sweeps.',
      },
      death: {
        runRate: 10.4,
        dotBallPct: 32,
        boundaryPct: 28,
        wicketsLostAvg: 3.8,
        primaryAttackZones: ['Fine Leg Ramp', 'Cow Corner', 'Extra Cover'],
        tacticalAdvice: 'Execute hard yorkers on middle-stump line.',
      },
    },
  },
  {
    id: 'rondebosch',
    schoolName: "Rondebosch Boys' High 1st XI",
    shortName: 'Rondebosch',
    homeGround: "Tinker's Oval",
    captain: 'Daniel Bosman',
    headCoach: 'Sean Phillips',
    accentColor: '#047857',
    overallRating: 93,
    recentForm: ['W', 'W', 'W', 'W', 'L'],
    pitchCharacteristics: 'Firm Cape wicket with good carry and bounce; favours back-foot strokeplay.',
    keyBattingThreatsSummary: 'Elite depth with top 7 all averaging over 35; high conversion of singles into doubles.',
    exploitableVulnerabilitiesSummary: 'Struggle when pressured by disciplined leg-spin turning away from the right hand.',
    bowlingAttackOverview: 'Most lethal pace quartet in Western Province schools; bowl high percentage of wicket-taking deliveries.',
    tacticalKeyDirectives: [
      'Bowlers must bowl tight fuller lengths; giving width allows Bosman to cut aggressively.',
      'Deploy 2 catching covers during middle overs to catch lofted drives against spin.',
      'Run hard when batting; pressure their sub fielders on the deep boundary.',
    ],
    batters: [
      {
        id: 'rb_bat_1',
        name: 'Daniel Bosman',
        number: 10,
        role: 'Top Order Stroke Maker / Captain',
        battingStance: 'RHB',
        seasonAvg: 61.5,
        strikeRate: 138.0,
        boundaryPct: 62,
        dotBallPct: 32,
        primaryScoringZone: 'Point, Cover & Mid-Off',
        keyWeakness: 'Impatient against continuous dot balls outside off; flashes at wide deliveries.',
        tacticalPlan: 'Bowl 6th stump back-of-a-length channel with backward point and deep cover.',
        recommendedField: 'Deep Backward Point, Sweeper Cover, Slip, Mid-Off, Long-On',
        recommendedBowlerType: 'Right-Arm Fast Back-of-Length',
        dismissalsByBowlingType: {
          rightArmPace: { dismissals: 2, avg: 52.0, dotPct: 30 },
          leftArmPace: { dismissals: 2, avg: 48.0, dotPct: 32 },
          offSpin: { dismissals: 1, avg: 65.0, dotPct: 24 },
          legSpin: { dismissals: 5, avg: 21.0, dotPct: 54 },
          leftArmOrthodox: { dismissals: 2, avg: 42.0, dotPct: 36 },
        },
        pitchVulnerabilityHotspot: {
          line: 'wide_off',
          length: 'back_of_length',
          riskPct: 80,
        },
      },
    ],
    bowlers: [
      {
        id: 'rb_bowl_1',
        name: 'Graeme Cloete',
        number: 99,
        bowlingStyle: 'Right-Arm Express',
        avgSpeedKmH: 136,
        stockBall: 'Late away-swing at 134 km/h targeting 4th stump',
        wicketBall: 'Heavy yorker spearing into toes',
        deathVariation: 'Knuckle-ball slower delivery on off-stump',
        economyPowerplay: 4.8,
        economyMiddle: 5.4,
        economyDeath: 7.9,
        counterStrategy: 'Stand outside crease to negate swing; play with soft hands to avoid slip catches.',
      },
    ],
    phaseTendencies: {
      powerplay: {
        runRate: 8.6,
        dotBallPct: 38,
        boundaryPct: 26,
        wicketsLostAvg: 0.9,
        primaryAttackZones: ['Extra Cover Loft', 'Square Cut', 'Pull Shot'],
        tacticalAdvice: 'Attack with pace and bouncers to push them onto back foot.',
      },
      middle: {
        runRate: 7.1,
        dotBallPct: 42,
        boundaryPct: 16,
        wicketsLostAvg: 1.8,
        primaryAttackZones: ['Drive to Long-off', 'Sweep', 'Mid-Wicket Working'],
        tacticalAdvice: 'Leg-spinners bowl slow and loopy outside off-stump.',
      },
      death: {
        runRate: 11.8,
        dotBallPct: 24,
        boundaryPct: 34,
        wicketsLostAvg: 2.9,
        primaryAttackZones: ['Straight Hit', 'Cow Corner', 'Fine Leg Scoop'],
        tacticalAdvice: 'Execute wide-line yorkers; avoid straight fuller balls.',
      },
    },
  },
  {
    id: 'sacs',
    schoolName: 'SACS 1st XI',
    shortName: 'SACS',
    homeGround: 'Memorial Oval',
    captain: 'Luka Cloete',
    headCoach: 'Brendan Kleynhans',
    accentColor: '#1e40af',
    overallRating: 88,
    recentForm: ['W', 'L', 'W', 'W', 'W'],
    pitchCharacteristics: 'Historic Memorial Oval surface with generous pace and true bounce early, slowing down by tea.',
    keyBattingThreatsSummary: 'Disciplined accumulator top order with low dismissal rates before over 15.',
    exploitableVulnerabilitiesSummary: 'Lowest boundary rate in the top 5 schools; vulnerable to disciplined dot ball choke.',
    bowlingAttackOverview: 'High control spin tandem in middle overs averaging only 4.4 RPO.',
    tacticalKeyDirectives: [
      'Squeeze the singles in overs 6-15 with tight ring fielders inside the 30-yard circle.',
      'Target Cloete early with sharp in-swing to test front-pad defense.',
      'Take advantage of their aggressive death bowling by utilizing square ramps.',
    ],
    batters: [
      {
        id: 'sacs_bat_1',
        name: 'Luka Cloete',
        number: 5,
        role: 'Top Order Anchor',
        battingStance: 'RHB',
        seasonAvg: 48.0,
        strikeRate: 118.5,
        boundaryPct: 38,
        dotBallPct: 44,
        primaryScoringZone: 'Mid-Wicket & Straight Drive',
        keyWeakness: 'Shuffles across his stumps and is prone to LBW against full straight deliveries.',
        tacticalPlan: 'Target base of leg/middle stump with full inswing at 130 km/h.',
        recommendedField: 'Mid-On, Mid-Off, Square Leg, Short Mid-Wicket, Backward Point',
        recommendedBowlerType: 'Right-Arm Fast Inswing',
        dismissalsByBowlingType: {
          rightArmPace: { dismissals: 5, avg: 24.0, dotPct: 48 },
          leftArmPace: { dismissals: 2, avg: 38.0, dotPct: 38 },
          offSpin: { dismissals: 1, avg: 45.0, dotPct: 35 },
          legSpin: { dismissals: 2, avg: 32.0, dotPct: 40 },
          leftArmOrthodox: { dismissals: 1, avg: 52.0, dotPct: 30 },
        },
        pitchVulnerabilityHotspot: {
          line: 'middle_leg',
          length: 'yorker',
          riskPct: 85,
        },
      },
    ],
    bowlers: [
      {
        id: 'sacs_bowl_1',
        name: 'Reza Salie',
        number: 17,
        bowlingStyle: 'Right-Arm Leg-Break / Googly',
        avgSpeedKmH: 82,
        stockBall: 'Sharp turning leg-break with heavy top-spin',
        wicketBall: 'Hidden googly drifting in and spinning sharply through the gate',
        deathVariation: 'Quick flatter slider on middle stump',
        economyPowerplay: 6.4,
        economyMiddle: 4.2,
        economyDeath: 8.8,
        counterStrategy: 'Pick the googly out of the hand (back of hand release); play with straight bat down the ground.',
      },
    ],
    phaseTendencies: {
      powerplay: {
        runRate: 7.4,
        dotBallPct: 46,
        boundaryPct: 18,
        wicketsLostAvg: 1.4,
        primaryAttackZones: ['Cover Drive', 'Straight Push', 'Mid-Wicket Clip'],
        tacticalAdvice: 'Attack stumps with full swingers to exploit technical flaws.',
      },
      middle: {
        runRate: 6.0,
        dotBallPct: 52,
        boundaryPct: 12,
        wicketsLostAvg: 2.2,
        primaryAttackZones: ['Sweeps', 'Singles to Long-on/Long-off'],
        tacticalAdvice: 'Keep boundary riders at deep mid-wicket and sweeper cover.',
      },
      death: {
        runRate: 9.8,
        dotBallPct: 34,
        boundaryPct: 24,
        wicketsLostAvg: 3.2,
        primaryAttackZones: ['Straight Loft', 'Pull Over Square Leg'],
        tacticalAdvice: 'Bowl off-cutters into pitch to grip on worn surface.',
      },
    },
  },
  {
    id: 'northwood',
    schoolName: 'Northwood School 1st XI',
    shortName: 'Northwood',
    homeGround: 'Northwood Main Oval',
    captain: 'Ryan Brand',
    headCoach: 'Morné van Vuuren',
    accentColor: '#059669',
    overallRating: 87,
    recentForm: ['L', 'W', 'W', 'L', 'W'],
    pitchCharacteristics: 'Coastal humidity providing swing throughout the innings; slow turning pitch in second session.',
    keyBattingThreatsSummary: 'Ryan Brand anchors heavily (avg 54.2), punishing half-volleys through extra cover.',
    exploitableVulnerabilitiesSummary: 'Top order vulnerable to late in-swing targeting pads between overs 1-4.',
    bowlingAttackOverview: 'L. Marais creates steep diagonal angles across right-handers.',
    tacticalKeyDirectives: [
      'Set deep mid-wicket & long-on for Brand; bowl tight fuller back of length.',
      'Introduce left-arm spin early to exploit their RHB-heavy top order.',
      'Bowl straight and fast at the tail-enders from over 16 onwards.',
    ],
    batters: [
      {
        id: 'nw_bat_1',
        name: 'Ryan Brand',
        number: 1,
        role: 'Top Order Accumulator',
        battingStance: 'RHB',
        seasonAvg: 54.2,
        strikeRate: 128.4,
        boundaryPct: 52,
        dotBallPct: 36,
        primaryScoringZone: 'Extra Cover & Mid-Off',
        keyWeakness: 'Struggles when denied width on front-foot drives.',
        tacticalPlan: 'Bowl cramp line at off-and-middle with deep mid-on and deep cover.',
        recommendedField: 'Deep Extra Cover, Deep Mid-On, Backward Point, Mid-Wicket',
        recommendedBowlerType: 'Right-Arm Fast Tight Line',
        dismissalsByBowlingType: {
          rightArmPace: { dismissals: 3, avg: 36.0, dotPct: 38 },
          leftArmPace: { dismissals: 4, avg: 22.0, dotPct: 48 },
          offSpin: { dismissals: 1, avg: 58.0, dotPct: 28 },
          legSpin: { dismissals: 2, avg: 34.0, dotPct: 36 },
          leftArmOrthodox: { dismissals: 3, avg: 28.0, dotPct: 44 },
        },
        pitchVulnerabilityHotspot: {
          line: 'off_stump',
          length: 'good_length',
          riskPct: 76,
        },
      },
    ],
    bowlers: [
      {
        id: 'nw_bowl_1',
        name: 'Liam Marais',
        number: 12,
        bowlingStyle: 'Left-Arm Fast-Medium',
        avgSpeedKmH: 129,
        stockBall: 'Sharp angle across right-handers leaving off-stump',
        wicketBall: 'Rapid incoming yorker angling into right-hander pads',
        deathVariation: 'Wide cutter outside off',
        economyPowerplay: 5.4,
        economyMiddle: 6.0,
        economyDeath: 9.2,
        counterStrategy: 'Open stance slightly to play through mid-wicket; do not play away from body.',
      },
    ],
    phaseTendencies: {
      powerplay: {
        runRate: 7.8,
        dotBallPct: 44,
        boundaryPct: 20,
        wicketsLostAvg: 1.2,
        primaryAttackZones: ['Extra Cover Drive', 'Flick through Mid-Wicket'],
        tacticalAdvice: 'Attack with left-arm fast to create angular uncertainty.',
      },
      middle: {
        runRate: 6.4,
        dotBallPct: 46,
        boundaryPct: 14,
        wicketsLostAvg: 2.0,
        primaryAttackZones: ['Working through Square Leg', 'Straight Push'],
        tacticalAdvice: 'Keep fielders in ring saving single.',
      },
      death: {
        runRate: 10.2,
        dotBallPct: 30,
        boundaryPct: 28,
        wicketsLostAvg: 3.5,
        primaryAttackZones: ['Long-on Hit', 'Cow Corner'],
        tacticalAdvice: 'Bowl fuller slower balls outside off-stump.',
      },
    },
  },
];
