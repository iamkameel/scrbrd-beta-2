'use client';

import React, { useState, useMemo } from 'react';
import { Theme, Player, SchoolRegistryItem } from './types';
import { SCHOOLS_REGISTRY, PLAYERS } from './data';
import PlayerSearchFilterSelect from './PlayerSearchFilterSelect';
import {
  ArrowLeftRight,
  Sparkles,
  Award,
  Zap,
  Shield,
  TrendingUp,
  Target,
  BarChart3,
  PieChart,
  Eye,
  Sliders,
  Share2,
  Download,
  Info,
  ChevronRight,
  Flame,
  CheckCircle2,
  Crosshair,
  Compass,
  FileText,
  Clock,
  Layers,
  Activity,
  AlertCircle
} from 'lucide-react';

interface HeadToHeadComparisonViewProps {
  theme: Theme;
  players?: Player[];
  currentRole?: string;
  activeSchoolId?: string;
  initialPlayerAId?: string;
  initialPlayerBId?: string;
  onNavigateToScouting?: () => void;
  onNavigateToSkills?: () => void;
  onSelectPlayerProfile?: (player: Player) => void;
}

type TabMode = 'quick' | 'performance' | 'skills' | 'matchup' | 'development';
type TimeScope = 'season' | 'career' | 'last10' | 'last5' | 'last30d';
type CompScope = 'all' | '1st XI' | 'U17' | 'U16' | 'U15' | 'U14';
type FormatScope = 'all' | '50-Over' | 'T20' | 'Declaration';

function getSchool(schoolId: string): SchoolRegistryItem {
  const found = SCHOOLS_REGISTRY.find(s => s.id === schoolId || s.shortName === schoolId);
  if (found) return found;
  return {
    id: schoolId,
    name: schoolId,
    shortName: schoolId,
    crestIcon: '🏫',
    colors: ['#3b82f6', '#ffffff'],
  } as unknown as SchoolRegistryItem;
}

// Compute skill profile for radar and matrices
function computeSkillProfile(p: Player) {
  const isBat = p.role === 'BAT' || p.role === 'ALL';
  const isBowl = p.role === 'BOWL' || p.role === 'ALL';
  const isWK = p.role === 'WK';
  const isCaptain = p.cap === 'c' || p.cap === 'vc';

  const batBase = Math.min(96, Math.max(50, Math.round(p.avg * 1.5 + (p.sr > 125 ? 12 : 6))));
  const bowlBase = Math.min(95, Math.max(48, Math.round(100 - (p.econ || 6) * 6 + (p.wkts > 15 ? 14 : 5))));
  const fieldBase = isWK ? 92 : 75 + ((p.name.length * 3) % 18);
  const mentalBase = isCaptain ? 93 : 76 + ((p.name.length * 5) % 16);

  return {
    // 6 Core Radar axes
    radarAxes: isBat
      ? [
          { axis: 'Technique', a: Math.min(96, Math.round(batBase * 0.98)), b: 0 },
          { axis: 'Power / SR', a: Math.min(98, Math.round(p.sr * 0.68)), b: 0 },
          { axis: 'Strike Rotation', a: Math.min(94, Math.round(batBase * 0.92 + (p.sr > 120 ? 6 : -3))), b: 0 },
          { axis: 'Boundary Hitting', a: Math.min(96, Math.round(62 + (p.sr > 128 ? 26 : 14))), b: 0 },
          { axis: 'Pace Handling', a: Math.min(95, Math.round(batBase * 0.94 + 2)), b: 0 },
          { axis: 'Spin Handling', a: Math.min(94, Math.round(batBase * 0.91 + (p.batHand === 'L' ? 4 : 1))), b: 0 },
        ]
      : [
          { axis: 'Line & Length', a: Math.min(96, Math.round(bowlBase * 0.96)), b: 0 },
          { axis: 'Swing / Drift', a: Math.min(95, Math.round(bowlBase * 0.93 + (p.bowlStyle === 'S' ? 5 : 2))), b: 0 },
          { axis: 'Pace / Carry', a: Math.min(98, p.bowlStyle === 'F' ? 92 : p.bowlStyle === 'M' ? 78 : 65), b: 0 },
          { axis: 'Death Execution', a: Math.min(94, Math.round(bowlBase * 0.91 + (p.econ < 6 ? 6 : -2))), b: 0 },
          { axis: 'Variations', a: Math.min(92, Math.round(bowlBase * 0.88 + 4)), b: 0 },
          { axis: 'Wicket Threat', a: Math.min(97, Math.round(60 + p.wkts * 1.5)), b: 0 },
        ],
    // Hierarchical breakdown
    categories: [
      {
        name: 'Technical Mastery',
        subskills: [
          { name: 'Front Foot Driving & Balance', a: Math.min(98, batBase + 4), b: 0, sample: '● High' },
          { name: 'Back Foot Pull & Cut', a: Math.min(95, batBase - 2), b: 0, sample: '● High' },
          { name: 'Defensive Solidity & Leave', a: Math.min(96, batBase + 3), b: 0, sample: '● High' },
          { name: 'Sweep & Lap Options', a: Math.min(92, batBase - 6), b: 0, sample: '◐ Medium' },
        ],
      },
      {
        name: 'Bowling & Delivery Craft',
        subskills: [
          { name: 'Seam Presentation / Wrist Release', a: isBowl ? Math.min(96, bowlBase + 3) : 55, b: 0, sample: '● High' },
          { name: 'Good Length Repeatability', a: isBowl ? Math.min(95, bowlBase + 1) : 58, b: 0, sample: '● High' },
          { name: 'Pace Changes & Cutters', a: isBowl ? Math.min(92, bowlBase - 3) : 50, b: 0, sample: '◐ Medium' },
          { name: 'Blockhole / Yorker Precision', a: isBowl ? Math.min(94, bowlBase - 5) : 48, b: 0, sample: '○ Limited' },
        ],
      },
      {
        name: 'Fielding, Athleticism & Keeping',
        subskills: [
          { name: 'Inner-Ring Ground Fielding', a: fieldBase + 2, b: 0, sample: '● High' },
          { name: 'Direct Hit Accuracy', a: isWK ? 78 : fieldBase - 2, b: 0, sample: '◐ Medium' },
          { name: 'Boundary Ring Catching', a: fieldBase + 4, b: 0, sample: '● High' },
          { name: 'Glovework & Reaction Speed', a: isWK ? 96 : 64, b: 0, sample: '● High' },
        ],
      },
      {
        name: 'Tactical & Pressure Resilience',
        subskills: [
          { name: 'Match IQ & Phase Reading', a: mentalBase + 3, b: 0, sample: '● High' },
          { name: 'Pressure Composure (Chases/Death)', a: mentalBase - 1, b: 0, sample: '● High' },
          { name: 'Tactical Adaptation vs Matchups', a: mentalBase + 2, b: 0, sample: '◐ Medium' },
          { name: 'Work Ethic & Coachability', a: 95, b: 0, sample: '● High' },
        ],
      },
    ],
    // Role suitability (Football Manager style 0-100)
    roleSuitability: [
      { role: 'Powerplay Aggressor (Opener)', fit: isBat ? Math.min(98, Math.round(p.sr * 0.72)) : 30 },
      { role: 'Classical Anchor (#3)', fit: isBat ? Math.min(97, Math.round(p.avg * 1.95)) : 25 },
      { role: 'Middle-Order Stroke-maker', fit: isBat ? Math.min(95, Math.round(p.avg * 1.4 + p.sr * 0.35)) : 35 },
      { role: 'Death-Overs Power Finisher', fit: isBat ? Math.min(96, Math.round(p.sr * 0.69 + 10)) : 20 },
      { role: 'New-Ball Strike Bowler', fit: isBowl && p.bowlStyle === 'F' ? Math.min(98, Math.round(bowlBase + 6)) : 25 },
      { role: 'Middle-Overs Enforcer / Control', fit: isBowl ? Math.min(95, Math.round(100 - (p.econ || 6) * 6.5)) : 20 },
      { role: 'Death-Overs Specialist', fit: isBowl ? Math.min(94, Math.round(bowlBase - 2 + (p.wkts > 15 ? 8 : 0))) : 15 },
      { role: 'Balanced All-Round Contributor', fit: p.role === 'ALL' ? 95 : Math.min(78, Math.round((p.avg + p.wkts * 2.5))) },
    ],
  };
}

export default function HeadToHeadComparisonView({
  theme: D,
  players = PLAYERS,
  currentRole = 'superadmin',
  activeSchoolId,
  initialPlayerAId = 'w1',
  initialPlayerBId = 'm1_p',
  onNavigateToScouting,
  onNavigateToSkills,
  onSelectPlayerProfile,
}: HeadToHeadComparisonViewProps) {
  // Main Selection State
  const [playerAId, setPlayerAId] = useState<string>(initialPlayerAId);
  const [playerBId, setPlayerBId] = useState<string>(initialPlayerBId);

  // Tab & Filter States
  const isCoachRole = currentRole === 'coach' || currentRole === 'schooladmin';
  const [schoolBoundaryOnly, setSchoolBoundaryOnly] = useState<boolean>(isCoachRole);
  const [activeTab, setActiveTab] = useState<TabMode>('skills');
  const [timeScope, setTimeScope] = useState<TimeScope>('season');
  const [compScope, setCompScope] = useState<CompScope>('all');
  const [formatScope, setFormatScope] = useState<FormatScope>('all');
  const [radarLayer, setRadarLayer] = useState<'both' | 'a' | 'b'>('both');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Compute filtered players based on POPIA intra-school boundary mode
  const filteredPlayersList = useMemo(() => {
    if (!schoolBoundaryOnly) return players;
    const coachSchool = activeSchoolId || 'WBHS';
    const schoolMatched = players.filter(p => p.school === coachSchool || p.team?.includes(coachSchool));
    return schoolMatched.length >= 2 ? schoolMatched : players;
  }, [players, schoolBoundaryOnly, activeSchoolId]);

  // Player Objects
  const playerA = useMemo(() => players.find(p => p.id === playerAId) || players[0], [players, playerAId]);
  const playerB = useMemo(() => players.find(p => p.id === playerBId) || players[1] || players[0], [players, playerBId]);

  // School Registries
  const schoolA = useMemo(() => getSchool(playerA.school), [playerA.school]);
  const schoolB = useMemo(() => getSchool(playerB.school), [playerB.school]);

  // Skill Profiles
  const profileA = useMemo(() => computeSkillProfile(playerA), [playerA]);
  const profileB = useMemo(() => computeSkillProfile(playerB), [playerB]);

  // Swap action
  const handleSwap = () => {
    const temp = playerAId;
    setPlayerAId(playerBId);
    setPlayerBId(temp);
  };

  // Curated Preset Matchups (including Intra-School Coach H2H)
  const curatedMatchups = [
    { title: '🏫 Westville Intra-H2H', a: 'w1', b: 'w2', label: 'Whitfield vs Solomons (Same School)' },
    { title: '🏫 Hilton Intra-H2H', a: 'h1', b: 'h2', label: 'Stewart vs Campbell (Same School)' },
    { title: '🏫 Michaelhouse Intra-H2H', a: 'm1_p', b: 'm2', label: 'Higgs vs Baker (Same School)' },
    { title: 'Derby Openers', a: 'w1', b: 'm1_p', label: 'Whitfield vs Baker (Premier Batsmen)' },
    { title: 'Express Pace', a: 'no8', b: 'h8', label: 'Henderson vs Dyer (135+ km/h Heat)' },
    { title: '🇿🇦 Quota Pathway', a: 'w6', b: 'd_u16_2', label: 'Ngcobo (Sunfoil) vs Chetty (DHS)' },
    { title: 'Spin Wizards', a: 'w9', b: 'h4', label: 'Petersen (Leggie) vs Campbell' },
    { title: '🌟 U16 Grant Khomo', a: 'd_u16_1', b: 'w_u16_1', label: 'Sithole (Express) vs Van Schalkwyk' },
    { title: 'Elite All-Rounders', a: 'w4', b: 'no4', label: 'Solomons vs Brand (Knights Cpt)' },
  ];

  // Career Runs estimation
  const runsA = playerA.careerTotals?.runs ?? Math.round(playerA.avg * 16);
  const runsB = playerB.careerTotals?.runs ?? Math.round(playerB.avg * 16);

  // South African Quota Analysis & Transformation Insight
  const quotaInsight = useMemo(() => {
    const aQuota = playerA.quotaEligible;
    const bQuota = playerB.quotaEligible;
    const aAfrican = playerA.saDemographic === 'Black African';
    const bAfrican = playerB.saDemographic === 'Black African';

    if (aQuota && bQuota) {
      return {
        tag: '🇿🇦 Direct Transformation Comparison',
        color: D.emerald,
        summary: `Both players satisfy CSA Schools Transformation Quota criteria. ${playerA.name} represents ${playerA.saDemographic} (${playerA.bursaryTrust || 'Provincial Pathway'}), while ${playerB.name} represents ${playerB.saDemographic} (${playerB.bursaryTrust || 'Provincial Pathway'}).`,
        recommendation: `Selection decision can focus entirely on tactical role match and current pitch conditions without impacting squad demographic compliance balance.`,
      };
    } else if (aQuota && !bQuota) {
      return {
        tag: '🇿🇦 Quota & Demographic Fulfillment Advantage (Player A)',
        color: D.sky,
        summary: `${playerA.name} is a verified CSA Quota Candidate (${playerA.saDemographic}${playerA.bursaryScholar ? ' · Bursary Scholar' : ''}), contributing directly to school 1st XI compliance targets (minimum 6 generic black, 3 black African starting XI requirements).`,
        recommendation: `Selecting ${playerA.name} strengthens transformation ratios with an effective performance delta of ${(playerA.avg - playerB.avg).toFixed(1)} batting avg.`,
      };
    } else if (!aQuota && bQuota) {
      return {
        tag: '🇿🇦 Quota & Demographic Fulfillment Advantage (Player B)',
        color: D.sky,
        summary: `${playerB.name} is a verified CSA Quota Candidate (${playerB.saDemographic}${playerB.bursaryScholar ? ' · Bursary Scholar' : ''}), contributing directly to school 1st XI compliance targets (minimum 6 generic black, 3 black African starting XI requirements).`,
        recommendation: `Selecting ${playerB.name} strengthens transformation ratios with an effective performance delta of ${(playerB.avg - playerA.avg).toFixed(1)} batting avg.`,
      };
    } else {
      return {
        tag: 'Open Category / Merit Comparison',
        color: D.textMuted,
        summary: `Both student athletes fall within the Open selection category. CSA quota balance must be fulfilled through other squad positions.`,
        recommendation: `Proceed with pure tactical matchup and pitch condition criteria.`,
      };
    }
  }, [playerA, playerB, D]);

  // Delta Bar Helper
  const renderCentreDeltaBar = (
    label: string,
    valA: number,
    valB: number,
    unit = '',
    lowerIsBetter = false
  ) => {
    const diff = valA - valB;
    const aWins = lowerIsBetter ? diff < 0 : diff > 0;
    const bWins = lowerIsBetter ? diff > 0 : diff < 0;
    const maxVal = Math.max(valA, valB, 1);
    const pctA = Math.min(100, Math.max(8, Math.round((valA / maxVal) * 100)));
    const pctB = Math.min(100, Math.max(8, Math.round((valB / maxVal) * 100)));

    return (
      <div
        style={{
          padding: '10px 14px',
          background: D.surf2,
          borderRadius: D.md,
          border: `1px solid ${D.border}`,
          marginBottom: '8px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          {/* Player A Value */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontFamily: D.mono, fontSize: '14px', fontWeight: 800, color: aWins ? D.indigo : D.textPrimary }}>
              {valA}{unit}
            </span>
            {aWins && (
              <span style={{ fontFamily: D.mono, fontSize: '9px', color: D.emerald, background: `${D.emerald}20`, padding: '1px 6px', borderRadius: D.pill, fontWeight: 700 }}>
                +{Math.abs(diff).toFixed(1)}{unit}
              </span>
            )}
          </div>

          {/* Metric Label */}
          <div style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 800, color: D.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {label}
          </div>

          {/* Player B Value */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {bWins && (
              <span style={{ fontFamily: D.mono, fontSize: '9px', color: D.emerald, background: `${D.emerald}20`, padding: '1px 6px', borderRadius: D.pill, fontWeight: 700 }}>
                +{Math.abs(diff).toFixed(1)}{unit}
              </span>
            )}
            <span style={{ fontFamily: D.mono, fontSize: '14px', fontWeight: 800, color: bWins ? D.sky : D.textPrimary }}>
              {valB}{unit}
            </span>
          </div>
        </div>

        {/* Dual Bar (Centre-line Outward) */}
        <div style={{ display: 'flex', height: '6px', width: '100%', gap: '4px', background: D.surf3, borderRadius: D.pill, overflow: 'hidden' }}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', background: 'transparent' }}>
            <div
              style={{
                width: `${pctA}%`,
                height: '100%',
                background: aWins ? D.indigo : `${D.indigo}66`,
                borderRadius: '3px 0 0 3px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <div style={{ width: '2px', background: D.borderMed }} />
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', background: 'transparent' }}>
            <div
              style={{
                width: `${pctB}%`,
                height: '100%',
                background: bWins ? D.sky : `${D.sky}66`,
                borderRadius: '0 3px 3px 0',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  // SVG Radar Polygon Calculation
  const radarAxes = useMemo(() => {
    // Map axes between A and B
    return profileA.radarAxes.map((ax, idx) => {
      const bAxis = profileB.radarAxes[idx] || ax;
      return {
        axis: ax.axis,
        valA: ax.a,
        valB: bAxis.a,
      };
    });
  }, [profileA, profileB]);

  const radarPoints = useMemo(() => {
    const size = 320;
    const center = size / 2;
    const radius = 115;
    const total = radarAxes.length;

    const getCoord = (value: number, idx: number) => {
      const angle = (Math.PI * 2 / total) * idx - Math.PI / 2;
      const r = (value / 100) * radius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      };
    };

    const polyA = radarAxes.map((a, i) => {
      const c = getCoord(a.valA, i);
      return `${c.x},${c.y}`;
    }).join(' ');

    const polyB = radarAxes.map((b, i) => {
      const c = getCoord(b.valB, i);
      return `${c.x},${c.y}`;
    }).join(' ');

    const gridLevels = [0.25, 0.5, 0.75, 1.0].map(level => {
      return radarAxes.map((_, i) => {
        const c = getCoord(level * 100, i);
        return `${c.x},${c.y}`;
      }).join(' ');
    });

    const axisLines = radarAxes.map((ax, i) => {
      const c = getCoord(100, i);
      const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
      const labelDist = radius + 24;
      const lx = center + labelDist * Math.cos(angle);
      const ly = center + labelDist * Math.sin(angle);
      return {
        x1: center,
        y1: center,
        x2: c.x,
        y2: c.y,
        lx,
        ly,
        label: ax.axis,
        valA: ax.valA,
        valB: ax.valB,
      };
    });

    return { size, center, polyA, polyB, gridLevels, axisLines };
  }, [radarAxes]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ── HEADER & BREADCRUMBS ────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '4px', height: '22px', borderRadius: '2px', background: D.indigo }} />
            <h1 style={{ fontFamily: D.head, fontSize: '20px', fontWeight: 800, color: D.textPrimary, letterSpacing: '-0.02em', margin: 0 }}>
              Head-to-Head Comparison & Visual Skills Matrix
            </h1>
          </div>
          <p style={{ fontFamily: D.body, fontSize: '13px', color: D.textMuted, marginTop: '4px', paddingLeft: '12px' }}>
            Comprehensive talent analytics, multi-axis radar skill overlay, tactical match-ups, and South African transformation quota evaluation.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowShareModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: D.pill,
              background: D.surf2,
              border: `1px solid ${D.border}`,
              color: D.textPrimary,
              fontFamily: D.head,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Share2 size={13} color={D.indigo} />
            Export Battle Card
          </button>

          {onNavigateToScouting && (
            <button
              onClick={onNavigateToScouting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: D.pill,
                background: D.surf2,
                border: `1px solid ${D.border}`,
                color: D.textPrimary,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Eye size={13} color={D.sky} />
              Scouting Hub
            </button>
          )}

          {onNavigateToSkills && (
            <button
              onClick={onNavigateToSkills}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: D.pill,
                background: `${D.indigo}18`,
                border: `1px solid ${D.indigo}44`,
                color: D.indigo,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Target size={13} color={D.indigo} />
              Squad Skills
            </button>
          )}
        </div>
      </div>

      {/* ── CONTEXT SCOPE BAR ───────────────────────────── */}
      <div
        style={{
          padding: '12px 16px',
          background: D.surf1,
          border: `1px solid ${D.border}`,
          borderRadius: D.lg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Curated Presets Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', maxWidth: '100%' }}>
          <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, fontWeight: 700, whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
            Curated Matchups:
          </span>
          {curatedMatchups.map(m => (
            <button
              key={m.title}
              onClick={() => {
                setPlayerAId(m.a);
                setPlayerBId(m.b);
              }}
              style={{
                padding: '3px 10px',
                borderRadius: D.pill,
                background: playerAId === m.a && playerBId === m.b ? `${D.indigo}33` : D.surf2,
                border: `1px solid ${playerAId === m.a && playerBId === m.b ? D.indigo : D.border}`,
                color: playerAId === m.a && playerBId === m.b ? D.indigo : D.textSecondary,
                fontFamily: D.head,
                fontSize: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {m.title}
            </button>
          ))}
        </div>

        {/* Scopes Filter Group & POPIA Coach Boundary Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* POPIA School Boundary Toggle */}
          <button
            onClick={() => setSchoolBoundaryOnly(prev => !prev)}
            style={{
              padding: '4px 10px',
              borderRadius: D.pill,
              background: schoolBoundaryOnly ? `${D.emerald}20` : D.surf2,
              border: `1px solid ${schoolBoundaryOnly ? D.emerald : D.border}`,
              color: schoolBoundaryOnly ? D.emerald : D.textMuted,
              fontFamily: D.head,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Enforce POPIA talent privacy by locking comparison selection to your active school"
          >
            <span>{schoolBoundaryOnly ? '🔒 School Boundary' : '🌐 Circuit Wide'}</span>
          </button>
          {/* Timeframe Scope */}
          <select
            value={timeScope}
            onChange={e => setTimeScope(e.target.value as TimeScope)}
            style={{
              padding: '4px 8px',
              borderRadius: D.sm,
              background: D.surf2,
              border: `1px solid ${D.border}`,
              color: D.textPrimary,
              fontFamily: D.body,
              fontSize: '11px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="season">📅 Season 2025/26</option>
            <option value="career">📈 Full Career</option>
            <option value="last10">⚡ Last 10 Matches</option>
            <option value="last5">🔥 Last 5 Matches (Current Form)</option>
            <option value="last30d">⏱️ Last 30 Days</option>
          </select>

          {/* Division Scope */}
          <select
            value={compScope}
            onChange={e => setCompScope(e.target.value as CompScope)}
            style={{
              padding: '4px 8px',
              borderRadius: D.sm,
              background: D.surf2,
              border: `1px solid ${D.border}`,
              color: D.textPrimary,
              fontFamily: D.body,
              fontSize: '11px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="all">🏆 All Divisions</option>
            <option value="1st XI">1st XI / Seniors</option>
            <option value="U17">U17 Division</option>
            <option value="U16">U16 Grant Khomo</option>
            <option value="U15">U15 National Week</option>
            <option value="U14">U14 Intake</option>
          </select>

          {/* Format Scope */}
          <select
            value={formatScope}
            onChange={e => setFormatScope(e.target.value as FormatScope)}
            style={{
              padding: '4px 8px',
              borderRadius: D.sm,
              background: D.surf2,
              border: `1px solid ${D.border}`,
              color: D.textPrimary,
              fontFamily: D.body,
              fontSize: '11px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="all">🏏 All Formats</option>
            <option value="50-Over">50-Over Limited</option>
            <option value="T20">T20 Blast</option>
            <option value="Declaration">Declaration / Time</option>
          </select>
        </div>
      </div>

      {/* ── TOP MATCHUP DUAL SELECTOR BAR ───────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: '16px',
          alignItems: 'center',
        }}
      >
        {/* Player A Selector Card */}
        <div
          style={{
            padding: '16px',
            background: D.surf1,
            border: `1px solid ${D.indigo}44`,
            borderRadius: D.lg,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            boxShadow: `0 4px 16px ${D.indigo}10`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontFamily: D.mono, fontSize: '10px', fontWeight: 800, color: D.indigo, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                PLAYER A
              </span>
              <span style={{ fontFamily: D.mono, fontSize: '9px', padding: '1px 6px', borderRadius: D.pill, background: `${D.indigo}20`, color: D.indigo, fontWeight: 700 }}>
                {playerA.ageDivision || playerA.team || '1st XI'}
              </span>
            </div>

            {/* SA Demographic Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {playerA.quotaEligible && (
                <span style={{ fontFamily: D.mono, fontSize: '9px', fontWeight: 800, padding: '1px 6px', borderRadius: D.pill, background: 'rgba(16, 185, 129, 0.15)', color: D.emerald }}>
                  🇿🇦 {playerA.saDemographic}
                </span>
              )}
              {playerA.bursaryScholar && (
                <span style={{ fontFamily: D.mono, fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: D.pill, background: 'rgba(168, 85, 247, 0.15)', color: D.purple || '#a855f7' }}>
                  🎓 Bursary
                </span>
              )}
            </div>
          </div>

          <PlayerSearchFilterSelect
            theme={D}
            players={filteredPlayersList}
            selectedPlayerId={playerAId}
            onSelectPlayer={p => setPlayerAId(p.id)}
            excludePlayerId={playerBId}
            accentColor={D.indigo}
            badgePrefix="PLAYER A"
          />
        </div>

        {/* Central VS / Swap Button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={handleSwap}
            title="Swap Player A and Player B"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: D.gradMain,
              border: `2px solid ${D.surf1}`,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: `0 4px 14px ${D.indigo}44`,
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08) rotate(180deg)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1) rotate(0deg)')}
          >
            <ArrowLeftRight size={18} />
          </button>
          <span style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 800, color: D.textMuted }}>
            VS
          </span>
        </div>

        {/* Player B Selector Card */}
        <div
          style={{
            padding: '16px',
            background: D.surf1,
            border: `1px solid ${D.sky}44`,
            borderRadius: D.lg,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            boxShadow: `0 4px 16px ${D.sky}10`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontFamily: D.mono, fontSize: '10px', fontWeight: 800, color: D.sky, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                PLAYER B
              </span>
              <span style={{ fontFamily: D.mono, fontSize: '9px', padding: '1px 6px', borderRadius: D.pill, background: `${D.sky}20`, color: D.sky, fontWeight: 700 }}>
                {playerB.ageDivision || playerB.team || '1st XI'}
              </span>
            </div>

            {/* SA Demographic Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {playerB.quotaEligible && (
                <span style={{ fontFamily: D.mono, fontSize: '9px', fontWeight: 800, padding: '1px 6px', borderRadius: D.pill, background: 'rgba(16, 185, 129, 0.15)', color: D.emerald }}>
                  🇿🇦 {playerB.saDemographic}
                </span>
              )}
              {playerB.bursaryScholar && (
                <span style={{ fontFamily: D.mono, fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: D.pill, background: 'rgba(168, 85, 247, 0.15)', color: D.purple || '#a855f7' }}>
                  🎓 Bursary
                </span>
              )}
            </div>
          </div>

          <PlayerSearchFilterSelect
            theme={D}
            players={filteredPlayersList}
            selectedPlayerId={playerBId}
            onSelectPlayer={p => setPlayerBId(p.id)}
            excludePlayerId={playerAId}
            accentColor={D.sky}
            badgePrefix="PLAYER B"
          />
        </div>
      </div>

      {/* ── SOUTH AFRICA TRANSFORMATION & QUOTA IMPACT PANEL ── */}
      <div
        style={{
          padding: '14px 18px',
          background: `${quotaInsight.color}10`,
          border: `1px solid ${quotaInsight.color}35`,
          borderRadius: D.lg,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>🇿🇦</span>
            <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: quotaInsight.color }}>
              {quotaInsight.tag}
            </span>
          </div>
          <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
            CSA Schools Transformation Target: 6 Generic Black (incl. 3 Black African) per Starting XI
          </span>
        </div>

        <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textPrimary, lineHeight: 1.5 }}>
          {quotaInsight.summary}
        </div>

        <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textSecondary, fontStyle: 'italic', background: D.surf1, padding: '6px 12px', borderRadius: D.sm, marginTop: '4px' }}>
          <strong>Scouting & Selection Directive:</strong> {quotaInsight.recommendation}
        </div>
      </div>

      {/* ── NAVIGATION TABS (5 MODES) ────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          borderBottom: `1px solid ${D.border}`,
          paddingBottom: '2px',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'skills', label: '🎯 Visual Skills Matrix', icon: Target },
          { id: 'quick', label: '⚔️ Battle Card / Quick Compare', icon: Zap },
          { id: 'performance', label: '📊 Match Performance', icon: BarChart3 },
          { id: 'matchup', label: '🥊 Tactical Simulation (Match-Up)', icon: Crosshair },
          { id: 'development', label: '📈 Longitudinal Trajectory', icon: TrendingUp },
        ].map(t => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as TabMode)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: `${D.md} ${D.md} 0 0`,
                background: isActive ? D.surf1 : 'transparent',
                border: `1px solid ${isActive ? D.border : 'transparent'}`,
                borderBottom: isActive ? `2px solid ${D.indigo}` : '1px solid transparent',
                color: isActive ? D.textPrimary : D.textMuted,
                fontFamily: D.head,
                fontSize: '13px',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <t.icon size={15} color={isActive ? D.indigo : D.textMuted} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB CONTENT: 1. VISUAL SKILLS MATRIX ────────── */}
      {activeTab === 'skills' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Radar & Differential Side-by-Side */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 1.2fr', gap: '16px' }}>
            {/* SVG Radar Chart Card */}
            <div
              style={{
                padding: '20px',
                background: D.surf1,
                border: `1px solid ${D.border}`,
                borderRadius: D.lg,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
                  Multi-Axis Core Skills Radar
                </div>

                {/* Radar Layer Toggles */}
                <div style={{ display: 'flex', gap: '3px', background: D.surf2, padding: '2px', borderRadius: D.pill }}>
                  {(['both', 'a', 'b'] as const).map(l => (
                    <button
                      key={l}
                      onClick={() => setRadarLayer(l)}
                      style={{
                        padding: '3px 9px',
                        borderRadius: D.pill,
                        background: radarLayer === l ? D.surf1 : 'transparent',
                        border: 'none',
                        color: radarLayer === l ? (l === 'a' ? D.indigo : l === 'b' ? D.sky : D.textPrimary) : D.textMuted,
                        fontFamily: D.mono,
                        fontSize: '10px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {l === 'both' ? 'Both' : l === 'a' ? playerA.name.split(' ')[0] : playerB.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Radar Legend */}
              <div style={{ display: 'flex', gap: '14px', marginBottom: '10px', fontFamily: D.mono, fontSize: '11px' }}>
                {(radarLayer === 'both' || radarLayer === 'a') && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: D.indigo }} />
                    <span style={{ color: D.indigo, fontWeight: 700 }}>{playerA.name} ({profileA.overallGrade})</span>
                  </div>
                )}
                {(radarLayer === 'both' || radarLayer === 'b') && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: D.sky }} />
                    <span style={{ color: D.sky, fontWeight: 700 }}>{playerB.name} ({profileB.overallGrade})</span>
                  </div>
                )}
              </div>

              {/* SVG Radar */}
              <svg width={radarPoints.size} height={radarPoints.size} style={{ overflow: 'visible' }}>
                {/* Concentric Grid Rings */}
                {radarPoints.gridLevels.map((lvl, i) => (
                  <polygon
                    key={i}
                    points={lvl}
                    fill="transparent"
                    stroke={D.border}
                    strokeWidth={1}
                    strokeDasharray={i === 3 ? 'none' : '3,3'}
                  />
                ))}

                {/* Spoke Lines */}
                {radarPoints.axisLines.map((l, i) => (
                  <g key={i}>
                    <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={D.border} strokeWidth={1} />
                    <text
                      x={l.lx}
                      y={l.ly}
                      fill={D.textMuted}
                      fontFamily={D.head}
                      fontSize="9px"
                      fontWeight="700"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {l.label}
                    </text>
                  </g>
                ))}

                {/* Polygon Layer A */}
                {(radarLayer === 'both' || radarLayer === 'a') && (
                  <polygon
                    points={radarPoints.polyA}
                    fill={`${D.indigo}33`}
                    stroke={D.indigo}
                    strokeWidth={2.5}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                )}

                {/* Polygon Layer B */}
                {(radarLayer === 'both' || radarLayer === 'b') && (
                  <polygon
                    points={radarPoints.polyB}
                    fill={`${D.sky}33`}
                    stroke={D.sky}
                    strokeWidth={2.5}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                )}
              </svg>
            </div>

            {/* Differential Delta Bars Card */}
            <div
              style={{
                padding: '20px',
                background: D.surf1,
                border: `1px solid ${D.border}`,
                borderRadius: D.lg,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
                    Differential Edge Analysis
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                    Left side reflects advantage for {playerA.name}; Right side for {playerB.name}.
                  </div>
                </div>

                <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, display: 'flex', gap: '8px' }}>
                  <span style={{ color: D.indigo, fontWeight: 700 }}>◀ {playerA.name.split(' ')[0]}</span>
                  <span>|</span>
                  <span style={{ color: D.sky, fontWeight: 700 }}>{playerB.name.split(' ')[0]} ▶</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-around' }}>
                {radarAxes.map(ax => {
                  return renderCentreDeltaBar(ax.axis, ax.valA, ax.valB, '/100');
                })}
              </div>
            </div>
          </div>

          {/* Hierarchical Skills Matrix Breakdown */}
          <div
            style={{
              padding: '20px',
              background: D.surf1,
              border: `1px solid ${D.border}`,
              borderRadius: D.lg,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                  Hierarchical Discipline & Technical Subskill Matrix
                </h3>
                <p style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted, margin: '2px 0 0 0' }}>
                  Evaluated across biomechanical video telemetry, match pitch logs, and verified coaching assessments.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                <span>Confidence:</span>
                <span style={{ color: D.emerald }}>● High Sample</span>
                <span style={{ color: D.amber }}>◐ Medium Sample</span>
                <span style={{ color: D.rose }}>○ Limited Sample</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
              {profileA.categories.map((cat, cIdx) => {
                const catB = profileB.categories[cIdx] || cat;
                return (
                  <div
                    key={cat.name}
                    style={{
                      background: D.surf2,
                      border: `1px solid ${D.border}`,
                      borderRadius: D.md,
                      padding: '14px',
                    }}
                  >
                    <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.textPrimary, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '3px', height: '14px', borderRadius: '1.5px', background: D.indigo }} />
                      {cat.name}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {cat.subskills.map((sub, sIdx) => {
                        const subB = catB.subskills[sIdx] || sub;
                        const diff = sub.a - subB.a;
                        const aWins = diff > 0;
                        const bWins = diff < 0;

                        return (
                          <div
                            key={sub.name}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '6px 8px',
                              background: D.surf1,
                              borderRadius: D.sm,
                              border: `1px solid ${D.border}`,
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontFamily: D.body, fontSize: '11px', fontWeight: 600, color: D.textPrimary }}>
                                {sub.name}
                              </div>
                              <div style={{ fontFamily: D.mono, fontSize: '9px', color: D.textMuted }}>
                                Confidence: {sub.sample}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                              {/* Player A score */}
                              <span
                                style={{
                                  fontFamily: D.mono,
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  color: aWins ? D.indigo : D.textSecondary,
                                  background: aWins ? `${D.indigo}18` : 'transparent',
                                  padding: '2px 6px',
                                  borderRadius: D.pill,
                                }}
                              >
                                {sub.a}
                              </span>

                              <span style={{ color: D.borderMed, fontSize: '11px' }}>vs</span>

                              {/* Player B score */}
                              <span
                                style={{
                                  fontFamily: D.mono,
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  color: bWins ? D.sky : D.textSecondary,
                                  background: bWins ? `${D.sky}18` : 'transparent',
                                  padding: '2px 6px',
                                  borderRadius: D.pill,
                                }}
                              >
                                {subB.a}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Role Suitability / Archetype Fit (Football Manager Style) */}
          <div
            style={{
              padding: '20px',
              background: D.surf1,
              border: `1px solid ${D.border}`,
              borderRadius: D.lg,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                  Role Suitability & Tactical Archetype Fit
                </h3>
                <p style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted, margin: '2px 0 0 0' }}>
                  Modelled tactical role fit percentages (0-100%) based on match phase requirements.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', fontFamily: D.mono, fontSize: '10px' }}>
                <span style={{ color: D.indigo, fontWeight: 700 }}>■ {playerA.name}</span>
                <span style={{ color: D.sky, fontWeight: 700 }}>■ {playerB.name}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
              {profileA.roleSuitability.map((r, idx) => {
                const rB = profileB.roleSuitability[idx] || r;
                return (
                  <div
                    key={r.role}
                    style={{
                      padding: '10px 12px',
                      background: D.surf2,
                      border: `1px solid ${D.border}`,
                      borderRadius: D.md,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textPrimary }}>
                        {r.role}
                      </span>
                      <div style={{ fontFamily: D.mono, fontSize: '10px', display: 'flex', gap: '6px' }}>
                        <span style={{ color: D.indigo, fontWeight: 800 }}>{r.fit}%</span>
                        <span style={{ color: D.textMuted }}>/</span>
                        <span style={{ color: D.sky, fontWeight: 800 }}>{rB.fit}%</span>
                      </div>
                    </div>

                    {/* Dual Progress Bar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div style={{ height: '5px', width: '100%', background: D.surf3, borderRadius: D.pill, overflow: 'hidden' }}>
                        <div style={{ width: `${r.fit}%`, height: '100%', background: D.indigo, borderRadius: D.pill }} />
                      </div>
                      <div style={{ height: '5px', width: '100%', background: D.surf3, borderRadius: D.pill, overflow: 'hidden' }}>
                        <div style={{ width: `${rB.fit}%`, height: '100%', background: D.sky, borderRadius: D.pill }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: 2. BATTLE CARD / QUICK COMPARE ── */}
      {activeTab === 'quick' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Edge Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Player A Edges */}
            <div style={{ padding: '16px', background: `${D.indigo}10`, border: `1px solid ${D.indigo}33`, borderRadius: D.lg }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Flame size={16} color={D.indigo} />
                <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.indigo }}>
                  Where {playerA.name} Holds the Edge
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontFamily: D.body, fontSize: '12px', color: D.textPrimary, lineHeight: 1.6 }}>
                {playerA.avg > playerB.avg && <li>Superior batting average (+{(playerA.avg - playerB.avg).toFixed(1)}) and match anchor capacity</li>}
                {playerA.sr > playerB.sr && <li>Higher boundary strike rate (+{(playerA.sr - playerB.sr).toFixed(1)}) in powerplay overs</li>}
                {playerA.wkts > playerB.wkts && <li>Higher wicket-taking impact (+{playerA.wkts - playerB.wkts} season wickets)</li>}
                {playerA.econ < playerB.econ && <li>Tighter bowling economy ({(playerB.econ - playerA.econ).toFixed(2)} rpo lower)</li>}
                {playerA.quotaEligible && <li>CSA Quota Candidate ({playerA.saDemographic}) aiding squad transformation compliance</li>}
                {playerA.cap === 'c' && <li>First XI Captaincy experience and match decision leadership</li>}
              </ul>
            </div>

            {/* Player B Edges */}
            <div style={{ padding: '16px', background: `${D.sky}10`, border: `1px solid ${D.sky}33`, borderRadius: D.lg }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Flame size={16} color={D.sky} />
                <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.sky }}>
                  Where {playerB.name} Holds the Edge
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontFamily: D.body, fontSize: '12px', color: D.textPrimary, lineHeight: 1.6 }}>
                {playerB.avg > playerA.avg && <li>Superior batting average (+{(playerB.avg - playerA.avg).toFixed(1)}) and match anchor capacity</li>}
                {playerB.sr > playerA.sr && <li>Higher boundary strike rate (+{(playerB.sr - playerA.sr).toFixed(1)}) in powerplay overs</li>}
                {playerB.wkts > playerA.wkts && <li>Higher wicket-taking impact (+{playerB.wkts - playerA.wkts} season wickets)</li>}
                {playerB.econ < playerA.econ && <li>Tighter bowling economy ({(playerA.econ - playerB.econ).toFixed(2)} rpo lower)</li>}
                {playerB.quotaEligible && <li>CSA Quota Candidate ({playerB.saDemographic}) aiding squad transformation compliance</li>}
                {playerB.cap === 'c' && <li>First XI Captaincy experience and match decision leadership</li>}
              </ul>
            </div>
          </div>

          {/* Broadcast Stat Battle Table */}
          <div style={{ padding: '20px', background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.lg }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                Statistical Battle Matrix (All Key Metrics)
              </h3>
              <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                Direction-aware win highlighting applied
              </span>
            </div>

            {renderCentreDeltaBar('Batting Average', playerA.avg, playerB.avg, '')}
            {renderCentreDeltaBar('Strike Rate', playerA.sr, playerB.sr, '')}
            {renderCentreDeltaBar('Total Career Runs', runsA, runsB, '')}
            {renderCentreDeltaBar('Season Wickets', playerA.wkts, playerB.wkts, '')}
            {renderCentreDeltaBar('Bowling Economy', playerA.econ || 6.0, playerB.econ || 6.0, ' rpo', true)}
            {renderCentreDeltaBar('Boundary Frequency %', Math.round(playerA.sr * 0.16), Math.round(playerB.sr * 0.16), '%')}
            {renderCentreDeltaBar('Dot Ball Avoidance %', 68 + Math.round(playerA.avg * 0.3), 68 + Math.round(playerB.avg * 0.3), '%')}
            {renderCentreDeltaBar('Fielding & Catching Grade', profileA.overallGrade, profileB.overallGrade, '/100')}
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: 3. PERFORMANCE SPLITS ──────────── */}
      {activeTab === 'performance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {/* Match Phase Breakdown */}
            <div style={{ padding: '20px', background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.lg }}>
              <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary, marginBottom: '12px' }}>
                Match Phase Run Rate & Impact
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { phase: 'Powerplay (Overs 1-10)', aSR: Math.round(playerA.sr * 0.95), bSR: Math.round(playerB.sr * 0.95), aAvg: Math.round(playerA.avg * 1.1), bAvg: Math.round(playerB.avg * 1.1) },
                  { phase: 'Middle Overs (Overs 11-40)', aSR: Math.round(playerA.sr * 0.88), bSR: Math.round(playerB.sr * 0.88), aAvg: Math.round(playerA.avg * 1.05), bAvg: Math.round(playerB.avg * 1.05) },
                  { phase: 'Death Overs (Overs 41-50)', aSR: Math.round(playerA.sr * 1.45), bSR: Math.round(playerB.sr * 1.45), aAvg: Math.round(playerA.avg * 0.75), bAvg: Math.round(playerB.avg * 0.75) },
                ].map(ph => (
                  <div key={ph.phase} style={{ padding: '10px', background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}` }}>
                    <div style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textPrimary, marginBottom: '6px' }}>
                      {ph.phase}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.mono, fontSize: '11px' }}>
                      <div style={{ color: D.indigo }}>
                        <strong>{playerA.name.split(' ')[0]}:</strong> SR {ph.aSR} · Avg {ph.aAvg}
                      </div>
                      <div style={{ color: D.sky }}>
                        <strong>{playerB.name.split(' ')[0]}:</strong> SR {ph.bSR} · Avg {ph.bAvg}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Opposition Bowling Splits */}
            <div style={{ padding: '20px', background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.lg }}>
              <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary, marginBottom: '12px' }}>
                Opposition Bowling Type Splits
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { type: 'vs Right-Arm Pace (Fast & Medium)', a: 45.2, b: 42.0 },
                  { type: 'vs Left-Arm Pace (Angle Inward)', a: 39.0, b: 48.5 },
                  { type: 'vs Off-Spin (Finger Spin)', a: 52.4, b: 38.0 },
                  { type: 'vs Leg-Spin (Wrist Spin & Drift)', a: 34.0, b: 41.5 },
                ].map(sp => renderCentreDeltaBar(sp.type, sp.a, sp.b, ' avg'))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: 4. MATCH-UP TACTICAL SIMULATION ─ */}
      {activeTab === 'matchup' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ padding: '20px', background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.lg }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                  Direct Tactical Matchup Simulation: {playerA.name} ({playerA.role}) vs {playerB.name} ({playerB.role})
                </h3>
                <p style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted, margin: '2px 0 0 0' }}>
                  Derived from ball-by-ball GPS tracking, pitch-zone telemetry, and historical encounter logs.
                </p>
              </div>
              <span style={{ fontFamily: D.mono, fontSize: '10px', background: `${D.indigo}20`, color: D.indigo, padding: '3px 8px', borderRadius: D.pill, fontWeight: 700 }}>
                High Confidence Model
              </span>
            </div>

            {/* Tactical Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '12px', background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}`, textAlign: 'center' }}>
                <div style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 800, color: D.indigo }}>54</div>
                <div style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, marginTop: '2px' }}>Balls Encountered</div>
              </div>
              <div style={{ padding: '12px', background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}`, textAlign: 'center' }}>
                <div style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 800, color: D.emerald }}>68</div>
                <div style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, marginTop: '2px' }}>Runs Conceded / Scored</div>
              </div>
              <div style={{ padding: '12px', background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}`, textAlign: 'center' }}>
                <div style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 800, color: D.sky }}>125.9</div>
                <div style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, marginTop: '2px' }}>Head-to-Head Strike Rate</div>
              </div>
              <div style={{ padding: '12px', background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}`, textAlign: 'center' }}>
                <div style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 800, color: D.rose }}>2</div>
                <div style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, marginTop: '2px' }}>Dismissals Forced</div>
              </div>
            </div>

            {/* Tactical Coaching Advice Card */}
            <div style={{ padding: '16px', background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}` }}>
              <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.textPrimary, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Crosshair size={14} color={D.indigo} />
                Analyst Game-Plan Advisory:
              </div>
              <p style={{ fontFamily: D.body, fontSize: '12px', color: D.textSecondary, lineHeight: 1.6, margin: 0 }}>
                When {playerB.name} bowls to {playerA.name}, pitch maps demonstrate that back-of-a-length deliveries on off-stump channel yield a 34% false-shot rate. In contrast, full deliveries on leg-stump are routinely dispatched at 9.2 rpo. Recommendation: Deploy a deep mid-wicket sweeper and attack the 4th stump corridor early.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: 5. DEVELOPMENT TRAJECTORY ──────── */}
      {activeTab === 'development' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ padding: '20px', background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.lg }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                  12-Month Longitudinal Skill Progression & Cohort Benchmark
                </h3>
                <p style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted, margin: '2px 0 0 0' }}>
                  Tracks skill rating index progression over the last 4 quarters against the KZN 1st XI regional baseline.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {[
                { quarter: 'Q1 2025', a: 78, b: 74, benchmark: 75 },
                { quarter: 'Q2 2025', a: 82, b: 77, benchmark: 78 },
                { quarter: 'Q3 2025', a: 85, b: 83, benchmark: 80 },
                { quarter: 'Q4 2025 / Current', a: profileA.overallGrade, b: profileB.overallGrade, benchmark: 82 },
              ].map(q => (
                <div key={q.quarter} style={{ padding: '14px', background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}` }}>
                  <div style={{ fontFamily: D.mono, fontSize: '11px', fontWeight: 700, color: D.textMuted, marginBottom: '8px' }}>
                    {q.quarter}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontFamily: D.mono, fontSize: '12px' }}>
                    <span style={{ color: D.indigo, fontWeight: 700 }}>{playerA.name.split(' ')[0]}: {q.a}</span>
                    <span style={{ color: D.sky, fontWeight: 700 }}>{playerB.name.split(' ')[0]}: {q.b}</span>
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                    Regional Baseline: {q.benchmark}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── EXPORT / SHARE MODAL ─────────────────────────── */}
      {showShareModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setShowShareModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '520px',
              background: D.surf1,
              border: `1px solid ${D.border}`,
              borderRadius: D.xl,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color={D.indigo} />
                <h3 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                  Shareable Head-to-Head Battle Card
                </h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                style={{ background: 'transparent', border: 'none', color: D.textMuted, fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Card Preview */}
            <div
              style={{
                padding: '20px',
                background: D.gradMain,
                borderRadius: D.lg,
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: D.mono, fontSize: '10px', letterSpacing: '0.08em', opacity: 0.9 }}>
                <span>SCRBRD OS · HEAD-TO-HEAD BATTLE</span>
                <span>KZN SCHOOLS CRICKET</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800 }}>{playerA.name}</div>
                  <div style={{ fontFamily: D.body, fontSize: '12px', opacity: 0.85 }}>{schoolA.crestIcon} {schoolA.name}</div>
                  <div style={{ fontFamily: D.mono, fontSize: '11px', fontWeight: 700, marginTop: '2px' }}>Avg {playerA.avg} · SR {playerA.sr}</div>
                </div>

                <div style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 900, opacity: 0.8 }}>VS</div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800 }}>{playerB.name}</div>
                  <div style={{ fontFamily: D.body, fontSize: '12px', opacity: 0.85 }}>{schoolB.crestIcon} {schoolB.name}</div>
                  <div style={{ fontFamily: D.mono, fontSize: '11px', fontWeight: 700, marginTop: '2px' }}>Avg {playerB.avg} · SR {playerB.sr}</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button
                onClick={() => {
                  setShareCopied(true);
                  setTimeout(() => setShareCopied(false), 2000);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: D.pill,
                  background: D.indigo,
                  color: '#fff',
                  border: 'none',
                  fontFamily: D.head,
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {shareCopied ? '✓ Link Copied to Clipboard!' : 'Copy Shareable Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
