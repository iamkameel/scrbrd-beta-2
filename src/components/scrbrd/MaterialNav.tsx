'use client';

import React, { useState } from 'react';
import { Theme, SchoolRegistryItem } from './types';
import { NAV_META, ROLES } from './data';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Search,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { ScrbrdLogo } from './ScrbrdLogo';

export interface NavGroup {
  id: string;
  label: string;
  items: string[];
}

export const MATERIAL_NAV_GROUPS: NavGroup[] = [
  {
    id: 'core',
    label: 'Cockpit & Schedule',
    items: ['dashboard', 'calendar', 'inbox'],
  },
  {
    id: 'match_ops',
    label: 'Match Operations',
    items: ['matches', 'coach_cockpit', 'captain_cockpit', 'broadcast', 'fields'],
  },
  {
    id: 'competitions',
    label: 'Competitions & Rules',
    items: ['competitions', 'leagues', 'promotion_demotion', 'rulebook', 'governance'],
  },
  {
    id: 'talent',
    label: 'Athletes & Development',
    items: ['squad', 'profiles', 'skills', 'compare', 'scouting', 'training', 'injuries'],
  },
  {
    id: 'intelligence',
    label: 'Data & Analytics',
    items: ['analytics', 'analyst_cockpit', 'statsguru'],
  },
  {
    id: 'institutional',
    label: 'School Operations',
    items: ['school_profile', 'register', 'staff', 'sponsorship', 'logistics', 'settings'],
  },
];

interface MaterialNavProps {
  theme: Theme;
  currentPage: string;
  onNavigate: (page: string) => void;
  isRail: boolean;
  onToggleRail: () => void;
  activeSchool: SchoolRegistryItem;
  currentRole: string;
  liveMatchCount?: number;
  unreadAlertCount?: number;
  onOpenCommandPalette: () => void;
  onLaunchScorer: () => void;
}

export default function MaterialNav({
  theme: D,
  currentPage,
  onNavigate,
  isRail,
  onToggleRail,
  activeSchool,
  currentRole,
  liveMatchCount = 1,
  unreadAlertCount = 3,
  onOpenCommandPalette,
  onLaunchScorer,
}: MaterialNavProps) {
  const [filterQuery, setFilterQuery] = useState('');

  const schoolPrimary = activeSchool?.color || D.indigo;

  return (
    <aside
      style={{
        width: isRail ? '76px' : '260px',
        minWidth: isRail ? '76px' : '260px',
        height: '100vh',
        background: D.isDark ? '#0a0f1d' : '#ffffff',
        borderRight: `1px solid ${D.border}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        zIndex: 50,
        userSelect: 'none',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: isRail ? '18px 12px' : '18px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isRail ? 'center' : 'space-between',
          borderBottom: `1px solid ${D.border}`,
          height: '68px',
          boxSizing: 'border-box',
        }}
      >
        <div
          onClick={() => onNavigate('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          <ScrbrdLogo theme={D} size={isRail ? 28 : 26} />
          {!isRail && (
            <div>
              <div
                style={{
                  fontFamily: D.head,
                  fontSize: '16px',
                  fontWeight: 800,
                  color: D.textPrimary,
                  letterSpacing: '0.04em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                SCRBRD
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '2px 5px',
                    borderRadius: '4px',
                    background: `${schoolPrimary}25`,
                    color: schoolPrimary,
                    fontFamily: D.mono,
                  }}
                >
                  OS 2.0
                </span>
              </div>
              <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                {activeSchool.shortName} · Cricket
              </div>
            </div>
          )}
        </div>

        {!isRail && (
          <button
            onClick={onToggleRail}
            title="Collapse to compact navigation rail"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              border: `1px solid ${D.border}`,
              background: 'transparent',
              color: D.textMuted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Quick Scorer Action FAB Button (Material 3 Extended FAB) */}
      <div style={{ padding: isRail ? '12px 10px' : '12px 16px', borderBottom: `1px solid ${D.border}` }}>
        <button
          onClick={onLaunchScorer}
          style={{
            width: '100%',
            padding: isRail ? '12px 0' : '10px 14px',
            borderRadius: isRail ? '16px' : '14px',
            border: 'none',
            background: `linear-gradient(135deg, ${D.emerald}ee, #059669)`,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: `0 4px 14px ${D.emerald}35`,
            transition: 'all 0.15s ease',
          }}
          title="Launch Live Authoritative Scorer Hub"
        >
          <Radio size={16} className="animate-pulse" />
          {!isRail && (
            <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, letterSpacing: '0.01em' }}>
              Live Scoring Hub
            </span>
          )}
        </button>
      </div>

      {/* Quick Search Shortcut */}
      {!isRail && (
        <div style={{ padding: '8px 16px 4px 16px' }}>
          <button
            onClick={onOpenCommandPalette}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '10px',
              border: `1px solid ${D.border}`,
              background: D.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              color: D.textMuted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              fontFamily: D.body,
              fontSize: '12px',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={14} />
              Quick search...
            </span>
            <kbd
              style={{
                fontSize: '10px',
                fontFamily: D.mono,
                padding: '2px 5px',
                borderRadius: '4px',
                background: D.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              }}
            >
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* Navigation Group Items with Material 3 active pill indicators */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: isRail ? '10px 8px' : '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {MATERIAL_NAV_GROUPS.map((group) => {
          return (
            <div key={group.id} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {!isRail && (
                <div
                  style={{
                    padding: '4px 10px',
                    fontFamily: D.mono,
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: D.textMuted,
                    fontWeight: 700,
                  }}
                >
                  {group.label}
                </div>
              )}

              {group.items.map((itemKey) => {
                const meta = NAV_META[itemKey];
                if (!meta) return null;
                const isActive = currentPage === itemKey;

                // Dynamic badges
                let badge: { label: string; color: string } | null = null;
                if (itemKey === 'matches' && liveMatchCount > 0) {
                  badge = { label: `${liveMatchCount} LIVE`, color: D.emerald };
                } else if (itemKey === 'inbox' && unreadAlertCount > 0) {
                  badge = { label: `${unreadAlertCount}`, color: D.amber };
                } else if (itemKey === 'analytics' || itemKey === 'analyst_cockpit') {
                  badge = { label: 'PRO', color: D.indigo };
                }

                return (
                  <button
                    key={itemKey}
                    onClick={() => onNavigate(itemKey)}
                    title={meta.label}
                    style={{
                      width: '100%',
                      minHeight: '40px',
                      padding: isRail ? '8px 0' : '8px 12px',
                      borderRadius: isRail ? '14px' : '12px',
                      border: 'none',
                      background: isActive
                        ? isRail
                          ? `${D.indigo}25`
                          : D.isDark
                          ? 'rgba(99, 102, 241, 0.16)'
                          : 'rgba(99, 102, 241, 0.12)'
                        : 'transparent',
                      color: isActive ? (D.isDark ? '#ffffff' : D.indigo) : D.textSecondary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isRail ? 'center' : 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          fontSize: isRail ? '18px' : '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                        }}
                      >
                        {meta.icon}
                      </span>
                      {!isRail && (
                        <span
                          style={{
                            fontFamily: D.body,
                            fontSize: '13px',
                            fontWeight: isActive ? 700 : 500,
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {meta.label}
                        </span>
                      )}
                    </div>

                    {!isRail && badge && (
                      <span
                        style={{
                          fontFamily: D.mono,
                          fontSize: '9px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '6px',
                          background: `${badge.color}20`,
                          color: badge.color,
                          border: `1px solid ${badge.color}40`,
                        }}
                      >
                        {badge.label}
                      </span>
                    )}

                    {isRail && badge && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '6px',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: badge.color,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Rail Expand Button at bottom if in compact mode */}
      {isRail && (
        <div
          style={{
            padding: '12px 8px',
            borderTop: `1px solid ${D.border}`,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={onToggleRail}
            title="Expand Navigation Drawer"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: `1px solid ${D.border}`,
              background: 'transparent',
              color: D.textMuted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* User Persona & Role Footer in expanded mode */}
      {!isRail && (
        <div
          style={{
            padding: '14px 16px',
            borderTop: `1px solid ${D.border}`,
            background: D.isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.01)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: `${schoolPrimary}30`,
                color: schoolPrimary,
                fontFamily: D.head,
                fontSize: '13px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {activeSchool.shortName.charAt(0)}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontFamily: D.body,
                  fontSize: '12px',
                  fontWeight: 700,
                  color: D.textPrimary,
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {activeSchool.name}
              </div>
              <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                Season 2026 · Term 1
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
