'use server';

import { fetchCollection, updateDocument } from "@/lib/firestore";
import { Match } from "@/types/firestore";
import { MATCH_STATES } from "@/lib/matchStates";
import { revalidatePath } from "next/cache";

export async function migrateMatchStatesAction() {
  console.log("Starting match state migration...");

  try {
    const matches = await fetchCollection<Match>('matches');
    let updatedCount = 0;
    let errorCount = 0;

    for (const match of matches) {
      try {
        // Skip if state is already set and valid
        if (match.state && Object.values(MATCH_STATES).includes(match.state as any)) {
          continue;
        }

        let newState: NonNullable<Match['state']> = MATCH_STATES.SCHEDULED;
        const now = new Date();
        const matchDate = match.dateTime ? new Date(match.dateTime) : null;

        // Determine new state based on legacy status and date
        if (match.status === 'completed') {
          newState = MATCH_STATES.COMPLETED;
        } else if (match.status === 'live' || match.status === 'in_progress') {
          newState = MATCH_STATES.LIVE;
        } else if (match.status === 'cancelled') {
          newState = MATCH_STATES.CANCELLED;
        } else if (match.status === 'postponed') {
          newState = MATCH_STATES.POSTPONED;
        } else if (match.status === 'scheduled') {
          // Check if it should be completed (past date) or pre-match
          if (matchDate && matchDate < now) {
            // If it's in the past but still 'scheduled', it's ambiguous. 
            // Safest to leave as SCHEDULED or maybe COMPLETED if we want to clean up.
            // Let's set to COMPLETED if it's more than 24h old, otherwise leave as SCHEDULED
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            if (matchDate < oneDayAgo) {
              // Actually, without a result, COMPLETED might be misleading. 
              // Let's stick to direct mapping for now to be safe.
              newState = MATCH_STATES.SCHEDULED;
            }
          }
        }

        // Initialize state history
        const stateHistory = [{
          from: 'legacy_migration',
          to: newState,
          timestamp: new Date().toISOString(),
          triggeredBy: 'system_migration',
          reason: `Migrated from legacy status: ${match.status}`
        }];

        // Update the document
        await updateDocument('matches', match.id, {
          state: newState,
          stateHistory: stateHistory,
          // Ensure other new fields are initialized if missing
          preMatch: match.preMatch || {},
          teamSelection: match.teamSelection || {},
          liveData: match.liveData || {
            currentInnings: 1,
            currentOver: 0,
            currentBall: 0,
            striker: '',
            nonStriker: '',
            bowler: '',
            lastBallTimestamp: new Date().toISOString()
          }
        });

        updatedCount++;
      } catch (err) {
        console.error(`Failed to migrate match ${match.id}:`, err);
        errorCount++;
      }
    }

    console.log(`Migration complete. Updated: ${updatedCount}, Errors: ${errorCount}`);
    revalidatePath('/matches');
    return {
      success: true,
      message: `Migration complete. Updated ${updatedCount} matches. ${errorCount > 0 ? `(${errorCount} errors)` : ''}`
    };

  } catch (error) {
    console.error("Migration failed:", error);
    return { success: false, message: `Migration failed: ${(error as Error).message}` };
  }
}
