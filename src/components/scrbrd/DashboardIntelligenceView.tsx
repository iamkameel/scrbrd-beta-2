'use client';

import React, { useState } from 'react';
import { Theme, SchoolRegistryItem, Match, Player } from './types';
import {
  Sparkles,
  Radio,
  Calendar,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Users,
  Trophy,
  ArrowRight,
  Activity,
  Layers,
  Thermometer,
  Clock,
  Compass,
  Zap,
  Play,
  FileCheck,
} from 'lucide-react';
import GoogleWeatherWidget from './GoogleWeatherWidget';

interface DashboardIntelligenceViewProps {
  theme: Theme;
  activeSchool: SchoolRegistryItem;
  currentRole: string;
  matches: Match[];
  players: Player[];
  isCompactDensity?: boolean;
  onNavigate: (page: string) => void;
  onLaunchScorer: (match?: Match) => void;
  onSelectPlayer?: (player: Player) => void;
  onOpenIntelligenceDrawer?: () => void;
}

export default function DashboardIntelligenceView({
  theme: D,
  activeSchool,
  currentRole,
  matches,
  players,
  isCompactDensity = false,
  onNavigate,
  onLaunchScorer,
  onSelectPlayer,
  onOpenIntelligenceDrawer,
}: DashboardIntelligenceViewProps) {
  const [activePerspective, setActivePerspective] = useState<'coach' | 'executive' | 'scorer' | 'athlete'>('coach');
  const [actionCategoryFilter, setActionCategoryFilter] = useState<'all' | 'urgent' | 'selection' | 'medical' | 'logistics'>('all');
  const [selectedFieldId, setSelectedFieldId] = useState<string>('bowdens');

  const schoolPrimary = activeSchool?.color || D.indigo;

  // Find active live match or next scheduled match
  const liveMatch = matches.find((m) => m.status === 'live') || matches[0];

  // Action Centre items (role-aware)
  const actionItems = [
    {
      id: 'act_1',
      title: 'Confirm Match Availability for Saturday',
      role: 'athlete',
      category: 'urgent',
      due: 'Today 17:00',
      description: 'Westville 1st XI vs DHS 1st XI at Bowden’s Field. 2 players pending.',
      actionText: 'Update Availability',
      onAction: () => onNavigate('squad'),
    },
    {
      id: 'act_2',
      title: 'Sign Tour Consent & Medical Waiver',
      role: 'athlete',
      category: 'logistics',
      due: 'Tomorrow 12:00',
      description: 'KZN Schools T20 Championship travel clearance. 3 signatures required.',
      actionText: 'Review Consent Form',
      onAction: () => onNavigate('governance'),
    },
    {
      id: 'act_3',
      title: 'Bowler Overload Threshold Notice',
      role: 'coach',
      category: 'medical',
      due: 'Immediate',
      description: 'K. Pillay has exceeded 30 overs in 7-day rolling window. Recommend rest or 4-over cap.',
      actionText: 'Inspect Bowler Monitor',
      onAction: () => onNavigate('injuries'),
    },
    {
      id: 'act_4',
      title: 'Submit Final Playing XI Lineup',
      role: 'coach',
      category: 'selection',
      due: 'Friday 18:00',
      description: '14 squad members available. 1 restricted for bowling workload.',
      actionText: 'Open Selection Hub',
      onAction: () => onNavigate('squad'),
    },
    {
      id: 'act_5',
      title: 'Verify Ground Scoreboard Synchronization',
      role: 'scorer',
      category: 'urgent',
      due: 'Pre-Match 08:30',
      description: 'Check electronic telemetry link between digital scorer console and Main Oval board.',
      actionText: 'Start Scoring Checklist',
      onAction: () => onLaunchScorer(liveMatch),
    },
  ];

  const filteredActions = actionItems.filter((act) => {
    if (actionCategoryFilter === 'all') return true;
    return act.category === actionCategoryFilter;
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: isCompactDensity ? '16px' : '24px',
        maxWidth: '1600px',
        margin: '0 auto',
      }}
    >
      {/* Institutional Crest & Perspective Switcher Bar (Material 3 Surface Container) */}
      <div
        style={{
          background: D.isDark
            ? `linear-gradient(135deg, ${schoolPrimary}18 0%, rgba(15, 23, 42, 0.95) 100%)`
            : `linear-gradient(135deg, ${schoolPrimary}12 0%, #ffffff 100%)`,
          borderRadius: '24px',
          border: `1px solid ${D.border}`,
          padding: isCompactDensity ? '16px 20px' : '22px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                fontSize: '32px',
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: `${schoolPrimary}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${schoolPrimary}30`,
              }}
            >
              {activeSchool.crestIcon}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontFamily: D.mono,
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: `${schoolPrimary}25`,
                    color: schoolPrimary,
                  }}
                >
                  {activeSchool.region} · Est. {activeSchool.founded}
                </span>
                <span
                  style={{
                    fontFamily: D.mono,
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: `${D.emerald}20`,
                    color: D.emerald,
                  }}
                >
                  🔥 4-Match Winning Run
                </span>
              </div>

              <h1
                style={{
                  fontFamily: D.head,
                  fontSize: isCompactDensity ? '20px' : '24px',
                  fontWeight: 800,
                  color: D.textPrimary,
                  margin: '4px 0 2px 0',
                  letterSpacing: '-0.02em',
                }}
              >
                {activeSchool.name} Cricket Operations
              </h1>
              <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textSecondary }}>
                Home Ground: <strong style={{ color: D.textPrimary }}>{activeSchool.mainOval}</strong> · Head of Cricket: {activeSchool.headOfCricket}
              </div>
            </div>
          </div>

          {/* Material 3 Segmented Perspective Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: D.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
              padding: '4px',
              borderRadius: '16px',
              border: `1px solid ${D.border}`,
            }}
          >
            {[
              { id: 'coach', label: 'Coach & HP', icon: '🏏' },
              { id: 'executive', label: 'Executive', icon: '🏛️' },
              { id: 'scorer', label: 'Scorer Hub', icon: '⚡' },
              { id: 'athlete', label: 'Athlete Portal', icon: '👤' },
            ].map((p) => {
              const isActive = activePerspective === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePerspective(p.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: isCompactDensity ? '6px 10px' : '8px 14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: isActive ? (D.isDark ? '#1e293b' : '#ffffff') : 'transparent',
                    color: isActive ? D.textPrimary : D.textMuted,
                    fontFamily: D.body,
                    fontSize: '12px',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hero "Next Up" Live Telemetry Card (Material 3 Elevated Card) */}
      <div
        style={{
          background: D.isDark ? '#0f172a' : '#ffffff',
          borderRadius: '24px',
          border: `1px solid ${D.border}`,
          padding: isCompactDensity ? '18px 22px' : '24px 28px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glowing live accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: liveMatch.status === 'live'
              ? `linear-gradient(90deg, ${D.emerald}, ${D.sky})`
              : `linear-gradient(90deg, ${D.indigo}, ${D.amber})`,
          }}
        />

        {/* Top bar of card */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontFamily: D.mono,
                fontSize: '11px',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '999px',
                background: liveMatch.status === 'live' ? `${D.emerald}20` : `${D.indigo}20`,
                color: liveMatch.status === 'live' ? D.emerald : D.indigo,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: liveMatch.status === 'live' ? D.emerald : D.indigo,
                }}
              />
              {liveMatch.status === 'live' ? 'LIVE BROADCAST IN PROGRESS' : 'NEXT SCHEDULED FIXTURE'}
            </span>

            <span style={{ fontFamily: D.mono, fontSize: '12px', color: D.textMuted }}>
              KZN Schools 1st XI League · 50-Over Declaration
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => onNavigate('matches')}
              style={{
                padding: '6px 12px',
                borderRadius: '10px',
                border: `1px solid ${D.border}`,
                background: 'transparent',
                color: D.textSecondary,
                fontFamily: D.body,
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Match Centre →
            </button>

            <button
              onClick={() => onLaunchScorer(liveMatch)}
              style={{
                padding: '7px 16px',
                borderRadius: '12px',
                border: 'none',
                background: `linear-gradient(135deg, ${D.emerald}, #059669)`,
                color: '#ffffff',
                fontFamily: D.head,
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: `0 4px 14px ${D.emerald}30`,
              }}
            >
              <Play size={14} fill="#ffffff" />
              <span>Launch Scorer Hub</span>
            </button>
          </div>
        </div>

        {/* Duel Scoreboard & Status */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            alignItems: 'center',
          }}
        >
          {/* Home team */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '18px',
              background: D.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              border: `1px solid ${D.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 800, color: D.textPrimary }}>
                {liveMatch.homeTeam}
              </div>
              <div style={{ fontFamily: D.mono, fontSize: '12px', color: D.emerald, fontWeight: 700 }}>
                1st Innings: 248/6 (50.0 ov)
              </div>
            </div>
            <div style={{ fontSize: '28px' }}>🏛️</div>
          </div>

          {/* Equation & Status Center */}
          <div style={{ textAlign: 'center', padding: '0 10px' }}>
            <div style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800, color: D.textPrimary }}>
              vs
            </div>
            <div
              style={{
                fontFamily: D.mono,
                fontSize: '13px',
                fontWeight: 700,
                color: D.indigo,
                margin: '4px 0',
              }}
            >
              {liveMatch.awayTeam} need 52 runs from 48 balls (RRR 6.50)
            </div>
            <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
              Venue: {liveMatch.venue} · Toss: Westville won & opted to bat
            </div>
          </div>

          {/* Away team */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '18px',
              background: D.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              border: `1px solid ${D.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 800, color: D.textPrimary }}>
                {liveMatch.awayTeam}
              </div>
              <div style={{ fontFamily: D.mono, fontSize: '12px', color: D.sky, fontWeight: 700 }}>
                Current: 197/4 (42.0 ov)
              </div>
            </div>
            <div style={{ fontSize: '28px' }}>🦅</div>
          </div>
        </div>

        {/* Win Equity & Active Battlers Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            paddingTop: '6px',
            borderTop: `1px solid ${D.border}`,
          }}
        >
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '14px',
              background: D.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
              border: `1px solid ${D.border}`,
            }}
          >
            <div style={{ fontFamily: D.mono, fontSize: '10px', textTransform: 'uppercase', color: D.textMuted, marginBottom: '2px' }}>
              Striker at Crease
            </div>
            <div style={{ fontFamily: D.body, fontSize: '13px', fontWeight: 700, color: D.textPrimary }}>
              A. Sithole · <strong style={{ color: D.emerald }}>68* (54b, 7x4, 2x6)</strong>
            </div>
          </div>

          <div
            style={{
              padding: '12px 14px',
              borderRadius: '14px',
              background: D.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
              border: `1px solid ${D.border}`,
            }}
          >
            <div style={{ fontFamily: D.mono, fontSize: '10px', textTransform: 'uppercase', color: D.textMuted, marginBottom: '2px' }}>
              Non-Striker
            </div>
            <div style={{ fontFamily: D.body, fontSize: '13px', fontWeight: 700, color: D.textPrimary }}>
              D. Evans · <strong style={{ color: D.sky }}>24* (28b, 2x4)</strong>
            </div>
          </div>

          <div
            style={{
              padding: '12px 14px',
              borderRadius: '14px',
              background: D.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
              border: `1px solid ${D.border}`,
            }}
          >
            <div style={{ fontFamily: D.mono, fontSize: '10px', textTransform: 'uppercase', color: D.textMuted, marginBottom: '2px' }}>
              Current Bowler
            </div>
            <div style={{ fontFamily: D.body, fontSize: '13px', fontWeight: 700, color: D.textPrimary }}>
              K. Pillay · <strong style={{ color: D.amber }}>8.0-1-38-2 (Econ 4.75)</strong>
            </div>
          </div>

          <div
            style={{
              padding: '12px 14px',
              borderRadius: '14px',
              background: D.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
              border: `1px solid ${D.border}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: D.mono, color: D.textMuted, marginBottom: '4px' }}>
              <span>Win Equity</span>
              <span>WES 58% · DHS 42%</span>
            </div>
            <div style={{ height: '6px', borderRadius: '3px', background: D.border, overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: '58%', background: D.emerald }} />
              <div style={{ width: '42%', background: D.sky }} />
            </div>
          </div>
        </div>
      </div>

      {/* Action Centre Section (Material 3 Filter Chips + Urgent Action Cards) */}
      <div
        style={{
          background: D.isDark ? '#0f172a' : '#ffffff',
          borderRadius: '24px',
          border: `1px solid ${D.border}`,
          padding: isCompactDensity ? '18px 20px' : '22px 26px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontFamily: D.head, fontSize: '17px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
              Action Centre & Critical Tasks
            </h2>
            <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted }}>
              Decisions and approvals requiring attention for your active context
            </div>
          </div>

          {/* Material 3 Filter Chips */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(['all', 'urgent', 'selection', 'medical', 'logistics'] as const).map((cat) => {
              const isSelected = actionCategoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActionCategoryFilter(cat)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '999px',
                    border: isSelected ? `1px solid ${D.indigo}` : `1px solid ${D.border}`,
                    background: isSelected ? `${D.indigo}20` : 'transparent',
                    color: isSelected ? D.indigo : D.textSecondary,
                    fontFamily: D.body,
                    fontSize: '12px',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action cards grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '12px',
          }}
        >
          {filteredActions.map((act) => {
            const isUrgent = act.category === 'urgent';
            const isMed = act.category === 'medical';
            const badgeColor = isUrgent ? D.rose : isMed ? D.amber : D.indigo;

            return (
              <div
                key={act.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: '16px',
                  background: D.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                  border: `1px solid ${D.border}`,
                  borderLeft: `4px solid ${badgeColor}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span
                      style={{
                        fontFamily: D.mono,
                        fontSize: '9px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: `${badgeColor}15`,
                        color: badgeColor,
                      }}
                    >
                      {act.category} · Due {act.due}
                    </span>
                  </div>
                  <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: D.textPrimary, marginBottom: '4px' }}>
                    {act.title}
                  </div>
                  <p style={{ fontFamily: D.body, fontSize: '12px', color: D.textSecondary, margin: 0, lineHeight: 1.4 }}>
                    {act.description}
                  </p>
                </div>

                <button
                  onClick={act.onAction}
                  style={{
                    alignSelf: 'flex-start',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${badgeColor}40`,
                    background: `${badgeColor}10`,
                    color: badgeColor,
                    fontFamily: D.body,
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{act.actionText}</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5-KPI Bento Grid (Institutional & Performance Benchmarks) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
        }}
      >
        <div
          style={{
            padding: '18px',
            borderRadius: '20px',
            background: D.isDark ? '#0f172a' : '#ffffff',
            border: `1px solid ${D.border}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: D.textMuted, marginBottom: '6px' }}>
            <span style={{ fontFamily: D.mono, fontSize: '11px', textTransform: 'uppercase' }}>Win Rate (Season)</span>
            <Trophy size={16} color={D.amber} />
          </div>
          <div style={{ fontFamily: D.mono, fontSize: '28px', fontWeight: 800, color: D.textPrimary }}>
            61.6%
          </div>
          <div style={{ fontFamily: D.body, fontSize: '12px', color: D.emerald, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={12} /> +8.4% vs 2025 season
          </div>
        </div>

        <div
          style={{
            padding: '18px',
            borderRadius: '20px',
            background: D.isDark ? '#0f172a' : '#ffffff',
            border: `1px solid ${D.border}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: D.textMuted, marginBottom: '6px' }}>
            <span style={{ fontFamily: D.mono, fontSize: '11px', textTransform: 'uppercase' }}>Total Runs Scored</span>
            <Activity size={16} color={D.sky} />
          </div>
          <div style={{ fontFamily: D.mono, fontSize: '28px', fontWeight: 800, color: D.textPrimary }}>
            1,842
          </div>
          <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted, marginTop: '4px' }}>
            Avg Run Rate: 5.12 rpo across 8 matches
          </div>
        </div>

        <div
          style={{
            padding: '18px',
            borderRadius: '20px',
            background: D.isDark ? '#0f172a' : '#ffffff',
            border: `1px solid ${D.border}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: D.textMuted, marginBottom: '6px' }}>
            <span style={{ fontFamily: D.mono, fontSize: '11px', textTransform: 'uppercase' }}>Available XI Squad</span>
            <Users size={16} color={D.emerald} />
          </div>
          <div style={{ fontFamily: D.mono, fontSize: '28px', fontWeight: 800, color: D.textPrimary }}>
            14 / 16
          </div>
          <div style={{ fontFamily: D.body, fontSize: '12px', color: D.amber, marginTop: '4px' }}>
            2 modified load, 0 sidelined
          </div>
        </div>

        <div
          style={{
            padding: '18px',
            borderRadius: '20px',
            background: D.isDark ? '#0f172a' : '#ffffff',
            border: `1px solid ${D.border}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: D.textMuted, marginBottom: '6px' }}>
            <span style={{ fontFamily: D.mono, fontSize: '11px', textTransform: 'uppercase' }}>Curator Pitch Index</span>
            <Thermometer size={16} color={D.indigo} />
          </div>
          <div style={{ fontFamily: D.mono, fontSize: '28px', fontWeight: 800, color: D.textPrimary }}>
            8.8 / 10
          </div>
          <div style={{ fontFamily: D.body, fontSize: '12px', color: D.emerald, marginTop: '4px' }}>
            Turf dry, true bounce, 14% moisture
          </div>
        </div>
      </div>

      {/* Turf Curator & Home Ground Telemetry */}
      <div
        style={{
          background: D.isDark ? '#0f172a' : '#ffffff',
          borderRadius: '24px',
          border: `1px solid ${D.border}`,
          padding: isCompactDensity ? '18px 20px' : '22px 26px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
              Pitch & Environmental Telemetry
            </h3>
            <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted }}>
              Groundskeeper turf sensors & live localized weather
            </div>
          </div>

          <button
            onClick={() => onNavigate('fields')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: `1px solid ${D.border}`,
              background: 'transparent',
              color: D.indigo,
              fontFamily: D.body,
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Manage All Ovals →
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '14px',
          }}
        >
          {/* Turf Sensor Readings */}
          <div
            style={{
              padding: '16px',
              borderRadius: '16px',
              background: D.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
              border: `1px solid ${D.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: D.textPrimary }}>
              Bowden&apos;s Field Surface Diagnostics
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ padding: '10px', borderRadius: '10px', background: D.isDark ? '#1e293b' : '#f1f5f9' }}>
                <div style={{ fontSize: '10px', fontFamily: D.mono, color: D.textMuted }}>SOIL MOISTURE</div>
                <div style={{ fontSize: '18px', fontFamily: D.mono, fontWeight: 800, color: D.sky }}>14.2%</div>
                <div style={{ fontSize: '10px', color: D.emerald }}>Optimal Hardness</div>
              </div>

              <div style={{ padding: '10px', borderRadius: '10px', background: D.isDark ? '#1e293b' : '#f1f5f9' }}>
                <div style={{ fontSize: '10px', fontFamily: D.mono, color: D.textMuted }}>COMPACTION</div>
                <div style={{ fontSize: '18px', fontFamily: D.mono, fontWeight: 800, color: D.emerald }}>320 PSI</div>
                <div style={{ fontSize: '10px', color: D.textMuted }}>Heavy Roller Applied</div>
              </div>

              <div style={{ padding: '10px', borderRadius: '10px', background: D.isDark ? '#1e293b' : '#f1f5f9' }}>
                <div style={{ fontSize: '10px', fontFamily: D.mono, color: D.textMuted }}>GRASS COVER</div>
                <div style={{ fontSize: '18px', fontFamily: D.mono, fontWeight: 800, color: D.amber }}>4.5 mm</div>
                <div style={{ fontSize: '10px', color: D.textMuted }}>Kikuyu / Ryegrass</div>
              </div>

              <div style={{ padding: '10px', borderRadius: '10px', background: D.isDark ? '#1e293b' : '#f1f5f9' }}>
                <div style={{ fontSize: '10px', fontFamily: D.mono, color: D.textMuted }}>EXPECTED BOUNCE</div>
                <div style={{ fontSize: '18px', fontFamily: D.mono, fontWeight: 800, color: D.indigo }}>True / Fast</div>
                <div style={{ fontSize: '10px', color: D.emerald }}>Pace Bowler Assist</div>
              </div>
            </div>
          </div>

          {/* Live Weather Forecast Widget */}
          <div
            style={{
              padding: '16px',
              borderRadius: '16px',
              background: D.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
              border: `1px solid ${D.border}`,
            }}
          >
            <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: D.textPrimary, marginBottom: '10px' }}>
              Localized Matchday Meteorology
            </div>
            <GoogleWeatherWidget
              theme={D}
              locationName="Westville, Durban"
              latitude={-29.83}
              longitude={30.93}
              matchDate="Saturday"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
