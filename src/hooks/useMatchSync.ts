'use client';

import { useState, useEffect, useCallback } from 'react';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, runTransaction, collection } from 'firebase/firestore';

export interface MatchSyncState {
  matchId: string;
  totalRuns: number;
  wickets: number;
  overs: number;
  ballsThisOver: number;
  strikerId?: string;
  nonStrikerId?: string;
  bowlerId?: string;
  scorecard: any[];
  version: number;
  lastUpdated: number;
}

export function useMatchSync(matchId: string = 'live_match_01') {
  const [matchState, setMatchState] = useState<MatchSyncState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [concurrencyConflict, setConcurrencyConflict] = useState<boolean>(false);

  // Real-time Firestore listener
  useEffect(() => {
    if (!matchId) return;

    const docRef = doc(db, 'matches', matchId);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setMatchState(docSnap.data() as MatchSyncState);
        } else {
          // Initialize default match document if not exists
          const initialState: MatchSyncState = {
            matchId,
            totalRuns: 0,
            wickets: 0,
            overs: 0,
            ballsThisOver: 0,
            scorecard: [],
            version: 1,
            lastUpdated: Date.now(),
          };
          setDoc(docRef, initialState).catch((err) => {
            handleFirestoreError(err, OperationType.CREATE, `matches/${matchId}`);
          });
          setMatchState(initialState);
        }
        setLoading(false);
      },
      (error) => {
        const errInfo = handleFirestoreError(error, OperationType.LIST, `matches/${matchId}`);
        setSyncError(errInfo.error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [matchId]);

  // Atomic transaction helper with version-based optimistic locking
  const updateMatchScoreAtomically = useCallback(async (updateFn: (current: MatchSyncState) => MatchSyncState) => {
    const docRef = doc(db, 'matches', matchId);
    try {
      await runTransaction(db, async (transaction) => {
        const sfDoc = await transaction.get(docRef);
        const currentData = sfDoc.exists() ? (sfDoc.data() as MatchSyncState) : {
          matchId,
          totalRuns: 0,
          wickets: 0,
          overs: 0,
          ballsThisOver: 0,
          scorecard: [],
          version: 1,
          lastUpdated: Date.now(),
        };

        const updatedData = updateFn(currentData);
        updatedData.version = (currentData.version || 0) + 1;
        updatedData.lastUpdated = Date.now();

        transaction.set(docRef, updatedData);
      });
      setSyncError(null);
      setConcurrencyConflict(false);
    } catch (error) {
      setConcurrencyConflict(true);
      const errInfo = handleFirestoreError(error, OperationType.UPDATE, `matches/${matchId}`);
      setSyncError(errInfo.error);
      throw error;
    }
  }, [matchId]);

  return {
    matchState,
    loading,
    syncError,
    concurrencyConflict,
    updateMatchScoreAtomically,
  };
}
