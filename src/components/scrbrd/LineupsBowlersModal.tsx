'use client';

import React, { useState } from 'react';
import { Theme } from './types';

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

export interface BatterProfile {
  id: string;
  name: string;
  role: 'Opener' | 'Top Order' | 'Middle Order' | 'Finisher' | 'Wicket-Keeper' | 'All-Rounder' | 'Bowler';
  hand: 'R' | 'L';
  battingHand?: 'R' | 'L';
  status: 'batting' | 'out' | 'did_not_bat' | 'retired_hurt';
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  dismissal?: string;
  position: number;
}

export interface BowlerProfile {
  id: string;
  name: string;
  bowlingStyle: string; // e.g. "Right-arm Fast", "Left-arm Orthodox", "Right-arm Off Break"
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  dots: number;
  maxQuota: number;
  isCurrentlyBowling?: boolean;
}

interface LineupsBowlersModalProps {
  theme?: Theme;
  isOpen?: boolean;
  battingTeamName?: string;
  bowlingTeamName?: string;
  battingLineup?: BatterProfile[];
  battingSquad?: BatterProfile[];
  bowlingAttack?: BowlerProfile[];
  activeStrikerId?: string;
  activeNonStrikerId?: string;
  activeBowlerId?: string;
  maxOversPerBowler?: number;
  onSwapStrike?: () => void;
  onSelectStriker?: (id: string) => void;
  onSelectNonStriker?: (id: string) => void;
  onSelectBowler?: (id: string) => void;
  onUpdateBatter?: (id: string, updates: Partial<BatterProfile>) => void;
  onUpdateBowler?: (id: string, updates: Partial<BowlerProfile>) => void;
  onUpdateBattingSquad?: (squad: any[]) => void;
  onUpdateBowlingAttack?: (attack: any[]) => void;
  onReorderBattingLineup?: (reordered: BatterProfile[]) => void;
  onClose: () => void;
}

export default function LineupsBowlersModal({
  theme: customTheme,
  isOpen = true,
  battingTeamName = "Batting XI",
  bowlingTeamName = "Bowling XI",
  battingLineup: rawLineup,
  battingSquad: rawSquad,
  bowlingAttack = [],
  activeStrikerId = "",
  activeNonStrikerId = "",
  activeBowlerId = "",
  maxOversPerBowler = 4,
  onSwapStrike = () => {},
  onSelectStriker = () => {},
  onSelectNonStriker = () => {},
  onSelectBowler = () => {},
  onUpdateBatter = () => {},
  onUpdateBowler = () => {},
  onUpdateBattingSquad,
  onUpdateBowlingAttack,
  onReorderBattingLineup = () => {},
  onClose,
}: LineupsBowlersModalProps) {
  const D = customTheme || DEFAULT_MODAL_THEME;
  const battingLineup = rawLineup || rawSquad || [];
  const [activeTab, setActiveTab] = useState<'active_pairs' | 'batting_order' | 'bowling_attack'>('active_pairs');
  const [editingBatterId, setEditingBatterId] = useState<string | null>(null);

  if (isOpen === false) return null;

  const striker = battingLineup.find(b => b.id === activeStrikerId) || battingLineup[0];
  const nonStriker = battingLineup.find(b => b.id === activeNonStrikerId) || battingLineup[1];
  const currentBowler = bowlingAttack.find(b => b.id === activeBowlerId) || bowlingAttack[0];

  const handleMoveBatter = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === battingLineup.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const listCopy = [...battingLineup];
    const temp = listCopy[index];
    listCopy[index] = listCopy[targetIdx];
    listCopy[targetIdx] = temp;
    // update position numbers
    const updated = listCopy.map((b, idx) => ({ ...b, position: idx + 1 }));
    onReorderBattingLineup(updated);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10010,
        background: 'rgba(3, 7, 18, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '92vh',
          background: D.surf1,
          border: `1px solid ${D.borderMed}`,
          borderRadius: D.xl,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
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
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: D.md,
                background: `${D.sky}20`,
                border: `1px solid ${D.sky}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              👥
            </div>
            <div>
              <h2 style={{ fontFamily: D.head, fontSize: '17px', fontWeight: 800, margin: 0 }}>
                Lineup Management & Bowler Options
              </h2>
              <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                Manage active batting pair, rotate strike, choose bowlers, and set batting order
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: D.surf2,
              border: `1px solid ${D.border}`,
              color: D.textPrimary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: `1px solid ${D.border}`,
            background: D.surf0,
            padding: '0 20px',
            gap: '8px',
          }}
        >
          {[
            { id: 'active_pairs', label: '🏏 Active Batting & Bowler Pair' },
            { id: 'batting_order', label: `📋 Batting Lineup (${battingTeamName})` },
            { id: 'bowling_attack', label: `🎯 Bowling Attack & Quotas (${bowlingTeamName})` },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                padding: '12px 14px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === t.id ? `2px solid ${D.sky}` : '2px solid transparent',
                color: activeTab === t.id ? D.sky : D.textMuted,
                fontFamily: D.head,
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* TAB 1: Active Pairs & Quick Swap */}
          {activeTab === 'active_pairs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Batting Pair Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.sky }}>
                    ACTIVE BATTING PARTNERSHIP
                  </span>
                  <button
                    onClick={onSwapStrike}
                    style={{
                      padding: '6px 14px',
                      borderRadius: D.pill,
                      background: `${D.amber}22`,
                      border: `1px solid ${D.amber}55`,
                      color: D.amber,
                      fontFamily: D.head,
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    ⇄ ROTATE STRIKE (SWAP STRIKER)
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {/* Striker Card */}
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: D.lg,
                      background: `${D.emerald}10`,
                      border: `2px solid ${D.emerald}55`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: D.pill,
                          background: D.emerald,
                          color: '#000',
                          fontFamily: D.mono,
                          fontSize: '10px',
                          fontWeight: 800,
                        }}
                      >
                        ⚡ ACTIVE STRIKER
                      </span>
                      <button
                        onClick={() => onUpdateBatter(striker.id, { hand: striker.hand === 'R' ? 'L' : 'R' })}
                        style={{
                          padding: '2px 8px',
                          borderRadius: D.pill,
                          background: D.surf2,
                          border: `1px solid ${D.border}`,
                          color: D.textSecondary,
                          fontFamily: D.mono,
                          fontSize: '10px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {striker.hand === 'R' ? 'Right-Handed' : 'Left-Handed'}
                      </button>
                    </div>

                    <div>
                      <div style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.textPrimary }}>
                        {striker.name}
                      </div>
                      <div style={{ fontFamily: D.mono, fontSize: '12px', color: D.emerald, marginTop: '2px' }}>
                        {striker.runs} runs ({striker.balls} balls) · {striker.fours}x4, {striker.sixes}x6 · SR: {striker.balls > 0 ? ((striker.runs / striker.balls) * 100).toFixed(1) : '0.0'}
                      </div>
                    </div>

                    {/* Change Striker Select */}
                    <div>
                      <label style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>
                        Change / Substitute Striker:
                      </label>
                      <select
                        value={striker.id}
                        onChange={e => onSelectStriker(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          background: D.surf1,
                          border: `1px solid ${D.border}`,
                          borderRadius: D.sm,
                          color: D.textPrimary,
                          fontFamily: D.head,
                          fontSize: '12px',
                          fontWeight: 700,
                        }}
                      >
                        {battingLineup.map(b => (
                          <option key={b.id} value={b.id} disabled={b.id === nonStriker.id || b.status === 'out'}>
                            #{b.position} {b.name} ({b.role}) - {b.status.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Non-Striker Card */}
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: D.lg,
                      background: D.surf2,
                      border: `1px solid ${D.border}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: D.pill,
                          background: D.surf3,
                          color: D.textMuted,
                          fontFamily: D.mono,
                          fontSize: '10px',
                          fontWeight: 800,
                        }}
                      >
                        NON-STRIKER
                      </span>
                      <button
                        onClick={() => onUpdateBatter(nonStriker.id, { hand: nonStriker.hand === 'R' ? 'L' : 'R' })}
                        style={{
                          padding: '2px 8px',
                          borderRadius: D.pill,
                          background: D.surf1,
                          border: `1px solid ${D.border}`,
                          color: D.textSecondary,
                          fontFamily: D.mono,
                          fontSize: '10px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {nonStriker.hand === 'R' ? 'Right-Handed' : 'Left-Handed'}
                      </button>
                    </div>

                    <div>
                      <div style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.textPrimary }}>
                        {nonStriker.name}
                      </div>
                      <div style={{ fontFamily: D.mono, fontSize: '12px', color: D.textMuted, marginTop: '2px' }}>
                        {nonStriker.runs} runs ({nonStriker.balls} balls) · {nonStriker.fours}x4, {nonStriker.sixes}x6 · SR: {nonStriker.balls > 0 ? ((nonStriker.runs / nonStriker.balls) * 100).toFixed(1) : '0.0'}
                      </div>
                    </div>

                    {/* Change Non-Striker Select */}
                    <div>
                      <label style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>
                        Change / Substitute Non-Striker:
                      </label>
                      <select
                        value={nonStriker.id}
                        onChange={e => onSelectNonStriker(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          background: D.surf1,
                          border: `1px solid ${D.border}`,
                          borderRadius: D.sm,
                          color: D.textPrimary,
                          fontFamily: D.head,
                          fontSize: '12px',
                          fontWeight: 700,
                        }}
                      >
                        {battingLineup.map(b => (
                          <option key={b.id} value={b.id} disabled={b.id === striker.id || b.status === 'out'}>
                            #{b.position} {b.name} ({b.role}) - {b.status.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Bowler Card */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.indigo }}>
                  CURRENT BOWLER & SPELL OPTIONS
                </span>

                <div
                  style={{
                    padding: '16px',
                    borderRadius: D.lg,
                    background: `${D.indigo}15`,
                    border: `1.5px solid ${D.indigo}44`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800 }}>
                        {currentBowler.name}
                      </span>
                      <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted, marginLeft: '8px' }}>
                        ({currentBowler.bowlingStyle})
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: D.pill,
                          background: D.indigo,
                          color: '#fff',
                          fontFamily: D.mono,
                          fontSize: '10px',
                          fontWeight: 800,
                        }}
                      >
                        {currentBowler.overs} / {maxOversPerBowler} OVERS BOWLED
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    <div style={{ background: D.surf1, padding: '8px 12px', borderRadius: D.md, textAlign: 'center' }}>
                      <div style={{ fontFamily: D.mono, fontSize: '9px', color: D.textMuted }}>OVERS</div>
                      <div style={{ fontFamily: D.mono, fontSize: '15px', fontWeight: 800, color: D.sky }}>{currentBowler.overs}</div>
                    </div>
                    <div style={{ background: D.surf1, padding: '8px 12px', borderRadius: D.md, textAlign: 'center' }}>
                      <div style={{ fontFamily: D.mono, fontSize: '9px', color: D.textMuted }}>MAIDENS</div>
                      <div style={{ fontFamily: D.mono, fontSize: '15px', fontWeight: 800, color: D.textPrimary }}>{currentBowler.maidens}</div>
                    </div>
                    <div style={{ background: D.surf1, padding: '8px 12px', borderRadius: D.md, textAlign: 'center' }}>
                      <div style={{ fontFamily: D.mono, fontSize: '9px', color: D.textMuted }}>RUNS</div>
                      <div style={{ fontFamily: D.mono, fontSize: '15px', fontWeight: 800, color: D.amber }}>{currentBowler.runs}</div>
                    </div>
                    <div style={{ background: D.surf1, padding: '8px 12px', borderRadius: D.md, textAlign: 'center' }}>
                      <div style={{ fontFamily: D.mono, fontSize: '9px', color: D.textMuted }}>WICKETS</div>
                      <div style={{ fontFamily: D.mono, fontSize: '15px', fontWeight: 800, color: D.rose }}>{currentBowler.wickets}</div>
                    </div>
                  </div>

                  {/* Switch Bowler Dropdown */}
                  <div>
                    <label style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>
                      Select Next / Incoming Bowler from Attack:
                    </label>
                    <select
                      value={currentBowler.id}
                      onChange={e => onSelectBowler(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        background: D.surf1,
                        border: `1px solid ${D.border}`,
                        borderRadius: D.sm,
                        color: D.textPrimary,
                        fontFamily: D.head,
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      {bowlingAttack.map(b => (
                        <option
                          key={b.id}
                          value={b.id}
                          disabled={b.overs >= maxOversPerBowler}
                        >
                          {b.name} ({b.bowlingStyle}) - {b.overs}/{maxOversPerBowler} ov, {b.wickets}w/{b.runs}r {b.overs >= maxOversPerBowler ? '[QUOTA FINISHED]' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Batting Order Management */}
          {activeTab === 'batting_order' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted }}>
                Reorder batting positions or adjust player roles and handedness.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {battingLineup.map((batter, idx) => (
                  <div
                    key={batter.id}
                    style={{
                      padding: '10px 14px',
                      background: batter.id === activeStrikerId || batter.id === activeNonStrikerId ? `${D.sky}15` : D.surf2,
                      border: `1px solid ${batter.id === activeStrikerId ? D.emerald : batter.id === activeNonStrikerId ? D.sky : D.border}`,
                      borderRadius: D.md,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: D.surf3,
                          color: D.textPrimary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: D.mono,
                          fontSize: '11px',
                          fontWeight: 800,
                        }}
                      >
                        {idx + 1}
                      </span>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800 }}>
                            {batter.name}
                          </span>
                          <span
                            style={{
                              padding: '1px 6px',
                              borderRadius: D.pill,
                              background: D.surf3,
                              fontSize: '9px',
                              fontFamily: D.mono,
                              color: D.textMuted,
                            }}
                          >
                            {batter.role}
                          </span>
                          <span
                            style={{
                              padding: '1px 6px',
                              borderRadius: D.pill,
                              background: batter.hand === 'R' ? `${D.sky}25` : `${D.amber}25`,
                              color: batter.hand === 'R' ? D.sky : D.amber,
                              fontSize: '9px',
                              fontFamily: D.mono,
                              fontWeight: 700,
                            }}
                          >
                            {batter.hand}HB
                          </span>
                          {batter.id === activeStrikerId && (
                            <span style={{ padding: '1px 6px', borderRadius: D.pill, background: D.emerald, color: '#000', fontSize: '9px', fontFamily: D.mono, fontWeight: 800 }}>
                              STRIKER
                            </span>
                          )}
                          {batter.id === activeNonStrikerId && (
                            <span style={{ padding: '1px 6px', borderRadius: D.pill, background: D.sky, color: '#000', fontSize: '9px', fontFamily: D.mono, fontWeight: 800 }}>
                              NON-STRIKER
                            </span>
                          )}
                        </div>

                        <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted, marginTop: '2px' }}>
                          {batter.runs} ({batter.balls}b, {batter.fours}x4, {batter.sixes}x6) · Status: {batter.status.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* Actions: Move Up / Down / Edit Hand */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => onUpdateBatter(batter.id, { hand: batter.hand === 'R' ? 'L' : 'R' })}
                        style={{
                          padding: '4px 8px',
                          borderRadius: D.sm,
                          background: D.surf1,
                          border: `1px solid ${D.border}`,
                          color: D.textSecondary,
                          fontSize: '10px',
                          fontFamily: D.mono,
                          cursor: 'pointer',
                        }}
                      >
                        Toggle {batter.hand === 'R' ? 'LHB' : 'RHB'}
                      </button>

                      <button
                        onClick={() => handleMoveBatter(idx, 'up')}
                        disabled={idx === 0}
                        style={{
                          padding: '4px 8px',
                          borderRadius: D.sm,
                          background: D.surf1,
                          border: `1px solid ${D.border}`,
                          color: idx === 0 ? D.textMuted : D.textPrimary,
                          cursor: idx === 0 ? 'default' : 'pointer',
                          fontFamily: D.mono,
                          fontSize: '11px',
                        }}
                      >
                        ▲
                      </button>

                      <button
                        onClick={() => handleMoveBatter(idx, 'down')}
                        disabled={idx === battingLineup.length - 1}
                        style={{
                          padding: '4px 8px',
                          borderRadius: D.sm,
                          background: D.surf1,
                          border: `1px solid ${D.border}`,
                          color: idx === battingLineup.length - 1 ? D.textMuted : D.textPrimary,
                          cursor: idx === battingLineup.length - 1 ? 'default' : 'pointer',
                          fontFamily: D.mono,
                          fontSize: '11px',
                        }}
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Bowling Attack & Quotas */}
          {activeTab === 'bowling_attack' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted }}>
                Monitor overs bowled against quota ({maxOversPerBowler} ov max per bowler) and switch active bowlers.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {bowlingAttack.map(bowler => {
                  const isFinished = bowler.overs >= maxOversPerBowler;
                  const isCurrent = bowler.id === activeBowlerId;

                  return (
                    <div
                      key={bowler.id}
                      style={{
                        padding: '12px 16px',
                        background: isCurrent ? `${D.indigo}20` : D.surf2,
                        border: `1px solid ${isCurrent ? D.indigo : D.border}`,
                        borderRadius: D.md,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800 }}>
                            {bowler.name}
                          </span>
                          <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                            ({bowler.bowlingStyle})
                          </span>
                          {isCurrent && (
                            <span style={{ padding: '1px 6px', borderRadius: D.pill, background: D.indigo, color: '#fff', fontSize: '9px', fontFamily: D.mono, fontWeight: 800 }}>
                              CURRENTLY BOWLING
                            </span>
                          )}
                          {isFinished && (
                            <span style={{ padding: '1px 6px', borderRadius: D.pill, background: D.surf3, color: D.textMuted, fontSize: '9px', fontFamily: D.mono }}>
                              QUOTA COMPLETE
                            </span>
                          )}
                        </div>

                        <div style={{ fontFamily: D.mono, fontSize: '12px', color: D.textSecondary, marginTop: '3px' }}>
                          {bowler.overs} ov · {bowler.maidens} m · {bowler.runs} r · {bowler.wickets} w · Econ: {bowler.overs > 0 ? (bowler.runs / bowler.overs).toFixed(2) : '0.00'} · {bowler.dots} dots
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {!isCurrent && (
                          <button
                            onClick={() => onSelectBowler(bowler.id)}
                            disabled={isFinished}
                            style={{
                              padding: '6px 14px',
                              borderRadius: D.pill,
                              background: isFinished ? D.surf3 : D.indigo,
                              border: 'none',
                              color: isFinished ? D.textMuted : '#fff',
                              fontFamily: D.head,
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: isFinished ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {isFinished ? 'Quota Finished' : 'Select as Bowler'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 20px',
            background: D.surf0,
            borderTop: `1px solid ${D.border}`,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              borderRadius: D.pill,
              background: D.sky,
              border: 'none',
              color: '#000',
              fontFamily: D.head,
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Done & Return to Match
          </button>
        </div>
      </div>
    </div>
  );
}
