'use client';

import React from 'react';
import { Theme } from '../types';

interface LiveMatchHUDProps {
  theme: Theme;
  teamA: string;
  teamB: string;
  battingTeam: string;
  totalRuns: number;
  wickets: number;
  overs: number;
  ballsThisOver: number;
  currentRR: string;
  requiredRR: string;
  target?: number;
  currentInning: 1 | 2;
  powerplayActive?: boolean;
}

export default function LiveMatchHUD({
  theme: D,
  teamA,
  teamB,
  battingTeam,
  totalRuns,
  wickets,
  overs,
  ballsThisOver,
  currentRR,
  requiredRR,
  target,
  currentInning,
  powerplayActive = true,
}: LiveMatchHUDProps) {
  const isSecondInnings = currentInning === 2;
  const runsNeeded = target ? Math.max(0, target - totalRuns) : 0;

  return (
    <div
      style={{
        padding: '16px 20px',
        background: D.surf1,
        borderBottom: `1px solid ${D.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      {/* Main Score Block */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 900, color: D.textPrimary }}>
              {battingTeam}
            </span>
            <span
              style={{
                fontFamily: D.mono,
                fontSize: '10px',
                fontWeight: 800,
                color: D.emerald,
                background: `${D.emerald}20`,
                padding: '2px 8px',
                borderRadius: D.pill,
                border: `1px solid ${D.emerald}44`,
              }}
            >
              {currentInning === 1 ? '1ST INNINGS' : 'CHASE (2ND INN)'}
            </span>
            {powerplayActive && (
              <span
                style={{
                  fontFamily: D.mono,
                  fontSize: '10px',
                  fontWeight: 800,
                  color: D.amber,
                  background: `${D.amber}20`,
                  padding: '2px 8px',
                  borderRadius: D.pill,
                  border: `1px solid ${D.amber}44`,
                }}
              >
                ⚡ POWERPLAY
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '4px' }}>
            <div style={{ fontFamily: D.mono, fontSize: '38px', fontWeight: 900, color: D.textPrimary, lineHeight: 1 }}>
              {totalRuns} / {wickets}
            </div>
            <div style={{ fontFamily: D.mono, fontSize: '18px', fontWeight: 700, color: D.textSecondary }}>
              ({overs}.{ballsThisOver} ov)
            </div>
          </div>
        </div>
      </div>

      {/* Rates & Targets Block */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, textTransform: 'uppercase' }}>
            Current Run Rate
          </span>
          <span style={{ fontFamily: D.mono, fontSize: '18px', fontWeight: 800, color: D.sky }}>
            {currentRR} <span style={{ fontSize: '11px', color: D.textMuted }}>rpo</span>
          </span>
        </div>

        {isSecondInnings && target && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, textTransform: 'uppercase' }}>
                Required Run Rate
              </span>
              <span style={{ fontFamily: D.mono, fontSize: '18px', fontWeight: 800, color: D.amber }}>
                {requiredRR} <span style={{ fontSize: '11px', color: D.textMuted }}>rpo</span>
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, textTransform: 'uppercase' }}>
                Target Equation
              </span>
              <span style={{ fontFamily: D.mono, fontSize: '14px', fontWeight: 800, color: D.emerald }}>
                Need {runsNeeded} runs from remaining balls
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
