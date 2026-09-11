// ── SCRBRD PHASE 2 SCORING FINITE STATE MACHINE (FSM) ─────────────
// Strict state transitions: SCHEDULED -> LIVE -> REVIEW_CONFIRM -> INNINGS_BREAK -> COMPLETED

export type ScoringHubState =
  | 'idle'
  | 'loading'
  | 'checkingSetup'
  | 'blockedMissingSetup'
  | 'ready'
  | 'scoring'
  | 'reviewConfirm'
  | 'inningsComplete'
  | 'matchComplete'
  | 'error';

export interface LiveOverBall {
  ballNumber: number;
  bowlerId: string;
  strikerId: string;
  nonStrikerId: string;
  runs: number;
  isWide?: boolean;
  isNoBall?: boolean;
  isBye?: boolean;
  isLegBye?: boolean;
  isWicket?: boolean;
  dismissalType?: string;
  dismissedPlayerId?: string;
  commentary?: string;
}

export interface InningsState {
  inningsNumber: number;
  battingTeamId: string;
  bowlingTeamId: string;
  runs: number;
  wickets: number;
  overs: number;
  ballsInOver: number;
  target?: number;
  runRate: number;
  requiredRunRate?: number;
  currentOver: LiveOverBall[];
  isDeclared?: boolean;
  isCompleted?: boolean;
}

export interface ScoringFSMContext {
  matchId: string;
  currentState: ScoringHubState;
  innings: InningsState;
  strikerId: string;
  nonStrikerId: string;
  currentBowlerId: string;
  tossWinnerId?: string;
  tossDecision?: 'bat' | 'bowl';
  sessionToken?: string;
  leaseExpiresAt?: number;
  quarantineCount: number;
  discrepancies: string[];
  lastError?: string;
}

export type ScoringFSMEvent =
  | { type: 'LOAD_MATCH'; matchId: string; inningsData?: Partial<InningsState> }
  | { type: 'SETUP_VERIFIED'; tossWinnerId: string; tossDecision: 'bat' | 'bowl'; strikerId: string; nonStrikerId: string; bowlerId: string }
  | { type: 'START_SCORING' }
  | { type: 'RECORD_BALL'; ball: LiveOverBall }
  | { type: 'UNDO_BALL' }
  | { type: 'REQUEST_INNINGS_END'; reason?: string }
  | { type: 'CONFIRM_INNINGS_END'; verified: boolean }
  | { type: 'CANCEL_INNINGS_END' }
  | { type: 'START_NEXT_INNINGS'; battingTeamId: string; bowlingTeamId: string; target?: number }
  | { type: 'FINALIZE_MATCH'; resultSummary: string }
  | { type: 'RENEW_LEASE'; token: string; expiresAt: number }
  | { type: 'REPORT_DISCREPANCY'; message: string }
  | { type: 'CLEAR_ERROR' };

export function scoringFSMReducer(
  context: ScoringFSMContext,
  event: ScoringFSMEvent
): ScoringFSMContext {
  switch (event.type) {
    case 'LOAD_MATCH':
      return {
        ...context,
        matchId: event.matchId,
        currentState: 'checkingSetup',
        innings: {
          ...context.innings,
          ...event.inningsData,
        },
        lastError: undefined,
      };

    case 'SETUP_VERIFIED':
      return {
        ...context,
        tossWinnerId: event.tossWinnerId,
        tossDecision: event.tossDecision,
        strikerId: event.strikerId,
        nonStrikerId: event.nonStrikerId,
        currentBowlerId: event.bowlerId,
        currentState: 'ready',
        lastError: undefined,
      };

    case 'START_SCORING':
      if (!context.strikerId || !context.currentBowlerId) {
        return {
          ...context,
          currentState: 'blockedMissingSetup',
          lastError: 'Missing opening striker or bowler assignment.',
        };
      }
      return {
        ...context,
        currentState: 'scoring',
        lastError: undefined,
      };

    case 'RECORD_BALL': {
      if (context.currentState !== 'scoring') return context;
      const b = event.ball;
      const runsScored = b.runs || 0;
      const isLegal = !b.isWide && !b.isNoBall;
      const newBallsInOver = isLegal ? (context.innings.ballsInOver + 1) : context.innings.ballsInOver;
      const overComplete = newBallsInOver >= 6;

      const updatedOver = [...context.innings.currentOver, b];
      const newOvers = overComplete
        ? context.innings.overs + 1
        : context.innings.overs;

      const totalRuns = context.innings.runs + runsScored;
      const totalWickets = b.isWicket ? context.innings.wickets + 1 : context.innings.wickets;

      // Strike rotation logic
      let nextStriker = context.strikerId;
      let nextNonStriker = context.nonStrikerId;
      if (runsScored % 2 === 1) {
        nextStriker = context.nonStrikerId;
        nextNonStriker = context.strikerId;
      }
      if (overComplete) {
        // Switch ends at over end
        const temp = nextStriker;
        nextStriker = nextNonStriker;
        nextNonStriker = temp;
      }

      const totalBallsBowled = newOvers * 6 + (overComplete ? 0 : newBallsInOver);
      const computedRunRate = totalBallsBowled > 0 ? Number(((totalRuns / totalBallsBowled) * 6).toFixed(2)) : 0;

      return {
        ...context,
        strikerId: nextStriker,
        nonStrikerId: nextNonStriker,
        innings: {
          ...context.innings,
          runs: totalRuns,
          wickets: totalWickets,
          overs: newOvers,
          ballsInOver: overComplete ? 0 : newBallsInOver,
          runRate: computedRunRate,
          currentOver: overComplete ? [] : updatedOver,
        },
      };
    }

    case 'UNDO_BALL': {
      if (context.innings.currentOver.length === 0 && context.innings.overs === 0) {
        return context;
      }
      const lastBall = context.innings.currentOver[context.innings.currentOver.length - 1];
      if (!lastBall) return context;

      const isLegal = !lastBall.isWide && !lastBall.isNoBall;
      return {
        ...context,
        innings: {
          ...context.innings,
          runs: Math.max(0, context.innings.runs - lastBall.runs),
          wickets: lastBall.isWicket ? Math.max(0, context.innings.wickets - 1) : context.innings.wickets,
          ballsInOver: isLegal ? Math.max(0, context.innings.ballsInOver - 1) : context.innings.ballsInOver,
          currentOver: context.innings.currentOver.slice(0, -1),
        },
      };
    }

    case 'REQUEST_INNINGS_END':
      return {
        ...context,
        currentState: 'reviewConfirm',
        lastError: undefined,
      };

    case 'CONFIRM_INNINGS_END':
      if (!event.verified) {
        return {
          ...context,
          lastError: 'Innings completion denied: Verification checklist not passed.',
        };
      }
      return {
        ...context,
        currentState: 'inningsComplete',
        innings: {
          ...context.innings,
          isCompleted: true,
        },
      };

    case 'CANCEL_INNINGS_END':
      return {
        ...context,
        currentState: 'scoring',
        lastError: undefined,
      };

    case 'START_NEXT_INNINGS':
      return {
        ...context,
        currentState: 'ready',
        innings: {
          inningsNumber: context.innings.inningsNumber + 1,
          battingTeamId: event.battingTeamId,
          bowlingTeamId: event.bowlingTeamId,
          runs: 0,
          wickets: 0,
          overs: 0,
          ballsInOver: 0,
          target: event.target,
          runRate: 0,
          currentOver: [],
        },
        strikerId: '',
        nonStrikerId: '',
        currentBowlerId: '',
      };

    case 'FINALIZE_MATCH':
      return {
        ...context,
        currentState: 'matchComplete',
      };

    case 'RENEW_LEASE':
      return {
        ...context,
        sessionToken: event.token,
        leaseExpiresAt: event.expiresAt,
      };

    case 'REPORT_DISCREPANCY':
      return {
        ...context,
        discrepancies: [...context.discrepancies, event.message],
      };

    case 'CLEAR_ERROR':
      return {
        ...context,
        lastError: undefined,
      };

    default:
      return context;
  }
}
