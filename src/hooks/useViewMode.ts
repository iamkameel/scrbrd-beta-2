"use client";

import { useState, useEffect } from 'react';

type ViewMode = 'grid' | 'list' | 'table' | 'calendar' | 'stats';

interface UseViewModeOptions {
  storageKey: string;
  defaultMode?: ViewMode;
}

export function useViewMode({ storageKey, defaultMode = 'grid' }: UseViewModeOptions) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultMode);
  const [isLoading, setIsLoading] = useState(true);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved && ['grid', 'list', 'table', 'calendar', 'stats'].includes(saved)) {
        setViewMode(saved as ViewMode);
      }
    } catch (error) {
      console.error('Failed to load view mode from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, [storageKey]);

  // Save to localStorage when changed
  const changeViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem(storageKey, mode);
    } catch (error) {
      console.error('Failed to save view mode to localStorage:', error);
    }
  };

  return {
    viewMode,
    setViewMode: changeViewMode,
    isLoading,
  };
}
