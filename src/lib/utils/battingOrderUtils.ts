import { Person } from '@/types/firestore';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Calculate a batting suitability score for a player
 * Higher score = better suited for earlier batting positions
 */
function calculateBattingSuitability(player: Person): number {
  let score = 50; // Base score

  // Role-based scoring
  if (player.playingRole === 'Batsman') {
    score += 30;
  } else if (player.playingRole === 'AllRounder') {
    score += 20;
  } else if (player.playingRole === 'Wicketkeeper') {
    score += 15;
  } else if (player.playingRole === 'Bowler') {
    score -= 20;
  }

  // Batting style scoring
  if (player.battingStyle?.toLowerCase().includes('aggressive')) {
    score += 10;
  } else if (player.battingStyle?.toLowerCase().includes('defensive')) {
    score += 5;
  }

  // Stats-based scoring (if available)
  if (player.stats?.battingAverage) {
    score += Math.min(player.stats.battingAverage / 10, 20);
  }
  if (player.stats?.strikeRate) {
    score += Math.min(player.stats.strikeRate / 20, 10);
  }

  return score;
}

/**
 * Auto-generate a suggested batting order based on player roles and attributes
 */
export function suggestBattingOrder(players: Person[]): string[] {
  // Create a copy to avoid mutating original
  const playersCopy = [...players];
  
  // Calculate suitability scores
  const scoredPlayers = playersCopy.map(player => ({
    player,
    score: calculateBattingSuitability(player)
  }));

  // Sort by score (descending)
  scoredPlayers.sort((a, b) => b.score - a.score);

  // Extract player IDs in order
  const suggestedOrder = scoredPlayers.map(sp => sp.player.id);

  // Special handling: Ensure wicketkeeper is in middle order (positions 5-8)
  const wicketkeeperIndex = scoredPlayers.findIndex(
    sp => sp.player.playingRole === 'Wicketkeeper'
  );
  
  if (wicketkeeperIndex !== -1 && (wicketkeeperIndex < 4 || wicketkeeperIndex > 7)) {
    // Move wicketkeeper to position 6 (index 5)
    const [wicketkeeper] = suggestedOrder.splice(wicketkeeperIndex, 1);
    suggestedOrder.splice(5, 0, wicketkeeper);
  }

  return suggestedOrder.slice(0, 11); // Return only first 11
}

/**
 * Validate a batting order
 */
export function validateBattingOrder(
  order: string[],
  playingXI: string[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if all players in order are in playing XI
  const invalidPlayers = order.filter(playerId => !playingXI.includes(playerId));
  if (invalidPlayers.length > 0) {
    errors.push(`${invalidPlayers.length} player(s) in batting order are not in playing XI`);
  }

  // Check for duplicates
  const uniqueIds = new Set(order);
  if (uniqueIds.size !== order.length) {
    errors.push('Batting order contains duplicate players');
  }

  // Check if order has exactly 11 players
  if (order.length !== 11) {
    errors.push(`Batting order must have exactly 11 players (currently ${order.length})`);
  }

  // Warnings for unusual orders
  // Note: We'd need full player data to give role-based warnings
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get a descriptive label for a batting position
 */
export function getPositionLabel(index: number): string {
  if (index < 0 || index > 10) return 'Unknown';
  
  const labels: Record<number, string> = {
    0: 'Opener',
    1: 'Opener',
    2: 'First Drop',
    3: 'Middle Order',
    4: 'Middle Order',
    5: 'Middle Order',
    6: 'Lower Middle',
    7: 'Lower Order',
    8: 'Tail',
    9: 'Tail',
    10: 'Tail'
  };

  return labels[index] || 'Unknown';
}

/**
 * Get Tailwind color class for role badge
 */
export function getRoleColor(role?: string): string {
  if (!role) return 'bg-gray-500';
  
  const roleColors: Record<string, string> = {
    'Batsman': 'bg-blue-600',
    'Bowler': 'bg-red-600',
    'AllRounder': 'bg-purple-600',
    'Wicketkeeper': 'bg-green-600',
    'All-Rounder': 'bg-purple-600',
    'Wicket Keeper': 'bg-green-600'
  };

  return roleColors[role] || 'bg-gray-600';
}

/**
 * Get a short abbreviation for player role
 */
export function getRoleAbbreviation(role?: string): string {
  if (!role) return 'N/A';
  
  const abbreviations: Record<string, string> = {
    'Batsman': 'BAT',
    'Bowler': 'BWL',
    'AllRounder': 'AR',
    'All-Rounder': 'AR',
    'Wicketkeeper': 'WK',
    'Wicket Keeper': 'WK'
  };

  return abbreviations[role] || role.substring(0, 3).toUpperCase();
}
