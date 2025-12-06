/**
 * Match Permissions
 * 
 * Role-based permission system for match actions based on match state
 */

import { MatchState, MatchAction, MATCH_STATES } from './matchStates';
import { UserRole, USER_ROLES } from './roles';

/**
 * Permission matrix: State × Role × Action
 * Defines which roles can perform which actions in each state
 */
type PermissionMatrix = Record<MatchState, Partial<Record<UserRole, MatchAction[]>>>;

export const MATCH_PERMISSIONS: PermissionMatrix = {
  // SCHEDULED - Admin and coaches can edit
  [MATCH_STATES.SCHEDULED]: {
    [USER_ROLES.SYSTEM_ARCHITECT]: ['VIEW', 'EDIT_DETAILS', 'CANCEL_MATCH'],
    [USER_ROLES.ADMIN]: ['VIEW', 'EDIT_DETAILS', 'CANCEL_MATCH'],
    [USER_ROLES.SCHOOL_ADMIN]: ['VIEW', 'CANCEL_MATCH'],
    [USER_ROLES.SPORTSMASTER]: ['VIEW', 'EDIT_DETAILS', 'CANCEL_MATCH'],
    [USER_ROLES.COACH]: ['VIEW', 'EDIT_DETAILS'],
    [USER_ROLES.SCORER]: ['VIEW'],
    [USER_ROLES.PLAYER]: ['VIEW'],
    [USER_ROLES.SPECTATOR]: ['VIEW'],
    [USER_ROLES.GUARDIAN]: ['VIEW'],
  },
  
  // TEAM_SELECTION - Coaches select playing XI
  [MATCH_STATES.TEAM_SELECTION]: {
    [USER_ROLES.SYSTEM_ARCHITECT]: ['VIEW', 'SELECT_TEAM', 'CANCEL_MATCH'],
    [USER_ROLES.ADMIN]: ['VIEW', 'SELECT_TEAM', 'CANCEL_MATCH'],
    [USER_ROLES.SPORTSMASTER]: ['VIEW', 'SELECT_TEAM', 'CANCEL_MATCH'],
    [USER_ROLES.COACH]: ['VIEW', 'SELECT_TEAM'],
    [USER_ROLES.SCORER]: ['VIEW'],
    [USER_ROLES.PLAYER]: ['VIEW'],
    [USER_ROLES.SPECTATOR]: ['VIEW'],
    [USER_ROLES.GUARDIAN]: ['VIEW'],
  },
  
  // PRE_MATCH - Toss, checklist, batting order
  [MATCH_STATES.PRE_MATCH]: {
    [USER_ROLES.SYSTEM_ARCHITECT]: ['VIEW', 'CONDUCT_TOSS', 'SCORER_CHECKLIST'],
    [USER_ROLES.ADMIN]: ['VIEW', 'CONDUCT_TOSS', 'SCORER_CHECKLIST'],
    [USER_ROLES.SPORTSMASTER]: ['VIEW', 'CONDUCT_TOSS'],
    [USER_ROLES.COACH]: ['VIEW', 'CONDUCT_TOSS'],
    [USER_ROLES.SCORER]: ['VIEW', 'SCORER_CHECKLIST'],
    [USER_ROLES.PLAYER]: ['VIEW'],
    [USER_ROLES.SPECTATOR]: ['VIEW'],
    [USER_ROLES.GUARDIAN]: ['VIEW'],
  },
  
  // LIVE - Only scorers can score
  [MATCH_STATES.LIVE]: {
    [USER_ROLES.SYSTEM_ARCHITECT]: ['VIEW', 'SCORE_MATCH'],
    [USER_ROLES.ADMIN]: ['VIEW', 'SCORE_MATCH'],
    [USER_ROLES.SCORER]: ['VIEW', 'SCORE_MATCH'],
    [USER_ROLES.SPORTSMASTER]: ['VIEW'],
    [USER_ROLES.COACH]: ['VIEW'],
    [USER_ROLES.PLAYER]: ['VIEW'],
    [USER_ROLES.SPECTATOR]: ['VIEW'],
    [USER_ROLES.GUARDIAN]: ['VIEW'],
  },
  
  // INNINGS_BREAK - Review stats
  [MATCH_STATES.INNINGS_BREAK]: {
    [USER_ROLES.SYSTEM_ARCHITECT]: ['VIEW', 'VIEW_SCORECARD'],
    [USER_ROLES.ADMIN]: ['VIEW', 'VIEW_SCORECARD'],
    [USER_ROLES.SCORER]: ['VIEW', 'VIEW_SCORECARD'],
    [USER_ROLES.SPORTSMASTER]: ['VIEW', 'VIEW_SCORECARD'],
    [USER_ROLES.COACH]: ['VIEW', 'VIEW_SCORECARD'],
    [USER_ROLES.PLAYER]: ['VIEW', 'VIEW_SCORECARD'],
    [USER_ROLES.SPECTATOR]: ['VIEW', 'VIEW_SCORECARD'],
    [USER_ROLES.GUARDIAN]: ['VIEW', 'VIEW_SCORECARD'],
  },
  
  // COMPLETED - Read-only, admins can export
  [MATCH_STATES.COMPLETED]: {
    [USER_ROLES.SYSTEM_ARCHITECT]: ['VIEW', 'VIEW_SCORECARD', 'EXPORT_SCORECARD', 'EDIT_COMPLETED'],
    [USER_ROLES.ADMIN]: ['VIEW', 'VIEW_SCORECARD', 'EXPORT_SCORECARD'],
    [USER_ROLES.SPORTSMASTER]: ['VIEW', 'VIEW_SCORECARD', 'EXPORT_SCORECARD'],
    [USER_ROLES.COACH]: ['VIEW', 'VIEW_SCORECARD', 'EXPORT_SCORECARD'],
    [USER_ROLES.SCORER]: ['VIEW', 'VIEW_SCORECARD'],
    [USER_ROLES.PLAYER]: ['VIEW', 'VIEW_SCORECARD'],
    [USER_ROLES.SPECTATOR]: ['VIEW', 'VIEW_SCORECARD'],
    [USER_ROLES.GUARDIAN]: ['VIEW', 'VIEW_SCORECARD'],
  },
  
  // CANCELLED - View only
  [MATCH_STATES.CANCELLED]: {
    [USER_ROLES.SYSTEM_ARCHITECT]: ['VIEW'],
    [USER_ROLES.ADMIN]: ['VIEW'],
    [USER_ROLES.SPORTSMASTER]: ['VIEW'],
    [USER_ROLES.COACH]: ['VIEW'],
    [USER_ROLES.SCORER]: ['VIEW'],
    [USER_ROLES.PLAYER]: ['VIEW'],
    [USER_ROLES.SPECTATOR]: ['VIEW'],
    [USER_ROLES.GUARDIAN]: ['VIEW'],
  },
  
  // POSTPONED - Can reschedule
  [MATCH_STATES.POSTPONED]: {
    [USER_ROLES.SYSTEM_ARCHITECT]: ['VIEW', 'EDIT_DETAILS'],
    [USER_ROLES.ADMIN]: ['VIEW', 'EDIT_DETAILS'],
    [USER_ROLES.SPORTSMASTER]: ['VIEW', 'EDIT_DETAILS'],
    [USER_ROLES.COACH]: ['VIEW'],
    [USER_ROLES.SCORER]: ['VIEW'],
    [USER_ROLES.PLAYER]: ['VIEW'],
    [USER_ROLES.SPECTATOR]: ['VIEW'],
    [USER_ROLES.GUARDIAN]: ['VIEW'],
  },
};

/**
 * Check if a user has permission to perform an action in a given match state
 */
export function hasMatchPermission(
  userRole: UserRole,
  matchState: MatchState,
  action: MatchAction
): boolean {
  const statePermissions = MATCH_PERMISSIONS[matchState];
  const userPermissions = statePermissions[userRole] || [];
  
  return userPermissions.includes(action);
}

/**
 * Get all actions a user can perform in a given match state
 */
export function getAllowedActions(
  userRole: UserRole,
  matchState: MatchState
): MatchAction[] {
  const statePermissions = MATCH_PERMISSIONS[matchState];
  return statePermissions[userRole] || ['VIEW']; // Default to view-only
}

/**
 * Check if user can score a match
 * This is a critical permission - only certain roles in LIVE state
 */
export function canScoreMatch(
  userRole: UserRole,
  matchState: MatchState
): boolean {
  return hasMatchPermission(userRole, matchState, 'SCORE_MATCH');
}

/**
 * Check if user can edit match details
 */
export function canEditMatch(
  userRole: UserRole,
  matchState: MatchState
): boolean {
  return hasMatchPermission(userRole, matchState, 'EDIT_DETAILS');
}

/**
 * Check if user can select team
 */
export function canSelectTeam(
  userRole: UserRole,
  matchState: MatchState
): boolean {
  return hasMatchPermission(userRole, matchState, 'SELECT_TEAM');
}

/**
 * Get permission error message
 */
export function getPermissionErrorMessage(
  action: MatchAction,
  matchState: MatchState,
  userRole?: UserRole
): string {
  if (action === 'SCORE_MATCH' && matchState !== MATCH_STATES.LIVE) {
    if (matchState === MATCH_STATES.COMPLETED) {
      return 'Cannot score a completed match. The scorecard is final.';
    }
    return `Cannot score a match in ${matchState} state. Match must be LIVE to score.`;
  }
  
  if (action === 'EDIT_DETAILS' && matchState === MATCH_STATES.COMPLETED) {
    return 'Cannot edit a completed match. Contact an administrator if changes are needed.';
  }
  
  if (userRole) {
    return `Your role (${userRole}) does not have permission to ${action.toLowerCase()} in ${matchState} state.`;
  }
  
  return `Action ${action} is not allowed in ${matchState} state.`;
}
