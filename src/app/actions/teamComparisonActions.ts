'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { normalizePeople } from '@/lib/normalizePerson';

export interface TeamComparison {
  category: string;
  homeScore: number;
  awayScore: number;
  fullMark: number;
}

export interface TeamComparisonResult {
  success: boolean;
  data?: TeamComparison[];
  error?: string;
}

/**
 * Compare two teams across various metrics
 */
export async function compareTeamsAction(homeTeamId: string, awayTeamId: string): Promise<TeamComparisonResult> {
  try {
    // Fetch players for both teams
    const fetchTeamPlayers = async (teamId: string) => {
      const q = query(collection(db, 'people'), where('currentTeamId', '==', teamId));
      const snapshot = await getDocs(q);
      return normalizePeople(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const [homePlayers, awayPlayers] = await Promise.all([
      fetchTeamPlayers(homeTeamId),
      fetchTeamPlayers(awayTeamId)
    ]);

    // Helper to calculate aggregate score (0-100 scale)
    const calculateScore = (players: any[], metric: 'batting' | 'bowling' | 'fielding' | 'experience') => {
      if (players.length === 0) return 50; // Default average

      let totalScore = 0;
      let count = 0;

      players.forEach(p => {
        // Use stats if available, otherwise fallback to heuristics or random for demo
        // In a real app, this would use the detailed Attribute Matrix

        let score = 50; // Base

        if (metric === 'batting') {
          const avg = p.stats?.battingAverage || 0;
          score = Math.min(100, (avg / 50) * 100); // 50 avg = 100 score
          if (p.playingRole === 'Batsman' || p.playingRole === 'AllRounder') count++;
        } else if (metric === 'bowling') {
          const wkts = p.stats?.wicketsTaken || 0;
          score = Math.min(100, (wkts / 20) * 100); // 20 wickets = 100 score
          if (p.playingRole === 'Bowler' || p.playingRole === 'AllRounder') count++;
        } else if (metric === 'fielding') {
          // Mock fielding score based on catches
          const catches = p.stats?.catches || 0;
          score = Math.min(100, 50 + (catches * 5));
          count++;
        } else if (metric === 'experience') {
          const matches = p.stats?.matchesPlayed || 0;
          score = Math.min(100, (matches / 50) * 100);
          count++;
        }

        if (score > 0) totalScore += score;
      });

      return count > 0 ? Math.round(totalScore / count) : 50;
    };

    const data: TeamComparison[] = [
      {
        category: 'Batting Depth',
        homeScore: calculateScore(homePlayers, 'batting'),
        awayScore: calculateScore(awayPlayers, 'batting'),
        fullMark: 100
      },
      {
        category: 'Bowling Attack',
        homeScore: calculateScore(homePlayers, 'bowling'),
        awayScore: calculateScore(awayPlayers, 'bowling'),
        fullMark: 100
      },
      {
        category: 'Fielding',
        homeScore: calculateScore(homePlayers, 'fielding'),
        awayScore: calculateScore(awayPlayers, 'fielding'),
        fullMark: 100
      },
      {
        category: 'Experience',
        homeScore: calculateScore(homePlayers, 'experience'),
        awayScore: calculateScore(awayPlayers, 'experience'),
        fullMark: 100
      },
      {
        category: 'Recent Form',
        homeScore: Math.round(40 + Math.random() * 50), // Mock for now
        awayScore: Math.round(40 + Math.random() * 50), // Mock for now
        fullMark: 100
      }
    ];

    return {
      success: true,
      data
    };

  } catch (error) {
    console.error('Error comparing teams:', error);
    return {
      success: false,
      error: 'Failed to compare teams'
    };
  }
}
import { Match, Team } from '@/types/firestore';
import { fetchDocument } from '@/lib/firestore';

export interface HeadToHeadStats {
  totalMatches: number;
  team1: {
    name: string;
    wins: number;
    ties: number;
  };
  team2: {
    name: string;
    wins: number;
    ties: number;
  };
  recentMatches: Array<{
    id: string;
    date: string;
    result: string;
    winner: string;
  }>;
}

export async function getHeadToHeadStatsAction(team1Id: string, team2Id: string): Promise<{ success: boolean; stats?: HeadToHeadStats; error?: string }> {
  try {
    // Fetch team details
    const [team1, team2] = await Promise.all([
      fetchDocument<Team>('teams', team1Id),
      fetchDocument<Team>('teams', team2Id)
    ]);

    if (!team1 || !team2) {
      return { success: false, error: 'One or both teams not found' };
    }

    // Fetch matches between these two teams
    // Note: Firestore doesn't support logical OR in where clauses easily for this cross-match
    // So we fetch both combinations
    const q1 = query(collection(db, 'matches'), where('homeTeamId', '==', team1Id), where('awayTeamId', '==', team2Id));
    const q2 = query(collection(db, 'matches'), where('homeTeamId', '==', team2Id), where('awayTeamId', '==', team1Id));

    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    const matches = [...snap1.docs, ...snap2.docs]
      .map(d => ({ id: d.id, ...d.data() } as Match))
      .filter(m => m.status === 'completed')
      .sort((a, b) => new Date(b.dateTime || '').getTime() - new Date(a.dateTime || '').getTime());

    const stats: HeadToHeadStats = {
      totalMatches: matches.length,
      team1: { name: team1.name, wins: 0, ties: 0 },
      team2: { name: team2.name, wins: 0, ties: 0 },
      recentMatches: []
    };

    matches.forEach(m => {
      if (m.result?.toLowerCase().includes('won')) {
        // Determine winner
        // This relies on result string parsing or completion data
        // Assuming result string like "Team A won by..."
        if (m.result.includes(team1.name)) stats.team1.wins++;
        else if (m.result.includes(team2.name)) stats.team2.wins++;
      } else if (m.result?.toLowerCase().includes('tie') || m.result?.toLowerCase().includes('draw')) {
        stats.team1.ties++;
        stats.team2.ties++;
      }

      if (stats.recentMatches.length < 5) {
        stats.recentMatches.push({
          id: m.id,
          date: m.dateTime ? new Date(m.dateTime).toLocaleDateString() : 'Unknown',
          result: m.result || 'Result TBA',
          winner: m.result?.includes(team1.name) ? team1.name : m.result?.includes(team2.name) ? team2.name : 'Draw'
        });
      }
    });

    return { success: true, stats };

  } catch (error) {
    console.error('Error fetching head-to-head stats:', error);
    return { success: false, error: 'Failed to fetch stats' };
  }
}
