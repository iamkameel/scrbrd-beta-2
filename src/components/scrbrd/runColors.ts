/**
 * Cricket Run Color-Coding Standards & UI Helpers
 * Standardized across ScorecardModal, FullScorecardView, and BroadcastScorer
 */

export interface RunColorConfig {
  bg: string;
  text: string;
  border: string;
  badgeBg: string;
  label: string;
  glow?: string;
}

export function getRunConfig(runs: number, isWicket?: boolean, extraType?: string): RunColorConfig {
  if (isWicket) {
    return {
      bg: '#f43f5e',
      text: '#ffffff',
      border: '#e11d48',
      badgeBg: 'rgba(244, 63, 94, 0.18)',
      label: 'W',
      glow: 'rgba(244, 63, 94, 0.4)',
    };
  }

  if (extraType && extraType !== 'none') {
    const code = extraType.toUpperCase();
    return {
      bg: '#f59e0b',
      text: '#ffffff',
      border: '#d97706',
      badgeBg: 'rgba(245, 158, 11, 0.18)',
      label: `${runs > 0 ? runs : 1}${code}`,
      glow: 'rgba(245, 158, 11, 0.3)',
    };
  }

  switch (runs) {
    case 0:
      return {
        bg: '#334155',
        text: '#94a3b8',
        border: '#475569',
        badgeBg: 'rgba(100, 116, 139, 0.14)',
        label: '•',
      };
    case 1:
      return {
        bg: '#0284c7',
        text: '#ffffff',
        border: '#0369a1',
        badgeBg: 'rgba(2, 132, 199, 0.18)',
        label: '1',
      };
    case 2:
      return {
        bg: '#0d9488',
        text: '#ffffff',
        border: '#0f766e',
        badgeBg: 'rgba(13, 148, 136, 0.18)',
        label: '2',
      };
    case 3:
      return {
        bg: '#d97706',
        text: '#ffffff',
        border: '#b45309',
        badgeBg: 'rgba(217, 119, 6, 0.18)',
        label: '3',
      };
    case 4:
      return {
        bg: '#10b981',
        text: '#ffffff',
        border: '#059669',
        badgeBg: 'rgba(16, 185, 129, 0.22)',
        label: '4',
        glow: 'rgba(16, 185, 129, 0.4)',
      };
    case 6:
      return {
        bg: '#8b5cf6',
        text: '#ffffff',
        border: '#7c3aed',
        badgeBg: 'rgba(139, 92, 246, 0.24)',
        label: '6',
        glow: 'rgba(139, 92, 246, 0.4)',
      };
    default:
      if (runs >= 5) {
        return {
          bg: '#ec4899',
          text: '#ffffff',
          border: '#db2777',
          badgeBg: 'rgba(236, 72, 153, 0.2)',
          label: String(runs),
        };
      }
      return {
        bg: '#475569',
        text: '#ffffff',
        border: '#334155',
        badgeBg: 'rgba(71, 85, 105, 0.15)',
        label: String(runs),
      };
  }
}

/**
 * Batter Score Milestone Color-Coding
 */
export function getBatterScoreStyle(runs: number, balls: number, isNotOut: boolean, isOutForDuck: boolean) {
  if (isOutForDuck) {
    return {
      color: '#f43f5e',
      background: 'rgba(244, 63, 94, 0.12)',
      border: '1px solid rgba(244, 63, 94, 0.3)',
      badge: '0',
      isMilestone: false,
    };
  }
  if (runs >= 100) {
    return {
      color: '#fbbf24',
      background: 'rgba(245, 158, 11, 0.22)',
      border: '1px solid #f59e0b',
      badge: '💯',
      isMilestone: true,
    };
  }
  if (runs >= 50) {
    return {
      color: '#f59e0b',
      background: 'rgba(245, 158, 11, 0.15)',
      border: '1px solid rgba(245, 158, 11, 0.4)',
      badge: '50',
      isMilestone: true,
    };
  }
  if (runs >= 30) {
    return {
      color: '#38bdf8',
      background: 'rgba(56, 189, 248, 0.1)',
      border: '1px solid rgba(56, 189, 248, 0.25)',
      badge: null,
      isMilestone: false,
    };
  }
  return {
    color: isNotOut ? '#10b981' : '#f1f5f9',
    background: 'transparent',
    border: 'none',
    badge: null,
    isMilestone: false,
  };
}
