/**
 * Cricket Match State Machine
 * 
 * Defines the lifecycle of a cricket match from scheduling to completion,
 * based on schoolboy cricket match workflows.
 */

import { Timestamp } from 'firebase/firestore';

export const MATCH_STATES = {
  SCHEDULED: 'SCHEDULED',
  TEAM_SELECTION: 'TEAM_SELECTION',
  PRE_MATCH: 'PRE_MATCH',
  LIVE: 'LIVE',
  INNINGS_BREAK: 'INNINGS_BREAK',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  POSTPONED: 'POSTPONED',
} as const;

export type MatchState = typeof MATCH_STATES[keyof typeof MATCH_STATES];

export interface MatchStateTransition {
  from: MatchState;
  to: MatchState;
  timestamp: Timestamp | Date | string;
  triggeredBy: string;
  reason?: string;
}

/**
 * Valid state transitions map
 * Each state can only transition to specific next states
 */
export const VALID_TRANSITIONS: Record<MatchState, MatchState[]> = {
  SCHEDULED: ['TEAM_SELECTION', 'CANCELLED', 'POSTPONED'],
  TEAM_SELECTION: ['PRE_MATCH', 'CANCELLED', 'POSTPONED'],
  PRE_MATCH: ['LIVE', 'CANCELLED', 'POSTPONED'],
  LIVE: ['INNINGS_BREAK', 'COMPLETED'],
  INNINGS_BREAK: ['LIVE', 'COMPLETED'],
  COMPLETED: [], // Terminal state - no transitions allowed
  CANCELLED: [], // Terminal state
  POSTPONED: ['SCHEDULED'], // Can be rescheduled
};

/**
 * Check if a state transition is valid
 */
export function canTransitionTo(
  currentState: MatchState,
  targetState: MatchState
): boolean {
  const allowedTransitions = VALID_TRANSITIONS[currentState];
  return allowedTransitions.includes(targetState);
}

/**
 * Get human-readable state labels
 */
export const STATE_LABELS: Record<MatchState, string> = {
  SCHEDULED: 'Scheduled',
  TEAM_SELECTION: 'Team Selection',
  PRE_MATCH: 'Pre-Match',
  LIVE: 'Live',
  INNINGS_BREAK: 'Innings Break',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  POSTPONED: 'Postponed',
};

/**
 * Get state descriptions for UI help text
 */
export const STATE_DESCRIPTIONS: Record<MatchState, string> = {
  SCHEDULED: 'Match is scheduled and awaiting team selection',
  TEAM_SELECTION: 'Coaches are selecting the playing XI (24 hours before match)',
  PRE_MATCH: 'Pre-match procedures: toss, batting order, scorer checklist',
  LIVE: 'Match is currently in progress - scoring active',
  INNINGS_BREAK: 'Break between innings',
  COMPLETED: 'Match has been completed - scorecard is final',
  CANCELLED: 'Match has been cancelled',
  POSTPONED: 'Match has been postponed and needs rescheduling',
};

/**
 * Badge variant mapping for UI consistency
 */
export const STATE_BADGE_VARIANTS: Record<MatchState, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  SCHEDULED: 'outline',
  TEAM_SELECTION: 'default',
  PRE_MATCH: 'default',
  LIVE: 'destructive',
  INNINGS_BREAK: 'secondary',
  COMPLETED: 'secondary',
  CANCELLED: 'outline',
  POSTPONED: 'outline',
};

/**
 * Actions available at each state
 */
export type MatchAction = 
  | 'VIEW'
  | 'EDIT_DETAILS'
  | 'SELECT_TEAM'
  | 'CONDUCT_TOSS'
  | 'SCORER_CHECKLIST'
  | 'SCORE_MATCH'
  | 'VIEW_SCORECARD'
  | 'CANCEL_MATCH'
  | 'EXPORT_SCORECARD'
  | 'EDIT_COMPLETED';

/**
 * Map of which actions are allowed in each state
 */
export const ALLOWED_ACTIONS: Record<MatchState, MatchAction[]> = {
  SCHEDULED: ['VIEW', 'EDIT_DETAILS', 'CANCEL_MATCH'],
  TEAM_SELECTION: ['VIEW', 'SELECT_TEAM', 'CANCEL_MATCH'],
  PRE_MATCH: ['VIEW', 'CONDUCT_TOSS', 'SCORER_CHECKLIST'],
  LIVE: ['VIEW', 'SCORE_MATCH'],
  INNINGS_BREAK: ['VIEW', 'VIEW_SCORECARD'],
  COMPLETED: ['VIEW', 'VIEW_SCORECARD', 'EXPORT_SCORECARD'],
  CANCELLED: ['VIEW'],
  POSTPONED: ['VIEW', 'EDIT_DETAILS'],
};

/**
 * Check if an action is allowed in the current state
 */
export function canPerformAction(
  matchState: MatchState,
  action: MatchAction
): boolean {
  const allowedActions = ALLOWED_ACTIONS[matchState];
  return allowedActions.includes(action);
}

/**
 * Check if match is in a terminal state (no further transitions)
 */
export function isTerminalState(state: MatchState): boolean {
  return state === MATCH_STATES.COMPLETED || state === MATCH_STATES.CANCELLED;
}

/**
 * Check if match is currently scorable
 */
export function isScorable(state: MatchState): boolean {
  return state === MATCH_STATES.LIVE;
}

/**
 * Check if match is editable
 */
export function isEditable(state: MatchState): boolean {
  return state === MATCH_STATES.SCHEDULED || state === MATCH_STATES.POSTPONED;
}

/**
 * Get next expected state based on current state
 */
export function getNextExpectedState(currentState: MatchState): MatchState | null {
  const transitions = VALID_TRANSITIONS[currentState];
  if (transitions.length === 0) return null;
  
  // Return the primary expected transition (first in array)
  return transitions[0];
}

/**
 * Calculate time until state transition
 * Returns hours until the next state should be active
 */
export function getTimeUntilStateChange(
  matchDate: Date,
  currentState: MatchState
): number | null {
  const now = new Date();
  const hoursUntilMatch = (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  switch (currentState) {
    case MATCH_STATES.SCHEDULED:
      // Team selection opens 24 hours before
      return Math.max(0, hoursUntilMatch - 24);
    
    case MATCH_STATES.TEAM_SELECTION:
      // Pre-match opens 2 hours before
      return Math.max(0, hoursUntilMatch - 2);
    
    case MATCH_STATES.PRE_MATCH:
      // Match starts at scheduled time
      return Math.max(0, hoursUntilMatch);
    
    default:
      return null;
  }
}

/**
 * Determine what state a match should be in based on current time
 * This is useful for auto-transitioning states
 */
export function getExpectedStateByTime(
  matchDate: Date,
  currentState: MatchState
): MatchState {
  // Don't auto-transition terminal states
  if (isTerminalState(currentState)) {
    return currentState;
  }
  
  const now = new Date();
  const hoursUntilMatch = (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  // Match has passed
  if (hoursUntilMatch < -3) {
    // Assume completed if 3+ hours past match time
    return MATCH_STATES.COMPLETED;
  }
  
  // Match is live or very recent
  if (hoursUntilMatch <= 0 && hoursUntilMatch > -3) {
    // Could be LIVE or just finished, keep current state
    return currentState === MATCH_STATES.COMPLETED ? MATCH_STATES.COMPLETED : MATCH_STATES.LIVE;
  }
  
  // 0-2 hours before match
  if (hoursUntilMatch > 0 && hoursUntilMatch <= 2) {
    return MATCH_STATES.PRE_MATCH;
  }
  
  // 2-24 hours before match
  if (hoursUntilMatch > 2 && hoursUntilMatch <= 24) {
    return MATCH_STATES.TEAM_SELECTION;
  }
  
  // More than 24 hours away
  return MATCH_STATES.SCHEDULED;
}

/**
 * Create a state transition record
 */
export function createStateTransition(
  from: MatchState,
  to: MatchState,
  triggeredBy: string,
  reason?: string
): MatchStateTransition {
  return {
    from,
    to,
    timestamp: new Date(),
    triggeredBy,
    reason,
  };
}
