// SCRBRD OS — Pure Event-Replay Scoring Engine (CricketOS Spec)
// "The ball log is the only source of truth. Nothing stores a score."

export interface WagonWheelShot {
  x: number;
  y: number;
  radius: number;
  angle: number;
  side: "OFF" | "LEG";
  sector: string;
  depth: "close" | "infield" | "deep" | "boundary";
  shotType: string;
  batHand: "R" | "L";
  fieldingZone?: string;
  fieldingZoneDesc?: string;
  distanceMeters?: number;
  suggestedRuns?: number;
}

export interface BallEvent {
  id: string;
  seq: number;
  epoch?: number;
  isLegalDelivery: boolean; // false for wide ('wd') or no-ball ('nb')
  extraType?: "wd" | "nb" | "b" | "lb" | "pen";
  runsOffBat: number;
  extraRuns: number; // 1 for wd/nb penalty, or 5 for pen
  totalRuns: number; // runsOffBat + extraRuns
  isWicket: boolean;
  wicketType?: "bowled" | "caught" | "lbw" | "run_out" | "stumped" | "hit_wicket" | "retired_hurt" | "obstructing" | string;
  fielderName?: string;
  fielderId?: string;
  batterName: string;
  batterId?: string;
  bowlerName: string;
  bowlerId?: string;
  isFreeHit?: boolean;
  isVoided?: boolean;
  commentary?: string;
  timestamp?: string;
  shot?: WagonWheelShot;
  pitchDelivery?: {
    line: "outside_off" | "off_stump" | "middle" | "leg_stump" | "down_leg";
    length: "yorker" | "full" | "good_length" | "back_of_length" | "short";
    paceType?: "fast" | "medium" | "off_spin" | "leg_spin";
  };
  trajectory?: "along_ground" | "aerial" | "lofted" | "defended";
  contactQuality?: "middle" | "edge" | "mishit" | "uncontrolled";
  verificationStatus?: "verified" | "phase1_only" | "amended";
  amendmentReason?: string;
  syncStatus?: "synced" | "queued" | "syncing";
}

export interface BatterInningsStats {
  id: string;
  name: string;
  runs: number;
  balls: number; // Legal balls faced + No-Balls faced (EXCLUDES Wides!)
  fours: number;
  sixes: number;
  sr: number;
  isNotOut: boolean;
  dismissal?: string;
  battingPos: number;
}

export interface BowlerInningsStats {
  id: string;
  name: string;
  overs: string;
  legalBalls: number;
  maidens: number;
  runs: number; // Conceded runs (Bat runs + Wides + NoBalls; EXCLUDES Byes/LegByes)
  wickets: number;
  economy: number;
  dots: number;
  fours: number;
  sixes: number;
  wides: number;
  noBalls: number;
}

export interface PartnershipRecord {
  wicketNumber: number;
  runs: number; // Full run delta (Bat runs + All Extras) while pair is together
  balls: number; // Legal balls while pair is together
  player1: { name: string; runs: number; balls: number };
  player2: { name: string; runs: number; balls: number };
  unbroken?: boolean;
}

export interface FallOfWicketRecord {
  wicketNumber: number;
  score: number;
  over: string;
  player: string;
  dismissal: string;
}

export interface InningsDerivedState {
  totalRuns: number;
  totalWickets: number;
  legalBalls: number;
  completedOvers: number;
  remainderBalls: number;
  oversStr: string;
  runRate: number;
  extras: {
    byes: number;
    legByes: number;
    wides: number;
    noBalls: number;
    penalties: number;
    total: number;
  };
  batting: BatterInningsStats[];
  bowling: BowlerInningsStats[];
  partnerships: PartnershipRecord[];
  fow: FallOfWicketRecord[];
  activeStrikerName: string;
  activeNonStrikerName: string;
  activeBowlerName: string;
  isFreeHitNext: boolean;
}

/**
 * Renders official cricket dismissal notation with complete fielder & bowler attribution.
 * Fixes Rule 5: Fielder survives event replay.
 */
export function describeDismissal(
  wicketType: string = "caught",
  bowlerName: string,
  fielderName?: string
): string {
  const norm = wicketType.toLowerCase().replace(/\s+/g, "_");
  const fielderStr = fielderName || "Fielder";

  switch (norm) {
    case "bowled":
    case "b":
      return `b ${bowlerName}`;
    case "caught":
    case "c":
      return `c ${fielderStr} b ${bowlerName}`;
    case "lbw":
      return `lbw b ${bowlerName}`;
    case "stumped":
    case "st":
      return `st †${fielderStr} b ${bowlerName}`;
    case "run_out":
    case "runout":
      return `run out (${fielderStr})`;
    case "hit_wicket":
      return `hit wicket b ${bowlerName}`;
    case "retired_hurt":
      return `retired hurt`;
    case "obstructing":
      return `obstructing the field`;
    default:
      return `${wicketType} b ${bowlerName}`;
  }
}

/**
 * Pure Deterministic Event Replay Fold Function (`deriveInnings`)
 * Replays an append-only array of `BallEvent` objects to compute exact match state.
 */
export function deriveInnings(
  events: BallEvent[],
  initialBattingOrder: { name: string; id?: string; pos: number }[] = [],
  initialBowlers: string[] = []
): InningsDerivedState {
  // Filter out voided events
  const activeEvents = events.filter(e => !e.isVoided);

  let totalRuns = 0;
  let totalWickets = 0;
  let legalBalls = 0;
  let isFreeHitNext = false;

  const extras = {
    byes: 0,
    legByes: 0,
    wides: 0,
    noBalls: 0,
    penalties: 0,
    total: 0,
  };

  // Batters map
  const battersMap: Record<string, BatterInningsStats> = {};
  initialBattingOrder.forEach(b => {
    battersMap[b.name] = {
      id: b.id || `bat_${b.pos}`,
      name: b.name,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      sr: 0,
      isNotOut: true,
      battingPos: b.pos,
    };
  });

  // Bowlers map
  const bowlersMap: Record<string, BowlerInningsStats> = {};
  initialBowlers.forEach((name, idx) => {
    bowlersMap[name] = {
      id: `bw_${idx + 1}`,
      name,
      overs: "0.0",
      legalBalls: 0,
      maidens: 0,
      runs: 0,
      wickets: 0,
      economy: 0,
      dots: 0,
      fours: 0,
      sixes: 0,
      wides: 0,
      noBalls: 0,
    };
  });

  const fow: FallOfWicketRecord[] = [];
  const partnerships: PartnershipRecord[] = [];

  // Track active crease holders
  let strikerName = initialBattingOrder[0]?.name || "Striker";
  let nonStrikerName = initialBattingOrder[1]?.name || "Non-Striker";
  let currentBowlerName = initialBowlers[0] || "Bowler";

  // Ensure current crease holders exist in battersMap
  if (!battersMap[strikerName]) {
    battersMap[strikerName] = { id: "bat_1", name: strikerName, runs: 0, balls: 0, fours: 0, sixes: 0, sr: 0, isNotOut: true, battingPos: 1 };
  }
  if (!battersMap[nonStrikerName]) {
    battersMap[nonStrikerName] = { id: "bat_2", name: nonStrikerName, runs: 0, balls: 0, fours: 0, sixes: 0, sr: 0, isNotOut: true, battingPos: 2 };
  }

  // Partnership tracking state
  let currentPartnership = {
    wicketNumber: 1,
    runs: 0,
    balls: 0,
    p1Name: strikerName,
    p1Runs: 0,
    p1Balls: 0,
    p2Name: nonStrikerName,
    p2Runs: 0,
    p2Balls: 0,
  };

  // Over maiden tracking
  let overConcededRuns = 0;
  let overLegalBalls = 0;

  for (let i = 0; i < activeEvents.length; i++) {
    const e = activeEvents[i];

    // Identify active striker, non-striker, bowler from event if provided
    if (e.batterName) strikerName = e.batterName;
    if (e.bowlerName) currentBowlerName = e.bowlerName;

    if (!battersMap[strikerName]) {
      battersMap[strikerName] = {
        id: `bat_${Object.keys(battersMap).length + 1}`,
        name: strikerName,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        sr: 0,
        isNotOut: true,
        battingPos: Object.keys(battersMap).length + 1,
      };
    }

    if (!bowlersMap[currentBowlerName]) {
      bowlersMap[currentBowlerName] = {
        id: `bw_${Object.keys(bowlersMap).length + 1}`,
        name: currentBowlerName,
        overs: "0.0",
        legalBalls: 0,
        maidens: 0,
        runs: 0,
        wickets: 0,
        economy: 0,
        dots: 0,
        fours: 0,
        sixes: 0,
        wides: 0,
        noBalls: 0,
      };
    }

    const striker = battersMap[strikerName];
    const bowler = bowlersMap[currentBowlerName];

    // Determine Free Hit status
    const isFreeHit = isFreeHitNext;
    isFreeHitNext = e.extraType === "nb"; // Rule 6: No-ball triggers free hit on next delivery

    // Rule 3: Balls faced - No-Balls count towards balls faced, Wides DO NOT
    if (e.extraType !== "wd") {
      striker.balls += 1;
      currentPartnership.p1Name === strikerName ? currentPartnership.p1Balls++ : currentPartnership.p2Balls++;
    }

    // Runs off bat attribution
    if (e.runsOffBat > 0) {
      striker.runs += e.runsOffBat;
      if (e.runsOffBat === 4) {
        striker.fours += 1;
        bowler.fours += 1;
      } else if (e.runsOffBat === 6) {
        striker.sixes += 1;
        bowler.sixes += 1;
      }

      if (currentPartnership.p1Name === strikerName) {
        currentPartnership.p1Runs += e.runsOffBat;
      } else {
        currentPartnership.p2Runs += e.runsOffBat;
      }
    }

    // Extras breakdown
    if (e.extraType === "wd") {
      extras.wides += e.extraRuns;
      bowler.wides += 1;
    } else if (e.extraType === "nb") {
      extras.noBalls += e.extraRuns;
      bowler.noBalls += 1;
    } else if (e.extraType === "b") {
      extras.byes += e.extraRuns;
    } else if (e.extraType === "lb") {
      extras.legByes += e.extraRuns;
    } else if (e.extraType === "pen") {
      extras.penalties += e.extraRuns;
    }

    // Total ball runs
    const ballTotal = e.totalRuns;
    totalRuns += ballTotal;
    currentPartnership.runs += ballTotal;

    // Bowler runs conceded (Rule 4: Byes/LegByes do NOT charge bowler; Wides/NoBalls DO)
    const bowlerCharge = e.runsOffBat + (e.extraType === "wd" || e.extraType === "nb" ? e.extraRuns : 0);
    bowler.runs += bowlerCharge;
    overConcededRuns += bowlerCharge;

    if (ballTotal === 0 && e.isLegalDelivery) {
      bowler.dots += 1;
    }

    // Rule 6: Free Hit Dismissal Enforcement
    // On a Free Hit, only non-credited dismissals (run out, retired hurt, obstructing) can cause a wicket
    let isValidWicket = false;
    if (e.isWicket) {
      const mode = (e.wicketType || "caught").toLowerCase().replace(/\s+/g, "_");
      const isUncreditedMode = mode.includes("run_out") || mode.includes("retired") || mode.includes("obstructing");

      if (!isFreeHit || isUncreditedMode) {
        isValidWicket = true;
      }
    }

    if (isValidWicket) {
      totalWickets += 1;
      striker.isNotOut = false;
      const dismissalText = describeDismissal(e.wicketType || "caught", currentBowlerName, e.fielderName);
      striker.dismissal = dismissalText;

      if (!e.wicketType?.includes("run_out") && !e.wicketType?.includes("retired")) {
        bowler.wickets += 1;
      }

      const completedOvers = Math.floor(legalBalls / 6);
      const remBalls = legalBalls % 6;
      const overStr = `${completedOvers}.${remBalls}`;

      fow.push({
        wicketNumber: totalWickets,
        score: totalRuns,
        over: overStr,
        player: strikerName,
        dismissal: dismissalText,
      });

      // Save partnership and prepare new pair
      partnerships.push({
        wicketNumber: totalWickets,
        runs: currentPartnership.runs,
        balls: currentPartnership.balls,
        player1: { name: currentPartnership.p1Name, runs: currentPartnership.p1Runs, balls: currentPartnership.p1Balls },
        player2: { name: currentPartnership.p2Name, runs: currentPartnership.p2Runs, balls: currentPartnership.p2Balls },
        unbroken: false,
      });

      // Bring in next batter from initial order or generic
      const nextPos = totalWickets + 2;
      const nextBatterObj = initialBattingOrder.find(b => b.pos === nextPos);
      const newStrikerName = nextBatterObj ? nextBatterObj.name : `Batter #${nextPos}`;

      strikerName = newStrikerName;
      if (!battersMap[strikerName]) {
        battersMap[strikerName] = {
          id: `bat_${nextPos}`,
          name: strikerName,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          sr: 0,
          isNotOut: true,
          battingPos: nextPos,
        };
      }

      currentPartnership = {
        wicketNumber: totalWickets + 1,
        runs: 0,
        balls: 0,
        p1Name: nonStrikerName,
        p1Runs: battersMap[nonStrikerName]?.runs || 0,
        p1Balls: battersMap[nonStrikerName]?.balls || 0,
        p2Name: strikerName,
        p2Runs: 0,
        p2Balls: 0,
      };
    }

    // Legal delivery progression & Maiden over check
    if (e.isLegalDelivery) {
      legalBalls += 1;
      bowler.legalBalls += 1;
      overLegalBalls += 1;
      currentPartnership.balls += 1;

      // Rule 4: Check Maiden Over boundary
      if (overLegalBalls === 6) {
        if (overConcededRuns === 0) {
          bowler.maidens += 1;
        }
        overConcededRuns = 0;
        overLegalBalls = 0;
      }
    }

    // Strike Rotation Logic:
    // Rule 1: Odd runs off No-Ball rotate strike
    // Rule 2: Odd runs off Wide rotate strike
    // Standard odd runs rotate strike
    const rotateStrikeOnRuns = ballTotal % 2 === 1;
    if (rotateStrikeOnRuns) {
      const temp = strikerName;
      strikerName = nonStrikerName;
      nonStrikerName = temp;
    }

    // End of Over strike rotation (every 6 legal deliveries)
    if (e.isLegalDelivery && legalBalls % 6 === 0) {
      const temp = strikerName;
      strikerName = nonStrikerName;
      nonStrikerName = temp;
    }
  }

  // Push unbroken active partnership
  partnerships.push({
    wicketNumber: totalWickets + 1,
    runs: currentPartnership.runs,
    balls: currentPartnership.balls,
    player1: { name: currentPartnership.p1Name, runs: currentPartnership.p1Runs, balls: currentPartnership.p1Balls },
    player2: { name: currentPartnership.p2Name, runs: currentPartnership.p2Runs, balls: currentPartnership.p2Balls },
    unbroken: true,
  });

  // Calculate strike rates and economy rates
  Object.values(battersMap).forEach(b => {
    b.sr = b.balls > 0 ? Number(((b.runs / b.balls) * 100).toFixed(2)) : 0;
  });

  Object.values(bowlersMap).forEach(bw => {
    const oversNum = Math.floor(bw.legalBalls / 6);
    const remNum = bw.legalBalls % 6;
    bw.overs = `${oversNum}.${remNum}`;
    const totalOversDec = bw.legalBalls / 6;
    bw.economy = totalOversDec > 0 ? Number((bw.runs / totalOversDec).toFixed(2)) : 0;
  });

  extras.total = extras.byes + extras.legByes + extras.wides + extras.noBalls + extras.penalties;

  const completedOvers = Math.floor(legalBalls / 6);
  const remainderBalls = legalBalls % 6;
  const oversStr = `${completedOvers}.${remainderBalls}`;
  const totalOversDec = legalBalls / 6;
  const runRate = totalOversDec > 0 ? Number((totalRuns / totalOversDec).toFixed(2)) : 0;

  return {
    totalRuns,
    totalWickets,
    legalBalls,
    completedOvers,
    remainderBalls,
    oversStr,
    runRate,
    extras,
    batting: Object.values(battersMap).sort((a, b) => a.battingPos - b.battingPos),
    bowling: Object.values(bowlersMap),
    partnerships,
    fow,
    activeStrikerName: strikerName,
    activeNonStrikerName: nonStrikerName,
    activeBowlerName: currentBowlerName,
    isFreeHitNext,
  };
}
