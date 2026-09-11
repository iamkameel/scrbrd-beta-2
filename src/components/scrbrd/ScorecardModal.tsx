'use client';

import React, { useState } from 'react';
import { Theme, MatchScorecard, InningsScorecard } from './types';
import PhaseScoringView from './PhaseScoringView';
import ScorecardWagonHeatmapView from './ScorecardWagonHeatmapView';
import { getBatterScoreStyle, getRunConfig } from './runColors';

interface ScorecardModalProps {
  theme: Theme;
  scorecard: MatchScorecard;
  onClose: () => void;
  onOpenScorer?: () => void;
}

export default function ScorecardModal({
  theme: D,
  scorecard,
  onClose,
  onOpenScorer,
}: ScorecardModalProps) {
  const [activeInnings, setActiveInnings] = useState<1 | 2>(
    scorecard.innings2 ? 2 : 1
  );
  const [subTab, setSubTab] = useState<'scorecard' | 'phases' | 'partnerships' | 'wagon_heatmaps' | 'matchInfo'>('scorecard');

  const currentInnings: InningsScorecard =
    activeInnings === 1 ? scorecard.innings1 : (scorecard.innings2 || scorecard.innings1);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(3, 7, 18, 0.88)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1050px',
          height: '92vh',
          maxHeight: '92vh',
          background: D.surf1,
          border: `1px solid ${D.borderMed}`,
          borderRadius: D.xl,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          color: D.textPrimary,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            background: D.surf0,
            borderBottom: `1px solid ${D.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: D.pill,
                  background: scorecard.status === 'live' ? `${D.emerald}22` : `${D.sky}22`,
                  color: scorecard.status === 'live' ? D.emerald : D.sky,
                  fontFamily: D.head,
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  border: `1px solid ${scorecard.status === 'live' ? D.emerald : D.sky}44`,
                }}
              >
                {scorecard.status === 'live' ? '🔴 LIVE OFFICIAL SCORECARD' : 'COMPLETED MATCH SCORECARD'}
              </span>
              <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                {scorecard.format} · {scorecard.ageGroup} · {scorecard.date}
              </span>
            </div>
            <h2 style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 800, marginTop: '4px', margin: 0 }}>
              {scorecard.title}
            </h2>
            <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textSecondary, marginTop: '2px' }}>
              📍 {scorecard.venue} · <span style={{ color: D.textMuted }}>{scorecard.toss}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {scorecard.status === 'live' && onOpenScorer && (
              <button
                onClick={onOpenScorer}
                style={{
                  padding: '6px 12px',
                  borderRadius: D.md,
                  background: D.emerald,
                  color: '#fff',
                  border: 'none',
                  fontFamily: D.head,
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                🏏 Open Live Scorer
              </button>
            )}
            <button
              onClick={() => window.print()}
              style={{
                padding: '6px 12px',
                borderRadius: D.md,
                background: D.surf2,
                color: D.textSecondary,
                border: `1px solid ${D.border}`,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🖨️ Print / Export
            </button>
            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: D.surf2,
                border: `1px solid ${D.border}`,
                color: D.textMuted,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Match Result Banner if completed */}
        {scorecard.result && (
          <div
            style={{
              padding: '8px 20px',
              background: `${D.emerald}15`,
              borderBottom: `1px solid ${D.emerald}33`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: D.head,
              fontSize: '13px',
              fontWeight: 700,
              color: D.emerald,
            }}
          >
            <span>🏆 {scorecard.result}</span>
            {scorecard.playerOfMatch && (
              <span style={{ fontSize: '11px', color: D.textSecondary, fontFamily: D.body }}>
                Player of the Match: <strong style={{ color: D.amber }}>{scorecard.playerOfMatch}</strong>
              </span>
            )}
          </div>
        )}

        {/* Innings & Subtabs Switcher */}
        <div
          style={{
            padding: '10px 20px',
            background: D.surf0,
            borderBottom: `1px solid ${D.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          {/* Innings Selector */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              onClick={() => setActiveInnings(1)}
              style={{
                padding: '6px 14px',
                borderRadius: D.pill,
                border: `1px solid ${activeInnings === 1 ? D.indigo : D.border}`,
                background: activeInnings === 1 ? `${D.indigo}22` : 'transparent',
                color: activeInnings === 1 ? D.textPrimary : D.textMuted,
                fontFamily: D.head,
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              1st Inn: {scorecard.innings1.teamShort} ({scorecard.innings1.totalRuns}/{scorecard.innings1.totalWickets})
            </button>
            {scorecard.innings2 && (
              <button
                onClick={() => setActiveInnings(2)}
                style={{
                  padding: '6px 14px',
                  borderRadius: D.pill,
                  border: `1px solid ${activeInnings === 2 ? D.indigo : D.border}`,
                  background: activeInnings === 2 ? `${D.indigo}22` : 'transparent',
                  color: activeInnings === 2 ? D.textPrimary : D.textMuted,
                  fontFamily: D.head,
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                2nd Inn: {scorecard.innings2.teamShort} ({scorecard.innings2.totalRuns}/{scorecard.innings2.totalWickets})
              </button>
            )}
          </div>

          {/* Subtabs */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {[
              { id: 'scorecard', label: '📊 Full Scorecard' },
              { id: 'phases', label: '⏱️ Phase Scoring' },
              { id: 'partnerships', label: '🤝 Partnerships' },
              { id: 'wagon_heatmaps', label: '🎯 Team Wagon Wheel & Heat Maps' },
              { id: 'matchInfo', label: 'ℹ️ Match Info' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as any)}
                style={{
                  padding: '5px 12px',
                  borderRadius: D.md,
                  border: 'none',
                  background: subTab === tab.id ? D.surf2 : 'transparent',
                  color: subTab === tab.id ? D.textPrimary : D.textMuted,
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

        {/* Scrollable Body */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {subTab === 'scorecard' && (
            <>
              {/* Innings Summary Banner */}
              <div
                style={{
                  padding: '14px 18px',
                  background: D.surf2,
                  borderRadius: D.lg,
                  border: `1px solid ${D.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800 }}>
                    {currentInnings.teamName} — Innings {currentInnings.inningsNumber}
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: '12px', color: D.textMuted, marginTop: '2px' }}>
                    Run Rate: <strong style={{ color: D.sky }}>{currentInnings.runRate.toFixed(2)}</strong> RPO
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: D.mono, fontSize: '26px', fontWeight: 800, color: D.emerald }}>
                    {currentInnings.totalRuns}/{currentInnings.totalWickets}
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: '12px', color: D.textMuted }}>
                    ({currentInnings.overs} Overs)
                  </div>
                </div>
              </div>

              {/* BATTING SCORECARD */}
              <div
                style={{
                  background: D.surf0,
                  borderRadius: D.lg,
                  border: `1px solid ${D.border}`,
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                }}
              >
                <div
                  style={{
                    padding: '12px 18px',
                    background: D.surf2,
                    borderBottom: `1px solid ${D.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 900, letterSpacing: '0.05em', color: D.sky }}>
                      🏏 BATTING SCORECARD
                    </span>
                    <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                      ({currentInnings.batting.length} Batters)
                    </span>
                  </div>

                  {/* Run Color Legend */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', fontFamily: D.mono }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fbbf24' }} />
                      <span style={{ color: '#fbbf24' }}>100+</span>
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                      <span style={{ color: '#f59e0b' }}>50+</span>
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />
                      <span style={{ color: '#38bdf8' }}>30+</span>
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                      <span style={{ color: '#10b981' }}>4s</span>
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }} />
                      <span style={{ color: '#8b5cf6' }}>6s</span>
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e' }} />
                      <span style={{ color: '#f43f5e' }}>Duck</span>
                    </span>
                  </div>
                </div>

                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${D.border}`, textAlign: 'left', background: D.surf1 }}>
                        <th style={{ padding: '10px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted, fontWeight: 700 }}>Batter</th>
                        <th style={{ padding: '10px 10px', fontFamily: D.head, fontSize: '11px', color: D.textMuted, fontWeight: 700 }}>Dismissal</th>
                        <th style={{ padding: '10px 14px', fontFamily: D.mono, fontSize: '11px', color: D.textPrimary, textAlign: 'right', fontWeight: 800 }}>R</th>
                        <th style={{ padding: '10px 12px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted, textAlign: 'right' }}>B</th>
                        <th style={{ padding: '10px 12px', fontFamily: D.mono, fontSize: '11px', color: '#10b981', textAlign: 'right', fontWeight: 700 }}>4s</th>
                        <th style={{ padding: '10px 12px', fontFamily: D.mono, fontSize: '11px', color: '#8b5cf6', textAlign: 'right', fontWeight: 700 }}>6s</th>
                        <th style={{ padding: '10px 16px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted, textAlign: 'right' }}>SR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentInnings.batting.map((b, idx) => {
                        const isDuck = b.runs === 0 && !b.isNotOut;
                        const scoreStyle = getBatterScoreStyle(b.runs, b.balls, b.isNotOut, isDuck);

                        return (
                          <tr
                            key={b.id || idx}
                            style={{
                              borderBottom: `1px solid ${D.border}`,
                              background: b.isNotOut ? `${D.emerald}0a` : idx % 2 === 1 ? `${D.surf2}40` : 'transparent',
                              transition: 'background 0.15s ease',
                            }}
                          >
                            <td style={{ padding: '12px 16px', fontFamily: D.body, fontSize: '13px', fontWeight: 700 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ color: b.isNotOut ? D.emerald : D.textPrimary }}>{b.name}</span>
                                {b.isNotOut && (
                                  <span style={{ background: `${D.emerald}25`, color: D.emerald, padding: '1px 6px', borderRadius: D.sm, fontSize: '10px', fontFamily: D.mono, fontWeight: 800 }}>
                                    NOT OUT *
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '12px 10px', fontFamily: D.body, fontSize: '12px', color: b.isNotOut ? D.emerald : D.textMuted }}>
                              {b.dismissal}
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                                {scoreStyle.badge && (
                                  <span style={{ fontSize: '11px' }}>{scoreStyle.badge}</span>
                                )}
                                <span
                                  style={{
                                    fontFamily: D.mono,
                                    fontSize: '14px',
                                    fontWeight: 900,
                                    color: scoreStyle.color,
                                    background: scoreStyle.background,
                                    border: scoreStyle.border,
                                    padding: scoreStyle.isMilestone ? '2px 8px' : isDuck ? '2px 6px' : '0',
                                    borderRadius: D.sm,
                                  }}
                                >
                                  {b.runs}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '12px 12px', fontFamily: D.mono, fontSize: '12px', color: D.textMuted, textAlign: 'right' }}>
                              {b.balls}
                            </td>
                            <td style={{ padding: '12px 12px', textAlign: 'right' }}>
                              {b.fours > 0 ? (
                                <span style={{ fontFamily: D.mono, fontSize: '12px', fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 6px', borderRadius: D.sm }}>
                                  {b.fours}
                                </span>
                              ) : (
                                <span style={{ fontFamily: D.mono, fontSize: '12px', color: D.textMuted }}>0</span>
                              )}
                            </td>
                            <td style={{ padding: '12px 12px', textAlign: 'right' }}>
                              {b.sixes > 0 ? (
                                <span style={{ fontFamily: D.mono, fontSize: '12px', fontWeight: 700, color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.18)', padding: '2px 6px', borderRadius: D.sm }}>
                                  {b.sixes}
                                </span>
                              ) : (
                                <span style={{ fontFamily: D.mono, fontSize: '12px', color: D.textMuted }}>0</span>
                              )}
                            </td>
                            <td style={{ padding: '12px 16px', fontFamily: D.mono, fontSize: '12px', color: b.sr >= 140 ? D.emerald : b.sr >= 100 ? D.sky : D.textSecondary, textAlign: 'right', fontWeight: b.sr >= 120 ? 700 : 500 }}>
                              {b.sr.toFixed(1)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Extras & Total Row */}
                <div
                  style={{
                    padding: '10px 16px',
                    borderTop: `1px solid ${D.border}`,
                    background: D.surf1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontFamily: D.mono,
                    fontSize: '12px',
                    color: D.textSecondary,
                  }}
                >
                  <div>
                    Extras: <strong>{currentInnings.extras.total}</strong> (b {currentInnings.extras.byes}, lb {currentInnings.extras.legByes}, w {currentInnings.extras.wides}, nb {currentInnings.extras.noBalls})
                  </div>
                  <div>
                    Total: <strong style={{ color: D.textPrimary, fontSize: '13px' }}>{currentInnings.totalRuns}/{currentInnings.totalWickets}</strong> ({currentInnings.overs} Ov, RR {currentInnings.runRate.toFixed(2)})
                  </div>
                </div>

                {/* Did not bat */}
                {currentInnings.didNotBat && currentInnings.didNotBat.length > 0 && (
                  <div
                    style={{
                      padding: '10px 16px',
                      borderTop: `1px solid ${D.border}`,
                      background: D.surf0,
                      fontFamily: D.body,
                      fontSize: '11px',
                      color: D.textMuted,
                    }}
                  >
                    <strong style={{ fontFamily: D.head, color: D.textSecondary }}>Yet to bat: </strong>
                    {currentInnings.didNotBat.join(', ')}
                  </div>
                )}
              </div>

              {/* BOWLING SCORECARD */}
              <div
                style={{
                  background: D.surf0,
                  borderRadius: D.lg,
                  border: `1px solid ${D.border}`,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '10px 16px',
                    background: D.surf2,
                    borderBottom: `1px solid ${D.border}`,
                    fontFamily: D.head,
                    fontSize: '12px',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    color: D.violet,
                  }}
                >
                  BOWLING
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${D.border}`, textAlign: 'left' }}>
                        <th style={{ padding: '8px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>Bowler</th>
                        <th style={{ padding: '8px 12px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted, textAlign: 'right' }}>O</th>
                        <th style={{ padding: '8px 12px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted, textAlign: 'right' }}>M</th>
                        <th style={{ padding: '8px 12px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted, textAlign: 'right' }}>R</th>
                        <th style={{ padding: '8px 12px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted, textAlign: 'right' }}>W</th>
                        <th style={{ padding: '8px 12px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted, textAlign: 'right' }}>Econ</th>
                        <th style={{ padding: '8px 12px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted, textAlign: 'right' }}>Dots</th>
                        <th style={{ padding: '8px 16px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted, textAlign: 'right' }}>WD/NB</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentInnings.bowling.map((bw, idx) => (
                        <tr
                          key={bw.id || idx}
                          style={{
                            borderBottom: `1px solid ${D.border}`,
                            background: idx % 2 === 1 ? `${D.surf2}40` : 'transparent',
                          }}
                        >
                          <td style={{ padding: '12px 16px', fontFamily: D.body, fontSize: '13px', fontWeight: 700 }}>
                            {bw.name}
                          </td>
                          <td style={{ padding: '12px 12px', fontFamily: D.mono, fontSize: '12px', textAlign: 'right' }}>
                            {bw.overs}
                          </td>
                          <td style={{ padding: '12px 12px', fontFamily: D.mono, fontSize: '12px', color: D.textMuted, textAlign: 'right' }}>
                            {bw.maidens}
                          </td>
                          <td style={{ padding: '12px 12px', fontFamily: D.mono, fontSize: '12px', textAlign: 'right', color: bw.runs > 40 ? '#f43f5e' : bw.runs <= 25 ? '#10b981' : D.textPrimary }}>
                            {bw.runs}
                          </td>
                          <td style={{ padding: '12px 12px', textAlign: 'right' }}>
                            <span
                              style={{
                                fontFamily: D.mono,
                                fontSize: '13px',
                                fontWeight: 800,
                                color: bw.wickets >= 3 ? '#fbbf24' : bw.wickets >= 1 ? '#10b981' : D.textMuted,
                                background: bw.wickets >= 3 ? 'rgba(251, 191, 36, 0.18)' : bw.wickets >= 1 ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                                padding: bw.wickets >= 1 ? '2px 8px' : '0',
                                borderRadius: D.sm,
                              }}
                            >
                              {bw.wickets}
                            </span>
                          </td>
                          <td style={{ padding: '12px 12px', fontFamily: D.mono, fontSize: '12px', color: bw.economy <= 6.0 ? '#10b981' : bw.economy <= 8.5 ? '#38bdf8' : bw.economy <= 10.0 ? '#f59e0b' : '#f43f5e', textAlign: 'right', fontWeight: 700 }}>
                            {bw.economy.toFixed(2)}
                          </td>
                          <td style={{ padding: '12px 12px', fontFamily: D.mono, fontSize: '12px', color: D.sky, textAlign: 'right' }}>
                            {bw.dots}
                          </td>
                          <td style={{ padding: '12px 16px', fontFamily: D.mono, fontSize: '12px', color: D.textMuted, textAlign: 'right' }}>
                            {bw.wides}/{bw.noBalls}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* FALL OF WICKETS */}
              {currentInnings.fow && currentInnings.fow.length > 0 && (
                <div
                  style={{
                    background: D.surf0,
                    borderRadius: D.lg,
                    border: `1px solid ${D.border}`,
                    padding: '14px 18px',
                  }}
                >
                  <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.textSecondary, marginBottom: '8px' }}>
                    FALL OF WICKETS
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {currentInnings.fow.map((f) => (
                      <div
                        key={f.wicketNumber}
                        style={{
                          padding: '6px 12px',
                          background: D.surf2,
                          borderRadius: D.md,
                          border: `1px solid ${D.border}`,
                          fontFamily: D.mono,
                          fontSize: '11px',
                        }}
                      >
                        <strong style={{ color: D.rose }}>{f.wicketNumber}-{f.score}</strong>{' '}
                        <span style={{ color: D.textSecondary }}>({f.player}, {f.over} ov)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* PHASE SCORING TAB */}
          {subTab === 'phases' && (
            <PhaseScoringView theme={D} scorecard={scorecard} activeInningsNum={activeInnings} />
          )}

          {/* PARTNERSHIPS TAB */}
          {subTab === 'partnerships' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary }}>
                {currentInnings.teamName} — Wicket Partnerships
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {currentInnings.partnerships.map((p) => {
                  const p1Pct = p.runs > 0 ? Math.round((p.player1.runs / p.runs) * 100) : 50;
                  const p2Pct = 100 - p1Pct;
                  return (
                    <div
                      key={p.wicket}
                      style={{
                        padding: '14px 18px',
                        background: D.surf0,
                        borderRadius: D.lg,
                        border: `1px solid ${D.border}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700 }}>
                          {p.wicket}{p.wicket === 1 ? 'st' : p.wicket === 2 ? 'nd' : p.wicket === 3 ? 'rd' : 'th'} Wicket Partnership {p.unbroken && <span style={{ color: D.emerald }}>(Unbroken *)</span>}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontFamily: D.mono,
                              fontSize: '14px',
                              fontWeight: 900,
                              color: p.runs >= 50 ? '#f59e0b' : '#10b981',
                              background: p.runs >= 50 ? 'rgba(245, 158, 11, 0.18)' : 'rgba(16, 185, 129, 0.15)',
                              border: `1px solid ${p.runs >= 50 ? '#f59e0b' : '#10b981'}40`,
                              padding: '2px 8px',
                              borderRadius: D.sm,
                            }}
                          >
                            {p.runs}
                          </span>
                          <span style={{ fontSize: '11px', color: D.textMuted, fontFamily: D.mono }}>({p.balls}b)</span>
                        </div>
                      </div>

                      {/* Split Bar */}
                      <div style={{ width: '100%', height: '8px', background: D.surf3, borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                        <div style={{ width: `${p1Pct}%`, height: '100%', background: D.sky }} />
                        <div style={{ width: `${p2Pct}%`, height: '100%', background: D.amber }} />
                      </div>

                      {/* Batter Breakdown */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.body, fontSize: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: D.sky }} />
                          <span>{p.player1.name}: <strong>{p.player1.runs}</strong> ({p.player1.balls}b)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{p.player2.name}: <strong>{p.player2.runs}</strong> ({p.player2.balls}b)</span>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: D.amber }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MATCH INFO TAB */}
          {subTab === 'matchInfo' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '16px', background: D.surf0, borderRadius: D.lg, border: `1px solid ${D.border}` }}>
                <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.sky, marginBottom: '10px' }}>
                  MATCH OFFICIALS
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: D.body, fontSize: '12px' }}>
                  <div>
                    <span style={{ color: D.textMuted }}>Umpires: </span>
                    <strong>{scorecard.umpires.join(' & ')}</strong>
                  </div>
                  <div>
                    <span style={{ color: D.textMuted }}>Official Scorers: </span>
                    <strong>{scorecard.scorers.join(' · ')}</strong>
                  </div>
                  <div>
                    <span style={{ color: D.textMuted }}>Toss: </span>
                    <span>{scorecard.toss}</span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px', background: D.surf0, borderRadius: D.lg, border: `1px solid ${D.border}` }}>
                <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.emerald, marginBottom: '10px' }}>
                  SANCTION & PLAYING CONDITIONS
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: D.body, fontSize: '12px' }}>
                  <div>
                    <span style={{ color: D.textMuted }}>Format: </span>
                    <strong>{scorecard.format} Regulations</strong>
                  </div>
                  <div>
                    <span style={{ color: D.textMuted }}>Overs Limit: </span>
                    <strong>{scorecard.format === 'T20' ? '20 Overs per side' : scorecard.format === '50-Over' ? '50 Overs per side' : 'Declaration Time/Overs Match'}</strong>
                  </div>
                  <div>
                    <span style={{ color: D.textMuted }}>DRS Method: </span>
                    <strong>Hawk-Eye Virtual Ball Tracking & UltraEdge Enabled</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Team Wagon Wheel & Heat Maps (With Player Statistics & Dossier Drilldown) */}
          {subTab === 'wagon_heatmaps' && (
            <ScorecardWagonHeatmapView
              theme={D}
              scorecard={scorecard}
              activeInnings={activeInnings}
            />
          )}
        </div>
      </div>
    </div>
  );
}
