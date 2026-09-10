'use client';

import React, { useState } from 'react';
import { Theme } from './types';
import { SCHOOLS_REGISTRY } from './data';

interface PromotionDemotionViewProps {
  theme: Theme;
  activeSchoolId?: string;
  currentRole?: string;
}

interface TeamStanding {
  rank: number;
  team: string;
  shortName: string;
  schoolId: string;
  P: number;
  W: number;
  L: number;
  D: number;
  pts: number;
  nrr: number;
  zone: 'auto_promote' | 'playoff_promote' | 'safe' | 'playoff_relegate' | 'auto_relegate';
  form: ('W' | 'L' | 'D')[];
  feederDepthValid: boolean; // meets U14A, U15A, U16A criteria
  facilitiesAuditPass: boolean; // meets CSA turf wicket & scoreboard criteria
}

interface PlayoffMatch {
  id: string;
  round: 'Semi-Final 1' | 'Semi-Final 2' | 'Promotion Final';
  homeTeam: string;
  awayTeam: string;
  venue: string;
  status: 'Scheduled' | 'Completed';
  homeScore?: string;
  awayScore?: string;
  winner?: string;
  summary?: string;
}

const TIER_1_TEAMS: TeamStanding[] = [
  { rank: 1, team: "Westville Boys' High 1st XI", shortName: 'WBHS', schoolId: 'WES', P: 9, W: 8, L: 1, D: 0, pts: 16, nrr: 1.48, zone: 'safe', form: ['W', 'W', 'W', 'L', 'W'], feederDepthValid: true, facilitiesAuditPass: true },
  { rank: 2, team: 'Hilton College 1st XI', shortName: 'HIL', schoolId: 'HIL', P: 9, W: 7, L: 2, D: 0, pts: 14, nrr: 1.32, zone: 'safe', form: ['W', 'W', 'L', 'W', 'W'], feederDepthValid: true, facilitiesAuditPass: true },
  { rank: 3, team: 'Maritzburg College 1st XI', shortName: 'MCB', schoolId: 'MCB', P: 9, W: 6, L: 3, D: 0, pts: 12, nrr: 0.88, zone: 'safe', form: ['W', 'L', 'W', 'W', 'L'], feederDepthValid: true, facilitiesAuditPass: true },
  { rank: 4, team: 'Northwood School 1st XI', shortName: 'NOR', schoolId: 'NOR', P: 9, W: 6, L: 3, D: 0, pts: 12, nrr: 0.65, zone: 'safe', form: ['L', 'W', 'W', 'W', 'W'], feederDepthValid: true, facilitiesAuditPass: true },
  { rank: 5, team: 'Michaelhouse 1st XI', shortName: 'MIC', schoolId: 'MIC', P: 9, W: 5, L: 4, D: 0, pts: 10, nrr: 0.42, zone: 'safe', form: ['W', 'W', 'L', 'L', 'W'], feederDepthValid: true, facilitiesAuditPass: true },
  { rank: 6, team: 'Durban High School 1st XI', shortName: 'DHS', schoolId: 'DHS', P: 9, W: 4, L: 5, D: 0, pts: 8, nrr: 0.15, zone: 'safe', form: ['L', 'W', 'L', 'W', 'L'], feederDepthValid: true, facilitiesAuditPass: true },
  { rank: 7, team: 'Kearsney College 1st XI', shortName: 'KEA', schoolId: 'KEA', P: 9, W: 4, L: 5, D: 0, pts: 8, nrr: -0.22, zone: 'safe', form: ['W', 'L', 'W', 'L', 'L'], feederDepthValid: true, facilitiesAuditPass: true },
  { rank: 8, team: 'St Charles College 1st XI', shortName: 'SCC', schoolId: 'SCC', P: 9, W: 3, L: 6, D: 0, pts: 6, nrr: -0.65, zone: 'safe', form: ['L', 'L', 'W', 'L', 'W'], feederDepthValid: true, facilitiesAuditPass: true },
  { rank: 9, team: 'Glenwood High 1st XI', shortName: 'GLE', schoolId: 'GLE', P: 9, W: 1, L: 8, D: 0, pts: 2, nrr: -1.45, zone: 'playoff_relegate', form: ['L', 'L', 'L', 'W', 'L'], feederDepthValid: true, facilitiesAuditPass: true },
  { rank: 10, team: 'Clifton School 1st XI', shortName: 'CLF', schoolId: 'CLF', P: 9, W: 1, L: 8, D: 0, pts: 2, nrr: -1.78, zone: 'auto_relegate', form: ['L', 'L', 'L', 'L', 'L'], feederDepthValid: true, facilitiesAuditPass: true },
];

const TIER_2_TEAMS: TeamStanding[] = [
  { rank: 1, team: 'Port Shepstone High 1st XI', shortName: 'PSHS', schoolId: 'PSHS', P: 8, W: 7, L: 1, D: 0, pts: 14, nrr: 1.82, zone: 'auto_promote', form: ['W', 'W', 'W', 'W', 'W'], feederDepthValid: true, facilitiesAuditPass: true },
  { rank: 2, team: 'Ashton International Ballito', shortName: 'ASH', schoolId: 'ASH', P: 8, W: 6, L: 2, D: 0, pts: 12, nrr: 1.25, zone: 'playoff_promote', form: ['W', 'W', 'L', 'W', 'W'], feederDepthValid: true, facilitiesAuditPass: true },
  { rank: 3, team: 'Thomas More College 1st XI', shortName: 'TMC', schoolId: 'TMC', P: 8, W: 5, L: 3, D: 0, pts: 10, nrr: 0.74, zone: 'playoff_promote', form: ['W', 'L', 'W', 'W', 'L'], feederDepthValid: true, facilitiesAuditPass: true },
  { rank: 4, team: 'Curro Hillcrest 1st XI', shortName: 'CUR', schoolId: 'CUR', P: 8, W: 4, L: 4, D: 0, pts: 8, nrr: 0.12, zone: 'safe', form: ['L', 'W', 'L', 'L', 'W'], feederDepthValid: true, facilitiesAuditPass: false },
  { rank: 5, team: 'Crawford College La Lucia', shortName: 'CLL', schoolId: 'CLL', P: 8, W: 3, L: 5, D: 0, pts: 6, nrr: -0.45, zone: 'safe', form: ['W', 'L', 'L', 'W', 'L'], feederDepthValid: true, facilitiesAuditPass: true },
  { rank: 6, team: 'Grantleigh College 1st XI', shortName: 'GRA', schoolId: 'GRA', P: 8, W: 3, L: 5, D: 0, pts: 6, nrr: -0.82, zone: 'safe', form: ['L', 'L', 'W', 'L', 'W'], feederDepthValid: false, facilitiesAuditPass: true },
  { rank: 7, team: 'Kloof High School 1st XI', shortName: 'KLO', schoolId: 'KLO', P: 8, W: 2, L: 6, D: 0, pts: 4, nrr: -1.15, zone: 'playoff_relegate', form: ['L', 'W', 'L', 'L', 'L'], feederDepthValid: true, facilitiesAuditPass: true },
  { rank: 8, team: 'George Campbell Tech 1st XI', shortName: 'GCT', schoolId: 'GCT', P: 8, W: 1, L: 7, D: 0, pts: 2, nrr: -1.95, zone: 'auto_relegate', form: ['L', 'L', 'L', 'L', 'L'], feederDepthValid: false, facilitiesAuditPass: false },
];

const INITIAL_PLAYOFFS: PlayoffMatch[] = [
  {
    id: 'po-1',
    round: 'Semi-Final 1',
    homeTeam: 'Glenwood High 1st XI (Premier #9)',
    awayTeam: 'Thomas More College (Championship #3)',
    venue: "Bowden's Field Neutral Oval",
    status: 'Scheduled',
  },
  {
    id: 'po-2',
    round: 'Semi-Final 2',
    homeTeam: 'Ashton International (Championship #2)',
    awayTeam: 'Clifton School 1st XI (Premier #10)',
    venue: 'Kingsmead Stadium (Neutral)',
    status: 'Scheduled',
  },
  {
    id: 'po-3',
    round: 'Promotion Final',
    homeTeam: 'Winner Semi-Final 1',
    awayTeam: 'Winner Semi-Final 2',
    venue: 'Kingsmead Stadium Main Oval',
    status: 'Scheduled',
  },
];

export default function PromotionDemotionView({
  theme: D,
  activeSchoolId = 'WES',
  currentRole = 'super_admin',
}: PromotionDemotionViewProps) {
  const [activeTier, setActiveTier] = useState<'tier1' | 'tier2'>('tier1');
  const [activeTab, setActiveTab] = useState<'standings' | 'playoffs' | 'specs'>('standings');
  const [tier1Standings, setTier1Standings] = useState<TeamStanding[]>(TIER_1_TEAMS);
  const [tier2Standings, setTier2Standings] = useState<TeamStanding[]>(TIER_2_TEAMS);
  const [playoffs, setPlayoffs] = useState<PlayoffMatch[]>(INITIAL_PLAYOFFS);
  const [rolloverExecuted, setRolloverExecuted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeStandings = activeTier === 'tier1' ? tier1Standings : tier2Standings;

  // Simulate Playoff Match
  const handleSimulatePlayoff = (matchId: string) => {
    setPlayoffs(prev => prev.map(m => {
      if (m.id !== matchId) return m;
      if (m.id === 'po-1') {
        return {
          ...m,
          status: 'Completed',
          homeScore: '168/7 (20.0 ov)',
          awayScore: '154/9 (20.0 ov)',
          winner: 'Glenwood High 1st XI',
          summary: 'Glenwood High defended their total by 14 runs with tight death bowling.',
        };
      }
      if (m.id === 'po-2') {
        return {
          ...m,
          status: 'Completed',
          homeScore: '182/4 (20.0 ov)',
          awayScore: '162 all out (19.1 ov)',
          winner: 'Ashton International',
          summary: 'Ashton International pulled off a clinical upset, winning by 20 runs.',
        };
      }
      if (m.id === 'po-3') {
        return {
          ...m,
          homeTeam: 'Glenwood High 1st XI',
          awayTeam: 'Ashton International',
          status: 'Completed',
          homeScore: '174/6 (20.0 ov)',
          awayScore: '175/5 (19.4 ov)',
          winner: 'Ashton International',
          summary: 'Ashton International earned promotion to Tier 1 Super League with a dramatic final-over chase!',
        };
      }
      return m;
    }));

    setToastMessage('Playoff match successfully simulated with ball-by-ball resolution!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Super Admin Rollover Execution
  const handleExecuteRollover = () => {
    if (rolloverExecuted) {
      alert('Seasonal rollover has already been finalized for the 2026/2027 season.');
      return;
    }

    const confirmed = window.confirm(
      'SUPER ADMIN CONFIRMATION:\n\nAre you sure you want to finalize the season standings and execute official promotions & demotions?\n\n- Port Shepstone High will be promoted to Tier 1\n- Ashton International will take the playoff promotion berth\n- Clifton School will be relegated to Tier 2\n- Auditable governance seals will be issued to CSA KZN.'
    );

    if (!confirmed) return;

    // Execute swap
    const promotedTeam = tier2Standings[0]; // Port Shepstone
    const relegatedTeam = tier1Standings[tier1Standings.length - 1]; // Clifton

    setRolloverExecuted(true);
    setToastMessage(`🏆 Seasonal Rollover Executed! Promoted: ${promotedTeam.team} to Tier 1. Relegated: ${relegatedTeam.team} to Tier 2.`);
    setTimeout(() => setToastMessage(null), 6000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: D.md,
            background: `${D.emerald}25`,
            border: `1px solid ${D.emerald}`,
            color: D.emerald,
            fontFamily: D.head,
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          }}
        >
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', color: D.emerald, cursor: 'pointer', fontSize: '14px', fontWeight: 800 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>⚔️</span>
            <h2 style={{ fontFamily: D.head, fontSize: '20px', fontWeight: 800, color: D.textPrimary }}>
              Promotion & Demotion Control Room
            </h2>
            <span
              style={{
                padding: '3px 10px',
                borderRadius: D.pill,
                background: `${D.amber}22`,
                color: D.amber,
                border: `1px solid ${D.amber}`,
                fontFamily: D.mono,
                fontSize: '10px',
                fontWeight: 800,
              }}
            >
              CSA LEAGUE REGULATION 2026/27
            </span>
          </div>
          <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted, marginTop: '4px' }}>
            Institutional tier thresholds, automatic promotion cut-offs, relegation danger zones, and playoff bracket simulation.
          </div>
        </div>

        {/* Super Admin Action Button */}
        {currentRole === 'super_admin' && (
          <button
            id="btn-execute-rollover"
            onClick={handleExecuteRollover}
            style={{
              padding: '9px 18px',
              borderRadius: D.pill,
              background: rolloverExecuted ? D.surf2 : `linear-gradient(135deg, ${D.indigo}, ${D.rose})`,
              border: rolloverExecuted ? `1px solid ${D.border}` : 'none',
              color: '#fff',
              fontFamily: D.head,
              fontSize: '12px',
              fontWeight: 800,
              cursor: rolloverExecuted ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: rolloverExecuted ? 'none' : '0 4px 14px rgba(99, 102, 241, 0.35)',
            }}
          >
            <span>{rolloverExecuted ? '🔒 Season Finalized & Rolled Over' : '🚀 Execute Seasonal Rollover & Demotions'}</span>
          </button>
        )}
      </div>

      {/* Tier Switcher & Sub-Navigation */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 16px',
          background: D.surf1,
          borderRadius: D.lg,
          border: `1px solid ${D.border}`,
        }}
      >
        {/* Tier Selector */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTier('tier1')}
            style={{
              padding: '8px 16px',
              borderRadius: D.pill,
              background: activeTier === 'tier1' ? D.amber : D.surf2,
              border: `1px solid ${activeTier === 'tier1' ? D.amber : D.border}`,
              color: activeTier === 'tier1' ? '#000' : D.textPrimary,
              fontFamily: D.head,
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>🏆 Tier 1: Premier Super League</span>
            <span style={{ fontFamily: D.mono, fontSize: '10px' }}>(10 Schools)</span>
          </button>

          <button
            onClick={() => setActiveTier('tier2')}
            style={{
              padding: '8px 16px',
              borderRadius: D.pill,
              background: activeTier === 'tier2' ? D.sky : D.surf2,
              border: `1px solid ${activeTier === 'tier2' ? D.sky : D.border}`,
              color: activeTier === 'tier2' ? '#000' : D.textPrimary,
              fontFamily: D.head,
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>⚡ Tier 2: Coastal Championship</span>
            <span style={{ fontFamily: D.mono, fontSize: '10px' }}>(8 Schools)</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'standings', label: '📊 Table & Boundary Zones' },
            { id: 'playoffs', label: '⚔️ Promotion Playoff Simulator' },
            { id: 'specs', label: '📜 Regulatory Specs & Bylaws' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '6px 14px',
                borderRadius: D.pill,
                background: activeTab === tab.id ? D.indigo : 'transparent',
                border: `1px solid ${activeTab === tab.id ? D.indigo : D.border}`,
                color: activeTab === tab.id ? '#fff' : D.textSecondary,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: activeTab === tab.id ? 800 : 600,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB 1: STANDINGS TABLE & BOUNDARY ZONES ── */}
      {activeTab === 'standings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Visual Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', padding: '10px 16px', background: D.surf1, borderRadius: D.md, border: `1px solid ${D.border}` }}>
            <span style={{ fontFamily: D.head, fontSize: '10px', fontWeight: 800, color: D.textMuted }}>QUALIFICATION ZONES:</span>
            {activeTier === 'tier1' ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: D.body, fontSize: '11px', color: D.emerald }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: D.emerald }} />
                  <span>Title Champions / Safe (1-8)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: D.body, fontSize: '11px', color: D.amber }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: D.amber }} />
                  <span>Relegation Playoff Zone (9th)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: D.body, fontSize: '11px', color: D.rose }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: D.rose }} />
                  <span>Direct Automatic Demotion Zone (10th)</span>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: D.body, fontSize: '11px', color: D.emerald }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: D.emerald }} />
                  <span>Direct Automatic Promotion to Tier 1 (1st)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: D.body, fontSize: '11px', color: D.amber }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: D.amber }} />
                  <span>Promotion Playoff Qualifiers (2nd - 3rd)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: D.border }} />
                  <span>Safe Mid-Division (4th - 6th)</span>
                </div>
              </>
            )}
          </div>

          {/* Standings Table Card */}
          <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${D.border}`, background: D.surf2, textAlign: 'left' }}>
                    <th style={{ padding: '12px 14px', fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>#</th>
                    <th style={{ padding: '12px 14px', fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>INSTITUTION & SQUAD</th>
                    <th style={{ padding: '12px 14px', fontFamily: D.mono, fontSize: '10px', color: D.textMuted, textAlign: 'center' }}>P</th>
                    <th style={{ padding: '12px 14px', fontFamily: D.mono, fontSize: '10px', color: D.textMuted, textAlign: 'center' }}>W</th>
                    <th style={{ padding: '12px 14px', fontFamily: D.mono, fontSize: '10px', color: D.textMuted, textAlign: 'center' }}>L</th>
                    <th style={{ padding: '12px 14px', fontFamily: D.mono, fontSize: '10px', color: D.textMuted, textAlign: 'center' }}>PTS</th>
                    <th style={{ padding: '12px 14px', fontFamily: D.mono, fontSize: '10px', color: D.textMuted, textAlign: 'right' }}>NRR</th>
                    <th style={{ padding: '12px 14px', fontFamily: D.head, fontSize: '10px', color: D.textMuted, textAlign: 'center' }}>FORM</th>
                    <th style={{ padding: '12px 14px', fontFamily: D.head, fontSize: '10px', color: D.textMuted, textAlign: 'center' }}>CRITERIA AUDIT</th>
                    <th style={{ padding: '12px 14px', fontFamily: D.head, fontSize: '10px', color: D.textMuted, textAlign: 'right' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {activeStandings.map((row) => {
                    const isSelectedSchool = row.schoolId === activeSchoolId || row.shortName === activeSchoolId;
                    let zoneColor = 'transparent';
                    let zoneBorder = 'none';

                    if (row.zone === 'auto_promote') {
                      zoneColor = `${D.emerald}10`;
                      zoneBorder = `3px solid ${D.emerald}`;
                    } else if (row.zone === 'playoff_promote') {
                      zoneColor = `${D.amber}10`;
                      zoneBorder = `3px solid ${D.amber}`;
                    } else if (row.zone === 'playoff_relegate') {
                      zoneColor = `${D.amber}15`;
                      zoneBorder = `3px solid ${D.amber}`;
                    } else if (row.zone === 'auto_relegate') {
                      zoneColor = `${D.rose}15`;
                      zoneBorder = `3px solid ${D.rose}`;
                    }

                    return (
                      <tr
                        key={row.team}
                        style={{
                          borderBottom: `1px solid ${D.border}`,
                          background: isSelectedSchool ? `${D.indigo}20` : zoneColor,
                          borderLeft: zoneBorder,
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '12px 14px', fontFamily: D.mono, fontSize: '12px', fontWeight: 800, color: row.rank <= 2 ? D.amber : D.textMuted }}>
                          {row.rank}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: D.textPrimary }}>
                            {row.team}
                            {isSelectedSchool && (
                              <span style={{ marginLeft: '8px', padding: '1px 6px', borderRadius: D.pill, background: D.indigo, color: '#fff', fontSize: '9px', fontWeight: 800 }}>
                                Active School
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', fontFamily: D.mono, fontSize: '12px', textAlign: 'center', color: D.textSecondary }}>{row.P}</td>
                        <td style={{ padding: '12px 14px', fontFamily: D.mono, fontSize: '12px', textAlign: 'center', fontWeight: 700, color: D.emerald }}>{row.W}</td>
                        <td style={{ padding: '12px 14px', fontFamily: D.mono, fontSize: '12px', textAlign: 'center', color: D.rose }}>{row.L}</td>
                        <td style={{ padding: '12px 14px', fontFamily: D.mono, fontSize: '14px', textAlign: 'center', fontWeight: 900, color: D.textPrimary }}>{row.pts}</td>
                        <td style={{ padding: '12px 14px', fontFamily: D.mono, fontSize: '12px', textAlign: 'right', fontWeight: 700, color: row.nrr >= 0 ? D.emerald : D.rose }}>
                          {row.nrr >= 0 ? `+${row.nrr.toFixed(2)}` : row.nrr.toFixed(2)}
                        </td>
                        {/* Form */}
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '3px' }}>
                            {row.form.map((f, i) => (
                              <span
                                key={i}
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '3px',
                                  background: f === 'W' ? `${D.emerald}30` : `${D.rose}30`,
                                  color: f === 'W' ? D.emerald : D.rose,
                                  fontFamily: D.mono,
                                  fontSize: '9px',
                                  fontWeight: 800,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </td>
                        {/* Audit criteria */}
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <span
                            title={row.feederDepthValid && row.facilitiesAuditPass ? 'All criteria verified' : 'Facility or Feeder warning'}
                            style={{
                              padding: '2px 8px',
                              borderRadius: D.pill,
                              background: row.feederDepthValid && row.facilitiesAuditPass ? `${D.emerald}20` : `${D.rose}20`,
                              color: row.feederDepthValid && row.facilitiesAuditPass ? D.emerald : D.rose,
                              fontFamily: D.mono,
                              fontSize: '9px',
                              fontWeight: 800,
                            }}
                          >
                            {row.feederDepthValid && row.facilitiesAuditPass ? 'PASSED ✓' : 'AUDIT WARNING ⚠️'}
                          </span>
                        </td>
                        {/* Status badge */}
                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                          {row.zone === 'auto_promote' && (
                            <span style={{ padding: '3px 8px', borderRadius: D.pill, background: `${D.emerald}25`, color: D.emerald, fontFamily: D.mono, fontSize: '10px', fontWeight: 800 }}>
                              🟢 AUTO PROMOTE
                            </span>
                          )}
                          {row.zone === 'playoff_promote' && (
                            <span style={{ padding: '3px 8px', borderRadius: D.pill, background: `${D.amber}25`, color: D.amber, fontFamily: D.mono, fontSize: '10px', fontWeight: 800 }}>
                              🟡 PLAYOFF BERTH
                            </span>
                          )}
                          {row.zone === 'safe' && (
                            <span style={{ padding: '3px 8px', borderRadius: D.pill, background: D.surf2, color: D.textMuted, fontFamily: D.mono, fontSize: '10px', fontWeight: 600 }}>
                              ⚪ SAFE
                            </span>
                          )}
                          {row.zone === 'playoff_relegate' && (
                            <span style={{ padding: '3px 8px', borderRadius: D.pill, background: `${D.amber}25`, color: D.amber, fontFamily: D.mono, fontSize: '10px', fontWeight: 800 }}>
                              ⚠️ RELEGATION PLAYOFF
                            </span>
                          )}
                          {row.zone === 'auto_relegate' && (
                            <span style={{ padding: '3px 8px', borderRadius: D.pill, background: `${D.rose}25`, color: D.rose, fontFamily: D.mono, fontSize: '10px', fontWeight: 800 }}>
                              🔴 DIRECT DEMOTION
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: PROMOTION PLAYOFF SIMULATOR ── */}
      {activeTab === 'playoffs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '18px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.amber }}>
                ⚔️ ANNUAL PROMOTION & RELEGATION PLAYOFF BRACKET
              </div>
              <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted, marginTop: '2px' }}>
                Knockout playoff series played at neutral venues to decide the final Premier 1st XI berths for 2026/27.
              </div>
            </div>

            <button
              onClick={() => {
                handleSimulatePlayoff('po-1');
                setTimeout(() => handleSimulatePlayoff('po-2'), 400);
                setTimeout(() => handleSimulatePlayoff('po-3'), 800);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: D.pill,
                background: D.amber,
                border: 'none',
                color: '#000',
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              ⚡ Simulate All Playoff Rounds
            </button>
          </div>

          {/* Playoff Matches Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {playoffs.map((match) => (
              <div
                key={match.id}
                style={{
                  padding: '18px',
                  background: D.surf1,
                  borderRadius: D.md,
                  border: `1px solid ${D.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.amber }}>
                    {match.round}
                  </span>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: D.pill,
                      background: match.status === 'Completed' ? `${D.emerald}20` : D.surf2,
                      color: match.status === 'Completed' ? D.emerald : D.textMuted,
                      fontFamily: D.mono,
                      fontSize: '9px',
                      fontWeight: 800,
                    }}
                  >
                    {match.status.toUpperCase()}
                  </span>
                </div>

                {/* Match Box */}
                <div style={{ padding: '12px', background: D.surf2, borderRadius: D.md, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: D.textPrimary }}>
                      {match.homeTeam}
                    </span>
                    <span style={{ fontFamily: D.mono, fontSize: '13px', fontWeight: 800, color: D.emerald }}>
                      {match.homeScore || '—'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: D.textPrimary }}>
                      {match.awayTeam}
                    </span>
                    <span style={{ fontFamily: D.mono, fontSize: '13px', fontWeight: 800, color: D.emerald }}>
                      {match.awayScore || '—'}
                    </span>
                  </div>
                </div>

                {match.summary && (
                  <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary, lineHeight: 1.5, background: `${D.emerald}10`, padding: '8px 10px', borderRadius: D.md }}>
                    <strong>Verdict:</strong> {match.summary}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${D.border}`, paddingTop: '8px' }}>
                  <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                    📍 {match.venue}
                  </span>

                  {match.status === 'Scheduled' ? (
                    <button
                      onClick={() => handleSimulatePlayoff(match.id)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: D.pill,
                        background: D.indigo,
                        border: 'none',
                        color: '#fff',
                        fontFamily: D.head,
                        fontSize: '10px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      Simulate Match
                    </button>
                  ) : (
                    <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.emerald, fontWeight: 700 }}>
                      Winner: {match.winner}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: REGULATORY SPECS & BYLAWS ── */}
      {activeTab === 'specs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '18px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}` }}>
            <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary, marginBottom: '6px' }}>
              OFFICIAL CSA / KZN HIGH SCHOOLS PROMOTION & RELEGATION BYLAWS (2026/27)
            </div>
            <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted, lineHeight: 1.6 }}>
              To safeguard competition integrity, high-performance coaching pathways, and pitch standards, promotion to the Tier 1 Premier League is subject to strict facility, coaching, and feeder-age criteria.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
            {[
              {
                icon: '🌱',
                title: 'FACILITY & TURF PITCH MANDATE',
                spec: 'Certified Bulli Clay Match Strip',
                desc: 'Candidate school must possess a minimum of one certified natural turf wicket (Bulli clay base) with laser-mown grass height ≤4.5mm, 4 turf practice nets, and a digital or mechanical multi-metric scoreboard.',
              },
              {
                icon: '👥',
                title: 'FEEDER AGE-GROUP DEPTH',
                spec: 'Active U14A, U15A, & U16A Teams',
                desc: 'A school cannot compete in Tier 1 with only a 1st XI. The institution must field confirmed teams across U14A, U15A, and U16A to ensure long-term talent cultivation rather than short-term mercenary recruitment.',
              },
              {
                icon: '📜',
                title: 'COACHING CERTIFICATION',
                spec: 'CSA Level 2 or Level 3 Head Coach',
                desc: 'The 1st XI Head Coach must hold an active CSA Level 2 coaching credential or higher, with accredited concussion management and first aid certification on file.',
              },
              {
                icon: '⚖️',
                title: 'SCHOLARSHIP & TRANSFER CAP',
                spec: 'Max 3 Transfers per Annual Intake',
                desc: 'To preserve sporting balance, schools are capped at registering a maximum of 3 external bursary/scholarship transfers per calendar year for the 1st XI squad.',
              },
              {
                icon: '🛡️',
                title: 'GOVERNANCE & DOB VERIFICATION',
                spec: '100% Verified Birth Certificates',
                desc: 'All player registrations must be backed by verified government-issued birth certificates or unabridged IDs. Over-age participation results in automatic forfeit of points and potential demotion.',
              },
              {
                icon: '📺',
                title: 'BROADCAST & DATA COMPLIANCE',
                spec: 'SCRBRD Telemetry & Scoring Integration',
                desc: 'Premier Division matches must be live-scored ball-by-ball on SCRBRD OS, enabling automated wagon wheels, Manhattan charts, and public live match-center feeds for school communities.',
              },
            ].map((spec, i) => (
              <div
                key={i}
                style={{
                  padding: '16px',
                  background: D.surf1,
                  borderRadius: D.md,
                  border: `1px solid ${D.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>{spec.icon}</span>
                  <div>
                    <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.textPrimary }}>
                      {spec.title}
                    </div>
                    <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.emerald, fontWeight: 700 }}>
                      {spec.spec}
                    </div>
                  </div>
                </div>

                <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary, lineHeight: 1.6, marginTop: '4px' }}>
                  {spec.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
