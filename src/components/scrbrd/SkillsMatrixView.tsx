'use client';

import React, { useState, useMemo } from 'react';
import { Theme, Player, SkillAssessmentRecord, SkillConfidence } from './types';
import { PLAYERS, SCHOOLS_REGISTRY, ROLES, POPIA_POLICIES } from './data';
import {
  CRICKET_V1_RUBRIC,
  INITIAL_ASSESSMENT_LOG,
  CANONICAL_AGE_GROUPS,
  CANONICAL_DIVISIONS,
  CANONICAL_TEAM_CLASSES,
  getLatestCommittedAssessment,
  calculateAgeRelativeIndex,
  getLongitudinalTrajectory,
  checkPOPIAAccess,
  generateSubjectAccessRequestExport
} from './skillsAssessmentData';
import PlayerSearchFilterSelect from './PlayerSearchFilterSelect';
import PlayerSkillRadarChart from './PlayerSkillRadarChart';
import {
  calculateBattingIndex,
  calculateBowlingIndex,
  calculateSelfAdjustedRating,
  MIN_BALLS_FACED,
  MIN_BALLS_BOWLED,
  FULL_EVIDENCE_SAMPLE,
} from './performanceRatingEngine';
import {
  Target, Award, TrendingUp, Shield, Zap, Sparkles, CheckCircle2,
  AlertCircle, Dumbbell, UserCheck, BookOpen, Clock, Layers,
  ChevronRight, Edit3, Save, RotateCcw, Filter, Search, ArrowUpRight,
  Flame, Lock, Eye, BarChart2, Download, FileText, Info, HelpCircle, Activity
} from 'lucide-react';

interface SkillsMatrixViewProps {
  theme: Theme;
  players?: Player[];
  currentRole?: string;
  activeSchoolId?: string;
  currentUser?: string;
  onNavigateToScouting?: () => void;
  onSelectPlayerProfile?: (player: Player) => void;
}

export default function SkillsMatrixView({
  theme: D,
  players = PLAYERS,
  currentRole: initialRole = 'headcoach',
  activeSchoolId = 'WES',
  currentUser = 'Wayne Scott',
  onNavigateToScouting,
  onSelectPlayerProfile,
}: SkillsMatrixViewProps) {
  // Role Simulation & RBAC State
  const [simulatedRole, setSimulatedRole] = useState<string>(initialRole);
  const roleConfig = ROLES[simulatedRole] || ROLES.headcoach;
  const popiaPolicy = POPIA_POLICIES[simulatedRole] || POPIA_POLICIES.headcoach;

  // Append-only assessment log (immutable history)
  const [assessmentLog, setAssessmentLog] = useState<SkillAssessmentRecord[]>(INITIAL_ASSESSMENT_LOG);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'matrix' | 'passport' | 'longitudinal' | 'rubric' | 'drills' | 'popia_sar'>('matrix');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(activeSchoolId);
  const [selectedSquad, setSelectedSquad] = useState<string>('All');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('All');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('p1');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Display Mode: Fixed Terminal Standard (0-100) vs Derived Age-Relative Par Index
  const [displayMode, setDisplayMode] = useState<'terminal_100' | 'age_relative_par'>('terminal_100');

  // Selected Skill for Rubric inspection or Trajectory view
  const [selectedSkillKey, setSelectedSkillKey] = useState<string>('footwork');
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<'batting' | 'bowling' | 'fielding' | 'tacticalMental' | 'physical'>('batting');

  // Draft Assessment Form State
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [draftScores, setDraftScores] = useState<SkillAssessmentRecord['scores'] | null>(null);
  const [draftConfidence, setDraftConfidence] = useState<Record<string, SkillConfidence>>({});
  const [draftNotes, setDraftNotes] = useState<string>('');
  const [draftGoals, setDraftGoals] = useState<string>('');
  const [draftWindow, setDraftWindow] = useState<string>('2026-T1');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Subject Access Request Export Modal
  const [sarExportModal, setSarExportModal] = useState<boolean>(false);

  // Structural Overview Modal
  const [structuralModalOpen, setStructuralModalOpen] = useState<boolean>(false);

  // Permissions check
  const canAssess = ['superadmin', 'headcoach', 'coach', 'sportsmaster', 'doc'].includes(simulatedRole);
  const isAnalyst = simulatedRole === 'analyst' || simulatedRole === 'scout';
  const isParentOrPlayer = simulatedRole === 'player' || simulatedRole === 'parent';
  const isOtherCoach = simulatedRole === 'Coach (other team)';

  // POPIA Access Rules
  const notesAccess = checkPOPIAAccess(simulatedRole, 'notes');
  const historyAccess = checkPOPIAAccess(simulatedRole, 'history');

  // Filter players
  const filteredPlayers = useMemo(() => {
    let list = players;

    if (isParentOrPlayer) {
      list = players.filter(p => p.id === 'p1' || p.id === 'w1');
    } else {
      if (selectedSchoolId !== 'ALL') {
        list = list.filter(p => p.school === selectedSchoolId);
      }
    }

    if (selectedSquad !== 'All') {
      list = list.filter(p => p.team === selectedSquad || p.teamClass === selectedSquad);
    }

    if (selectedAgeGroup !== 'All') {
      list = list.filter(p => p.ageGroupEligibility === selectedAgeGroup);
    }

    if (roleFilter !== 'All') {
      list = list.filter(p => p.role === roleFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.school.toLowerCase().includes(q) ||
        p.team.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q)
      );
    }

    return list;
  }, [players, selectedSchoolId, selectedSquad, selectedAgeGroup, roleFilter, searchQuery, isParentOrPlayer]);

  // Active selected player
  const activePlayer = useMemo(() => {
    return players.find(p => p.id === selectedPlayerId) || filteredPlayers[0] || players[0];
  }, [players, selectedPlayerId, filteredPlayers]);

  // Derived Read: Latest Committed Assessment for active player
  const latestAssessment = useMemo(() => {
    if (!activePlayer) return null;
    return getLatestCommittedAssessment(activePlayer.id, assessmentLog);
  }, [activePlayer, assessmentLog]);

  // Trajectory series for selected player & skill
  const trajectoryPoints = useMemo(() => {
    if (!activePlayer) return [];
    return getLongitudinalTrajectory(activePlayer.id, selectedSkillKey, selectedSkillCategory, assessmentLog);
  }, [activePlayer, selectedSkillKey, selectedSkillCategory, assessmentLog]);

  // Initialize draft evaluation with Carry-Forward Semantics
  const startEvaluation = () => {
    if (!activePlayer) return;

    if (latestAssessment) {
      // Carry forward prior scores with confidence marked as 'inherited'
      setDraftScores(JSON.parse(JSON.stringify(latestAssessment.scores)));
      const initConfidence: Record<string, SkillConfidence> = {};
      Object.keys(CRICKET_V1_RUBRIC).forEach(k => {
        initConfidence[k] = 'inherited';
      });
      setDraftConfidence(initConfidence);
      setDraftNotes('');
      setDraftGoals(latestAssessment.targetDevelopmentGoals?.join(', ') || '');
    } else {
      // Default baseline scores
      const baseScores: SkillAssessmentRecord['scores'] = {
        batting: { footwork: 60, frontFootDrive: 62, backFootPullCut: 58, defenseLeave: 60, powerHitting: 55, strikeRotation: 58 },
        bowling: { seamRelease: 58, lineLengthControl: 60, paceVariations: 52, deathYorkers: 50, driftTurn: 50 },
        fielding: { ringGroundwork: 64, highCatching: 65, directHitAccuracy: 58, gloveworkSpeed: 55, athleticismSlide: 62 },
        tacticalMental: { matchIQ: 62, pressureComposure: 60, fieldSettingIntuition: 58, coachabilityWorkEthic: 85 },
        physical: { mobilityIndex: 65, weeklyOverTolerance: 55, yoyoLevel: 18.0, sprint20m: 3.05 },
      };
      setDraftScores(baseScores);
      const initConfidence: Record<string, SkillConfidence> = {};
      Object.keys(CRICKET_V1_RUBRIC).forEach(k => {
        initConfidence[k] = 'high';
      });
      setDraftConfidence(initConfidence);
      setDraftNotes('');
      setDraftGoals('Consolidate technical foundations under match intensity');
    }

    setIsEvaluating(true);
  };

  // Commit draft assessment to the append-only log
  const handleCommitAssessment = () => {
    if (!draftScores || !activePlayer) return;

    const newRecord: SkillAssessmentRecord = {
      id: `asm_${activePlayer.id}_${Date.now()}`,
      tenantId: activePlayer.school,
      playerId: activePlayer.id,
      playerName: activePlayer.name,
      rubricVersion: 'cricket-v1',
      assessedBy: 'coach_current',
      assessorName: `${currentUser} (${roleConfig.label})`,
      assessorRole: roleConfig.label,
      assessedAt: new Date().toISOString(),
      committedAt: new Date().toISOString(),
      ageGroup: (activePlayer.ageGroupEligibility as 'U14' | 'U15' | 'U16' | 'Open') || 'Open',
      squad: activePlayer.team,
      window: draftWindow,
      priorAssessmentId: latestAssessment ? latestAssessment.id : null,
      status: 'committed',
      scores: draftScores,
      confidence: draftConfidence,
      notes: draftNotes.trim() || undefined,
      targetDevelopmentGoals: draftGoals.trim() ? draftGoals.split(',').map(g => g.trim()) : undefined,
    };

    setAssessmentLog(prev => [newRecord, ...prev]);
    setIsEvaluating(false);
    setSaveSuccessMsg(`Assessment committed to append-only log for ${activePlayer.name} (${draftWindow}). Prior record superseded.`);
    setTimeout(() => setSaveSuccessMsg(null), 4500);
  };

  // Active School Item
  const activeSchool = SCHOOLS_REGISTRY.find(s => s.id === selectedSchoolId) || SCHOOLS_REGISTRY[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* ── TOP BANNER & GOVERNANCE ROLE SIMULATOR ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '18px 22px',
        borderRadius: D.lg,
        background: `linear-gradient(135deg, ${D.cardBg} 0%, ${activeSchool.colors[0]}15 100%)`,
        border: `1px solid ${D.borderMed}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: D.md,
            background: `${D.emerald}22`,
            border: `1px solid ${D.emerald}55`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: D.emerald,
          }}>
            <Target size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: D.head, fontSize: '20px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                Skills Assessment & Longitudinal Development
              </h1>
              <span style={{
                padding: '3px 9px',
                borderRadius: D.pill,
                background: `${D.emerald}22`,
                color: D.emerald,
                border: `1px solid ${D.emerald}44`,
                fontSize: '11px',
                fontFamily: D.mono,
                fontWeight: 700,
              }}>
                Rubric: cricket-v1 (Append-Only Log)
              </span>
            </div>
            <p style={{ fontFamily: D.body, fontSize: '13px', color: D.textSecondary, margin: '4px 0 0' }}>
              Fixed terminal standard (0-100) vs derived age-relative par index, carry-forward deltas, and POPIA SAR compliance.
            </p>
          </div>
        </div>

        {/* Governance Controls & Structural Definitions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Structural Dimensions Info Button */}
          <button
            onClick={() => setStructuralModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: D.md,
              background: D.surf1,
              border: `1px solid ${D.border}`,
              color: D.textPrimary,
              fontFamily: D.head,
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            title="View Age Groups, Divisions & Team Classes Definitions"
          >
            <BookOpen size={14} color={D.sky} />
            <span>Cricket Structure Spec</span>
          </button>

          {/* Role Switcher (Simulating POPIA RBAC Roles) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>RBAC Role:</span>
            <select
              value={simulatedRole}
              onChange={e => setSimulatedRole(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: D.md,
                background: D.surf1,
                border: `1px solid ${roleConfig.color}66`,
                color: D.textPrimary,
                fontFamily: D.head,
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <option value="headcoach">⭐ 1st XI Head Coach (Full Access)</option>
              <option value="coach">🎯 Squad Coach (Team Access)</option>
              <option value="analyst">📊 Performance Analyst (De-Identified / Notes Restricted)</option>
              <option value="Coach (other team)">👀 Coach (Other Team - Scores Only)</option>
              <option value="player">🏏 Student Athlete (Self View)</option>
              <option value="parent">👪 Parent / Guardian (SAR Request)</option>
            </select>
          </div>

          {/* POPIA SAR Export Trigger */}
          <button
            onClick={() => setSarExportModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: D.md,
              background: `${D.violet}22`,
              border: `1px solid ${D.violet}55`,
              color: D.violet,
              fontFamily: D.head,
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Download size={14} />
            <span>POPIA SAR Export</span>
          </button>
        </div>
      </div>

      {/* POPIA Analyst Notice Banner if applicable */}
      {isAnalyst && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 18px',
          borderRadius: D.md,
          background: `${D.sky}18`,
          border: `1px solid ${D.sky}44`,
          color: D.textPrimary,
          fontSize: '12px',
        }}>
          <Shield size={18} color={D.sky} />
          <div>
            <strong style={{ color: D.sky }}>POPIA Privacy Compliance (Analyst View):</strong> Numeric skill ratings are available under de-identified statistical terms. All narrative coach notes and private minor evaluations are strictly stripped.
          </div>
        </div>
      )}

      {/* Success Notification Alert */}
      {saveSuccessMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 18px',
          borderRadius: D.md,
          background: `${D.emerald}22`,
          border: `1px solid ${D.emerald}`,
          color: D.textPrimary,
          fontFamily: D.head,
          fontSize: '13px',
        }}>
          <CheckCircle2 size={18} color={D.emerald} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* ── NAVIGATION SUB-TABS ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${D.border}`,
        paddingBottom: '8px',
        gap: '12px',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {[
            { id: 'matrix', label: 'Squad Matrix & Heatmap', icon: <Layers size={16} /> },
            { id: 'passport', label: 'Player Skills Passport', icon: <UserCheck size={16} /> },
            { id: 'longitudinal', label: 'Multi-Season Trajectory', icon: <TrendingUp size={16} /> },
            { id: 'rubric', label: 'Anchored Rubric (cricket-v1)', icon: <BookOpen size={16} /> },
            { id: 'drills', label: 'CSA Drill Curriculum', icon: <Dumbbell size={16} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: D.md,
                background: activeTab === tab.id ? `${D.emerald}22` : 'transparent',
                border: `1px solid ${activeTab === tab.id ? D.emerald : 'transparent'}`,
                color: activeTab === tab.id ? D.textPrimary : D.textMuted,
                fontFamily: D.head,
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ color: activeTab === tab.id ? D.emerald : D.textMuted }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Display Mode Toggle: Terminal 100 vs Age-Relative Par */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: D.surf1, padding: '4px', borderRadius: D.pill, border: `1px solid ${D.border}` }}>
          <button
            onClick={() => setDisplayMode('terminal_100')}
            style={{
              padding: '4px 12px',
              borderRadius: D.pill,
              background: displayMode === 'terminal_100' ? D.emerald : 'transparent',
              color: displayMode === 'terminal_100' ? '#ffffff' : D.textMuted,
              border: 'none',
              fontFamily: D.mono,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Fixed Standard (0-100)
          </button>
          <button
            onClick={() => setDisplayMode('age_relative_par')}
            style={{
              padding: '4px 12px',
              borderRadius: D.pill,
              background: displayMode === 'age_relative_par' ? D.emerald : 'transparent',
              color: displayMode === 'age_relative_par' ? '#ffffff' : D.textMuted,
              border: 'none',
              fontFamily: D.mono,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Derived Age-Par Index (x.xx)
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SUB-TAB 1: SQUAD COMPETENCY MATRIX */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'matrix' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Controls Bar: School, Squad, Age Group, Role */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '14px 16px',
            borderRadius: D.md,
            background: D.cardBg,
            border: `1px solid ${D.border}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {!isParentOrPlayer && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted, textTransform: 'uppercase' }}>School:</span>
                  <select
                    value={selectedSchoolId}
                    onChange={e => setSelectedSchoolId(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: D.md,
                      background: D.surf1,
                      border: `1px solid ${D.border}`,
                      color: D.textPrimary,
                      fontFamily: D.head,
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {SCHOOLS_REGISTRY.map(s => (
                      <option key={s.id} value={s.id}>{s.crestIcon} {s.shortName}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Age Group Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted, textTransform: 'uppercase' }}>Age Group:</span>
                {['All', 'U14', 'U15', 'U16', 'Open'].map(ag => (
                  <button
                    key={ag}
                    onClick={() => setSelectedAgeGroup(ag)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: D.pill,
                      background: selectedAgeGroup === ag ? `${D.emerald}22` : D.surf1,
                      border: `1px solid ${selectedAgeGroup === ag ? D.emerald : D.border}`,
                      color: selectedAgeGroup === ag ? D.emerald : D.textMuted,
                      fontFamily: D.head,
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {ag}
                  </button>
                ))}
              </div>

              {/* Squad Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted, textTransform: 'uppercase' }}>Squad:</span>
                {['All', '1st XI', '2nd XI', 'U16A', 'U15A', 'U14A'].map(sq => (
                  <button
                    key={sq}
                    onClick={() => setSelectedSquad(sq)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: D.pill,
                      background: selectedSquad === sq ? `${D.sky}22` : D.surf1,
                      border: `1px solid ${selectedSquad === sq ? D.sky : D.border}`,
                      color: selectedSquad === sq ? D.sky : D.textMuted,
                      fontFamily: D.head,
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {sq}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: D.textMuted }} />
              <input
                type="text"
                placeholder="Search athlete..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 12px 6px 30px',
                  borderRadius: D.md,
                  background: D.surf1,
                  border: `1px solid ${D.border}`,
                  color: D.textPrimary,
                  fontFamily: D.body,
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Matrix Heatmap Table (Derived Reads from Append-Only Log) */}
          <div style={{
            borderRadius: D.lg,
            background: D.cardBg,
            border: `1px solid ${D.border}`,
            overflow: 'hidden',
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: D.surf1, borderBottom: `1px solid ${D.border}` }}>
                    <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textSecondary }}>Athlete & Structure</th>
                    <th style={{ padding: '12px 10px', fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textSecondary, textAlign: 'center' }}>Role</th>
                    <th style={{ padding: '12px 10px', fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.emerald, textAlign: 'center' }}>
                      {displayMode === 'terminal_100' ? 'Footwork (0-100)' : 'Footwork (Age Par)'}
                    </th>
                    <th style={{ padding: '12px 10px', fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.sky, textAlign: 'center' }}>
                      {displayMode === 'terminal_100' ? 'Cover Drive' : 'Cover Drive Par'}
                    </th>
                    <th style={{ padding: '12px 10px', fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.violet, textAlign: 'center' }}>
                      {displayMode === 'terminal_100' ? 'Seam Release' : 'Seam Par'}
                    </th>
                    <th style={{ padding: '12px 10px', fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.violet, textAlign: 'center' }}>
                      {displayMode === 'terminal_100' ? 'Yorkers' : 'Yorker Par'}
                    </th>
                    <th style={{ padding: '12px 10px', fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.amber, textAlign: 'center' }}>
                      {displayMode === 'terminal_100' ? 'Catching' : 'Catching Par'}
                    </th>
                    <th style={{ padding: '12px 10px', fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.pink, textAlign: 'center' }}>
                      {displayMode === 'terminal_100' ? 'Match IQ' : 'Match IQ Par'}
                    </th>
                    <th style={{ padding: '12px 10px', fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.sky, textAlign: 'center' }}>
                      Evidence Drift
                    </th>
                    <th style={{ padding: '12px 10px', fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textMuted, textAlign: 'center' }}>Assessment Window</th>
                    <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textSecondary, textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.map(p => {
                    const latest = getLatestCommittedAssessment(p.id, assessmentLog);
                    const ageGroup = (p.ageGroupEligibility as 'U14' | 'U15' | 'U16' | 'Open') || 'Open';

                    const footworkScore = latest?.scores.batting.footwork ?? 60;
                    const driveScore = latest?.scores.batting.frontFootDrive ?? 62;
                    const seamScore = latest?.scores.bowling.seamRelease ?? 58;
                    const yorkerScore = latest?.scores.bowling.deathYorkers ?? 50;
                    const catchScore = latest?.scores.fielding.highCatching ?? 64;
                    const iqScore = latest?.scores.tacticalMental.matchIQ ?? 62;

                    const footworkRel = calculateAgeRelativeIndex(footworkScore, ageGroup, 'footwork');
                    const driveRel = calculateAgeRelativeIndex(driveScore, ageGroup, 'frontFootDrive');
                    const seamRel = calculateAgeRelativeIndex(seamScore, ageGroup, 'seamRelease');
                    const yorkerRel = calculateAgeRelativeIndex(yorkerScore, ageGroup, 'deathYorkers');
                    const catchRel = calculateAgeRelativeIndex(catchScore, ageGroup, 'highCatching');
                    const iqRel = calculateAgeRelativeIndex(iqScore, ageGroup, 'matchIQ');

                    return (
                      <tr
                        key={p.id}
                        onClick={() => {
                          setSelectedPlayerId(p.id);
                          setActiveTab('passport');
                        }}
                        style={{
                          borderBottom: `1px solid ${D.border}`,
                          background: selectedPlayerId === p.id ? `${D.emerald}11` : 'transparent',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: `${p.role === 'BAT' ? D.sky : p.role === 'BOWL' ? D.violet : D.emerald}22`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: D.head,
                              fontWeight: 700,
                              fontSize: '12px',
                              color: p.role === 'BAT' ? D.sky : p.role === 'BOWL' ? D.violet : D.emerald,
                            }}>
                              {p.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: D.textPrimary }}>
                                {p.name} {p.cap ? `(${p.cap})` : ''}
                              </div>
                              <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                                {p.academicGrade || 'Grade 10'} · {p.team} · Age Group: {p.ageGroupEligibility || 'Open'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: D.pill,
                            background: p.role === 'BAT' ? `${D.sky}22` : p.role === 'BOWL' ? `${D.violet}22` : `${D.emerald}22`,
                            color: p.role === 'BAT' ? D.sky : p.role === 'BOWL' ? D.violet : D.emerald,
                            fontFamily: D.mono,
                            fontSize: '10px',
                            fontWeight: 700,
                          }}>
                            {p.role}
                          </span>
                        </td>
                        {/* Footwork */}
                        <td style={{ padding: '12px 10px', textAlign: 'center', fontFamily: D.mono, fontSize: '12px' }}>
                          {displayMode === 'terminal_100' ? (
                            <span style={{ color: footworkScore >= 75 ? D.emerald : D.textPrimary, fontWeight: 700 }}>
                              {footworkScore}
                            </span>
                          ) : (
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: D.pill,
                              background: footworkRel.index >= 1.05 ? `${D.emerald}22` : D.surf1,
                              color: footworkRel.index >= 1.05 ? D.emerald : D.textSecondary,
                              fontWeight: 700,
                              fontSize: '11px',
                            }}>
                              {footworkRel.index}x ({footworkRel.benchmark})
                            </span>
                          )}
                        </td>
                        {/* Cover Drive */}
                        <td style={{ padding: '12px 10px', textAlign: 'center', fontFamily: D.mono, fontSize: '12px' }}>
                          {displayMode === 'terminal_100' ? (
                            <span>{driveScore}</span>
                          ) : (
                            <span style={{ color: driveRel.index >= 1.05 ? D.emerald : D.textSecondary, fontWeight: 700, fontSize: '11px' }}>
                              {driveRel.index}x
                            </span>
                          )}
                        </td>
                        {/* Seam */}
                        <td style={{ padding: '12px 10px', textAlign: 'center', fontFamily: D.mono, fontSize: '12px' }}>
                          {displayMode === 'terminal_100' ? (
                            <span>{seamScore}</span>
                          ) : (
                            <span style={{ color: seamRel.index >= 1.05 ? D.emerald : D.textSecondary, fontWeight: 700, fontSize: '11px' }}>
                              {seamRel.index}x
                            </span>
                          )}
                        </td>
                        {/* Yorker */}
                        <td style={{ padding: '12px 10px', textAlign: 'center', fontFamily: D.mono, fontSize: '12px' }}>
                          {displayMode === 'terminal_100' ? (
                            <span>{yorkerScore}</span>
                          ) : (
                            <span style={{ color: yorkerRel.index >= 1.05 ? D.emerald : D.textSecondary, fontWeight: 700, fontSize: '11px' }}>
                              {yorkerRel.index}x
                            </span>
                          )}
                        </td>
                        {/* Catching */}
                        <td style={{ padding: '12px 10px', textAlign: 'center', fontFamily: D.mono, fontSize: '12px' }}>
                          {displayMode === 'terminal_100' ? (
                            <span>{catchScore}</span>
                          ) : (
                            <span style={{ color: catchRel.index >= 1.05 ? D.emerald : D.textSecondary, fontWeight: 700, fontSize: '11px' }}>
                              {catchRel.index}x
                            </span>
                          )}
                        </td>
                        {/* Match IQ */}
                        <td style={{ padding: '12px 10px', textAlign: 'center', fontFamily: D.mono, fontSize: '12px' }}>
                          {displayMode === 'terminal_100' ? (
                            <span>{iqScore}</span>
                          ) : (
                            <span style={{ color: iqRel.index >= 1.05 ? D.emerald : D.textSecondary, fontWeight: 700, fontSize: '11px' }}>
                              {iqRel.index}x
                            </span>
                          )}
                        </td>
                        {/* Evidence Drift Badge */}
                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                          {(() => {
                            const isBat = p.role === 'BAT' || p.role === 'ALL' || p.role === 'WK';
                            const balls = p.careerTotals?.balls || (p.avg ? Math.round(p.avg * 4) : 90);
                            const runs = p.careerTotals?.runs || (p.avg ? Math.round(p.avg * 4) : 100);
                            const bIdx = calculateBattingIndex({ runs, ballsFaced: balls, dismissals: 3 });
                            const coachSc = (footworkScore + driveScore) / 10;
                            const rating = calculateSelfAdjustedRating(coachSc, bIdx.index, balls, MIN_BALLS_FACED);
                            
                            return (
                              <span
                                style={{
                                  padding: '2px 8px',
                                  borderRadius: D.pill,
                                  background:
                                    rating.driftDirection === 'ahead_of_assessment'
                                      ? `${D.emerald}20`
                                      : rating.driftDirection === 'behind_assessment'
                                      ? `${D.rose}20`
                                      : `${D.surf2}`,
                                  color:
                                    rating.driftDirection === 'ahead_of_assessment'
                                      ? D.emerald
                                      : rating.driftDirection === 'behind_assessment'
                                      ? D.rose
                                      : D.textMuted,
                                  fontFamily: D.mono,
                                  fontSize: '10px',
                                  fontWeight: 700,
                                }}
                                title={rating.narrative}
                              >
                                {rating.driftDirection === 'ahead_of_assessment'
                                  ? `+${rating.drift} ↗`
                                  : rating.driftDirection === 'behind_assessment'
                                  ? `${rating.drift} ↘`
                                  : `±0.0`}
                              </span>
                            );
                          })()}
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'center', fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                          {latest ? `${latest.window} (${latest.status})` : 'Unassessed'}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedPlayerId(p.id);
                              setActiveTab('passport');
                            }}
                            style={{
                              padding: '4px 10px',
                              borderRadius: D.md,
                              background: D.surf1,
                              border: `1px solid ${D.border}`,
                              color: D.emerald,
                              fontFamily: D.head,
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Passport →
                          </button>
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

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SUB-TAB 2: PLAYER SKILLS PASSPORT & EVALUATION COMMIT */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'passport' && activePlayer && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Header Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '16px 20px',
            borderRadius: D.lg,
            background: D.cardBg,
            border: `1px solid ${D.border}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: D.md,
                background: `${activeSchool.colors[0]}22`,
                border: `2px solid ${activeSchool.colors[0]}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: D.head,
                fontSize: '20px',
                fontWeight: 800,
                color: activeSchool.colors[0],
              }}>
                {activePlayer.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                    {activePlayer.name}
                  </h2>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: D.pill,
                    background: `${D.emerald}22`,
                    color: D.emerald,
                    fontFamily: D.mono,
                    fontSize: '11px',
                    fontWeight: 800,
                  }}>
                    {latestAssessment ? `Latest Committed: ${latestAssessment.window}` : 'Baseline State'}
                  </span>
                  {activePlayer.pathwayAffiliations?.some(a => a.level === 'provincial') && (
                    <span style={{
                      padding: '3px 9px',
                      borderRadius: D.pill,
                      background: `${D.amber}22`,
                      color: D.amber,
                      fontFamily: D.mono,
                      fontSize: '10px',
                      fontWeight: 700,
                    }}>
                      ⭐ Provincial U19 Representative
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: D.body, fontSize: '13px', color: D.textSecondary, marginTop: '4px' }}>
                  {activeSchool.name} · {activePlayer.academicGrade || 'Grade 10'} · Squad: {activePlayer.team} · Age Eligibility: {activePlayer.ageGroupEligibility || 'Open'} · Role: {activePlayer.role}
                </div>
              </div>
            </div>

            {/* Quick Switcher & Evaluate Action */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {!isParentOrPlayer && (
                <div style={{ width: '260px' }}>
                  <PlayerSearchFilterSelect
                    theme={D}
                    players={players}
                    selectedPlayerId={selectedPlayerId}
                    onSelectPlayer={p => setSelectedPlayerId(p.id)}
                    label="SWITCH ATHLETE"
                    placeholder="Search player..."
                    accentColor={D.emerald}
                    compact
                  />
                </div>
              )}

              {canAssess && !isEvaluating && (
                <button
                  onClick={startEvaluation}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: D.md,
                    background: D.emerald,
                    color: '#ffffff',
                    border: 'none',
                    fontFamily: D.head,
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Edit3 size={15} />
                  <span>Record Assessment (Append Log)</span>
                </button>
              )}

              {isEvaluating && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleCommitAssessment}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: D.md,
                      background: D.emerald,
                      color: '#ffffff',
                      border: 'none',
                      fontFamily: D.head,
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Save size={15} />
                    <span>Commit Assessment</span>
                  </button>
                  <button
                    onClick={() => setIsEvaluating(false)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: D.md,
                      background: D.surf1,
                      border: `1px solid ${D.border}`,
                      color: D.textMuted,
                      fontFamily: D.head,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Radar Chart Summary Card */}
          <div style={{
            padding: '20px',
            borderRadius: D.lg,
            background: D.cardBg,
            border: `1px solid ${D.border}`,
          }}>
            <PlayerSkillRadarChart
              theme={D}
              player={activePlayer}
              assessment={latestAssessment || undefined}
              height={310}
              showBenchmark={true}
            />
          </div>

          {/* Objective Performance Rating & Drift Engine Card (SCRBRD_OS) */}
          {(() => {
            const isBatter = activePlayer.role === 'BAT' || activePlayer.role === 'ALL' || activePlayer.role === 'WK';

            // Extract ball-log evidence stats
            const ballsFaced = activePlayer.careerTotals?.balls || (activePlayer.careerTotals?.runs ? Math.round(activePlayer.careerTotals.runs / ((activePlayer.sr || 110) / 100)) : (activePlayer.avg ? Math.round((activePlayer.avg * 4) / ((activePlayer.sr || 110) / 100)) : 95));
            const battingRuns = activePlayer.careerTotals?.runs || (activePlayer.avg ? Math.round(activePlayer.avg * 4) : 110);
            const dismissals = activePlayer.careerTotals?.innings || 4;

            const ballsBowled = activePlayer.careerTotals?.balls || (activePlayer.wkts ? activePlayer.wkts * 24 : 120);
            const wickets = activePlayer.wkts || (activePlayer.careerTotals?.wktsTotal || 5);
            const runsConceded = Math.round(((activePlayer.econ || 5.2) * ballsBowled) / 6);

            const battingIdx = calculateBattingIndex({ runs: battingRuns, ballsFaced, dismissals });
            const bowlingIdx = calculateBowlingIndex({ runsConceded, ballsBowled, wickets });

            // Subjective coach anchor on 1-20 scale
            const coachBatScore = latestAssessment
              ? ((latestAssessment.scores.batting.footwork + latestAssessment.scores.batting.frontFootDrive + latestAssessment.scores.batting.powerHitting) / 3) / 5
              : (activePlayer.avg ? Math.min(20, Math.max(1, activePlayer.avg / 3)) : 12);
            
            const coachBowlScore = latestAssessment
              ? ((latestAssessment.scores.bowling.seamRelease + latestAssessment.scores.bowling.deathYorkers + latestAssessment.scores.bowling.lineLengthControl) / 3) / 5
              : (activePlayer.econ ? Math.min(20, Math.max(1, (12 - activePlayer.econ) * 2)) : 12);

            const ratingResult = isBatter
              ? calculateSelfAdjustedRating(coachBatScore, battingIdx.index, ballsFaced, MIN_BALLS_FACED)
              : calculateSelfAdjustedRating(coachBowlScore, bowlingIdx.index, ballsBowled, MIN_BALLS_BOWLED);

            const sampleCount = isBatter ? ballsFaced : ballsBowled;
            const minFloor = isBatter ? MIN_BALLS_FACED : MIN_BALLS_BOWLED;
            const evidencePct = Math.round(ratingResult.evidenceWeight * 100);
            const coachPct = 100 - evidencePct;

            return (
              <div
                style={{
                  padding: '20px',
                  borderRadius: D.lg,
                  background: D.cardBg,
                  border: `1px solid ${D.borderMed}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        padding: '8px',
                        borderRadius: D.md,
                        background: `${D.indigo}20`,
                        color: D.indigo,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Activity size={20} />
                    </div>
                    <div>
                      <div style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800, color: D.textPrimary }}>
                        Continuous Performance Rating & Statutory Drift
                      </div>
                      <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                        SCRBRD_OS Rating Engine · Dual-Layer Bayesian Evidence Model
                      </div>
                    </div>
                  </div>

                  {/* Drift Status Pill */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: D.pill,
                        background:
                          ratingResult.driftDirection === 'ahead_of_assessment'
                            ? `${D.emerald}20`
                            : ratingResult.driftDirection === 'behind_assessment'
                            ? `${D.rose}20`
                            : `${D.sky}20`,
                        color:
                          ratingResult.driftDirection === 'ahead_of_assessment'
                            ? D.emerald
                            : ratingResult.driftDirection === 'behind_assessment'
                            ? D.rose
                            : D.sky,
                        fontFamily: D.mono,
                        fontSize: '11px',
                        fontWeight: 800,
                        border: `1px solid ${
                          ratingResult.driftDirection === 'ahead_of_assessment'
                            ? D.emerald
                            : ratingResult.driftDirection === 'behind_assessment'
                            ? D.rose
                            : D.sky
                        }40`,
                      }}
                    >
                      {ratingResult.driftDirection === 'ahead_of_assessment'
                        ? `📈 +${ratingResult.drift} Ahead of Assessment`
                        : ratingResult.driftDirection === 'behind_assessment'
                        ? `📉 ${ratingResult.drift} Behind Assessment`
                        : `🎯 Aligned with Coach Baseline`}
                    </span>
                  </div>
                </div>

                {/* Main 3 Metrics Display */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  {/* 1. Coach Assessment Anchor */}
                  <div style={{ padding: '14px', borderRadius: D.md, background: D.surf1, border: `1px solid ${D.border}` }}>
                    <div style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textMuted }}>
                      COACH BASELINE (ANCHOR)
                    </div>
                    <div style={{ fontFamily: D.mono, fontSize: '24px', fontWeight: 800, color: D.textPrimary, marginTop: '4px' }}>
                      {ratingResult.coachAssessment.toFixed(1)} <span style={{ fontSize: '13px', color: D.textMuted }}>/ 20</span>
                    </div>
                    <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary, marginTop: '4px' }}>
                      Weight: <strong>{coachPct}%</strong> (Subjective Rubric)
                    </div>
                  </div>

                  {/* 2. Match Log Evidence Index */}
                  <div style={{ padding: '14px', borderRadius: D.md, background: D.surf1, border: `1px solid ${D.border}` }}>
                    <div style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.sky }}>
                      MATCH EVIDENCE INDEX
                    </div>
                    <div style={{ fontFamily: D.mono, fontSize: '24px', fontWeight: 800, color: D.sky, marginTop: '4px' }}>
                      {ratingResult.evidenceIndex != null ? `${ratingResult.evidenceIndex.toFixed(1)}` : '—'} <span style={{ fontSize: '13px', color: D.textMuted }}>/ 20</span>
                    </div>
                    <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary, marginTop: '4px' }}>
                      Weight: <strong>{evidencePct}%</strong> ({sampleCount} balls logged)
                    </div>
                  </div>

                  {/* 3. Self-Adjusted Composite Rating */}
                  <div style={{ padding: '14px', borderRadius: D.md, background: `${D.emerald}12`, border: `1px solid ${D.emerald}40` }}>
                    <div style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.emerald }}>
                      DYNAMIC COMPOSITE RATING
                    </div>
                    <div style={{ fontFamily: D.mono, fontSize: '24px', fontWeight: 800, color: D.emerald, marginTop: '4px' }}>
                      {ratingResult.blendedRating.toFixed(1)} <span style={{ fontSize: '13px', color: D.textMuted }}>/ 20</span>
                    </div>
                    <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary, marginTop: '4px' }}>
                      Confidence: <strong>{sampleCount >= FULL_EVIDENCE_SAMPLE ? 'High (Mature)' : sampleCount >= minFloor ? 'Moderate (Emerging)' : 'Floor Insufficient'}</strong>
                    </div>
                  </div>
                </div>

                {/* Evidence Weight Distribution Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.mono, fontSize: '11px' }}>
                    <span style={{ color: D.textMuted }}>Coach Anchor ({coachPct}%)</span>
                    <span style={{ color: D.sky }}>Evidence Weight ({evidencePct}%) · {sampleCount}/{FULL_EVIDENCE_SAMPLE} balls to max weighting</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', borderRadius: D.pill, background: D.surf2, overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${coachPct}%`, background: D.borderMed, transition: 'width 0.3s ease' }} />
                    <div style={{ width: `${evidencePct}%`, background: D.sky, transition: 'width 0.3s ease' }} />
                  </div>
                </div>

                {/* Explanatory Narrative Footer */}
                <div style={{ padding: '10px 14px', borderRadius: D.md, background: D.surf2, fontFamily: D.body, fontSize: '12px', color: D.textSecondary, lineHeight: 1.5 }}>
                  💬 <strong>Engine Audit:</strong> {ratingResult.narrative}
                </div>
              </div>
            );
          })()}

          {/* Assessment Form or Derived Read Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {/* Batting Competencies */}
            <div style={{
              padding: '18px',
              borderRadius: D.md,
              background: D.cardBg,
              border: `1px solid ${D.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.sky, margin: 0 }}>
                  🏏 Batting Competencies (cricket-v1)
                </h3>
                <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>Weight: 35%</span>
              </div>

              {['footwork', 'frontFootDrive', 'backFootPullCut', 'defenseLeave', 'powerHitting', 'strikeRotation'].map(skillKey => {
                const rubric = CRICKET_V1_RUBRIC[skillKey];
                const battingRec = (draftScores?.batting || latestAssessment?.scores.batting || {}) as Record<string, number>;
                const val = isEvaluating && draftScores ? battingRec[skillKey] ?? 60 : ((latestAssessment?.scores.batting as Record<string, number>)?.[skillKey] ?? 60);
                const ageGroup = (activePlayer.ageGroupEligibility as 'U14' | 'U15' | 'U16' | 'Open') || 'Open';
                const rel = calculateAgeRelativeIndex(val, ageGroup, skillKey);
                const confidence = isEvaluating ? draftConfidence[skillKey] : latestAssessment?.confidence[skillKey] ?? 'high';

                return (
                  <div key={skillKey} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <span style={{ color: D.textSecondary, fontWeight: 600 }}>{rubric.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontFamily: D.mono, fontWeight: 700, color: D.sky }}>
                          {val}/100
                        </span>
                        <span style={{
                          fontSize: '10px',
                          fontFamily: D.mono,
                          padding: '1px 6px',
                          borderRadius: D.pill,
                          background: rel.index >= 1.05 ? `${D.emerald}22` : D.surf1,
                          color: rel.index >= 1.05 ? D.emerald : D.textMuted,
                        }}>
                          {rel.index}x Par ({rel.benchmark})
                        </span>
                      </div>
                    </div>

                    {isEvaluating && draftScores ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <input
                          type="range"
                          min={20}
                          max={100}
                          value={val}
                          onChange={e => {
                            const newV = parseInt(e.target.value);
                            setDraftScores({
                              ...draftScores,
                              batting: { ...draftScores.batting, [skillKey]: newV } as any,
                            });
                            setDraftConfidence(prev => ({ ...prev, [skillKey]: 'high' }));
                          }}
                          style={{ width: '100%', accentColor: D.sky }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: D.textMuted, fontFamily: D.mono }}>
                          <span>20</span>
                          <span>40</span>
                          <span>60 (Club/High Par)</span>
                          <span>80 (Elite)</span>
                          <span>100 (Provincial)</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ width: '100%', height: '6px', borderRadius: D.pill, background: D.surf1, overflow: 'hidden' }}>
                        <div style={{ width: `${val}%`, height: '100%', background: D.sky, borderRadius: D.pill }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bowling Competencies */}
            <div style={{
              padding: '18px',
              borderRadius: D.md,
              background: D.cardBg,
              border: `1px solid ${D.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.violet, margin: 0 }}>
                  ⚡ Bowling Competencies (cricket-v1)
                </h3>
                <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>Weight: 35%</span>
              </div>

              {['seamRelease', 'lineLengthControl', 'paceVariations', 'deathYorkers', 'driftTurn'].map(skillKey => {
                const rubric = CRICKET_V1_RUBRIC[skillKey];
                const bowlingRec = (draftScores?.bowling || latestAssessment?.scores.bowling || {}) as Record<string, number>;
                const val = isEvaluating && draftScores ? bowlingRec[skillKey] ?? 58 : ((latestAssessment?.scores.bowling as Record<string, number>)?.[skillKey] ?? 58);
                const ageGroup = (activePlayer.ageGroupEligibility as 'U14' | 'U15' | 'U16' | 'Open') || 'Open';
                const rel = calculateAgeRelativeIndex(val, ageGroup, skillKey);

                return (
                  <div key={skillKey} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <span style={{ color: D.textSecondary, fontWeight: 600 }}>{rubric.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontFamily: D.mono, fontWeight: 700, color: D.violet }}>
                          {val}/100
                        </span>
                        <span style={{
                          fontSize: '10px',
                          fontFamily: D.mono,
                          padding: '1px 6px',
                          borderRadius: D.pill,
                          background: rel.index >= 1.05 ? `${D.emerald}22` : D.surf1,
                          color: rel.index >= 1.05 ? D.emerald : D.textMuted,
                        }}>
                          {rel.index}x Par ({rel.benchmark})
                        </span>
                      </div>
                    </div>

                    {isEvaluating && draftScores ? (
                      <input
                        type="range"
                        min={20}
                        max={100}
                        value={val}
                        onChange={e => {
                          const newV = parseInt(e.target.value);
                          setDraftScores({
                            ...draftScores,
                            bowling: { ...draftScores.bowling, [skillKey]: newV } as any,
                          });
                          setDraftConfidence(prev => ({ ...prev, [skillKey]: 'high' }));
                        }}
                        style={{ width: '100%', accentColor: D.violet }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '6px', borderRadius: D.pill, background: D.surf1, overflow: 'hidden' }}>
                        <div style={{ width: `${val}%`, height: '100%', background: D.violet, borderRadius: D.pill }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Fielding & Composure */}
            <div style={{
              padding: '18px',
              borderRadius: D.md,
              background: D.cardBg,
              border: `1px solid ${D.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.emerald, margin: 0 }}>
                  🧤 Fielding & Tactical Composure
                </h3>
                <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>Weight: 30%</span>
              </div>

              {['ringGroundwork', 'highCatching', 'directHitAccuracy', 'matchIQ', 'pressureComposure'].map(skillKey => {
                const rubric = CRICKET_V1_RUBRIC[skillKey];
                const isFielding = ['ringGroundwork', 'highCatching', 'directHitAccuracy'].includes(skillKey);
                const cat = isFielding ? 'fielding' : 'tacticalMental';
                const catRec = (draftScores ? (draftScores as Record<string, Record<string, number>>)[cat] : (latestAssessment?.scores as Record<string, Record<string, number>>)?.[cat]) || {};
                const val = isEvaluating && draftScores ? catRec[skillKey] ?? 60 : (catRec[skillKey] ?? 60);
                const ageGroup = (activePlayer.ageGroupEligibility as 'U14' | 'U15' | 'U16' | 'Open') || 'Open';
                const rel = calculateAgeRelativeIndex(val, ageGroup, skillKey);

                return (
                  <div key={skillKey} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <span style={{ color: D.textSecondary, fontWeight: 600 }}>{rubric.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontFamily: D.mono, fontWeight: 700, color: D.emerald }}>
                          {val}/100
                        </span>
                        <span style={{
                          fontSize: '10px',
                          fontFamily: D.mono,
                          padding: '1px 6px',
                          borderRadius: D.pill,
                          background: rel.index >= 1.05 ? `${D.emerald}22` : D.surf1,
                          color: rel.index >= 1.05 ? D.emerald : D.textMuted,
                        }}>
                          {rel.index}x Par
                        </span>
                      </div>
                    </div>

                    {isEvaluating && draftScores ? (
                      <input
                        type="range"
                        min={20}
                        max={100}
                        value={val}
                        onChange={e => {
                          const newV = parseInt(e.target.value);
                          setDraftScores({
                            ...draftScores,
                            [cat]: { ...(draftScores as any)[cat], [skillKey]: newV },
                          });
                          setDraftConfidence(prev => ({ ...prev, [skillKey]: 'high' }));
                        }}
                        style={{ width: '100%', accentColor: D.emerald }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '6px', borderRadius: D.pill, background: D.surf1, overflow: 'hidden' }}>
                        <div style={{ width: `${val}%`, height: '100%', background: D.emerald, borderRadius: D.pill }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coach Narrative & POPIA Restricted Notes */}
          <div style={{
            padding: '20px',
            borderRadius: D.lg,
            background: D.cardBg,
            border: `1px solid ${D.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={18} color={D.sky} />
                <h3 style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                  Coach Narrative Notes & Development Goals
                </h3>
              </div>
              <span style={{
                padding: '2px 8px',
                borderRadius: D.pill,
                background: `${D.violet}22`,
                color: D.violet,
                fontFamily: D.mono,
                fontSize: '10px',
                fontWeight: 700,
              }}>
                POPIA Restricted
              </span>
            </div>

            {/* If evaluating: note inputs */}
            {isEvaluating ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>Assessment Window:</label>
                  <input
                    type="text"
                    value={draftWindow}
                    onChange={e => setDraftWindow(e.target.value)}
                    placeholder="e.g. 2026-T1"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: D.sm,
                      background: D.surf1,
                      border: `1px solid ${D.border}`,
                      color: D.textPrimary,
                      fontFamily: D.body,
                      fontSize: '12px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>Development Goals (comma-separated):</label>
                  <input
                    type="text"
                    value={draftGoals}
                    onChange={e => setDraftGoals(e.target.value)}
                    placeholder="e.g. Front foot drive balance, Yorker execution at death"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: D.sm,
                      background: D.surf1,
                      border: `1px solid ${D.border}`,
                      color: D.textPrimary,
                      fontFamily: D.body,
                      fontSize: '12px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>Coach Prose Notes:</label>
                  <textarea
                    rows={3}
                    value={draftNotes}
                    onChange={e => setDraftNotes(e.target.value)}
                    placeholder="Provide technical evaluation, posture notes, and progression focus..."
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: D.sm,
                      background: D.surf1,
                      border: `1px solid ${D.border}`,
                      color: D.textPrimary,
                      fontFamily: D.body,
                      fontSize: '12px',
                    }}
                  />
                </div>
              </div>
            ) : (
              <div>
                {!notesAccess.granted ? (
                  <div style={{ padding: '16px', borderRadius: D.md, background: D.surf1, color: D.textMuted, fontSize: '12px' }}>
                    🔒 {notesAccess.notice}
                  </div>
                ) : latestAssessment?.notes ? (
                  <div style={{ padding: '14px', borderRadius: D.md, background: D.surf1, border: `1px solid ${D.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontFamily: D.head, fontWeight: 700, fontSize: '12px', color: D.textPrimary }}>
                        {latestAssessment.assessorName}
                      </span>
                      <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                        {latestAssessment.committedAt?.split('T')[0]}
                      </span>
                    </div>
                    <p style={{ fontFamily: D.body, fontSize: '13px', color: D.textSecondary, margin: 0, lineHeight: 1.5 }}>
                      &quot;{latestAssessment.notes}&quot;
                    </p>
                    {latestAssessment.targetDevelopmentGoals && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                        {latestAssessment.targetDevelopmentGoals.map((g, gi) => (
                          <span key={gi} style={{
                            padding: '2px 8px',
                            borderRadius: D.pill,
                            background: `${D.emerald}22`,
                            color: D.emerald,
                            fontFamily: D.mono,
                            fontSize: '10px',
                          }}>
                            🎯 {g}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ color: D.textMuted, fontSize: '12px' }}>No notes logged in latest assessment.</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SUB-TAB 3: MULTI-SEASON LONGITUDINAL TRAJECTORY */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'longitudinal' && activePlayer && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{
            padding: '20px',
            borderRadius: D.lg,
            background: D.cardBg,
            border: `1px solid ${D.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                  Longitudinal Progression Timeline: {activePlayer.name}
                </h2>
                <p style={{ fontFamily: D.body, fontSize: '13px', color: D.textSecondary, margin: '4px 0 0' }}>
                  Append-only historical series tracking development across terms, promotions (e.g. U15C → U15B → U16B → U16A), and coach handovers.
                </p>
              </div>

              {/* Skill Selector for Trajectory Chart */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>SKILL:</span>
                <select
                  value={selectedSkillKey}
                  onChange={e => {
                    const k = e.target.value;
                    setSelectedSkillKey(k);
                    setSelectedSkillCategory(CRICKET_V1_RUBRIC[k].category);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: D.md,
                    background: D.surf1,
                    border: `1px solid ${D.border}`,
                    color: D.textPrimary,
                    fontFamily: D.head,
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {Object.keys(CRICKET_V1_RUBRIC).map(k => (
                    <option key={k} value={k}>{CRICKET_V1_RUBRIC[k].name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Timeline Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {trajectoryPoints.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: D.textMuted }}>
                  Only 1 assessment recorded. Longitudinal series expands with each term&apos;s evaluation.
                </div>
              ) : (
                trajectoryPoints.map((pt, pIdx) => (
                  <div
                    key={pIdx}
                    style={{
                      padding: '16px 20px',
                      borderRadius: D.md,
                      background: D.surf1,
                      border: `1px solid ${pt.isPromotionEvent ? D.emerald : D.border}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: D.pill,
                        background: `${D.sky}22`,
                        color: D.sky,
                        fontFamily: D.mono,
                        fontSize: '12px',
                        fontWeight: 800,
                      }}>
                        {pt.window}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary }}>
                            {pt.squad} ({pt.ageGroup})
                          </span>
                          {pt.isPromotionEvent && (
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: D.pill,
                              background: `${D.emerald}22`,
                              color: D.emerald,
                              fontFamily: D.mono,
                              fontSize: '10px',
                              fontWeight: 700,
                            }}>
                              ⭐ {pt.promotionDetails}
                            </span>
                          )}
                        </div>
                        <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                          Assessed by: {pt.assessedBy} · Date: {pt.date}
                        </div>
                      </div>
                    </div>

                    {/* Metric Display */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: D.mono, fontSize: '14px', fontWeight: 800, color: D.textPrimary }}>
                          Score: {pt.storedScore}/100
                        </div>
                        <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.emerald }}>
                          {pt.ageRelativeIndex}x Age Par
                        </div>
                      </div>

                      <div style={{
                        padding: '6px 12px',
                        borderRadius: D.pill,
                        background: pt.delta > 0 ? `${D.emerald}22` : pt.delta < 0 ? `${D.rose}22` : D.cardBg,
                        color: pt.delta > 0 ? D.emerald : pt.delta < 0 ? D.rose : D.textMuted,
                        fontFamily: D.mono,
                        fontSize: '12px',
                        fontWeight: 800,
                      }}>
                        {pt.delta > 0 ? `+${pt.delta}` : pt.delta} pts
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SUB-TAB 4: ANCHORED RUBRIC INSPECTOR (cricket-v1) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'rubric' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{
            padding: '20px',
            borderRadius: D.lg,
            background: D.cardBg,
            border: `1px solid ${D.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}>
            <h2 style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
              CSA & Standard Rubric Definition: cricket-v1
            </h2>
            <p style={{ fontFamily: D.body, fontSize: '13px', color: D.textSecondary, margin: 0 }}>
              20-point behavioral anchors defining clear observable standards from beginner to provincial trial standard (100).
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px', marginTop: '10px' }}>
              {Object.values(CRICKET_V1_RUBRIC).map(item => (
                <div
                  key={item.key}
                  style={{
                    padding: '16px',
                    borderRadius: D.md,
                    background: D.surf1,
                    border: `1px solid ${D.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.emerald, margin: 0 }}>
                      {item.name}
                    </h3>
                    <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, textTransform: 'uppercase' }}>
                      {item.category}
                    </span>
                  </div>
                  <p style={{ fontFamily: D.body, fontSize: '12px', color: D.textSecondary, margin: 0 }}>
                    {item.description}
                  </p>

                  {/* Age Group Benchmarks */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', padding: '6px 10px', background: D.cardBg, borderRadius: D.sm }}>
                    <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>Age Pars:</span>
                    <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textPrimary }}>U14: {item.benchmarks.U14}</span>
                    <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textPrimary }}>U15: {item.benchmarks.U15}</span>
                    <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textPrimary }}>U16: {item.benchmarks.U16}</span>
                    <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.emerald, fontWeight: 700 }}>Open: {item.benchmarks.Open}</span>
                  </div>

                  {/* Behavioral Anchors */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                    {[20, 40, 60, 80, 100].map(score => (
                      <div key={score} style={{ display: 'flex', gap: '8px', fontSize: '11px', lineHeight: 1.4 }}>
                        <span style={{
                          fontFamily: D.mono,
                          fontWeight: 800,
                          color: score === 100 ? D.emerald : score >= 80 ? D.sky : score >= 60 ? D.amber : D.textMuted,
                          minWidth: '24px',
                        }}>
                          {score}:
                        </span>
                        <span style={{ color: D.textSecondary }}>{item.anchors[score]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SUB-TAB 5: CSA DRILL CURRICULUM */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'drills' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{
            padding: '20px',
            borderRadius: D.lg,
            background: D.cardBg,
            border: `1px solid ${D.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div>
              <h2 style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                Cricket South Africa (CSA) Technical Drill Library
              </h2>
              <p style={{ fontFamily: D.body, fontSize: '13px', color: D.textSecondary, margin: '4px 0 0' }}>
                Structured coaching interventions mapped to specific rubric deficiencies.
              </p>
            </div>
            {activePlayer && (
              <span style={{ fontFamily: D.mono, fontSize: '12px', color: D.emerald }}>
                Active Target: {activePlayer.name} ({activePlayer.team})
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {[
              { title: 'Top-Hand Off-Side Corridor Drive', cat: 'Batting', duration: '25 mins', target: 'Footwork & Front Foot Drive', equip: 'Sidearm wiffle balls, 2 cones at 45°' },
              { title: 'Short-Ball Sway & Pull Acceleration', cat: 'Batting', duration: '20 mins', target: 'Back Foot Pull & Cut', equip: 'Heavy tennis balls, bounce board' },
              { title: 'Target String & Yorker Calibration', cat: 'Bowling', duration: '30 mins', target: 'Death Overs Yorker Execution', equip: 'Popping crease slot target sheet' },
              { title: 'Off-Cutter & Knuckle Ball Deception', cat: 'Bowling', duration: '20 mins', target: 'Pace Variations', equip: 'Cones at 6m good length zone' },
              { title: 'Rapid Direct-Hit Reflex Gate', cat: 'Fielding', duration: '20 mins', target: 'Direct Hit Accuracy', equip: 'Single stump, rolling chute' },
            ].map((drill, di) => (
              <div
                key={di}
                style={{
                  padding: '18px',
                  borderRadius: D.md,
                  background: D.cardBg,
                  border: `1px solid ${D.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: D.pill,
                    background: `${D.emerald}22`,
                    color: D.emerald,
                    fontFamily: D.mono,
                    fontSize: '10px',
                    fontWeight: 700,
                  }}>
                    {drill.cat} · {drill.duration}
                  </span>
                  <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>CSA Level 2</span>
                </div>
                <h3 style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                  {drill.title}
                </h3>
                <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.sky }}>
                  🎯 Targets Rubric: {drill.target}
                </div>
                <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                  🎒 Equipment: {drill.equip}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STRUCTURAL CRICKET DIMENSIONS MODAL ── */}
      {structuralModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}>
          <div style={{
            background: D.cardBg,
            border: `1px solid ${D.borderMed}`,
            borderRadius: D.lg,
            maxWidth: '850px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BookOpen size={22} color={D.sky} />
                <h2 style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                  Cricket Structural Dimensions & Hierarchy Specification
                </h2>
              </div>
              <button
                onClick={() => setStructuralModalOpen(false)}
                style={{ background: 'none', border: 'none', color: D.textMuted, fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              {/* Age Groups */}
              <div style={{ padding: '14px', borderRadius: D.md, background: D.surf1, border: `1px solid ${D.border}` }}>
                <h3 style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.emerald, margin: '0 0 8px' }}>
                  1. Age Groups (Eligibility)
                </h3>
                <p style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary, lineHeight: 1.4 }}>
                  Who is eligible to participate. High school senior cricket is strictly <strong>Open</strong> (no default high-school U19).
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                  {CANONICAL_AGE_GROUPS.map(ag => (
                    <div key={ag.ageGroupId} style={{ fontFamily: D.mono, fontSize: '11px', color: D.textPrimary }}>
                      • {ag.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Divisions */}
              <div style={{ padding: '14px', borderRadius: D.md, background: D.surf1, border: `1px solid ${D.border}` }}>
                <h3 style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.sky, margin: '0 0 8px' }}>
                  2. Divisions (Competitions)
                </h3>
                <p style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary, lineHeight: 1.4 }}>
                  External tournament brackets. Festivals and development bands do not force ladder standings.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                  {CANONICAL_DIVISIONS.map(d => (
                    <div key={d.divisionId} style={{ fontFamily: D.mono, fontSize: '11px', color: D.textPrimary }}>
                      • {d.name} ({d.groupingType})
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Classes */}
              <div style={{ padding: '14px', borderRadius: D.md, background: D.surf1, border: `1px solid ${D.border}` }}>
                <h3 style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.violet, margin: '0 0 8px' }}>
                  3. Team Classes (Internal Rank)
                </h3>
                <p style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary, lineHeight: 1.4 }}>
                  Internal organizational position (1st-7th XI, U16A-D, U15A-E, U14A-G) with distinct rank.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                  <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textPrimary }}>• Open 1st XI to 7th XI (Rank 1-7)</div>
                  <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textPrimary }}>• U16A to U16D (Rank 1-4)</div>
                  <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textPrimary }}>• U15A to U15E (Rank 1-5)</div>
                  <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textPrimary }}>• U14A to U14G (Rank 1-7)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── POPIA SUBJECT ACCESS REQUEST (SAR) EXPORT MODAL ── */}
      {sarExportModal && activePlayer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}>
          <div style={{
            background: D.cardBg,
            border: `1px solid ${D.borderMed}`,
            borderRadius: D.lg,
            maxWidth: '650px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={22} color={D.violet} />
                <h2 style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                  POPIA Subject Access Request (SAR) Export
                </h2>
              </div>
              <button
                onClick={() => setSarExportModal(false)}
                style={{ background: 'none', border: 'none', color: D.textMuted, fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontFamily: D.body, fontSize: '13px', color: D.textSecondary, margin: 0, lineHeight: 1.5 }}>
              Generates an immutable audit export of all historical assessments, superseded records, confidence metrics, and coach feedback in compliance with South Africa&apos;s Protection of Personal Information Act (POPIA).
            </p>

            <div style={{ padding: '14px', borderRadius: D.md, background: D.surf1, fontFamily: D.mono, fontSize: '11px', color: D.textPrimary }}>
              <div>Athlete: {activePlayer.name}</div>
              <div>School: {activePlayer.school}</div>
              <div>Total Historical Assessments in Log: {assessmentLog.filter(r => r.playerId === activePlayer.id).length}</div>
              <div>Rubric Version: cricket-v1</div>
            </div>

            <button
              onClick={() => {
                const sar = generateSubjectAccessRequestExport(activePlayer.id, activePlayer.name, activePlayer.school, assessmentLog);
                const blob = new Blob([JSON.stringify(sar, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `POPIA_SAR_${activePlayer.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
                a.click();
                setSarExportModal(false);
                setSaveSuccessMsg(`POPIA SAR data packet downloaded for ${activePlayer.name}`);
                setTimeout(() => setSaveSuccessMsg(null), 3500);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: D.md,
                background: D.violet,
                color: '#ffffff',
                border: 'none',
                fontFamily: D.head,
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Download size={16} />
              <span>Download Complete POPIA SAR Audit File (.json)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
