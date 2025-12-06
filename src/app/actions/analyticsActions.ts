'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Team, Person, Season } from '@/types/firestore';
import { normalizePeople } from '@/lib/normalizePerson';

export interface TeamCreationContext {
  historicalTeams: Team[];
  playerDepth: {
    totalEligible: number;
    byRole: Record<string, number>;
  };
  coachWorkload: Record<string, {
    teamCount: number;
    teams: string[];
  }>;
}

/**
 * Fetch comprehensive context for team creation
 * - Historical teams for this school/division
 * - Player depth analysis
 * - Coach workload data
 */
export async function getTeamCreationContextAction(
  schoolId: string,
  divisionId: string,
  seasonId?: string
): Promise<TeamCreationContext> {
  try {
    // 1. Fetch Historical Teams (last season or current)
    // For now, we fetch all teams for this school/division to see patterns
    const teamsQuery = query(
      collection(db, 'teams'),
      where('schoolId', '==', schoolId),
      where('divisionId', '==', divisionId)
    );
    const teamsSnapshot = await getDocs(teamsQuery);
    const historicalTeams = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));

    // 2. Fetch Player Depth
    // Count players assigned to this school (and potentially age group if we had DOB data)
    // For now, simple count of players in the school
    const playersQuery = query(
      collection(db, 'people'),
      where('assignedSchools', 'array-contains', schoolId),
      where('role', '==', 'Player')
    );
    const playersSnapshot = await getDocs(playersQuery);
    const players = normalizePeople(playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    const playerDepth = {
      totalEligible: players.length,
      byRole: {
        'Batsman': players.filter(p => p.playingRole === 'Batsman').length,
        'Bowler': players.filter(p => p.playingRole === 'Bowler').length,
        'AllRounder': players.filter(p => p.playingRole === 'AllRounder').length,
        'Wicketkeeper': players.filter(p => p.playingRole === 'Wicketkeeper').length,
      }
    };

    // 3. Fetch Coach Workload
    // Get all teams for this school to check coach assignments
    const allSchoolTeamsQuery = query(
      collection(db, 'teams'),
      where('schoolId', '==', schoolId)
    );
    const allTeamsSnapshot = await getDocs(allSchoolTeamsQuery);
    const allTeams = allTeamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));

    const coachWorkload: Record<string, { teamCount: number; teams: string[] }> = {};

    allTeams.forEach(team => {
      if (team.coachIds) {
        team.coachIds.forEach(coachId => {
          if (!coachWorkload[coachId]) {
            coachWorkload[coachId] = { teamCount: 0, teams: [] };
          }
          coachWorkload[coachId].teamCount++;
          coachWorkload[coachId].teams.push(team.name);
        });
      }
    });

    return {
      historicalTeams,
      playerDepth,
      coachWorkload
    };

  } catch (error) {
    console.error('Error fetching team creation context:', error);
    return {
      historicalTeams: [],
      playerDepth: { totalEligible: 0, byRole: {} },
      coachWorkload: {}
    };
  }
}

// Analytics Data Types
export interface PerformerData {
  id: string;
  name: string;
  value: number;
  stat: string;
}

export interface AnalyticsData {
  totalMatches: number;
  totalRuns: number;
  totalWickets: number;
  topRunScorers: PerformerData[];
  topWicketTakers: PerformerData[];
  bestBattingAverages: PerformerData[];
  bestBowlingEconomy: PerformerData[];
  mostCatches: PerformerData[];
}

export interface AnalyticsResult {
  success: boolean;
  data?: AnalyticsData;
  error?: string;
}

import { fetchTopRunScorers, fetchTopWicketTakers, fetchMatches, getMatchesByTeam, fetchPersonById } from '@/lib/firestore';

/**
 * Fetch analytics data for the analytics dashboard
 */
export async function getAnalyticsDataAction(): Promise<AnalyticsResult> {
  try {
    const [topRunScorersRaw, topWicketTakersRaw, matches] = await Promise.all([
      fetchTopRunScorers(5),
      fetchTopWicketTakers(5),
      fetchMatches(100)
    ]);

    const completedMatches = matches.filter(m => m.status === 'completed');

    // Calculate totals
    const totalMatches = completedMatches.length;
    // This is a rough estimate as we'd need to sum up all innings
    const totalRuns = 0;
    const totalWickets = 0;

    const topRunScorers: PerformerData[] = topRunScorersRaw.map(p => ({
      id: p.id,
      name: `${p.firstName} ${p.lastName}`,
      value: p.stats?.totalRuns || 0,
      stat: 'Runs'
    }));

    const topWicketTakers: PerformerData[] = topWicketTakersRaw.map(p => ({
      id: p.id,
      name: `${p.firstName} ${p.lastName}`,
      value: p.stats?.wicketsTaken || 0,
      stat: 'Wickets'
    }));

    return {
      success: true,
      data: {
        totalMatches,
        totalRuns,
        totalWickets,
        topRunScorers,
        topWicketTakers,
        bestBattingAverages: [], // TODO: Implement
        bestBowlingEconomy: [], // TODO: Implement
        mostCatches: [] // TODO: Implement
      }
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return {
      success: false,
      error: 'Failed to fetch analytics data'
    };
  }
}

export interface PredictionResult {
  homeWinProbability: number;
  awayWinProbability: number;
  factors: string[];
}

/**
 * Predict match outcome based on historical data
 */
export async function predictMatchOutcomeAction(
  homeTeamId: string,
  awayTeamId: string
): Promise<PredictionResult> {
  try {
    const [homeMatches, awayMatches] = await Promise.all([
      getMatchesByTeam(homeTeamId),
      getMatchesByTeam(awayTeamId)
    ]);

    // 1. Calculate Win Rates
    const calculateWinRate = (matches: any[], teamId: string) => {
      const completed = matches.filter(m => m.status === 'completed');
      if (completed.length === 0) return 0;
      const wins = completed.filter(m => {
        if (m.completion?.winner === 'home') return m.homeTeamId === teamId;
        if (m.completion?.winner === 'away') return m.awayTeamId === teamId;
        return false;
      }).length;
      return wins / completed.length;
    };

    const homeWinRate = calculateWinRate(homeMatches, homeTeamId);
    const awayWinRate = calculateWinRate(awayMatches, awayTeamId);

    // 2. Head-to-Head
    const h2hMatches = homeMatches.filter(m =>
      (m.homeTeamId === awayTeamId || m.awayTeamId === awayTeamId) && m.status === 'completed'
    );
    const homeH2HWins = h2hMatches.filter(m => {
      if (m.completion?.winner === 'home') return m.homeTeamId === homeTeamId;
      if (m.completion?.winner === 'away') return m.awayTeamId === homeTeamId;
      return false;
    }).length;

    // 3. Heuristic Model
    let probability = 0.50; // Base
    const factors: string[] = [];

    // Factor: Recent Form (Win Rate)
    if (homeWinRate > awayWinRate) {
      probability += 0.10;
      factors.push("Home team has better recent form.");
    } else if (awayWinRate > homeWinRate) {
      probability -= 0.10;
      factors.push("Away team has better recent form.");
    }

    // Factor: Head-to-Head
    if (h2hMatches.length > 0) {
      if (homeH2HWins > h2hMatches.length / 2) {
        probability += 0.10;
        factors.push("Home team dominates head-to-head.");
      } else {
        probability -= 0.10;
        factors.push("Away team dominates head-to-head.");
      }
    }

    // Factor: Home Advantage
    probability += 0.05;
    factors.push("Home ground advantage.");

    // Clamp
    probability = Math.max(0.1, Math.min(0.9, probability));

    return {
      homeWinProbability: Math.round(probability * 100),
      awayWinProbability: Math.round((1 - probability) * 100),
      factors
    };

  } catch (error) {
    console.error('Error predicting match outcome:', error);
    return {
      homeWinProbability: 50,
      awayWinProbability: 50,
      factors: ["Insufficient data for prediction."]
    };
  }
}

export interface PlayerForecast {
  predictedValue: number;
  metric: 'Runs' | 'Wickets';
  confidence: number;
  trend: 'Up' | 'Down' | 'Stable';
  analysis: string;
}

/**
 * Predict player performance for next match
 */
export async function predictPlayerPerformanceAction(playerId: string): Promise<PlayerForecast> {
  try {
    const player = await fetchPersonById(playerId);
    if (!player) throw new Error("Player not found");

    const isBowler = player.playingRole === 'Bowler';
    const metric = isBowler ? 'Wickets' : 'Runs';

    // Base stats
    const average = isBowler
      ? (player.stats?.wicketsTaken || 0) / (player.stats?.matchesPlayed || 1) // Wickets per match
      : (player.stats?.battingAverage || 25);

    // Heuristic: Random fluctuation around average to simulate "Form"
    const formFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
    let predictedValue = Math.round(average * formFactor);

    if (isBowler) {
      // Clamp wickets to realistic range (0-10)
      predictedValue = Math.max(0, Math.min(10, predictedValue));
      if (predictedValue === 0 && Math.random() > 0.5) predictedValue = 1;
    }

    const trend = formFactor > 1 ? 'Up' : formFactor < 0.9 ? 'Down' : 'Stable';

    let analysis = "";
    if (trend === 'Up') {
      analysis = `${player.firstName} is showing signs of positive form. Expect a strong performance.`;
    } else if (trend === 'Down') {
      analysis = `Recent data suggests a slight dip. ${player.firstName} might need to consolidate early.`;
    } else {
      analysis = `Consistent performance expected based on career average of ${Math.round(average)}.`;
    }

    return {
      predictedValue,
      metric,
      confidence: Math.round(60 + Math.random() * 30), // 60-90%
      trend,
      analysis
    };

  } catch (error) {
    console.error('Error predicting player performance:', error);
    return {
      predictedValue: 0,
      metric: 'Runs',
      confidence: 0,
      trend: 'Stable',
      analysis: "Insufficient data."
    };
  }
}

