'use client';

import React from 'react';
import { Theme } from '../types';
import { MatchSettingsState } from '../LiveMatchSettingsModal';

interface ScorerToolbarProps {
  theme: Theme;
  onOpenMatchSettings: () => void;
  onOpenLineups: () => void;
  onOpenFieldEditor: () => void;
  matchSettings: MatchSettingsState;
  onTogglePitchHeatmap: () => void;
  onUndoLastBall: () => void;
  canUndo: boolean;
  onSwapStrikers: () => void;
  onEndInnings: () => void;
  onOpenScorecard: () => void;
  onOpenAnalytics: () => void;
  onOpenWeather?: () => void;
}

export default function ScorerToolbar({
  theme: D,
  onOpenMatchSettings,
  onOpenLineups,
  onOpenFieldEditor,
  matchSettings,
  onTogglePitchHeatmap,
  onUndoLastBall,
  canUndo,
  onSwapStrikers,
  onEndInnings,
  onOpenScorecard,
  onOpenAnalytics,
  onOpenWeather,
}: ScorerToolbarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '10px 16px',
        background: D.surf0,
        borderBottom: `1px solid ${D.border}`,
      }}
    >
      {/* Left: Quick Setup Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <button
          onClick={onOpenMatchSettings}
          style={{
            padding: '5px 11px',
            borderRadius: D.pill,
            background: D.surf2,
            border: `1px solid ${D.border}`,
            color: D.textPrimary,
            fontFamily: D.head,
            fontSize: '11px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer',
          }}
          title="Configure Match Overs, Formats, and Target Rules"
        >
          ⚙️ Settings
        </button>

        <button
          onClick={onOpenLineups}
          style={{
            padding: '5px 11px',
            borderRadius: D.pill,
            background: `${D.emerald}18`,
            border: `1px solid ${D.emerald}55`,
            color: D.emerald,
            fontFamily: D.head,
            fontSize: '11px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer',
          }}
          title="Manage Batting Pairs, Lineup Order, and Bowler Rotations"
        >
          👥 Lineups & Bowlers
        </button>

        <button
          onClick={onOpenFieldEditor}
          style={{
            padding: '5px 11px',
            borderRadius: D.pill,
            background: `${D.sky}18`,
            border: `1px solid ${D.sky}55`,
            color: D.sky,
            fontFamily: D.head,
            fontSize: '11px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer',
          }}
          title="Interactive 11-Man Field Placement Editor & Powerplay Circle Validation"
        >
          🛡️ Field Editor
        </button>

        {/* Quick Toggle: Bowler Telemetry & Pitch Map */}
        <button
          onClick={onTogglePitchHeatmap}
          style={{
            padding: '5px 10px',
            borderRadius: D.pill,
            background: matchSettings.showPitchHeatmap ? `${D.emerald}25` : D.surf2,
            border: `1px solid ${matchSettings.showPitchHeatmap ? D.emerald : D.border}`,
            color: matchSettings.showPitchHeatmap ? D.emerald : D.textMuted,
            fontFamily: D.head,
            fontSize: '10px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          title="Enable or disable Bowler Delivery Telemetry & Pitch Location Map during live scoring"
        >
          <span>⚡ Telemetry & Pitch Map:</span>
          <strong style={{ color: matchSettings.showPitchHeatmap ? D.emerald : D.amber }}>
            {matchSettings.showPitchHeatmap ? 'ON' : 'OFF'}
          </strong>
        </button>
      </div>

      {/* Right: Operational Actions (Undo, Swap, End Inning, Scorecard) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <button
          onClick={onSwapStrikers}
          style={{
            padding: '5px 10px',
            borderRadius: D.pill,
            background: D.surf2,
            border: `1px solid ${D.border}`,
            color: D.textSecondary,
            fontFamily: D.head,
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
          title="Swap Striker and Non-Striker ends manually"
        >
          🔄 Swap Ends
        </button>

        <button
          onClick={onUndoLastBall}
          disabled={!canUndo}
          style={{
            padding: '5px 10px',
            borderRadius: D.pill,
            background: canUndo ? `${D.rose}20` : D.surf2,
            border: `1px solid ${canUndo ? D.rose : D.border}`,
            color: canUndo ? D.rose : D.textMuted,
            fontFamily: D.head,
            fontSize: '11px',
            fontWeight: 700,
            cursor: canUndo ? 'pointer' : 'not-allowed',
            opacity: canUndo ? 1 : 0.6,
          }}
          title="Undo the last recorded ball event"
        >
          ↩ Undo Ball
        </button>

        <button
          onClick={onOpenScorecard}
          style={{
            padding: '5px 11px',
            borderRadius: D.pill,
            background: `${D.indigo}20`,
            border: `1px solid ${D.indigo}55`,
            color: D.indigo,
            fontFamily: D.head,
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          📋 Scorecard
        </button>

        <button
          onClick={onOpenAnalytics}
          style={{
            padding: '5px 11px',
            borderRadius: D.pill,
            background: `${D.teal}20`,
            border: `1px solid ${D.teal}55`,
            color: D.teal,
            fontFamily: D.head,
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          📈 Analytics
        </button>

        <button
          onClick={onEndInnings}
          style={{
            padding: '5px 11px',
            borderRadius: D.pill,
            background: `${D.amber}22`,
            border: `1px solid ${D.amber}55`,
            color: D.amber,
            fontFamily: D.head,
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
          title="Close current innings and start 2nd innings chase"
        >
          🏁 End Innings
        </button>
      </div>
    </div>
  );
}
