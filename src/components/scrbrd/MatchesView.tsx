'use client';

import React, { useState, useMemo } from 'react';
import { Theme, Match, WeatherData, LiveScoreState, Player } from './types';
import { SCHOOLS_REGISTRY } from './data';
import {
  Calendar, Clock, MapPin, Plus, Edit2, Trash2, Search,
  Filter, Shield, CheckCircle2, AlertCircle, Eye, Radio,
  Tv, Award, ChevronRight, Play, RefreshCw, LayoutGrid, List, SlidersHorizontal
} from 'lucide-react';

interface MatchesViewProps {
  theme: Theme;
  matches?: Match[];
  weather?: Record<string, WeatherData>;
  liveScores?: Record<string, LiveScoreState>;
  activeSchoolId: string;
  currentRole: string;
  onOpenScorecard: (matchId: string) => void;
  onLaunchScorer: (match?: Match) => void;
  onNavigateToAnalytics?: (tab?: string) => void;
  onCreateMatch?: (newMatch: Match) => void;
  onUpdateMatch?: (updatedMatch: Match) => void;
  onDeleteMatch?: (matchId: string) => void;
  onTriggerToast: (msg: string) => void;
}

export type MatchViewMode = 'cards' | 'table' | 'timeline' | 'live_broadcast';

export default function MatchesView({
  theme: D,
  matches = [],
  weather = {},
  liveScores = {},
  activeSchoolId,
  currentRole,
  onOpenScorecard,
  onLaunchScorer,
  onNavigateToAnalytics,
  onCreateMatch,
  onUpdateMatch,
  onDeleteMatch,
  onTriggerToast,
}: MatchesViewProps) {
  const [viewMode, setViewMode] = useState<MatchViewMode>('cards');
  const [scopeFilter, setScopeFilter] = useState<'school' | 'all' | 'live' | 'upcoming' | 'complete'>('school');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    homeTeam: '',
    awayTeam: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    venue: '',
    format: '50-Over Limited Overs',
    overs: 50,
    status: 'upcoming' as Match['status'],
    schoolId: activeSchoolId,
    umpire1: 'Mr Craig White (CSA Elite Panel)',
    umpire2: 'Mr Sipho Zulu (Provincial Panel)',
    scorer: 'Brian Wessels (Certified Scorer)',
    notes: '',
  });

  const activeSchool = SCHOOLS_REGISTRY.find(s => s.id === activeSchoolId) || SCHOOLS_REGISTRY[0];

  // RBAC Permissions
  const canCreateMatch = ['superadmin', 'schooladmin', 'sportsmaster', 'doc'].includes(currentRole);
  const canEditMatch = ['superadmin', 'schooladmin', 'sportsmaster', 'doc', 'scorer'].includes(currentRole);
  const canDeleteMatch = ['superadmin', 'schooladmin', 'sportsmaster'].includes(currentRole);
  const isReadOnly = ['player', 'parent'].includes(currentRole);

  // Filter matches
  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      // Scope filter
      if (scopeFilter === 'school') {
        const isMatchOfSchool = m.schoolId === activeSchoolId ||
          m.homeTeam.toLowerCase().includes(activeSchool.shortName.toLowerCase()) ||
          m.awayTeam.toLowerCase().includes(activeSchool.shortName.toLowerCase());
        if (!isMatchOfSchool) return false;
      } else if (scopeFilter === 'live') {
        if (m.status !== 'live') return false;
      } else if (scopeFilter === 'upcoming') {
        if (m.status !== 'upcoming') return false;
      } else if (scopeFilter === 'complete') {
        if (m.status !== 'complete') return false;
      }

      // Format filter
      if (selectedFormat !== 'all') {
        if (selectedFormat === '50' && !m.format?.includes('50')) return false;
        if (selectedFormat === 't20' && !m.format?.toLowerCase().includes('t20')) return false;
        if (selectedFormat === 'decl' && !m.format?.toLowerCase().includes('declaration')) return false;
      }

      // Search
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchStr = `${m.homeTeam} ${m.awayTeam} ${m.venue} ${m.date} ${m.result || ''}`.toLowerCase();
        if (!matchStr.includes(q)) return false;
      }

      return true;
    });
  }, [matches, scopeFilter, selectedFormat, searchQuery, activeSchoolId, activeSchool]);

  const handleOpenCreateModal = () => {
    if (!canCreateMatch) {
      onTriggerToast(`Access Restricted: Role '${currentRole}' cannot schedule new fixtures.`);
      return;
    }
    setFormData({
      homeTeam: `${activeSchool.name} 1st XI`,
      awayTeam: 'Hilton College 1st XI',
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      time: '09:30',
      venue: `${activeSchool.mainOval}, ${activeSchool.name}`,
      format: '50-Over Limited Overs',
      overs: 50,
      status: 'upcoming',
      schoolId: activeSchoolId,
      umpire1: 'Mr Shaun George (ICC/CSA Panel)',
      umpire2: 'Mr Bheki Mhlongo (KZNCU Panel)',
      scorer: 'Mrs Lauren Smith (CSA Electronic Scorer)',
      notes: 'Saturday Morning Interschool Derby. Official electronic broadcast scoring active.',
    });
    setCreateModalOpen(true);
  };

  const handleOpenEditModal = (match: Match) => {
    if (!canEditMatch) {
      onTriggerToast(`Access Restricted: Role '${currentRole}' cannot edit fixtures.`);
      return;
    }
    setSelectedMatch(match);
    setFormData({
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      date: match.date,
      time: match.time,
      venue: match.venue,
      format: match.format || '50-Over Limited Overs',
      overs: match.overs || 50,
      status: match.status,
      schoolId: match.schoolId || activeSchoolId,
      umpire1: match.umpire1 || 'Mr Craig White',
      umpire2: match.umpire2 || 'Mr Sipho Zulu',
      scorer: match.scorer || 'Brian Wessels',
      notes: match.summary || '',
    });
    setEditModalOpen(true);
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newMatch: Match = {
      id: `m_${Date.now()}`,
      homeTeam: formData.homeTeam,
      awayTeam: formData.awayTeam,
      date: formData.date,
      time: formData.time,
      venue: formData.venue,
      status: formData.status,
      schoolId: formData.schoolId,
      format: formData.format,
      overs: Number(formData.overs),
      umpire1: formData.umpire1,
      umpire2: formData.umpire2,
      scorer: formData.scorer,
      summary: formData.notes,
    };
    if (onCreateMatch) onCreateMatch(newMatch);
    setCreateModalOpen(false);
    onTriggerToast(`Fixture scheduled: ${formData.homeTeam} vs ${formData.awayTeam}`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;
    const updated: Match = {
      ...selectedMatch,
      homeTeam: formData.homeTeam,
      awayTeam: formData.awayTeam,
      date: formData.date,
      time: formData.time,
      venue: formData.venue,
      status: formData.status,
      format: formData.format,
      overs: Number(formData.overs),
      umpire1: formData.umpire1,
      umpire2: formData.umpire2,
      scorer: formData.scorer,
      summary: formData.notes,
    };
    if (onUpdateMatch) onUpdateMatch(updated);
    setEditModalOpen(false);
    onTriggerToast(`Fixture updated: ${formData.homeTeam} vs ${formData.awayTeam}`);
  };

  const handleConfirmDelete = () => {
    if (!selectedMatch) return;
    if (onDeleteMatch) onDeleteMatch(selectedMatch.id);
    setDeleteModalOpen(false);
    onTriggerToast(`Fixture cancelled and removed: ${selectedMatch.homeTeam} vs ${selectedMatch.awayTeam}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Header & Controls */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: D.lg,
          background: `linear-gradient(135deg, ${D.emerald}18 0%, ${D.surf1} 100%)`,
          border: `1px solid ${D.emerald}33`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>🏏</span>
          <div>
            <h1 style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
              {activeSchool.name} · Match Operations & Fixtures
            </h1>
            <p style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted, margin: '2px 0 0' }}>
              Official KZN Circuit Interschool Fixture Registry · Live Telemetry, Scorecards & Matchday Broadcast
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* View Switcher */}
          <div
            style={{
              display: 'flex',
              background: D.surf2,
              padding: '3px',
              borderRadius: D.pill,
              border: `1px solid ${D.border}`,
            }}
          >
            <button
              onClick={() => setViewMode('cards')}
              title="Cards Grid View"
              style={{
                padding: '6px 12px',
                borderRadius: D.pill,
                border: 'none',
                background: viewMode === 'cards' ? D.emerald : 'transparent',
                color: viewMode === 'cards' ? '#fff' : D.textSecondary,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <LayoutGrid size={13} />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Detailed Table View"
              style={{
                padding: '6px 12px',
                borderRadius: D.pill,
                border: 'none',
                background: viewMode === 'table' ? D.emerald : 'transparent',
                color: viewMode === 'table' ? '#fff' : D.textSecondary,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <List size={13} />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              title="Matchday Timeline Schedule"
              style={{
                padding: '6px 12px',
                borderRadius: D.pill,
                border: 'none',
                background: viewMode === 'timeline' ? D.emerald : 'transparent',
                color: viewMode === 'timeline' ? '#fff' : D.textSecondary,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Clock size={13} />
              <span>Timeline</span>
            </button>
            <button
              onClick={() => setViewMode('live_broadcast')}
              title="Live Broadcast Scoreboard Focus"
              style={{
                padding: '6px 12px',
                borderRadius: D.pill,
                border: 'none',
                background: viewMode === 'live_broadcast' ? D.emerald : 'transparent',
                color: viewMode === 'live_broadcast' ? '#fff' : D.textSecondary,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Radio size={13} />
              <span>Live Broadcast</span>
            </button>
          </div>

          {/* Create Match (RBAC Protected) */}
          {canCreateMatch ? (
            <button
              onClick={handleOpenCreateModal}
              style={{
                padding: '7px 14px',
                borderRadius: D.pill,
                background: D.emerald,
                border: 'none',
                color: '#fff',
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: `0 3px 10px ${D.emerald}33`,
              }}
            >
              <Plus size={14} />
              <span>Schedule Fixture</span>
            </button>
          ) : (
            <div
              title={`Role '${currentRole}' is read-only. Schedulers: Sportsmaster, Director of Cricket, School Admin.`}
              style={{
                padding: '6px 12px',
                borderRadius: D.pill,
                background: D.surf2,
                border: `1px solid ${D.border}`,
                color: D.textMuted,
                fontFamily: D.head,
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Shield size={12} />
              <span>Read Only ({currentRole})</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: D.surf0,
          padding: '12px 16px',
          borderRadius: D.lg,
          border: `1px solid ${D.border}`,
        }}
      >
        {/* Scope Tabs */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          <button
            onClick={() => setScopeFilter('school')}
            style={{
              padding: '5px 12px',
              borderRadius: D.pill,
              border: `1px solid ${scopeFilter === 'school' ? D.emerald : D.border}`,
              background: scopeFilter === 'school' ? `${D.emerald}20` : D.surf2,
              color: scopeFilter === 'school' ? D.emerald : D.textSecondary,
              fontFamily: D.head,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {activeSchool.shortName} Fixtures
          </button>
          <button
            onClick={() => setScopeFilter('live')}
            style={{
              padding: '5px 12px',
              borderRadius: D.pill,
              border: `1px solid ${scopeFilter === 'live' ? D.emerald : D.border}`,
              background: scopeFilter === 'live' ? `${D.emerald}20` : D.surf2,
              color: scopeFilter === 'live' ? D.emerald : D.textSecondary,
              fontFamily: D.head,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: D.emerald }} />
            <span>Live Matches ({matches.filter(m => m.status === 'live').length})</span>
          </button>
          <button
            onClick={() => setScopeFilter('upcoming')}
            style={{
              padding: '5px 12px',
              borderRadius: D.pill,
              border: `1px solid ${scopeFilter === 'upcoming' ? D.amber : D.border}`,
              background: scopeFilter === 'upcoming' ? `${D.amber}20` : D.surf2,
              color: scopeFilter === 'upcoming' ? D.amber : D.textSecondary,
              fontFamily: D.head,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Upcoming ({matches.filter(m => m.status === 'upcoming').length})
          </button>
          <button
            onClick={() => setScopeFilter('complete')}
            style={{
              padding: '5px 12px',
              borderRadius: D.pill,
              border: `1px solid ${scopeFilter === 'complete' ? D.sky : D.border}`,
              background: scopeFilter === 'complete' ? `${D.sky}20` : D.surf2,
              color: scopeFilter === 'complete' ? D.sky : D.textSecondary,
              fontFamily: D.head,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Results ({matches.filter(m => m.status === 'complete').length})
          </button>
          <button
            onClick={() => setScopeFilter('all')}
            style={{
              padding: '5px 12px',
              borderRadius: D.pill,
              border: `1px solid ${scopeFilter === 'all' ? D.indigo : D.border}`,
              background: scopeFilter === 'all' ? `${D.indigo}20` : D.surf2,
              color: scopeFilter === 'all' ? D.indigo : D.textSecondary,
              fontFamily: D.head,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            All Circuit ({matches.length})
          </button>
        </div>

        {/* Search & Format */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '200px' }}>
            <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: D.textMuted }} />
            <input
              type="text"
              placeholder="Search opponents, venues..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                borderRadius: D.pill,
                background: D.surf2,
                border: `1px solid ${D.border}`,
                color: D.textPrimary,
                fontFamily: D.body,
                fontSize: '11px',
                outline: 'none',
              }}
            />
          </div>

          <select
            value={selectedFormat}
            onChange={e => setSelectedFormat(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: D.pill,
              background: D.surf2,
              border: `1px solid ${D.border}`,
              color: D.textPrimary,
              fontFamily: D.head,
              fontSize: '11px',
              fontWeight: 700,
              outline: 'none',
            }}
          >
            <option value="all">All Formats</option>
            <option value="50">50-Over Limited Overs</option>
            <option value="t20">T20 Blast</option>
            <option value="decl">Declaration Match</option>
          </select>
        </div>
      </div>

      {/* VIEW 1: CARDS GRID */}
      {viewMode === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '16px' }}>
          {filteredMatches.map(m => {
            const w = weather[m.id];
            const sc = liveScores[m.id];
            const isHome = m.homeTeam.toLowerCase().includes(activeSchool.shortName.toLowerCase());

            return (
              <div
                key={m.id}
                style={{
                  background: D.surf0,
                  borderRadius: D.lg,
                  border: `1px solid ${m.status === 'live' ? `${D.emerald}66` : D.border}`,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  boxShadow: m.status === 'live' ? `0 4px 16px ${D.emerald}15` : '0 2px 8px rgba(0,0,0,0.04)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {m.status === 'live' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: `linear-gradient(90deg, ${D.emerald}, ${D.sky})`,
                    }}
                  />
                )}

                <div>
                  {/* Status & Date */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: D.pill,
                          background: m.status === 'live' ? `${D.emerald}25` : m.status === 'complete' ? `${D.sky}25` : `${D.amber}25`,
                          color: m.status === 'live' ? D.emerald : m.status === 'complete' ? D.sky : D.amber,
                          fontFamily: D.mono,
                          fontSize: '10px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {m.status === 'live' && <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: D.emerald }} />}
                        {m.status}
                      </span>
                      <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                        {m.date} · {m.time}
                      </span>
                    </div>

                    {w && (
                      <span style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                        {w.icon} {w.tempC}°C {w.condition}
                      </span>
                    )}
                  </div>

                  {/* Matchup Headline */}
                  <div style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800, color: D.textPrimary }}>
                    {m.homeTeam}
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted, margin: '2px 0' }}>
                    vs
                  </div>
                  <div style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800, color: D.textPrimary }}>
                    {m.awayTeam}
                  </div>

                  {/* Venue & Format */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontFamily: D.body, fontSize: '11px', color: D.textSecondary }}>
                    <MapPin size={12} style={{ color: D.textMuted, flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.venue}</span>
                  </div>

                  {/* Live Score Telemetry */}
                  {m.status === 'live' && sc && (
                    <div
                      style={{
                        marginTop: '10px',
                        padding: '10px',
                        borderRadius: D.md,
                        background: `${D.emerald}12`,
                        border: `1px solid ${D.emerald}33`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontFamily: D.head, fontSize: '10px', color: D.emerald, fontWeight: 700, textTransform: 'uppercase' }}>
                          Current Score
                        </div>
                        <div style={{ fontFamily: D.mono, fontSize: '18px', fontWeight: 800, color: D.textPrimary }}>
                          {sc.runs}/{sc.wkts}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textSecondary }}>
                          {sc.overStr} Overs
                        </div>
                        <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.emerald, fontWeight: 700 }}>
                          CRR: {(sc.runs / (Math.max(1, parseFloat(sc.overStr)))).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Result */}
                  {m.result && (
                    <div style={{ marginTop: '8px', padding: '6px 8px', borderRadius: D.sm, background: `${D.emerald}15`, fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.emerald }}>
                      🏆 {m.result}
                    </div>
                  )}

                  {m.summary && !m.result && (
                    <div style={{ marginTop: '6px', fontFamily: D.body, fontSize: '11px', color: D.textMuted, lineHeight: 1.3 }}>
                      {m.summary}
                    </div>
                  )}
                </div>

                {/* Card Action Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: `1px solid ${D.border}44`, flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button
                      onClick={() => onOpenScorecard(m.id)}
                      style={{
                        padding: '5px 9px',
                        borderRadius: D.sm,
                        background: D.surf2,
                        border: `1px solid ${D.border}`,
                        color: D.textPrimary,
                        fontFamily: D.head,
                        fontSize: '10px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Eye size={11} />
                      <span>Scorecard</span>
                    </button>

                    {m.status === 'live' && (
                      <button
                        onClick={() => onLaunchScorer(m)}
                        style={{
                          padding: '5px 9px',
                          borderRadius: D.sm,
                          background: D.emerald,
                          border: 'none',
                          color: '#fff',
                          fontFamily: D.head,
                          fontSize: '10px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Play size={11} />
                        <span>Scorer</span>
                      </button>
                    )}
                  </div>

                  {/* RBAC Edit & Delete Controls */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {canEditMatch && (
                      <button
                        onClick={() => handleOpenEditModal(m)}
                        title="Edit Fixture Details"
                        style={{
                          padding: '5px 7px',
                          borderRadius: D.sm,
                          background: 'transparent',
                          border: `1px solid ${D.border}`,
                          color: D.textSecondary,
                          cursor: 'pointer',
                          fontSize: '11px',
                        }}
                      >
                        <Edit2 size={12} />
                      </button>
                    )}
                    {canDeleteMatch && (
                      <button
                        onClick={() => {
                          setSelectedMatch(m);
                          setDeleteModalOpen(true);
                        }}
                        title="Cancel / Remove Fixture"
                        style={{
                          padding: '5px 7px',
                          borderRadius: D.sm,
                          background: 'transparent',
                          border: `1px solid ${D.border}`,
                          color: D.rose,
                          cursor: 'pointer',
                          fontSize: '11px',
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: TABLE VIEW */}
      {viewMode === 'table' && (
        <div
          style={{
            background: D.surf0,
            borderRadius: D.lg,
            border: `1px solid ${D.border}`,
            overflowX: 'auto',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${D.border}`, background: D.surf1, textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>STATUS</th>
                <th style={{ padding: '10px 14px', fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>DATE & TIME</th>
                <th style={{ padding: '10px 14px', fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>MATCHUP</th>
                <th style={{ padding: '10px 14px', fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>VENUE</th>
                <th style={{ padding: '10px 14px', fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>FORMAT</th>
                <th style={{ padding: '10px 14px', fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>SCORE / RESULT</th>
                <th style={{ padding: '10px 14px', fontFamily: D.head, fontSize: '10px', color: D.textMuted, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredMatches.map(m => {
                const sc = liveScores[m.id];
                return (
                  <tr key={m.id} style={{ borderBottom: `1px solid ${D.border}44` }}>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: D.pill,
                          background: m.status === 'live' ? `${D.emerald}25` : m.status === 'complete' ? `${D.sky}25` : `${D.amber}25`,
                          color: m.status === 'live' ? D.emerald : m.status === 'complete' ? D.sky : D.amber,
                          fontFamily: D.mono,
                          fontSize: '10px',
                          fontWeight: 800,
                        }}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: D.mono, fontSize: '12px', color: D.textPrimary }}>
                      {m.date} <span style={{ color: D.textMuted }}>{m.time}</span>
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: D.textPrimary }}>
                      {m.homeTeam} <span style={{ color: D.textMuted, fontWeight: 400 }}>vs</span> {m.awayTeam}
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: D.body, fontSize: '12px', color: D.textSecondary }}>
                      {m.venue}
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                      {m.format || '50-Over'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {m.status === 'live' && sc ? (
                        <span style={{ fontFamily: D.mono, fontSize: '13px', fontWeight: 800, color: D.emerald }}>
                          {sc.runs}/{sc.wkts} ({sc.overStr} ov)
                        </span>
                      ) : m.result ? (
                        <span style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.emerald }}>
                          {m.result}
                        </span>
                      ) : (
                        <span style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                          Scheduled
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button
                          onClick={() => onOpenScorecard(m.id)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: D.sm,
                            background: D.surf2,
                            border: `1px solid ${D.border}`,
                            color: D.textPrimary,
                            fontFamily: D.head,
                            fontSize: '10px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Scorecard
                        </button>
                        {m.status === 'live' && (
                          <button
                            onClick={() => onLaunchScorer(m)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: D.sm,
                              background: D.emerald,
                              border: 'none',
                              color: '#fff',
                              fontFamily: D.head,
                              fontSize: '10px',
                              fontWeight: 800,
                              cursor: 'pointer',
                            }}
                          >
                            Scorer
                          </button>
                        )}
                        {canEditMatch && (
                          <button
                            onClick={() => handleOpenEditModal(m)}
                            style={{
                              padding: '4px 6px',
                              borderRadius: D.sm,
                              background: 'transparent',
                              border: `1px solid ${D.border}`,
                              color: D.textSecondary,
                              cursor: 'pointer',
                            }}
                          >
                            <Edit2 size={11} />
                          </button>
                        )}
                        {canDeleteMatch && (
                          <button
                            onClick={() => {
                              setSelectedMatch(m);
                              setDeleteModalOpen(true);
                            }}
                            style={{
                              padding: '4px 6px',
                              borderRadius: D.sm,
                              background: 'transparent',
                              border: `1px solid ${D.border}`,
                              color: D.rose,
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 3: TIMELINE VIEW */}
      {viewMode === 'timeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ padding: '12px 16px', background: D.surf1, borderRadius: D.md, border: `1px solid ${D.border}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} style={{ color: D.emerald }} />
            <span style={{ fontFamily: D.body, fontSize: '12px', color: D.textPrimary }}>
              <strong>Matchday Timeline:</strong> Sequential schedule of weekend circuit fixtures with session milestones, toss time, and umpire allocations.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', paddingLeft: '20px' }}>
            <div
              style={{
                position: 'absolute',
                top: '10px',
                bottom: '10px',
                left: '7px',
                width: '2px',
                background: `linear-gradient(180deg, ${D.emerald}, ${D.sky})`,
              }}
            />

            {filteredMatches.map(m => {
              const sc = liveScores[m.id];
              return (
                <div
                  key={m.id}
                  style={{
                    position: 'relative',
                    background: D.surf0,
                    borderRadius: D.lg,
                    border: `1px solid ${m.status === 'live' ? D.emerald : D.border}`,
                    padding: '16px',
                    marginLeft: '12px',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: '-26px',
                      top: '18px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: m.status === 'live' ? D.emerald : D.surf2,
                      border: `2px solid ${D.surf0}`,
                      boxShadow: m.status === 'live' ? `0 0 8px ${D.emerald}` : 'none',
                    }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontFamily: D.mono, fontSize: '12px', fontWeight: 800, color: D.textPrimary }}>
                          {m.time} · {m.date}
                        </span>
                        <span
                          style={{
                            padding: '1px 6px',
                            borderRadius: D.pill,
                            background: m.status === 'live' ? `${D.emerald}25` : `${D.amber}25`,
                            color: m.status === 'live' ? D.emerald : D.amber,
                            fontFamily: D.mono,
                            fontSize: '9px',
                            fontWeight: 800,
                          }}
                        >
                          {m.status.toUpperCase()}
                        </span>
                      </div>
                      <h3 style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800, color: D.textPrimary, margin: '2px 0' }}>
                        {m.homeTeam} vs {m.awayTeam}
                      </h3>
                      <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textSecondary }}>
                        📍 {m.venue} · {m.format || '50-Over'}
                      </div>
                      <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, marginTop: '4px' }}>
                        Officials: {m.umpire1 || 'Shaun George'} & {m.umpire2 || 'Craig White'} · Scorer: {m.scorer || 'Brian Wessels'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {m.status === 'live' && sc && (
                        <div style={{ textAlign: 'right', marginRight: '8px' }}>
                          <div style={{ fontFamily: D.mono, fontSize: '16px', fontWeight: 800, color: D.emerald }}>
                            {sc.runs}/{sc.wkts}
                          </div>
                          <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                            {sc.overStr} ov
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => onOpenScorecard(m.id)}
                        style={{
                          padding: '6px 12px',
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
                        Scorecard
                      </button>

                      {m.status === 'live' && (
                        <button
                          onClick={() => onLaunchScorer(m)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: D.pill,
                            background: D.emerald,
                            border: 'none',
                            color: '#fff',
                            fontFamily: D.head,
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          Scorer →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 4: LIVE BROADCAST SCOREBOARD */}
      {viewMode === 'live_broadcast' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredMatches.filter(m => m.status === 'live').length === 0 ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                background: D.surf0,
                borderRadius: D.lg,
                border: `1px solid ${D.border}`,
              }}
            >
              <Radio size={32} style={{ color: D.textMuted, margin: '0 auto 10px' }} />
              <h3 style={{ fontFamily: D.head, fontSize: '16px', color: D.textPrimary }}>No Fixtures Currently Live</h3>
              <p style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted, maxWidth: '400px', margin: '6px auto 14px' }}>
                Broadcast scoreboard mode displays real-time telemetry, wagon wheel traces, and live scoring events when matches are in session.
              </p>
              <button
                onClick={() => setViewMode('cards')}
                style={{
                  padding: '7px 16px',
                  borderRadius: D.pill,
                  background: D.emerald,
                  border: 'none',
                  color: '#fff',
                  fontFamily: D.head,
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                View Upcoming Fixtures
              </button>
            </div>
          ) : (
            filteredMatches.filter(m => m.status === 'live').map(m => {
              const sc = liveScores[m.id] || { runs: 184, wkts: 4, overStr: '32.4' };
              return (
                <div
                  key={m.id}
                  style={{
                    background: D.surf0,
                    borderRadius: D.lg,
                    border: `1px solid ${D.emerald}66`,
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    boxShadow: `0 8px 28px ${D.emerald}18`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: D.emerald, boxShadow: `0 0 10px ${D.emerald}` }} />
                      <span style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.emerald, textTransform: 'uppercase' }}>
                        LIVE MATCHDAY BROADCAST FEED
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => onLaunchScorer(m)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: D.pill,
                          background: D.emerald,
                          border: 'none',
                          color: '#fff',
                          fontFamily: D.head,
                          fontSize: '11px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Play size={12} />
                        <span>Launch Broadcast Scorer</span>
                      </button>
                      <button
                        onClick={() => onOpenScorecard(m.id)}
                        style={{
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
                        Full Scorecard & Worm
                      </button>
                    </div>
                  </div>

                  {/* Broadcast Big Scoreboard Bar */}
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${D.surf1} 0%, ${D.surf2} 100%)`,
                      padding: '20px',
                      borderRadius: D.lg,
                      border: `1px solid ${D.border}`,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '16px',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>BATTING INNINGS</div>
                      <div style={{ fontFamily: D.head, fontSize: '20px', fontWeight: 900, color: D.textPrimary, marginTop: '2px' }}>
                        {m.homeTeam}
                      </div>
                      <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textSecondary }}>
                        vs {m.awayTeam} · {m.venue}
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: D.head, fontSize: '10px', color: D.emerald, fontWeight: 800, letterSpacing: '0.1em' }}>
                        SCORELINE
                      </div>
                      <div style={{ fontFamily: D.mono, fontSize: '36px', fontWeight: 900, color: D.textPrimary }}>
                        {sc.runs}<span style={{ color: D.emerald }}>/</span>{sc.wkts}
                      </div>
                      <div style={{ fontFamily: D.mono, fontSize: '12px', color: D.textMuted }}>
                        ({sc.overStr} / {m.overs || 50} Overs)
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.mono, fontSize: '11px' }}>
                        <span style={{ color: D.textMuted }}>Current Run Rate:</span>
                        <strong style={{ color: D.emerald }}>{(sc.runs / (Math.max(1, parseFloat(sc.overStr)))).toFixed(2)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.mono, fontSize: '11px' }}>
                        <span style={{ color: D.textMuted }}>Projected Total:</span>
                        <strong style={{ color: D.textPrimary }}>{Math.round((sc.runs / (Math.max(1, parseFloat(sc.overStr)))) * (m.overs || 50))}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.mono, fontSize: '11px' }}>
                        <span style={{ color: D.textMuted }}>Match Officials:</span>
                        <span style={{ color: D.textSecondary }}>{m.umpire1?.split(' ')[1] || 'White'} & {m.umpire2?.split(' ')[1] || 'Zulu'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* CREATE FIXTURE MODAL */}
      {createModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: D.surf0,
              borderRadius: D.lg,
              border: `1px solid ${D.border}`,
              maxWidth: '520px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '22px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} style={{ color: D.emerald }} />
                <h3 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                  Schedule New Interschool Fixture
                </h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', color: D.textMuted, cursor: 'pointer', fontSize: '16px' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Home Institution</label>
                  <input
                    type="text"
                    required
                    value={formData.homeTeam}
                    onChange={e => setFormData({ ...formData, homeTeam: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Away Opposition</label>
                  <input
                    type="text"
                    required
                    value={formData.awayTeam}
                    onChange={e => setFormData({ ...formData, awayTeam: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Scheduled Start Time</label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Venue / Field</label>
                <input
                  type="text"
                  required
                  value={formData.venue}
                  onChange={e => setFormData({ ...formData, venue: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Match Format</label>
                  <select
                    value={formData.format}
                    onChange={e => setFormData({ ...formData, format: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                  >
                    <option value="50-Over Limited Overs">50-Over Limited Overs</option>
                    <option value="T20 Blast">T20 Blast</option>
                    <option value="Declaration Match">Declaration Match</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Max Overs Per Side</label>
                  <input
                    type="number"
                    value={formData.overs}
                    onChange={e => setFormData({ ...formData, overs: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Lead Umpire</label>
                  <input
                    type="text"
                    value={formData.umpire1}
                    onChange={e => setFormData({ ...formData, umpire1: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Square Leg Umpire</label>
                  <input
                    type="text"
                    value={formData.umpire2}
                    onChange={e => setFormData({ ...formData, umpire2: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Official Scorer</label>
                <input
                  type="text"
                  value={formData.scorer}
                  onChange={e => setFormData({ ...formData, scorer: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  style={{ padding: '8px 14px', borderRadius: D.pill, background: D.surf2, border: `1px solid ${D.border}`, color: D.textSecondary, fontFamily: D.head, fontSize: '11px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: D.pill, background: D.emerald, border: 'none', color: '#fff', fontFamily: D.head, fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Save Fixture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT FIXTURE MODAL */}
      {editModalOpen && selectedMatch && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: D.surf0,
              borderRadius: D.lg,
              border: `1px solid ${D.border}`,
              maxWidth: '520px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '22px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit2 size={18} style={{ color: D.emerald }} />
                <h3 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                  Edit Fixture & Match Status
                </h3>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                style={{ background: 'none', border: 'none', color: D.textMuted, cursor: 'pointer', fontSize: '16px' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Match Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px', fontWeight: 700 }}
                  >
                    <option value="upcoming">Upcoming (Scheduled)</option>
                    <option value="live">Live in Progress</option>
                    <option value="complete">Complete (Finished)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Venue</label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={e => setFormData({ ...formData, venue: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Summary / Match Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Pitch report, weather notes, toss result..."
                  style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  style={{ padding: '8px 14px', borderRadius: D.pill, background: D.surf2, border: `1px solid ${D.border}`, color: D.textSecondary, fontFamily: D.head, fontSize: '11px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: D.pill, background: D.emerald, border: 'none', color: '#fff', fontFamily: D.head, fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Update Fixture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && selectedMatch && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: D.surf0,
              borderRadius: D.lg,
              border: `1px solid ${D.rose}44`,
              maxWidth: '420px',
              width: '100%',
              padding: '20px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <AlertCircle size={20} style={{ color: D.rose }} />
              <h3 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.rose, margin: 0 }}>
                Cancel & Delete Fixture?
              </h3>
            </div>
            <p style={{ fontFamily: D.body, fontSize: '13px', color: D.textPrimary, lineHeight: 1.4 }}>
              Are you sure you want to cancel the match between <strong>{selectedMatch.homeTeam}</strong> and <strong>{selectedMatch.awayTeam}</strong> on {selectedMatch.date}? This action cannot be undone.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                onClick={() => setDeleteModalOpen(false)}
                style={{ padding: '7px 14px', borderRadius: D.pill, background: D.surf2, border: `1px solid ${D.border}`, color: D.textSecondary, fontFamily: D.head, fontSize: '11px', cursor: 'pointer' }}
              >
                Keep Fixture
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{ padding: '7px 16px', borderRadius: D.pill, background: D.rose, border: 'none', color: '#fff', fontFamily: D.head, fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
