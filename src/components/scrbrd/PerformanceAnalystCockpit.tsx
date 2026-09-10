'use client';

import React, { useState } from 'react';
import { Theme } from './types';
import { SCHOOLS_REGISTRY } from './data';

interface PerformanceAnalystCockpitProps {
  theme: Theme;
  activeSchoolId?: string;
}

type ShotType = 'all' | 'cover_drive' | 'pull_hook' | 'cut' | 'sweep' | 'flick' | 'straight_loft' | 'edges';
type DeliveryFilter = 'all' | 'dots' | 'wickets' | 'boundaries' | 'false_shots';

interface ShotMetric {
  type: ShotType;
  label: string;
  runs: number;
  balls: number;
  strikeRate: number;
  boundaryPct: number;
  dismissals: number;
  color: string;
}

const SHOT_METRICS: ShotMetric[] = [
  { type: 'cover_drive', label: 'Cover Drive / Off-Drive', runs: 84, balls: 58, strikeRate: 144.8, boundaryPct: 62, dismissals: 2, color: '#38bdf8' },
  { type: 'pull_hook', label: 'Pull / Hook Shot', runs: 68, balls: 36, strikeRate: 188.9, boundaryPct: 78, dismissals: 1, color: '#f59e0b' },
  { type: 'cut', label: 'Square Cut / Late Cut', runs: 42, balls: 28, strikeRate: 150.0, boundaryPct: 57, dismissals: 1, color: '#10b981' },
  { type: 'flick', label: 'Mid-Wicket Flick / Clip', runs: 56, balls: 41, strikeRate: 136.6, boundaryPct: 43, dismissals: 0, color: '#a855f7' },
  { type: 'straight_loft', label: 'Straight Loft / V', runs: 48, balls: 24, strikeRate: 200.0, boundaryPct: 83, dismissals: 1, color: '#ec4899' },
  { type: 'sweep', label: 'Sweep & Reverse Sweep', runs: 31, balls: 22, strikeRate: 140.9, boundaryPct: 52, dismissals: 2, color: '#06b6d4' },
  { type: 'edges', label: 'False Shots & Edges', runs: 14, balls: 26, strikeRate: 53.8, boundaryPct: 15, dismissals: 4, color: '#ef4444' },
];

export default function PerformanceAnalystCockpit({
  theme: D,
  activeSchoolId = 'WES',
}: PerformanceAnalystCockpitProps) {
  const [activeSubTab, setActiveSubTab] = useState<'pitch_grid' | 'shot_wagon' | 'opposition_scout' | 'phase_splits'>('pitch_grid');
  const [selectedShotType, setSelectedShotType] = useState<ShotType>('all');
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryFilter>('all');
  const [selectedOpponent, setSelectedOpponent] = useState<string>('hilton');
  const [selectedLengthZone, setSelectedLengthZone] = useState<string>('good_length');
  const [selectedLineChannel, setSelectedLineChannel] = useState<string>('4th_stump');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Pitch Grid Delivery Cells (5 lines x 4 lengths)
  const LENGTH_ZONES = [
    { id: 'yorker', label: 'Full / Yorker (0-2m)', desc: 'Toe-crusher / Full Drive Zone' },
    { id: 'good_length', label: 'Good Length (4-6m)', desc: 'Top of Off-Stump Corridor' },
    { id: 'back_of_length', label: 'Back of a Length (6-8m)', desc: 'Hip / Ribcage Bounce' },
    { id: 'short', label: 'Short / Bouncer (8m+)', desc: 'Helmet / Shoulder Height' },
  ];

  const LINE_CHANNELS = [
    { id: 'wide_off', label: 'Wide Outside Off', angle: '6th+ Stump' },
    { id: '4th_stump', label: '4th/5th Stump Corridor', angle: 'Uncertainty Channel' },
    { id: 'off_stump', label: 'Off Stump', angle: 'Direct Stumps' },
    { id: 'middle_leg', label: 'Middle & Leg', angle: 'Bodyline Line' },
    { id: 'down_leg', label: 'Down Legside', angle: 'Strays Down Leg' },
  ];

  // Tactical Opponents
  const OPPONENTS = [
    {
      id: 'hilton',
      school: 'Hilton College 1st XI',
      ground: 'Weightman-Smith Oval',
      captain: 'Jonathan van Zyl',
      tacticalThreat: 'Aggressive top 3; explosive against medium-pace within Powerplay (8.8 RPO).',
      vulnerability: 'Struggles against left-arm orthodox bowling in overs 7-12 (SR drops to 104, dot % rises to 44%).',
      strikeBowler: 'K. Henderson (Right-arm Fast, 131 km/h steep bouncer on 4th stump).',
      fieldKey: 'Keep backward point fine; pack the cover ring to prevent boundary drives.',
    },
    {
      id: 'northwood',
      school: 'Northwood School 1st XI',
      ground: 'Northwood Main Oval',
      captain: 'Ryan Brand',
      tacticalThreat: 'Ryan Brand sets heavy anchor (avg 54.2), punishing any half-volleys through extra cover.',
      vulnerability: 'Top order vulnerable to late in-swing targeting pads between overs 1-4.',
      strikeBowler: 'L. Marais (Left-arm swing bowler, sharp angle across right-handers).',
      fieldKey: 'Set deep mid-wicket & long-on for Brand; bowl tight fuller back of length.',
    },
    {
      id: 'kearsney',
      school: 'Kearsney College 1st XI',
      ground: 'AH Smith Oval',
      captain: 'Ross Coetzee',
      tacticalThreat: 'Dynamic stroke-play all 360 degrees; high aerial boundary conversion rate (24% of runs).',
      vulnerability: 'High false shot frequency against slow flighted leg-spin when forced to cross-bat.',
      strikeBowler: 'M. Botha (Right-arm Off-break, clever arm-ball drifting into off-stump).',
      fieldKey: 'Post sweeper cover early; place short fine leg for the lap sweep.',
    },
  ];

  const currentOpponent = OPPONENTS.find(o => o.id === selectedOpponent) || OPPONENTS[0];

  const handleExportDossier = () => {
    setExportNotice(`📊 Performance Dossier for ${currentOpponent.school} exported to CSV & Analyst Binder!`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notice */}
      {exportNotice && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: D.md,
            background: `${D.sky}25`,
            border: `1px solid ${D.sky}`,
            color: D.sky,
            fontFamily: D.head,
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          <span>{exportNotice}</span>
          <button
            onClick={() => setExportNotice(null)}
            style={{ background: 'none', border: 'none', color: D.sky, cursor: 'pointer', fontSize: '14px', fontWeight: 800 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🔬</span>
            <h2 style={{ fontFamily: D.head, fontSize: '20px', fontWeight: 800, color: D.textPrimary }}>
              Performance Analyst Tactical Cockpit
            </h2>
            <span
              style={{
                padding: '3px 10px',
                borderRadius: D.pill,
                background: `${D.sky}22`,
                color: D.sky,
                border: `1px solid ${D.sky}`,
                fontFamily: D.mono,
                fontSize: '10px',
                fontWeight: 800,
              }}
            >
              CSA HIGH-PERFORMANCE SUITE
            </span>
          </div>
          <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted, marginTop: '4px' }}>
            Advanced analytical tools: Hawk-Eye pitch landing density, shot-type wagon wheel filters, opposition pre-scout dossiers, and phase dynamics.
          </div>
        </div>

        <button
          onClick={handleExportDossier}
          style={{
            padding: '9px 18px',
            borderRadius: D.pill,
            background: D.sky,
            border: 'none',
            color: '#000',
            fontFamily: D.head,
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 10px rgba(56, 189, 248, 0.3)',
          }}
        >
          <span>📥</span>
          <span>Export Analyst Tactical Dossier</span>
        </button>
      </div>

      {/* Analyst Tools Sub-Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '10px 14px',
          background: D.surf1,
          borderRadius: D.lg,
          border: `1px solid ${D.border}`,
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'pitch_grid', label: '🎯 Hawk-Eye Pitch Landing Grid (Line & Length)' },
          { id: 'shot_wagon', label: '🏏 Shot-Type Filtered 360° Wagon Wheel' },
          { id: 'opposition_scout', label: '📋 Opposition Pre-Scout Tactical Dossier' },
          { id: 'phase_splits', label: '⏱️ Phase-of-Play Run Rate & Dot Pressure Index' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            style={{
              padding: '8px 16px',
              borderRadius: D.pill,
              background: activeSubTab === tab.id ? D.sky : 'transparent',
              border: `1px solid ${activeSubTab === tab.id ? D.sky : D.border}`,
              color: activeSubTab === tab.id ? '#000' : D.textSecondary,
              fontFamily: D.head,
              fontSize: '11px',
              fontWeight: activeSubTab === tab.id ? 800 : 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TOOL 1: HAWK-EYE PITCH LANDING GRID ── */}
      {activeSubTab === 'pitch_grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 320px', gap: '18px' }}>
          {/* Main Pitch Landing Grid View */}
          <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800, color: D.textPrimary }}>
                  DELIVERY LANDING HEATMAP (22-YARD STRIP)
                </div>
                <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                  Delivery impact density by line channel and length zone. Click any zone to inspect ball counts.
                </div>
              </div>

              {/* Delivery Outcome Filter */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['all', 'dots', 'wickets', 'boundaries', 'false_shots'] as DeliveryFilter[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setDeliveryFilter(f)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: D.pill,
                      background: deliveryFilter === f ? D.indigo : D.surf2,
                      border: `1px solid ${deliveryFilter === f ? D.indigo : D.border}`,
                      color: deliveryFilter === f ? '#fff' : D.textMuted,
                      fontFamily: D.mono,
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {f.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Pitch Visual Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}` }}>
              {/* Batting Crease Marker */}
              <div style={{ textAlign: 'center', fontFamily: D.mono, fontSize: '10px', color: D.textMuted, borderBottom: `2px dashed ${D.emerald}`, paddingBottom: '4px' }}>
                --- POPPING CREASE (BATSMAN STANCE) ---
              </div>

              {/* 4 Length Zones */}
              {LENGTH_ZONES.map(length => (
                <div key={length.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>
                    <span>{length.label}</span>
                    <span style={{ fontFamily: D.mono }}>{length.desc}</span>
                  </div>

                  {/* 5 Line Channels Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                    {LINE_CHANNELS.map(line => {
                      const isSelected = selectedLengthZone === length.id && selectedLineChannel === line.id;
                      // Dynamic balls calculation based on zone
                      let balls = 12;
                      if (length.id === 'good_length' && line.id === '4th_stump') balls = 38;
                      else if (length.id === 'good_length' && line.id === 'off_stump') balls = 31;
                      else if (length.id === 'back_of_length' && line.id === 'middle_leg') balls = 24;
                      else if (length.id === 'short') balls = 8;

                      // Color density
                      const intensity = Math.min(balls / 40, 1);
                      const bgColor = isSelected ? D.sky : `rgba(56, 189, 248, ${0.1 + intensity * 0.4})`;

                      return (
                        <button
                          key={line.id}
                          onClick={() => {
                            setSelectedLengthZone(length.id);
                            setSelectedLineChannel(line.id);
                          }}
                          style={{
                            padding: '12px 6px',
                            borderRadius: D.md,
                            background: bgColor,
                            border: `1px solid ${isSelected ? D.sky : D.border}`,
                            color: isSelected ? '#000' : D.textPrimary,
                            textAlign: 'center',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span style={{ fontFamily: D.mono, fontSize: '14px', fontWeight: 900 }}>
                            {balls}
                          </span>
                          <span style={{ fontFamily: D.body, fontSize: '9px', opacity: 0.85 }}>
                            balls
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Bowling Crease Marker */}
              <div style={{ textAlign: 'center', fontFamily: D.mono, fontSize: '10px', color: D.textMuted, borderTop: `2px dashed ${D.textMuted}`, paddingTop: '4px', marginTop: '4px' }}>
                --- BOWLER RUN-UP RELEASE POINT (22 YARDS) ---
              </div>
            </div>

            {/* Line Headers Legend */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', textAlign: 'center' }}>
              {LINE_CHANNELS.map(c => (
                <div key={c.id} style={{ fontFamily: D.mono, fontSize: '9px', color: D.textMuted }}>
                  {c.label}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Zone Inspection Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '18px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.sky }}>
                SELECTED CHANNEL TELEMETRY
              </div>

              <div style={{ padding: '12px', background: D.surf2, borderRadius: D.md, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>TARGET CHANNEL:</div>
                <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary }}>
                  {LINE_CHANNELS.find(l => l.id === selectedLineChannel)?.label}
                </div>
                <div style={{ fontFamily: D.body, fontSize: '11px', color: D.emerald, fontWeight: 700 }}>
                  {LENGTH_ZONES.find(lz => lz.id === selectedLengthZone)?.label}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <div style={{ padding: '10px', background: D.surf2, borderRadius: D.md, textAlign: 'center' }}>
                  <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>DOT BALL %</div>
                  <div style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 900, color: D.emerald, marginTop: '2px' }}>64.2%</div>
                </div>
                <div style={{ padding: '10px', background: D.surf2, borderRadius: D.md, textAlign: 'center' }}>
                  <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>FALSE SHOT %</div>
                  <div style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 900, color: D.amber, marginTop: '2px' }}>28.5%</div>
                </div>
                <div style={{ padding: '10px', background: D.surf2, borderRadius: D.md, textAlign: 'center' }}>
                  <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>ECONOMY RATE</div>
                  <div style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 900, color: D.sky, marginTop: '2px' }}>4.85</div>
                </div>
                <div style={{ padding: '10px', background: D.surf2, borderRadius: D.md, textAlign: 'center' }}>
                  <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>WICKETS INDUCED</div>
                  <div style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 900, color: D.rose, marginTop: '2px' }}>5 wkts</div>
                </div>
              </div>

              <div style={{ padding: '12px', background: `${D.emerald}10`, borderRadius: D.md, fontFamily: D.body, fontSize: '11px', color: D.textSecondary, lineHeight: 1.5 }}>
                <strong>Analyst Strategy Note:</strong> Bowlers hitting the 4th stump good-length zone generate highest edge probability (28.5%). Maintain 2 slips and a gully when bowling to top order.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TOOL 2: SHOT-TYPE FILTERED WAGON WHEEL ── */}
      {activeSubTab === 'shot_wagon' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 340px', gap: '18px' }}>
          {/* Shot Wagon Canvas Simulation */}
          <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800, color: D.textPrimary }}>
                  360° SHOT TRAJECTORY & RADIAL VELOCITY
                </div>
                <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                  Filter scoring arcs by technical shot category to evaluate batsman risk vs boundary efficiency.
                </div>
              </div>

              <span style={{ padding: '4px 10px', borderRadius: D.pill, background: `${D.emerald}20`, color: D.emerald, fontFamily: D.mono, fontSize: '11px', fontWeight: 700 }}>
                Filter: {selectedShotType.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {/* Shot Type Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <button
                onClick={() => setSelectedShotType('all')}
                style={{
                  padding: '6px 12px',
                  borderRadius: D.pill,
                  background: selectedShotType === 'all' ? D.emerald : D.surf2,
                  border: `1px solid ${selectedShotType === 'all' ? D.emerald : D.border}`,
                  color: selectedShotType === 'all' ? '#fff' : D.textSecondary,
                  fontFamily: D.head,
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                All 360° Strokes (343 runs)
              </button>
              {SHOT_METRICS.map(m => (
                <button
                  key={m.type}
                  onClick={() => setSelectedShotType(m.type)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: D.pill,
                    background: selectedShotType === m.type ? m.color : D.surf2,
                    border: `1px solid ${selectedShotType === m.type ? m.color : D.border}`,
                    color: selectedShotType === m.type ? '#000' : D.textSecondary,
                    fontFamily: D.head,
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {m.label} ({m.runs}r)
                </button>
              ))}
            </div>

            {/* 360 Oval Visualizer Graphic */}
            <div
              style={{
                height: '320px',
                borderRadius: D.md,
                background: `radial-gradient(circle at center, ${D.surf2} 0%, ${D.surf1} 85%)`,
                border: `1px solid ${D.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Boundary Oval Ring */}
              <div
                style={{
                  width: '280px',
                  height: '280px',
                  borderRadius: '50%',
                  border: `2px dashed ${D.border}`,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* 30-yard Circle */}
                <div
                  style={{
                    width: '140px',
                    height: '140px',
                    borderRadius: '50%',
                    border: `1px solid ${D.border}`,
                    position: 'absolute',
                  }}
                />
                {/* Centre Pitch */}
                <div
                  style={{
                    width: '16px',
                    height: '36px',
                    borderRadius: '2px',
                    background: D.amber,
                    position: 'absolute',
                  }}
                />
              </div>

              {/* Dynamic Shot Lines Simulation */}
              <svg width="280" height="280" style={{ position: 'absolute' }}>
                {(selectedShotType === 'all' || selectedShotType === 'cover_drive') && (
                  <>
                    <line x1="140" y1="140" x2="60" y2="70" stroke="#38bdf8" strokeWidth="2.5" />
                    <line x1="140" y1="140" x2="40" y2="90" stroke="#38bdf8" strokeWidth="2" />
                    <line x1="140" y1="140" x2="70" y2="50" stroke="#38bdf8" strokeWidth="3" />
                  </>
                )}
                {(selectedShotType === 'all' || selectedShotType === 'straight_loft') && (
                  <>
                    <line x1="140" y1="140" x2="140" y2="10" stroke="#ec4899" strokeWidth="3" />
                    <line x1="140" y1="140" x2="160" y2="20" stroke="#ec4899" strokeWidth="2" />
                  </>
                )}
                {(selectedShotType === 'all' || selectedShotType === 'pull_hook') && (
                  <>
                    <line x1="140" y1="140" x2="230" y2="70" stroke="#f59e0b" strokeWidth="3" />
                    <line x1="140" y1="140" x2="260" y2="100" stroke="#f59e0b" strokeWidth="2.5" />
                    <line x1="140" y1="140" x2="220" y2="60" stroke="#f59e0b" strokeWidth="2" />
                  </>
                )}
                {(selectedShotType === 'all' || selectedShotType === 'flick') && (
                  <>
                    <line x1="140" y1="140" x2="240" y2="170" stroke="#a855f7" strokeWidth="2" />
                    <line x1="140" y1="140" x2="210" y2="210" stroke="#a855f7" strokeWidth="2" />
                  </>
                )}
                {(selectedShotType === 'all' || selectedShotType === 'cut') && (
                  <>
                    <line x1="140" y1="140" x2="30" y2="140" stroke="#10b981" strokeWidth="2.5" />
                    <line x1="140" y1="140" x2="50" y2="180" stroke="#10b981" strokeWidth="2" />
                  </>
                )}
                {(selectedShotType === 'all' || selectedShotType === 'sweep') && (
                  <line x1="140" y1="140" x2="220" y2="230" stroke="#06b6d4" strokeWidth="2" />
                )}
                {(selectedShotType === 'all' || selectedShotType === 'edges') && (
                  <>
                    <line x1="140" y1="140" x2="80" y2="220" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" />
                    <line x1="140" y1="140" x2="60" y2="200" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" />
                  </>
                )}
              </svg>

              <div style={{ position: 'absolute', bottom: '8px', left: '10px', fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                Ground: Bowden's Field Oval (68m Boundaries)
              </div>
            </div>
          </div>

          {/* Right Column: Shot Matrix Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '18px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
                SHOT BREAKDOWN & RISK PROFILE
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {SHOT_METRICS.map(m => (
                  <div
                    key={m.type}
                    onClick={() => setSelectedShotType(m.type)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: D.md,
                      background: selectedShotType === m.type ? `${m.color}20` : D.surf2,
                      border: `1px solid ${selectedShotType === m.type ? m.color : D.border}`,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: m.color }}>
                        {m.label}
                      </span>
                      <span style={{ fontFamily: D.mono, fontSize: '12px', fontWeight: 800, color: D.textPrimary }}>
                        {m.runs} runs ({m.balls}b)
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                      <span>SR: {m.strikeRate}</span>
                      <span>Boundary: {m.boundaryPct}%</span>
                      <span style={{ color: m.dismissals > 0 ? D.rose : D.emerald }}>
                        Out: {m.dismissals}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TOOL 3: OPPOSITION PRE-SCOUT DOSSIER ── */}
      {activeSubTab === 'opposition_scout' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '18px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textMuted }}>SELECT OPPONENT:</span>
              <select
                value={selectedOpponent}
                onChange={(e) => setSelectedOpponent(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: D.pill,
                  background: D.surf2,
                  border: `1px solid ${D.border}`,
                  color: D.textPrimary,
                  fontFamily: D.head,
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {OPPONENTS.map(o => (
                  <option key={o.id} value={o.id}>{o.school}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportDossier}
              style={{
                padding: '8px 16px',
                borderRadius: D.pill,
                background: D.sky,
                border: 'none',
                color: '#000',
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              📥 Export Tactical Plan
            </button>
          </div>

          {/* Dossier Card */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '20px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.rose }}>
                ⚠️ KEY BATTING THREATS
              </div>
              <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textSecondary, lineHeight: 1.6 }}>
                {currentOpponent.tacticalThreat}
              </div>
              <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, borderTop: `1px solid ${D.border}`, paddingTop: '8px' }}>
                Opposition Captain: {currentOpponent.captain}
              </div>
            </div>

            <div style={{ padding: '20px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.emerald }}>
                🎯 EXPLOITABLE VULNERABILITIES
              </div>
              <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textSecondary, lineHeight: 1.6 }}>
                {currentOpponent.vulnerability}
              </div>
              <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.emerald, borderTop: `1px solid ${D.border}`, paddingTop: '8px', fontWeight: 700 }}>
                Analyst Edge: Introduce spin by over 6
              </div>
            </div>

            <div style={{ padding: '20px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.amber }}>
                ⚡ STRIKE BOWLER PROFILE
              </div>
              <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textSecondary, lineHeight: 1.6 }}>
                {currentOpponent.strikeBowler}
              </div>
              <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, borderTop: `1px solid ${D.border}`, paddingTop: '8px' }}>
                Home Ground: {currentOpponent.ground}
              </div>
            </div>

            <div style={{ padding: '20px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.sky }}>
                📐 RECOMMENDED FIELD PLACEMENT
              </div>
              <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textSecondary, lineHeight: 1.6 }}>
                {currentOpponent.fieldKey}
              </div>
              <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.sky, borderTop: `1px solid ${D.border}`, paddingTop: '8px', fontWeight: 700 }}>
                Tactics signed off by 1st XI Performance Analyst
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TOOL 4: PHASE-OF-PLAY RUN RATE & DOT PRESSURE ── */}
      {activeSubTab === 'phase_splits' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {[
            { phase: 'POWERPLAY (OVERS 1-6)', rpo: '8.4 RPO', dots: '46% Dots', wickets: '1.2 wkts', runs: '50.4 avg', status: 'High Intent', desc: 'Attacking field restrictions; 2 fielders outside 30-yard ring.' },
            { phase: 'MIDDLE CONSOLIDATION (7-15)', rpo: '6.8 RPO', dots: '38% Dots', wickets: '2.4 wkts', runs: '61.2 avg', status: 'Strike Rotation', desc: 'Spin-heavy phase; running between wickets crucial to maintain pressure.' },
            { phase: 'DEATH ACCELERATION (16-20)', rpo: '10.8 RPO', dots: '29% Dots', wickets: '3.1 wkts', runs: '54.0 avg', status: 'Maximum Ramp', desc: 'Full yorkers and wide slower balls essential to restrict boundaries.' },
          ].map((phase, idx) => (
            <div
              key={idx}
              style={{
                padding: '20px',
                background: D.surf1,
                borderRadius: D.lg,
                border: `1px solid ${D.border}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.sky }}>
                  {phase.phase}
                </span>
                <span style={{ padding: '2px 8px', borderRadius: D.pill, background: `${D.emerald}20`, color: D.emerald, fontFamily: D.mono, fontSize: '10px', fontWeight: 700 }}>
                  {phase.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', padding: '12px', background: D.surf2, borderRadius: D.md }}>
                <div>
                  <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>RUN RATE</div>
                  <div style={{ fontFamily: D.mono, fontSize: '18px', fontWeight: 900, color: D.textPrimary, marginTop: '2px' }}>{phase.rpo}</div>
                </div>
                <div>
                  <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>DOT BALL %</div>
                  <div style={{ fontFamily: D.mono, fontSize: '18px', fontWeight: 900, color: D.amber, marginTop: '2px' }}>{phase.dots}</div>
                </div>
              </div>

              <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary, lineHeight: 1.5 }}>
                {phase.desc}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
