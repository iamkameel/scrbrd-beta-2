/**
 * SCRBRD Performance Rating & Development Index Engine
 * Derived from SCRBRD_OS packages/scoring/src/rating.mjs
 * 
 * Combines subjective Coach Assessment (Anchor) with objective Ball-Log Performance Index
 * using a sample-size evidence weight curve with full transparency and drift tracking.
 */

export interface StatCurveAnchor {
  stat: number;
  score: number;
}

export const STAT_ANCHORS = Object.freeze({
  // Batting average: [stat, score 1-20]
  battingAverage: [
    { stat: 0, score: 1 },
    { stat: 10, score: 5 },
    { stat: 15, score: 8 },
    { stat: 30, score: 13 },
    { stat: 50, score: 18 },
    { stat: 70, score: 20 },
  ],
  // Strike rate: runs per 100 balls
  battingStrikeRate: [
    { stat: 50, score: 2 },
    { stat: 90, score: 8 },
    { stat: 120, score: 13 },
    { stat: 150, score: 18 },
    { stat: 180, score: 20 },
  ],
  // Bowling economy: runs per over (LOWER is better)
  bowlingEconomy: [
    { stat: 4.5, score: 20 },
    { stat: 6.0, score: 16 },
    { stat: 7.5, score: 11 },
    { stat: 9.0, score: 6 },
    { stat: 12.0, score: 1 },
  ],
  // Bowling strike rate: balls per wicket (LOWER is better)
  bowlingStrikeRate: [
    { stat: 12, score: 20 },
    { stat: 18, score: 16 },
    { stat: 24, score: 12 },
    { stat: 30, score: 8 },
    { stat: 42, score: 3 },
  ],
});

export const BATTING_AVERAGE_WEIGHT = 0.6; // 60% average, 40% strike rate for school cricket
export const MIN_BALLS_FACED = 30; // Minimum 5 overs at crease for valid batting index
export const MIN_BALLS_BOWLED = 30; // Minimum 5 overs bowled for valid bowling index
export const FULL_EVIDENCE_SAMPLE = 400; // Deliveries faced/bowled where evidence achieves ~90% weight

/**
 * Piecewise linear interpolation over anchor points
 */
export function interpolateScore(stat: number, anchors: { stat: number; score: number }[]): number {
  if (anchors.length === 0) return 10;
  if (stat <= anchors[0].stat) return anchors[0].score;
  if (stat >= anchors[anchors.length - 1].stat) return anchors[anchors.length - 1].score;

  for (let i = 0; i < anchors.length - 1; i++) {
    const a1 = anchors[i];
    const a2 = anchors[i + 1];

    if (
      (stat >= a1.stat && stat <= a2.stat) ||
      (stat <= a1.stat && stat >= a2.stat)
    ) {
      const fraction = (stat - a1.stat) / (a2.stat - a1.stat || 1);
      return a1.score + fraction * (a2.score - a1.score);
    }
  }

  return anchors[anchors.length - 1].score;
}

export interface BattingStatsInput {
  runs: number;
  ballsFaced: number;
  dismissals: number;
}

export interface BowlingStatsInput {
  runsConceded: number;
  ballsBowled: number;
  wickets: number;
}

/**
 * Calculates objective Batting Performance Index (1-20 scale)
 */
export function calculateBattingIndex(stats: BattingStatsInput): {
  index: number | null;
  average: number;
  strikeRate: number;
  sampleStatus: 'insufficient' | 'emerging' | 'mature';
  reason?: string;
} {
  const { runs, ballsFaced, dismissals } = stats;

  if (ballsFaced < MIN_BALLS_FACED) {
    return {
      index: null,
      average: dismissals > 0 ? runs / dismissals : runs,
      strikeRate: ballsFaced > 0 ? (runs / ballsFaced) * 100 : 0,
      sampleStatus: 'insufficient',
      reason: `Sample floor not met (${ballsFaced}/${MIN_BALLS_FACED} balls faced)`,
    };
  }

  const average = dismissals > 0 ? runs / dismissals : runs;
  const strikeRate = (runs / ballsFaced) * 100;

  const avgScore = interpolateScore(average, STAT_ANCHORS.battingAverage);
  const srScore = interpolateScore(strikeRate, STAT_ANCHORS.battingStrikeRate);

  const rawIndex = avgScore * BATTING_AVERAGE_WEIGHT + srScore * (1 - BATTING_AVERAGE_WEIGHT);
  const clampedIndex = Math.min(20, Math.max(1, Number(rawIndex.toFixed(1))));

  return {
    index: clampedIndex,
    average: Number(average.toFixed(1)),
    strikeRate: Number(strikeRate.toFixed(1)),
    sampleStatus: ballsFaced >= FULL_EVIDENCE_SAMPLE ? 'mature' : 'emerging',
  };
}

/**
 * Calculates objective Bowling Performance Index (1-20 scale)
 */
export function calculateBowlingIndex(stats: BowlingStatsInput): {
  index: number | null;
  economy: number;
  strikeRate: number;
  sampleStatus: 'insufficient' | 'emerging' | 'mature';
  reason?: string;
} {
  const { runsConceded, ballsBowled, wickets } = stats;

  if (ballsBowled < MIN_BALLS_BOWLED) {
    return {
      index: null,
      economy: ballsBowled > 0 ? (runsConceded / ballsBowled) * 6 : 0,
      strikeRate: wickets > 0 ? ballsBowled / wickets : 0,
      sampleStatus: 'insufficient',
      reason: `Sample floor not met (${ballsBowled}/${MIN_BALLS_BOWLED} balls bowled)`,
    };
  }

  const overs = ballsBowled / 6;
  const economy = runsConceded / (overs || 1);
  const strikeRate = wickets > 0 ? ballsBowled / wickets : 45;

  const econScore = interpolateScore(economy, STAT_ANCHORS.bowlingEconomy);
  const srScore = interpolateScore(strikeRate, STAT_ANCHORS.bowlingStrikeRate);

  const rawIndex = econScore * 0.5 + srScore * 0.5;
  const clampedIndex = Math.min(20, Math.max(1, Number(rawIndex.toFixed(1))));

  return {
    index: clampedIndex,
    economy: Number(economy.toFixed(2)),
    strikeRate: Number(strikeRate.toFixed(1)),
    sampleStatus: ballsBowled >= FULL_EVIDENCE_SAMPLE ? 'mature' : 'emerging',
  };
}

/**
 * Evidence weight curve: As sample size grows from MIN to FULL_EVIDENCE_SAMPLE,
 * evidence weight scales asymptotically from 0 to 0.85
 */
export function calculateEvidenceWeight(sampleCount: number, minFloor: number): number {
  if (sampleCount < minFloor) return 0;
  const progress = (sampleCount - minFloor) / (FULL_EVIDENCE_SAMPLE - minFloor);
  const normalized = Math.min(1, Math.max(0, progress));
  // S-curve weighting
  return Number((normalized * 0.85).toFixed(2));
}

export interface SelfAdjustedRatingResult {
  coachAssessment: number; // Anchor on 1-20 scale (or 0-100 scaled)
  evidenceIndex: number | null; // Objective stat index on 1-20 scale
  blendedRating: number; // Resulting dynamic score
  evidenceWeight: number; // 0.00 to 0.85
  drift: number; // Difference between objective evidence and coach baseline
  driftDirection: 'ahead_of_assessment' | 'behind_assessment' | 'aligned';
  narrative: string;
}

/**
 * Calculates self-adjusted player rating combining Coach Assessment with Evidence Log
 */
export function calculateSelfAdjustedRating(
  coachAssessment20: number,
  evidenceIndex: number | null,
  sampleCount: number,
  minFloor: number
): SelfAdjustedRatingResult {
  if (evidenceIndex === null || sampleCount < minFloor) {
    return {
      coachAssessment: coachAssessment20,
      evidenceIndex: null,
      blendedRating: coachAssessment20,
      evidenceWeight: 0,
      drift: 0,
      driftDirection: 'aligned',
      narrative: `Rating anchored purely on Coach Assessment (${coachAssessment20.toFixed(1)}/20). Match sample below floor of ${minFloor} balls.`,
    };
  }

  const weight = calculateEvidenceWeight(sampleCount, minFloor);
  const blended = coachAssessment20 * (1 - weight) + evidenceIndex * weight;
  const drift = Number((evidenceIndex - coachAssessment20).toFixed(1));

  let driftDirection: 'ahead_of_assessment' | 'behind_assessment' | 'aligned' = 'aligned';
  if (drift > 0.5) driftDirection = 'ahead_of_assessment';
  else if (drift < -0.5) driftDirection = 'behind_assessment';

  let narrative = `Rating adjusted to ${blended.toFixed(1)}/20 based on ${sampleCount} balls (${(weight * 100).toFixed(0)}% evidence weight).`;
  if (driftDirection === 'ahead_of_assessment') {
    narrative += ` Match performance index (${evidenceIndex.toFixed(1)}) is trending +${drift} above coach baseline anchor.`;
  } else if (driftDirection === 'behind_assessment') {
    narrative += ` Match performance index (${evidenceIndex.toFixed(1)}) is running ${drift} below coach baseline anchor.`;
  } else {
    narrative += ` Match performance aligns closely with coach assessment.`;
  }

  return {
    coachAssessment: coachAssessment20,
    evidenceIndex,
    blendedRating: Number(blended.toFixed(1)),
    evidenceWeight: weight,
    drift,
    driftDirection,
    narrative,
  };
}
