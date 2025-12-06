/**
 * Centralized User Roles and Permissions
 * 
 * This file defines all user roles, their hierarchy, and groupings
 * for consistent use across the application.
 */

export const USER_ROLES = {
  // ADMINISTRATIVE
  SYSTEM_ARCHITECT: 'System Architect',
  ADMIN: 'Admin',
  SPORTSMASTER: 'Sportsmaster',
  SCHOOL_ADMIN: 'School Admin',

  // TEAM STAFF
  COACH: 'Coach',
  ASSISTANT_COACH: 'Assistant Coach',
  TEAM_MANAGER: 'Team Manager',
  CAPTAIN: 'Captain',

  // PLAYERS & SPECTATORS
  PLAYER: 'Player',
  GUARDIAN: 'Guardian',
  SPECTATOR: 'Spectator',

  // SUPPORT & MEDICAL
  TRAINER: 'Trainer',
  PHYSIOTHERAPIST: 'Physiotherapist',
  DOCTOR: 'Doctor',
  FIRST_AID: 'First Aid',

  // OFFICIALS & GROUND STAFF
  UMPIRE: 'Umpire',
  SCORER: 'Scorer',
  GROUNDS_KEEPER: 'Grounds-Keeper',
  DRIVER: 'Driver',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

/**
 * All available roles
 */
export const ALL_ROLES = Object.values(USER_ROLES);

/**
 * Grouped roles for UI selection with grouped dropdowns
 */
export const ROLE_GROUPS = {
  'ADMINISTRATIVE': [
    USER_ROLES.SYSTEM_ARCHITECT,
    USER_ROLES.ADMIN,
    USER_ROLES.SPORTSMASTER,
    USER_ROLES.SCHOOL_ADMIN,
  ],
  'TEAM STAFF': [
    USER_ROLES.COACH,
    USER_ROLES.ASSISTANT_COACH,
    USER_ROLES.TEAM_MANAGER,
    USER_ROLES.CAPTAIN,
  ],
  'PLAYERS & SPECTATORS': [
    USER_ROLES.PLAYER,
    USER_ROLES.GUARDIAN,
    USER_ROLES.SPECTATOR,
  ],
  'SUPPORT & MEDICAL': [
    USER_ROLES.TRAINER,
    USER_ROLES.PHYSIOTHERAPIST,
    USER_ROLES.DOCTOR,
    USER_ROLES.FIRST_AID,
  ],
  'OFFICIALS & GROUND STAFF': [
    USER_ROLES.UMPIRE,
    USER_ROLES.SCORER,
    USER_ROLES.GROUNDS_KEEPER,
    USER_ROLES.DRIVER,
  ],
} as const;

/**
 * Role hierarchy for permission checks and role comparisons
 * Higher number = more privileges
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [USER_ROLES.SYSTEM_ARCHITECT]: 100,
  [USER_ROLES.ADMIN]: 90,
  [USER_ROLES.SPORTSMASTER]: 85,
  [USER_ROLES.SCHOOL_ADMIN]: 80,
  
  [USER_ROLES.TEAM_MANAGER]: 70,
  [USER_ROLES.COACH]: 65,
  [USER_ROLES.ASSISTANT_COACH]: 60,
  [USER_ROLES.CAPTAIN]: 55,
  
  [USER_ROLES.DOCTOR]: 50,
  [USER_ROLES.PHYSIOTHERAPIST]: 50,
  [USER_ROLES.TRAINER]: 45,
  [USER_ROLES.FIRST_AID]: 40,
  
  [USER_ROLES.UMPIRE]: 40,
  [USER_ROLES.SCORER]: 35,
  [USER_ROLES.GROUNDS_KEEPER]: 35,
  [USER_ROLES.DRIVER]: 30,
  
  [USER_ROLES.GUARDIAN]: 20,
  [USER_ROLES.PLAYER]: 10,
  [USER_ROLES.SPECTATOR]: 5,
};

/**
 * Role descriptions for UI tooltips and help text
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [USER_ROLES.SYSTEM_ARCHITECT]: 'Full system access with all permissions',
  [USER_ROLES.ADMIN]: 'Administrative access to most system functions',
  [USER_ROLES.SPORTSMASTER]: 'Manages sports programs and leagues',
  [USER_ROLES.SCHOOL_ADMIN]: 'School-level administration',
  
  [USER_ROLES.COACH]: 'Team coach with player and match management',
  [USER_ROLES.ASSISTANT_COACH]: 'Assists head coach with team duties',
  [USER_ROLES.TEAM_MANAGER]: 'Manages team logistics and operations',
  [USER_ROLES.CAPTAIN]: 'Team captain with leadership role',
  
  [USER_ROLES.PLAYER]: 'Team player with view-only access',
  [USER_ROLES.GUARDIAN]: 'Parent/guardian with view access',
  [USER_ROLES.SPECTATOR]: 'Public view access only',
  
  [USER_ROLES.TRAINER]: 'Physical trainer for players',
  [USER_ROLES.PHYSIOTHERAPIST]: 'Medical support and injury management',
  [USER_ROLES.DOCTOR]: 'Team doctor',
  [USER_ROLES.FIRST_AID]: 'First aid support staff',
  
  [USER_ROLES.UMPIRE]: 'Match official',
  [USER_ROLES.SCORER]: 'Match scorer',
  [USER_ROLES.GROUNDS_KEEPER]: 'Field maintenance and preparation',
  [USER_ROLES.DRIVER]: 'Transport logistics',
};

/**
 * Check if a role has higher or equal privileges than another
 */
export function hasHigherOrEqualRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if a user can assign a specific role
 * Users can only assign roles lower than or equal to their own
 */
export function canAssignRole(assignerRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY[assignerRole] >= ROLE_HIERARCHY[targetRole];
}

/**
 * Get user-friendly role name
 */
export function getRoleDisplayName(role: string): string {
  return role;
}

/**
 * Validate if a string is a valid role
 */
export function isValidRole(role: string): role is UserRole {
  return Object.values(USER_ROLES).includes(role as UserRole);
}
