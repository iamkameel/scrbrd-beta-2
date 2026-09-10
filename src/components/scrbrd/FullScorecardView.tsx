'use client';

import React, { useState } from 'react';
import { Theme } from './types';
import { BatterProfile, BowlerProfile } from './LineupsBowlersModal';

const DEFAULT_MODAL_THEME: Theme = {
  bg: "#0b0f19",
  surf0: "#0e1424",
  surf1: "#141c2e",
  surf2: "#1c263d",
  surf3: "#253352",
  border: "rgba(255,255,255,0.08)",
  borderMed: "rgba(255,255,255,0.15)",
  textPrimary: "#f8fafc",
  textSecondary: "#94a3b8",
  textMuted: "#64748b",
  cardBg: "#141c2e",
  isDark: true,
  indigo: "#6366f1",
  sky: "#38bdf8",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  orange: "#f97316",
  violet: "#8b5cf6",
  cyan: "#06b6d4",
  teal: "#14b8a6",
  lime: "#84cc16",
  pink: "#ec4899",
  gradMain: "linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)",
  gradGold: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
  gradLive: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  pill: "9999px",
  mono: "'JetBrains Mono', 'DM Mono', monospace",
  head: "'Space Grotesk', system-ui, sans-serif",
  body: "'Inter', system-ui, sans-serif",
};

export interface InningsDataStructure {
  teamName: string;
  runs: number;
  wickets: number;
  overs: string;
  batting: BatterProfile[];
  bowling: BowlerProfile[];
  extras: { wides: number; noBalls: number; byes: number; legByes: number; penalties: number; total: number };
  fallOfWickets: { wicket: number; score: number; player: string; over: string }[];
}

interface FullScorecardViewProps {
  theme?: Theme;
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeam?: string;
  awayTeam?: string;
  matchState?: any;
  deliveries?: any[];
  battingSquad?: any[];
  bowlingAttack?: any[];
  matchSettings?: any;
  activeInnings?: string;
  innings1Data?: InningsDataStructure;
  innings2Data?: InningsDataStructure;
  activeInningsNumber?: 1 | 2;
  matchFormat?: string;
  venueName?: string;
  matchStatus?: string;
  tossText?: string;
}

export default function FullScorecardView({
  theme: userTheme,
  homeTeamName: userHomeName,
  awayTeamName: userAwayName,
  homeTeam,
  awayTeam,
  matchState,
  deliveries = [],
  battingSquad = [],
  bowlingAttack = [],
  innings1Data,
  innings2Data,
  activeInningsNumber: initialInnings = 1,
  matchFormat = "T20 Match",
  venueName = "Main Oval",
  matchStatus = "LIVE",
  tossText,
}: FullScorecardViewProps) {
  const D = userTheme || DEFAULT_MODAL_THEME;
  const resolvedHomeTeam = userHomeName || homeTeam || "Home XI";
  const resolvedAwayTeam = userAwayName || awayTeam || "Away XI";
  const resolvedToss = tossText || `${resolvedHomeTeam} won the toss and elected to bat first`;

  // Construct safe default innings 1 if not provided directly
  const computedInnings1: InningsDataStructure = React.useMemo(() => {
    if (innings1Data) return innings1Data;

    const totalRuns = matchState?.totalRuns ?? (deliveries.reduce((sum, d) => sum + (d.totalRuns || 0), 0) || 142);
    const totalWickets = matchState?.totalWickets ?? (deliveries.filter(d => d.isWicket).length || 3);
    const oversStr = matchState?.oversStr ?? "14.2";

    const defaultBatters: BatterProfile[] = (battingSquad && battingSquad.length > 0)
      ? battingSquad
      : [
          { id: "b1", name: "J. Whitfield (c)", role: "Opening Bat", hand: "R", status: "batting", runs: 67, balls: 44, fours: 7, sixes: 2, sr: 152.3 },
          { id: "b2", name: "R. Campbell", role: "Opening Bat", hand: "L", status: "out", runs: 24, balls: 18, fours: 3, sixes: 0, dismissal: "c & b Henderson", sr: 133.3 },
          { id: "b3", name: "T. Pretorius", role: "Top Order", hand: "R", status: "out", runs: 12, balls: 9, fours: 1, sixes: 0, dismissal: "b Dyer", sr: 133.3 },
          { id: "b4", name: "E. Solomons", role: "All-Rounder", hand: "L", status: "batting", runs: 31, balls: 29, fours: 2, sixes: 1, sr: 106.9 },
          { id: "b5", name: "K. Jansen", role: "Middle Order", hand: "R", status: "did_not_bat", runs: 0, balls: 0, fours: 0, sixes: 0, sr: 0 },
          { id: "b6", name: "M. Ngcobo (wk)", role: "Wicket Keeper", hand: "R", status: "did_not_bat", runs: 0, balls: 0, fours: 0, sixes: 0, sr: 0 },
        ];

    const defaultBowlers: BowlerProfile[] = (bowlingAttack && bowlingAttack.length > 0)
      ? bowlingAttack
      : [
          { id: "bw1", name: "C. Henderson", bowlingStyle: "Right Arm Fast", overs: 3.2, maidens: 0, runs: 28, wickets: 1, econ: 8.4, dots: 8 },
          { id: "bw2", name: "C. Dyer", bowlingStyle: "Right Arm Fast", overs: 4.0, maidens: 1, runs: 32, wickets: 2, econ: 8.0, dots: 11 },
          { id: "bw3", name: "L. Campbell", bowlingStyle: "Right Arm Leg Spin", overs: 4.0, maidens: 0, runs: 41, wickets: 0, econ: 10.25, dots: 6 },
          { id: "bw4", name: "A. Sclater", bowlingStyle: "Slow Left Arm", overs: 3.0, maidens: 0, runs: 33, wickets: 0, econ: 11.0, dots: 5 },
        ];

    return {
      teamName: resolvedHomeTeam,
      runs: totalRuns,
      wickets: totalWickets,
      overs: oversStr,
      batting: defaultBatters,
      bowling: defaultBowlers,
      extras: {
        wides: matchState?.wides ?? 4,
        noBalls: matchState?.noBalls ?? 1,
        byes: matchState?.byes ?? 1,
        legByes: matchState?.legByes ?? 2,
        penalties: 0,
        total: matchState?.extrasTotal ?? 8,
      },
      fallOfWickets: matchState?.fallOfWickets ?? [
        { wicket: 1, score: 48, player: "R. Campbell", over: "5.4" },
        { wicket: 2, score: 71, player: "T. Pretorius", over: "8.1" },
        { wicket: 3, score: 98, player: "J. Whitfield", over: "11.3" },
      ],
    };
  }, [innings1Data, matchState, deliveries, battingSquad, bowlingAttack, resolvedHomeTeam]);

  const [selectedInnings, setSelectedInnings] = useState<1 | 2>(innings2Data ? initialInnings : 1);

  const activeInningsData: InningsDataStructure = selectedInnings === 1 ? computedInnings1 : (innings2Data || computedInnings1);

  const safeBatting = activeInningsData.batting || [];
  const safeBowling = activeInningsData.bowling || [];
  const safeExtras = activeInningsData.extras || { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalties: 0, total: 0 };
  const safeFOW = activeInningsData.fallOfWickets || [];

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: D.surf0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      {/* Scorecard Header Banner */}
      <div
        style={{
          padding: '16px 24px',
          background: D.surf1,
          borderBottom: `1px solid ${D.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
                background: `${D.emerald}22`,
                color: D.emerald,
                fontFamily: D.mono,
                fontSize: '10px',
                fontWeight: 800,
                border: `1px solid ${D.emerald}44`,
              }}
            >
              🔴 {matchStatus.toUpperCase()}
            </span>
            <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
              {matchFormat} · {venueName}
            </span>
          </div>

          <h2 style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 800, marginTop: '4px', margin: 0 }}>
            {resolvedHomeTeam} vs {resolvedAwayTeam}
          </h2>
          <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted, marginTop: '2px' }}>
            🪙 {resolvedToss}
          </div>
        </div>

        {/* Innings Switcher Tabs */}
        <div style={{ display: 'flex', background: D.surf2, padding: '3px', borderRadius: D.pill, border: `1px solid ${D.border}` }}>
          <button
            onClick={() => setSelectedInnings(1)}
            style={{
              padding: '6px 14px',
              borderRadius: D.pill,
              border: 'none',
              background: selectedInnings === 1 ? D.sky : 'transparent',
              color: selectedInnings === 1 ? '#000' : D.textMuted,
              fontFamily: D.head,
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            1st Innings: {computedInnings1.teamName} ({computedInnings1.runs}/{computedInnings1.wickets})
          </button>

          {innings2Data && (
            <button
              onClick={() => setSelectedInnings(2)}
              style={{
                padding: '6px 14px',
                borderRadius: D.pill,
                border: 'none',
                background: selectedInnings === 2 ? D.sky : 'transparent',
                color: selectedInnings === 2 ? '#000' : D.textMuted,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              2nd Innings: {innings2Data.teamName} ({innings2Data.runs}/{innings2Data.wickets})
            </button>
          )}
        </div>
      </div>

      {/* Main Scorecard Container */}
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* Innings Summary Pill */}
        <div
          style={{
            padding: '12px 18px',
            background: D.surf1,
            borderRadius: D.lg,
            border: `1px solid ${D.borderMed}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <span style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800, color: D.textPrimary }}>
              {activeInningsData.teamName} Innings
            </span>
            <span style={{ fontFamily: D.mono, fontSize: '12px', color: D.textMuted, marginLeft: '8px' }}>
              ({activeInningsData.overs} Overs)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: D.head, fontSize: '22px', fontWeight: 900, color: D.emerald }}>
                {activeInningsData.runs} / {activeInningsData.wickets}
              </div>
              <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                RR: {(Number(String(activeInningsData.overs).split('.')[0]) + Number(String(activeInningsData.overs).split('.')[1] || 0) / 6) > 0
                  ? (activeInningsData.runs / (Number(String(activeInningsData.overs).split('.')[0]) + Number(String(activeInningsData.overs).split('.')[1] || 0) / 6)).toFixed(2)
                  : '0.00'}
              </div>
            </div>
          </div>
        </div>

        {/* 1. BATTING TABLE */}
        <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: D.surf2, borderBottom: `1px solid ${D.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
              🏏 BATTING SCORECARD
            </span>
            <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
              Strike Rate = (Runs / Balls) × 100
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: D.body, fontSize: '12px' }}>
              <thead>
                <tr style={{ background: `${D.surf2}88`, borderBottom: `1px solid ${D.border}`, color: D.textMuted, fontFamily: D.head, fontSize: '11px' }}>
                  <th style={{ padding: '10px 14px' }}>BATTER</th>
                  <th style={{ padding: '10px 14px' }}>DISMISSAL</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>R</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>B</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>4s</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>6s</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>SR</th>
                </tr>
              </thead>
              <tbody>
                {safeBatting.map((batter, idx) => {
                  const sr = batter.balls > 0 ? ((batter.runs / batter.balls) * 100).toFixed(1) : '-';
                  const isBatting = batter.status === 'batting';

                  return (
                    <tr
                      key={batter.id || idx}
                      style={{
                        borderBottom: `1px solid ${D.border}`,
                        background: isBatting ? `${D.emerald}08` : 'transparent',
                      }}
                    >
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontFamily: D.head, fontWeight: 700, color: isBatting ? D.emerald : D.textPrimary }}>
                            {batter.name}
                          </span>
                          <span style={{ padding: '1px 5px', borderRadius: D.pill, background: D.surf3, fontSize: '9px', fontFamily: D.mono, color: D.textMuted }}>
                            {batter.hand || 'R'}HB
                          </span>
                          {isBatting && (
                            <span style={{ padding: '1px 6px', borderRadius: D.pill, background: `${D.emerald}25`, color: D.emerald, fontSize: '9px', fontFamily: D.mono, fontWeight: 800 }}>
                              * not out
                            </span>
                          )}
                        </div>
                        <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                          {batter.role}
                        </div>
                      </td>

                      <td style={{ padding: '10px 14px', color: D.textSecondary, fontFamily: D.body }}>
                        {batter.dismissal || (isBatting ? 'not out' : batter.status === 'did_not_bat' ? 'did not bat' : 'retired hurt')}
                      </td>

                      <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: D.mono, fontWeight: 800, color: D.textPrimary }}>
                        {batter.status === 'did_not_bat' ? '-' : batter.runs}
                      </td>

                      <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: D.mono, color: D.textMuted }}>
                        {batter.status === 'did_not_bat' ? '-' : batter.balls}
                      </td>

                      <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: D.mono, color: D.textMuted }}>
                        {batter.status === 'did_not_bat' ? '-' : batter.fours}
                      </td>

                      <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: D.mono, color: D.textMuted }}>
                        {batter.status === 'did_not_bat' ? '-' : batter.sixes}
                      </td>

                      <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: D.mono, fontWeight: 700, color: Number(sr) > 130 ? D.sky : D.textPrimary }}>
                        {sr}
                      </td>
                    </tr>
                  );
                })}

                {/* Extras Row */}
                <tr style={{ borderBottom: `1px solid ${D.border}`, background: `${D.surf2}55` }}>
                  <td style={{ padding: '10px 14px', fontFamily: D.head, fontWeight: 800 }}>Extras</td>
                  <td style={{ padding: '10px 14px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                    (b {safeExtras.byes || 0}, lb {safeExtras.legByes || 0}, w {safeExtras.wides || 0}, nb {safeExtras.noBalls || 0}, p {safeExtras.penalties || 0})
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: D.mono, fontWeight: 800, color: D.amber }}>
                    {safeExtras.total || 0}
                  </td>
                  <td colSpan={4}></td>
                </tr>

                {/* Total Row */}
                <tr style={{ background: `${D.surf2}` }}>
                  <td style={{ padding: '12px 14px', fontFamily: D.head, fontWeight: 800, fontSize: '13px' }}>TOTAL</td>
                  <td style={{ padding: '12px 14px', fontFamily: D.mono, fontSize: '11px', color: D.textSecondary }}>
                    ({activeInningsData.overs} Overs, RR: {(Number(String(activeInningsData.overs).split('.')[0]) + Number(String(activeInningsData.overs).split('.')[1] || 0) / 6) > 0
                      ? (activeInningsData.runs / (Number(String(activeInningsData.overs).split('.')[0]) + Number(String(activeInningsData.overs).split('.')[1] || 0) / 6)).toFixed(2)
                      : '0.00'})
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: D.mono, fontWeight: 900, fontSize: '15px', color: D.emerald }}>
                    {activeInningsData.runs} / {activeInningsData.wickets}
                  </td>
                  <td colSpan={4}></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. FALL OF WICKETS (FOW) TIMELINE */}
        {safeFOW.length > 0 && (
          <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, padding: '14px 18px' }}>
            <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.rose, marginBottom: '8px' }}>
              ⚡ FALL OF WICKETS
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {safeFOW.map(f => (
                <div
                  key={f.wicket}
                  style={{
                    padding: '6px 12px',
                    borderRadius: D.md,
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span style={{ fontFamily: D.mono, fontSize: '11px', fontWeight: 800, color: D.rose }}>
                    {f.wicket}-{f.score}
                  </span>
                  <span style={{ fontFamily: D.body, fontSize: '11px', color: D.textPrimary }}>
                    ({f.player}, {f.over} ov)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. BOWLING TABLE */}
        <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: D.surf2, borderBottom: `1px solid ${D.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
              🎯 BOWLING FIGURES
            </span>
            <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
              Economy = Runs Conceded / Overs Bowled
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: D.body, fontSize: '12px' }}>
              <thead>
                <tr style={{ background: `${D.surf2}88`, borderBottom: `1px solid ${D.border}`, color: D.textMuted, fontFamily: D.head, fontSize: '11px' }}>
                  <th style={{ padding: '10px 14px' }}>BOWLER</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>O</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>M</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>R</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>W</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>ECON</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>DOTS</th>
                </tr>
              </thead>
              <tbody>
                {safeBowling.map((bowler, idx) => {
                  const econ = bowler.overs > 0 ? (bowler.runs / bowler.overs).toFixed(2) : '-';

                  return (
                    <tr key={bowler.id || idx} style={{ borderBottom: `1px solid ${D.border}` }}>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontFamily: D.head, fontWeight: 700, color: D.textPrimary }}>
                          {bowler.name}
                        </span>
                        <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, marginLeft: '6px' }}>
                          ({bowler.bowlingStyle})
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: D.mono, fontWeight: 700 }}>
                        {bowler.overs}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: D.mono, color: D.textMuted }}>
                        {bowler.maidens}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: D.mono, fontWeight: 700, color: D.amber }}>
                        {bowler.runs}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: D.mono, fontWeight: 900, color: bowler.wickets > 0 ? D.rose : D.textPrimary }}>
                        {bowler.wickets}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: D.mono, fontWeight: 700, color: Number(econ) < 6 ? D.emerald : D.textPrimary }}>
                        {econ}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: D.mono, color: D.textMuted }}>
                        {bowler.dots}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
