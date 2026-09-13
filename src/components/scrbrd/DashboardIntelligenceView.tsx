'use client';

import React, { useState } from 'react';
import { Theme, SchoolRegistryItem, Match, Player } from './types';
import {
  Trophy,
  ArrowRight,
  Activity,
  Thermometer,
  Users,
  TrendingUp,
  Play,
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
  matches,
  isCompactDensity = false,
  onNavigate,
  onLaunchScorer,
}: DashboardIntelligenceViewProps) {
  const [activePerspective, setActivePerspective] = useState<'coach' | 'executive' | 'scorer' | 'athlete'>('coach');
  const [actionCategoryFilter, setActionCategoryFilter] = useState<'all' | 'urgent' | 'selection' | 'medical' | 'logistics'>('all');

  const schoolPrimary = activeSchool?.color || D.indigo;

  // Find active live match or next scheduled match
  const liveMatch = matches.find((m) => m.status === 'live') || matches[0];

  // Action Centre items (role-aware)
  const actionItems = [
    {
      id: 'act_1',
      title: 'Confirm Match Availability for Saturday',
      category: 'urgent',
      due: 'Today 17:00',
      description: 'Westville 1st XI vs DHS 1st XI at Bowden’s Field. 2 players pending.',
      actionText: 'Update Availability',
      onAction: () => onNavigate('squad'),
    },
    {
      id: 'act_2',
      title: 'Sign Tour Consent & Medical Waiver',
      category: 'logistics',
      due: 'Tomorrow 12:00',
      description: 'KZN Schools T20 Championship travel clearance. 3 signatures required.',
      actionText: 'Review Consent Form',
      onAction: () => onNavigate('governance'),
    },
    {
      id: 'act_3',
      title: 'Bowler Overload Threshold Notice',
      category: 'medical',
      due: 'Immediate',
      description: 'K. Pillay has exceeded 30 overs in 7-day rolling window. Recommend rest or 4-over cap.',
      actionText: 'Inspect Bowler Monitor',
      onAction: () => onNavigate('injuries'),
    },
    {
      id: 'act_4',
      title: 'Submit Final Playing XI Lineup',
      category: 'selection',
      due: 'Friday 18:00',
      description: '14 squad members available. 1 restricted for bowling workload.',
      actionText: 'Open Selection Hub',
      onAction: () => onNavigate('squad'),
    },
    {
      id: 'act_5',
      title: 'Verify Ground Scoreboard Synchronization',
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
      id="dashboard-intelligence-view"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: isCompactDensity ? '18px' : '24px',
        maxWidth: '1440px',
        margin: '0 auto',
      }}
    >
      {/* Institutional Banner */}
      <section
        id="section-institutional-header"
        style={{
          background: D.surf0,
          borderRadius: '12px',
          border: `1px solid ${D.border}`,
          padding: isCompactDensity ? '16px 20px' : '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                fontSize: '28px',
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                background: `${schoolPrimary}15`,
                border: `1px solid ${schoolPrimary}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
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
                    borderRadius: '4px',
                    background: `${schoolPrimary}15`,
                    color: schoolPrimary,
                    whiteSpace: 'nowrap',
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
                    borderRadius: '4px',
                    background: `${D.emerald}15`,
                    color: D.emerald,
                    whiteSpace: 'nowrap',
                  }}
                >
                  4-Match Winning Run
                </span>
              </div>

              <h1
                style={{
                  fontFamily: D.head,
                  fontSize: isCompactDensity ? '20px' : '22px',
                  fontWeight: 800,
                  color: D.textPrimary,
                  margin: '4px 0 2px 0',
                  letterSpacing: '-0.02em',
                }}
              >
                {activeSchool.name} Cricket Operations
              </h1>
              <div style={{ fontFamily: D.body, fontSize: '13px', color: D.textSecondary }}>
                Home Oval: <strong style={{ color: D.textPrimary }}>{activeSchool.mainOval}</strong> · Head of Cricket: {activeSchool.headOfCricket}
              </div>
            </div>
          </div>

          {/* Perspective Switcher */}
          <div
            id="control-perspective-switcher"
            style={{
              display: 'flex',
              alignItems: 'center',
              background: D.isDark ? '#151e2e' : '#f1f5f9',
              padding: '3px',
              borderRadius: '8px',
              border: `1px solid ${D.border}`,
            }}
          >
            {[
              { id: 'coach', label: 'Coach & HP' },
              { id: 'executive', label: 'Executive' },
              { id: 'scorer', label: 'Scorer Hub' },
              { id: 'athlete', label: 'Athlete Portal' },
            ].map((p) => {
              const isActive = activePerspective === p.id;
              return (
                <button
                  key={p.id}
                  id={`btn-perspective-${p.id}`}
                  onClick={() => setActivePerspective(p.id as any)}
                  style={{
                    padding: isCompactDensity ? '5px 10px' : '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: isActive ? D.surf0 : 'transparent',
                    color: isActive ? D.textPrimary : D.textMuted,
                    fontFamily: D.body,
                    fontSize: '12px',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: isActive ? (D.isDark ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.06)') : 'none',
                    transition: 'background 0.15s ease, color 0.15s ease',
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Hero Live Match Telemetry Section */}
      <section
        id="section-live-telemetry"
        style={{
          background: D.surf0,
          borderRadius: '12px',
          border: `1px solid ${D.border}`,
          padding: isCompactDensity ? '18px 20px' : '22px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}
      >
        {/* Top bar of live match card */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontFamily: D.mono,
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 8px',
                borderRadius: '4px',
                background: liveMatch.status === 'live' ? `${D.emerald}15` : `${D.indigo}15`,
                color: liveMatch.status === 'live' ? D.emerald : D.indigo,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
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
              {liveMatch.status === 'live' ? 'LIVE BROADCAST' : 'UPCOMING FIXTURE'}
            </span>

            <span style={{ fontFamily: D.mono, fontSize: '12px', color: D.textMuted }}>
              KZN Schools 1st XI League · 50-Over Declaration
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              id="btn-goto-match-centre"
              onClick={() => onNavigate('matches')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: `1px solid ${D.border}`,
                background: 'transparent',
                color: D.textSecondary,
                fontFamily: D.body,
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Match Centre →
            </button>

            <button
              id="btn-open-scorer-hub"
              onClick={() => onLaunchScorer(liveMatch)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: D.emerald,
                color: '#ffffff',
                fontFamily: D.body,
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              <Play size={13} fill="#ffffff" />
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
              padding: '16px 18px',
              borderRadius: '8px',
              background: D.isDark ? '#151e2e' : '#f8fafc',
              border: `1px solid ${D.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontFamily: D.head, fontSize: '17px', fontWeight: 800, color: D.textPrimary }}>
                {liveMatch.homeTeam}
              </div>
              <div style={{ fontFamily: D.mono, fontSize: '12px', color: D.emerald, fontWeight: 700, marginTop: '2px' }}>
                1st Innings: 248/6 (50.0 ov)
              </div>
            </div>
            <div style={{ fontSize: '24px' }}>🏛️</div>
          </div>

          {/* Equation & Status Center */}
          <div style={{ textAlign: 'center', padding: '0 8px' }}>
            <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary }}>
              vs
            </div>
            <div
              style={{
                fontFamily: D.mono,
                fontSize: '13px',
                fontWeight: 700,
                color: D.indigo,
                margin: '3px 0',
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
              padding: '16px 18px',
              borderRadius: '8px',
              background: D.isDark ? '#151e2e' : '#f8fafc',
              border: `1px solid ${D.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontFamily: D.head, fontSize: '17px', fontWeight: 800, color: D.textPrimary }}>
                {liveMatch.awayTeam}
              </div>
              <div style={{ fontFamily: D.mono, fontSize: '12px', color: D.sky, fontWeight: 700, marginTop: '2px' }}>
                Current: 197/4 (42.0 ov)
              </div>
            </div>
            <div style={{ fontSize: '24px' }}>🦅</div>
          </div>
        </div>

        {/* Win Equity & Active Battlers Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            paddingTop: '12px',
            borderTop: `1px solid ${D.border}`,
          }}
        >
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '6px',
              background: D.isDark ? '#151e2e' : '#f8fafc',
              border: `1px solid ${D.border}`,
            }}
          >
            <div style={{ fontFamily: D.mono, fontSize: '10px', textTransform: 'uppercase', color: D.textMuted, marginBottom: '2px' }}>
              Striker at Crease
            </div>
            <div style={{ fontFamily: D.body, fontSize: '12px', fontWeight: 700, color: D.textPrimary }}>
              A. Sithole · <span style={{ color: D.emerald, fontFamily: D.mono }}>68* (54b)</span>
            </div>
          </div>

          <div
            style={{
              padding: '10px 12px',
              borderRadius: '6px',
              background: D.isDark ? '#151e2e' : '#f8fafc',
              border: `1px solid ${D.border}`,
            }}
          >
            <div style={{ fontFamily: D.mono, fontSize: '10px', textTransform: 'uppercase', color: D.textMuted, marginBottom: '2px' }}>
              Non-Striker
            </div>
            <div style={{ fontFamily: D.body, fontSize: '12px', fontWeight: 700, color: D.textPrimary }}>
              D. Evans · <span style={{ color: D.sky, fontFamily: D.mono }}>24* (28b)</span>
            </div>
          </div>

          <div
            style={{
              padding: '10px 12px',
              borderRadius: '6px',
              background: D.isDark ? '#151e2e' : '#f8fafc',
              border: `1px solid ${D.border}`,
            }}
          >
            <div style={{ fontFamily: D.mono, fontSize: '10px', textTransform: 'uppercase', color: D.textMuted, marginBottom: '2px' }}>
              Current Bowler
            </div>
            <div style={{ fontFamily: D.body, fontSize: '12px', fontWeight: 700, color: D.textPrimary }}>
              K. Pillay · <span style={{ color: D.amber, fontFamily: D.mono }}>8.0-1-38-2</span>
            </div>
          </div>

          <div
            style={{
              padding: '10px 12px',
              borderRadius: '6px',
              background: D.isDark ? '#151e2e' : '#f8fafc',
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
      </section>

      {/* 4-KPI Overview Row */}
      <section
        id="section-kpi-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
        }}
      >
        <div
          style={{
            padding: '16px 18px',
            borderRadius: '10px',
            background: D.surf0,
            border: `1px solid ${D.border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: D.textMuted, marginBottom: '4px' }}>
            <span style={{ fontFamily: D.mono, fontSize: '11px', textTransform: 'uppercase' }}>Win Rate (Season)</span>
            <Trophy size={16} color={D.amber} />
          </div>
          <div style={{ fontFamily: D.mono, fontSize: '26px', fontWeight: 800, color: D.textPrimary }}>
            61.6%
          </div>
          <div style={{ fontFamily: D.body, fontSize: '12px', color: D.emerald, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={12} /> +8.4% vs 2025 season
          </div>
        </div>

        <div
          style={{
            padding: '16px 18px',
            borderRadius: '10px',
            background: D.surf0,
            border: `1px solid ${D.border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: D.textMuted, marginBottom: '4px' }}>
            <span style={{ fontFamily: D.mono, fontSize: '11px', textTransform: 'uppercase' }}>Total Runs Scored</span>
            <Activity size={16} color={D.sky} />
          </div>
          <div style={{ fontFamily: D.mono, fontSize: '26px', fontWeight: 800, color: D.textPrimary }}>
            1,842
          </div>
          <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted, marginTop: '2px' }}>
            Avg Run Rate: 5.12 rpo across 8 matches
          </div>
        </div>

        <div
          style={{
            padding: '16px 18px',
            borderRadius: '10px',
            background: D.surf0,
            border: `1px solid ${D.border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: D.textMuted, marginBottom: '4px' }}>
            <span style={{ fontFamily: D.mono, fontSize: '11px', textTransform: 'uppercase' }}>Available Squad</span>
            <Users size={16} color={D.emerald} />
          </div>
          <div style={{ fontFamily: D.mono, fontSize: '26px', fontWeight: 800, color: D.textPrimary }}>
            14 / 16
          </div>
          <div style={{ fontFamily: D.body, fontSize: '12px', color: D.amber, marginTop: '2px' }}>
            2 modified load, 0 sidelined
          </div>
        </div>

        <div
          style={{
            padding: '16px 18px',
            borderRadius: '10px',
            background: D.surf0,
            border: `1px solid ${D.border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: D.textMuted, marginBottom: '4px' }}>
            <span style={{ fontFamily: D.mono, fontSize: '11px', textTransform: 'uppercase' }}>Curator Pitch Index</span>
            <Thermometer size={16} color={D.indigo} />
          </div>
          <div style={{ fontFamily: D.mono, fontSize: '26px', fontWeight: 800, color: D.textPrimary }}>
            8.8 / 10
          </div>
          <div style={{ fontFamily: D.body, fontSize: '12px', color: D.emerald, marginTop: '2px' }}>
            Turf dry, true bounce, 14% moisture
          </div>
        </div>
      </section>

      {/* Action Centre Section */}
      <section
        id="section-action-centre"
        style={{
          background: D.surf0,
          borderRadius: '12px',
          border: `1px solid ${D.border}`,
          padding: isCompactDensity ? '16px 20px' : '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
              Action Centre & Approvals
            </h2>
            <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted }}>
              Required decisions and verifications for your institutional role
            </div>
          </div>

          {/* Filter Chips */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(['all', 'urgent', 'selection', 'medical', 'logistics'] as const).map((cat) => {
              const isSelected = actionCategoryFilter === cat;
              return (
                <button
                  key={cat}
                  id={`filter-action-${cat}`}
                  onClick={() => setActionCategoryFilter(cat)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: isSelected ? `1px solid ${D.indigo}` : `1px solid ${D.border}`,
                    background: isSelected ? (D.isDark ? '#1e293b' : '#f1f5f9') : 'transparent',
                    color: isSelected ? D.indigo : D.textSecondary,
                    fontFamily: D.body,
                    fontSize: '11px',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    whiteSpace: 'nowrap',
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
            const tagColor = isUrgent ? D.rose : isMed ? D.amber : D.indigo;

            return (
              <div
                key={act.id}
                id={`action-item-${act.id}`}
                style={{
                  padding: '14px 16px',
                  borderRadius: '8px',
                  background: D.isDark ? '#151e2e' : '#f8fafc',
                  border: `1px solid ${D.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span
                      style={{
                        fontFamily: D.mono,
                        fontSize: '9px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: `${tagColor}15`,
                        color: tagColor,
                        whiteSpace: 'nowrap',
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
                    padding: '5px 10px',
                    borderRadius: '6px',
                    border: `1px solid ${D.border}`,
                    background: D.surf0,
                    color: D.textPrimary,
                    fontFamily: D.body,
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span>{act.actionText}</span>
                  <ArrowRight size={11} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Turf Curator & Home Ground Telemetry */}
      <section
        id="section-pitch-environmental"
        style={{
          background: D.surf0,
          borderRadius: '12px',
          border: `1px solid ${D.border}`,
          padding: isCompactDensity ? '16px 20px' : '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
              Pitch & Environmental Diagnostics
            </h3>
            <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted }}>
              Groundskeeper telemetry & live localized weather for {activeSchool.mainOval}
            </div>
          </div>

          <button
            id="btn-goto-fields"
            onClick={() => onNavigate('fields')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: `1px solid ${D.border}`,
              background: 'transparent',
              color: D.indigo,
              fontFamily: D.body,
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
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
              borderRadius: '8px',
              background: D.isDark ? '#151e2e' : '#f8fafc',
              border: `1px solid ${D.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: D.textPrimary }}>
              Bowden&apos;s Field Surface Telemetry
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ padding: '10px', borderRadius: '6px', background: D.surf0, border: `1px solid ${D.border}` }}>
                <div style={{ fontSize: '10px', fontFamily: D.mono, color: D.textMuted }}>SOIL MOISTURE</div>
                <div style={{ fontSize: '18px', fontFamily: D.mono, fontWeight: 800, color: D.sky }}>14.2%</div>
                <div style={{ fontSize: '10px', color: D.emerald }}>Optimal Hardness</div>
              </div>

              <div style={{ padding: '10px', borderRadius: '6px', background: D.surf0, border: `1px solid ${D.border}` }}>
                <div style={{ fontSize: '10px', fontFamily: D.mono, color: D.textMuted }}>COMPACTION</div>
                <div style={{ fontSize: '18px', fontFamily: D.mono, fontWeight: 800, color: D.emerald }}>320 PSI</div>
                <div style={{ fontSize: '10px', color: D.textMuted }}>Heavy Roller Applied</div>
              </div>

              <div style={{ padding: '10px', borderRadius: '6px', background: D.surf0, border: `1px solid ${D.border}` }}>
                <div style={{ fontSize: '10px', fontFamily: D.mono, color: D.textMuted }}>GRASS COVER</div>
                <div style={{ fontSize: '18px', fontFamily: D.mono, fontWeight: 800, color: D.amber }}>4.5 mm</div>
                <div style={{ fontSize: '10px', color: D.textMuted }}>Kikuyu / Ryegrass</div>
              </div>

              <div style={{ padding: '10px', borderRadius: '6px', background: D.surf0, border: `1px solid ${D.border}` }}>
                <div style={{ fontSize: '10px', fontFamily: D.mono, color: D.textMuted }}>EXPECTED BOUNCE</div>
                <div style={{ fontSize: '18px', fontFamily: D.mono, fontWeight: 800, color: D.indigo }}>True / Fast</div>
                <div style={{ fontSize: '10px', color: D.emerald }}>Pace Bowler Assist</div>
              </div>
            </div>
          </div>

          {/* Localized Weather Forecast Widget */}
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              background: D.isDark ? '#151e2e' : '#f8fafc',
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
      </section>
    </div>
  );
}
