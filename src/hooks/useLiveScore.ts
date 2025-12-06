'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { LiveScore } from '@/types/firestore';

interface UseLiveScoreResult {
  liveScore: LiveScore | null;
  loading: boolean;
  error: string | null;
  connected: boolean;
}

/**
 * Real-time hook for subscribing to live match score updates
 * Automatically syncs across all devices viewing the same match
 */
export function useLiveScore(matchId: string | null): UseLiveScoreResult {
  const [liveScore, setLiveScore] = useState<LiveScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    if (!matchId) {
      setLoading(false);
      setLiveScore(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Reference to live score document
    const liveScoreRef = doc(db, 'matches', matchId, 'live', 'score');

    // Subscribe to real-time updates
    const unsubscribe: Unsubscribe = onSnapshot(
      liveScoreRef,
      (snapshot) => {
        setConnected(true);
        
        if (snapshot.exists()) {
          const data = snapshot.data() as LiveScore;
          setLiveScore(data);
          setError(null);
        } else {
          setLiveScore(null);
          setError('Match not in live state');
        }
        
        setLoading(false);
      },
      (err) => {
        console.error('LiveScore listener error:', err);
        setError(err.message || 'Failed to connect to live score');
        setConnected(false);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [matchId]);

  return {
    liveScore,
    loading,
    error,
    connected
  };
}

/**
 * Hook for tracking connection status to Firestore
 * Useful for showing "offline" indicators
 */
export function useFirestoreConnection() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
