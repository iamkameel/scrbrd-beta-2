'use client';

import React, { useState, useMemo } from 'react';
import { Theme, Match } from './types';
import { Card, SectionHeader, Badge, Btn } from '../ui/primitives';
import {
  Trophy,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Plus,
  Shield,
  Award,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Sparkles,
} from 'lucide-react';
import { MATCHES, COMPETITIONS, SCHOOLS_REGISTRY } from './data';

interface LeagueCompetitionsViewProps {
  theme: Theme;
  role: string;
  onSelectMatch?: (matchId: string) => void;
}

interface TeamStanding {
  team: string;
  short: string;
  schoolId: string;
  P: number;
  W: number;
  L: number;
  NR: number;
  pts: number;
  nrr: number;
  form: Array<'W' | 'L' | 'NR'>;
  runsScored: number;
  oversFaced: number;
  runsConceded: number;
  oversBowled: number;
}

export default function LeagueCompetitionsView({
  theme,
  role,
  onSelectMatch,
}: LeagueCompetitionsViewProps) {
  const [selectedCompId, setSelectedCompId] = useState<string>('comp1');
  const [activeTab, setActiveTab] = useState<'table' | 'brackets' | 'fixtures' | 'performers'>('table');
  const [editingStandings, setEditingStandings] = useState<boolean>(false);
  const [nrrCalculatorOpen, setNrrCalculatorOpen] = useState<boolean>(false);

  // Dynamic D tokens
  const D = {
    bg: theme.bg,
    surf1: theme.surf1,
    surf2: theme.surf2,
    border: theme.border,
    textPrimary: theme.textPrimary,
    textSecondary: theme.textSecondary,
    textMuted: theme.textMuted,
    gold: theme.gold,
    amber: '#F59E0B',
    emerald: '#10B981',
    sky: '#0EA5E9',
    indigo: '#6366F1',
    rose: '#EF4444',
    violet: '#8B5CF6',
    pill: '9999px',
    md: '8px',
    lg: '12px',
    mono: 'var(--font-mono, monospace)',
    head: 'var(--font-heading, sans-serif)',
    body: 'var(--font-body, sans-serif)',
  };

  const currentComp = COMPETITIONS.find((c) => c.id === selectedCompId) || COMPETITIONS[0];
  const canManage = role === 'superadmin' || role === 'schooladmin' || role === 'sportsmaster';

  // Derived standings with live NRR calculations
  const standings: TeamStanding[] = useMemo(() => {
    if (!currentComp || !currentComp.table) return [];

    return currentComp.table.map((t, idx) => {
      // Mock base runs/overs to generate authentic NRR
      const runsScored = 180 * t.P + (t.W * 35);
      const oversFaced = 20 * t.P;
      const runsConceded = 180 * t.P - (t.W * 30);
      const oversBowled = 20 * t.P;

      const calcNrr = oversFaced > 0 && oversBowled > 0
        ? (runsScored / oversFaced) - (runsConceded / oversBowled)
        : t.nrr || 0;

      return {
        team: t.team,
        short: t.team.substring(0, 3).toUpperCase(),
        schoolId: t.team.includes('Hilton') ? 'HIL' : t.team.includes('Michaelhouse') ? 'MHS' : t.team.includes('Westville') ? 'WES' : 'Kearsney',
        P: t.P,
        W: t.W,
        L: t.L,
        NR: t.NR,
        pts: t.pts,
        nrr: t.nrr !== undefined ? t.nrr : parseFloat(calcNrr.toFixed(3)),
        form: idx === 0 ? ['W', 'W', 'W', 'W', 'L'] : idx === 1 ? ['W', 'W', 'L', 'W', 'W'] : ['L', 'W', 'L', 'W', 'L'],
        runsScored,
        oversFaced,
        runsConceded,
        oversBowled,
      };
    });
  }, [currentComp]);

  const compMatches = useMemo(() => {
    return MATCHES.filter((m) => m.competition === selectedCompId || selectedCompId === 'comp1');
  }, [selectedCompId]);

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: D.md, background: `${D.amber}18`, color: D.amber }}>
              <Trophy size={24} />
            </div>
            <div>
              <h1 style={{ fontFamily: D.head, fontSize: '24px', fontWeight: 700, color: D.textPrimary, margin: 0 }}>
                Leagues & Competitions
              </h1>
              <p style={{ fontFamily: D.body, fontSize: '13px', color: D.textMuted, margin: '2px 0 0 0' }}>
                Official Standings · Net Run Rate (NRR) Matrix · Knockout Brackets · Fixture Management
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {canManage && (
            <button
              onClick={() => setNrrCalculatorOpen(!nrrCalculatorOpen)}
              style={{
                padding: '8px 14px',
                borderRadius: D.md,
                background: D.surf1,
                border: `1px solid ${D.border}`,
                color: D.textPrimary,
                fontFamily: D.head,
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <Sparkles size={14} color={D.gold} />
              NRR Simulator
            </button>
          )}
        </div>
      </div>

      {/* Competition Selector Pills */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px' }}>
        {COMPETITIONS.map((c) => {
          const isSelected = c.id === selectedCompId;
          return (
            <button
              key={c.id}
              onClick={() => {
                setSelectedCompId(c.id);
                setActiveTab('table');
              }}
              style={{
                padding: '12px 18px',
                borderRadius: D.lg,
                background: isSelected ? `${D.amber}14` : D.surf1,
                border: `1px solid ${isSelected ? D.amber : D.border}`,
                cursor: 'pointer',
                textAlign: 'left',
                minWidth: '220px',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: isSelected ? D.amber : D.textPrimary }}>
                  {c.name}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: D.pill,
                    background: c.active ? `${D.emerald}20` : `${D.textMuted}20`,
                    color: c.active ? D.emerald : D.textMuted,
                    fontWeight: 600,
                  }}
                >
                  {c.active ? 'Active' : 'Completed'}
                </span>
              </div>
              <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, display: 'flex', gap: '6px' }}>
                <span>{c.format}</span>
                <span>•</span>
                <span>{c.ageGroup}</span>
                <span>•</span>
                <span>{c.teams} Teams</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: `1px solid ${D.border}`, marginBottom: '20px' }}>
        {[
          { key: 'table', label: 'League Standings', icon: Trophy },
          { key: 'brackets', label: 'Tournament Brackets', icon: Layers },
          { key: 'fixtures', label: 'Competition Fixtures', icon: Calendar },
          { key: 'performers', label: 'Stat Leaders', icon: Award },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${isActive ? D.amber : 'transparent'}`,
                color: isActive ? D.amber : D.textSecondary,
                fontFamily: D.head,
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                marginBottom: '-1px',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: STANDINGS TABLE */}
      {activeTab === 'table' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
          {/* Main Table */}
          <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${D.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 700, color: D.textPrimary, margin: 0 }}>
                  {currentComp.name} — Official Table
                </h2>
                <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                  Win: 4 pts | Tie/NR: 2 pts | Loss: 0 pts | Tiebreak: Net Run Rate (NRR)
                </span>
              </div>
              {canManage && (
                <button
                  onClick={() => setEditingStandings(!editingStandings)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: D.md,
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    color: D.textSecondary,
                    fontFamily: D.head,
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  {editingStandings ? 'Save Overrides' : 'Audit Overrides'}
                </button>
              )}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: D.surf2, borderBottom: `1px solid ${D.border}` }}>
                    <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textMuted, textAlign: 'left' }}>POS</th>
                    <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textMuted, textAlign: 'left' }}>TEAM / INSTITUTION</th>
                    <th style={{ padding: '12px 10px', fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textMuted, textAlign: 'center' }}>P</th>
                    <th style={{ padding: '12px 10px', fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textMuted, textAlign: 'center' }}>W</th>
                    <th style={{ padding: '12px 10px', fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textMuted, textAlign: 'center' }}>L</th>
                    <th style={{ padding: '12px 10px', fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textMuted, textAlign: 'center' }}>NR</th>
                    <th style={{ padding: '12px 14px', fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.gold, textAlign: 'center' }}>PTS</th>
                    <th style={{ padding: '12px 14px', fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.sky, textAlign: 'center' }}>NRR</th>
                    <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textMuted, textAlign: 'center' }}>FORM</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((team, idx) => {
                    const isLeader = idx === 0;
                    const isHilton = team.team.includes('Hilton');

                    return (
                      <tr
                        key={team.team}
                        style={{
                          borderBottom: `1px solid ${D.border}`,
                          background: isHilton ? `${D.amber}08` : 'transparent',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '14px 16px', fontFamily: D.mono, fontSize: '12px', fontWeight: 700, color: isLeader ? D.gold : D.textMuted }}>
                          {isLeader ? '👑 1' : idx + 1}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: D.pill,
                                background: D.surf2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: D.head,
                                fontSize: '11px',
                                fontWeight: 700,
                                color: D.textPrimary,
                              }}
                            >
                              {team.short}
                            </div>
                            <div>
                              <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: isHilton ? D.amber : D.textPrimary }}>
                                {team.team}
                              </div>
                              <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                                {team.schoolId} · 1st XI
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 10px', fontFamily: D.mono, fontSize: '12px', textAlign: 'center', color: D.textSecondary }}>{team.P}</td>
                        <td style={{ padding: '14px 10px', fontFamily: D.mono, fontSize: '12px', textAlign: 'center', fontWeight: 600, color: D.emerald }}>{team.W}</td>
                        <td style={{ padding: '14px 10px', fontFamily: D.mono, fontSize: '12px', textAlign: 'center', color: team.L > 0 ? D.rose : D.textMuted }}>{team.L}</td>
                        <td style={{ padding: '14px 10px', fontFamily: D.mono, fontSize: '12px', textAlign: 'center', color: D.textMuted }}>{team.NR}</td>
                        <td style={{ padding: '14px 14px', fontFamily: D.mono, fontSize: '14px', textAlign: 'center', fontWeight: 700, color: D.gold }}>
                          {team.pts}
                        </td>
                        <td style={{ padding: '14px 14px', fontFamily: D.mono, fontSize: '12px', textAlign: 'center', fontWeight: 700, color: team.nrr >= 0 ? D.emerald : D.rose }}>
                          {team.nrr >= 0 ? `+${team.nrr.toFixed(3)}` : team.nrr.toFixed(3)}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            {team.form.map((res, fIdx) => (
                              <span
                                key={fIdx}
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: D.pill,
                                  background: res === 'W' ? `${D.emerald}25` : res === 'L' ? `${D.rose}25` : `${D.textMuted}25`,
                                  color: res === 'W' ? D.emerald : res === 'L' ? D.rose : D.textMuted,
                                  fontFamily: D.mono,
                                  fontSize: '9px',
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                {res}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar: Qualification Matrix & Key Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, padding: '16px' }}>
              <h3 style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: D.textPrimary, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={16} color={D.amber} />
                Qualification Criteria
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${D.border}` }}>
                  <span style={{ color: D.textSecondary }}>Top 2 Semi-Final Seed</span>
                  <span style={{ fontFamily: D.mono, fontWeight: 700, color: D.emerald }}>Hilton, Michaelhouse</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${D.border}` }}>
                  <span style={{ color: D.textSecondary }}>Bonus Point Threshold</span>
                  <span style={{ fontFamily: D.mono, color: D.textPrimary }}>+1.25x Run Rate</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${D.border}` }}>
                  <span style={{ color: D.textSecondary }}>Overs Quota Minimum</span>
                  <span style={{ fontFamily: D.mono, color: D.textPrimary }}>5 Overs (DLS)</span>
                </div>
              </div>
            </div>

            <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, padding: '16px' }}>
              <h3 style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: D.textPrimary, marginBottom: '12px' }}>
                Tournament Pace Indicators
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ color: D.textMuted }}>Tournament Average 1st Innings</span>
                    <span style={{ fontFamily: D.mono, fontWeight: 700, color: D.textPrimary }}>174 / 6</span>
                  </div>
                  <div style={{ height: '4px', borderRadius: D.pill, background: D.surf2, overflow: 'hidden' }}>
                    <div style={{ width: '72%', height: '100%', background: D.amber }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ color: D.textMuted }}>Toss Win → Bat 1st Advantage</span>
                    <span style={{ fontFamily: D.mono, fontWeight: 700, color: D.textPrimary }}>64% Win Rate</span>
                  </div>
                  <div style={{ height: '4px', borderRadius: D.pill, background: D.surf2, overflow: 'hidden' }}>
                    <div style={{ width: '64%', height: '100%', background: D.emerald }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TOURNAMENT BRACKETS */}
      {activeTab === 'brackets' && (
        <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, padding: '24px' }}>
          <h2 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 700, color: D.textPrimary, marginBottom: '20px' }}>
            {currentComp.name} — Knockout Stage Progression
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', alignItems: 'center' }}>
            {/* Quarter Finals */}
            <div>
              <div style={{ fontFamily: D.mono, fontSize: '11px', fontWeight: 700, color: D.amber, textTransform: 'uppercase', marginBottom: '12px' }}>
                Quarter Finals (Stage 1)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '12px', borderRadius: D.md, background: D.surf2, border: `1px solid ${D.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: D.emerald }}>
                    <span>Hilton College</span>
                    <span>186/6 (20.0)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: D.textMuted, marginTop: '4px' }}>
                    <span>Clifton College</span>
                    <span>142/9 (20.0)</span>
                  </div>
                  <div style={{ fontSize: '10px', color: D.emerald, marginTop: '6px', fontWeight: 600 }}>Hilton won by 44 runs</div>
                </div>
                <div style={{ padding: '12px', borderRadius: D.md, background: D.surf2, border: `1px solid ${D.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: D.emerald }}>
                    <span>Michaelhouse</span>
                    <span>165/4 (19.1)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: D.textMuted, marginTop: '4px' }}>
                    <span>Kearsney College</span>
                    <span>164/7 (20.0)</span>
                  </div>
                  <div style={{ fontSize: '10px', color: D.emerald, marginTop: '6px', fontWeight: 600 }}>MHS won by 6 wkts</div>
                </div>
              </div>
            </div>

            {/* Semi Finals */}
            <div>
              <div style={{ fontFamily: D.mono, fontSize: '11px', fontWeight: 700, color: D.sky, textTransform: 'uppercase', marginBottom: '12px' }}>
                Semi Finals (Current Stage)
              </div>
              <div style={{ padding: '16px', borderRadius: D.md, background: `${D.sky}10`, border: `1px solid ${D.sky}40` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: D.textPrimary }}>
                  <span>Hilton College</span>
                  <span style={{ color: D.gold }}>Live (m1)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: D.textSecondary, marginTop: '6px' }}>
                  <span>Michaelhouse</span>
                  <span>Sat, 14:00</span>
                </div>
                <div style={{ fontSize: '11px', color: D.sky, marginTop: '8px', fontWeight: 600 }}>The Oval, Pietermaritzburg</div>
              </div>
            </div>

            {/* Grand Final */}
            <div>
              <div style={{ fontFamily: D.mono, fontSize: '11px', fontWeight: 700, color: D.gold, textTransform: 'uppercase', marginBottom: '12px' }}>
                Grand Final (Championship Trophy)
              </div>
              <div style={{ padding: '16px', borderRadius: D.md, background: `${D.gold}10`, border: `1px solid ${D.gold}40`, textAlign: 'center' }}>
                <Trophy size={32} color={D.gold} style={{ margin: '0 auto 8px auto' }} />
                <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 700, color: D.textPrimary }}>Winner SF1 vs Winner SF2</div>
                <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted, marginTop: '4px' }}>Sunday, 15:00 · Kingsmead Stadium</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FIXTURES */}
      {activeTab === 'fixtures' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {compMatches.map((m) => (
            <div
              key={m.id}
              onClick={() => onSelectMatch?.(m.id)}
              style={{
                padding: '16px 20px',
                borderRadius: D.lg,
                background: D.surf1,
                border: `1px solid ${D.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'border 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    padding: '6px 10px',
                    borderRadius: D.pill,
                    background: m.status === 'live' ? `${D.rose}20` : `${D.surf2}`,
                    color: m.status === 'live' ? D.rose : D.textMuted,
                    fontFamily: D.mono,
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  {m.status}
                </div>
                <div>
                  <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 700, color: D.textPrimary }}>
                    {m.homeTeam} vs {m.awayTeam}
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted, marginTop: '2px' }}>
                    {m.date} · {m.venue} · {m.matchFormat}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {m.result && (
                  <span style={{ fontFamily: D.body, fontSize: '12px', fontWeight: 600, color: D.emerald }}>
                    {m.result}
                  </span>
                )}
                <ChevronRight size={18} color={D.textMuted} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: STAT LEADERS */}
      {activeTab === 'performers' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, padding: '20px' }}>
            <h3 style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 700, color: D.textPrimary, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} color={D.emerald} />
              Top Run Scorers (Orange Cap)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { name: 'Kameel M.', school: 'Hilton College', runs: 284, avg: 56.8, sr: 148.2 },
                { name: 'L. Van Der Merwe', school: 'Michaelhouse', runs: 242, avg: 48.4, sr: 139.1 },
                { name: 'T. Sithole', school: 'Westville Boys', runs: 215, avg: 43.0, sr: 131.0 },
              ].map((p, idx) => (
                <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: D.md, background: D.surf2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontFamily: D.mono, fontSize: '12px', fontWeight: 700, color: idx === 0 ? D.gold : D.textMuted }}>#{idx + 1}</span>
                    <div>
                      <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary }}>{p.name}</div>
                      <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>{p.school}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: D.mono, fontSize: '13px', fontWeight: 700, color: D.gold }}>{p.runs} runs</div>
                    <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>Avg {p.avg} · SR {p.sr}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, padding: '20px' }}>
            <h3 style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 700, color: D.textPrimary, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={16} color={D.violet} />
              Top Wicket Takers (Purple Cap)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { name: 'A. Ndlovu', school: 'Hilton College', wkts: 14, econ: 4.85, avg: 12.4 },
                { name: 'C. Botha', school: 'Kearsney College', wkts: 11, econ: 5.20, avg: 14.1 },
                { name: 'M. Khumalo', school: 'Westville Boys', wkts: 10, econ: 5.60, avg: 16.2 },
              ].map((p, idx) => (
                <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: D.md, background: D.surf2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontFamily: D.mono, fontSize: '12px', fontWeight: 700, color: idx === 0 ? D.violet : D.textMuted }}>#{idx + 1}</span>
                    <div>
                      <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary }}>{p.name}</div>
                      <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>{p.school}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: D.mono, fontSize: '13px', fontWeight: 700, color: D.violet }}>{p.wkts} wkts</div>
                    <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>Econ {p.econ} · Avg {p.avg}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
