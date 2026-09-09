'use client';

import React, { useState } from 'react';
import { Theme, MatchScorecard } from './types';

interface MatchAnalyticsViewProps {
  theme: Theme;
  scorecard: MatchScorecard;
  onOpenScorer?: () => void;
}

export default function MatchAnalyticsView({
  theme: D,
  scorecard,
  onOpenScorer,
}: MatchAnalyticsViewProps) {
  const [activeChart, setActiveChart] = useState<'manhattan' | 'worm' | 'pitchmap' | 'commentary'>('manhattan');
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<'all' | 'powerplay' | 'middle' | 'death'>('all');

  // Win probability percentages
  const winA = scorecard.winProb.teamA;
  const winB = scorecard.winProb.teamB;

  // Manhattan calculations
  const maxOverRuns = Math.max(...scorecard.manhattan.map((m) => m.runs), 15);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: D.pill,
                background: `${D.sky}20`,
                color: D.sky,
                fontFamily: D.head,
                fontSize: '10px',
                fontWeight: 800,
                border: `1px solid ${D.sky}40`,
              }}
            >
              LIVE TELEMETRY & MATCH ANALYTICS
            </span>
            <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
              {scorecard.title}
            </span>
          </div>
          <h2 style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 800, margin: '4px 0 0 0' }}>
            Real-Time Analytics & Tactical Projections
          </h2>
        </div>

        {/* Chart View Switcher */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'manhattan', label: '📊 Manhattan Chart' },
            { id: 'worm', label: '📈 Worm (Chase Curve)' },
            { id: 'pitchmap', label: '🎯 Pitch Map & Lengths' },
            { id: 'commentary', label: '🎙️ Live Event Stream' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveChart(tab.id as any)}
              style={{
                padding: '6px 12px',
                borderRadius: D.md,
                border: `1px solid ${activeChart === tab.id ? D.sky : D.border}`,
                background: activeChart === tab.id ? `${D.sky}20` : D.surf0,
                color: activeChart === tab.id ? D.textPrimary : D.textMuted,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* WIN PROBABILITY / WASP GAUGE BANNER */}
      <div
        style={{
          padding: '16px 20px',
          background: D.surf0,
          borderRadius: D.lg,
          border: `1px solid ${D.border}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, letterSpacing: '0.05em', color: D.textSecondary }}>
            LIVE WIN PREDICTOR (WASP / AI PROBABILITY MODEL)
          </div>
          <div style={{ fontFamily: D.mono, fontSize: '12px', color: D.textMuted }}>
            Venue: {scorecard.venue}
          </div>
        </div>

        {/* Win percentage meter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.head, fontSize: '14px', fontWeight: 800 }}>
            <span style={{ color: D.sky }}>
              {scorecard.winProb.teamAName} {winA}%
            </span>
            <span style={{ color: D.amber }}>
              {winB}% {scorecard.winProb.teamBName}
            </span>
          </div>

          <div style={{ width: '100%', height: '12px', background: D.surf3, borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${winA}%`, height: '100%', background: D.sky, transition: 'width 0.4s ease' }} />
            <div style={{ width: `${winB}%`, height: '100%', background: D.amber, transition: 'width 0.4s ease' }} />
          </div>
        </div>

        <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textSecondary }}>
          💡 <strong>Key Momentum Factor:</strong> {scorecard.winProb.momentumText}
        </div>
      </div>

      {/* MANHATTAN CHART */}
      {activeChart === 'manhattan' && (
        <div
          style={{
            background: D.surf0,
            borderRadius: D.lg,
            border: `1px solid ${D.border}`,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800, margin: 0 }}>
                Manhattan: Runs & Wickets Per Over
              </h3>
              <p style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted, margin: '2px 0 0 0' }}>
                Bars indicate runs per over; red circles indicate wickets fallen
              </p>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '12px', fontFamily: D.mono, fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '10px', height: '10px', background: D.sky, borderRadius: '2px' }} />
                <span>Powerplay (1-6)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '10px', height: '10px', background: D.indigo, borderRadius: '2px' }} />
                <span>Middle (7-15)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '10px', height: '10px', background: D.violet, borderRadius: '2px' }} />
                <span>Death (16-20)</span>
              </div>
            </div>
          </div>

          {/* SVG Manhattan Visualizer */}
          <div style={{ width: '100%', height: '240px', position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingBottom: '24px', borderBottom: `1px solid ${D.border}` }}>
            {scorecard.manhattan.map((item) => {
              const heightPct = Math.max(8, (item.runs / maxOverRuns) * 100);
              const barColor =
                item.phase === 'powerplay' ? D.sky : item.phase === 'middle' ? D.indigo : D.violet;

              return (
                <div
                  key={item.over}
                  style={{
                    flex: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    position: 'relative',
                  }}
                  title={`Over ${item.over}: ${item.runs} runs, ${item.wickets} wkts (${item.bowler})`}
                >
                  {/* Wicket marker */}
                  {item.wickets > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: `calc(${heightPct}% + 4px)`,
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: D.rose,
                        color: '#fff',
                        fontFamily: D.mono,
                        fontSize: '10px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(244, 63, 94, 0.4)',
                        zIndex: 2,
                      }}
                    >
                      {item.wickets}W
                    </div>
                  )}

                  {/* Run number above bar */}
                  <span style={{ fontFamily: D.mono, fontSize: '10px', fontWeight: 700, color: D.textSecondary, marginBottom: '2px' }}>
                    {item.runs}
                  </span>

                  {/* Bar */}
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '32px',
                      height: `${heightPct}%`,
                      background: barColor,
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease',
                    }}
                  />

                  {/* Over label below */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-20px',
                      fontFamily: D.mono,
                      fontSize: '10px',
                      color: D.textMuted,
                    }}
                  >
                    Ov{item.over}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WORM GRAPH */}
      {activeChart === 'worm' && (
        <div
          style={{
            background: D.surf0,
            borderRadius: D.lg,
            border: `1px solid ${D.border}`,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800, margin: 0 }}>
                Worm Chart (Cumulative Run Progression)
              </h3>
              <p style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted, margin: '2px 0 0 0' }}>
                Comparison of runs scored over-by-over against required target rate
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', fontFamily: D.mono, fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '3px', background: D.amber }} />
                <span>{scorecard.innings1.teamShort} (1st Inn)</span>
              </div>
              {scorecard.innings2 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '12px', height: '3px', background: D.emerald }} />
                  <span>{scorecard.innings2.teamShort} (Chase)</span>
                </div>
              )}
            </div>
          </div>

          {/* SVG Worm Line Graph */}
          <div style={{ width: '100%', height: '220px', background: D.surf1, borderRadius: D.md, padding: '10px', position: 'relative' }}>
            <svg viewBox="0 0 600 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              {/* Grid lines */}
              <line x1="40" y1="20" x2="580" y2="20" stroke={D.border} strokeDasharray="3 3" />
              <line x1="40" y1="70" x2="580" y2="70" stroke={D.border} strokeDasharray="3 3" />
              <line x1="40" y1="120" x2="580" y2="120" stroke={D.border} strokeDasharray="3 3" />
              <line x1="40" y1="170" x2="580" y2="170" stroke={D.border} />

              {/* Innings 1 line */}
              <path
                d="M 40 170 L 100 155 L 160 135 L 220 115 L 280 95 L 340 78 L 400 62 L 460 48 L 520 35 L 580 22"
                fill="none"
                stroke={D.amber}
                strokeWidth="3"
              />

              {/* Innings 2 line (Live) */}
              {scorecard.innings2 && (
                <path
                  d="M 40 170 L 100 152 L 160 137 L 220 117 L 280 98 L 340 76 L 400 58 L 420 52"
                  fill="none"
                  stroke={D.emerald}
                  strokeWidth="3.5"
                />
              )}

              {/* Live Head Pulse */}
              {scorecard.innings2 && (
                <circle cx="420" cy="52" r="5" fill={D.emerald} />
              )}
            </svg>
          </div>
        </div>
      )}

      {/* PITCH MAP & LENGTHS */}
      {activeChart === 'pitchmap' && (
        <div
          style={{
            background: D.surf0,
            borderRadius: D.lg,
            border: `1px solid ${D.border}`,
            padding: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Pitch Length Diagram */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800 }}>
              Bowler Length Heatmap & Release Zones
            </div>
            <div
              style={{
                height: '240px',
                background: '#453229',
                borderRadius: D.md,
                border: '2px solid #8b7355',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {[
                { name: 'Short / Bouncer (8-10m)', pct: 12, color: 'rgba(239, 68, 68, 0.4)' },
                { name: 'Back of Length (6-8m)', pct: 28, color: 'rgba(245, 158, 11, 0.4)' },
                { name: 'Good Length (4-6m)', pct: 42, color: 'rgba(16, 185, 129, 0.5)' },
                { name: 'Full / Driving (2-4m)', pct: 14, color: 'rgba(14, 165, 233, 0.4)' },
                { name: 'Yorker / Stumps (0-2m)', pct: 4, color: 'rgba(139, 92, 246, 0.5)' },
              ].map((zone) => (
                <div
                  key={zone.name}
                  style={{
                    flex: 1,
                    background: zone.color,
                    borderBottom: '1px dashed rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 14px',
                    color: '#fff',
                    fontFamily: D.mono,
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  <span>{zone.name}</span>
                  <span style={{ background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '4px' }}>
                    {zone.pct}% balls
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Line Telemetry */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800 }}>
              Delivery Line Distribution
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { line: 'Outside Off Stump (Channel of Uncertainty)', val: 54, color: D.sky },
                { line: 'Stumps (Attacking Wicket)', val: 32, color: D.emerald },
                { line: 'Down Leg / Pads', val: 14, color: D.amber },
              ].map((item) => (
                <div key={item.line} style={{ padding: '10px', background: D.surf2, borderRadius: D.md }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.body, fontSize: '11px', marginBottom: '4px' }}>
                    <span>{item.line}</span>
                    <strong style={{ fontFamily: D.mono, color: item.color }}>{item.val}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: D.surf3, borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${item.val}%`, height: '100%', background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LIVE EVENT COMMENTARY STREAM */}
      {activeChart === 'commentary' && (
        <div
          style={{
            background: D.surf0,
            borderRadius: D.lg,
            border: `1px solid ${D.border}`,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800 }}>
            Live Ball-by-Ball Feed & Tactical Insights
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { over: '14.2', text: 'FOUR! Whitfield dances down and creams it inside-out over extra cover!', type: 'boundary', runs: '4 runs' },
              { over: '14.1', text: 'Single pushed into the gap at point, solid strike rotation.', type: 'single', runs: '1 run' },
              { over: '13.6', text: 'DOT BALL. Deceptive slower ball cutter beats the outside edge.', type: 'dot', runs: '0 runs' },
              { over: '13.5', text: 'SIX! Dispatched over deep mid-wicket into the pavilion seating!', type: 'six', runs: '6 runs' },
              { over: '8.5', text: 'WICKET! T. McGough caught at mid-off! Breakthrough for Kearsney.', type: 'wicket', runs: 'W' },
            ].map((comm, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px 14px',
                  background: D.surf2,
                  borderRadius: D.md,
                  border: `1px solid ${D.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <span
                  style={{
                    fontFamily: D.mono,
                    fontSize: '12px',
                    fontWeight: 800,
                    color: comm.type === 'six' ? D.violet : comm.type === 'boundary' ? D.emerald : comm.type === 'wicket' ? D.rose : D.sky,
                    minWidth: '38px',
                  }}
                >
                  {comm.over}
                </span>
                <span style={{ fontFamily: D.body, fontSize: '12px', color: D.textPrimary, flex: 1 }}>
                  {comm.text}
                </span>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: D.pill,
                    background: comm.type === 'six' ? `${D.violet}22` : comm.type === 'boundary' ? `${D.emerald}22` : comm.type === 'wicket' ? `${D.rose}22` : `${D.sky}22`,
                    color: comm.type === 'six' ? D.violet : comm.type === 'boundary' ? D.emerald : comm.type === 'wicket' ? D.rose : D.sky,
                    fontFamily: D.mono,
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {comm.runs}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
