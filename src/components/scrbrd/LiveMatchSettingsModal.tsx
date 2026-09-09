'use client';

import React from 'react';
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

export interface MatchSettingsState {
  format: 'T20' | 'ODI' | 'Test' | '100-Ball' | 'T10';
  maxOvers: number;
  maxOversPerBowler: number;
  ballType: 'White Kookaburra 156g' | 'Red Dukes 156g' | 'Pink SG 156g';
  pitchCondition: 'Hard & Bouncy' | 'Dry & Turning' | 'Green Seaming' | 'Slow & Low';
  powerplay1Overs: number;
  powerplay2Overs: number;
  matchStatus: 'In Progress' | 'Drinks Break' | 'Innings Break' | 'Rain Delay' | 'Stumps / Day End' | 'Match Concluded';
  tossWinner: 'home' | 'away';
  tossDecision: 'bat' | 'bowl';
  dlsRevisedOvers: number;
  dlsTarget: number;
  autoRotateStrike: boolean;
  autoPromptBowlerAtOverEnd: boolean;
  // Feature Visibility Toggles
  showProHawkeyeRadar: boolean;
  showPitchHeatmap: boolean;
  showCommentaryFeed: boolean;
  showWagonHud: boolean;
}

interface LiveMatchSettingsModalProps {
  theme?: Theme;
  isOpen?: boolean;
  settings: MatchSettingsState;
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeam?: string;
  awayTeam?: string;
  currentOvers?: string;
  currentRuns?: number;
  currentWickets?: number;
  onUpdateSettings: (newSettings: Partial<MatchSettingsState>) => void;
  onClose: () => void;
}

export default function LiveMatchSettingsModal({
  theme: customTheme,
  isOpen = true,
  settings,
  homeTeamName,
  awayTeamName,
  homeTeam,
  awayTeam,
  currentOvers,
  currentRuns,
  currentWickets,
  onUpdateSettings,
  onClose,
}: LiveMatchSettingsModalProps) {
  const D = customTheme || DEFAULT_MODAL_THEME;
  const activeHome = homeTeamName || homeTeam || "Home XI";
  const activeAway = awayTeamName || awayTeam || "Away XI";
  const [activeTab, setActiveTab] = React.useState<'match' | 'toggles' | 'pitch_dls' | 'rules'>('match');

  if (isOpen === false) return null;

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
          maxWidth: '820px',
          maxHeight: '90vh',
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
                background: `${D.amber}20`,
                border: `1px solid ${D.amber}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              ⚙️
            </div>
            <div>
              <h2 style={{ fontFamily: D.head, fontSize: '17px', fontWeight: 800, margin: 0 }}>
                Live Match Settings & Telemetry Control
              </h2>
              <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                Configure match regulations, quota limits, and toggle telemetry/radar modules
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
            { id: 'match', label: '🏟️ Match Regulations & Status' },
            { id: 'toggles', label: '🎛️ Telemetry & Radar Toggles' },
            { id: 'pitch_dls', label: '🌧️ Pitch, Ball & DLS Target' },
            { id: 'rules', label: '⚡ Scorer Automation' },
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* TAB 1: Match Regulations & Status */}
          {activeTab === 'match' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Match Format Selection */}
              <div>
                <label style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.textPrimary, display: 'block', marginBottom: '8px' }}>
                  MATCH FORMAT & REGULATIONS
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                  {[
                    { format: 'T20', overs: 20, bowlerQuota: 4, pp: 6 },
                    { format: 'ODI', overs: 50, bowlerQuota: 10, pp: 10 },
                    { format: 'T10', overs: 10, bowlerQuota: 2, pp: 3 },
                    { format: '100-Ball', overs: 20, bowlerQuota: 4, pp: 5 },
                    { format: 'Test', overs: 90, bowlerQuota: 25, pp: 0 },
                  ].map(f => (
                    <button
                      key={f.format}
                      onClick={() =>
                        onUpdateSettings({
                          format: f.format as any,
                          maxOvers: f.overs,
                          maxOversPerBowler: f.bowlerQuota,
                          powerplay1Overs: f.pp,
                        })
                      }
                      style={{
                        padding: '10px 8px',
                        borderRadius: D.md,
                        background: settings.format === f.format ? `${D.sky}20` : D.surf2,
                        border: `1.5px solid ${settings.format === f.format ? D.sky : D.border}`,
                        color: settings.format === f.format ? D.sky : D.textPrimary,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                    >
                      <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800 }}>{f.format}</span>
                      <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>{f.overs} Overs</span>
                      <span style={{ fontFamily: D.mono, fontSize: '9px', color: D.textMuted }}>Max {f.bowlerQuota} ov/bowler</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Overs and Bowler Quotas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div style={{ background: D.surf2, padding: '12px', borderRadius: D.md, border: `1px solid ${D.border}` }}>
                  <label style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textMuted, display: 'block', marginBottom: '6px' }}>
                    Overs Per Innings
                  </label>
                  <input
                    type="number"
                    value={settings.maxOvers}
                    onChange={e => onUpdateSettings({ maxOvers: Number(e.target.value) || 20 })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: D.surf1,
                      border: `1px solid ${D.border}`,
                      borderRadius: D.sm,
                      color: D.textPrimary,
                      fontFamily: D.mono,
                      fontSize: '14px',
                      fontWeight: 700,
                    }}
                  />
                </div>

                <div style={{ background: D.surf2, padding: '12px', borderRadius: D.md, border: `1px solid ${D.border}` }}>
                  <label style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textMuted, display: 'block', marginBottom: '6px' }}>
                    Max Overs Per Bowler
                  </label>
                  <input
                    type="number"
                    value={settings.maxOversPerBowler}
                    onChange={e => onUpdateSettings({ maxOversPerBowler: Number(e.target.value) || 4 })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: D.surf1,
                      border: `1px solid ${D.border}`,
                      borderRadius: D.sm,
                      color: D.textPrimary,
                      fontFamily: D.mono,
                      fontSize: '14px',
                      fontWeight: 700,
                    }}
                  />
                </div>

                <div style={{ background: D.surf2, padding: '12px', borderRadius: D.md, border: `1px solid ${D.border}` }}>
                  <label style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textMuted, display: 'block', marginBottom: '6px' }}>
                    Mandatory Powerplay (Overs)
                  </label>
                  <input
                    type="number"
                    value={settings.powerplay1Overs}
                    onChange={e => onUpdateSettings({ powerplay1Overs: Number(e.target.value) || 6 })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: D.surf1,
                      border: `1px solid ${D.border}`,
                      borderRadius: D.sm,
                      color: D.textPrimary,
                      fontFamily: D.mono,
                      fontSize: '14px',
                      fontWeight: 700,
                    }}
                  />
                </div>
              </div>

              {/* Match State & Toss */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: D.surf2, padding: '14px', borderRadius: D.md, border: `1px solid ${D.border}` }}>
                  <label style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textMuted, display: 'block', marginBottom: '6px' }}>
                    Match Live Status
                  </label>
                  <select
                    value={settings.matchStatus}
                    onChange={e => onUpdateSettings({ matchStatus: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: D.surf1,
                      border: `1px solid ${D.border}`,
                      borderRadius: D.sm,
                      color: D.textPrimary,
                      fontFamily: D.head,
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    <option value="In Progress">🟢 In Progress</option>
                    <option value="Drinks Break">☕ Drinks Break</option>
                    <option value="Innings Break">🥪 Innings Break</option>
                    <option value="Rain Delay">🌧️ Rain Delay</option>
                    <option value="Stumps / Day End">🌅 Stumps / Day End</option>
                    <option value="Match Concluded">🏁 Match Concluded</option>
                  </select>
                </div>

                <div style={{ background: D.surf2, padding: '14px', borderRadius: D.md, border: `1px solid ${D.border}` }}>
                  <label style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textMuted, display: 'block', marginBottom: '6px' }}>
                    Toss Decision & Winner
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={settings.tossWinner}
                      onChange={e => onUpdateSettings({ tossWinner: e.target.value as any })}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        background: D.surf1,
                        border: `1px solid ${D.border}`,
                        borderRadius: D.sm,
                        color: D.textPrimary,
                        fontFamily: D.head,
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      <option value="home">{homeTeamName}</option>
                      <option value="away">{awayTeamName}</option>
                    </select>

                    <select
                      value={settings.tossDecision}
                      onChange={e => onUpdateSettings({ tossDecision: e.target.value as any })}
                      style={{
                        width: '110px',
                        padding: '8px 10px',
                        background: D.surf1,
                        border: `1px solid ${D.border}`,
                        borderRadius: D.sm,
                        color: D.textPrimary,
                        fontFamily: D.head,
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      <option value="bat">Elected to Bat</option>
                      <option value="bowl">Elected to Bowl</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Telemetry & Radar Toggles (Direct User Request) */}
          {activeTab === 'toggles' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  padding: '12px 14px',
                  background: `${D.indigo}15`,
                  borderRadius: D.md,
                  border: `1px solid ${D.indigo}33`,
                }}
              >
                <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.indigo }}>
                  🎛️ TELEMETRY & VISIBILITY CONTROLS
                </div>
                <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary, marginTop: '2px' }}>
                  Enable or disable advanced visualizer modules to streamline scoring or match broadcast preferences.
                </div>
              </div>

              {/* Toggle 1: Hawkeye & Pro Radar */}
              <div
                style={{
                  padding: '14px',
                  background: D.surf2,
                  borderRadius: D.md,
                  border: `1px solid ${D.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
                    🔬 FULL PRO ANALYTICS & HAWKEYE RADAR
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted, marginTop: '2px' }}>
                    Display delivery length/line selector, bowler pace classification, and contact quality radar on the scoring keypad.
                  </div>
                </div>
                <button
                  onClick={() => onUpdateSettings({ showProHawkeyeRadar: !settings.showProHawkeyeRadar })}
                  style={{
                    padding: '6px 16px',
                    borderRadius: D.pill,
                    border: 'none',
                    background: settings.showProHawkeyeRadar ? D.emerald : D.surf3,
                    color: settings.showProHawkeyeRadar ? '#000' : D.textMuted,
                    fontFamily: D.head,
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    minWidth: '80px',
                  }}
                >
                  {settings.showProHawkeyeRadar ? '✓ ENABLED' : '✕ HIDDEN'}
                </button>
              </div>

              {/* Toggle 2: 2D Pitch Heatmap */}
              <div
                style={{
                  padding: '14px',
                  background: D.surf2,
                  borderRadius: D.md,
                  border: `1px solid ${D.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
                    🌿 2D PITCH LENGTH & LINE HEATMAP
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted, marginTop: '2px' }}>
                    Show the 2D Pitch Line & Length SVG Heatmap tab in the right telemetry panel.
                  </div>
                </div>
                <button
                  onClick={() => onUpdateSettings({ showPitchHeatmap: !settings.showPitchHeatmap })}
                  style={{
                    padding: '6px 16px',
                    borderRadius: D.pill,
                    border: 'none',
                    background: settings.showPitchHeatmap ? D.emerald : D.surf3,
                    color: settings.showPitchHeatmap ? '#000' : D.textMuted,
                    fontFamily: D.head,
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    minWidth: '80px',
                  }}
                >
                  {settings.showPitchHeatmap ? '✓ ENABLED' : '✕ HIDDEN'}
                </button>
              </div>

              {/* Toggle 3: 360° Wagon Wheel HUD */}
              <div
                style={{
                  padding: '14px',
                  background: D.surf2,
                  borderRadius: D.md,
                  border: `1px solid ${D.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
                    🎯 360° WAGON WHEEL HUD & OVERLAYS
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted, marginTop: '2px' }}>
                    Show the interactive spatial wagon wheel and fielding zone landing coordinates.
                  </div>
                </div>
                <button
                  onClick={() => onUpdateSettings({ showWagonHud: !settings.showWagonHud })}
                  style={{
                    padding: '6px 16px',
                    borderRadius: D.pill,
                    border: 'none',
                    background: settings.showWagonHud ? D.emerald : D.surf3,
                    color: settings.showWagonHud ? '#000' : D.textMuted,
                    fontFamily: D.head,
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    minWidth: '80px',
                  }}
                >
                  {settings.showWagonHud ? '✓ ENABLED' : '✕ HIDDEN'}
                </button>
              </div>

              {/* Toggle 4: AI Commentary Stream */}
              <div
                style={{
                  padding: '14px',
                  background: D.surf2,
                  borderRadius: D.md,
                  border: `1px solid ${D.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
                    🎙️ AI BROADCAST COMMENTARY FEED
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted, marginTop: '2px' }}>
                    Generate real-time ball-by-ball commentary text in the broadcast stream.
                  </div>
                </div>
                <button
                  onClick={() => onUpdateSettings({ showCommentaryFeed: !settings.showCommentaryFeed })}
                  style={{
                    padding: '6px 16px',
                    borderRadius: D.pill,
                    border: 'none',
                    background: settings.showCommentaryFeed ? D.emerald : D.surf3,
                    color: settings.showCommentaryFeed ? '#000' : D.textMuted,
                    fontFamily: D.head,
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    minWidth: '80px',
                  }}
                >
                  {settings.showCommentaryFeed ? '✓ ENABLED' : '✕ HIDDEN'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Pitch, Ball & DLS Target */}
          {activeTab === 'pitch_dls' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: D.surf2, padding: '14px', borderRadius: D.md, border: `1px solid ${D.border}` }}>
                  <label style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textMuted, display: 'block', marginBottom: '6px' }}>
                    Match Ball Specification
                  </label>
                  <select
                    value={settings.ballType}
                    onChange={e => onUpdateSettings({ ballType: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: D.surf1,
                      border: `1px solid ${D.border}`,
                      borderRadius: D.sm,
                      color: D.textPrimary,
                      fontFamily: D.head,
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    <option value="White Kookaburra 156g">⚪ White Kookaburra 156g (Limited Overs)</option>
                    <option value="Red Dukes 156g">🔴 Red Dukes 156g (Multi-Day / Declaration)</option>
                    <option value="Pink SG 156g">🌸 Pink SG 156g (Day/Night)</option>
                  </select>
                </div>

                <div style={{ background: D.surf2, padding: '14px', borderRadius: D.md, border: `1px solid ${D.border}` }}>
                  <label style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textMuted, display: 'block', marginBottom: '6px' }}>
                    Pitch / Deck Surface Condition
                  </label>
                  <select
                    value={settings.pitchCondition}
                    onChange={e => onUpdateSettings({ pitchCondition: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: D.surf1,
                      border: `1px solid ${D.border}`,
                      borderRadius: D.sm,
                      color: D.textPrimary,
                      fontFamily: D.head,
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    <option value="Hard & Bouncy">⚡ Hard & Bouncy (Pace & Carry)</option>
                    <option value="Dry & Turning">🌪️ Dry & Turning (Spin Friendly)</option>
                    <option value="Green Seaming">🌱 Green Seaming (Early Movement)</option>
                    <option value="Slow & Low">🐌 Slow & Low (Variable Bounce)</option>
                  </select>
                </div>
              </div>

              {/* DLS Section */}
              <div
                style={{
                  padding: '14px',
                  background: `${D.sky}10`,
                  borderRadius: D.md,
                  border: `1px solid ${D.sky}33`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.sky }}>
                  🌧️ DUCKWORTH-LEWIS-STERN (DLS) RAIN REVISION
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>
                      Revised Overs Available
                    </label>
                    <input
                      type="number"
                      value={settings.dlsRevisedOvers}
                      onChange={e => onUpdateSettings({ dlsRevisedOvers: Number(e.target.value) || 20 })}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: D.surf1,
                        border: `1px solid ${D.border}`,
                        borderRadius: D.sm,
                        color: D.textPrimary,
                        fontFamily: D.mono,
                        fontSize: '14px',
                        fontWeight: 700,
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>
                      Calculated DLS Target Runs
                    </label>
                    <input
                      type="number"
                      value={settings.dlsTarget}
                      onChange={e => onUpdateSettings({ dlsTarget: Number(e.target.value) || 180 })}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: D.surf1,
                        border: `1px solid ${D.border}`,
                        borderRadius: D.sm,
                        color: D.textPrimary,
                        fontFamily: D.mono,
                        fontSize: '14px',
                        fontWeight: 700,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Scorer Automation */}
          {activeTab === 'rules' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  padding: '14px',
                  background: D.surf2,
                  borderRadius: D.md,
                  border: `1px solid ${D.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800 }}>
                    Auto-Rotate Strike
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                    Automatically swap striker and non-striker on odd runs (1, 3, 5) and at the end of each over.
                  </div>
                </div>
                <button
                  onClick={() => onUpdateSettings({ autoRotateStrike: !settings.autoRotateStrike })}
                  style={{
                    padding: '6px 16px',
                    borderRadius: D.pill,
                    border: 'none',
                    background: settings.autoRotateStrike ? D.emerald : D.surf3,
                    color: settings.autoRotateStrike ? '#000' : D.textMuted,
                    fontFamily: D.head,
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {settings.autoRotateStrike ? 'ON' : 'OFF'}
                </button>
              </div>

              <div
                style={{
                  padding: '14px',
                  background: D.surf2,
                  borderRadius: D.md,
                  border: `1px solid ${D.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800 }}>
                    Prompt Bowler Selection At Over End
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                    Open the bowler selector drawer automatically when an over completes (6 legal balls).
                  </div>
                </div>
                <button
                  onClick={() => onUpdateSettings({ autoPromptBowlerAtOverEnd: !settings.autoPromptBowlerAtOverEnd })}
                  style={{
                    padding: '6px 16px',
                    borderRadius: D.pill,
                    border: 'none',
                    background: settings.autoPromptBowlerAtOverEnd ? D.emerald : D.surf3,
                    color: settings.autoPromptBowlerAtOverEnd ? '#000' : D.textMuted,
                    fontFamily: D.head,
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {settings.autoPromptBowlerAtOverEnd ? 'ON' : 'OFF'}
                </button>
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
            gap: '10px',
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
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
