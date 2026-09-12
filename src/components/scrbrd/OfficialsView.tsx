'use client';

import React, { useState } from 'react';
import { Theme } from './types';
import {
  ShieldCheck,
  Award,
  Calendar,
  FileText,
  AlertTriangle,
  DollarSign,
  UserCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Filter,
  Plus,
  Star,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { MATCHES } from './data';

interface OfficialsViewProps {
  theme: Theme;
  currentRole: string;
  onSelectMatch?: (matchId: string) => void;
}

interface Official {
  id: string;
  name: string;
  role: 'Umpire' | 'Referee' | 'Scorer' | 'TV Umpire';
  badge: 'CSA National Panel' | 'CSA Provincial Level 3' | 'CSA Regional Level 2' | 'School Panel Level 1';
  matchesOfficiated: number;
  rating: number; // 1-5
  status: 'Available' | 'Assigned' | 'Resting';
  schoolAffiliation?: string;
  phone: string;
  email: string;
}

const OFFICIALS_ROSTER: Official[] = [
  {
    id: 'off-1',
    name: 'Johan Van Der Merwe',
    role: 'Umpire',
    badge: 'CSA National Panel',
    matchesOfficiated: 142,
    rating: 4.9,
    status: 'Assigned',
    phone: '+27 82 456 7890',
    email: 'j.vandermerwe@csa-umpires.org.za',
  },
  {
    id: 'off-2',
    name: 'Sipho Sithole',
    role: 'Umpire',
    badge: 'CSA Provincial Level 3',
    matchesOfficiated: 88,
    rating: 4.8,
    status: 'Assigned',
    phone: '+27 83 567 8901',
    email: 's.sithole@kzn-cricket.co.za',
  },
  {
    id: 'off-3',
    name: 'Craig Atherton',
    role: 'Referee',
    badge: 'CSA National Panel',
    matchesOfficiated: 210,
    rating: 5.0,
    status: 'Available',
    phone: '+27 82 123 4567',
    email: 'c.atherton@schools-cricket.org.za',
  },
  {
    id: 'off-4',
    name: 'Bongani Khumalo',
    role: 'TV Umpire',
    badge: 'CSA Regional Level 2',
    matchesOfficiated: 45,
    rating: 4.7,
    status: 'Available',
    phone: '+27 84 234 5678',
    email: 'b.khumalo@csa-officials.co.za',
  },
  {
    id: 'off-5',
    name: 'Brenda Mkhize',
    role: 'Scorer',
    badge: 'CSA Provincial Level 3',
    matchesOfficiated: 115,
    rating: 4.95,
    status: 'Assigned',
    phone: '+27 82 987 6543',
    email: 'b.mkhize@scrbrd-scorers.org.za',
  },
];

export default function OfficialsView({
  theme,
  currentRole,
  onSelectMatch,
}: OfficialsViewProps) {
  const [activeTab, setActiveTab] = useState<'appointments' | 'roster' | 'reports' | 'conduct' | 'remuneration'>('appointments');
  const [selectedOfficial, setSelectedOfficial] = useState<Official | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string>(MATCHES[0]?.id || 'm1');

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

  const canManage = currentRole === 'superadmin' || currentRole === 'schooladmin' || currentRole === 'sportsmaster';

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', borderRadius: D.md, background: `${D.indigo}18`, color: D.indigo }}>
            <ShieldCheck size={26} />
          </div>
          <div>
            <h1 style={{ fontFamily: D.head, fontSize: '24px', fontWeight: 700, color: D.textPrimary, margin: 0 }}>
              Match Officials & Umpires
            </h1>
            <p style={{ fontFamily: D.body, fontSize: '13px', color: D.textMuted, margin: '2px 0 0 0' }}>
              CSA Accredited Appointments · Pitch & Outfield Assessment Reports · Disciplinary Logs · Claims Audit
            </p>
          </div>
        </div>

        {canManage && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              style={{
                padding: '8px 14px',
                borderRadius: D.md,
                background: D.indigo,
                border: 'none',
                color: '#ffffff',
                fontFamily: D.head,
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <Plus size={14} />
              Assign Official
            </button>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: `1px solid ${D.border}`, marginBottom: '24px', overflowX: 'auto' }}>
        {[
          { key: 'appointments', label: 'Fixture Appointments', icon: Calendar },
          { key: 'roster', label: 'Officials Directory', icon: UserCheck },
          { key: 'reports', label: 'Pitch & Match Reports', icon: FileText },
          { key: 'conduct', label: 'Code of Conduct Log', icon: AlertTriangle },
          { key: 'remuneration', label: 'Claims & Remuneration', icon: DollarSign },
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
                borderBottom: `2px solid ${isActive ? D.indigo : 'transparent'}`,
                color: isActive ? D.indigo : D.textSecondary,
                fontFamily: D.head,
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                marginBottom: '-1px',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: FIXTURE APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {MATCHES.map((m) => (
              <div
                key={m.id}
                style={{
                  background: D.surf1,
                  borderRadius: D.lg,
                  border: `1px solid ${selectedMatchId === m.id ? D.indigo : D.border}`,
                  padding: '20px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: D.pill,
                        background: m.status === 'live' ? `${D.rose}20` : `${D.surf2}`,
                        color: m.status === 'live' ? D.rose : D.textMuted,
                        fontFamily: D.mono,
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      {m.status} · {m.matchFormat}
                    </span>
                    <h3 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 700, color: D.textPrimary, margin: '6px 0 2px 0' }}>
                      {m.homeTeam} vs {m.awayTeam}
                    </h3>
                    <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                      {m.venue} · {m.date}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedMatchId(m.id);
                      onSelectMatch?.(m.id);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: D.md,
                      background: D.surf2,
                      border: `1px solid ${D.border}`,
                      color: D.textPrimary,
                      fontFamily: D.head,
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    View Card
                  </button>
                </div>

                {/* Assigned Officials Panel */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '14px' }}>
                  <div style={{ padding: '10px 12px', borderRadius: D.md, background: D.surf2, border: `1px solid ${D.border}` }}>
                    <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, textTransform: 'uppercase' }}>On-Field Umpire 1</div>
                    <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, marginTop: '2px' }}>
                      Johan Van Der Merwe
                    </div>
                    <div style={{ fontFamily: D.mono, fontSize: '9px', color: D.indigo }}>CSA National Panel</div>
                  </div>

                  <div style={{ padding: '10px 12px', borderRadius: D.md, background: D.surf2, border: `1px solid ${D.border}` }}>
                    <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, textTransform: 'uppercase' }}>On-Field Umpire 2</div>
                    <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, marginTop: '2px' }}>
                      Sipho Sithole
                    </div>
                    <div style={{ fontFamily: D.mono, fontSize: '9px', color: D.indigo }}>CSA Provincial Level 3</div>
                  </div>

                  <div style={{ padding: '10px 12px', borderRadius: D.md, background: D.surf2, border: `1px solid ${D.border}` }}>
                    <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, textTransform: 'uppercase' }}>Match Referee</div>
                    <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, marginTop: '2px' }}>
                      Craig Atherton
                    </div>
                    <div style={{ fontFamily: D.mono, fontSize: '9px', color: D.gold }}>CSA Commissioner</div>
                  </div>

                  <div style={{ padding: '10px 12px', borderRadius: D.md, background: D.surf2, border: `1px solid ${D.border}` }}>
                    <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, textTransform: 'uppercase' }}>Official Scorer</div>
                    <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, marginTop: '2px' }}>
                      Brenda Mkhize
                    </div>
                    <div style={{ fontFamily: D.mono, fontSize: '9px', color: D.emerald }}>SCRBRD Certified Lead</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar: Compliance & Protocol Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, padding: '18px' }}>
              <h3 style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: D.textPrimary, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color={D.emerald} />
                Appointment Standards
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                <div style={{ padding: '8px', borderRadius: D.md, background: D.surf2 }}>
                  <div style={{ fontWeight: 700, color: D.textPrimary }}>1st XI / Premier Fixtures</div>
                  <div style={{ color: D.textMuted, fontSize: '11px', marginTop: '2px' }}>
                    Requires 2x CSA Level 3+ Independent Umpires + Appointed Referee.
                  </div>
                </div>
                <div style={{ padding: '8px', borderRadius: D.md, background: D.surf2 }}>
                  <div style={{ fontWeight: 700, color: D.textPrimary }}>Junior A Squads (U14A - U16A)</div>
                  <div style={{ color: D.textMuted, fontSize: '11px', marginTop: '2px' }}>
                    Minimum 1x Certified CSA Level 2 Umpire per fixture.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROSTER DIRECTORY */}
      {activeTab === 'roster' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {OFFICIALS_ROSTER.map((off) => (
            <div
              key={off.id}
              style={{
                background: D.surf1,
                borderRadius: D.lg,
                border: `1px solid ${D.border}`,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <h3 style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 700, color: D.textPrimary, margin: 0 }}>
                      {off.name}
                    </h3>
                    <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.indigo, marginTop: '2px' }}>
                      {off.role} · {off.badge}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: D.pill,
                      background: off.status === 'Assigned' ? `${D.emerald}20` : `${D.sky}20`,
                      color: off.status === 'Assigned' ? D.emerald : D.sky,
                      fontFamily: D.mono,
                      fontSize: '10px',
                      fontWeight: 700,
                    }}
                  >
                    {off.status}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '16px', margin: '14px 0', padding: '10px 0', borderTop: `1px solid ${D.border}`, borderBottom: `1px solid ${D.border}` }}>
                  <div>
                    <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>Matches</div>
                    <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 700, color: D.textPrimary }}>{off.matchesOfficiated}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>Rating</div>
                    <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 700, color: D.gold, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={13} fill={D.gold} color={D.gold} />
                      {off.rating.toFixed(1)}
                    </div>
                  </div>
                </div>

                <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>{off.phone}</div>
                  <div>{off.email}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: PITCH & MATCH REPORTS */}
      {activeTab === 'reports' && (
        <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, padding: '24px' }}>
          <h2 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 700, color: D.textPrimary, marginBottom: '16px' }}>
            Official Umpire Match & Ground Assessments
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              {
                match: 'Hilton College vs Michaelhouse (The Oval)',
                umpire: 'Johan Van Der Merwe (CSA National)',
                pitchRating: 'Very Good (Consistent bounce, true carry)',
                outfield: 'Fast & Level (Safe for high-impact diving)',
                spirit: 'Excellent (Zero dissent or code violations)',
                overRate: '+1.5 Overs ahead of schedule',
              },
              {
                match: 'Kearsney College vs Westville Boys (AH Smith Oval)',
                umpire: 'Sipho Sithole (CSA Level 3)',
                pitchRating: 'Good (Slight two-paced bounce early morning)',
                outfield: 'Good (Damp outfield after overnight dew)',
                spirit: 'Satisfactory (1x Warning for excessive appealing)',
                overRate: '-0.8 Overs (Time warning issued to fielding team)',
              },
            ].map((rep, idx) => (
              <div key={idx} style={{ padding: '16px', borderRadius: D.md, background: D.surf2, border: `1px solid ${D.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 700, color: D.textPrimary }}>{rep.match}</div>
                  <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.indigo }}>Assessed by {rep.umpire}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '10px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: D.textMuted }}>Pitch Rating: </span>
                    <strong style={{ color: D.textPrimary }}>{rep.pitchRating}</strong>
                  </div>
                  <div>
                    <span style={{ color: D.textMuted }}>Outfield Condition: </span>
                    <strong style={{ color: D.textPrimary }}>{rep.outfield}</strong>
                  </div>
                  <div>
                    <span style={{ color: D.textMuted }}>Conduct & Spirit: </span>
                    <strong style={{ color: D.emerald }}>{rep.spirit}</strong>
                  </div>
                  <div>
                    <span style={{ color: D.textMuted }}>Over Rate: </span>
                    <strong style={{ color: D.textPrimary }}>{rep.overRate}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CODE OF CONDUCT LOG */}
      {activeTab === 'conduct' && (
        <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, padding: '24px' }}>
          <h2 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 700, color: D.textPrimary, marginBottom: '16px' }}>
            Disciplinary & Code of Conduct Audit Log
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: D.surf2, borderBottom: `1px solid ${D.border}` }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', color: D.textMuted }}>Date / Match</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', color: D.textMuted }}>Individual / Role</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', color: D.textMuted }}>Incident Description</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', color: D.textMuted }}>Level</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', color: D.textMuted }}>Sanction / Resolution</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '12px 14px', color: D.textPrimary }}>15 Feb · MHS vs Kearsney</td>
                <td style={{ padding: '12px 14px', color: D.textSecondary }}>Opening Bowler (#4)</td>
                <td style={{ padding: '12px 14px', color: D.textSecondary }}>Aggressive send-off gesture towards dismissed batter.</td>
                <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                  <span style={{ padding: '2px 6px', borderRadius: D.pill, background: `${D.amber}20`, color: D.amber, fontWeight: 700 }}>
                    Level 1
                  </span>
                </td>
                <td style={{ padding: '12px 14px', textAlign: 'right', color: D.textMuted }}>Official Warning & Reprimand</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: REMUNERATION & CLAIMS */}
      {activeTab === 'remuneration' && (
        <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, padding: '24px' }}>
          <h2 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 700, color: D.textPrimary, marginBottom: '16px' }}>
            Officials Fee & Travel Allowance Audit
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={{ padding: '16px', borderRadius: D.md, background: D.surf2 }}>
              <div style={{ fontSize: '11px', color: D.textMuted }}>Total Match Fees Approved (YTD)</div>
              <div style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 700, color: D.emerald, marginTop: '4px' }}>R 48,250.00</div>
            </div>
            <div style={{ padding: '16px', borderRadius: D.md, background: D.surf2 }}>
              <div style={{ fontSize: '11px', color: D.textMuted }}>Pending Bursar Claims</div>
              <div style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 700, color: D.amber, marginTop: '4px' }}>R 4,800.00</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
