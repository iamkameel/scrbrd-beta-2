'use client';

import React, { useState } from 'react';
import { Theme, MatchScorecard, PhaseStats } from './types';

interface PhaseScoringViewProps {
  theme: Theme;
  scorecard: MatchScorecard;
  activeInningsNum?: 1 | 2;
}

export default function PhaseScoringView({
  theme: D,
  scorecard,
  activeInningsNum = 1,
}: PhaseScoringViewProps) {
  const [selectedInnings, setSelectedInnings] = useState<1 | 2>(activeInningsNum);
  const [selectedPhase, setSelectedPhase] = useState<'all' | 'powerplay' | 'middle' | 'death'>('all');

  const inn1 = scorecard.innings1;
  const inn2 = scorecard.innings2;
  const currentInnings = selectedInnings === 1 ? inn1 : (inn2 || inn1);
  const { powerplay, middle, death } = currentInnings.phases;

  const renderPhaseCard = (phase: PhaseStats, color: string, badgeLabel: string) => {
    const isAheadOfPar = phase.runs >= phase.parScore;
    return (
      <div
        key={phase.name}
        style={{
          background: D.surf0,
          borderRadius: D.lg,
          border: `1px solid ${D.border}`,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: D.pill,
                  background: `${color}20`,
                  color: color,
                  fontFamily: D.head,
                  fontSize: '10px',
                  fontWeight: 800,
                  border: `1px solid ${color}40`,
                }}
              >
                {badgeLabel}
              </span>
              <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                Overs {phase.oversRange}
              </span>
            </div>
            <h4 style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800, margin: '4px 0 0 0' }}>
              {phase.name}
            </h4>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 800, color: D.textPrimary }}>
              {phase.runs}/{phase.wickets}
            </div>
            <div style={{ fontFamily: D.mono, fontSize: '11px', color: color, fontWeight: 700 }}>
              {phase.runRate.toFixed(2)} RPO
            </div>
          </div>
        </div>

        {/* Comparison to Par */}
        <div
          style={{
            padding: '8px 12px',
            background: D.surf2,
            borderRadius: D.md,
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: D.mono,
            fontSize: '11px',
          }}
        >
          <span style={{ color: D.textMuted }}>Historical Ground Par: <strong>{phase.parScore}</strong></span>
          <span style={{ color: isAheadOfPar ? D.emerald : D.rose, fontWeight: 700 }}>
            {isAheadOfPar ? `+${phase.runs - phase.parScore} above par` : `${phase.runs - phase.parScore} below par`}
          </span>
        </div>

        {/* Key Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          <div style={{ padding: '8px', background: D.surf2, borderRadius: D.md, textAlign: 'center' }}>
            <div style={{ fontFamily: D.mono, fontSize: '14px', fontWeight: 700, color: D.emerald }}>
              {phase.fours}x4 · {phase.sixes}x6
            </div>
            <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>BOUNDARIES</div>
          </div>
          <div style={{ padding: '8px', background: D.surf2, borderRadius: D.md, textAlign: 'center' }}>
            <div style={{ fontFamily: D.mono, fontSize: '14px', fontWeight: 700, color: D.sky }}>
              {phase.dotPct}%
            </div>
            <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>DOT BALL %</div>
          </div>
          <div style={{ padding: '8px', background: D.surf2, borderRadius: D.md, textAlign: 'center' }}>
            <div style={{ fontFamily: D.mono, fontSize: '14px', fontWeight: 700, color: D.violet }}>
              {phase.strikeRotPct}%
            </div>
            <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>STRIKE ROTATION</div>
          </div>
        </div>

        {/* Phase Ball Breakdown Ratio Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.body, fontSize: '10px', color: D.textMuted, marginBottom: '4px' }}>
            <span>Dots ({phase.dotPct}%)</span>
            <span>Singles/Doubles ({phase.strikeRotPct}%)</span>
            <span>Boundaries ({phase.boundaryPct}%)</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: D.surf3, borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${phase.dotPct}%`, height: '100%', background: D.rose }} />
            <div style={{ width: `${phase.strikeRotPct}%`, height: '100%', background: D.sky }} />
            <div style={{ width: `${phase.boundaryPct}%`, height: '100%', background: D.emerald }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, margin: 0 }}>
            Phase Scoring Analysis
          </h3>
          <p style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted, margin: '2px 0 0 0' }}>
            Tactical breakdown across Powerplay, Middle, and Death Overs
          </p>
        </div>

        {/* Innings Selector if 2 innings exist */}
        {inn2 && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setSelectedInnings(1)}
              style={{
                padding: '4px 12px',
                borderRadius: D.pill,
                border: `1px solid ${selectedInnings === 1 ? D.indigo : D.border}`,
                background: selectedInnings === 1 ? `${D.indigo}22` : 'transparent',
                color: selectedInnings === 1 ? D.textPrimary : D.textMuted,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              1st Inn ({inn1.teamShort})
            </button>
            <button
              onClick={() => setSelectedInnings(2)}
              style={{
                padding: '4px 12px',
                borderRadius: D.pill,
                border: `1px solid ${selectedInnings === 2 ? D.indigo : D.border}`,
                background: selectedInnings === 2 ? `${D.indigo}22` : 'transparent',
                color: selectedInnings === 2 ? D.textPrimary : D.textMuted,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              2nd Inn ({inn2.teamShort})
            </button>
          </div>
        )}
      </div>

      {/* Phase Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
        {renderPhaseCard(powerplay, D.sky, 'PHASE 1')}
        {renderPhaseCard(middle, D.amber, 'PHASE 2')}
        {renderPhaseCard(death, D.rose, 'PHASE 3')}
      </div>

      {/* Phase Comparison Chart (Both Innings Side-by-Side if available) */}
      {inn2 && (
        <div
          style={{
            background: D.surf0,
            borderRadius: D.lg,
            border: `1px solid ${D.border}`,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary }}>
            Head-to-Head Phase Comparison ({inn1.teamShort} vs {inn2.teamShort})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { phaseName: 'Powerplay', p1: inn1.phases.powerplay, p2: inn2.phases.powerplay },
              { phaseName: 'Middle Overs', p1: inn1.phases.middle, p2: inn2.phases.middle },
              { phaseName: 'Death Overs', p1: inn1.phases.death, p2: inn2.phases.death },
            ].map(({ phaseName, p1, p2 }) => {
              const maxRuns = Math.max(p1.runs, p2.runs, 1);
              const p1Width = Math.round((p1.runs / (p1.runs + p2.runs || 1)) * 100);
              const p2Width = 100 - p1Width;

              return (
                <div key={phaseName} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.head, fontSize: '12px', fontWeight: 700 }}>
                    <span>
                      {inn1.teamShort}: <strong style={{ color: D.sky }}>{p1.runs}/{p1.wickets}</strong> ({p1.runRate.toFixed(1)} RPO)
                    </span>
                    <span style={{ color: D.textMuted }}>{phaseName}</span>
                    <span>
                      {inn2.teamShort}: <strong style={{ color: D.emerald }}>{p2.runs}/{p2.wickets}</strong> ({p2.runRate.toFixed(1)} RPO)
                    </span>
                  </div>

                  <div style={{ width: '100%', height: '8px', background: D.surf3, borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${p1Width}%`, height: '100%', background: D.sky }} />
                    <div style={{ width: `${p2Width}%`, height: '100%', background: D.emerald }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
