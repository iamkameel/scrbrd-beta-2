'use server';

import admin from '@/lib/firebase-admin';

export interface PlayerStats {
  batting: {
    matches: number;
    innings: number;
    runs: number;
    average: number;
    strikeRate: number;
    highestScore: number;
    fifties: number;
    hundreds: number;
    fours: number;
    sixes: number;
  };
  bowling: {
    matches: number;
    innings: number;
    wickets: number;
    average: number;
    economy: number;
    bestFigures: string;
    fiveWickets: number;
    maidens: number;
  };
  fielding: {
    catches: number;
    stumpings: number;
    runOuts: number;
  };
}

export async function getPlayerStatsAction(playerId: string): Promise<{ success: boolean; stats?: PlayerStats; error?: string }> {
  try {
    // Fetch all completed matches where the player participated
    const matchesSnapshot = await admin.firestore()
      .collection('matches')
      .where('status', '==', 'completed')
      .get();

    const stats: PlayerStats = {
      batting: {
        matches: 0,
        innings: 0,
        runs: 0,
        average: 0,
        strikeRate: 0,
        highestScore: 0,
        fifties: 0,
        hundreds: 0,
        fours: 0,
        sixes: 0,
      },
      bowling: {
        matches: 0,
        innings: 0,
        wickets: 0,
        average: 0,
        economy: 0,
        bestFigures: '0/0',
        fiveWickets: 0,
        maidens: 0,
      },
      fielding: {
        catches: 0,
        stumpings: 0,
        runOuts: 0,
      },
    };

    let totalBalls = 0;
    let timesOut = 0;
    let bowlingRuns = 0;
    let bowlingBalls = 0;
    let bestWickets = 0;
    let bestRuns = 999;

    // Process each match to aggregate statistics
    for (const matchDoc of matchesSnapshot.docs) {
      const matchId = matchDoc.id;

      // Fetch liveScore subcollection for this match
      const liveScoreSnapshot = await admin.firestore()
        .collection('matches')
        .doc(matchId)
        .collection('liveScore')
        .get();

      for (const liveDoc of liveScoreSnapshot.docs) {
        const innings = liveDoc.data().innings;
        if (!innings || !innings.batsmen) continue;

        // Check batting stats
        const batsmanStats = innings.batsmen.find((b: any) => b.playerId === playerId);
        if (batsmanStats) {
          stats.batting.innings++;
          stats.batting.runs += batsmanStats.runs || 0;
          stats.batting.fours += batsmanStats.fours || 0;
          stats.batting.sixes += batsmanStats.sixes || 0;
          totalBalls += batsmanStats.balls || 0;

          if (batsmanStats.runs > stats.batting.highestScore) {
            stats.batting.highestScore = batsmanStats.runs;
          }
          if (batsmanStats.runs >= 50 && batsmanStats.runs < 100) {
            stats.batting.fifties++;
          }
          if (batsmanStats.runs >= 100) {
            stats.batting.hundreds++;
          }
          if (batsmanStats.isOut) {
            timesOut++;
          }
        }

        // Check bowling stats
        const bowlerStats = innings.bowlers?.find((b: any) => b.playerId === playerId);
        if (bowlerStats) {
          stats.bowling.innings++;
          stats.bowling.wickets += bowlerStats.wickets || 0;
          bowlingRuns += bowlerStats.runs || 0;
          bowlingBalls += (bowlerStats.overs || 0) * 6;
          stats.bowling.maidens += bowlerStats.maidens || 0;

          const wickets = bowlerStats.wickets || 0;
          const runs = bowlerStats.runs || 0;

          if (wickets >= 5) {
            stats.bowling.fiveWickets++;
          }
          if (wickets > bestWickets || (wickets === bestWickets && runs < bestRuns)) {
            bestWickets = wickets;
            bestRuns = runs;
            stats.bowling.bestFigures = `${wickets}/${runs}`;
          }
        }
      }
    }

    // Calculate averages and rates
    if (stats.batting.innings > 0) {
      stats.batting.matches = stats.batting.innings; // Simplified
      stats.batting.average = timesOut > 0 ? parseFloat((stats.batting.runs / timesOut).toFixed(2)) : stats.batting.runs;
      stats.batting.strikeRate = totalBalls > 0 ? parseFloat(((stats.batting.runs / totalBalls) * 100).toFixed(2)) : 0;
    }

    if (stats.bowling.innings > 0) {
      stats.bowling.matches = stats.bowling.innings;
      stats.bowling.average = stats.bowling.wickets > 0 ? parseFloat((bowlingRuns / stats.bowling.wickets).toFixed(2)) : 0;
      stats.bowling.economy = bowlingBalls > 0 ? parseFloat(((bowlingRuns / bowlingBalls) * 6).toFixed(2)) : 0;
    }

    return { success: true, stats };
  } catch (error) {
    console.error('Get player stats error:', error);
    return { success: false, error: (error as Error).message || 'Failed to fetch player statistics' };
  }
}

export async function getPlayerRecentMatchesAction(playerId: string, limit: number = 5) {
  try {
    const matchesSnapshot = await admin.firestore()
      .collection('matches')
      .where('status', '==', 'completed')
      .orderBy('matchDate', 'desc')
      .limit(limit * 2) // Fetch more to filter
      .get();

    const recentMatches = [];

    for (const matchDoc of matchesSnapshot.docs) {
      const matchData = { id: matchDoc.id, ...matchDoc.data() };

      // Check if player participated
      const liveScoreSnapshot = await admin.firestore()
        .collection('matches')
        .doc(matchDoc.id)
        .collection('liveScore')
        .get();

      let playerParticipated = false;
      let playerPerformance: any = {};

      for (const liveDoc of liveScoreSnapshot.docs) {
        const innings = liveDoc.data().innings;
        if (!innings) continue;

        const batsmanStats = innings.batsmen?.find((b: any) => b.playerId === playerId);
        const bowlerStats = innings.bowlers?.find((b: any) => b.playerId === playerId);

        if (batsmanStats || bowlerStats) {
          playerParticipated = true;
          playerPerformance = {
            batting: batsmanStats ? {
              runs: batsmanStats.runs || 0,
              balls: batsmanStats.balls || 0,
              fours: batsmanStats.fours || 0,
              sixes: batsmanStats.sixes || 0,
              isOut: batsmanStats.isOut || false,
            } : null,
            bowling: bowlerStats ? {
              wickets: bowlerStats.wickets || 0,
              runs: bowlerStats.runs || 0,
              overs: bowlerStats.overs || 0,
            } : null,
          };
        }
      }

      if (playerParticipated) {
        recentMatches.push({ ...matchData, playerPerformance });
        if (recentMatches.length >= limit) break;
      }
    }

    return { success: true, matches: recentMatches };
  } catch (error) {
    console.error('Get player recent matches error:', error);
    return { success: false, error: (error as Error).message || 'Failed to fetch recent matches' };
  }
}

export interface PerformanceDataPoint {
  matchDate: string;
  runs: number;
  wickets: number;
  strikeRate: number;
  economy: number;
  battingAverage: number;
}

export async function getPlayerPerformanceTrendsAction(playerId: string, limit: number = 10) {
  try {
    const matchesSnapshot = await admin.firestore()
      .collection('matches')
      .where('status', '==', 'completed')
      .orderBy('matchDate', 'desc')
      .limit(limit * 2)
      .get();

    const performanceData: PerformanceDataPoint[] = [];
    let cumulativeRuns = 0;
    let cumulativeOuts = 0;

    for (const matchDoc of matchesSnapshot.docs) {
      const matchData = matchDoc.data();
      const matchDate = matchData.matchDate;

      const liveScoreSnapshot = await admin.firestore()
        .collection('matches')
        .doc(matchDoc.id)
        .collection('liveScore')
        .get();

      let matchRuns = 0;
      let matchWickets = 0;
      let matchBalls = 0;
      let matchBowlingRuns = 0;
      let matchBowlingOvers = 0;
      let playerParticipated = false;

      for (const liveDoc of liveScoreSnapshot.docs) {
        const innings = liveDoc.data().innings;
        if (!innings) continue;

        const batsmanStats = innings.batsmen?.find((b: any) => b.playerId === playerId);
        const bowlerStats = innings.bowlers?.find((b: any) => b.playerId === playerId);

        if (batsmanStats) {
          playerParticipated = true;
          matchRuns += batsmanStats.runs || 0;
          matchBalls += batsmanStats.balls || 0;
          if (batsmanStats.isOut) {
            cumulativeOuts++;
          }
        }

        if (bowlerStats) {
          playerParticipated = true;
          matchWickets += bowlerStats.wickets || 0;
          matchBowlingRuns += bowlerStats.runs || 0;
          matchBowlingOvers += bowlerStats.overs || 0;
        }
      }

      if (playerParticipated) {
        cumulativeRuns += matchRuns;

        performanceData.push({
          matchDate: matchDate ? new Date(matchDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unknown',
          runs: matchRuns,
          wickets: matchWickets,
          strikeRate: matchBalls > 0 ? parseFloat(((matchRuns / matchBalls) * 100).toFixed(2)) : 0,
          economy: matchBowlingOvers > 0 ? parseFloat((matchBowlingRuns / matchBowlingOvers).toFixed(2)) : 0,
          battingAverage: cumulativeOuts > 0 ? parseFloat((cumulativeRuns / cumulativeOuts).toFixed(2)) : cumulativeRuns,
        });

        if (performanceData.length >= limit) break;
      }
    }

    return { success: true, data: performanceData.reverse() }; // Reverse to show chronological order
  } catch (error) {
    console.error('Get player performance trends error:', error);
    return { success: false, error: (error as Error).message || 'Failed to fetch performance trends' };
  }
}
