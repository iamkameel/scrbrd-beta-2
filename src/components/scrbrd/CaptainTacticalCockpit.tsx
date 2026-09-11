'use client';

import React, { useState, useEffect } from 'react';
import { Theme } from './types';
import { Zap, Shield, TrendingUp, Sliders, Target, Award, CheckCircle2 } from 'lucide-react';

interface CaptainTacticalCockpitProps {
  theme: Theme;
  currentRunRate?: number;
  requiredRunRate?: number;
  targetRuns?: number;
  currentScore?: number;
  currentOvers?: number;
  onTriggerToast?: (msg: string) => void;
}

export default function CaptainTacticalCockpit({
  theme: D,
  currentRunRate = 7.42,
  requiredRunRate = 8.15,
  targetRuns = 186,
  currentScore = 142,
  currentOvers = 19.1,
  onTriggerToast,
}: CaptainTacticalCockpitProps) {
  const [battingAggression, setBattingAggression] = useState<number>(4); // 1 to 5
  const [bowlingPlan, setBowlingPlan] = useState<string>('tight_stump');
  const [winProbability, setWinProbability] = useState<number>(68);
  const [appliedStatus, setAppliedStatus] = useState<string | null>(null);

  const aggressionLabels = ['1. Defend / Block', '2. Steady Accumulate', '3. Rotate & Punish', '4. Aggressive Attack', '5. Maximum Slog'];
  const aggressionColors = [D.sky, D.teal, D.emerald, D.amber, D.rose];

  // Recalculate win probability dynamically on change
  useEffect(() => {
    let baseWin = 65;
    if (battingAggression === 1) baseWin = 52;
    if (battingAggression === 2) baseWin = 60;
    if (battingAggression === 3) baseWin = 68;
    if (battingAggression === 4) baseWin = 74;
    if (battingAggression === 5) baseWin = 62; // high risk

    if (bowlingPlan === 'tight_stump') baseWin += 4;
    if (bowlingPlan === 'bouncer_barrage') baseWin += 2;
    if (bowlingPlan === 'yorker_death') baseWin += 5;
    if (bowlingPlan === 'spin_flight') baseWin += 3;

    setWinProbability(Math.min(95, Math.max(15, baseWin)));
  }, [battingAggression, bowlingPlan]);

  const handleApplyStrategy = () => {
    const msg = `Strategy Applied: Aggression Level ${battingAggression} with ${bowlingPlan.replace('_', ' ').toUpperCase()} plan active. Win Prob: ${winProbability}%`;
    setAppliedStatus(msg);
    if (onTriggerToast) {
      onTriggerToast(msg);
    }
    setTimeout(() => setAppliedStatus(null), 4000);
  };

  return (
    <div style={{
      padding: '18px',
      borderRadius: D.lg,
      background: D.cardBg,
      border: `1px solid ${D.border}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} color={D.amber} />
          <div>
            <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
              CAPTAIN'S TACTICAL AGGRESSION & MATCH WIN PREDICTOR
            </div>
            <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
              Real-time match simulation engine, win probability model, and tactical strategy presets
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            fontFamily: D.mono,
            fontSize: '11px',
            padding: '4px 12px',
            borderRadius: D.pill,
            background: `${D.amber}22`,
            color: D.amber,
            fontWeight: 800,
            border: `1px solid ${D.amber}44`,
          }}>
            Win Probability: {winProbability}%
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* Batting Aggression Slider */}
        <div style={{ padding: '14px', borderRadius: D.md, background: D.surf2, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.textPrimary }}>
              🏏 BATTING AGGRESSION PLAN
            </span>
            <span style={{ fontFamily: D.mono, fontSize: '11px', fontWeight: 800, color: aggressionColors[battingAggression - 1] }}>
              {aggressionLabels[battingAggression - 1]}
            </span>
          </div>

          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={battingAggression}
            onChange={e => setBattingAggression(Number(e.target.value))}
            style={{ width: '100%', accentColor: aggressionColors[battingAggression - 1], cursor: 'pointer' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontFamily: D.mono, color: D.textMuted }}>
            <span>Cautious (1)</span>
            <span>Balanced (3)</span>
            <span>Max Attack (5)</span>
          </div>
        </div>

        {/* Bowling Plan Selector */}
        <div style={{ padding: '14px', borderRadius: D.md, background: D.surf2, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.textPrimary }}>
              🎯 BOWLING TACTICAL STRATEGY
            </span>
          </div>
          <select
            value={bowlingPlan}
            onChange={e => setBowlingPlan(e.target.value)}
            style={{
              width: '100%',
              padding: '9px',
              borderRadius: D.sm,
              background: D.surf1,
              border: `1px solid ${D.border}`,
              color: D.textPrimary,
              fontFamily: D.head,
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <option value="tight_stump">Tight 4th Stump Line & Seam Choke</option>
            <option value="bouncer_barrage">Bouncer Barrage & Short Ball Trap</option>
            <option value="yorker_death">Yorker & Wide Slower Ball Death Plan</option>
            <option value="spin_flight">Flighted Spin & Catching Field Web</option>
          </select>
          <div style={{ fontFamily: D.body, fontSize: '10px', color: D.textMuted }}>
            AI Engine auto-adjusts field placement rules and bowler economy probability.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
        {appliedStatus ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: D.emerald, fontFamily: D.head, fontSize: '11px', fontWeight: 800 }}>
            <CheckCircle2 size={15} />
            <span>{appliedStatus}</span>
          </div>
        ) : (
          <span style={{ fontFamily: D.body, fontSize: '10px', color: D.textMuted }}>
            Modify sliders or strategy above to recalculate match projection and live tactical telemetry.
          </span>
        )}

        <button
          onClick={handleApplyStrategy}
          style={{
            padding: '9px 20px',
            borderRadius: D.pill,
            background: D.indigo,
            border: 'none',
            color: '#fff',
            fontFamily: D.head,
            fontSize: '11px',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: `0 4px 14px ${D.indigo}44`,
          }}
        >
          APPLY & BROADCAST TACTICS
        </button>
      </div>
    </div>
  );
}

