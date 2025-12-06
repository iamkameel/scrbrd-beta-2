'use server';

import { createDocument, updateDocument, deleteDocument } from '@/lib/firestore';
import { MatchSchema } from '@/lib/schemas/matchSchemas';
import admin from 'firebase-admin';
import { Match, Person } from '@/types/firestore';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ZodError } from 'zod';

export type MatchActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function createMatchAction(
  prevState: MatchActionState,
  formData: FormData
): Promise<MatchActionState> {
  try {
    const rawData = {
      homeTeamId: formData.get('homeTeamId'),
      awayTeamId: formData.get('awayTeamId'),
      matchDate: formData.get('matchDate'),
      matchTime: formData.get('matchTime') || undefined,
      fieldId: formData.get('fieldId') || undefined,
      leagueId: formData.get('leagueId') || undefined,
      seasonId: formData.get('seasonId') || undefined,
      isDayNight: formData.get('isDayNight') === 'on',
      status: formData.get('status') || 'scheduled',
      matchType: formData.get('matchType') || 'T20',
      overs: formData.get('overs') ? Number(formData.get('overs')) : undefined,
      scorer: formData.get('scorer') || undefined,
      notes: formData.get('notes') || undefined,
    };

    const validatedData = MatchSchema.parse(rawData);

    const matchDate = formData.get('matchDate') as string;
    const matchTime = formData.get('matchTime') as string || '00:00';
    let dateTime = new Date().toISOString();
    try {
      if (matchDate) {
        dateTime = new Date(`${matchDate}T${matchTime}`).toISOString();
      }
    } catch (e) {
      console.error('Error parsing date:', e);
    }

    const newMatchData: Omit<Match, 'id'> = {
      ...validatedData,
      dateTime, // Populate legacy field for sorting
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any;

    await createDocument<Omit<Match, 'id'>>('matches', newMatchData);

    revalidatePath('/matches');
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      error.issues.forEach((err: any) => {
        const field = String(err.path[0]);
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(err.message);
      });
      return { fieldErrors };
    }
    console.error('Create match error:', error);
    return { error: (error as Error).message || 'Failed to create match' };
  }
  redirect('/matches');
}

export async function updateMatchAction(
  id: string,
  prevState: MatchActionState,
  formData: FormData
): Promise<MatchActionState> {
  try {
    const rawData = {
      homeTeamId: formData.get('homeTeamId'),
      awayTeamId: formData.get('awayTeamId'),
      matchDate: formData.get('matchDate'),
      matchTime: formData.get('matchTime') || undefined,
      fieldId: formData.get('fieldId') || undefined,
      leagueId: formData.get('leagueId') || undefined,
      seasonId: formData.get('seasonId') || undefined,
      isDayNight: formData.get('isDayNight') === 'on',
      status: formData.get('status') || 'scheduled',
      matchType: formData.get('matchType') || 'T20',
      overs: formData.get('overs') ? Number(formData.get('overs')) : undefined,
      scorer: formData.get('scorer') || undefined,
      notes: formData.get('notes') || undefined,
    };

    const validatedData = MatchSchema.parse(rawData);

    const matchDate = formData.get('matchDate') as string;
    const matchTime = formData.get('matchTime') as string || '00:00';
    let dateTime: string | undefined;
    try {
      if (matchDate) {
        dateTime = new Date(`${matchDate}T${matchTime}`).toISOString();
      }
    } catch (e) {
      console.error('Error parsing date:', e);
    }

    const updateData: Partial<Match> = {
      ...validatedData,
      ...(dateTime && { dateTime }), // Update legacy field if date changed
      updatedAt: new Date().toISOString(),
    } as any;

    await updateDocument<Match>('matches', id, updateData);

    revalidatePath('/matches');
    revalidatePath(`/matches/${id}`);
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      error.issues.forEach((err: any) => {
        const field = String(err.path[0]);
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(err.message);
      });
      return { fieldErrors };
    }
    console.error('Update match error:', error);
    return { error: (error as Error).message || 'Failed to update match' };
  }
  redirect(`/matches`);
}

export async function deleteMatchAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDocument('matches', id);
    revalidatePath('/matches');
    return { success: true };
  } catch (error) {
    console.error('Delete match error:', error);
    return { success: false, error: (error as Error).message || 'Failed to delete match' };
  }
}

// --- Live Scoring Actions ---

export async function updateLivePlayersAction(
  matchId: string,
  updates: {
    strikerId?: string;
    nonStrikerId?: string;
    bowlerId?: string;
    bowlingAngle?: 'Over the Wicket' | 'Round the Wicket';
  }
) {
  'use server';

  try {
    const liveScoreRef = admin.firestore()
      .collection('matches')
      .doc(matchId)
      .collection('live')
      .doc('score');

    const liveScoreDoc = await liveScoreRef.get();

    if (!liveScoreDoc.exists) {
      return { success: false, error: 'Match not in live state' };
    }

    const liveScore = liveScoreDoc.data() as any;
    const updateData: any = {};

    // Update striker
    if (updates.strikerId) {
      updateData['currentPlayers.strikerId'] = updates.strikerId;

      // Ensure striker exists in batsmen array
      const strikerExists = liveScore.batsmen?.some((b: any) => b.playerId === updates.strikerId);
      if (!strikerExists) {
        // Add new batsman with initial stats
        const batsmen = liveScore.batsmen || [];
        batsmen.push({
          playerId: updates.strikerId,
          runs: 0,
          ballsFaced: 0,
          fours: 0,
          sixes: 0,
          strikeRate: 0,
          isOut: false
        });
        updateData.batsmen = batsmen;
      }
    }

    // Update non-striker
    if (updates.nonStrikerId) {
      updateData['currentPlayers.nonStrikerId'] = updates.nonStrikerId;

      // Ensure non-striker exists in batsmen array
      const nonStrikerExists = liveScore.batsmen?.some((b: any) => b.playerId === updates.nonStrikerId);
      if (!nonStrikerExists) {
        const batsmen = updateData.batsmen || liveScore.batsmen || [];
        batsmen.push({
          playerId: updates.nonStrikerId,
          runs: 0,
          ballsFaced: 0,
          fours: 0,
          sixes: 0,
          strikeRate: 0,
          isOut: false
        });
        updateData.batsmen = batsmen;
      }
    }

    // Update bowler
    if (updates.bowlerId) {
      updateData['currentPlayers.bowlerId'] = updates.bowlerId;

      // Ensure bowler exists in bowlers array
      const bowlerExists = liveScore.bowlers?.some((b: any) => b.playerId === updates.bowlerId);
      if (!bowlerExists) {
        const bowlers = liveScore.bowlers || [];
        bowlers.push({
          playerId: updates.bowlerId,
          overs: 0,
          ballsBowled: 0,
          runsConceded: 0,
          wickets: 0,
          wides: 0,
          noballs: 0,
          economy: 0
        });
        updateData.bowlers = bowlers;
      }
    }

    // Update bowling angle
    if (updates.bowlingAngle) {
      updateData['currentPlayers.bowlingAngle'] = updates.bowlingAngle;
    }

    updateData.lastUpdated = new Date().toISOString();

    await liveScoreRef.update(updateData);

    return { success: true };

  } catch (error) {
    console.error('updateLivePlayersAction error:', error);
    return { success: false, error: (error as Error).message || 'Failed to update players' };
  }
}

export async function recordBallAction(matchId: string, ballData: any) {
  'use server';

  try {
    // Get current live score
    const liveScoreRef = admin.firestore()
      .collection('matches')
      .doc(matchId)
      .collection('live')
      .doc('score');

    const liveScoreDoc = await liveScoreRef.get();

    if (!liveScoreDoc.exists) {
      return { success: false, error: 'Match not in live state' };
    }

    const liveScore = liveScoreDoc.data() as any;

    // Calculate ball runs (off bat + extras)
    const runsOffBat = ballData.runs || 0;
    const extraRuns = ballData.extraRuns || 0;
    const totalRuns = runsOffBat + extraRuns;
    const isWicket = ballData.isWicket || false;
    const wicketType = ballData.wicketType;

    // Check if this counts as a legal delivery
    const isLegalDelivery = !['wide', 'noball'].includes(ballData.extraType);

    // Update ball count
    let currentBalls = liveScore.currentInnings.balls || 0;
    if (isLegalDelivery) {
      currentBalls++;
    }

    // Update runs
    const currentRuns = liveScore.currentInnings.runs || 0;
    const newRuns = currentRuns + totalRuns;

    // Update wickets
    let currentWickets = liveScore.currentInnings.wickets || 0;
    if (isWicket) {
      currentWickets++;
    }

    // Update striker stats
    const strikerStats = liveScore.batsmen.find((b: any) => b.playerId === ballData.strikerId);
    if (strikerStats) {
      strikerStats.runs += runsOffBat;
      strikerStats.ballsFaced += isLegalDelivery ? 1 : 0;
      if (runsOffBat === 4) strikerStats.fours = (strikerStats.fours || 0) + 1;
      if (runsOffBat === 6) strikerStats.sixes = (strikerStats.sixes || 0) + 1;
      strikerStats.strikeRate = strikerStats.ballsFaced > 0
        ? (strikerStats.runs / strikerStats.ballsFaced) * 100
        : 0;

      // Handle Dismissal
      if (isWicket) {
        // Assumption: Striker is out unless specified otherwise (Run Out logic to be enhanced later)
        strikerStats.isOut = true;
        strikerStats.howOut = wicketType;
        strikerStats.bowlerId = ballData.bowlerId;

        // Clear current striker so UI prompts for new batsman
        liveScore.currentPlayers.strikerId = null;
      }
    }

    // Update bowler stats
    const bowlerStats = liveScore.bowlers.find((b: any) => b.playerId === ballData.bowlerId);
    if (bowlerStats) {
      bowlerStats.runsConceded += totalRuns;
      if (isLegalDelivery) {
        bowlerStats.ballsBowled++;
        bowlerStats.overs = Math.floor(bowlerStats.ballsBowled / 6) + (bowlerStats.ballsBowled % 6) / 10;
      }
      if (isWicket) bowlerStats.wickets = (bowlerStats.wickets || 0) + 1;
      if (ballData.extraType === 'wide') bowlerStats.wides = (bowlerStats.wides || 0) + 1;
      if (ballData.extraType === 'noball') bowlerStats.noballs = (bowlerStats.noballs || 0) + 1;
      bowlerStats.economy = bowlerStats.overs > 0
        ? bowlerStats.runsConceded / bowlerStats.overs
        : 0;
    }

    // Create ball object for history
    const ball = {
      runs: runsOffBat,
      isWicket,
      wicketType: ballData.wicketType,
      strikerId: ballData.strikerId,
      bowlerId: ballData.bowlerId,
      extraType: ballData.extraType,
      extraRuns,
      coordinates: ballData.coordinates,
      fielderIds: ballData.fielderIds,
      timestamp: new Date().toISOString()
    };

    // Add to ball history
    const ballHistory = liveScore.ballHistory || [];
    ballHistory.push(ball);

    // Check for milestones
    let milestone = null;
    if (strikerStats) {
      if (strikerStats.runs === 50 || strikerStats.runs === 100 || strikerStats.runs === 150) {
        milestone = `${strikerStats.runs}`;
      }
    }

    // Check for over completion
    const isOverComplete = currentBalls % 6 === 0 && currentBalls > 0;

    // Check for maiden over
    let isMaidenOver = false;
    if (isOverComplete && bowlerStats) {
      const lastSixBalls = ballHistory.slice(-6);
      const runsInOver = lastSixBalls.reduce((sum: number, b: any) => sum + (b.runs + (b.extraRuns || 0)), 0);
      isMaidenOver = runsInOver === 0;
    }

    // --- Strike Rotation Logic ---
    let nextStrikerId = liveScore.currentPlayers.strikerId;
    let nextNonStrikerId = liveScore.currentPlayers.nonStrikerId;

    // 1. Rotate for runs (odd runs = swap)
    // Note: Wides/No-balls count for crossing if runs are taken. 
    // We use totalRuns for this, assuming standard crossing rules.
    if (totalRuns % 2 !== 0) {
      const temp = nextStrikerId;
      nextStrikerId = nextNonStrikerId;
      nextNonStrikerId = temp;
    }

    // 2. Rotate for Over Completion (End Change = swap)
    if (isOverComplete) {
      const temp = nextStrikerId;
      nextStrikerId = nextNonStrikerId;
      nextNonStrikerId = temp;
    }

    // 3. Handle Wicket (Striker is gone)
    if (isWicket) {
      // If it was a run out at non-striker end, we might need complex logic, 
      // but for now assume striker is out.
      // The new batsman will take the striker's place (or non-striker's if crossed).
      // For simplicity in this MVP: Clear strikerId. 
      // The user will select the new batsman, who will become the striker.
      // If they crossed, we should have swapped non-striker to striker position above?
      // Actually, if a wicket falls, the new batsman usually takes the striker's end 
      // (unless they crossed, then non-striker is at striker's end).
      // Let's keep it simple: Just clear the *current* strikerId.
      // If we swapped due to runs, 'nextStrikerId' is the one who is now at the striker end.
      // So we clear 'nextStrikerId'.
      nextStrikerId = null;
    }

    // --- Hat-Trick Detection ---
    // A hat-trick occurs when a bowler takes 3 consecutive wickets
    let isHatTrick = false;
    if (isWicket && bowlerStats) {
      // Get all wickets from ball history
      const wicketBalls = ballHistory.filter((b: any) => b.isWicket);

      // Check if we have at least 3 wickets
      if (wicketBalls.length >= 3) {
        // Get the last 3 wickets
        const lastThreeWickets = wicketBalls.slice(-3);

        // Check if all 3 were taken by the same bowler (current bowler)
        const allBySameBowler = lastThreeWickets.every(
          (w: any) => w.bowlerId === ballData.bowlerId
        );

        if (allBySameBowler) {
          isHatTrick = true;
        }
      }
    }

    // Update live score document
    await liveScoreRef.update({
      'currentInnings.runs': newRuns,
      'currentInnings.wickets': currentWickets,
      'currentInnings.balls': currentBalls,
      'currentInnings.overs': Math.floor(currentBalls / 6) + (currentBalls % 6) / 10,
      'currentPlayers.strikerId': nextStrikerId,
      'currentPlayers.nonStrikerId': nextNonStrikerId,
      'currentPlayers.bowlerId': isOverComplete ? null : liveScore.currentPlayers.bowlerId, // Clear bowler if over complete
      batsmen: liveScore.batsmen,
      bowlers: liveScore.bowlers,
      ballHistory,
      lastUpdated: new Date().toISOString()
    });

    return {
      success: true,
      milestone,
      isHatTrick,
      isDuck: isWicket && strikerStats?.runs === 0,
      isMaidenOver,
      isOverComplete
    };

  } catch (error) {
    console.error('recordBallAction error:', error);
    return { success: false, error: (error as Error).message || 'Failed to record ball' };
  }
}

export async function endInningsAction(matchId: string) {
  'use server';

  try {
    const matchRef = admin.firestore().collection('matches').doc(matchId);
    const liveScoreRef = matchRef.collection('live').doc('score');

    const [matchDoc, liveScoreDoc] = await Promise.all([
      matchRef.get(),
      liveScoreRef.get()
    ]);

    if (!matchDoc.exists || !liveScoreDoc.exists) {
      return { success: false, error: 'Match or live score not found' };
    }

    const match = matchDoc.data() as any;
    const liveScore = liveScoreDoc.data() as any;

    const currentInnings = liveScore.inningsNumber || 1;

    // Save completed innings to history
    const completedInnings = {
      inningsNumber: currentInnings,
      battingTeamId: liveScore.currentInnings.battingTeamId,
      runs: liveScore.currentInnings.runs,
      wickets: liveScore.currentInnings.wickets,
      overs: liveScore.currentInnings.overs,
      balls: liveScore.currentInnings.balls,
      batsmen: liveScore.batsmen,
      bowlers: liveScore.bowlers,
      ballHistory: liveScore.ballHistory,
      completedAt: new Date().toISOString()
    };

    // Determine if match is complete or moving to second innings
    const isMatchComplete = currentInnings === 2;

    if (isMatchComplete) {
      // Match is over, determine winner
      const innings1 = liveScore.innings1 || { runs: 0 };
      const innings2Runs = liveScore.currentInnings.runs;

      let winnerId = null;
      let margin = '';

      if (innings2Runs > innings1.runs) {
        winnerId = liveScore.currentInnings.battingTeamId;
        const wicketsLeft = 10 - liveScore.currentInnings.wickets;
        margin = `by ${wicketsLeft} wicket${wicketsLeft !== 1 ? 's' : ''}`;
      } else if (innings2Runs < innings1.runs) {
        winnerId = innings1.battingTeamId;
        const runDiff = innings1.runs - innings2Runs;
        margin = `by ${runDiff} run${runDiff !== 1 ? 's' : ''}`;
      } else {
        // Tie
        margin = 'tie';
      }

      // Update match status to completed
      await matchRef.update({
        status: 'COMPLETED',
        winnerId,
        winMargin: margin,
        completedAt: new Date().toISOString()
      });

      // Archive live score
      await liveScoreRef.update({
        status: 'completed',
        innings2: completedInnings,
        winnerId,
        winMargin: margin
      });

      return {
        success: true,
        isMatchComplete: true,
        winnerId,
        margin
      };

    } else {
      // Move to second innings
      const newBattingTeamId = liveScore.currentInnings.battingTeamId === match.homeTeamId
        ? match.awayTeamId
        : match.homeTeamId;

      await liveScoreRef.update({
        inningsNumber: 2,
        innings1: completedInnings,
        'currentInnings.battingTeamId': newBattingTeamId,
        'currentInnings.runs': 0,
        'currentInnings.wickets': 0,
        'currentInnings.balls': 0,
        'currentInnings.overs': 0,
        batsmen: [],
        bowlers: [],
        ballHistory: [],
        'currentPlayers.strikerId': null,
        'currentPlayers.nonStrikerId': null,
        'currentPlayers.bowlerId': null,
        lastUpdated: new Date().toISOString()
      });

      return {
        success: true,
        isMatchComplete: false,
        target: completedInnings.runs + 1
      };
    }

  } catch (error) {
    console.error('endInningsAction error:', error);
    return { success: false, error: (error as Error).message || 'Failed to end innings' };
  }
}

export async function startSecondInningsAction(matchId: string) {
  'use server';
  try {
    const matchRef = admin.firestore().collection('matches').doc(matchId);
    const liveScoreRef = matchRef.collection('live').doc('score');

    await matchRef.update({
      status: 'live',
      state: 'LIVE',
      isLive: true
    });

    await liveScoreRef.update({
      status: 'live'
    });

    revalidatePath(`/matches/${matchId}`);
    return { success: true };
  } catch (error) {
    console.error('Error starting second innings:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function undoLastBallAction(matchId: string, reason: string) {
  'use server';

  try {
    const liveScoreRef = admin.firestore()
      .collection('matches')
      .doc(matchId)
      .collection('live')
      .doc('score');

    const liveScoreDoc = await liveScoreRef.get();

    if (!liveScoreDoc.exists) {
      return { success: false, error: 'Match not in live state' };
    }

    const liveScore = liveScoreDoc.data() as any;
    const ballHistory = liveScore.ballHistory || [];

    if (ballHistory.length === 0) {
      return { success: false, error: 'No balls to undo' };
    }

    // Get the last ball
    const lastBall = ballHistory[ballHistory.length - 1];

    // Reverse the runs
    const runsOffBat = lastBall.runs || 0;
    const extraRuns = lastBall.extraRuns || 0;
    const totalRuns = runsOffBat + extraRuns;
    const isWicket = lastBall.isWicket || false;
    const isLegalDelivery = !['wide', 'noball'].includes(lastBall.extraType);

    // Update innings totals
    const newRuns = liveScore.currentInnings.runs - totalRuns;
    let newWickets = liveScore.currentInnings.wickets;
    if (isWicket) {
      newWickets = Math.max(0, newWickets - 1);
    }

    let newBalls = liveScore.currentInnings.balls;
    if (isLegalDelivery) {
      newBalls = Math.max(0, newBalls - 1);
    }

    // Reverse striker stats
    const strikerStats = liveScore.batsmen.find((b: any) => b.playerId === lastBall.strikerId);
    if (strikerStats) {
      strikerStats.runs = Math.max(0, strikerStats.runs - runsOffBat);
      if (isLegalDelivery) {
        strikerStats.ballsFaced = Math.max(0, strikerStats.ballsFaced - 1);
      }
      if (runsOffBat === 4) strikerStats.fours = Math.max(0, (strikerStats.fours || 0) - 1);
      if (runsOffBat === 6) strikerStats.sixes = Math.max(0, (strikerStats.sixes || 0) - 1);
      strikerStats.strikeRate = strikerStats.ballsFaced > 0
        ? (strikerStats.runs / strikerStats.ballsFaced) * 100
        : 0;
      if (isWicket) {
        strikerStats.isOut = false;
      }
    }

    // Reverse bowler stats
    const bowlerStats = liveScore.bowlers.find((b: any) => b.playerId === lastBall.bowlerId);
    if (bowlerStats) {
      bowlerStats.runsConceded = Math.max(0, bowlerStats.runsConceded - totalRuns);
      if (isLegalDelivery) {
        bowlerStats.ballsBowled = Math.max(0, bowlerStats.ballsBowled - 1);
        bowlerStats.overs = Math.floor(bowlerStats.ballsBowled / 6) + (bowlerStats.ballsBowled % 6) / 10;
      }
      if (isWicket) bowlerStats.wickets = Math.max(0, (bowlerStats.wickets || 0) - 1);
      if (lastBall.extraType === 'wide') bowlerStats.wides = Math.max(0, (bowlerStats.wides || 0) - 1);
      if (lastBall.extraType === 'noball') bowlerStats.noballs = Math.max(0, (bowlerStats.noballs || 0) - 1);
      bowlerStats.economy = bowlerStats.overs > 0
        ? bowlerStats.runsConceded / bowlerStats.overs
        : 0;
    }

    // Remove last ball from history
    ballHistory.pop();

    // Log undo reason
    const undoLog = liveScore.undoLog || [];
    undoLog.push({
      ball: lastBall,
      reason,
      timestamp: new Date().toISOString()
    });

    // Update Firestore
    await liveScoreRef.update({
      'currentInnings.runs': newRuns,
      'currentInnings.wickets': newWickets,
      'currentInnings.balls': newBalls,
      'currentInnings.overs': Math.floor(newBalls / 6) + (newBalls % 6) / 10,
      batsmen: liveScore.batsmen,
      bowlers: liveScore.bowlers,
      ballHistory,
      undoLog,
      lastUpdated: new Date().toISOString()
    });

    return { success: true, undoneRuns: totalRuns };

  } catch (error) {
    console.error('undoLastBallAction error:', error);
    return { success: false, error: (error as Error).message || 'Failed to undo ball' };
  }
}

export async function simulateBallAction(matchId: string) {
  // Stub
  console.log('simulateBallAction', matchId);
  return { success: true };
}

export async function createScorecardFromLive(matchId: string) {
  // Stub
  console.log('createScorecardFromLive', matchId);
  return { scorecard: { id: 'temp-scorecard-id' } };
}

export async function getTopPerformersAction(scorecard: any) {
  // Stub
  console.log('getTopPerformersAction');
  return [];
}

export async function savePlayerOfTheMatchAction(matchId: string, player: any) {
  // Stub
  console.log('savePlayerOfTheMatchAction', matchId, player);
  return { success: true };
}

export async function assignOfficialToMatchAction(matchId: string, official: any) {
  // Stub
  console.log('assignOfficialToMatchAction', matchId, official);
  return { success: true };
}

export async function removeOfficialFromMatchAction(matchId: string, officialId: string) {
  // Stub
  console.log('removeOfficialFromMatchAction', matchId, officialId);
  return { success: true };
}

export async function getMatchDetailsAction(matchId: string) {
  'use server';
  try {
    const doc = await admin.firestore().collection('matches').doc(matchId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Match;
  } catch (error) {
    console.error('Error fetching match:', error);
    return null;
  }
}

export async function getTeamSquadAction(teamId: string) {
  'use server';
  try {
    const snapshot = await admin.firestore()
      .collection('people')
      .where('teamIds', 'array-contains', teamId)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Person));
  } catch (error) {
    console.error('Error fetching squad:', error);
    return [];
  }
}

export async function saveTeamSelectionAction(
  matchId: string,
  teamType: 'home' | 'away',
  selection: {
    playingXI: string[];
    reserves: string[];
    captain: string;
    viceCaptain?: string;
  }
) {
  'use server';
  try {
    const updateData = {
      [`teamSelection.${teamType}`]: {
        ...selection,
        confirmedAt: new Date().toISOString(),
        confirmedBy: 'user' // In real app, get from auth
      }
    };

    await admin.firestore().collection('matches').doc(matchId).update(updateData);
    revalidatePath(`/matches/${matchId}/pre-match`);
    return { success: true };
  } catch (error) {
    console.error('Error saving team selection:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function saveTossResultAction(
  matchId: string,
  result: {
    winner: 'home' | 'away';
    decision: 'bat' | 'field';
  }
) {
  'use server';
  try {
    const updateData = {
      'preMatch.toss': {
        ...result,
        conductedAt: new Date().toISOString(),
        conductedBy: 'user'
      },
      // Also update legacy fields for compatibility
      tossWinner: result.winner === 'home' ? 'Home Team' : 'Away Team', // Ideally ID
      tossChoice: result.decision
    };

    await admin.firestore().collection('matches').doc(matchId).update(updateData);
    revalidatePath(`/matches/${matchId}/pre-match`);
    return { success: true };
  } catch (error) {
    console.error('Error saving toss result:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function saveScorerChecklistAction(matchId: string, checklist: any) {
  'use server';
  try {
    const updateData = {
      'preMatch.scorerChecklist': {
        ...checklist,
        completedAt: new Date().toISOString(),
        completedBy: 'user'
      }
    };

    await admin.firestore().collection('matches').doc(matchId).update(updateData);
    revalidatePath(`/matches/${matchId}/pre-match`);
    return { success: true };
  } catch (error) {
    console.error('Error saving scorer checklist:', error);
    return { success: false, error: (error as Error).message };
  }
}





export async function endMatchAction(matchId: string, result: { winnerId?: string; margin?: string; resultText: string }) {
  'use server';
  try {
    const matchRef = admin.firestore().collection('matches').doc(matchId);
    const liveScoreRef = matchRef.collection('live').doc('score');

    await matchRef.update({
      status: 'completed',
      winnerId: result.winnerId,
      winMargin: result.margin,
      result: result.resultText,
      completedAt: new Date().toISOString()
    });

    await liveScoreRef.update({
      status: 'completed',
      winnerId: result.winnerId,
      winMargin: result.margin
    });

    revalidatePath(`/matches/${matchId}`);
    return { success: true };
  } catch (error) {
    console.error('Error ending match:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function retireBatterAction(matchId: string, playerId: string, retirementType: 'retired_hurt' | 'retired_out' = 'retired_out') {
  'use server';
  try {
    const matchRef = admin.firestore().collection('matches').doc(matchId);
    const liveScoreRef = matchRef.collection('live').doc('score');

    await admin.firestore().runTransaction(async (t) => {
      const scoreDoc = await t.get(liveScoreRef);
      if (!scoreDoc.exists) throw new Error("Live score not found");

      const data = scoreDoc.data();
      const batsmen = data?.batsmen || [];

      // Find and update the batsman's stats
      const batsmanIndex = batsmen.findIndex((b: any) => b.playerId === playerId);
      if (batsmanIndex === -1) throw new Error("Batsman not found");

      batsmen[batsmanIndex].isOut = true;
      batsmen[batsmanIndex].dismissalType = retirementType;

      // Determine which position to clear
      const isStriker = data?.currentPlayers?.strikerId === playerId;
      const isNonStriker = data?.currentPlayers?.nonStrikerId === playerId;

      const updates: any = {
        batsmen: batsmen,
        lastUpdated: new Date().toISOString()
      };

      if (isStriker) {
        updates['currentPlayers.strikerId'] = null;
        t.update(matchRef, { 'liveData.striker': null });
      } else if (isNonStriker) {
        updates['currentPlayers.nonStrikerId'] = null;
        t.update(matchRef, { 'liveData.nonStriker': null });
      } else {
        throw new Error("Player is not currently batting");
      }

      t.update(liveScoreRef, updates);
    });

    revalidatePath(`/matches/${matchId}`);
    return { success: true };
  } catch (error) {
    console.error('Error retiring batter:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function saveBattingOrderAction(matchId: string, orderData: { home: string[], away: string[] }) {
  'use server';
  try {
    const updateData = {
      'preMatch.battingOrder': {
        ...orderData,
        arrangedAt: new Date().toISOString(),
        arrangedBy: 'user'
      }
    };

    await admin.firestore().collection('matches').doc(matchId).update(updateData);
    revalidatePath(`/matches/${matchId}/pre-match`);
    return { success: true };
  } catch (error) {
    console.error('Error saving batting order:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function initializeLiveMatchAction(
  matchId: string,
  tossResult: { winner: 'home' | 'away', decision: 'bat' | 'field' },
  battingOrder: { home: string[], away: string[] }
) {
  'use server';
  try {
    const matchRef = admin.firestore().collection('matches').doc(matchId);
    const matchDoc = await matchRef.get();

    if (!matchDoc.exists) throw new Error('Match not found');
    const matchData = matchDoc.data() as Match;

    // Determine batting team
    let battingTeamId = '';
    let bowlingTeamId = '';

    if (tossResult.decision === 'bat') {
      battingTeamId = tossResult.winner === 'home' ? matchData.homeTeamId : matchData.awayTeamId;
      bowlingTeamId = tossResult.winner === 'home' ? matchData.awayTeamId : matchData.homeTeamId;
    } else {
      battingTeamId = tossResult.winner === 'home' ? matchData.awayTeamId : matchData.homeTeamId;
      bowlingTeamId = tossResult.winner === 'home' ? matchData.homeTeamId : matchData.awayTeamId;
    }

    // Get openers from batting order
    const isHomeBatting = battingTeamId === matchData.homeTeamId;
    const battingTeamOrder = isHomeBatting ? battingOrder.home : battingOrder.away;
    const strikerId = battingTeamOrder[0];
    const nonStrikerId = battingTeamOrder[1];

    // Initial Live Score Data
    const initialLiveScore = {
      status: 'live',
      inningsNumber: 1,
      currentInnings: {
        battingTeamId,
        bowlingTeamId,
        runs: 0,
        wickets: 0,
        balls: 0,
        overs: 0
      },
      currentPlayers: {
        strikerId,
        nonStrikerId,
        bowlerId: null, // To be selected by user
        bowlingAngle: 'Over the Wicket'
      },
      batsmen: [
        { playerId: strikerId, runs: 0, ballsFaced: 0, fours: 0, sixes: 0, strikeRate: 0, isOut: false },
        { playerId: nonStrikerId, runs: 0, ballsFaced: 0, fours: 0, sixes: 0, strikeRate: 0, isOut: false }
      ],
      bowlers: [],
      ballHistory: [],
      undoLog: [],
      lastUpdated: new Date().toISOString()
    };

    // Update Match Status and Create Live Score
    await matchRef.update({
      status: 'live',
      state: 'LIVE',
      isLive: true,
      'liveData.currentInnings': 1,
      'liveData.striker': strikerId,
      'liveData.nonStriker': nonStrikerId
    });

    await matchRef.collection('live').doc('score').set(initialLiveScore);

    revalidatePath(`/matches/${matchId}`);
    return { success: true };

  } catch (error) {
    console.error('Error initializing live match:', error);
    return { success: false, error: (error as Error).message };
  }
}


export async function selectNewBatsmanAction(matchId: string, playerId: string) {
  'use server';
  try {
    const matchRef = admin.firestore().collection('matches').doc(matchId);
    const liveScoreRef = matchRef.collection('live').doc('score');

    await admin.firestore().runTransaction(async (t) => {
      const scoreDoc = await t.get(liveScoreRef);
      if (!scoreDoc.exists) throw new Error("Live score not found");

      const newBatsmanStats = {
        playerId,
        runs: 0,
        ballsFaced: 0,
        fours: 0,
        sixes: 0,
        strikeRate: 0,
        isOut: false
      };

      t.update(liveScoreRef, {
        'currentPlayers.strikerId': playerId,
        'batsmen': admin.firestore.FieldValue.arrayUnion(newBatsmanStats)
      });

      t.update(matchRef, {
        'liveData.striker': playerId
      });
    });

    revalidatePath(`/matches/${matchId}`);
    return { success: true };
  } catch (error) {
    console.error('Error selecting batsman:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function selectNewBowlerAction(matchId: string, playerId: string) {
  'use server';
  try {
    const matchRef = admin.firestore().collection('matches').doc(matchId);
    const liveScoreRef = matchRef.collection('live').doc('score');

    await admin.firestore().runTransaction(async (t) => {
      const scoreDoc = await t.get(liveScoreRef);
      if (!scoreDoc.exists) throw new Error("Live score not found");

      const data = scoreDoc.data();
      const existingBowler = data?.bowlers?.find((b: any) => b.playerId === playerId);

      if (!existingBowler) {
        const newBowlerStats = {
          playerId,
          overs: 0,
          maidens: 0,
          runsConceded: 0,
          wickets: 0,
          ballsBowled: 0,
          wides: 0,
          noballs: 0,
          economy: 0
        };
        t.update(liveScoreRef, {
          'currentPlayers.bowlerId': playerId,
          'bowlers': admin.firestore.FieldValue.arrayUnion(newBowlerStats)
        });
      } else {
        t.update(liveScoreRef, {
          'currentPlayers.bowlerId': playerId
        });
      }

      t.update(matchRef, {
        'liveData.bowler': playerId
      });
    });

    revalidatePath(`/matches/${matchId}`);
    return { success: true };
  } catch (error) {
    console.error('Error selecting bowler:', error);
    return { success: false, error: (error as Error).message };
  }
}
