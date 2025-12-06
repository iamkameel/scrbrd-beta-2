// Points Table Utility Functions

export interface TeamStanding {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  noResult: number;
  points: number;
  runsFor: number;
  ballsFor: number;
  runsAgainst: number;
  ballsAgainst: number;
  netRunRate: number;
}

/**
 * Calculate Net Run Rate (NRR)
 * NRR = (Total Runs Scored / Total Overs Faced) - (Total Runs Conceded / Total Overs Bowled)
 */
export function calculateNRR(
  runsFor: number,
  ballsFor: number,
  runsAgainst: number,
  ballsAgainst: number
): number {
  if (ballsFor === 0 || ballsAgainst === 0) return 0;
  
  const runRateFor = runsFor / (ballsFor / 6); // Convert balls to overs
  const runRateAgainst = runsAgainst / (ballsAgainst / 6);
  
  return parseFloat((runRateFor - runRateAgainst).toFixed(3));
}

/**
 * Sort team standings by:
 * 1. Points (descending)
 * 2. Net Run Rate (descending)
 * 3. Wins (descending)
 */
export function sortStandings(teams: TeamStanding[]): TeamStanding[] {
  return teams.sort((a, b) => {
    // First by points
    if (b.points !== a.points) return b.points - a.points;
    
    // Then by net run rate
    if (b.netRunRate !== a.netRunRate) return b.netRunRate - a.netRunRate;
    
    // Then by wins
    return b.won - a.won;
  });
}

/**
 * Calculate points based on match result
 * Win: 2 points
 * Tie/No Result: 1 point
 * Loss: 0 points
 */
export function calculatePoints(won: number, tied: number, noResult: number): number {
  return (won * 2) + (tied * 1) + (noResult * 1);
}

/**
 * Extract score information from match data
 */
export function extractMatchScores(match: any): {
  homeRuns: number;
  homeBalls: number;
  awayRuns: number;
  awayBalls: number;
} {
  // Default values
  let homeRuns = 0;
  let homeBalls = 0;
  let awayRuns = 0;
  let awayBalls = 0;

  // Try to parse from score string (e.g., "245/8")
  if (match.score?.home) {
    const homeScore = match.score.home.split('/');
    homeRuns = parseInt(homeScore[0]) || 0;
  }
  if (match.score?.away) {
    const awayScore = match.score.away.split('/');
    awayRuns = parseInt(awayScore[0]) || 0;
  }

  // Calculate balls from overs if available
  if (match.overs) {
    const totalBalls = match.overs * 6;
    homeBalls = totalBalls;
    awayBalls = totalBalls;
  }

  // Try to get from homeScore/awayScore fields
  if (match.homeScore !== undefined) homeRuns = match.homeScore;
  if (match.awayScore !== undefined) awayRuns = match.awayScore;

  return { homeRuns, homeBalls, awayRuns, awayBalls };
}
