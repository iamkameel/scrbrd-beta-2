'use client';

import React from 'react';
import { Theme } from './types';
import { Shield, AlertTriangle, CheckCircle2, Zap, Activity } from 'lucide-react';

interface BowlerWorkloadMonitorProps {
  theme: Theme;
  bowlers?: {
    id: string;
    name: string;
    style: string;
    spellOvers: number;
    maxSpellOvers: number;
    dailyOvers: number;
    maxDailyOvers: number;
    ageGroup: string;
  }[];
}

const DEFAULT_BOWLERS = [
  { id: 'b1', name: 'T. Ndlovu', style: 'Fast Medium', spellOvers: 4.2, maxSpellOvers: 6, dailyOvers: 8.2, maxDailyOvers: 14, ageGroup: 'U19' },
  { id: 'b2', name: 'M. Khumalo', style: 'Left-Arm Spin', spellOvers: 4.0, maxSpellOvers: 8, dailyOvers: 12.0, maxDailyOvers: 20, ageGroup: 'U19' },
  { id: 'b3', name: 'K. Govender', style: 'Right-Arm Fast', spellOvers: 5.4, maxSpellOvers: 6, dailyOvers: 10.4, maxDailyOvers: 14, ageGroup: 'U19' },
  { id: 'b4', name: 'D. Smith', style: 'Off Spin', spellOvers: 2.0, maxSpellOvers: 8, dailyOvers: 6.0, maxDailyOvers: 18, ageGroup: 'U19' },
];

export default function BowlerWorkloadMonitor({
  theme: D,
  bowlers = DEFAULT_BOWLERS,
}: BowlerWorkloadMonitorProps) {
  return (
    <div style={{
      padding: '18px',
      borderRadius: D.lg,
      background: D.cardBg,
      border: `1px solid ${D.border}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color={D.emerald} />
          <div>
            <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
              CSA YOUTH FAST BOWLING WORKLOAD & FATIGUE MONITOR
            </div>
            <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
              Compliance tracking for spell quotas, daily bowling limits, and injury prevention
            </div>
          </div>
        </div>
        <span style={{
          fontFamily: D.mono,
          fontSize: '10px',
          padding: '3px 10px',
          borderRadius: D.pill,
          background: `${D.emerald}22`,
          color: D.emerald,
          fontWeight: 700,
          border: `1px solid ${D.emerald}44`,
        }}>
          CSA Safety Code 2026
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
        {bowlers.map(b => {
          const spellPct = Math.round((b.spellOvers / b.maxSpellOvers) * 100);
          const isAtLimit = b.spellOvers >= b.maxSpellOvers;
          const isWarning = spellPct >= 75 && !isAtLimit;

          const barColor = isAtLimit ? D.rose : isWarning ? D.amber : D.emerald;

          return (
            <div
              key={b.id}
              style={{
                padding: '12px 14px',
                borderRadius: D.md,
                background: D.surf2,
                border: `1px solid ${isAtLimit ? `${D.rose}66` : D.border}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
                    {b.name}
                  </span>
                  <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, marginLeft: '6px' }}>
                    ({b.style})
                  </span>
                </div>
                <span style={{
                  fontFamily: D.mono,
                  fontSize: '10px',
                  fontWeight: 800,
                  color: barColor,
                  background: `${barColor}22`,
                  padding: '2px 8px',
                  borderRadius: D.pill,
                }}>
                  {isAtLimit ? 'SPELL QUOTA EXHAUSTED' : isWarning ? 'HIGH FATIGUE' : 'FRESH'}
                </span>
              </div>

              {/* Spell Quota Meter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.mono, fontSize: '10px' }}>
                  <span style={{ color: D.textMuted }}>Current Spell Quota:</span>
                  <strong style={{ color: barColor }}>{b.spellOvers} / {b.maxSpellOvers} overs</strong>
                </div>
                <div style={{ width: '100%', height: '6px', background: D.surf3, borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, spellPct)}%`, height: '100%', background: barColor }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                <span>Daily Limit: {b.dailyOvers}/{b.maxDailyOvers} ov</span>
                <span>Category: {b.ageGroup}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
