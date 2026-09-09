'use client';

import React, { useState } from 'react';
import { Theme } from './types';
import { Zap, Shield, TrendingUp, Sliders, Target, Award } from 'lucide-react';

interface CaptainTacticalCockpitProps {
  theme: Theme;
  currentRunRate?: number;
  requiredRunRate?: number;
  targetRuns?: number;
  currentScore?: number;
  currentOvers?: number;
}

export default function CaptainTacticalCockpit({
  theme: D,
  currentRunRate = 7.42,
  requiredRunRate = 8.15,
  targetRuns = 186,
  currentScore = 142,
  currentOvers = 19.1,
}: CaptainTacticalCockpitProps) {
  const [battingAggression, setBattingAggression] = useState<number>(4); // 1 to 5
  const [bowlingPlan, setBowlingPlan] = useState<string>('tight_stump');
  const [winProbability, setWinProbability] = useState<number>(68);

  const aggressionLabels = ['1. Defend / Block', '2. Steady Accumulate', '3. Rotate & Punish', '4. Aggressive Attack', '5. Maximum Slog'];
  const aggressionColors = [D.sky, D.teal, D.emerald, D.amber, D.rose];

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{
            fontFamily: D.mono,
            fontSize: '10px',
            padding: '3px 10px',
            borderRadius: D.pill,
            background: `${D.amber}22`,
            color: D.amber,
            fontWeight: 700,
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
            <span>Cautious</span>
            <span>Balanced</span>
            <span>Maximum Attack</span>
          </div>
        </div>

        {/* Bowling Plan Selector */}
        <div style={{ padding: '14px', borderRadius: D.md, background: D.surf2, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.textPrimary }}>
            🎯 BOWLING TACTICAL STRATEGY
          </span>
          <select
            value={bowlingPlan}
            onChange={e => setBowlingPlan(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: D.sm,
              background: D.surf1,
              border: `1px solid ${D.border}`,
              color: D.textPrimary,
              fontFamily: D.head,
              fontSize: '12px',
              fontWeight: 700,
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
    </div>
  );
}
