import { Match } from '@/types/firestore';

export interface MatchFilter {
  teamId?: string;
  schoolId?: string;
  playerId?: string;
  fieldId?: string;
  assignedMatches?: string[];
}

export interface RoleContext {
  teamId?: string;
  schoolId?: string;
  playerId?: string;
  fieldId?: string;
  assignedMatches?: string[];
}

/**
 * Get all currently live matches
 */
export function getLiveMatches(filters?: MatchFilter): Match[] {
  const { store } = require('@/lib/store');
  let matches = store.matches.filter((m: Match) =>
    m.status === 'live' || m.state === 'LIVE' || m.isLive
  );

  return applyFilters(matches, filters);
}

/**
 * Get recent completed matches
 */
export function getRecentResults(filters?: MatchFilter, limit = 5): Match[] {
  const { store } = require('@/lib/store');
  let matches = store.matches
    .filter((m: Match) => m.status === 'completed' || m.state === 'COMPLETED')
    .sort((a: Match, b: Match) => {
      const dateA = new Date((a.matchDate || a.dateTime || 0) as any).getTime();
      const dateB = new Date((b.matchDate || b.dateTime || 0) as any).getTime();
      return dateB - dateA; // Most recent first
    })
    .slice(0, limit);

  return applyFilters(matches, filters);
}

/**
 * Get upcoming scheduled matches
 */
export function getUpcomingFixtures(filters?: MatchFilter, limit = 5): Match[] {
  const { store } = require('@/lib/store');
  const now = new Date().getTime();

  let matches = store.matches
    .filter((m: Match) => {
      const matchDate = new Date((m.matchDate || m.dateTime || 0) as any).getTime();
      return (m.status === 'scheduled' || m.state === 'SCHEDULED') && matchDate >= now;
    })
    .sort((a: Match, b: Match) => {
      const dateA = new Date((a.matchDate || a.dateTime || 0) as any).getTime();
      const dateB = new Date((b.matchDate || b.dateTime || 0) as any).getTime();
      return dateA - dateB; // Soonest first
    })
    .slice(0, limit);

  return applyFilters(matches, filters);
}

/**
 * Apply filters to match list
 */
function applyFilters(matches: Match[], filters?: MatchFilter): Match[] {
  if (!filters) return matches;

  return matches.filter(match => {
    // Team filter
    if (filters.teamId) {
      if (match.homeTeamId !== filters.teamId && match.awayTeamId !== filters.teamId) {
        return false;
      }
    }

    // School filter
    if (filters.schoolId) {
      // Would need to check if teams belong to the school
      // For now, just pass through
    }

    // Player filter - check if player is in either team's roster
    if (filters.playerId) {
      // Would need to check team rosters
      // For now, use teamId if available
    }

    // Field filter
    if (filters.fieldId && match.fieldId !== filters.fieldId) {
      return false;
    }

    // Assigned matches filter (for umpires/scorers)
    if (filters.assignedMatches && filters.assignedMatches.length > 0) {
      if (!filters.assignedMatches.includes(match.id)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Filter matches based on user role and context
 */
export function filterMatchesByRole(
  matches: Match[],
  role: string,
  context?: RoleContext
): Match[] {
  switch (role) {
    // Full access roles
    case 'System Architect':
    case 'Admin':
    case 'Sportsmaster':
    case 'School Admin':
      return matches; // See all matches

    // Team-based roles
    case 'Coach':
    case 'Assistant Coach':
    case 'Team Manager':
    case 'Captain':
    case 'Player':
    case 'Trainer':
      return context?.teamId
        ? applyFilters(matches, { teamId: context.teamId })
        : matches;

    // Official roles - only assigned matches
    case 'Umpire':
    case 'Scorer':
      return context?.assignedMatches
        ? applyFilters(matches, { assignedMatches: context.assignedMatches })
        : [];

    // Field-based roles
    case 'Grounds-Keeper':
    case 'Groundskeeper':
      return context?.fieldId
        ? applyFilters(matches, { fieldId: context.fieldId })
        : matches;

    // Limited access roles
    case 'Guardian':
      // Show matches for their child's team
      return context?.teamId
        ? applyFilters(matches, { teamId: context.teamId })
        : [];

    case 'Spectator':
    case 'Driver':
    case 'Physiotherapist':
    case 'Doctor':
    case 'First Aid':
    default:
      // Show all public/scheduled matches
      return matches;
  }
}

/**
 * Get color class for match status badge
 */
export function getMatchStatusColor(status?: string): string {
  switch (status?.toLowerCase()) {
    case 'live':
      return 'bg-red-600 animate-pulse';
    case 'completed':
      return 'bg-green-600';
    case 'scheduled':
      return 'bg-blue-600';
    case 'cancelled':
      return 'bg-gray-600';
    case 'postponed':
      return 'bg-yellow-600';
    default:
      return 'bg-gray-600';
  }
}

/**
 * Get text for match status badge
 */
export function getMatchStatusText(status?: string, state?: string): string {
  const actualStatus = state || status;

  switch (actualStatus?.toUpperCase()) {
    case 'LIVE':
    case 'IN_PROGRESS':
      return 'LIVE';
    case 'COMPLETED':
      return 'COMPLETED';
    case 'SCHEDULED':
    case 'TEAM_SELECTION':
    case 'PRE_MATCH':
      return 'UPCOMING';
    case 'CANCELLED':
      return 'CANCELLED';
    case 'POSTPONED':
      return 'POSTPONED';
    default:
      return 'SCHEDULED';
  }
}

/**
 * Format match date/time for display
 */
export function formatMatchDateTime(match: Match): string {
  const date = new Date((match.matchDate || match.dateTime || '') as any);

  if (isNaN(date.getTime())) {
    return 'Date TBD';
  }

  const now = new Date();
  const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today at ${date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    return `Tomorrow at ${date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays < 7 && diffDays > 0) {
    return `${date.toLocaleDateString('en-ZA', { weekday: 'short' })} at ${date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return date.toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

/**
 * Get score display for a match
 */
export function getMatchScore(match: Match): string {
  if (match.status === 'live' || match.state === 'LIVE') {
    // Show live score
    if (match.liveScore?.innings) {
      return `${match.liveScore.innings.runs ?? 0}/${match.liveScore.innings.wickets ?? 0}`;
    }
    if (match.liveData) {
      return 'In Progress';
    }
    return 'LIVE';
  }

  if (match.status === 'completed' || match.state === 'COMPLETED') {
    // Show final result
    if (match.result) {
      return match.result;
    }
    if (match.score) {
      return `${match.score.home || '0'} - ${match.score.away || '0'}`;
    }
    return 'Completed';
  }

  return '';
}
