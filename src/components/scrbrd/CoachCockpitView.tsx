'use client';

import React, { useState, useMemo } from 'react';
import { Theme, Player, Match } from './types';
import { PLAYERS, SCHOOLS_REGISTRY, MATCHES } from './data';
import {
  Shield, Zap, Target, TrendingUp, Users, Award, AlertTriangle,
  ChevronRight, ArrowUpRight, ArrowDownRight, RefreshCw, Send,
  CheckCircle2, Clock, MapPin, Eye, Activity, Sliders, Layers,
  Compass, BarChart3, HelpCircle, Check, X, Sparkles, Filter,
  Maximize2, Play, Flame, Info
} from 'lucide-react';

interface CoachCockpitViewProps {
  theme: Theme;
  activeSchoolId: string;
  currentRole: string;
  onNavigateToCaptain?: () => void;
  onNavigateToSkills?: () => void;
  onNavigateToProfiles?: (player: Player) => void;
  onPushTacticalPlan?: (plan: TacticalPlanDirective) => void;
}

export interface TacticalPlanDirective {
  id: string;
  timestamp: string;
  title: string;
  targetBatter: string;
  bowler: string;
  bowlingPlan: string;
  fieldPreset: string;
  fieldPositions: { id: string; name: string; x: number; y: number }[];
  instruction: string;
  rationale: string;
  confidence: number;
  sampleSize: number;
  status: 'sent' | 'accepted' | 'modified' | 'dismissed';
}

export default function CoachCockpitView({
  theme: D,
  activeSchoolId,
  currentRole,
  onNavigateToCaptain,
  onNavigateToSkills,
  onNavigateToProfiles,
  onPushTacticalPlan,
}: CoachCockpitViewProps) {
  const activeSchool = SCHOOLS_REGISTRY.find(s => s.id === activeSchoolId) || SCHOOLS_REGISTRY[0];

  // Tactical Cockpit Mode Tabs
  const [activeTab, setActiveTab] = useState<'match_command' | 'pitch_map' | 'wagon_wheel' | 'field_planner' | 'matchups' | 'bowler_workload' | 'selection_room'>('match_command');

  // Match State
  const [matchState, setMatchState] = useState({
    score: 187,
    wickets: 4,
    overs: 32.3,
    totalOvers: 50,
    target: 284,
    dlsTarget: 278,
    crr: 5.75,
    rrr: 5.51,
    projected: 286,
    partnershipRuns: 42,
    partnershipBalls: 38,
    lastWicket: 'K. Pillay b Daniels 28 (31)',
    striker: { name: 'M. Patel', runs: 67, balls: 71, fours: 7, sixes: 2, sr: 94.37, stance: 'RHB' },
    nonStriker: { name: 'S. Naidoo', runs: 18, balls: 12, fours: 2, sixes: 1, sr: 150.0, stance: 'LHB' },
    bowler: { name: 'D. Daniels', figures: '6.3-0-31-2', econ: 4.77, spell: '2nd Spell (3.3 ov remaining)' },
    phase: 'Middle Overs (11-40)',
    fieldingRestrictions: 'Powerplay 2 (4 Fielders Outside Ring)',
    newBallAvailableIn: '47.3 ov',
  });

  // Momentum & Pressure Telemetry
  const momentumStats = {
    last5OversRuns: 34,
    last5OversWickets: 1,
    dotBallPercentage: 44.2,
    boundaryFrequency: 6.8, // 1 boundary every 6.8 balls
    pressureIndex: 68, // 0 - 100
    winProbability: 64, // %
    winProbConfidence: 'High (N=1,420 historical school matches)',
  };

  // Tactical Alerts & AI Recommendations with Evidence & Confidence
  const [tacticalAlerts, setTacticalAlerts] = useState([
    {
      id: 'alt_1',
      severity: 'high',
      title: 'Short Ball Vulnerability Detected',
      target: 'M. Patel (Striker)',
      evidence: 'False shot rate spikes to 42% on deliveries >132km/h back of a length outside off stump.',
      recommendation: 'Deploy deep backward point and fine leg; instruct Daniels to bowl short-into-the-ribs with 2 bouncers.',
      confidence: 86,
      sampleSize: 22,
      actionStatus: 'pending',
    },
    {
      id: 'alt_2',
      severity: 'medium',
      title: 'Boundary Leakage at Extra Cover',
      target: 'S. Naidoo (LHB)',
      evidence: '68% of boundaries in last 4 overs conceded through vacant extra cover / wide mid-off gap.',
      recommendation: 'Shift extra cover 8m deeper to boundary rope and bring mid-wicket in saving the single.',
      confidence: 91,
      sampleSize: 34,
      actionStatus: 'pending',
    },
    {
      id: 'alt_3',
      severity: 'info',
      title: 'Bowler Workload Threshold Alert',
      target: 'D. Daniels (Fast Bowler)',
      evidence: 'Currently on 6.3 overs today; weekly workload is 26.3 overs (approaching 30.0 ov medical safety cap).',
      recommendation: 'Cap current spell at 7 overs; warm up J. Whitfield for off-spin transition.',
      confidence: 99,
      sampleSize: 1,
      actionStatus: 'pending',
    },
  ]);

  // 3-Phase Scoring Intelligence Inspector
  const [selectedPhaseInquiry, setSelectedPhaseInquiry] = useState<string>('opener_scoring');
  const phaseInquiries = [
    {
      id: 'opener_scoring',
      label: 'Where is their opener scoring?',
      summary: 'M. Patel scores 62% of runs through Point and Cover against pace, but only 18% behind square.',
      dataPoints: [
        { zone: 'Point / Cover', runs: 42, percentage: 62, balls: 31 },
        { zone: 'Mid-Wicket', runs: 16, percentage: 24, balls: 22 },
        { zone: 'Behind Square', runs: 9, percentage: 14, balls: 18 },
      ],
    },
    {
      id: 'short_ball_effect',
      label: 'What happens when we bowl short to Patel?',
      summary: 'Short pitch deliveries have produced 1 dismissal, 2 top edges, and an economy rate of just 3.60.',
      dataPoints: [
        { zone: 'Short (<7m from stumps)', runs: 6, dots: 8, falseShots: 4, wickets: 1 },
        { zone: 'Good Length (6-8m)', runs: 28, dots: 12, falseShots: 2, wickets: 0 },
        { zone: 'Full / Slot (>8m)', runs: 33, dots: 5, falseShots: 1, wickets: 0 },
      ],
    },
    {
      id: 'false_shots_length',
      label: 'Which length is creating the most false shots?',
      summary: 'Back of a length (7.2m - 8.0m) outside off-stump yields a 38% false-shot inducing rate.',
      dataPoints: [
        { length: 'Back of Length', falseShots: '38%', control: '62%', dotRate: '58%' },
        { length: 'Good Length', falseShots: '21%', control: '79%', dotRate: '41%' },
        { length: 'Full Length', falseShots: '9%', control: '91%', dotRate: '25%' },
        { length: 'Short Bouncer', falseShots: '33%', control: '67%', dotRate: '60%' },
      ],
    },
  ];

  // Interactive Pitch Map Filter States
  const [pitchFilterLength, setPitchFilterLength] = useState<string>('all');
  const [pitchFilterLine, setPitchFilterLine] = useState<string>('all');
  const [pitchHeatmapMode, setPitchHeatmapMode] = useState<'delivery_density' | 'outcome_effectiveness' | 'danger_zones'>('outcome_effectiveness');

  // Field Setting Board State
  const [fieldPreset, setFieldPreset] = useState<string>('aggressive_newball');
  const [batterStance, setBatterStance] = useState<'RHB' | 'LHB'>('RHB');
  const [fielders, setFielders] = useState<{ id: string; name: string; x: number; y: number; role: string }[]>([
    { id: 'f1', name: 'Wicketkeeper', x: 50, y: 78, role: 'Keeper' },
    { id: 'f2', name: '1st Slip', x: 58, y: 80, role: 'Slip' },
    { id: 'f3', name: '2nd Slip', x: 65, y: 81, role: 'Slip' },
    { id: 'f4', name: 'Gully', x: 74, y: 72, role: 'Gully' },
    { id: 'f5', name: 'Point', x: 80, y: 55, role: 'Point' },
    { id: 'f6', name: 'Cover', x: 72, y: 38, role: 'Cover' },
    { id: 'f7', name: 'Mid Off', x: 58, y: 28, role: 'Mid Off' },
    { id: 'f8', name: 'Mid On', x: 42, y: 28, role: 'Mid On' },
    { id: 'f9', name: 'Mid Wicket', x: 26, y: 40, role: 'Mid Wicket' },
    { id: 'f10', name: 'Square Leg', x: 20, y: 56, role: 'Square Leg' },
    { id: 'f11', name: 'Bowler (Daniels)', x: 50, y: 34, role: 'Bowler' },
  ]);
  const [tacticalNote, setTacticalNote] = useState<string>('Bowl tight back of length 4th stump. Force horizontal bat shots toward Gully and Point ring.');
  const [pushedDirectiveStatus, setPushedDirectiveStatus] = useState<string | null>(null);

  // Field Presets Library
  const applyFieldPreset = (presetKey: string) => {
    setFieldPreset(presetKey);
    if (presetKey === 'aggressive_newball') {
      setFielders([
        { id: 'f1', name: 'Wicketkeeper', x: 50, y: 78, role: 'Keeper' },
        { id: 'f2', name: '1st Slip', x: 58, y: 80, role: 'Slip' },
        { id: 'f3', name: '2nd Slip', x: 65, y: 81, role: 'Slip' },
        { id: 'f4', name: 'Gully', x: 74, y: 72, role: 'Gully' },
        { id: 'f5', name: 'Point', x: 80, y: 55, role: 'Point' },
        { id: 'f6', name: 'Cover', x: 72, y: 38, role: 'Cover' },
        { id: 'f7', name: 'Mid Off', x: 58, y: 28, role: 'Mid Off' },
        { id: 'f8', name: 'Mid On', x: 42, y: 28, role: 'Mid On' },
        { id: 'f9', name: 'Mid Wicket', x: 26, y: 40, role: 'Mid Wicket' },
        { id: 'f10', name: 'Square Leg', x: 20, y: 56, role: 'Square Leg' },
        { id: 'f11', name: 'Bowler', x: 50, y: 34, role: 'Bowler' },
      ]);
      setTacticalNote('Aggressive 2 slips + gully cordon. Test outside edge on early swinging new ball.');
    } else if (presetKey === 'lhb_accumulator') {
      setFielders([
        { id: 'f1', name: 'Wicketkeeper', x: 50, y: 78, role: 'Keeper' },
        { id: 'f2', name: '1st Slip', x: 42, y: 80, role: 'Slip' },
        { id: 'f3', name: 'Deep Backward Point', x: 18, y: 76, role: 'Boundary' },
        { id: 'f4', name: 'Cover Point', x: 24, y: 52, role: 'Ring' },
        { id: 'f5', name: 'Extra Cover', x: 30, y: 36, role: 'Ring' },
        { id: 'f6', name: 'Mid Off', x: 42, y: 28, role: 'Ring' },
        { id: 'f7', name: 'Deep Mid Wicket', x: 78, y: 30, role: 'Boundary' },
        { id: 'f8', name: 'Short Mid Wicket', x: 64, y: 44, role: 'Ring' },
        { id: 'f9', name: 'Square Leg', x: 78, y: 58, role: 'Ring' },
        { id: 'f10', name: 'Deep Fine Leg', x: 84, y: 78, role: 'Boundary' },
        { id: 'f11', name: 'Bowler', x: 50, y: 34, role: 'Bowler' },
      ]);
      setTacticalNote('Choke off-side driving lanes for LHB. Force awkward pulls toward deep mid-wicket.');
    } else if (presetKey === 'death_yorker') {
      setFielders([
        { id: 'f1', name: 'Wicketkeeper', x: 50, y: 78, role: 'Keeper' },
        { id: 'f2', name: 'Deep 3rd Man', x: 84, y: 82, role: 'Boundary' },
        { id: 'f3', name: 'Deep Point', x: 88, y: 55, role: 'Boundary' },
        { id: 'f4', name: 'Deep Extra Cover', x: 78, y: 22, role: 'Boundary' },
        { id: 'f5', name: 'Long Off', x: 58, y: 15, role: 'Boundary' },
        { id: 'f6', name: 'Long On', x: 42, y: 15, role: 'Boundary' },
        { id: 'f7', name: 'Deep Mid Wicket', x: 18, y: 28, role: 'Boundary' },
        { id: 'f8', name: 'Deep Square Leg', x: 14, y: 62, role: 'Boundary' },
        { id: 'f9', name: 'Short Fine Leg', x: 30, y: 74, role: 'Ring' },
        { id: 'f10', name: 'Short Extra Cover', x: 66, y: 44, role: 'Ring' },
        { id: 'f11', name: 'Bowler', x: 50, y: 34, role: 'Bowler' },
      ]);
      setTacticalNote('Death overs boundary protection. Full yorkers on wide line outside off-stump.');
    } else if (presetKey === 'legspin_web') {
      setFielders([
        { id: 'f1', name: 'Wicketkeeper', x: 50, y: 78, role: 'Keeper' },
        { id: 'f2', name: 'Slip', x: 58, y: 80, role: 'Slip' },
        { id: 'f3', name: 'Short Leg', x: 44, y: 70, role: 'Catching' },
        { id: 'f4', name: 'Silly Mid Off', x: 56, y: 48, role: 'Catching' },
        { id: 'f5', name: 'Cover', x: 74, y: 40, role: 'Ring' },
        { id: 'f6', name: 'Long Off', x: 62, y: 18, role: 'Boundary' },
        { id: 'f7', name: 'Deep Mid Wicket', x: 22, y: 28, role: 'Boundary' },
        { id: 'f8', name: 'Mid Wicket', x: 32, y: 46, role: 'Ring' },
        { id: 'f9', name: 'Square Leg', x: 24, y: 60, role: 'Ring' },
        { id: 'f10', name: 'Deep Backward Square', x: 16, y: 78, role: 'Boundary' },
        { id: 'f11', name: 'Bowler', x: 50, y: 34, role: 'Bowler' },
      ]);
      setTacticalNote('Spin trap with catching short leg and flighted googlies inducing mistimed top edges.');
    }
  };

  // Push Tactical Directive to Captain Cockpit
  const handlePushToCaptain = () => {
    const directive: TacticalPlanDirective = {
      id: `dir_${Date.now()}`,
      timestamp: `${matchState.overs} ov`,
      title: `${fieldPreset.replace(/_/g, ' ').toUpperCase()} PLAN`,
      targetBatter: matchState.striker.name,
      bowler: matchState.bowler.name,
      bowlingPlan: tacticalNote,
      fieldPreset: fieldPreset,
      fieldPositions: fielders,
      instruction: tacticalNote,
      rationale: 'Evidence shows 62% boundary concentration through off-side against good length pace.',
      confidence: 88,
      sampleSize: 28,
      status: 'sent',
    };

    if (onPushTacticalPlan) {
      onPushTacticalPlan(directive);
    }

    setPushedDirectiveStatus('Tactical Directive transmitted to Captain Cockpit successfully! [Status: Dispatched]');
    setTimeout(() => setPushedDirectiveStatus(null), 5000);
  };

  // Batter Match-Up Matrix Data
  const matchupData = [
    {
      batter: 'M. Patel',
      bowler: 'D. Daniels (Right Fast)',
      balls: 28,
      runs: 24,
      sr: 85.7,
      dots: 16,
      boundaries: 3,
      dismissals: 2,
      weakness: 'Short ball outside off',
      tendency: 'Point & Cover punch (62%)',
      sampleSize: '28 balls (Moderate)',
    },
    {
      batter: 'M. Patel',
      bowler: 'J. Whitfield (Right Off-Spin)',
      balls: 19,
      runs: 31,
      sr: 163.1,
      dots: 4,
      boundaries: 5,
      dismissals: 0,
      weakness: 'Flighted arm ball',
      tendency: 'Step-out lofted drive over Long Off',
      sampleSize: '19 balls (Small Sample)',
    },
    {
      batter: 'S. Naidoo',
      bowler: 'D. Daniels (Right Fast)',
      balls: 8,
      runs: 14,
      sr: 175.0,
      dots: 2,
      boundaries: 2,
      dismissals: 0,
      weakness: 'Full swinging delivery',
      tendency: 'Flick through Mid-Wicket',
      sampleSize: '8 balls (Very Small)',
    },
    {
      batter: 'S. Naidoo',
      bowler: 'K. Pillay (Left-Arm Orth)',
      balls: 14,
      runs: 9,
      sr: 64.3,
      dots: 9,
      boundaries: 0,
      dismissals: 1,
      weakness: 'Turning away from LHB off-stump',
      tendency: 'Defensive forward prod',
      sampleSize: '14 balls (Moderate)',
    },
  ];

  // Bowler Workload Registry (With strict RBAC: No clinical PII, only operational workload and clearances)
  const bowlerWorkloads = [
    {
      name: 'D. Daniels',
      role: 'Right-Arm Fast',
      matchOvers: '6.3',
      matchFigures: '6.3-0-31-2',
      economy: '4.77',
      dotPct: '53.8%',
      spells: 'Spell 1: 4.0 ov | Spell 2: 2.3 ov (Active)',
      allocationRemaining: '3.3 overs',
      ballsToday: 39,
      weeklyOvers: 26.3,
      workloadStatus: 'RESTRICTED',
      workloadReason: 'Workload Safety Cap: Max 8.0 overs in match',
      medicalClearance: 'Cleared for bowling (Physio limit: 8 ov)',
    },
    {
      name: 'J. Whitfield',
      role: 'Right-Arm Off-Break',
      matchOvers: '6.0',
      matchFigures: '6.0-1-28-1',
      economy: '4.67',
      dotPct: '58.3%',
      spells: 'Spell 1: 6.0 ov (Completed)',
      allocationRemaining: '4.0 overs',
      ballsToday: 36,
      weeklyOvers: 18.0,
      workloadStatus: 'AVAILABLE',
      workloadReason: 'Within optimal workload window',
      medicalClearance: 'Fully Fit & Unrestricted',
    },
    {
      name: 'L. Mthembu',
      role: 'Left-Arm Fast Medium',
      matchOvers: '8.0',
      matchFigures: '8.0-0-48-1',
      economy: '6.00',
      dotPct: '41.6%',
      spells: 'Spell 1: 5.0 ov | Spell 2: 3.0 ov',
      allocationRemaining: '2.0 overs',
      ballsToday: 48,
      weeklyOvers: 22.0,
      workloadStatus: 'AVAILABLE',
      workloadReason: 'Available for death overs spell',
      medicalClearance: 'Fully Fit & Unrestricted',
    },
    {
      name: 'R. Pretorius',
      role: 'Right-Arm Leg Spin',
      matchOvers: '5.0',
      matchFigures: '5.0-0-32-0',
      economy: '6.40',
      dotPct: '40.0%',
      spells: 'Spell 1: 5.0 ov',
      allocationRemaining: '5.0 overs',
      ballsToday: 30,
      weeklyOvers: 14.0,
      workloadStatus: 'AVAILABLE',
      workloadReason: 'Ready for middle overs attack',
      medicalClearance: 'Fully Fit & Unrestricted',
    },
  ];

  // Squad Selection Room State
  const [squadAvailability, setSquadAvailability] = useState([
    { id: 'p1', name: 'J. Whitfield', role: 'Captain / All-Rounder', status: 'AVAILABLE', form: '▲ 88/100', skillsRating: 94, isStartingXI: true, batPos: 1 },
    { id: 'p2', name: 'M. Patel', role: 'Top-Order Batter', status: 'AVAILABLE', form: '▲ 92/100', skillsRating: 91, isStartingXI: true, batPos: 2 },
    { id: 'p3', name: 'S. Naidoo', role: 'Wicketkeeper / Batter', status: 'AVAILABLE', form: '▲ 84/100', skillsRating: 88, isStartingXI: true, batPos: 3 },
    { id: 'p4', name: 'D. Daniels', role: 'Fast Bowler', status: 'LIMITED', form: '▲ 90/100', skillsRating: 93, isStartingXI: true, batPos: 10 },
    { id: 'p5', name: 'L. Mthembu', role: 'Pace Bowler', status: 'AVAILABLE', form: '▲ 81/100', skillsRating: 86, isStartingXI: true, batPos: 9 },
    { id: 'p6', name: 'R. Pretorius', role: 'Leg-Spinner', status: 'AVAILABLE', form: '● 76/100', skillsRating: 84, isStartingXI: true, batPos: 8 },
    { id: 'p7', name: 'A. Botha', role: 'Middle Order', status: 'AVAILABLE', form: '● 78/100', skillsRating: 82, isStartingXI: true, batPos: 4 },
    { id: 'p8', name: 'T. Van Zyl', role: 'All-Rounder', status: 'AVAILABLE', form: '▲ 85/100', skillsRating: 87, isStartingXI: true, batPos: 5 },
    { id: 'p9', name: 'C. Khumalo', role: 'Finisher / Batter', status: 'AVAILABLE', form: '● 79/100', skillsRating: 83, isStartingXI: true, batPos: 6 },
    { id: 'p10', name: 'K. Pillay', role: 'Spin All-Rounder', status: 'AVAILABLE', form: '● 74/100', skillsRating: 80, isStartingXI: true, batPos: 7 },
    { id: 'p11', name: 'B. Steyn', role: 'Fast Bowler', status: 'AVAILABLE', form: '● 77/100', skillsRating: 81, isStartingXI: true, batPos: 11 },
    { id: 'p12', name: 'Z. Dlamini', role: 'Reserve Keeper', status: 'AVAILABLE', form: '● 70/100', skillsRating: 75, isStartingXI: false, batPos: 12 },
    { id: 'p13', name: 'H. Venter', role: 'Reserve Seamer', status: 'UNAVAILABLE', form: '▼ 60/100', skillsRating: 72, isStartingXI: false, batPos: 13 },
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingBottom: '32px' }}>
      {/* ── TOP LEVEL BENTO MATCH COMMAND HEADER ── */}
      <div
        style={{
          padding: '20px 24px',
          borderRadius: D.xl,
          background: `linear-gradient(135deg, ${D.surf1}, ${D.surf2})`,
          border: `1px solid ${D.borderMed}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: `${D.indigo}25`,
                  border: `1px solid ${D.indigo}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: D.indigo,
                }}
              >
                <Compass size={18} />
              </div>
              <div>
                <h1 style={{ fontFamily: D.head, fontSize: '20px', fontWeight: 900, color: D.textPrimary, letterSpacing: '-0.02em', margin: 0 }}>
                  COACH TACTICAL COCKPIT & MATCH COMMAND
                </h1>
                <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted, marginTop: '2px' }}>
                  Live tactical intelligence, 3-phase delivery reconstruction, field positioning, and real-time captaincy directives
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: D.mono,
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: D.pill,
                background: `${D.emerald}20`,
                color: D.emerald,
                border: `1px solid ${D.emerald}44`,
              }}
            >
              LIVE MATCH STATE · {matchState.phase}
            </span>

            {onNavigateToCaptain && (
              <button
                onClick={onNavigateToCaptain}
                style={{
                  padding: '8px 16px',
                  borderRadius: D.pill,
                  background: D.indigo,
                  border: 'none',
                  color: '#fff',
                  fontFamily: D.head,
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: `0 4px 14px ${D.indigo}40`,
                }}
              >
                <span>Switch to Captain Cockpit</span>
                <ArrowUpRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Live Match State Metric Telemetry */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
          <div style={{ padding: '12px', background: D.surf0, borderRadius: D.md, border: `1px solid ${D.border}` }}>
            <div style={{ fontFamily: D.head, fontSize: '10px', fontWeight: 700, color: D.textMuted }}>SCORE / OVERS</div>
            <div style={{ fontFamily: D.mono, fontSize: '22px', fontWeight: 900, color: D.textPrimary, marginTop: '2px' }}>
              {matchState.score}/{matchState.wickets}
            </div>
            <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textSecondary }}>{matchState.overs} / {matchState.totalOvers} ov</div>
          </div>

          <div style={{ padding: '12px', background: D.surf0, borderRadius: D.md, border: `1px solid ${D.border}` }}>
            <div style={{ fontFamily: D.head, fontSize: '10px', fontWeight: 700, color: D.textMuted }}>CRR / RRR</div>
            <div style={{ fontFamily: D.mono, fontSize: '22px', fontWeight: 900, color: D.cyan, marginTop: '2px' }}>
              {matchState.crr} <span style={{ fontSize: '14px', color: D.textMuted }}>/ {matchState.rrr}</span>
            </div>
            <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary }}>Need 97 runs in 17.3 ov</div>
          </div>

          <div style={{ padding: '12px', background: D.surf0, borderRadius: D.md, border: `1px solid ${D.border}` }}>
            <div style={{ fontFamily: D.head, fontSize: '10px', fontWeight: 700, color: D.textMuted }}>PROJECTED / DLS PAR</div>
            <div style={{ fontFamily: D.mono, fontSize: '22px', fontWeight: 900, color: D.amber, marginTop: '2px' }}>
              {matchState.projected}
            </div>
            <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textSecondary }}>DLS Target: {matchState.dlsTarget}</div>
          </div>

          <div style={{ padding: '12px', background: D.surf0, borderRadius: D.md, border: `1px solid ${D.border}` }}>
            <div style={{ fontFamily: D.head, fontSize: '10px', fontWeight: 700, color: D.textMuted }}>ACTIVE PARTNERSHIP</div>
            <div style={{ fontFamily: D.mono, fontSize: '22px', fontWeight: 900, color: D.emerald, marginTop: '2px' }}>
              {matchState.partnershipRuns} <span style={{ fontSize: '12px', color: D.textMuted }}>({matchState.partnershipBalls}b)</span>
            </div>
            <div style={{ fontFamily: D.body, fontSize: '10px', color: D.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Last: {matchState.lastWicket}
            </div>
          </div>

          <div style={{ padding: '12px', background: D.surf0, borderRadius: D.md, border: `1px solid ${D.border}` }}>
            <div style={{ fontFamily: D.head, fontSize: '10px', fontWeight: 700, color: D.textMuted }}>WIN PROBABILITY</div>
            <div style={{ fontFamily: D.mono, fontSize: '22px', fontWeight: 900, color: D.indigo, marginTop: '2px' }}>
              {momentumStats.winProbability}%
            </div>
            <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.emerald }}>Momentum ↗ Positive</div>
          </div>
        </div>

        {/* Pushed Directive Confirmation Toast */}
        {pushedDirectiveStatus && (
          <div
            style={{
              padding: '10px 16px',
              borderRadius: D.md,
              background: `${D.emerald}25`,
              border: `1px solid ${D.emerald}`,
              color: D.emerald,
              fontFamily: D.mono,
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{pushedDirectiveStatus}</span>
          </div>
        )}
      </div>

      {/* ── BENTO NAVIGATION TABS ── */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'match_command', label: '⚡ Match Command', desc: 'Tactical State & Alerts' },
          { id: 'pitch_map', label: '🎯 Tactical Pitch Map', desc: 'Landing vs Danger Heatmaps' },
          { id: 'wagon_wheel', label: '📊 Wagon Wheel Intel', desc: '360° Sector Breakdown' },
          { id: 'field_planner', label: '🛡️ Field Setting Board', desc: 'Draggable Field & Captain Dispatch' },
          { id: 'matchups', label: '⚔️ Batter Match-Up Matrix', desc: 'H2H Dismissal Tendencies' },
          { id: 'bowler_workload', label: '🩺 Bowler Management', desc: 'Spell & Workload RBAC' },
          { id: 'selection_room', label: '👥 Team Selection Room', desc: 'Starting XI & Availability' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '10px 18px',
              borderRadius: D.lg,
              background: activeTab === tab.id ? D.indigo : D.surf1,
              border: `1px solid ${activeTab === tab.id ? D.indigo : D.border}`,
              color: activeTab === tab.id ? '#fff' : D.textSecondary,
              fontFamily: D.head,
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '2px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>{tab.label}</span>
            <span style={{ fontSize: '9px', opacity: 0.7, fontFamily: D.body }}>{tab.desc}</span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: MATCH COMMAND & TACTICAL ALERTS ── */}
      {activeTab === 'match_command' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
          {/* Batters & Bowlers Live Telemetry (6 Cols) */}
          <div style={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '18px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
                  🏏 CURRENT BATTERS AT THE CREASE
                </span>
                <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>3-Phase Telemetry</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Striker */}
                <div style={{ padding: '12px', background: D.surf0, borderRadius: D.md, border: `1.5px solid ${D.indigo}55` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: D.emerald }} />
                      <span style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 900, color: D.textPrimary }}>
                        {matchState.striker.name} (Striker)
                      </span>
                      <span style={{ fontFamily: D.mono, fontSize: '10px', padding: '1px 6px', borderRadius: D.sm, background: D.surf2, color: D.textMuted }}>
                        {matchState.striker.stance}
                      </span>
                    </div>
                    <div style={{ fontFamily: D.mono, fontSize: '16px', fontWeight: 900, color: D.indigo }}>
                      {matchState.striker.runs} <span style={{ fontSize: '11px', color: D.textMuted }}>({matchState.striker.balls})</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: D.mono, color: D.textSecondary, marginTop: '6px' }}>
                    <span>SR: {matchState.striker.sr}</span>
                    <span>4s: {matchState.striker.fours} | 6s: {matchState.striker.sixes}</span>
                    <span style={{ color: D.amber }}>Primary Scoring: Cover (62%)</span>
                  </div>
                </div>

                {/* Non-Striker */}
                <div style={{ padding: '12px', background: D.surf0, borderRadius: D.md, border: `1px solid ${D.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: D.textMuted }} />
                      <span style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary }}>
                        {matchState.nonStriker.name} (Non-Striker)
                      </span>
                      <span style={{ fontFamily: D.mono, fontSize: '10px', padding: '1px 6px', borderRadius: D.sm, background: D.surf2, color: D.textMuted }}>
                        {matchState.nonStriker.stance}
                      </span>
                    </div>
                    <div style={{ fontFamily: D.mono, fontSize: '16px', fontWeight: 800, color: D.textSecondary }}>
                      {matchState.nonStriker.runs} <span style={{ fontSize: '11px', color: D.textMuted }}>({matchState.nonStriker.balls})</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: D.mono, color: D.textSecondary, marginTop: '6px' }}>
                    <span>SR: {matchState.nonStriker.sr}</span>
                    <span>4s: {matchState.nonStriker.fours} | 6s: {matchState.nonStriker.sixes}</span>
                    <span style={{ color: D.cyan }}>Primary Scoring: Mid-Wicket (58%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Bowler Spell & Workload */}
            <div style={{ padding: '18px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
                  🎯 ACTIVE BOWLER SPELL & QUOTA
                </span>
                <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.emerald }}>Workload: Controlled</span>
              </div>

              <div style={{ padding: '12px', background: D.surf0, borderRadius: D.md, border: `1px solid ${D.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 900, color: D.textPrimary }}>
                    {matchState.bowler.name}
                  </span>
                  <span style={{ fontFamily: D.mono, fontSize: '16px', fontWeight: 900, color: D.cyan }}>
                    {matchState.bowler.figures}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: D.mono, color: D.textSecondary, marginTop: '6px' }}>
                  <span>Econ: {matchState.bowler.econ} rpo</span>
                  <span>{matchState.bowler.spell}</span>
                  <span style={{ color: D.emerald }}>Dot%: 53.8%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tactical Alerts & Evidence-Backed Interventions (6 Cols) */}
          <div style={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '18px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={16} color={D.amber} />
                  <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
                    TACTICAL ALERTS & INTERVENTION EVIDENCE
                  </span>
                </div>
                <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>Confidence Filtered</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tacticalAlerts.map(alt => (
                  <div
                    key={alt.id}
                    style={{
                      padding: '14px',
                      borderRadius: D.md,
                      background: alt.severity === 'high' ? `${D.rose}12` : alt.severity === 'medium' ? `${D.amber}12` : D.surf0,
                      border: `1px solid ${alt.severity === 'high' ? D.rose : alt.severity === 'medium' ? D.amber : D.border}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: alt.severity === 'high' ? D.rose : alt.severity === 'medium' ? D.amber : D.textPrimary }}>
                        {alt.title}
                      </span>
                      <span style={{ fontFamily: D.mono, fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: D.pill, background: `${D.indigo}25`, color: D.indigo }}>
                        Confidence: {alt.confidence}% (N={alt.sampleSize})
                      </span>
                    </div>

                    <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary }}>
                      🎯 <strong>Target:</strong> {alt.target}
                    </div>

                    <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary }}>
                      📊 <strong>Evidence:</strong> {alt.evidence}
                    </div>

                    <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textPrimary, fontWeight: 700, marginTop: '2px' }}>
                      💡 <strong>Recommended Action:</strong> {alt.recommendation}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                      <button
                        onClick={() => {
                          setTacticalNote(alt.recommendation);
                          setActiveTab('field_planner');
                        }}
                        style={{
                          padding: '4px 12px',
                          borderRadius: D.pill,
                          background: D.surf2,
                          border: `1px solid ${D.border}`,
                          color: D.textSecondary,
                          fontFamily: D.head,
                          fontSize: '10px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Adjust Field Plan →
                      </button>
                      <button
                        onClick={handlePushToCaptain}
                        style={{
                          padding: '4px 12px',
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
                        Transmit to Captain
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3-Phase Scoring Intelligence Inspector Card */}
            <div style={{ padding: '18px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
                  🔬 3-PHASE INTELLIGENCE RECONSTRUCTION
                </span>
                <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.indigo }}>Phase 1 + 2 + 3 Data</span>
              </div>

              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                {phaseInquiries.map(inq => (
                  <button
                    key={inq.id}
                    onClick={() => setSelectedPhaseInquiry(inq.id)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: D.pill,
                      background: selectedPhaseInquiry === inq.id ? D.indigo : D.surf2,
                      border: `1px solid ${selectedPhaseInquiry === inq.id ? D.indigo : D.border}`,
                      color: selectedPhaseInquiry === inq.id ? '#fff' : D.textSecondary,
                      fontFamily: D.head,
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {inq.label}
                  </button>
                ))}
              </div>

              {(() => {
                const currentInq = phaseInquiries.find(i => i.id === selectedPhaseInquiry) || phaseInquiries[0];
                return (
                  <div style={{ padding: '12px', background: D.surf0, borderRadius: D.md, border: `1px solid ${D.border}` }}>
                    <div style={{ fontFamily: D.body, fontSize: '12px', fontWeight: 700, color: D.textPrimary, marginBottom: '8px' }}>
                      {currentInq.summary}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {currentInq.dataPoints.map((dp: any, idx: number) => (
                        <div key={idx} style={{ padding: '8px', background: D.surf2, borderRadius: D.sm, textAlign: 'center' }}>
                          <div style={{ fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>{dp.zone || dp.length}</div>
                          <div style={{ fontFamily: D.mono, fontSize: '14px', fontWeight: 900, color: D.cyan, marginTop: '2px' }}>
                            {dp.runs !== undefined ? `${dp.runs} runs` : dp.falseShots}
                          </div>
                          <div style={{ fontFamily: D.mono, fontSize: '9px', color: D.textSecondary }}>
                            {dp.percentage ? `${dp.percentage}% of total` : `Dots: ${dp.dots || dp.dotRate}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: TACTICAL PITCH MAP & HEATMAPS ── */}
      {activeTab === 'pitch_map' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
          {/* Pitch Canvas Visualizer (7 Cols) */}
          <div style={{ gridColumn: 'span 7', padding: '20px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <span style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary }}>
                  🎯 22-YARD PITCH LANDING & OUTCOME MAP
                </span>
                <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                  Distinguishing delivery density vs outcome effectiveness
                </div>
              </div>

              {/* Heatmap Mode Toggle */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {[
                  { id: 'delivery_density', label: 'Landing Density' },
                  { id: 'outcome_effectiveness', label: 'Outcome Heatmap' },
                  { id: 'danger_zones', label: 'Danger Zones' },
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setPitchHeatmapMode(mode.id as any)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: D.pill,
                      background: pitchHeatmapMode === mode.id ? D.cyan : D.surf2,
                      border: `1px solid ${pitchHeatmapMode === mode.id ? D.cyan : D.border}`,
                      color: pitchHeatmapMode === mode.id ? '#000' : D.textSecondary,
                      fontFamily: D.head,
                      fontSize: '10px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pitch Visual Strip */}
            <div
              style={{
                width: '100%',
                height: '360px',
                borderRadius: D.md,
                background: 'linear-gradient(to bottom, #2d5a27, #1e3f1a)',
                position: 'relative',
                overflow: 'hidden',
                border: '2px solid rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Pitch Surface 22 Yards */}
              <div
                style={{
                  width: '140px',
                  height: '100%',
                  background: 'linear-gradient(to bottom, #d4b886, #c2a672, #d4b886)',
                  borderLeft: '2px solid rgba(255,255,255,0.4)',
                  borderRight: '2px solid rgba(255,255,255,0.4)',
                  position: 'relative',
                }}
              >
                {/* Bowling Crease (Top) */}
                <div style={{ position: 'absolute', top: '24px', left: 0, right: 0, height: '2px', background: '#fff' }} />
                {/* Stumps Top */}
                <div style={{ position: 'absolute', top: '18px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '3px' }}>
                  <div style={{ width: '4px', height: '6px', background: '#f59e0b', borderRadius: '1px' }} />
                  <div style={{ width: '4px', height: '6px', background: '#f59e0b', borderRadius: '1px' }} />
                  <div style={{ width: '4px', height: '6px', background: '#f59e0b', borderRadius: '1px' }} />
                </div>

                {/* Length Zones Grid Lines */}
                <div style={{ position: 'absolute', top: '90px', left: 0, right: 0, height: '1px', borderTop: '1px dashed rgba(0,0,0,0.3)' }}>
                  <span style={{ position: 'absolute', right: '4px', top: '-12px', fontSize: '8px', fontFamily: D.mono, color: 'rgba(0,0,0,0.6)' }}>Yorker / Full</span>
                </div>
                <div style={{ position: 'absolute', top: '180px', left: 0, right: 0, height: '1px', borderTop: '1px dashed rgba(0,0,0,0.3)' }}>
                  <span style={{ position: 'absolute', right: '4px', top: '-12px', fontSize: '8px', fontFamily: D.mono, color: 'rgba(0,0,0,0.6)' }}>Good Length (6-8m)</span>
                </div>
                <div style={{ position: 'absolute', top: '270px', left: 0, right: 0, height: '1px', borderTop: '1px dashed rgba(0,0,0,0.3)' }}>
                  <span style={{ position: 'absolute', right: '4px', top: '-12px', fontSize: '8px', fontFamily: D.mono, color: 'rgba(0,0,0,0.6)' }}>Short / Bouncer</span>
                </div>

                {/* Batting Crease (Bottom) */}
                <div style={{ position: 'absolute', bottom: '24px', left: 0, right: 0, height: '2px', background: '#fff' }} />
                {/* Stumps Bottom */}
                <div style={{ position: 'absolute', bottom: '18px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '3px' }}>
                  <div style={{ width: '4px', height: '6px', background: '#f59e0b', borderRadius: '1px' }} />
                  <div style={{ width: '4px', height: '6px', background: '#f59e0b', borderRadius: '1px' }} />
                  <div style={{ width: '4px', height: '6px', background: '#f59e0b', borderRadius: '1px' }} />
                </div>

                {/* Heatmap Delivery Markers */}
                {pitchHeatmapMode === 'outcome_effectiveness' && (
                  <>
                    {/* Wicket Balls */}
                    <div style={{ position: 'absolute', top: '160px', left: '88px', width: '14px', height: '14px', borderRadius: '50%', background: D.rose, border: '2px solid #fff', boxShadow: `0 0 10px ${D.rose}` }} title="Wicket: Daniels to Pillay (Caught Behind)" />
                    <div style={{ position: 'absolute', top: '150px', left: '80px', width: '14px', height: '14px', borderRadius: '50%', background: D.rose, border: '2px solid #fff', boxShadow: `0 0 10px ${D.rose}` }} title="Wicket: Daniels to Smith (Bowled)" />
                    {/* Dot Balls (Good length cluster outside off) */}
                    <div style={{ position: 'absolute', top: '170px', left: '82px', width: '10px', height: '10px', borderRadius: '50%', background: D.emerald }} />
                    <div style={{ position: 'absolute', top: '175px', left: '85px', width: '10px', height: '10px', borderRadius: '50%', background: D.emerald }} />
                    <div style={{ position: 'absolute', top: '165px', left: '78px', width: '10px', height: '10px', borderRadius: '50%', background: D.emerald }} />
                    <div style={{ position: 'absolute', top: '190px', left: '84px', width: '10px', height: '10px', borderRadius: '50%', background: D.emerald }} />
                    {/* Boundary Leaks (Full slot balls) */}
                    <div style={{ position: 'absolute', top: '75px', left: '60px', width: '12px', height: '12px', borderRadius: '50%', background: D.amber, border: '1px solid #fff' }} title="Boundary 4: Overpitched Cover Drive" />
                    <div style={{ position: 'absolute', top: '80px', left: '45px', width: '12px', height: '12px', borderRadius: '50%', background: D.amber, border: '1px solid #fff' }} title="Boundary 6: Full Toss Slotted" />
                  </>
                )}

                {pitchHeatmapMode === 'danger_zones' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '140px',
                      left: '70px',
                      width: '45px',
                      height: '55px',
                      borderRadius: '8px',
                      background: 'rgba(244, 63, 94, 0.4)',
                      border: '2px dashed #f43f5e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: '8px', fontFamily: D.mono, color: '#fff', fontWeight: 900, textAlign: 'center' }}>
                      MAX DANGER ZONE
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pitch Telemetry Breakdown & Filters (5 Cols) */}
          <div style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '18px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}` }}>
              <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
                LENGTH & LINE EFFECTIVENESS LEDGER
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                {[
                  { length: 'Good Length (6-8m outside off)', economy: '3.12', dotPct: '68%', falseShotRate: '34%', effectiveness: 'EXTREME' },
                  { length: 'Short Pitch (>8m)', economy: '4.50', dotPct: '55%', falseShotRate: '28%', effectiveness: 'HIGH' },
                  { length: 'Full / Half Volley (<6m)', economy: '9.40', dotPct: '18%', falseShotRate: '8%', effectiveness: 'POOR (LEAK)' },
                  { length: 'Yorker (<3m at base)', economy: '4.00', dotPct: '60%', falseShotRate: '22%', effectiveness: 'HIGH' },
                ].map((row, idx) => (
                  <div key={idx} style={{ padding: '10px', background: D.surf0, borderRadius: D.md, border: `1px solid ${D.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.textPrimary }}>
                        {row.length}
                      </span>
                      <span style={{ fontFamily: D.mono, fontSize: '10px', fontWeight: 800, color: row.effectiveness.includes('EXTREME') ? D.emerald : row.effectiveness.includes('POOR') ? D.rose : D.cyan }}>
                        {row.effectiveness}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.mono, fontSize: '10px', color: D.textSecondary, marginTop: '4px' }}>
                      <span>Econ: {row.economy}</span>
                      <span>Dot%: {row.dotPct}</span>
                      <span>False Shots: {row.falseShotRate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: WAGON WHEEL INTELLIGENCE ── */}
      {activeTab === 'wagon_wheel' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
          <div style={{ gridColumn: 'span 12', padding: '20px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800, color: D.textPrimary }}>
                  📊 360° WAGON WHEEL TACTICAL ANALYSIS
                </span>
                <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                  Filtered by Batter Stance, Match Phase, and Delivery Trajectory
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontFamily: D.mono, fontSize: '11px', padding: '4px 10px', borderRadius: D.pill, background: D.surf2, color: D.textSecondary }}>
                  Active Batter: M. Patel (RHB)
                </span>
                <span style={{ fontFamily: D.mono, fontSize: '11px', padding: '4px 10px', borderRadius: D.pill, background: `${D.indigo}20`, color: D.indigo, fontWeight: 700 }}>
                  62% Off-Side Bias
                </span>
              </div>
            </div>

            {/* 8-Sector Tactical Breakdown Matrix */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {[
                { sector: '1. Cover / Extra Cover', runs: 42, boundaries: 6, aerialPct: '22%', threat: 'CRITICAL HOTSPOT' },
                { sector: '2. Point / Backward Point', runs: 26, boundaries: 3, aerialPct: '14%', threat: 'HIGH SCORING' },
                { sector: '3. Long Off', runs: 18, boundaries: 2, aerialPct: '60%', threat: 'MODERATE' },
                { sector: '4. Long On', runs: 12, boundaries: 1, aerialPct: '40%', threat: 'CONTROLLED' },
                { sector: '5. Mid Wicket', runs: 16, boundaries: 2, aerialPct: '30%', threat: 'MODERATE' },
                { sector: '6. Square Leg', runs: 8, boundaries: 1, aerialPct: '10%', threat: 'CONTROLLED' },
                { sector: '7. Fine Leg', runs: 6, boundaries: 0, aerialPct: '0%', threat: 'CHOKED' },
                { sector: '8. 3rd Man', runs: 9, boundaries: 1, aerialPct: '10%', threat: 'CONTROLLED' },
              ].map((s, idx) => (
                <div key={idx} style={{ padding: '14px', background: D.surf0, borderRadius: D.md, border: `1px solid ${s.threat.includes('CRITICAL') ? D.rose : D.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.textPrimary }}>
                      {s.sector}
                    </span>
                    <span style={{ fontFamily: D.mono, fontSize: '10px', fontWeight: 800, color: s.threat.includes('CRITICAL') ? D.rose : D.textMuted }}>
                      {s.threat}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.mono, fontSize: '14px', fontWeight: 800, color: D.cyan, marginTop: '6px' }}>
                    <span>{s.runs} runs</span>
                    <span style={{ fontSize: '11px', color: D.textSecondary }}>{s.boundaries} bndrs</span>
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: '10px', color: D.textMuted, marginTop: '4px' }}>
                    Aerial shots: {s.aerialPct}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: FIELD SETTING BOARD & CAPTAIN DISPATCH ── */}
      {activeTab === 'field_planner' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
          {/* Interactive Oval Field Canvas (7 Cols) */}
          <div style={{ gridColumn: 'span 7', padding: '20px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <span style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary }}>
                  🛡️ INTERACTIVE FIELD SETTING BOARD
                </span>
                <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                  Live draggable field plan with LH/RH stance flipping
                </div>
              </div>

              {/* Batter Stance Toggle */}
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setBatterStance('RHB')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: D.pill,
                    background: batterStance === 'RHB' ? D.indigo : D.surf2,
                    border: `1px solid ${batterStance === 'RHB' ? D.indigo : D.border}`,
                    color: batterStance === 'RHB' ? '#fff' : D.textSecondary,
                    fontFamily: D.head,
                    fontSize: '10px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  RHB
                </button>
                <button
                  onClick={() => setBatterStance('LHB')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: D.pill,
                    background: batterStance === 'LHB' ? D.indigo : D.surf2,
                    border: `1px solid ${batterStance === 'LHB' ? D.indigo : D.border}`,
                    color: batterStance === 'LHB' ? '#fff' : D.textSecondary,
                    fontFamily: D.head,
                    fontSize: '10px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  LHB
                </button>
              </div>
            </div>

            {/* Field Oval Graphic */}
            <div
              style={{
                width: '100%',
                height: '380px',
                borderRadius: D.xl,
                background: 'radial-gradient(circle, #2d6a2e 0%, #1a431b 100%)',
                position: 'relative',
                overflow: 'hidden',
                border: '3px solid rgba(255,255,255,0.2)',
                boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6)',
              }}
            >
              {/* 30-Yard Circle */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '58%',
                  height: '58%',
                  borderRadius: '50%',
                  border: '1.5px dashed rgba(255,255,255,0.4)',
                }}
              />

              {/* Pitch Strip */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '24px',
                  height: '80px',
                  background: '#c2a672',
                  borderRadius: '2px',
                  border: '1px solid #fff',
                }}
              />

              {/* Draggable Fielder Markers */}
              {fielders.map((f, idx) => (
                <div
                  key={f.id}
                  style={{
                    position: 'absolute',
                    top: `${f.y}%`,
                    left: `${f.x}%`,
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'grab',
                    zIndex: 10,
                  }}
                >
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: f.role === 'Keeper' ? D.amber : f.role === 'Bowler' ? D.cyan : D.indigo,
                      border: '2px solid #fff',
                      color: '#fff',
                      fontSize: '10px',
                      fontFamily: D.mono,
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                    }}
                  >
                    {idx + 1}
                  </div>
                  <span
                    style={{
                      fontSize: '9px',
                      fontFamily: D.head,
                      fontWeight: 700,
                      color: '#fff',
                      textShadow: '0 1px 3px #000',
                      marginTop: '2px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {f.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Preset Selector & Captain Communication Loop (5 Cols) */}
          <div style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Field Presets Selection */}
            <div style={{ padding: '18px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}` }}>
              <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
                TACTICAL FIELD PRESETS
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                {[
                  { id: 'aggressive_newball', label: 'Aggressive New-Ball', desc: '2 Slips + Gully' },
                  { id: 'lhb_accumulator', label: 'LHB Accumulator', desc: 'Cover Choke' },
                  { id: 'death_yorker', label: 'Death Yorker Plan', desc: 'Deep Ring Protection' },
                  { id: 'legspin_web', label: 'Leg-Spin Web', desc: 'Short Leg Trap' },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => applyFieldPreset(p.id)}
                    style={{
                      padding: '10px',
                      borderRadius: D.md,
                      background: fieldPreset === p.id ? `${D.indigo}25` : D.surf0,
                      border: `1.5px solid ${fieldPreset === p.id ? D.indigo : D.border}`,
                      color: fieldPreset === p.id ? D.indigo : D.textPrimary,
                      fontFamily: D.head,
                      fontSize: '11px',
                      fontWeight: 800,
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div>{p.label}</div>
                    <div style={{ fontSize: '9px', fontFamily: D.body, color: D.textMuted, marginTop: '2px' }}>{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tactical Directives Dispatcher to Captain Cockpit */}
            <div style={{ padding: '18px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.indigo}44`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Send size={16} color={D.indigo} />
                  <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 900, color: D.indigo }}>
                    TRANSMIT DIRECTIVE TO CAPTAIN
                  </span>
                </div>
                <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.emerald }}>Loop Connected</span>
              </div>

              <div>
                <label style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>
                  Coaching Tactical Rationale & Bowling Instruction:
                </label>
                <textarea
                  rows={3}
                  value={tacticalNote}
                  onChange={e => setTacticalNote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: D.md,
                    background: D.surf0,
                    border: `1px solid ${D.border}`,
                    color: D.textPrimary,
                    fontFamily: D.body,
                    fontSize: '12px',
                    resize: 'none',
                  }}
                />
              </div>

              <button
                onClick={handlePushToCaptain}
                style={{
                  padding: '12px',
                  borderRadius: D.pill,
                  background: D.indigo,
                  border: 'none',
                  color: '#fff',
                  fontFamily: D.head,
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: `0 4px 16px ${D.indigo}44`,
                }}
              >
                <Send size={15} />
                <span>Transmit Field & Bowling Plan to Captain Cockpit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: BATTER MATCH-UP MATRIX ── */}
      {activeTab === 'matchups' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ padding: '20px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <span style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800, color: D.textPrimary }}>
                  ⚔️ LIVE BATTER VS BOWLER MATCH-UP MATRIX
                </span>
                <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                  Distinguishing genuine historical tendencies from low-sample anomalies
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${D.border}`, textAlign: 'left' }}>
                    <th style={{ padding: '10px 8px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>BATTER</th>
                    <th style={{ padding: '10px 8px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>BOWLER</th>
                    <th style={{ padding: '10px 8px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted, textAlign: 'center' }}>BALLS</th>
                    <th style={{ padding: '10px 8px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted, textAlign: 'center' }}>RUNS</th>
                    <th style={{ padding: '10px 8px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted, textAlign: 'center' }}>SR</th>
                    <th style={{ padding: '10px 8px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted, textAlign: 'center' }}>DOTS</th>
                    <th style={{ padding: '10px 8px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted, textAlign: 'center' }}>WKT</th>
                    <th style={{ padding: '10px 8px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>EXPLOITABLE WEAKNESS</th>
                    <th style={{ padding: '10px 8px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted, textAlign: 'right' }}>CONFIDENCE</th>
                  </tr>
                </thead>
                <tbody>
                  {matchupData.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid ${D.border}`, background: idx % 2 === 0 ? D.surf0 : 'transparent' }}>
                      <td style={{ padding: '12px 8px', fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>{row.batter}</td>
                      <td style={{ padding: '12px 8px', fontFamily: D.body, fontSize: '12px', color: D.textSecondary }}>{row.bowler}</td>
                      <td style={{ padding: '12px 8px', fontFamily: D.mono, fontSize: '13px', textAlign: 'center' }}>{row.balls}</td>
                      <td style={{ padding: '12px 8px', fontFamily: D.mono, fontSize: '13px', fontWeight: 700, textAlign: 'center', color: D.cyan }}>{row.runs}</td>
                      <td style={{ padding: '12px 8px', fontFamily: D.mono, fontSize: '13px', textAlign: 'center' }}>{row.sr}</td>
                      <td style={{ padding: '12px 8px', fontFamily: D.mono, fontSize: '13px', textAlign: 'center', color: D.emerald }}>{row.dots}</td>
                      <td style={{ padding: '12px 8px', fontFamily: D.mono, fontSize: '13px', fontWeight: 800, textAlign: 'center', color: row.dismissals > 0 ? D.rose : D.textMuted }}>
                        {row.dismissals}
                      </td>
                      <td style={{ padding: '12px 8px', fontFamily: D.body, fontSize: '12px', color: D.amber }}>{row.weakness}</td>
                      <td style={{ padding: '12px 8px', fontFamily: D.mono, fontSize: '11px', textAlign: 'right', color: D.textMuted }}>{row.sampleSize}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 6: BOWLER MANAGEMENT & WORKLOAD RBAC ── */}
      {activeTab === 'bowler_workload' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ padding: '20px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <span style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800, color: D.textPrimary }}>
                  🩺 BOWLER WORKLOAD & SPELL MANAGEMENT
                </span>
                <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                  Strict POPIA RBAC compliance — Clinical medical records protected, operational clearance exposed
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {bowlerWorkloads.map(b => (
                <div
                  key={b.name}
                  style={{
                    padding: '16px',
                    borderRadius: D.md,
                    background: D.surf0,
                    border: `1px solid ${b.workloadStatus === 'RESTRICTED' ? D.amber : D.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 900, color: D.textPrimary }}>{b.name}</div>
                      <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>{b.role}</div>
                    </div>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: D.pill,
                        background: b.workloadStatus === 'RESTRICTED' ? `${D.amber}20` : `${D.emerald}20`,
                        color: b.workloadStatus === 'RESTRICTED' ? D.amber : D.emerald,
                        border: `1px solid ${b.workloadStatus === 'RESTRICTED' ? D.amber : D.emerald}`,
                        fontFamily: D.mono,
                        fontSize: '10px',
                        fontWeight: 800,
                      }}
                    >
                      {b.workloadStatus}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '8px', background: D.surf2, borderRadius: D.sm }}>
                    <div>
                      <span style={{ fontSize: '9px', fontFamily: D.mono, color: D.textMuted }}>Match Figures:</span>
                      <div style={{ fontFamily: D.mono, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>{b.matchFigures}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '9px', fontFamily: D.mono, color: D.textMuted }}>Remaining Quota:</span>
                      <div style={{ fontFamily: D.mono, fontSize: '13px', fontWeight: 800, color: D.cyan }}>{b.allocationRemaining}</div>
                    </div>
                  </div>

                  <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary }}>
                    📋 <strong>Spell History:</strong> {b.spells}
                  </div>

                  <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                    Weekly Workload: {b.weeklyOvers} ov · Today: {b.ballsToday} balls
                  </div>

                  <div style={{ padding: '6px 10px', borderRadius: D.sm, background: `${D.indigo}15`, border: `1px solid ${D.indigo}33`, fontFamily: D.body, fontSize: '10px', color: D.indigo }}>
                    ⚕️ <strong>Operational Status:</strong> {b.medicalClearance}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 7: TEAM SELECTION ROOM ── */}
      {activeTab === 'selection_room' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ padding: '20px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <span style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800, color: D.textPrimary }}>
                  👥 TEAM SELECTION ROOM & BATTING ORDER
                </span>
                <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                  Confirmed Starting XI, Reserve Pool, and Skills Passport Link
                </div>
              </div>

              {onNavigateToSkills && (
                <button
                  onClick={onNavigateToSkills}
                  style={{
                    padding: '6px 14px',
                    borderRadius: D.pill,
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    color: D.textSecondary,
                    fontFamily: D.head,
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  View Skills Matrix Passport →
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
              {squadAvailability.map(p => (
                <div
                  key={p.id}
                  style={{
                    padding: '12px',
                    borderRadius: D.md,
                    background: D.surf0,
                    border: `1px solid ${p.isStartingXI ? D.indigo : D.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.status === 'AVAILABLE' ? D.emerald : p.status === 'LIMITED' ? D.amber : D.rose }} />
                      <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
                        {p.batPos ? `${p.batPos}. ` : ''}{p.name}
                      </span>
                    </div>
                    <div style={{ fontFamily: D.body, fontSize: '10px', color: D.textMuted, marginTop: '2px' }}>
                      {p.role} · Form: {p.form}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontFamily: D.mono, fontSize: '11px', fontWeight: 800, color: D.cyan }}>
                      Skill: {p.skillsRating}
                    </span>
                    <div style={{ fontSize: '9px', fontFamily: D.mono, color: p.isStartingXI ? D.emerald : D.textMuted, marginTop: '2px' }}>
                      {p.isStartingXI ? '✓ Starting XI' : 'Reserve'}
                    </div>
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
