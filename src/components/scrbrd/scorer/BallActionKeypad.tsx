'use client';

import React from 'react';
import { Theme } from '../types';

interface BallActionKeypadProps {
  theme: Theme;
  onRecordRuns: (runs: number) => void;
  onRecordExtra: (type: 'wide' | 'noball' | 'bye' | 'legbye') => void;
  onTriggerWicket: () => void;
  onTriggerDRS: () => void;
  disabled?: boolean;
}

export default function BallActionKeypad({
  theme: D,
  onRecordRuns,
  onRecordExtra,
  onTriggerWicket,
  onTriggerDRS,
  disabled = false,
}: BallActionKeypadProps) {
  const RUN_BUTTONS = [0, 1, 2, 3, 4, 6];

  return (
    <div
      style={{
        padding: '16px',
        background: D.cardBg,
        borderRadius: D.lg,
        border: `1px solid ${D.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
          🏏 BALL SCORING PAD
        </span>
        <button
          onClick={onTriggerDRS}
          style={{
            padding: '4px 10px',
            borderRadius: D.pill,
            background: `${D.violet}20`,
            border: `1px solid ${D.violet}55`,
            color: D.violet,
            fontFamily: D.head,
            fontSize: '10px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          🔍 DRS Hawk-Eye Review
        </button>
      </div>

      {/* Main Runs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
        {RUN_BUTTONS.map((runs) => {
          const isBoundary = runs === 4 || runs === 6;
          return (
            <button
              key={runs}
              onClick={() => onRecordRuns(runs)}
              disabled={disabled}
              style={{
                padding: '16px 0',
                borderRadius: D.md,
                background: isBoundary
                  ? runs === 6
                    ? `${D.emerald}25`
                    : `${D.sky}25`
                  : D.surf2,
                border: `1px solid ${isBoundary ? (runs === 6 ? D.emerald : D.sky) : D.border}`,
                color: isBoundary ? (runs === 6 ? D.emerald : D.sky) : D.textPrimary,
                fontFamily: D.mono,
                fontSize: '20px',
                fontWeight: 900,
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'transform 0.1s ease',
              }}
            >
              {runs === 0 ? '•' : runs}
            </button>
          );
        })}
      </div>

      {/* Extras & Wicket Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
        <button
          onClick={() => onRecordExtra('wide')}
          disabled={disabled}
          style={{
            padding: '10px 4px',
            borderRadius: D.sm,
            background: D.surf2,
            border: `1px solid ${D.border}`,
            color: D.amber,
            fontFamily: D.head,
            fontSize: '11px',
            fontWeight: 800,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          WD (Wide)
        </button>

        <button
          onClick={() => onRecordExtra('noball')}
          disabled={disabled}
          style={{
            padding: '10px 4px',
            borderRadius: D.sm,
            background: D.surf2,
            border: `1px solid ${D.border}`,
            color: D.rose,
            fontFamily: D.head,
            fontSize: '11px',
            fontWeight: 800,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          NB (No Ball)
        </button>

        <button
          onClick={() => onRecordExtra('bye')}
          disabled={disabled}
          style={{
            padding: '10px 4px',
            borderRadius: D.sm,
            background: D.surf2,
            border: `1px solid ${D.border}`,
            color: D.textSecondary,
            fontFamily: D.head,
            fontSize: '11px',
            fontWeight: 800,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          B (Bye)
        </button>

        <button
          onClick={() => onRecordExtra('legbye')}
          disabled={disabled}
          style={{
            padding: '10px 4px',
            borderRadius: D.sm,
            background: D.surf2,
            border: `1px solid ${D.border}`,
            color: D.textSecondary,
            fontFamily: D.head,
            fontSize: '11px',
            fontWeight: 800,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          LB (Leg Bye)
        </button>

        <button
          onClick={onTriggerWicket}
          disabled={disabled}
          style={{
            padding: '10px 4px',
            borderRadius: D.sm,
            background: `${D.rose}30`,
            border: `1px solid ${D.rose}`,
            color: D.rose,
            fontFamily: D.head,
            fontSize: '12px',
            fontWeight: 900,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          OUT (Wkt)
        </button>
      </div>
    </div>
  );
}
