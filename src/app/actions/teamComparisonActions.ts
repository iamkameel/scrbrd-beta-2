'use server';

import admin from '@/lib/firebase-admin';

export interface HeadToHeadStats {
  team1: {
    id: string;
    name: string;
    wins: number;
    losses: number;
    ties: number;
    totalRuns: number;
    totalWickets: number;
  };
  team2: {
    id: string;
    name: string;
    wins: number;
    losses: number;
    ties: number;
    totalRuns: number;
    totalWickets: number;
  };
  totalMatches: number;
  recentMatches: Array<{
    id: string;
    date: string;
    winner: string;
    result: string;
  }>;
}

export async function getHeadToHeadStatsAction(
  team1Id: string,
  team2Id: string
): Promise<{ success: boolean; stats?: HeadToHeadStats; error?: string }> {
  try {
    // Fetch team names
    const [team1Doc, team2Doc] = await Promise.all([
      admin.firestore().collection('teams').doc(team1Id).get(),
      admin.firestore().collection('teams').doc(team2Id).get(),
    ]);

    const team1Data = team1Doc.data();
    const team2Data = team2Doc.data();

    if (!team1Data || !team2Data) {
      return { success: false, error: 'One or both teams not found' };
    }

    // Fetch matches between these teams
    const matchesSnapshot = await admin.firestore()
      .collection('matches')
      .where('status', '==', 'completed')
      .get();

    const relevantMatches = matchesSnapshot.docs.filter(doc => {
      const match = doc.data();
      return (
        (match.homeTeamId === team1Id && match.awayTeamId === team2Id) ||
        (match.homeTeamId === team2Id && match.awayTeamId === team1Id)
      );
    });

    const stats: HeadToHeadStats = {
      team1: {
        id: team1Id,
        name: team1Data.name,
        wins: 0,
        losses: 0,
        ties: 0,
        totalRuns: 0,
        totalWickets: 0,
      },
      team2: {
        id: team2Id,
        name: team2Data.name,
        wins: 0,
        losses: 0,
        ties: 0,
        totalRuns: 0,
        totalWickets: 0,
      },
      totalMatches: relevantMatches.length,
      recentMatches: [],
    };

    // Process matches
    for (const matchDoc of relevantMatches.slice(0, 10)) {
      const match = matchDoc.data();
      const matchId = matchDoc.id;

      // Determine winner
      const team1IsHome = match.homeTeamId === team1Id;
      const winner = match.completion?.winner;

      if (winner === 'tie') {
        stats.team1.ties++;
        stats.team2.ties++;
      } else if (winner === 'home') {
        if (team1IsHome) {
          stats.team1.wins++;
          stats.team2.losses++;
        } else {
          stats.team2.wins++;
          stats.team1.losses++;
        }
      } else if (winner === 'away') {
        if (team1IsHome) {
          stats.team2.wins++;
          stats.team1.losses++;
        } else {
          stats.team1.wins++;
          stats.team2.losses++;
        }
      }

      // Add to recent matches
      stats.recentMatches.push({
        id: matchId,
        date: match.matchDate ? new Date(match.matchDate).toLocaleDateString() : 'Unknown',
        winner: winner === 'tie' ? 'Tie' : winner === 'home' ? (team1IsHome ? team1Data.name : team2Data.name) : (team1IsHome ? team2Data.name : team1Data.name),
        result: match.result || 'Result unknown',
      });
    }

    return { success: true, stats };
  } catch (error) {
    console.error('Get head-to-head stats error:', error);
    return { success: false, error: (error as Error).message || 'Failed to fetch head-to-head stats' };
  }
}
