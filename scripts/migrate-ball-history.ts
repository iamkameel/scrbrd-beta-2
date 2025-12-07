
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { adminDb } from '../src/lib/firebase-admin';
import { computeProjection } from '../src/lib/scoring/projectionService';
import { ScoringAction, Extras } from '../src/types/scoring';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Migrate Legacy Ball History to Scoring Actions (V3)
 * 
 * Usage: npx tsx scripts/migrate-ball-history.ts
 */

async function migrateBallHistory() {
    console.log('🚀 Starting migration of ball history to scoring_actions...\n');

    try {
        const matchesSnapshot = await adminDb.collection('matches').get();

        for (const matchDoc of matchesSnapshot.docs) {
            const matchId = matchDoc.id;
            const matchData = matchDoc.data();

            // Skip if not live or completed? No, migrate all that have live data.
            const liveScoreRef = matchDoc.ref.collection('live').doc('score');
            const liveScoreDoc = await liveScoreRef.get();

            if (!liveScoreDoc.exists) {
                console.log(`⚠️  Match ${matchId}: No live score data. Skipping.`);
                continue;
            }

            const liveScore = liveScoreDoc.data();
            const ballHistory = liveScore?.ballHistory || [];

            // Check if already migrated
            const actionsSnapshot = await matchDoc.ref.collection('scoring_actions').limit(1).get();
            if (!actionsSnapshot.empty) {
                console.log(`ℹ️  Match ${matchId}: Already has scoring actions. Skipping.`);
                continue;
            }

            if (ballHistory.length === 0) {
                console.log(`ℹ️  Match ${matchId}: No ball history to migrate.`);
                continue;
            }

            console.log(`🏏 Match ${matchId}: Migrating ${ballHistory.length} balls...`);

            const actions: ScoringAction[] = [];

            // Simulation state for over calculation
            let currentOverNumber = 0;
            let legalBallsInOver = 0;
            let currentInnings = liveScore?.inningsNumber || 1; // Assume current innings

            // We need to infer non-striker if not present. 
            // This is hard without full player list and fall of wickets logic.
            // We will use a placeholder if missing.

            for (let i = 0; i < ballHistory.length; i++) {
                const ball = ballHistory[i];

                // Determine extras
                const extras: Extras = {
                    wide: ball.extraType === 'wide' ? (ball.extraRuns || 1) : 0,
                    noBall: ball.extraType === 'noball' ? (ball.extraRuns || 1) : 0,
                    bye: ball.extraType === 'bye' ? (ball.extraRuns || 0) : 0,
                    legBye: ball.extraType === 'legbye' ? (ball.extraRuns || 0) : 0,
                    penalty: 0
                };

                // Determine runs off bat
                // Legacy: runs usually included extras if it was a boundary? 
                // Or runs was just runs off bat?
                // Usually runs = runs off bat. extraRuns = extras.
                const runsOffBat = ball.runs || 0;
                const totalRuns = runsOffBat + extras.wide + extras.noBall + extras.bye + extras.legBye;

                const isLegal = extras.wide === 0 && extras.noBall === 0;

                // Calculate over number
                // If previous ball was legal and completed the over?
                // We calculate strictly based on legal balls count.
                const overNumber = currentOverNumber;
                const ballInOver = legalBallsInOver + 1; // Display ball number (1-6+)

                const actionId = matchDoc.ref.collection('scoring_actions').doc().id;

                const action: ScoringAction = {
                    id: actionId,
                    matchId,
                    inningsNumber: currentInnings, // Assuming all history is for current innings
                    overNumber,
                    ballInOver: isLegal ? ballInOver : (legalBallsInOver + 1), // Extras don't increment legal count but stay in same "ball slot" visually?
                    // Actually ballInOver usually counts all deliveries. 
                    // But for over calculation, we only care about legal balls.
                    // Let's just use i + 1 for sequence.
                    sequenceNumber: i + 1,

                    strikerId: ball.strikerId || 'unknown',
                    nonStrikerId: ball.nonStrikerId || 'unknown', // Fallback
                    bowlerId: ball.bowlerId || 'unknown',

                    runsOffBat,
                    extras,
                    totalRuns,

                    isWicket: ball.isWicket || false,
                    wicket: ball.isWicket ? {
                        type: ball.wicketType || 'bowled',
                        dismissedPlayerId: ball.strikerId, // Usually striker is out
                        fielderIds: ball.fielderIds || []
                    } : undefined,

                    isLegalDelivery: isLegal,

                    timestamp: ball.timestamp || new Date().toISOString(),
                    source: 'migration',
                    createdAt: new Date().toISOString(),
                    isVoided: false
                };

                actions.push(action);

                // Update state for next ball
                if (isLegal) {
                    legalBallsInOver++;
                    if (legalBallsInOver >= 6) {
                        currentOverNumber++;
                        legalBallsInOver = 0;
                    }
                }
            }

            // Batch write actions
            const batch = adminDb.batch();

            // Split into chunks of 500 if needed (Firestore limit)
            // For now assuming < 500 balls per match for migration simplicity or handling it simply.
            // A T20 is ~120 balls. 500 is enough for most.

            actions.forEach(action => {
                const ref = matchDoc.ref.collection('scoring_actions').doc(action.id);
                batch.set(ref, action);
            });

            // Compute Projection
            const projection = computeProjection(
                actions,
                matchId,
                matchData.homeTeamId,
                matchData.awayTeamId
            );

            // Update Live Score
            batch.set(liveScoreRef, projection);

            await batch.commit();
            console.log(`  ✅ Migrated ${actions.length} actions and updated projection.`);
        }

        console.log('\n🎉 Migration complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrateBallHistory();
