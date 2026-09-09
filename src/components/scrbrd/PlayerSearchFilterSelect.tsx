'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Theme, Player, SchoolRegistryItem } from './types';
import { SCHOOLS_REGISTRY, PLAYERS } from './data';
import { Search, Filter, ArrowUpDown, X, Check, ArrowLeftRight, User, SlidersHorizontal, Sparkles, ChevronDown } from 'lucide-react';

interface PlayerSearchFilterSelectProps {
  theme: Theme;
  players?: Player[];
  selectedPlayerId?: string;
  onSelectPlayer: (player: Player) => void;
  label?: string;
  badgePrefix?: string; // e.g. "PLAYER A", "PLAYER B", "PROSPECT"
  excludePlayerId?: string;
  accentColor?: string;
  compact?: boolean;
  placeholder?: string;
}

type SortField = 'avg' | 'wkts' | 'sr' | 'runs' | 'name' | 'school';

function getSchoolInfo(schoolId: string, fallbackColor = '#3b82f6') {
  const found = SCHOOLS_REGISTRY.find(s => s.id === schoolId || s.shortName.toLowerCase() === schoolId.toLowerCase() || s.name.toLowerCase() === schoolId.toLowerCase());
  if (found) return found;
  return {
    id: schoolId,
    name: schoolId,
    shortName: schoolId,
    crestIcon: '🏫',
    colors: [fallbackColor, '#ffffff'],
  } as unknown as SchoolRegistryItem;
}

export default function PlayerSearchFilterSelect({
  theme: D,
  players = PLAYERS,
  selectedPlayerId,
  onSelectPlayer,
  label,
  badgePrefix,
  excludePlayerId,
  accentColor,
  compact = false,
  placeholder = "Search 1000+ players across schools...",
}: PlayerSearchFilterSelectProps) {
  const accent = accentColor || D.indigo;
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedHand, setSelectedHand] = useState<string>('all');
  const [selectedAgeDivision, setSelectedAgeDivision] = useState<string>('all');
  const [selectedQuotaTarget, setSelectedQuotaTarget] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortField>('avg');
  const [sortAsc, setSortAsc] = useState(false);
  const [quickPreset, setQuickPreset] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Selected player lookup
  const activePlayer = useMemo(() => {
    return players.find(p => p.id === selectedPlayerId) || players[0];
  }, [players, selectedPlayerId]);

  // Focus search input when popover opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Preset Handlers
  const applyPreset = (presetKey: string) => {
    if (quickPreset === presetKey) {
      setQuickPreset(null);
      setSelectedRole('all');
      setSelectedAgeDivision('all');
      setSelectedQuotaTarget('all');
      setSortBy('avg');
      return;
    }
    setQuickPreset(presetKey);
    if (presetKey === 'topBatters') {
      setSelectedRole('BAT');
      setSortBy('avg');
      setSortAsc(false);
    } else if (presetKey === 'strikeBowlers') {
      setSelectedRole('BOWL');
      setSortBy('wkts');
      setSortAsc(false);
    } else if (presetKey === 'allRounders') {
      setSelectedRole('ALL');
      setSortBy('avg');
      setSortAsc(false);
    } else if (presetKey === 'captains') {
      setSelectedRole('all');
      setSortBy('runs');
      setSortAsc(false);
    } else if (presetKey === 'highSR') {
      setSelectedRole('all');
      setSortBy('sr');
      setSortAsc(false);
    } else if (presetKey === 'quotaEligible') {
      setSelectedQuotaTarget('quotaEligible');
      setSortBy('avg');
      setSortAsc(false);
    } else if (presetKey === 'blackAfrican') {
      setSelectedQuotaTarget('blackAfrican');
      setSortBy('avg');
      setSortAsc(false);
    } else if (presetKey === 'bursary') {
      setSelectedQuotaTarget('bursary');
      setSortBy('avg');
      setSortAsc(false);
    } else if (presetKey === 'u16Week') {
      setSelectedAgeDivision('U16');
      setSortBy('avg');
      setSortAsc(false);
    }
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedSchool('all');
    setSelectedRole('all');
    setSelectedHand('all');
    setSelectedAgeDivision('all');
    setSelectedQuotaTarget('all');
    setSortBy('avg');
    setSortAsc(false);
    setQuickPreset(null);
  };

  const isFiltered = searchQuery.trim() !== '' || selectedSchool !== 'all' || selectedRole !== 'all' || selectedHand !== 'all' || selectedAgeDivision !== 'all' || selectedQuotaTarget !== 'all' || quickPreset !== null;

  // Filtered and Sorted Players list
  const filteredPlayers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return players
      .filter(p => {
        // Text Search
        if (query) {
          const schoolObj = getSchoolInfo(p.school);
          const schoolName = (schoolObj?.name || '').toLowerCase();
          const schoolShort = (schoolObj?.shortName || '').toLowerCase();
          const pName = p.name.toLowerCase();
          const pTeam = (p.team || '').toLowerCase();
          const pRole = (p.role || '').toLowerCase();
          const pBio = (p.bio || '').toLowerCase();
          const pBowl = `${p.bowlArm || ''}A${p.bowlStyle || ''}`.toLowerCase();
          const pDemo = (p.saDemographic || '').toLowerCase();
          const pPathway = (p.provincialPathway || '').toLowerCase();
          const pTrust = (p.bursaryTrust || '').toLowerCase();

          const matchesQuery =
            pName.includes(query) ||
            schoolName.includes(query) ||
            schoolShort.includes(query) ||
            pTeam.includes(query) ||
            pRole.includes(query) ||
            pBio.includes(query) ||
            pBowl.includes(query) ||
            pDemo.includes(query) ||
            pPathway.includes(query) ||
            pTrust.includes(query);

          if (!matchesQuery) return false;
        }

        // School Filter
        if (selectedSchool !== 'all') {
          if (p.school !== selectedSchool) {
            const schoolObj = getSchoolInfo(p.school);
            if (schoolObj.id !== selectedSchool && schoolObj.shortName !== selectedSchool) {
              return false;
            }
          }
        }

        // Role Filter
        if (selectedRole !== 'all' && p.role !== selectedRole) {
          return false;
        }

        // Hand Filter
        if (selectedHand !== 'all' && p.batHand !== selectedHand) {
          return false;
        }

        // Age Division Filter
        if (selectedAgeDivision !== 'all') {
          if (selectedAgeDivision === '1st XI') {
            if (p.ageDivision !== '1st XI' && p.team !== '1st XI' && p.ageDivision !== 'U19') return false;
          } else if (p.ageDivision !== selectedAgeDivision && p.team !== `${selectedAgeDivision}A`) {
            return false;
          }
        }

        // South Africa Quota & Transformation Filter
        if (selectedQuotaTarget !== 'all') {
          if (selectedQuotaTarget === 'quotaEligible' && !p.quotaEligible) return false;
          if (selectedQuotaTarget === 'blackAfrican' && p.saDemographic !== 'Black African') return false;
          if (selectedQuotaTarget === 'genericBlack' && p.saDemographic !== 'Generic Black') return false;
          if (selectedQuotaTarget === 'bursary' && !p.bursaryScholar) return false;
          if (selectedQuotaTarget === 'open' && p.saDemographic !== 'Open') return false;
        }

        // Quick Preset custom conditions
        if (quickPreset === 'captains' && p.cap !== 'c') {
          return false;
        }
        if (quickPreset === 'highSR' && p.sr < 125) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA: any = 0;
        let valB: any = 0;

        if (sortBy === 'avg') {
          valA = a.avg ?? 0;
          valB = b.avg ?? 0;
        } else if (sortBy === 'wkts') {
          valA = a.wkts ?? 0;
          valB = b.wkts ?? 0;
        } else if (sortBy === 'sr') {
          valA = a.sr ?? 0;
          valB = b.sr ?? 0;
        } else if (sortBy === 'runs') {
          valA = a.careerTotals?.runs ?? (a.avg * 15);
          valB = b.careerTotals?.runs ?? (b.avg * 15);
        } else if (sortBy === 'name') {
          valA = a.name;
          valB = b.name;
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else if (sortBy === 'school') {
          valA = a.school;
          valB = b.school;
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        if (valA === valB) return 0;
        return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
      });
  }, [players, searchQuery, selectedSchool, selectedRole, selectedHand, selectedAgeDivision, selectedQuotaTarget, sortBy, sortAsc, quickPreset]);

  // Current active school object
  const activeSchool = activePlayer ? getSchoolInfo(activePlayer.school) : null;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Trigger Card / Button */}
      <div
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          padding: compact ? '8px 12px' : '12px 14px',
          background: D.surf1,
          border: `1px solid ${isOpen ? accent : D.border}`,
          borderRadius: D.lg,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: isOpen ? `0 0 0 2px ${accent}33` : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          {/* Avatar with Role / School Tint */}
          <div
            style={{
              width: compact ? '32px' : '40px',
              height: compact ? '32px' : '40px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${accent}, ${accent}99)`,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: D.head,
              fontSize: compact ? '12px' : '14px',
              fontWeight: 800,
              flexShrink: 0,
              boxShadow: `0 2px 6px ${accent}44`,
            }}
          >
            {activePlayer ? activePlayer.name.split(' ').map(n => n[0]).slice(0, 2).join('') : '?'}
          </div>

          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            {badgePrefix && (
              <div style={{ fontFamily: D.mono, fontSize: '9px', fontWeight: 800, color: accent, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {badgePrefix}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontFamily: D.head, fontSize: compact ? '13px' : '15px', fontWeight: 800, color: D.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activePlayer?.name || "Select Player"}
              </span>
              {activePlayer?.cap === 'c' && (
                <span style={{ color: D.amber, fontSize: '11px', fontWeight: 800 }} title="Team Captain">©</span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: D.body, fontSize: '11px', color: D.textMuted, whiteSpace: 'nowrap' }}>
              <span>{activeSchool?.crestIcon} {activeSchool?.shortName || activePlayer?.school}</span>
              <span>•</span>
              <span style={{ fontFamily: D.mono, color: activePlayer?.role === 'BAT' ? D.sky : activePlayer?.role === 'BOWL' ? D.amber : D.emerald, fontWeight: 700 }}>
                {activePlayer?.role}
              </span>
              {!compact && (
                <>
                  <span>•</span>
                  <span>Avg {activePlayer?.avg}</span>
                  <span>•</span>
                  <span>{activePlayer?.wkts} wkts</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <span style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: accent, background: `${accent}18`, padding: '4px 8px', borderRadius: D.pill }}>
            Change
          </span>
          <ChevronDown size={16} color={D.textMuted} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
        </div>
      </div>

      {/* Dropdown Modal / Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 1050,
            background: D.surf0,
            borderRadius: D.lg,
            border: `1px solid ${D.border}`,
            boxShadow: '0 16px 36px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '480px',
            overflow: 'hidden',
          }}
        >
          {/* Header & Search Bar */}
          <div style={{ padding: '12px 14px', borderBottom: `1px solid ${D.border}`, background: D.surf1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Search size={14} color={accent} />
                <span style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 800, color: D.textPrimary, letterSpacing: '0.04em' }}>
                  {label || "FIND & FILTER PLAYERS (1000+ ROSTER)"}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: D.textMuted }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Instant Search Input */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                style={{
                  width: '100%',
                  padding: '8px 32px 8px 10px',
                  background: D.surf2,
                  border: `1px solid ${D.borderMed}`,
                  borderRadius: D.sm,
                  color: D.textPrimary,
                  fontFamily: D.body,
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: D.textMuted,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter & Sort Controls Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px' }}>
              {/* School Selector */}
              <div>
                <select
                  value={selectedSchool}
                  onChange={e => setSelectedSchool(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '5px 8px',
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    borderRadius: D.sm,
                    color: D.textPrimary,
                    fontFamily: D.body,
                    fontSize: '11px',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="all">🏫 All Schools ({players.length})</option>
                  {SCHOOLS_REGISTRY.map(s => {
                    const count = players.filter(p => p.school === s.id || p.school === s.shortName).length;
                    return (
                      <option key={s.id} value={s.id}>
                        {s.crestIcon} {s.shortName} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Role Selector */}
              <div>
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '5px 8px',
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    borderRadius: D.sm,
                    color: D.textPrimary,
                    fontFamily: D.body,
                    fontSize: '11px',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="all">🏏 All Roles</option>
                  <option value="BAT">🏏 Batters (BAT)</option>
                  <option value="BOWL">⚡ Bowlers (BOWL)</option>
                  <option value="ALL">★ All-Rounders (ALL)</option>
                  <option value="WK">🧤 Wicketkeepers (WK)</option>
                </select>
              </div>

              {/* Stance Filter */}
              <div>
                <select
                  value={selectedHand}
                  onChange={e => setSelectedHand(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '5px 8px',
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    borderRadius: D.sm,
                    color: D.textPrimary,
                    fontFamily: D.body,
                    fontSize: '11px',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="all">✋ All Stances</option>
                  <option value="R">🏏 Right-Hand (RHS)</option>
                  <option value="L">🏏 Left-Hand (LHS)</option>
                </select>
              </div>

              {/* Age Division Selector */}
              <div>
                <select
                  value={selectedAgeDivision}
                  onChange={e => setSelectedAgeDivision(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '5px 8px',
                    background: D.surf2,
                    border: `1px solid ${selectedAgeDivision !== 'all' ? accent : D.border}`,
                    borderRadius: D.sm,
                    color: D.textPrimary,
                    fontFamily: D.body,
                    fontSize: '11px',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="all">📅 All Age Divisions</option>
                  <option value="1st XI">🏆 1st XI / U19 (Seniors)</option>
                  <option value="U17">⚡ U17 Division</option>
                  <option value="U16">🌟 U16 Division (Grant Khomo)</option>
                  <option value="U15">🎯 U15 Division (National Wk)</option>
                  <option value="U14">🌱 U14 Division (Junior High)</option>
                </select>
              </div>

              {/* South Africa Quota & Transformation Target Selector */}
              <div>
                <select
                  value={selectedQuotaTarget}
                  onChange={e => setSelectedQuotaTarget(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '5px 8px',
                    background: D.surf2,
                    border: `1px solid ${selectedQuotaTarget !== 'all' ? D.emerald : D.border}`,
                    borderRadius: D.sm,
                    color: D.textPrimary,
                    fontFamily: D.body,
                    fontSize: '11px',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="all">🇿🇦 All Demographics</option>
                  <option value="quotaEligible">🇿🇦 Quota Eligible (Any Target)</option>
                  <option value="blackAfrican">🇿🇦 Black African Target</option>
                  <option value="genericBlack">Generic Black (Col / Ind)</option>
                  <option value="bursary">🎓 Bursary / Township Hub</option>
                  <option value="open">Open / Non-Quota</option>
                </select>
              </div>

              {/* Sort Order Selector */}
              <div style={{ display: 'flex', gap: '3px' }}>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortField)}
                  style={{
                    flex: 1,
                    padding: '5px 8px',
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    borderRadius: D.sm,
                    color: D.textPrimary,
                    fontFamily: D.body,
                    fontSize: '11px',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="avg">Sort: Batting Avg</option>
                  <option value="wkts">Sort: Wickets Taken</option>
                  <option value="sr">Sort: Strike Rate</option>
                  <option value="runs">Sort: Career Runs</option>
                  <option value="name">Sort: Name (A-Z)</option>
                  <option value="school">Sort: School</option>
                </select>
                <button
                  onClick={() => setSortAsc(prev => !prev)}
                  title={sortAsc ? "Ascending (Lowest first)" : "Descending (Highest first)"}
                  style={{
                    padding: '4px 6px',
                    borderRadius: D.sm,
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    color: D.textPrimary,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <ArrowUpDown size={12} />
                </button>
              </div>
            </div>

            {/* Quick Presets Pills */}
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }}>
              {[
                { id: 'topBatters', label: '🔥 Top Batters', color: D.emerald },
                { id: 'strikeBowlers', label: '⚡ Strike Bowlers', color: D.amber },
                { id: 'allRounders', label: '★ All-Rounders', color: D.indigo },
                { id: 'quotaEligible', label: '🇿🇦 Quota Target', color: D.emerald },
                { id: 'blackAfrican', label: '🇿🇦 Black African', color: D.sky },
                { id: 'bursary', label: '🎓 Bursary Scholars', color: D.purple || '#a855f7' },
                { id: 'u16Week', label: '🌟 U16 Grant Khomo', color: D.rose },
                { id: 'captains', label: '👑 Captains', color: D.sky },
                { id: 'highSR', label: '🚀 SR > 125', color: D.rose },
              ].map(p => {
                const isActive = quickPreset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p.id)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: D.pill,
                      background: isActive ? `${p.color}33` : D.surf2,
                      border: `1px solid ${isActive ? p.color : D.border}`,
                      color: isActive ? p.color : D.textMuted,
                      fontFamily: D.head,
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Results Count & Reset Link */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
              <span>
                Showing <strong>{filteredPlayers.length}</strong> of {players.length} players
              </span>
              {isFiltered && (
                <button
                  onClick={resetAllFilters}
                  style={{ background: 'transparent', border: 'none', color: D.rose, cursor: 'pointer', fontFamily: D.head, fontSize: '10px', fontWeight: 700 }}
                >
                  Reset Filters ↺
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Player List */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '6px' }}>
            {filteredPlayers.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: D.textMuted }}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>🔍</div>
                <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700 }}>No players match current filters</div>
                <div style={{ fontFamily: D.body, fontSize: '11px', marginTop: '4px' }}>Try broadening your search query or reset filters.</div>
                <button
                  onClick={resetAllFilters}
                  style={{
                    marginTop: '10px',
                    padding: '4px 12px',
                    borderRadius: D.pill,
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    color: D.textPrimary,
                    fontFamily: D.head,
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredPlayers.map(p => {
                const isSelected = p.id === selectedPlayerId;
                const isExcluded = excludePlayerId && p.id === excludePlayerId;
                const schoolInfo = getSchoolInfo(p.school);

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      onSelectPlayer(p);
                      setIsOpen(false);
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: D.md,
                      background: isSelected ? `${accent}20` : 'transparent',
                      border: `1px solid ${isSelected ? accent : 'transparent'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      marginBottom: '2px',
                      transition: 'background 0.1s ease',
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) e.currentTarget.style.background = D.surf2;
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      {/* Initials Circle */}
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: `${accent}33`,
                          color: accent,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: D.head,
                          fontSize: '11px',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {p.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.textPrimary }}>
                            {p.name}
                          </span>
                          {p.cap === 'c' && (
                            <span style={{ color: D.amber, fontSize: '10px', fontWeight: 800 }}>©</span>
                          )}
                          {isExcluded && (
                            <span style={{ fontFamily: D.mono, fontSize: '9px', color: D.rose, background: `${D.rose}20`, padding: '1px 5px', borderRadius: D.pill }}>
                              Selected on Other Side
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap', marginTop: '2px' }}>
                          <span style={{ fontFamily: D.mono, fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: D.pill, background: `${accent}18`, color: accent }}>
                            {p.ageDivision || p.team || '1st XI'}
                          </span>

                          {p.saDemographic === 'Black African' && (
                            <span style={{ fontFamily: D.mono, fontSize: '9px', fontWeight: 800, padding: '1px 5px', borderRadius: D.pill, background: 'rgba(14, 165, 233, 0.15)', color: D.sky }}>
                              🇿🇦 Black African
                            </span>
                          )}

                          {p.saDemographic === 'Generic Black' && (
                            <span style={{ fontFamily: D.mono, fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: D.pill, background: 'rgba(16, 185, 129, 0.15)', color: D.emerald }}>
                              🇿🇦 Generic Black
                            </span>
                          )}

                          {p.bursaryScholar && (
                            <span style={{ fontFamily: D.mono, fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: D.pill, background: 'rgba(168, 85, 247, 0.15)', color: D.purple || '#a855f7' }}>
                              🎓 Bursary
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: D.mono, fontSize: '10px', color: D.textMuted, marginTop: '2px' }}>
                          <span>{schoolInfo.crestIcon} {schoolInfo.shortName}</span>
                          <span>•</span>
                          <span style={{ color: p.role === 'BAT' ? D.sky : p.role === 'BOWL' ? D.amber : D.emerald, fontWeight: 700 }}>
                            {p.role}
                          </span>
                          <span>•</span>
                          <span>{p.batHand}HB · {p.bowlArm}A{p.bowlStyle}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Snippet */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <div style={{ textAlign: 'right', fontFamily: D.mono, fontSize: '11px' }}>
                        <div style={{ fontWeight: 800, color: D.emerald }}>
                          Avg {p.avg}
                        </div>
                        <div style={{ fontSize: '10px', color: D.textMuted }}>
                          {p.wkts > 0 ? `${p.wkts}w · ` : ''}SR {p.sr}
                        </div>
                      </div>

                      {isSelected ? (
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                      ) : (
                        <div style={{ width: '20px' }} />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
