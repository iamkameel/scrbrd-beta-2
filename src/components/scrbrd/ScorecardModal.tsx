'use client';

import React, { useState } from 'react';
import { Theme, MatchScorecard, InningsScorecard } from './types';
import PhaseScoringView from './PhaseScoringView';

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
  const [subTab, setSubTab] = useState<'scorecard' | 'phases' | 'partnerships' | 'matchInfo'>('scorecard');

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
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { id: 'scorecard', label: '📊 Full Scorecard' },
              { id: 'phases', label: '⏱️ Phase Scoring' },
              { id: 'partnerships', label: '🤝 Partnerships' },
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                    color: D.sky,
                  }}
                >
                  BATTING
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${D.border}`, textAlign: 'left' }}>
                        <th style={{ padding: '8px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>Batter</th>
                        <th style={{ padding: '8px 8px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>Dismissal</th>
                        <th style={{ padding: '8px 12px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted, textAlign: 'right' }}>R</th>
                        <th style={{ padding: '8px 12px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted, textAlign: 'right' }}>B</th>
                        <th style={{ padding: '8px 12px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted, textAlign: 'right' }}>4s</th>
                        <th style={{ padding: '8px 12px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted, textAlign: 'right' }}>6s</th>
                        <th style={{ padding: '8px 16px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted, textAlign: 'right' }}>SR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentInnings.batting.map((b) => (
                        <tr
                          key={b.id}
                          style={{
                            borderBottom: `1px solid ${D.border}`,
                            background: b.isNotOut ? `${D.emerald}08` : 'transparent',
                          }}
                        >
                          <td style={{ padding: '10px 16px', fontFamily: D.body, fontSize: '13px', fontWeight: 700 }}>
                            {b.name} {b.isNotOut && <span style={{ color: D.emerald }}>*</span>}
                          </td>
                          <td style={{ padding: '10px 8px', fontFamily: D.body, fontSize: '12px', color: b.isNotOut ? D.emerald : D.textMuted }}>
                            {b.dismissal}
                          </td>
                          <td style={{ padding: '10px 12px', fontFamily: D.mono, fontSize: '13px', fontWeight: 800, textAlign: 'right', color: b.runs >= 50 ? D.amber : D.textPrimary }}>
                            {b.runs}
                          </td>
                          <td style={{ padding: '10px 12px', fontFamily: D.mono, fontSize: '12px', color: D.textMuted, textAlign: 'right' }}>
                            {b.balls}
                          </td>
                          <td style={{ padding: '10px 12px', fontFamily: D.mono, fontSize: '12px', color: D.emerald, textAlign: 'right' }}>
                            {b.fours}
                          </td>
                          <td style={{ padding: '10px 12px', fontFamily: D.mono, fontSize: '12px', color: D.violet, textAlign: 'right' }}>
                            {b.sixes}
                          </td>
                          <td style={{ padding: '10px 16px', fontFamily: D.mono, fontSize: '12px', color: b.sr >= 130 ? D.emerald : D.textSecondary, textAlign: 'right' }}>
                            {b.sr.toFixed(2)}
                          </td>
                        </tr>
                      ))}
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
                      {currentInnings.bowling.map((bw) => (
                        <tr key={bw.id} style={{ borderBottom: `1px solid ${D.border}` }}>
                          <td style={{ padding: '10px 16px', fontFamily: D.body, fontSize: '13px', fontWeight: 700 }}>
                            {bw.name}
                          </td>
                          <td style={{ padding: '10px 12px', fontFamily: D.mono, fontSize: '12px', textAlign: 'right' }}>
                            {bw.overs}
                          </td>
                          <td style={{ padding: '10px 12px', fontFamily: D.mono, fontSize: '12px', color: D.textMuted, textAlign: 'right' }}>
                            {bw.maidens}
                          </td>
                          <td style={{ padding: '10px 12px', fontFamily: D.mono, fontSize: '12px', textAlign: 'right' }}>
                            {bw.runs}
                          </td>
                          <td style={{ padding: '10px 12px', fontFamily: D.mono, fontSize: '13px', fontWeight: 800, color: bw.wickets >= 3 ? D.amber : D.emerald, textAlign: 'right' }}>
                            {bw.wickets}
                          </td>
                          <td style={{ padding: '10px 12px', fontFamily: D.mono, fontSize: '12px', color: bw.economy <= 6.0 ? D.emerald : D.textSecondary, textAlign: 'right' }}>
                            {bw.economy.toFixed(2)}
                          </td>
                          <td style={{ padding: '10px 12px', fontFamily: D.mono, fontSize: '12px', color: D.sky, textAlign: 'right' }}>
                            {bw.dots}
                          </td>
                          <td style={{ padding: '10px 16px', fontFamily: D.mono, fontSize: '12px', color: D.textMuted, textAlign: 'right' }}>
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
                        <div style={{ fontFamily: D.mono, fontSize: '14px', fontWeight: 800, color: D.emerald }}>
                          {p.runs} runs <span style={{ fontSize: '11px', color: D.textMuted, fontWeight: 'normal' }}>({p.balls} balls)</span>
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
        </div>
      </div>
    </div>
  );
}
