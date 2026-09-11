'use client';

import React, { useState } from 'react';
import { Theme } from './types';
import { SCHOOLS_REGISTRY } from './data';
import { OPPOSITION_DOSSIERS, OppositionDossier, BatterScoutProfile, BowlerScoutProfile } from './oppositionScoutingData';

interface PerformanceAnalystCockpitProps {
  theme: Theme;
  activeSchoolId?: string;
}

type ShotType = 'all' | 'cover_drive' | 'pull_hook' | 'cut' | 'sweep' | 'flick' | 'straight_loft' | 'edges';
type DeliveryFilter = 'all' | 'dots' | 'wickets' | 'boundaries' | 'false_shots';
type PitchCondition = 'morning_seam' | 'dry_spin' | 'flat_road' | 'overcast_swing';

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
  const [selectedOpponentId, setSelectedOpponentId] = useState<string>('hilton');
  const [selectedBatterId, setSelectedBatterId] = useState<string>('h_bat_1');
  const [selectedPitchCondition, setSelectedPitchCondition] = useState<PitchCondition>('morning_seam');
  const [customCoachNotes, setCustomCoachNotes] = useState<Record<string, string>>({
    hilton: 'Keep ball dry in first session; target Jonathan van Zyl early with away swing on 4th stump.',
    bishops: 'Boundary dimensions are short square on Frank Reid Oval; pack leg-side ring for Joseph.',
    rondebosch: 'Daniel Bosman susceptible to heavy bouncer early in his innings at Tinker\'s Oval.',
    sacs: 'Spin choke in overs 8-16 will generate dot ball frustration and false shots.',
  });
  const [activeNoteText, setActiveNoteText] = useState<string>('');
  const [isDossierModalOpen, setIsDossierModalOpen] = useState<boolean>(false);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState<boolean>(false);
  const [generatedBriefing, setGeneratedBriefing] = useState<string | null>(null);
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

  const currentDossier: OppositionDossier = OPPOSITION_DOSSIERS.find(d => d.id === selectedOpponentId) || OPPOSITION_DOSSIERS[0];
  const activeBatter: BatterScoutProfile = currentDossier.batters.find(b => b.id === selectedBatterId) || currentDossier.batters[0] || {
    id: 'default',
    name: 'Top Batsman',
    number: 1,
    role: 'Opener',
    battingStance: 'RHB',
    seasonAvg: 45.0,
    strikeRate: 130.0,
    boundaryPct: 50,
    dotBallPct: 40,
    primaryScoringZone: 'Cover & Point',
    keyWeakness: 'Outside off-stump movement',
    tacticalPlan: 'Bowl 4th stump good length',
    recommendedField: 'Standard Attacking Ring',
    recommendedBowlerType: 'Right-arm Fast Outswing',
    dismissalsByBowlingType: {
      rightArmPace: { dismissals: 3, avg: 30.0, dotPct: 40 },
      leftArmPace: { dismissals: 2, avg: 35.0, dotPct: 35 },
      offSpin: { dismissals: 1, avg: 45.0, dotPct: 30 },
      legSpin: { dismissals: 2, avg: 25.0, dotPct: 45 },
      leftArmOrthodox: { dismissals: 3, avg: 20.0, dotPct: 50 },
    },
    pitchVulnerabilityHotspot: { line: '4th_stump', length: 'good_length', riskPct: 75 },
  };

  const handleSelectOpponent = (oppId: string) => {
    setSelectedOpponentId(oppId);
    const opp = OPPOSITION_DOSSIERS.find(d => d.id === oppId);
    if (opp && opp.batters.length > 0) {
      setSelectedBatterId(opp.batters[0].id);
    }
    setGeneratedBriefing(null);
  };

  const handleSynthesizeBriefing = () => {
    setIsGeneratingBrief(true);
    setTimeout(() => {
      let conditionText = '';
      if (selectedPitchCondition === 'morning_seam') {
        conditionText = 'Early morning moisture provides lateral seam deviation (+1.8°). Fast bowlers must hit the deck on a 4th stump good length with 2 slips in the first 8 overs.';
      } else if (selectedPitchCondition === 'dry_spin') {
        conditionText = 'Abrasive surface offering significant turn (+3.4°). Introduce spinners by over 6, bowl wider lines to force batters to drive against turn into catching covers.';
      } else if (selectedPitchCondition === 'flat_road') {
        conditionText = 'True bounce favoring strokeplay. Take pace off using wide knuckle balls and back-of-a-length cutters. Protect boundaries with deep cover and cow corner.';
      } else {
        conditionText = 'Heavy cloud cover and atmospheric humidity. Maintain full pitched swing bowling; target pads for LBW and post 3 slips for edge catches.';
      }

      const briefing = `🎯 TACTICAL MATCH BRIEFING vs ${currentDossier.schoolName.toUpperCase()}\nCondition Profile: ${selectedPitchCondition.replace('_', ' ').toUpperCase()}\n\n1. PRIMARY THREAT: ${currentDossier.keyBattingThreatsSummary}\n2. STRATEGIC EXPLOIT: ${currentDossier.exploitableVulnerabilitiesSummary}\n3. PITCH TACTIC: ${conditionText}\n4. CAPTAIN'S DIRECTIVE: Deploy "${activeBatter.recommendedField}" against ${activeBatter.name} and target with ${activeBatter.recommendedBowlerType}.`;
      setGeneratedBriefing(briefing);
      setIsGeneratingBrief(false);
    }, 600);
  };

  const handleSaveCoachNote = () => {
    if (!activeNoteText.trim()) return;
    setCustomCoachNotes(prev => ({ ...prev, [selectedOpponentId]: activeNoteText }));
    setExportNotice(`💾 Coach tactical note saved for ${currentDossier.shortName}!`);
    setTimeout(() => setExportNotice(null), 3500);
  };

  const handleExportDossier = () => {
    setExportNotice(`📊 Performance Dossier for ${currentDossier.schoolName} exported to Coach Binder & Printable Tablet Card!`);
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

      {/* ── TOOL 3: OPPOSITION PRE-SCOUT DOSSIER GENERATOR ── */}
      {activeSubTab === 'opposition_scout' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Control Bar: Select Opposition & Pitch Condition */}
          <div
            style={{
              padding: '18px 20px',
              background: D.surf1,
              borderRadius: D.lg,
              border: `1px solid ${D.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 800, color: D.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Target Opposition:
                </span>
                <select
                  value={selectedOpponentId}
                  onChange={(e) => handleSelectOpponent(e.target.value)}
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
                    outline: 'none',
                  }}
                >
                  {OPPOSITION_DOSSIERS.map(d => (
                    <option key={d.id} value={d.id}>{d.schoolName}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 800, color: D.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Pitch Environment:
                </span>
                <select
                  value={selectedPitchCondition}
                  onChange={(e) => setSelectedPitchCondition(e.target.value as PitchCondition)}
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
                    outline: 'none',
                  }}
                >
                  <option value="morning_seam">🌿 Morning Seam (+1.8° Dev)</option>
                  <option value="dry_spin">🌪️ Dry Turning Track (+3.4° Spin)</option>
                  <option value="overcast_swing">☁️ Overcast Swing & Inswing</option>
                  <option value="flat_road">🛣️ Flat Highway / High Bounce</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSynthesizeBriefing}
                disabled={isGeneratingBrief}
                style={{
                  padding: '9px 16px',
                  borderRadius: D.pill,
                  background: `${D.amber}20`,
                  border: `1px solid ${D.amber}`,
                  color: D.amber,
                  fontFamily: D.head,
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: isGeneratingBrief ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>⚡</span>
                <span>{isGeneratingBrief ? 'Analyzing Telemetry...' : 'Synthesize Battle Plan'}</span>
              </button>

              <button
                onClick={() => setIsDossierModalOpen(true)}
                style={{
                  padding: '9px 18px',
                  borderRadius: D.pill,
                  background: D.sky,
                  border: 'none',
                  color: '#000',
                  fontFamily: D.head,
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(56, 189, 248, 0.3)',
                }}
              >
                <span>📋</span>
                <span>Printable Dossier Brief</span>
              </button>
            </div>
          </div>

          {/* Opposition Header Summary Card */}
          <div
            style={{
              padding: '22px 24px',
              background: D.surf1,
              borderRadius: D.lg,
              border: `1px solid ${D.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: currentDossier.accentColor }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: currentDossier.accentColor,
                      boxShadow: `0 0 10px ${currentDossier.accentColor}`,
                    }}
                  />
                  <h3 style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 900, color: D.textPrimary }}>
                    {currentDossier.schoolName}
                  </h3>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: D.pill,
                      background: `${D.sky}20`,
                      color: D.sky,
                      fontFamily: D.mono,
                      fontSize: '10px',
                      fontWeight: 800,
                    }}
                  >
                    THREAT RATING: {currentDossier.overallRating}/100
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted, flexWrap: 'wrap' }}>
                  <span>🏟️ Ground: <strong style={{ color: D.textSecondary }}>{currentDossier.homeGround}</strong></span>
                  <span>👑 Captain: <strong style={{ color: D.textSecondary }}>{currentDossier.captain}</strong></span>
                  <span>📋 Coach: <strong style={{ color: D.textSecondary }}>{currentDossier.headCoach}</strong></span>
                </div>
              </div>

              {/* Form Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontFamily: D.head, fontSize: '10px', fontWeight: 700, color: D.textMuted }}>RECENT FORM:</span>
                {currentDossier.recentForm.map((res, i) => (
                  <span
                    key={i}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: D.mono,
                      fontSize: '11px',
                      fontWeight: 900,
                      background: res === 'W' ? `${D.emerald}25` : res === 'L' ? `${D.rose}25` : `${D.amber}25`,
                      color: res === 'W' ? D.emerald : res === 'L' ? D.rose : D.amber,
                      border: `1px solid ${res === 'W' ? D.emerald : res === 'L' ? D.rose : D.amber}40`,
                    }}
                  >
                    {res}
                  </span>
                ))}
              </div>
            </div>

            {/* Pitch & Ground Intelligence */}
            <div
              style={{
                padding: '12px 16px',
                background: D.surf2,
                borderRadius: D.md,
                border: `1px solid ${D.border}`,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '16px' }}>🌾</span>
              <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textSecondary, lineHeight: 1.5 }}>
                <strong style={{ color: D.textPrimary }}>Track Characteristics: </strong>
                {currentDossier.pitchCharacteristics}
              </div>
            </div>

            {/* Strategic Pillars Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '14px', background: `${D.rose}10`, borderRadius: D.md, border: `1px solid ${D.rose}30`, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 800, color: D.rose, textTransform: 'uppercase' }}>
                  ⚠️ Key Batting Threats
                </div>
                <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary, lineHeight: 1.5 }}>
                  {currentDossier.keyBattingThreatsSummary}
                </div>
              </div>

              <div style={{ padding: '14px', background: `${D.emerald}10`, borderRadius: D.md, border: `1px solid ${D.emerald}30`, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 800, color: D.emerald, textTransform: 'uppercase' }}>
                  🎯 Exploitable Vulnerabilities
                </div>
                <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary, lineHeight: 1.5 }}>
                  {currentDossier.exploitableVulnerabilitiesSummary}
                </div>
              </div>

              <div style={{ padding: '14px', background: `${D.sky}10`, borderRadius: D.md, border: `1px solid ${D.sky}30`, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 800, color: D.sky, textTransform: 'uppercase' }}>
                  ⚡ Bowling Attack Profile
                </div>
                <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary, lineHeight: 1.5 }}>
                  {currentDossier.bowlingAttackOverview}
                </div>
              </div>
            </div>

            {/* Generated Tactical Briefing Banner (if active) */}
            {generatedBriefing && (
              <div
                style={{
                  padding: '16px',
                  background: `${D.amber}15`,
                  borderRadius: D.md,
                  border: `1px solid ${D.amber}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 900, color: D.amber }}>
                    ⚡ AI-ASSISTED MATCH BATTLE PLAN DIRECTIVE
                  </span>
                  <button
                    onClick={() => setGeneratedBriefing(null)}
                    style={{ background: 'none', border: 'none', color: D.textMuted, cursor: 'pointer', fontSize: '12px' }}
                  >
                    ✕
                  </button>
                </div>
                <pre style={{ fontFamily: D.mono, fontSize: '11px', color: D.textPrimary, whiteSpace: 'pre-wrap', lineHeight: 1.5, margin: 0 }}>
                  {generatedBriefing}
                </pre>
              </div>
            )}
          </div>

          {/* ── SECTION A: BATTER-BY-BATTER DOSSIER & DISMISSAL HEATMAP ── */}
          <div
            style={{
              padding: '20px 22px',
              background: D.surf1,
              borderRadius: D.lg,
              border: `1px solid ${D.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h4 style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 900, color: D.textPrimary }}>
                  🎯 BATTER-BY-BATTER SCOUTING & DISMISSAL HEATMAPS
                </h4>
                <p style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted, margin: '2px 0 0' }}>
                  Select individual opposition batters to analyze bowling type vulnerabilities and 22-yard pitch dismissal zones.
                </p>
              </div>

              {/* Batter Selector Tabs */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {currentDossier.batters.map(bat => (
                  <button
                    key={bat.id}
                    onClick={() => setSelectedBatterId(bat.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: D.pill,
                      background: selectedBatterId === bat.id ? D.sky : D.surf2,
                      color: selectedBatterId === bat.id ? '#000' : D.textSecondary,
                      border: `1px solid ${selectedBatterId === bat.id ? D.sky : D.border}`,
                      fontFamily: D.head,
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>#{bat.number}</span>
                    <span>{bat.name}</span>
                    <span style={{ fontSize: '9px', opacity: 0.8 }}>({bat.battingStance})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Batter Deep Profile */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {/* Column 1: Core Metrics & Vulnerability Narrative */}
              <div
                style={{
                  padding: '16px',
                  background: D.surf2,
                  borderRadius: D.md,
                  border: `1px solid ${D.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary }}>
                      {activeBatter.name}
                    </div>
                    <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                      Role: {activeBatter.role} • Stance: {activeBatter.battingStance}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>AVG</div>
                      <div style={{ fontFamily: D.mono, fontSize: '14px', fontWeight: 900, color: D.emerald }}>
                        {activeBatter.seasonAvg}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>SR</div>
                      <div style={{ fontFamily: D.mono, fontSize: '14px', fontWeight: 900, color: D.sky }}>
                        {activeBatter.strikeRate}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', padding: '10px', background: D.surf1, borderRadius: D.sm }}>
                  <div>
                    <span style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>BOUNDARY %</span>
                    <div style={{ fontFamily: D.mono, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
                      {activeBatter.boundaryPct}%
                    </div>
                  </div>
                  <div>
                    <span style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>DOT BALL %</span>
                    <div style={{ fontFamily: D.mono, fontSize: '13px', fontWeight: 800, color: D.amber }}>
                      {activeBatter.dotBallPct}%
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontFamily: D.head, fontSize: '10px', fontWeight: 800, color: D.sky }}>
                    🏏 PRIMARY SCORING AREA
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary }}>
                    {activeBatter.primaryScoringZone}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontFamily: D.head, fontSize: '10px', fontWeight: 800, color: D.rose }}>
                    ⚠️ CRITICAL WEAKNESS
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: '11px', color: D.rose, lineHeight: 1.4, fontWeight: 600 }}>
                    {activeBatter.keyWeakness}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: `1px solid ${D.border}`, paddingTop: '8px' }}>
                  <div style={{ fontFamily: D.head, fontSize: '10px', fontWeight: 800, color: D.emerald }}>
                    📋 BOWLING MATCHUP DIRECTIVE
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textPrimary, lineHeight: 1.4 }}>
                    {activeBatter.tacticalPlan}
                  </div>
                </div>
              </div>

              {/* Column 2: Dismissal Breakdown by Bowling Type */}
              <div
                style={{
                  padding: '16px',
                  background: D.surf2,
                  borderRadius: D.md,
                  border: `1px solid ${D.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.textPrimary }}>
                    DISMISSAL MATRIX BY BOWLING TYPE
                  </span>
                  <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                    Season Data
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { key: 'rightArmPace', label: 'Right-Arm Pace / Seam', data: activeBatter.dismissalsByBowlingType.rightArmPace, color: '#38bdf8' },
                    { key: 'leftArmPace', label: 'Left-Arm Fast / Swing', data: activeBatter.dismissalsByBowlingType.leftArmPace, color: '#ec4899' },
                    { key: 'offSpin', label: 'Right-Arm Off-Break', data: activeBatter.dismissalsByBowlingType.offSpin, color: '#f59e0b' },
                    { key: 'legSpin', label: 'Right-Arm Leg-Spin / Wrist', data: activeBatter.dismissalsByBowlingType.legSpin, color: '#a855f7' },
                    { key: 'leftArmOrthodox', label: 'Left-Arm Orthodox Spin', data: activeBatter.dismissalsByBowlingType.leftArmOrthodox, color: '#10b981' },
                  ].map(b => (
                    <div key={b.key} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.head, fontSize: '10px' }}>
                        <span style={{ color: b.color, fontWeight: 700 }}>{b.label}</span>
                        <span style={{ fontFamily: D.mono, color: D.textPrimary }}>
                          <strong>{b.data.dismissals} outs</strong> • Avg: {b.data.avg} • Dot: {b.data.dotPct}%
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: D.surf1, borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.min(100, (b.data.dismissals / 6) * 100)}%`,
                            height: '100%',
                            background: b.color,
                            borderRadius: '3px',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 'auto', padding: '10px', background: D.surf1, borderRadius: D.sm, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>RECOMMENDED BOWLER:</span>
                  <span style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 800, color: D.sky }}>
                    {activeBatter.recommendedBowlerType}
                  </span>
                </div>
              </div>

              {/* Column 3: 22-Yard Pitch Vulnerability Hotspot */}
              <div
                style={{
                  padding: '16px',
                  background: D.surf2,
                  borderRadius: D.md,
                  border: `1px solid ${D.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.textPrimary }}>
                    PITCH VULNERABILITY HOTSPOT
                  </span>
                  <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.rose, fontWeight: 800 }}>
                    {activeBatter.pitchVulnerabilityHotspot.riskPct}% WICKET PROBABILITY
                  </span>
                </div>

                {/* Pitch Zone Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '4px',
                    padding: '8px',
                    background: D.surf1,
                    borderRadius: D.md,
                    border: `1px solid ${D.border}`,
                  }}
                >
                  {/* Grid header channels */}
                  {['Wide Off', '4th Stump', 'Off Stump', 'Mid/Leg', 'Down Leg'].map((ch, i) => (
                    <div key={i} style={{ fontFamily: D.head, fontSize: '8px', fontWeight: 700, color: D.textMuted, textAlign: 'center' }}>
                      {ch}
                    </div>
                  ))}

                  {/* 4 Length Rows x 5 Line Columns */}
                  {['short', 'back_of_length', 'good_length', 'yorker'].map(len => (
                    <React.Fragment key={len}>
                      {['wide_off', '4th_stump', 'off_stump', 'middle_leg', 'down_leg'].map(line => {
                        const isHotspot = activeBatter.pitchVulnerabilityHotspot.line === line && activeBatter.pitchVulnerabilityHotspot.length === len;
                        return (
                          <div
                            key={`${len}-${line}`}
                            style={{
                              height: '28px',
                              borderRadius: '3px',
                              background: isHotspot ? `${D.rose}45` : D.surf2,
                              border: `1px solid ${isHotspot ? D.rose : `${D.border}40`}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: D.mono,
                              fontSize: '8px',
                              fontWeight: 800,
                              color: isHotspot ? D.rose : D.textMuted,
                            }}
                          >
                            {isHotspot ? '🎯 TARGET' : ''}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>

                <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, lineHeight: 1.4 }}>
                  Target: <strong style={{ color: D.textPrimary }}>{activeBatter.pitchVulnerabilityHotspot.length.replace('_', ' ').toUpperCase()}</strong> on <strong style={{ color: D.textPrimary }}>{activeBatter.pitchVulnerabilityHotspot.line.replace('_', ' ').toUpperCase()}</strong>.
                </div>

                <div style={{ padding: '8px 10px', background: `${D.sky}15`, borderRadius: D.sm, border: `1px solid ${D.sky}30`, fontFamily: D.head, fontSize: '10px', color: D.sky }}>
                  📐 Field: {activeBatter.recommendedField}
                </div>
              </div>
            </div>
          </div>

          {/* ── SECTION B: OPPOSITION BOWLING ATTACK PROFILE ── */}
          <div
            style={{
              padding: '20px 22px',
              background: D.surf1,
              borderRadius: D.lg,
              border: `1px solid ${D.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 900, color: D.textPrimary }}>
                  ⚡ OPPOSITION BOWLER THREATS & COUNTER-ATTACK PLANS
                </h4>
                <p style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted, margin: '2px 0 0' }}>
                  Analyze release velocities, stock deliveries, wicket variations, and tactical instructions for our batsmen.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
              {currentDossier.bowlers.map(bowl => (
                <div
                  key={bowl.id}
                  style={{
                    padding: '16px',
                    background: D.surf2,
                    borderRadius: D.md,
                    border: `1px solid ${D.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
                        #{bowl.number} {bowl.name}
                      </div>
                      <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                        {bowl.bowlingStyle} • {bowl.avgSpeedKmH} km/h
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span style={{ padding: '2px 6px', borderRadius: D.pill, background: D.surf1, fontFamily: D.mono, fontSize: '9px', color: D.textSecondary }}>
                        PP: {bowl.economyPowerplay} RPO
                      </span>
                      <span style={{ padding: '2px 6px', borderRadius: D.pill, background: D.surf1, fontFamily: D.mono, fontSize: '9px', color: D.rose }}>
                        Death: {bowl.economyDeath} RPO
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', padding: '8px', background: D.surf1, borderRadius: D.sm }}>
                    <div>
                      <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>STOCK BALL</div>
                      <div style={{ fontFamily: D.body, fontSize: '10px', color: D.textSecondary, marginTop: '2px' }}>
                        {bowl.stockBall}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontFamily: D.head, fontSize: '9px', color: D.rose }}>WICKET DELIVERY</div>
                      <div style={{ fontFamily: D.body, fontSize: '10px', color: D.rose, marginTop: '2px', fontWeight: 600 }}>
                        {bowl.wicketBall}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '10px', background: `${D.emerald}15`, borderRadius: D.sm, border: `1px solid ${D.emerald}30` }}>
                    <div style={{ fontFamily: D.head, fontSize: '9px', fontWeight: 800, color: D.emerald, textTransform: 'uppercase' }}>
                      🏏 How to Counter & Score
                    </div>
                    <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textPrimary, marginTop: '2px', lineHeight: 1.4 }}>
                      {bowl.counterStrategy}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── SECTION C: PHASE-OF-PLAY TENDENCIES & PRESSURE RADAR ── */}
          <div
            style={{
              padding: '20px 22px',
              background: D.surf1,
              borderRadius: D.lg,
              border: `1px solid ${D.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <h4 style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 900, color: D.textPrimary }}>
              📊 PHASE-OF-PLAY TACTICAL SQUEEZE PROFILE
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {[
                { phase: 'POWERPLAY (OVERS 1-6)', data: currentDossier.phaseTendencies.powerplay, color: D.sky },
                { phase: 'MIDDLE OVERS (7-15)', data: currentDossier.phaseTendencies.middle, color: D.emerald },
                { phase: 'DEATH ACCELERATION (16-20)', data: currentDossier.phaseTendencies.death, color: D.rose },
              ].map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '16px',
                    background: D.surf2,
                    borderRadius: D.md,
                    border: `1px solid ${D.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: p.color }}>
                      {p.phase}
                    </span>
                    <span style={{ fontFamily: D.mono, fontSize: '11px', fontWeight: 900, color: D.textPrimary }}>
                      {p.data.runRate} RPO
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', padding: '8px', background: D.surf1, borderRadius: D.sm }}>
                    <div>
                      <div style={{ fontFamily: D.head, fontSize: '8px', color: D.textMuted }}>DOT %</div>
                      <div style={{ fontFamily: D.mono, fontSize: '12px', fontWeight: 800, color: D.amber }}>
                        {p.data.dotBallPct}%
                      </div>
                    </div>
                    <div>
                      <div style={{ fontFamily: D.head, fontSize: '8px', color: D.textMuted }}>BDY %</div>
                      <div style={{ fontFamily: D.mono, fontSize: '12px', fontWeight: 800, color: D.textPrimary }}>
                        {p.data.boundaryPct}%
                      </div>
                    </div>
                    <div>
                      <div style={{ fontFamily: D.head, fontSize: '8px', color: D.textMuted }}>WKTS LOST</div>
                      <div style={{ fontFamily: D.mono, fontSize: '12px', fontWeight: 800, color: D.rose }}>
                        {p.data.wicketsLostAvg}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary, lineHeight: 1.4 }}>
                    <strong style={{ color: D.textPrimary }}>Key Strategy: </strong>
                    {p.data.tacticalAdvice}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── SECTION D: COACH CUSTOM SCOUTING NOTES ── */}
          <div
            style={{
              padding: '20px 22px',
              background: D.surf1,
              borderRadius: D.lg,
              border: `1px solid ${D.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary }}>
                📝 COACH MATCH OBSERVATIONS & LIVE ANNOTATIONS ({currentDossier.shortName})
              </h4>
              <button
                onClick={handleSaveCoachNote}
                style={{
                  padding: '6px 14px',
                  borderRadius: D.pill,
                  background: D.emerald,
                  color: '#000',
                  border: 'none',
                  fontFamily: D.head,
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Save Coach Note
              </button>
            </div>

            <textarea
              value={activeNoteText || customCoachNotes[selectedOpponentId] || ''}
              onChange={(e) => setActiveNoteText(e.target.value)}
              placeholder={`Enter tactical directives or player scouting notes for ${currentDossier.schoolName}...`}
              rows={3}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: D.md,
                background: D.surf2,
                border: `1px solid ${D.border}`,
                color: D.textPrimary,
                fontFamily: D.body,
                fontSize: '12px',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>
        </div>
      )}

      {/* ── PRINTABLE / TABLET DOSSIER MODAL ── */}
      {isDossierModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '840px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#0f172a',
              color: '#f8fafc',
              borderRadius: '16px',
              border: '1px solid #334155',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
            }}
          >
            {/* Modal Top Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '22px' }}>📋</span>
                <span style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 900, color: '#38bdf8' }}>
                  MATCH TACTICAL DOSSIER BRIEFING SHEET
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    background: '#38bdf8',
                    color: '#000',
                    border: 'none',
                    fontFamily: D.head,
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  🖨️ Print Dossier
                </button>
                <button
                  onClick={() => setIsDossierModalOpen(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '20px',
                    background: '#1e293b',
                    color: '#94a3b8',
                    border: '1px solid #334155',
                    fontFamily: D.head,
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Formatted Match Brief Sheet */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontFamily: D.head, fontSize: '20px', fontWeight: 900, color: '#f8fafc', margin: 0 }}>
                    {currentDossier.schoolName}
                  </h2>
                  <div style={{ fontFamily: D.mono, fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                    Venue: {currentDossier.homeGround} • Captain: {currentDossier.captain} • Coach: {currentDossier.headCoach}
                  </div>
                </div>

                <div style={{ padding: '4px 12px', background: '#38bdf820', color: '#38bdf8', borderRadius: '20px', fontFamily: D.mono, fontSize: '12px', fontWeight: 800 }}>
                  CONFIDENTIAL • 1ST XI ANALYST BRIEF
                </div>
              </div>

              <div style={{ padding: '14px', background: '#1e293b', borderRadius: '8px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: '#f59e0b' }}>
                  KEY MATCH DIRECTIVES
                </div>
                {currentDossier.tacticalKeyDirectives.map((dir, i) => (
                  <div key={i} style={{ fontFamily: D.body, fontSize: '11px', color: '#cbd5e1', display: 'flex', gap: '8px' }}>
                    <span>{i + 1}.</span>
                    <span>{dir}</span>
                  </div>
                ))}
              </div>

              {/* Batters Summary Table */}
              <div>
                <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: '#38bdf8', marginBottom: '8px' }}>
                  KEY OPPOSITION BATSMEN PROFILES
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: D.mono, fontSize: '10px' }}>
                    <thead>
                      <tr style={{ background: '#1e293b', color: '#94a3b8', textAlign: 'left' }}>
                        <th style={{ padding: '8px', border: '1px solid #334155' }}>Player</th>
                        <th style={{ padding: '8px', border: '1px solid #334155' }}>Role</th>
                        <th style={{ padding: '8px', border: '1px solid #334155' }}>Stance</th>
                        <th style={{ padding: '8px', border: '1px solid #334155' }}>Avg / SR</th>
                        <th style={{ padding: '8px', border: '1px solid #334155' }}>Target Weakness</th>
                        <th style={{ padding: '8px', border: '1px solid #334155' }}>Tactical Plan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentDossier.batters.map(bat => (
                        <tr key={bat.id} style={{ borderBottom: '1px solid #334155' }}>
                          <td style={{ padding: '8px', border: '1px solid #334155', fontWeight: 800, color: '#f8fafc' }}>
                            {bat.name}
                          </td>
                          <td style={{ padding: '8px', border: '1px solid #334155', color: '#94a3b8' }}>{bat.role}</td>
                          <td style={{ padding: '8px', border: '1px solid #334155', color: '#38bdf8' }}>{bat.battingStance}</td>
                          <td style={{ padding: '8px', border: '1px solid #334155', color: '#10b981' }}>{bat.seasonAvg} / {bat.strikeRate}</td>
                          <td style={{ padding: '8px', border: '1px solid #334155', color: '#f43f5e' }}>{bat.keyWeakness}</td>
                          <td style={{ padding: '8px', border: '1px solid #334155', color: '#cbd5e1' }}>{bat.tacticalPlan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bowlers Summary Table */}
              <div>
                <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: '#38bdf8', marginBottom: '8px' }}>
                  KEY OPPOSITION BOWLERS
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: D.mono, fontSize: '10px' }}>
                    <thead>
                      <tr style={{ background: '#1e293b', color: '#94a3b8', textAlign: 'left' }}>
                        <th style={{ padding: '8px', border: '1px solid #334155' }}>Bowler</th>
                        <th style={{ padding: '8px', border: '1px solid #334155' }}>Style</th>
                        <th style={{ padding: '8px', border: '1px solid #334155' }}>Velocity</th>
                        <th style={{ padding: '8px', border: '1px solid #334155' }}>Stock / Wicket Ball</th>
                        <th style={{ padding: '8px', border: '1px solid #334155' }}>Counter Strategy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentDossier.bowlers.map(bowl => (
                        <tr key={bowl.id} style={{ borderBottom: '1px solid #334155' }}>
                          <td style={{ padding: '8px', border: '1px solid #334155', fontWeight: 800, color: '#f8fafc' }}>
                            {bowl.name}
                          </td>
                          <td style={{ padding: '8px', border: '1px solid #334155', color: '#94a3b8' }}>{bowl.bowlingStyle}</td>
                          <td style={{ padding: '8px', border: '1px solid #334155', color: '#f59e0b' }}>{bowl.avgSpeedKmH} km/h</td>
                          <td style={{ padding: '8px', border: '1px solid #334155', color: '#cbd5e1' }}>{bowl.stockBall} / {bowl.wicketBall}</td>
                          <td style={{ padding: '8px', border: '1px solid #334155', color: '#10b981' }}>{bowl.counterStrategy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sign-off */}
              <div style={{ borderTop: '1px solid #334155', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontFamily: D.mono, fontSize: '9px', color: '#64748b' }}>
                <span>SCRBRD OS Performance Analyst Cockpit</span>
                <span>Authorized for 1st XI Team Meeting</span>
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
