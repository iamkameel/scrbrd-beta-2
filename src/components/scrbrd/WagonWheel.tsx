'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Theme, ShotBall } from './types';

export interface FieldPosition {
  id: string;
  name: string;
  shortName: string;
  x: number; // relative to center (0,0) in range -140..140
  y: number; // relative to center (0,0) in range -140..140
  category: 'cordon' | 'infield' | 'outfield' | 'pitch' | 'umpire';
  side: 'OFF' | 'LEG' | 'STRAIGHT';
  description: string;
}

export interface SectorDefinition {
  id: string;
  name: string;
  shortName: string;
  side: 'OFF' | 'LEG';
  angleStart: number; // 0..360 where 0° = straight down to bowler (South), 90° = Leg square (East), 180° = Behind keeper (North), 270° = Off square (West)
  angleEnd: number;
  color: string;
  bgGrad: string;
}

// 8 Canonical Broadcast Sectors (Right Hand Batter perspective: facing South towards Bowler)
// 0° = South (Bowler/Long Off/On), 90° = East (Square Leg), 180° = North (Fine Leg/Third Man), 270° = West (Point)
export const CANONICAL_SECTORS_RHB: SectorDefinition[] = [
  { id: 'third_man', name: 'Third Man', shortName: '3rd Man', side: 'OFF', angleStart: 180, angleEnd: 235, color: '#38bdf8', bgGrad: 'rgba(56, 189, 248, 0.15)' },
  { id: 'point', name: 'Point', shortName: 'Point', side: 'OFF', angleStart: 235, angleEnd: 290, color: '#818cf8', bgGrad: 'rgba(129, 140, 248, 0.15)' },
  { id: 'cover', name: 'Cover / Extra Cover', shortName: 'Covers', side: 'OFF', angleStart: 290, angleEnd: 345, color: '#a78bfa', bgGrad: 'rgba(167, 139, 250, 0.15)' },
  { id: 'long_off', name: 'Long Off', shortName: 'Long Off', side: 'OFF', angleStart: 345, angleEnd: 360, color: '#ec4899', bgGrad: 'rgba(236, 72, 153, 0.15)' },
  { id: 'long_on', name: 'Long On', shortName: 'Long On', side: 'LEG', angleStart: 0, angleEnd: 25, color: '#f43f5e', bgGrad: 'rgba(244, 63, 94, 0.15)' },
  { id: 'mid_wicket', name: 'Mid-Wicket', shortName: 'Mid-Wkt', side: 'LEG', angleStart: 25, angleEnd: 85, color: '#f59e0b', bgGrad: 'rgba(245, 158, 11, 0.15)' },
  { id: 'square_leg', name: 'Square Leg', shortName: 'Sq Leg', side: 'LEG', angleStart: 85, angleEnd: 135, color: '#10b981', bgGrad: 'rgba(16, 185, 129, 0.15)' },
  { id: 'fine_leg', name: 'Fine Leg', shortName: 'Fine Leg', side: 'LEG', angleStart: 135, angleEnd: 180, color: '#14b8a6', bgGrad: 'rgba(20, 184, 166, 0.15)' },
];

export interface WagonWheelProps {
  theme?: Theme;
  batsmanName?: string;
  batHand?: 'R' | 'L';
  onShotAdded?: (shot: ShotBall) => void;
  initialShots?: ShotBall[];
  shots?: ShotBall[];
  inningsSummary?: string;
}

function normalizeShot(s: ShotBall, defaultBatter: string): ShotBall {
  let x = s.x;
  let y = s.y;
  let sector = s.sector;
  if ((x == null || y == null) && s.angle != null) {
    const rad = (s.angle * Math.PI) / 180;
    const dist = s.distance ? Math.min(138, (s.distance / 110) * 130) : (s.runs >= 6 ? 130 : s.runs >= 4 ? 110 : 60);
    x = Math.round(Math.sin(rad) * dist);
    y = Math.round(-Math.cos(rad) * dist);
  }
  if (!sector) {
    sector = s.stroke || 'Mid-Wicket';
  }
  return {
    ...s,
    x: x ?? 0,
    y: y ?? 0,
    sector: sector || 'Mid-Wicket',
    batsman: s.batsman || defaultBatter,
    description: s.description || `${s.runs} runs (${s.stroke || sector || 'Shot'})`,
  };
}

// Default realistic professional sample innings (e.g. 74 off 48 balls)
const SAMPLE_PROFESSIONAL_SHOTS: ShotBall[] = [
  // Sixes (Ruby Red)
  { id: 'w1', x: -55, y: 138, runs: 6, sector: 'Long Off', batsman: 'James Whitfield', bowler: 'T. Smith', over: '4.2', description: 'Lofted drive cleanly over the long-off boundary rope' },
  { id: 'w2', x: 75, y: 110, runs: 6, sector: 'Mid-Wicket', batsman: 'James Whitfield', bowler: 'R. Patel', over: '9.5', description: 'Massive pull shot clearing deep mid-wicket into the stands' },
  { id: 'w3', x: 25, y: 140, runs: 6, sector: 'Long On', batsman: 'James Whitfield', bowler: 'J. Thompson', over: '16.4', description: 'Straight loft over bowler and sight-screen for a 92m maximum' },
  // Fours (Royal Electric Blue)
  { id: 'w4', x: -115, y: 65, runs: 4, sector: 'Cover / Extra Cover', batsman: 'James Whitfield', bowler: 'T. Smith', over: '1.4', description: 'Classic cover drive piercing the gap between extra cover and mid-off' },
  { id: 'w5', x: -130, y: -10, runs: 4, sector: 'Point', batsman: 'James Whitfield', bowler: 'T. Smith', over: '2.1', description: 'Ferocious square cut beating backward point to the fence' },
  { id: 'w6', x: -95, y: 95, runs: 4, sector: 'Cover / Extra Cover', batsman: 'James Whitfield', bowler: 'J. Thompson', over: '5.3', description: 'Crisp inside-out lofted drive through extra cover' },
  { id: 'w7', x: 110, y: 70, runs: 4, sector: 'Mid-Wicket', batsman: 'James Whitfield', bowler: 'R. Patel', over: '7.4', description: 'Whipped off the pads through cow corner' },
  { id: 'w8', x: 125, y: -15, runs: 4, sector: 'Square Leg', batsman: 'James Whitfield', bowler: 'J. Thompson', over: '11.2', description: 'Authoritative pull shot forward of square leg' },
  { id: 'w9', x: 80, y: -105, runs: 4, sector: 'Fine Leg', batsman: 'James Whitfield', bowler: 'K. Naidoo', over: '12.4', description: 'Delicate glance beating short fine leg' },
  { id: 'w10', x: -75, y: -110, runs: 4, sector: 'Third Man', batsman: 'James Whitfield', bowler: 'T. Smith', over: '13.1', description: 'Steered off the thick outside edge fine of gully' },
  // Triples & Doubles (Cyan & Magenta)
  { id: 'w11', x: -90, y: 50, runs: 3, sector: 'Cover / Extra Cover', batsman: 'James Whitfield', bowler: 'R. Patel', over: '8.3', description: 'Driven into the deep cover sweeper gap, 3 runs taken' },
  { id: 'w12', x: -40, y: 90, runs: 2, sector: 'Long Off', batsman: 'James Whitfield', bowler: 'T. Smith', over: '3.3', description: 'Pushed down to long off for a comfortable brace' },
  { id: 'w13', x: 45, y: 85, runs: 2, sector: 'Long On', batsman: 'James Whitfield', bowler: 'R. Patel', over: '6.2', description: 'Worked down the ground to long on' },
  { id: 'w14', x: 85, y: 45, runs: 2, sector: 'Mid-Wicket', batsman: 'James Whitfield', bowler: 'J. Thompson', over: '8.1', description: 'Clipped through mid-wicket for two runs' },
  { id: 'w15', x: -70, y: -70, runs: 2, sector: 'Third Man', batsman: 'James Whitfield', bowler: 'K. Naidoo', over: '14.5', description: 'Guided behind point down towards third man' },
  // Singles (Golden Amber)
  { id: 'w16', x: -50, y: 40, runs: 1, sector: 'Cover / Extra Cover', batsman: 'James Whitfield', bowler: 'T. Smith', over: '1.1', description: 'Dabbed into the covers for a quick single' },
  { id: 'w17', x: 30, y: 45, runs: 1, sector: 'Mid-Wicket', batsman: 'James Whitfield', bowler: 'T. Smith', over: '1.2', description: 'Nudged softly towards mid on' },
  { id: 'w18', x: 60, y: -20, runs: 1, sector: 'Square Leg', batsman: 'James Whitfield', bowler: 'R. Patel', over: '6.5', description: 'Turned off the hips behind square' },
  { id: 'w19', x: -55, y: -30, runs: 1, sector: 'Point', batsman: 'James Whitfield', bowler: 'K. Naidoo', over: '10.3', description: 'Square cut directed to deep point' },
  { id: 'w20', x: 40, y: -70, runs: 1, sector: 'Fine Leg', batsman: 'James Whitfield', bowler: 'T. Smith', over: '15.2', description: 'Tucked down to fine leg' },
  // Dots (Muted Slate)
  { id: 'w21', x: -10, y: 25, runs: 0, sector: 'Long Off', batsman: 'James Whitfield', bowler: 'T. Smith', over: '1.3', description: 'Solid forward defensive back to the bowler' },
  { id: 'w22', x: -40, y: 20, runs: 0, sector: 'Cover / Extra Cover', batsman: 'James Whitfield', bowler: 'T. Smith', over: '2.4', description: 'Pushed firmly straight to extra cover' },
  { id: 'w23', x: 35, y: 20, runs: 0, sector: 'Mid-Wicket', batsman: 'James Whitfield', bowler: 'J. Thompson', over: '5.1', description: 'Defended cleanly to mid on' },
  { id: 'w24', x: -35, y: -15, runs: 0, sector: 'Point', batsman: 'James Whitfield', bowler: 'R. Patel', over: '7.1', description: 'Beaten by bounce outside off, dabbed to backward point' },
];

const DEFAULT_THEME: Theme = {
  bg: '#0b0f19',
  surf0: '#0e1424',
  surf1: '#141c2e',
  surf2: '#1c263d',
  surf3: '#253352',
  border: 'rgba(255,255,255,0.08)',
  borderMed: 'rgba(255,255,255,0.15)',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  cardBg: '#141c2e',
  isDark: true,
  indigo: '#6366f1',
  sky: '#38bdf8',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  orange: '#f97316',
  violet: '#8b5cf6',
  cyan: '#06b6d4',
  teal: '#14b8a6',
  lime: '#84cc16',
  pink: '#ec4899',
  gradMain: 'linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)',
  gradGold: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
  gradLive: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  pill: '9999px',
  mono: "'JetBrains Mono', 'DM Mono', monospace",
  head: "'Space Grotesk', system-ui, sans-serif",
  body: "'Inter', system-ui, sans-serif",
};

// ── COLOR CODING SCHEME (Standard Broadcast: BCCI / ESPNcricinfo / Fox Cricket) ──
export const SHOT_COLORS: Record<number | string, { stroke: string; label: string; bg: string }> = {
  6: { stroke: '#ef4444', label: '6s (Sixes)', bg: 'rgba(239, 68, 68, 0.2)' },
  4: { stroke: '#3b82f6', label: '4s (Fours)', bg: 'rgba(59, 130, 246, 0.2)' },
  3: { stroke: '#06b6d4', label: '3s (Triples)', bg: 'rgba(6, 182, 212, 0.2)' },
  2: { stroke: '#d946ef', label: '2s (Doubles)', bg: 'rgba(217, 70, 239, 0.2)' },
  1: { stroke: '#f59e0b', label: '1s (Singles)', bg: 'rgba(245, 158, 11, 0.2)' },
  0: { stroke: '#94a3b8', label: 'Dots (•)', bg: 'rgba(148, 163, 184, 0.2)' },
};

export default function WagonWheel({
  theme: customTheme,
  batsmanName = "James Whitfield",
  batHand: initialBatHand = 'R',
  onShotAdded,
  initialShots = SAMPLE_PROFESSIONAL_SHOTS,
  shots: propShots,
  inningsSummary,
}: WagonWheelProps) {
  const D = customTheme || DEFAULT_THEME;
  const [batHand, setBatHand] = useState<'R' | 'L'>(initialBatHand);
  const [shots, setShots] = useState<ShotBall[]>(() =>
    (propShots || initialShots).map(s => normalizeShot(s, batsmanName))
  );

  useEffect(() => {
    if (propShots && propShots.length > 0) {
      setShots(propShots.map(s => normalizeShot(s, batsmanName)));
    }
  }, [propShots, batsmanName]);

  const [filterRuns, setFilterRuns] = useState<number | 'all' | 'boundaries'>('all');
  const [selectedShot, setSelectedShot] = useState<ShotBall | null>(null);
  const [activeTab, setActiveTab] = useState<'wheel' | 'sectors' | 'fielders' | 'zones'>('wheel');
  const [showFielderOverlay, setShowFielderOverlay] = useState<boolean>(true);
  const [fieldPreset, setFieldPreset] = useState<'standard' | 'powerplay' | 'attacking' | 'death'>('standard');
  const [displayMode, setDisplayMode] = useState<'spokes' | 'heatmap' | 'sectors' | 'density'>('spokes');
  const [selectedVenue, setSelectedVenue] = useState<string>('standard_65m');

  const VENUE_GEOMETRIES = [
    { id: 'standard_65m', name: 'Standard Oval (65m)', boundaryMeters: 65 },
    { id: 'kingsmead_68m', name: 'Kingsmead Stadium (68m)', boundaryMeters: 68 },
    { id: 'st_charles_55m', name: 'St Charles Oval (55m)', boundaryMeters: 55 },
    { id: 'michaelhouse_60m', name: 'Michaelhouse Meadows (60m)', boundaryMeters: 60 },
    { id: 'hilton_64m', name: "Hilton College Campbell's (64m)", boundaryMeters: 64 },
    { id: 'kearsney_63m', name: 'Kearsney College AH Smith (63m)', boundaryMeters: 63 },
    { id: 'maritzburg_62m', name: 'Maritzburg College Goldstones (62m)', boundaryMeters: 62 },
  ];

  const currentVenue = VENUE_GEOMETRIES.find(v => v.id === selectedVenue) || VENUE_GEOMETRIES[0];

  // ── CONSTANTS FOR PITCH & GROUND GEOMETRY (SVG viewBox 0 0 360 360) ──
  // Ground Center: (180, 180)
  // Pitch is vertically oriented in center from y=152 to y=208
  // Striker Batting Crease is at (180, 160) - Facing SOUTH towards Bowler!
  // Bowler Bowling Crease is at (180, 200) - Running up towards NORTH!
  const SVG_CENTER_X = 180;
  const SVG_CENTER_Y = 180;
  const STRIKER_ORIGIN_X = 180;
  const STRIKER_ORIGIN_Y = 160; // Exact Batting Crease Origin
  const BOWLER_CREASE_Y = 200;
  const BOUNDARY_RADIUS = 150;
  // 30 yards = 27.432m. Normalized against venue boundary:
  const INFIELD_RADIUS = Math.round((27.432 / currentVenue.boundaryMeters) * BOUNDARY_RADIUS);

  // Dynamic Fielder Placements based on Preset & Stance
  const fielders: FieldPosition[] = useMemo(() => {
    const isLHB = batHand === 'L';
    const mirror = (x: number) => (isLHB ? -x : x);

    // Base coordinates relative to center (0,0) where (0, -20) is striker, (0, +20) is bowler
    // Off side is -X for RHB, Leg side is +X for RHB
    let baseList: FieldPosition[] = [];

    if (fieldPreset === 'standard') {
      baseList = [
        { id: 'wk', name: 'Wicket-Keeper', shortName: 'WK', x: mirror(0), y: -52, category: 'cordon', side: 'OFF', description: 'Directly behind striker stumps' },
        { id: 'slip1', name: '1st Slip', shortName: '1st Slip', x: mirror(-22), y: -48, category: 'cordon', side: 'OFF', description: 'Slip cordon off-side behind batter' },
        { id: 'point', name: 'Point', shortName: 'Point', x: mirror(-72), y: -20, category: 'infield', side: 'OFF', description: 'Square of the wicket on off side' },
        { id: 'cover', name: 'Cover', shortName: 'Cover', x: mirror(-65), y: 32, category: 'infield', side: 'OFF', description: 'Infield 30yd ring cover' },
        { id: 'midoff', name: 'Mid-Off', shortName: 'Mid-Off', x: mirror(-28), y: 55, category: 'infield', side: 'OFF', description: 'Straight off side inner ring' },
        { id: 'midon', name: 'Mid-On', shortName: 'Mid-On', x: mirror(28), y: 55, category: 'infield', side: 'LEG', description: 'Straight leg side inner ring' },
        { id: 'midwicket', name: 'Mid-Wicket', shortName: 'Mid-Wkt', x: mirror(68), y: 32, category: 'infield', side: 'LEG', description: 'Infield 30yd ring mid-wicket' },
        { id: 'sqleg', name: 'Square Leg', shortName: 'Sq Leg', x: mirror(72), y: -20, category: 'infield', side: 'LEG', description: 'Square of the wicket on leg side' },
        { id: 'deepfine', name: 'Deep Fine Leg', shortName: 'Deep Fine', x: mirror(80), y: -115, category: 'outfield', side: 'LEG', description: 'Boundary behind square leg' },
        { id: 'thirdman', name: 'Third Man', shortName: '3rd Man', x: mirror(-80), y: -115, category: 'outfield', side: 'OFF', description: 'Boundary behind square off' },
        { id: 'bowler', name: 'Bowler', shortName: 'Bowler', x: 0, y: 30, category: 'pitch', side: 'STRAIGHT', description: 'Bowler at non-striker release end' },
      ];
    } else if (fieldPreset === 'powerplay') {
      baseList = [
        { id: 'wk', name: 'Wicket-Keeper', shortName: 'WK', x: mirror(0), y: -52, category: 'cordon', side: 'OFF', description: 'Behind stumps' },
        { id: 'slip1', name: '1st Slip', shortName: '1st Slip', x: mirror(-20), y: -48, category: 'cordon', side: 'OFF', description: 'Attacking 1st Slip' },
        { id: 'slip2', name: '2nd Slip', shortName: '2nd Slip', x: mirror(-36), y: -44, category: 'cordon', side: 'OFF', description: 'Attacking 2nd Slip' },
        { id: 'gully', name: 'Gully', shortName: 'Gully', x: mirror(-54), y: -34, category: 'cordon', side: 'OFF', description: 'Backward point / Gully' },
        { id: 'cover', name: 'Extra Cover', shortName: 'Ex Cover', x: mirror(-65), y: 32, category: 'infield', side: 'OFF', description: 'Cover ring' },
        { id: 'midoff', name: 'Mid-Off', shortName: 'Mid-Off', x: mirror(-28), y: 55, category: 'infield', side: 'OFF', description: 'Mid-off ring' },
        { id: 'midon', name: 'Mid-On', shortName: 'Mid-On', x: mirror(28), y: 55, category: 'infield', side: 'LEG', description: 'Mid-on ring' },
        { id: 'midwicket', name: 'Mid-Wicket', shortName: 'Mid-Wkt', x: mirror(68), y: 30, category: 'infield', side: 'LEG', description: 'Mid-wicket ring' },
        { id: 'deepsqleg', name: 'Deep Square Leg', shortName: 'Deep Sq', x: mirror(120), y: -20, category: 'outfield', side: 'LEG', description: 'Boundary rider' },
        { id: 'thirdman', name: 'Deep Third Man', shortName: 'Deep 3rd', x: mirror(-90), y: -115, category: 'outfield', side: 'OFF', description: 'Boundary rider' },
        { id: 'bowler', name: 'Bowler', shortName: 'Bowler', x: 0, y: 30, category: 'pitch', side: 'STRAIGHT', description: 'Bowler delivery' },
      ];
    } else if (fieldPreset === 'attacking') {
      baseList = [
        { id: 'wk', name: 'Wicket-Keeper', shortName: 'WK', x: mirror(0), y: -42, category: 'cordon', side: 'OFF', description: 'Standing up to stumps' },
        { id: 'slip1', name: '1st Slip', shortName: '1st Slip', x: mirror(-16), y: -40, category: 'cordon', side: 'OFF', description: 'Close slip' },
        { id: 'slip2', name: '2nd Slip', shortName: '2nd Slip', x: mirror(-30), y: -38, category: 'cordon', side: 'OFF', description: 'Close slip' },
        { id: 'slip3', name: '3rd Slip', shortName: '3rd Slip', x: mirror(-44), y: -34, category: 'cordon', side: 'OFF', description: 'Close slip' },
        { id: 'gully', name: 'Gully', shortName: 'Gully', x: mirror(-58), y: -28, category: 'cordon', side: 'OFF', description: 'Catching gully' },
        { id: 'sillypoint', name: 'Silly Point', shortName: 'Silly Pt', x: mirror(-24), y: -16, category: 'cordon', side: 'OFF', description: 'Bat-pad off side' },
        { id: 'shortleg', name: 'Short Leg', shortName: 'Short Leg', x: mirror(24), y: -16, category: 'cordon', side: 'LEG', description: 'Bat-pad leg side' },
        { id: 'midoff', name: 'Short Mid-Off', shortName: 'Mid-Off', x: mirror(-35), y: 40, category: 'infield', side: 'OFF', description: 'Catching ring' },
        { id: 'midon', name: 'Short Mid-On', shortName: 'Mid-On', x: mirror(35), y: 40, category: 'infield', side: 'LEG', description: 'Catching ring' },
        { id: 'fineleg', name: 'Fine Leg', shortName: 'Fine Leg', x: mirror(55), y: -90, category: 'outfield', side: 'LEG', description: 'Boundary saving' },
        { id: 'bowler', name: 'Bowler', shortName: 'Bowler', x: 0, y: 30, category: 'pitch', side: 'STRAIGHT', description: 'Bowler attack' },
      ];
    } else {
      // Death overs (5 Deep Boundary Riders)
      baseList = [
        { id: 'wk', name: 'Wicket-Keeper', shortName: 'WK', x: mirror(0), y: -52, category: 'cordon', side: 'OFF', description: 'Back behind stumps' },
        { id: 'point', name: 'Point', shortName: 'Point', x: mirror(-65), y: -15, category: 'infield', side: 'OFF', description: 'Infield point' },
        { id: 'cover', name: 'Cover', shortName: 'Cover', x: mirror(-55), y: 25, category: 'infield', side: 'OFF', description: 'Infield cover' },
        { id: 'midwkt', name: 'Mid-Wicket', shortName: 'Mid-Wkt', x: mirror(55), y: 25, category: 'infield', side: 'LEG', description: 'Infield mid-wicket' },
        { id: 'deepcover', name: 'Deep Extra Cover', shortName: 'Deep Ex Cover', x: mirror(-115), y: 65, category: 'outfield', side: 'OFF', description: 'Boundary sweeper' },
        { id: 'longoff', name: 'Long Off', shortName: 'Long Off', x: mirror(-55), y: 130, category: 'outfield', side: 'OFF', description: 'Deep straight boundary' },
        { id: 'longon', name: 'Long On', shortName: 'Long On', x: mirror(55), y: 130, category: 'outfield', side: 'LEG', description: 'Deep straight boundary' },
        { id: 'deepmidwkt', name: 'Deep Mid-Wicket', shortName: 'Deep Mid-Wkt', x: mirror(110), y: 75, category: 'outfield', side: 'LEG', description: 'Cow corner boundary' },
        { id: 'deepsqleg', name: 'Deep Square Leg', shortName: 'Deep Sq Leg', x: mirror(125), y: -20, category: 'outfield', side: 'LEG', description: 'Deep leg boundary' },
        { id: 'deepfine', name: 'Deep Fine Leg', shortName: 'Deep Fine Leg', x: mirror(80), y: -115, category: 'outfield', side: 'LEG', description: 'Deep fine boundary' },
        { id: 'bowler', name: 'Bowler', shortName: 'Bowler', x: 0, y: 30, category: 'pitch', side: 'STRAIGHT', description: 'Yorker specialist' },
      ];
    }
    return baseList;
  }, [fieldPreset, batHand]);

  // Filtered shot deliveries
  const filteredShots = useMemo(() => {
    if (filterRuns === 'all') return shots;
    if (filterRuns === 'boundaries') return shots.filter(s => s.runs === 4 || s.runs === 6);
    return shots.filter(s => s.runs === filterRuns);
  }, [shots, filterRuns]);

  // Overall & Side Metrics (OFF vs LEG / ON)
  const stats = useMemo(() => {
    let totalRuns = 0;
    let totalBalls = shots.length;
    let dotBalls = 0;
    let fours = 0;
    let sixes = 0;
    let offRuns = 0;
    let legRuns = 0;
    let offBalls = 0;
    let legBalls = 0;
    let offFours = 0;
    let legFours = 0;
    let offSixes = 0;
    let legSixes = 0;

    shots.forEach(s => {
      totalRuns += s.runs;
      if (s.runs === 0) dotBalls++;
      if (s.runs === 4) fours++;
      if (s.runs === 6) sixes++;

      // Off Side vs Leg Side calculation based on X relative to striker
      // For RHB: X < 0 is OFF, X > 0 is LEG
      // For LHB: X > 0 is OFF, X < 0 is LEG
      const sx = s.x ?? 0;
      const isOffSide = batHand === 'R' ? sx < 0 : sx > 0;
      if (isOffSide) {
        offRuns += s.runs;
        offBalls++;
        if (s.runs === 4) offFours++;
        if (s.runs === 6) offSixes++;
      } else {
        legRuns += s.runs;
        legBalls++;
        if (s.runs === 4) legFours++;
        if (s.runs === 6) legSixes++;
      }
    });

    const strikeRate = totalBalls > 0 ? ((totalRuns / totalBalls) * 100).toFixed(1) : '0.0';
    const boundaryRuns = fours * 4 + sixes * 6;
    const boundaryPct = totalRuns > 0 ? Math.round((boundaryRuns / totalRuns) * 100) : 0;
    const offPct = totalRuns > 0 ? Math.round((offRuns / totalRuns) * 100) : 50;
    const legPct = totalRuns > 0 ? 100 - offPct : 50;

    return {
      totalRuns,
      totalBalls,
      dotBalls,
      fours,
      sixes,
      strikeRate,
      boundaryRuns,
      boundaryPct,
      offRuns,
      legRuns,
      offBalls,
      legBalls,
      offFours,
      legFours,
      offSixes,
      legSixes,
      offPct,
      legPct,
    };
  }, [shots, batHand]);

  // Sector breakdown calculations
  const sectorData = useMemo(() => {
    const list = CANONICAL_SECTORS_RHB.map(sec => {
      // Sector names
      const secShots = shots.filter(s => {
        const secName = s.sector || '';
        if (secName.toLowerCase().includes(sec.shortName.toLowerCase())) return true;
        if (sec.id === 'cover' && (secName.includes('Cover') || secName.includes('Covers'))) return true;
        if (sec.id === 'third_man' && secName.includes('Third Man')) return true;
        if (sec.id === 'point' && secName.includes('Point')) return true;
        if (sec.id === 'long_off' && secName.includes('Long Off')) return true;
        if (sec.id === 'long_on' && secName.includes('Long On')) return true;
        if (sec.id === 'mid_wicket' && (secName.includes('Mid-Wicket') || secName.includes('Cow Corner'))) return true;
        if (sec.id === 'square_leg' && secName.includes('Square Leg')) return true;
        if (sec.id === 'fine_leg' && secName.includes('Fine Leg')) return true;
        return false;
      });

      const runs = secShots.reduce((acc, cur) => acc + cur.runs, 0);
      const balls = secShots.length;
      const secFours = secShots.filter(s => s.runs === 4).length;
      const secSixes = secShots.filter(s => s.runs === 6).length;
      const sr = balls > 0 ? Math.round((runs / balls) * 100) : 0;
      const pct = stats.totalRuns > 0 ? Math.round((runs / stats.totalRuns) * 100) : 0;

      return {
        ...sec,
        runs,
        balls,
        fours: secFours,
        sixes: secSixes,
        sr,
        pct,
      };
    });

    return list;
  }, [shots, stats.totalRuns]);

  // ── INTERACTIVE CANVAS CLICK HANDLER ──
  // Accurately maps click point to striker-crease radiation vector
  const handleFieldClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickClientX = e.clientX - rect.left;
    const clickClientY = e.clientY - rect.top;

    // Convert SVG viewbox coordinates (0..360, 0..360)
    const svgX = (clickClientX / rect.width) * 360;
    const svgY = (clickClientY / rect.height) * 360;

    // Vector from striker's batting crease (180, 160)
    const dx = svgX - STRIKER_ORIGIN_X;
    const dy = svgY - STRIKER_ORIGIN_Y;
    const distFromStriker = Math.sqrt(dx * dx + dy * dy);

    // Distance from ground center (180, 180) to check boundary cutoff
    const distFromCenter = Math.sqrt((svgX - SVG_CENTER_X) ** 2 + (svgY - SVG_CENTER_Y) ** 2);
    if (distFromCenter > BOUNDARY_RADIUS + 15) return; // Ignore clicks outside boundary

    // Calculate polar angle from striker
    // 0 rad = Straight Down (+Y towards bowler), +pi/2 = Right (+X), -pi/2 = Left (-X)
    let angleRad = Math.atan2(dx, dy); // 0 at +Y (straight south), +pi/2 at +X (east), -pi/2 at -X (west)
    let angleDeg = (angleRad * 180) / Math.PI;
    if (angleDeg < 0) angleDeg += 360; // 0..360 where 0 = South, 90 = East, 180 = North, 270 = West

    // Adjust for batter stance
    const effectiveAngle = batHand === 'L' ? (360 - angleDeg) % 360 : angleDeg;

    // Determine 8 canonical sector
    let detectedSector = 'Cover / Extra Cover';
    if (effectiveAngle >= 180 && effectiveAngle < 235) detectedSector = 'Third Man';
    else if (effectiveAngle >= 235 && effectiveAngle < 290) detectedSector = 'Point';
    else if (effectiveAngle >= 290 && effectiveAngle < 345) detectedSector = 'Cover / Extra Cover';
    else if (effectiveAngle >= 345 || effectiveAngle < 15) detectedSector = effectiveAngle >= 345 ? 'Long Off' : 'Long On';
    else if (effectiveAngle >= 15 && effectiveAngle < 85) detectedSector = 'Mid-Wicket';
    else if (effectiveAngle >= 85 && effectiveAngle < 135) detectedSector = 'Square Leg';
    else if (effectiveAngle >= 135 && effectiveAngle < 180) detectedSector = 'Fine Leg';

    // Automatic runs detection based on distance
    let calculatedRuns = 1;
    if (distFromCenter >= BOUNDARY_RADIUS - 8) {
      calculatedRuns = distFromCenter >= BOUNDARY_RADIUS ? 6 : 4;
    } else if (distFromStriker < 35) {
      calculatedRuns = 0;
    } else if (distFromStriker < 75) {
      calculatedRuns = 1;
    } else {
      calculatedRuns = 2;
    }

    // Relative offset coordinates (-140 to +140) for storage
    const relX = Math.round(svgX - SVG_CENTER_X);
    const relY = Math.round(svgY - SVG_CENTER_Y);

    const newShot: ShotBall = {
      id: `w_shot_${Date.now()}`,
      x: relX,
      y: relY,
      runs: calculatedRuns,
      sector: detectedSector,
      batsman: batsmanName,
      bowler: 'Active Bowler',
      over: '14.3',
      description: `${calculatedRuns === 6 ? 'Maximum Six' : calculatedRuns === 4 ? 'Boundary Four' : calculatedRuns === 0 ? 'Dot Ball' : `${calculatedRuns} Run(s)`} stroked to ${detectedSector} (${batHand === 'R' ? (relX < 0 ? 'Off Side' : 'Leg Side') : relX > 0 ? 'Off Side' : 'Leg Side'})`,
    };

    setShots(prev => [newShot, ...prev]);
    setSelectedShot(newShot);
    if (onShotAdded) onShotAdded(newShot);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: D.textPrimary }}>
      {/* ── TOP CONTROL HEADER ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: D.surf1,
          padding: '14px 18px',
          borderRadius: D.lg,
          border: `1px solid ${D.borderMed}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: D.md,
              background: `linear-gradient(135deg, ${D.emerald}25, ${D.sky}25)`,
              border: `1px solid ${D.emerald}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            🎯
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.textPrimary }}>
                PRO WAGON WHEEL & FIELD PLACEMENT TECH
              </span>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: D.pill,
                  background: `${D.emerald}20`,
                  color: D.emerald,
                  fontFamily: D.mono,
                  fontSize: '10px',
                  fontWeight: 800,
                  border: `1px solid ${D.emerald}40`,
                }}
              >
                RADIAL CREASE ORIGIN
              </span>
            </div>
            <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textSecondary, marginTop: '2px' }}>
              {batsmanName} · <strong style={{ color: D.textPrimary }}>{stats.totalRuns} Runs</strong> ({stats.totalBalls} Balls) · SR <strong style={{ color: D.sky }}>{stats.strikeRate}</strong> · {stats.fours}x4, {stats.sixes}x6
            </div>
          </div>
        </div>

        {/* Action Controls, Mode Switcher & Stance Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Visualization Mode Selector */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: D.surf2,
              borderRadius: D.pill,
              border: `1px solid ${D.border}`,
              padding: '2px',
            }}
          >
            <button
              onClick={() => setDisplayMode('spokes')}
              style={{
                padding: '4px 10px',
                borderRadius: D.pill,
                background: displayMode === 'spokes' ? D.indigo : 'transparent',
                color: displayMode === 'spokes' ? '#fff' : D.textMuted,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              🎯 Spokes
            </button>
            <button
              onClick={() => setDisplayMode('heatmap')}
              style={{
                padding: '4px 10px',
                borderRadius: D.pill,
                background: displayMode === 'heatmap' ? D.rose : 'transparent',
                color: displayMode === 'heatmap' ? '#fff' : D.textMuted,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              🔥 Heat Map
            </button>
            <button
              onClick={() => setDisplayMode('sectors')}
              style={{
                padding: '4px 10px',
                borderRadius: D.pill,
                background: displayMode === 'sectors' ? D.amber : 'transparent',
                color: displayMode === 'sectors' ? '#fff' : D.textMuted,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              📊 Sectors
            </button>
            <button
              onClick={() => setDisplayMode('density')}
              style={{
                padding: '4px 10px',
                borderRadius: D.pill,
                background: displayMode === 'density' ? D.emerald : 'transparent',
                color: displayMode === 'density' ? '#fff' : D.textMuted,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              ⚡ Density
            </button>
          </div>

          {/* Venue Boundary Selector */}
          <select
            value={selectedVenue}
            onChange={e => setSelectedVenue(e.target.value)}
            style={{
              padding: '5px 10px',
              borderRadius: D.pill,
              background: D.surf2,
              border: `1px solid ${D.borderMed}`,
              color: D.textPrimary,
              fontFamily: D.mono,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none',
            }}
            title="Ground Geometry & Boundary Calibration"
          >
            {VENUE_GEOMETRIES.map(v => (
              <option key={v.id} value={v.id}>
                🏟️ {v.name}
              </option>
            ))}
          </select>

          {/* Batting Hand Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: D.surf2,
              borderRadius: D.pill,
              border: `1px solid ${D.border}`,
              padding: '2px',
            }}
          >
            <button
              onClick={() => setBatHand('R')}
              style={{
                padding: '4px 12px',
                borderRadius: D.pill,
                background: batHand === 'R' ? D.indigo : 'transparent',
                color: batHand === 'R' ? '#fff' : D.textMuted,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              RHB (Right-Hand)
            </button>
            <button
              onClick={() => setBatHand('L')}
              style={{
                padding: '4px 12px',
                borderRadius: D.pill,
                background: batHand === 'L' ? D.indigo : 'transparent',
                color: batHand === 'L' ? '#fff' : D.textMuted,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              LHB (Left-Hand)
            </button>
          </div>

          {/* Fielder Overlay Toggle */}
          <button
            onClick={() => setShowFielderOverlay(!showFielderOverlay)}
            style={{
              padding: '5px 12px',
              borderRadius: D.pill,
              background: showFielderOverlay ? `${D.emerald}25` : D.surf2,
              border: `1px solid ${showFielderOverlay ? D.emerald : D.border}`,
              color: showFielderOverlay ? D.emerald : D.textSecondary,
              fontFamily: D.head,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>🛡️</span>
            <span>{showFielderOverlay ? 'Fielders Active' : 'Fielders Hidden'}</span>
          </button>

          {/* Field Preset Selector */}
          {showFielderOverlay && (
            <select
              value={fieldPreset}
              onChange={e => setFieldPreset(e.target.value as any)}
              style={{
                padding: '5px 10px',
                borderRadius: D.pill,
                background: D.surf2,
                border: `1px solid ${D.borderMed}`,
                color: D.textPrimary,
                fontFamily: D.mono,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="standard">Standard Balanced Field</option>
              <option value="powerplay">Powerplay Ring (2 Out)</option>
              <option value="attacking">Test Attacking Cordon</option>
              <option value="death">Death Boundary Defense (5 Deep)</option>
            </select>
          )}

          {/* Clear / Reset Shots */}
          <button
            onClick={() => setShots([])}
            style={{
              padding: '5px 10px',
              borderRadius: D.pill,
              background: D.surf2,
              border: `1px solid ${D.border}`,
              color: D.textMuted,
              fontFamily: D.mono,
              fontSize: '10px',
              cursor: 'pointer',
            }}
            title="Reset wagon wheel"
          >
            Clear
          </button>
        </div>
      </div>

      {/* ── RUNS FILTER CHIPS BAR ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          background: D.surf0,
          padding: '8px 14px',
          borderRadius: D.pill,
          border: `1px solid ${D.border}`,
        }}
      >
        <span style={{ fontFamily: D.mono, fontSize: '11px', fontWeight: 700, color: D.textMuted, marginRight: '4px' }}>
          FILTER RUNS:
        </span>
        <button
          onClick={() => setFilterRuns('all')}
          style={{
            padding: '4px 12px',
            borderRadius: D.pill,
            background: filterRuns === 'all' ? D.indigo : D.surf2,
            border: `1px solid ${filterRuns === 'all' ? D.indigo : D.border}`,
            color: filterRuns === 'all' ? '#fff' : D.textSecondary,
            fontFamily: D.mono,
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          ALL ({shots.length})
        </button>

        <button
          onClick={() => setFilterRuns('boundaries')}
          style={{
            padding: '4px 12px',
            borderRadius: D.pill,
            background: filterRuns === 'boundaries' ? `linear-gradient(135deg, ${D.sky}, ${D.rose})` : D.surf2,
            border: `1px solid ${filterRuns === 'boundaries' ? D.sky : D.border}`,
            color: filterRuns === 'boundaries' ? '#fff' : D.textSecondary,
            fontFamily: D.mono,
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          Boundaries 4s & 6s ({stats.fours + stats.sixes})
        </button>

        {[6, 4, 3, 2, 1, 0].map(runVal => {
          const cfg = SHOT_COLORS[runVal];
          const count = shots.filter(s => s.runs === runVal).length;
          const isSel = filterRuns === runVal;

          return (
            <button
              key={runVal}
              onClick={() => setFilterRuns(runVal)}
              style={{
                padding: '4px 10px',
                borderRadius: D.pill,
                background: isSel ? cfg.bg : D.surf2,
                border: `1px solid ${isSel ? cfg.stroke : D.border}`,
                color: isSel ? cfg.stroke : D.textSecondary,
                fontFamily: D.mono,
                fontSize: '11px',
                fontWeight: isSel ? 800 : 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cfg.stroke }} />
              {cfg.label} ({count})
            </button>
          );
        })}

        <div style={{ marginLeft: 'auto', fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
          ⚡ <em>Click anywhere on turf to simulate live shot vector</em>
        </div>
      </div>

      {/* ── MAIN 2-COLUMN DISPLAY: CRICKET GROUND SVG + ANALYTICS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 440px) 1fr', gap: '20px', alignItems: 'start' }}>
        {/* ── LEFT: THE CANONICAL CRICKET GROUND CANVAS ── */}
        <div
          style={{
            background: 'radial-gradient(circle at center, #1b4d36 0%, #143d2b 55%, #0d281c 100%)',
            border: `2px solid ${D.borderMed}`,
            borderRadius: D.xl,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            position: 'relative',
          }}
        >
          {/* Ground Orientation HUD */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontFamily: D.mono,
              fontSize: '10px',
              fontWeight: 800,
              color: '#86efac',
              marginBottom: '8px',
              padding: '0 4px',
            }}
          >
            <span style={{ background: 'rgba(0,0,0,0.4)', padding: '2px 8px', borderRadius: D.pill }}>
              {batHand === 'R' ? '◀ OFF SIDE (Left)' : '◀ ON / LEG SIDE (Left)'}
            </span>
            <span style={{ background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: D.pill, color: '#fef08a' }}>
              STRIKER (BATSMAN CREASE) ⬆
            </span>
            <span style={{ background: 'rgba(0,0,0,0.4)', padding: '2px 8px', borderRadius: D.pill }}>
              {batHand === 'R' ? 'ON / LEG SIDE (Right) ▶' : 'OFF SIDE (Right) ▶'}
            </span>
          </div>

          {/* SVG Ground Container */}
          <svg
            viewBox="0 0 360 360"
            style={{
              width: '100%',
              maxWidth: '380px',
              height: 'auto',
              cursor: 'crosshair',
              userSelect: 'none',
              filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.6))',
            }}
            onClick={handleFieldClick}
          >
            <defs>
              {/* Radial lawn mowing patterns */}
              <radialGradient id="lawnPattern" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1e543b" />
                <stop offset="35%" stopColor="#17442f" />
                <stop offset="70%" stopColor="#1b4d36" />
                <stop offset="100%" stopColor="#103322" />
              </radialGradient>

              {/* Pitch turf gradient */}
              <linearGradient id="pitchClay" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c89658" />
                <stop offset="50%" stopColor="#b58348" />
                <stop offset="100%" stopColor="#9e6e37" />
              </linearGradient>

              {/* Glow filter for active shot */}
              <filter id="vectorGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Outer Ground Turf Base */}
            <circle cx="180" cy="180" r="172" fill="#0d281c" />
            <circle cx="180" cy="180" r="162" fill="url(#lawnPattern)" />

            {/* Alternating Mowing Grass Rings */}
            {[140, 115, 90, 65, 40].map((r, i) => (
              <circle
                key={r}
                cx="180"
                cy="180"
                r={r}
                fill="none"
                stroke={i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.06)'}
                strokeWidth="14"
              />
            ))}

            {/* Outer Boundary Rope */}
            <circle cx="180" cy="180" r={BOUNDARY_RADIUS} fill="none" stroke="#f8fafc" strokeWidth="2" strokeDasharray="5,3" opacity="0.85" />
            <circle cx="180" cy="180" r={BOUNDARY_RADIUS + 2} fill="none" stroke="#22c55e" strokeWidth="1.5" opacity="0.4" />

            {/* 30-Yard Infield Fielding Circle */}
            <circle cx="180" cy="180" r={INFIELD_RADIUS} fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.6" />
            <text x="180" y="104" textAnchor="middle" fill="#86efac" fontSize="6.5" fontFamily="'JetBrains Mono', monospace" fontWeight="800" opacity="0.7">
              30-YARD FIELDING RESTRICTION CIRCLE
            </text>

            {/* 8 Sector Guidelines & Radial Divider Rays */}
            <g opacity="0.25">
              {CANONICAL_SECTORS_RHB.map(sec => {
                // Angle in radians from striker crease
                const rad = ((sec.angleStart + 90) * Math.PI) / 180;
                const x2 = STRIKER_ORIGIN_X + Math.cos(rad) * 165;
                const y2 = STRIKER_ORIGIN_Y + Math.sin(rad) * 165;
                return (
                  <line
                    key={sec.id}
                    x1={STRIKER_ORIGIN_X}
                    y1={STRIKER_ORIGIN_Y}
                    x2={x2}
                    y2={y2}
                    stroke="#ffffff"
                    strokeWidth="0.8"
                    strokeDasharray="2,3"
                  />
                );
              })}
            </g>

            {/* Sector Text Labels at Boundary Edges */}
            <g opacity="0.65" fontSize="7" fontFamily="'Space Grotesk', sans-serif" fontWeight="700" fill="#f8fafc">
              {batHand === 'R' ? (
                <>
                  <text x="80" y="45" textAnchor="middle">THIRD MAN</text>
                  <text x="35" y="165" textAnchor="middle">POINT</text>
                  <text x="65" y="275" textAnchor="middle">COVERS</text>
                  <text x="140" y="340" textAnchor="middle">LONG OFF</text>
                  <text x="220" y="340" textAnchor="middle">LONG ON</text>
                  <text x="295" y="275" textAnchor="middle">MID-WICKET</text>
                  <text x="325" y="165" textAnchor="middle">SQUARE LEG</text>
                  <text x="280" y="45" textAnchor="middle">FINE LEG</text>
                </>
              ) : (
                <>
                  <text x="280" y="45" textAnchor="middle">THIRD MAN</text>
                  <text x="325" y="165" textAnchor="middle">POINT</text>
                  <text x="295" y="275" textAnchor="middle">COVERS</text>
                  <text x="220" y="340" textAnchor="middle">LONG OFF</text>
                  <text x="140" y="340" textAnchor="middle">LONG ON</text>
                  <text x="65" y="275" textAnchor="middle">MID-WICKET</text>
                  <text x="35" y="165" textAnchor="middle">SQUARE LEG</text>
                  <text x="80" y="45" textAnchor="middle">FINE LEG</text>
                </>
              )}
            </g>

            {/* ── THE CRICKET PITCH (Vertical Center Strip) ── */}
            {/* Pitch Clay Surface */}
            <rect x="174" y="148" width="12" height="64" rx="2" fill="url(#pitchClay)" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />

            {/* Batting Crease Markings (Striker End - North: y=160) */}
            <line x1="168" y1="160" x2="192" y2="160" stroke="#ffffff" strokeWidth="1.2" />
            <line x1="171" y1="154" x2="189" y2="154" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="1,1" />
            {/* Batting Stumps (3 Wooden Wickets) */}
            <circle cx="178" cy="154" r="1.2" fill="#fef08a" stroke="#451a03" strokeWidth="0.4" />
            <circle cx="180" cy="154" r="1.2" fill="#fef08a" stroke="#451a03" strokeWidth="0.4" />
            <circle cx="182" cy="154" r="1.2" fill="#fef08a" stroke="#451a03" strokeWidth="0.4" />

            {/* Bowling Crease Markings (Bowler End - South: y=200) */}
            <line x1="168" y1="200" x2="192" y2="200" stroke="#ffffff" strokeWidth="1.2" />
            <line x1="171" y1="206" x2="189" y2="206" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="1,1" />
            {/* Bowling Stumps (3 Wooden Wickets) */}
            <circle cx="178" cy="206" r="1.2" fill="#fef08a" stroke="#451a03" strokeWidth="0.4" />
            <circle cx="180" cy="206" r="1.2" fill="#fef08a" stroke="#451a03" strokeWidth="0.4" />
            <circle cx="182" cy="206" r="1.2" fill="#fef08a" stroke="#451a03" strokeWidth="0.4" />

            {/* Non-Striker Position Marker */}
            <circle cx="187" cy="198" r="2" fill="#f59e0b" opacity="0.8" />
            <text x="193" y="200" fill="#fef08a" fontSize="5" fontFamily="'DM Mono', monospace">NS</text>

            {/* Main Umpire Position */}
            <circle cx="180" cy="216" r="2.5" fill="#f8fafc" stroke="#0f172a" strokeWidth="0.8" />
            <text x="180" y="224" textAnchor="middle" fill="#ffffff" fontSize="5" fontFamily="'DM Mono', monospace">UMP</text>

            {/* Square Leg Umpire Position */}
            <circle cx={batHand === 'R' ? 228 : 132} cy="160" r="2.5" fill="#f8fafc" stroke="#0f172a" strokeWidth="0.8" />
            <text x={batHand === 'R' ? 228 : 132} y="168" textAnchor="middle" fill="#ffffff" fontSize="5" fontFamily="'DM Mono', monospace">SQ.U</text>

            {/* ── WAGON WHEEL SHOT RADIATION VECTORS ── */}
            {/* ALL SHOTS MUST ORIGINATE EXACTLY AT STRIKER CREASE (180, 160) */}
            {filteredShots.map((shot, idx) => {
              // Convert shot relative offset (relative to center 180, 180) to destination SVG point
              const destX = SVG_CENTER_X + (shot.x ?? 0);
              const destY = SVG_CENTER_Y + (shot.y ?? 0);
              const colCfg = SHOT_COLORS[shot.runs] || SHOT_COLORS[1];
              const isSel = selectedShot?.id === shot.id;

              return (
                <g
                  key={shot.id || idx}
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedShot(shot);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Shot Vector Line radiating from STRIKER_ORIGIN */}
                  <line
                    x1={STRIKER_ORIGIN_X}
                    y1={STRIKER_ORIGIN_Y}
                    x2={destX}
                    y2={destY}
                    stroke={colCfg.stroke}
                    strokeWidth={isSel ? 3.5 : shot.runs >= 4 ? 2.4 : 1.4}
                    strokeLinecap="round"
                    opacity={isSel ? 1 : 0.85}
                    filter={isSel ? 'url(#vectorGlow)' : undefined}
                  />

                  {/* Destination Ball Marker */}
                  <circle
                    cx={destX}
                    cy={destY}
                    r={isSel ? 6 : shot.runs === 6 ? 5 : shot.runs === 4 ? 4 : 2.8}
                    fill={colCfg.stroke}
                    stroke="#ffffff"
                    strokeWidth={isSel ? 2 : 0.8}
                  />

                  {/* Highlighting selected shot pulse */}
                  {isSel && (
                    <circle cx={destX} cy={destY} r="9" fill="none" stroke={colCfg.stroke} strokeWidth="1.5" strokeDasharray="2,2" opacity="0.8" />
                  )}
                </g>
              );
            })}

            {/* ── FIELDER PLACEMENTS OVERLAY ── */}
            {showFielderOverlay &&
              fielders.map(f => {
                const fx = SVG_CENTER_X + f.x;
                const fy = SVG_CENTER_Y + f.y;
                const isCordon = f.category === 'cordon';
                const isDeep = f.category === 'outfield';

                return (
                  <g key={f.id} style={{ cursor: 'help' }}>
                    <title>{`${f.name}: ${f.description}`}</title>
                    <circle
                      cx={fx}
                      cy={fy}
                      r={isCordon ? 3.5 : isDeep ? 4.2 : 3.8}
                      fill={isCordon ? '#ef4444' : isDeep ? '#38bdf8' : '#e2e8f0'}
                      stroke="#0f172a"
                      strokeWidth="1"
                    />
                    <text
                      x={fx}
                      y={fy - 5}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="5"
                      fontFamily="'JetBrains Mono', monospace"
                      fontWeight="800"
                      style={{
                        paintOrder: 'stroke',
                        stroke: '#0f172a',
                        strokeWidth: '1.5px',
                        strokeLinejoin: 'round',
                      }}
                    >
                      {f.shortName}
                    </text>
                  </g>
                );
              })}

            {/* ── STRIKER BATTING ORIGIN MARKER (NORTH END OF PITCH) ── */}
            <circle cx={STRIKER_ORIGIN_X} cy={STRIKER_ORIGIN_Y} r="4.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx={STRIKER_ORIGIN_X} cy={STRIKER_ORIGIN_Y} r="8" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
            <text
              x={STRIKER_ORIGIN_X}
              y={STRIKER_ORIGIN_Y - 10}
              textAnchor="middle"
              fill="#38bdf8"
              fontSize="6"
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="800"
            >
              BATSMAN ({batHand}HB)
            </text>
          </svg>

          {/* South Bowler Label */}
          <div
            style={{
              fontFamily: D.mono,
              fontSize: '10px',
              fontWeight: 800,
              color: '#86efac',
              marginTop: '6px',
              background: 'rgba(0,0,0,0.5)',
              padding: '3px 12px',
              borderRadius: D.pill,
            }}
          >
            BOWLER END (RUN-UP) ⬇
          </div>
        </div>

        {/* ── RIGHT: DEEP SHOT & SECTOR ANALYTICS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* 1. OFF SIDE vs ON / LEG SIDE SPLIT BAR */}
          <div
            style={{
              background: D.surf1,
              padding: '16px',
              borderRadius: D.lg,
              border: `1px solid ${D.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800 }}>
                FIELD BIAS: OFF SIDE vs ON (LEG) SIDE
              </span>
              <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                {stats.totalRuns} Total Runs
              </span>
            </div>

            {/* Split Bar */}
            <div style={{ width: '100%', height: '14px', borderRadius: D.pill, overflow: 'hidden', display: 'flex', background: D.surf2 }}>
              <div
                style={{
                  width: `${stats.offPct}%`,
                  background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
                  transition: 'width 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                  fontWeight: 800,
                  fontFamily: D.mono,
                  color: '#fff',
                }}
              >
                {stats.offPct > 15 ? `${stats.offPct}%` : ''}
              </div>
              <div
                style={{
                  width: `${stats.legPct}%`,
                  background: 'linear-gradient(90deg, #f59e0b, #10b981)',
                  transition: 'width 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                  fontWeight: 800,
                  fontFamily: D.mono,
                  color: '#fff',
                }}
              >
                {stats.legPct > 15 ? `${stats.legPct}%` : ''}
              </div>
            </div>

            {/* Stat comparison details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: D.md,
                  background: `${D.sky}15`,
                  border: `1px solid ${D.sky}30`,
                }}
              >
                <div style={{ fontFamily: D.head, fontSize: '11px', color: D.sky, fontWeight: 700 }}>
                  OFF SIDE (Left for {batHand}HB)
                </div>
                <div style={{ fontFamily: D.mono, fontSize: '18px', fontWeight: 800, color: D.textPrimary, marginTop: '2px' }}>
                  {stats.offRuns} <span style={{ fontSize: '12px', color: D.textMuted }}>runs ({stats.offBalls}b)</span>
                </div>
                <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textSecondary, marginTop: '2px' }}>
                  {stats.offFours}x4, {stats.offSixes}x6 · SR: {stats.offBalls > 0 ? ((stats.offRuns / stats.offBalls) * 100).toFixed(0) : 0}
                </div>
              </div>

              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: D.md,
                  background: `${D.amber}15`,
                  border: `1px solid ${D.amber}30`,
                }}
              >
                <div style={{ fontFamily: D.head, fontSize: '11px', color: D.amber, fontWeight: 700 }}>
                  ON / LEG SIDE (Right for {batHand}HB)
                </div>
                <div style={{ fontFamily: D.mono, fontSize: '18px', fontWeight: 800, color: D.textPrimary, marginTop: '2px' }}>
                  {stats.legRuns} <span style={{ fontSize: '12px', color: D.textMuted }}>runs ({stats.legBalls}b)</span>
                </div>
                <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textSecondary, marginTop: '2px' }}>
                  {stats.legFours}x4, {stats.legSixes}x6 · SR: {stats.legBalls > 0 ? ((stats.legRuns / stats.legBalls) * 100).toFixed(0) : 0}
                </div>
              </div>
            </div>
          </div>

          {/* 2. SELECTED SHOT TELEMETRY CARD */}
          {selectedShot ? (
            <div
              style={{
                background: D.surf1,
                padding: '14px 16px',
                borderRadius: D.lg,
                border: `1px solid ${D.borderMed}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: D.pill,
                      background: SHOT_COLORS[selectedShot.runs]?.bg || D.surf2,
                      color: SHOT_COLORS[selectedShot.runs]?.stroke || D.textPrimary,
                      fontFamily: D.mono,
                      fontSize: '12px',
                      fontWeight: 800,
                      border: `1px solid ${SHOT_COLORS[selectedShot.runs]?.stroke || D.border}`,
                    }}
                  >
                    {selectedShot.runs === 6 ? '⚡ MAXIMUM (6)' : selectedShot.runs === 4 ? '🔥 BOUNDARY (4)' : `${selectedShot.runs} RUNS`}
                  </span>
                  <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800 }}>
                    {selectedShot.sector}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedShot(null)}
                  style={{ background: 'none', border: 'none', color: D.textMuted, cursor: 'pointer', fontSize: '14px' }}
                >
                  ✕
                </button>
              </div>
              <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textPrimary, lineHeight: '1.4' }}>
                {selectedShot.description}
              </div>
              <div style={{ display: 'flex', gap: '12px', fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                <span>Over: {selectedShot.over}</span>
                <span>·</span>
                <span>Bowler: {selectedShot.bowler}</span>
                <span>·</span>
                <span>Batter: {selectedShot.batsman}</span>
              </div>
            </div>
          ) : (
            <div
              style={{
                background: D.surf1,
                padding: '12px 14px',
                borderRadius: D.md,
                border: `1px dashed ${D.border}`,
                fontFamily: D.body,
                fontSize: '11px',
                color: D.textMuted,
                textAlign: 'center',
              }}
            >
              👉 <em>Click on any shot line on the cricket field to inspect delivery breakdown</em>
            </div>
          )}

          {/* 3. 8 BROADCAST SECTORS BREAKDOWN GRID */}
          <div
            style={{
              background: D.surf1,
              padding: '16px',
              borderRadius: D.lg,
              border: `1px solid ${D.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800 }}>
                8 CANONICAL BROADCAST SECTORS
              </span>
              <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                BCCI / ICC STANDARD
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {sectorData.map(sec => (
                <div
                  key={sec.id}
                  style={{
                    padding: '8px 10px',
                    borderRadius: D.md,
                    background: D.surf0,
                    border: `1px solid ${sec.runs > 0 ? `${sec.color}40` : D.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: sec.color }}>
                      {sec.name}
                    </span>
                    <span
                      style={{
                        fontFamily: D.mono,
                        fontSize: '11px',
                        fontWeight: 800,
                        color: sec.runs > 0 ? D.textPrimary : D.textMuted,
                      }}
                    >
                      {sec.runs} <span style={{ fontSize: '9px', color: D.textMuted }}>({sec.balls}b)</span>
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.mono, fontSize: '9px', color: D.textMuted }}>
                    <span>{sec.fours > 0 ? `${sec.fours}x4` : ''} {sec.sixes > 0 ? `${sec.sixes}x6` : ''}</span>
                    <span>{sec.pct > 0 ? `${sec.pct}% runs` : '0%'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
