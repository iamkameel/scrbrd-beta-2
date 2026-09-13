'use client';

import React, { useState } from 'react';
import { Theme, SchoolRegistryItem } from './types';
import { NAV_META } from './data';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Radio,
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
    items: ['matches', 'coach_cockpit', 'captain_cockpit', 'broadcast', 'officials', 'fields'],
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
  liveMatchCount = 1,
  unreadAlertCount = 3,
  onOpenCommandPalette,
  onLaunchScorer,
}: MaterialNavProps) {
  const [filterQuery, setFilterQuery] = useState('');

  const schoolPrimary = activeSchool?.color || D.indigo;

  return (
    <aside
      id="scrbrd-sidebar"
      style={{
        width: isRail ? '72px' : '260px',
        minWidth: isRail ? '72px' : '260px',
        height: '100vh',
        background: D.surf0,
        borderRight: `1px solid ${D.border}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease, background 0.2s ease, border-color 0.2s ease',
        position: 'relative',
        zIndex: 50,
        userSelect: 'none',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: isRail ? '14px 10px' : '16px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isRail ? 'center' : 'space-between',
          borderBottom: `1px solid ${D.border}`,
          height: '62px',
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
          <ScrbrdLogo size={isRail ? 24 : 22} />
          {!isRail && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  fontFamily: D.head,
                  fontSize: '15px',
                  fontWeight: 800,
                  color: D.textPrimary,
                  letterSpacing: '0.02em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  lineHeight: '1.2',
                }}
              >
                SCRBRD
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: `${schoolPrimary}15`,
                    color: schoolPrimary,
                    fontFamily: D.mono,
                    border: `1px solid ${schoolPrimary}30`,
                  }}
                >
                  PRO
                </span>
              </div>
              <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                {activeSchool.shortName} · KZN Cricket
              </div>
            </div>
          )}
        </div>

        {!isRail && (
          <button
            id="btn-collapse-rail"
            onClick={onToggleRail}
            title="Collapse sidebar"
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              border: `1px solid ${D.border}`,
              background: 'transparent',
              color: D.textMuted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            <ChevronLeft size={15} />
          </button>
        )}
      </div>

      {/* Quick Scorer Action FAB Button */}
      <div style={{ padding: isRail ? '10px 8px' : '10px 14px', borderBottom: `1px solid ${D.border}` }}>
        <button
          id="btn-sidebar-launch-scorer"
          onClick={onLaunchScorer}
          style={{
            width: '100%',
            padding: isRail ? '10px 0' : '9px 12px',
            borderRadius: '8px',
            border: 'none',
            background: D.emerald,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'opacity 0.15s ease',
          }}
          title="Launch Live Authoritative Scorer Hub"
        >
          <Radio size={15} />
          {!isRail && (
            <span style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>
              Official Scorer Console
            </span>
          )}
        </button>
      </div>

      {/* Search Input Filter for Navigation (Desktop expanded) */}
      {!isRail && (
        <div style={{ padding: '10px 14px 4px 14px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 10px',
              borderRadius: '6px',
              border: `1px solid ${D.border}`,
              background: D.isDark ? '#151e2e' : '#f8fafc',
            }}
          >
            <Search size={13} color={D.textMuted} />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter views..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: D.textPrimary,
                fontFamily: D.body,
                fontSize: '12px',
              }}
            />
          </div>
        </div>
      )}

      {/* Navigation Group Items */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: isRail ? '8px 6px' : '8px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {MATERIAL_NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((itemKey) => {
            if (!filterQuery) return true;
            const meta = NAV_META[itemKey];
            return meta?.label.toLowerCase().includes(filterQuery.toLowerCase());
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {!isRail && (
                <div
                  style={{
                    padding: '4px 8px',
                    fontFamily: D.mono,
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: D.textMuted,
                    fontWeight: 700,
                  }}
                >
                  {group.label}
                </div>
              )}

              {visibleItems.map((itemKey) => {
                const meta = NAV_META[itemKey];
                if (!meta) return null;
                const isActive = currentPage === itemKey;

                // Dynamic badges
                let badge: { label: string; color: string } | null = null;
                if (itemKey === 'matches' && liveMatchCount > 0) {
                  badge = { label: `${liveMatchCount} LIVE`, color: D.emerald };
                } else if (itemKey === 'inbox' && unreadAlertCount > 0) {
                  badge = { label: `${unreadAlertCount}`, color: D.amber };
                } else if (itemKey === 'analyst_cockpit') {
                  badge = { label: 'PRO', color: D.indigo };
                }

                return (
                  <button
                    key={itemKey}
                    id={`nav-item-${itemKey}`}
                    onClick={() => onNavigate(itemKey)}
                    title={meta.label}
                    style={{
                      width: '100%',
                      minHeight: '36px',
                      padding: isRail ? '8px 0' : '7px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isActive
                        ? D.isDark
                          ? '#1e293b'
                          : '#f1f5f9'
                        : 'transparent',
                      color: isActive ? (D.isDark ? '#ffffff' : D.indigo) : D.textSecondary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isRail ? 'center' : 'space-between',
                      cursor: 'pointer',
                      transition: 'background 0.12s ease, color 0.12s ease',
                      position: 'relative',
                      borderLeft: isActive && !isRail ? `3px solid ${D.indigo}` : '3px solid transparent',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: isRail ? '16px' : '15px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '20px',
                          flexShrink: 0,
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
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
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
                          padding: '1px 5px',
                          borderRadius: '4px',
                          background: `${badge.color}15`,
                          color: badge.color,
                          border: `1px solid ${badge.color}30`,
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
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
                          width: '6px',
                          height: '6px',
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
            padding: '10px 6px',
            borderTop: `1px solid ${D.border}`,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <button
            id="btn-expand-rail"
            onClick={onToggleRail}
            title="Expand Navigation Drawer"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: `1px solid ${D.border}`,
              background: 'transparent',
              color: D.textMuted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Institution summary footer in expanded mode */}
      {!isRail && (
        <div
          style={{
            padding: '12px 14px',
            borderTop: `1px solid ${D.border}`,
            background: D.isDark ? '#0e1420' : '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: `${schoolPrimary}20`,
                color: schoolPrimary,
                fontFamily: D.head,
                fontSize: '12px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {activeSchool.crestIcon}
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
