'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Theme, Match, SchoolRegistryItem } from './types';
import { PLAYERS, SCHOOLS_REGISTRY, MATCHES, NAV_META } from './data';
import { Search, ArrowRight, X, User, Trophy, MapPin, Calendar, Sparkles } from 'lucide-react';

interface CommandPaletteModalProps {
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
  onSelectPlayer?: (player: any) => void;
  onLaunchScorer?: (match?: Match) => void;
}

export default function CommandPaletteModal({
  theme: D,
  isOpen,
  onClose,
  onNavigate,
  onSelectPlayer,
  onLaunchScorer,
}: CommandPaletteModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) {
      return [
        { type: 'action', title: 'Open Live Scoring Hub', subtitle: 'Launch authoritative ball-by-ball scorer', icon: '⚡', action: () => onLaunchScorer?.() },
        { type: 'page', title: 'Coach Cockpit & Match Command', subtitle: 'Tactical pitch map, 3-phase telemetry & directives', icon: '🧭', action: () => onNavigate('coach_cockpit') },
        { type: 'page', title: 'Captain Tactical Cockpit', subtitle: 'On-field awareness, over planner & quick decision logger', icon: '⚡', action: () => onNavigate('captain_cockpit') },
        { type: 'page', title: 'Dashboard Intelligence', subtitle: 'Executive & coach operational feed', icon: '📊', action: () => onNavigate('dashboard') },
        { type: 'page', title: 'Matches & Fixtures', subtitle: 'Browse all derby clashes & scorecards', icon: '🏏', action: () => onNavigate('matches') },
        { type: 'page', title: 'Squad Roster', subtitle: 'View team lists & player stats', icon: '👥', action: () => onNavigate('squad') },
        { type: 'page', title: 'Skills Matrix', subtitle: 'Spider radar & player performance benchmarks', icon: '🎯', action: () => onNavigate('skills') },
        { type: 'page', title: 'Grounds & Pitch Curators', subtitle: 'Turf telemetry, moisture & pace ratings', icon: '🌿', action: () => onNavigate('fields') },
      ];
    }

    const q = query.toLowerCase();
    const list: Array<{ type: string; title: string; subtitle: string; icon: string | React.ReactNode; action: () => void }> = [];

    // Search navigation pages
    Object.entries(NAV_META).forEach(([pageKey, meta]) => {
      if (meta.label.toLowerCase().includes(q) || pageKey.includes(q)) {
        list.push({
          type: 'navigation',
          title: meta.label,
          subtitle: `Navigate to ${meta.label}`,
          icon: meta.icon,
          action: () => onNavigate(pageKey),
        });
      }
    });

    // Search players
    PLAYERS.forEach((player) => {
      if (player.name.toLowerCase().includes(q) || player.role.toLowerCase().includes(q)) {
        list.push({
          type: 'player',
          title: player.name,
          subtitle: `${player.team} · ${player.role} (${player.battingStyle || 'Right-hand'})`,
          icon: <User size={16} color={D.sky} />,
          action: () => {
            onSelectPlayer?.(player);
            onNavigate('profiles');
          },
        });
      }
    });

    // Search schools
    Object.values(SCHOOLS_REGISTRY).forEach((school: SchoolRegistryItem) => {
      if (school.name.toLowerCase().includes(q) || school.shortName.toLowerCase().includes(q)) {
        list.push({
          type: 'school',
          title: school.name,
          subtitle: `${school.region} · Oval: ${school.mainOval}`,
          icon: <Trophy size={16} color={D.amber} />,
          action: () => onNavigate('school_profile'),
        });
      }
    });

    // Search matches
    MATCHES.forEach((match) => {
      if (
        match.homeTeam.toLowerCase().includes(q) ||
        match.awayTeam.toLowerCase().includes(q) ||
        match.venue.toLowerCase().includes(q)
      ) {
        list.push({
          type: 'match',
          title: `${match.homeTeam} vs ${match.awayTeam}`,
          subtitle: `${match.date} · ${match.venue} (${match.status.toUpperCase()})`,
          icon: '🏏',
          action: () => {
            if (match.status === 'live') {
              onLaunchScorer?.(match);
            } else {
              onNavigate('matches');
            }
          },
        });
      }
    });

    return list.slice(0, 10);
  }, [query, onNavigate, onSelectPlayer, onLaunchScorer, D]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(6, 9, 16, 0.75)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '80px',
        paddingLeft: '16px',
        paddingRight: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          background: D.isDark ? '#0f172a' : '#ffffff',
          borderRadius: '24px',
          border: `1px solid ${D.borderMed}`,
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.15s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar (Material 3 Search Surface) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderBottom: `1px solid ${D.border}`,
            background: D.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
          }}
        >
          <Search size={20} color={D.textMuted} />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search matches, athletes, grounds, schools or commands... (e.g. Westville, Naidoo, Scorer)"
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: D.body,
              fontSize: '15px',
              color: D.textPrimary,
            }}
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', color: D.textMuted, cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          ) : (
            <span
              style={{
                fontFamily: D.mono,
                fontSize: '11px',
                padding: '3px 7px',
                borderRadius: '6px',
                background: D.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                color: D.textMuted,
              }}
            >
              ESC
            </span>
          )}
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '8px' }}>
          {results.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: D.textMuted, fontSize: '14px' }}>
              No matches found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: isSelected
                      ? D.isDark
                        ? 'rgba(99, 102, 241, 0.15)'
                        : 'rgba(99, 102, 241, 0.08)'
                      : 'transparent',
                    transition: 'all 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: D.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontFamily: D.body, fontSize: '14px', fontWeight: 600, color: D.textPrimary }}>
                        {item.title}
                      </div>
                      <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted }}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <ArrowRight
                    size={16}
                    color={isSelected ? D.indigo : D.textMuted}
                    style={{ opacity: isSelected ? 1 : 0.4 }}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div
          style={{
            padding: '10px 16px',
            background: D.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            borderTop: `1px solid ${D.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: D.mono,
            fontSize: '11px',
            color: D.textMuted,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: D.indigo }}>
            <Sparkles size={12} /> SCRBRD Intelligence
          </span>
        </div>
      </div>
    </div>
  );
}
