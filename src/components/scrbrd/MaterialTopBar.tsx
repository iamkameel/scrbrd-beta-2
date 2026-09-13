'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Theme, SchoolRegistryItem } from './types';
import { SCHOOLS_REGISTRY, ROLES, NAV_META } from './data';
import {
  Menu,
  Search,
  Sparkles,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Radio,
  SlidersHorizontal,
  ShieldCheck,
  Check,
  Building,
} from 'lucide-react';

interface MaterialTopBarProps {
  theme: Theme;
  currentPage: string;
  activeSchool: SchoolRegistryItem;
  onSelectSchool: (schoolId: string) => void;
  selectedSquadId: string;
  onSelectSquad: (squadId: string) => void;
  currentRole: string;
  onSelectRole: (role: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isCompactDensity: boolean;
  onToggleDensity: () => void;
  onOpenCommandPalette: () => void;
  onOpenIntelligenceDrawer: () => void;
  onOpenNotifications: () => void;
  onLaunchScorer: () => void;
  onToggleMobileNav: () => void;
  liveMatchCount?: number;
  unreadNotificationsCount?: number;
}

export default function MaterialTopBar({
  theme: D,
  currentPage,
  activeSchool,
  onSelectSchool,
  selectedSquadId,
  onSelectSquad,
  currentRole,
  onSelectRole,
  isDark,
  onToggleTheme,
  isCompactDensity,
  onToggleDensity,
  onOpenCommandPalette,
  onOpenIntelligenceDrawer,
  onOpenNotifications,
  onLaunchScorer,
  onToggleMobileNav,
  liveMatchCount = 1,
  unreadNotificationsCount = 3,
}: MaterialTopBarProps) {
  const [schoolMenuOpen, setSchoolMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [squadMenuOpen, setSquadMenuOpen] = useState(false);

  const schoolMenuRef = useRef<HTMLDivElement>(null);
  const roleMenuRef = useRef<HTMLDivElement>(null);
  const squadMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (schoolMenuRef.current && !schoolMenuRef.current.contains(target)) {
        setSchoolMenuOpen(false);
      }
      if (roleMenuRef.current && !roleMenuRef.current.contains(target)) {
        setRoleMenuOpen(false);
      }
      if (squadMenuRef.current && !squadMenuRef.current.contains(target)) {
        setSquadMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const schoolPrimary = activeSchool?.color || D.indigo;
  const currentRoleMeta = ROLES[currentRole] || { label: currentRole, color: D.indigo };

  const squadOptions = [
    { id: `${activeSchool.id}_1ST`, label: '1st XI' },
    { id: `${activeSchool.id}_2ND`, label: '2nd XI' },
    { id: `${activeSchool.id}_U16A`, label: 'U16A' },
    { id: `${activeSchool.id}_U15A`, label: 'U15A' },
    { id: `${activeSchool.id}_U14A`, label: 'U14A' },
  ];

  const currentSquadLabel =
    squadOptions.find((s) => s.id === selectedSquadId)?.label || '1st XI';

  const pageLabel = NAV_META[currentPage]?.label || currentPage;

  return (
    <header
      id="scrbrd-topbar"
      style={{
        height: isCompactDensity ? '54px' : '62px',
        background: D.surf0,
        borderBottom: `1px solid ${D.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 18px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        transition: 'background 0.2s ease, height 0.15s ease, border-color 0.2s ease',
      }}
    >
      {/* Left side: Mobile Toggle + Breadcrumbs Context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          id="btn-mobile-nav"
          onClick={onToggleMobileNav}
          className="md:hidden"
          style={{
            background: 'transparent',
            border: `1px solid ${D.border}`,
            borderRadius: '8px',
            color: D.textPrimary,
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Toggle navigation menu"
        >
          <Menu size={18} />
        </button>

        {/* Institution & Squad context */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontFamily: D.body }}>
          {/* Active School Dropdown */}
          <div ref={schoolMenuRef} style={{ position: 'relative' }}>
            <button
              id="btn-school-switcher"
              onClick={() => {
                setSchoolMenuOpen((v) => !v);
                setRoleMenuOpen(false);
                setSquadMenuOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '5px 10px',
                borderRadius: '8px',
                background: D.isDark ? '#151e2e' : '#f1f5f9',
                border: `1px solid ${D.border}`,
                color: D.textPrimary,
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease',
              }}
            >
              <span style={{ fontSize: '15px' }}>{activeSchool.crestIcon}</span>
              <span>{activeSchool.shortName}</span>
              <ChevronDown size={13} color={D.textMuted} />
            </button>

            {schoolMenuOpen && (
              <div
                id="dropdown-schools"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  zIndex: 100,
                  width: '260px',
                  background: D.surf0,
                  border: `1px solid ${D.borderMed}`,
                  borderRadius: '12px',
                  boxShadow: D.isDark ? '0 12px 30px rgba(0,0,0,0.5)' : '0 10px 25px rgba(0,0,0,0.08)',
                  padding: '6px',
                }}
              >
                <div style={{ padding: '6px 10px', fontFamily: D.mono, fontSize: '10px', textTransform: 'uppercase', color: D.textMuted, fontWeight: 700, letterSpacing: '0.05em' }}>
                  KZN Schools Registry
                </div>
                {Object.values(SCHOOLS_REGISTRY).map((school) => {
                  const isSelected = activeSchool.id === school.id;
                  return (
                    <button
                      key={school.id}
                      onClick={() => {
                        onSelectSchool(school.id);
                        setSchoolMenuOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: isSelected ? (D.isDark ? '#1e293b' : '#f1f5f9') : 'transparent',
                        color: isSelected ? school.color : D.textPrimary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{school.crestIcon}</span>
                        <span style={{ fontWeight: isSelected ? 700 : 500 }}>{school.name}</span>
                      </div>
                      {isSelected && <Check size={14} color={school.color} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <span style={{ color: D.textMuted }}>/</span>

          {/* Squad context chip */}
          <div ref={squadMenuRef} style={{ position: 'relative' }}>
            <button
              id="btn-squad-switcher"
              onClick={() => {
                setSquadMenuOpen((v) => !v);
                setSchoolMenuOpen(false);
                setRoleMenuOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                borderRadius: '8px',
                background: D.isDark ? '#151e2e' : '#f1f5f9',
                border: `1px solid ${D.border}`,
                color: D.textPrimary,
                fontFamily: D.mono,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <span>{currentSquadLabel}</span>
              <ChevronDown size={12} color={D.textMuted} />
            </button>

            {squadMenuOpen && (
              <div
                id="dropdown-squads"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  zIndex: 100,
                  width: '140px',
                  background: D.surf0,
                  border: `1px solid ${D.borderMed}`,
                  borderRadius: '10px',
                  boxShadow: D.isDark ? '0 12px 30px rgba(0,0,0,0.5)' : '0 10px 25px rgba(0,0,0,0.08)',
                  padding: '6px',
                }}
              >
                {squadOptions.map((sq) => {
                  const isSelected = selectedSquadId === sq.id;
                  return (
                    <button
                      key={sq.id}
                      onClick={() => {
                        onSelectSquad(sq.id);
                        setSquadMenuOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '7px 9px',
                        borderRadius: '6px',
                        border: 'none',
                        background: isSelected ? (D.isDark ? '#1e293b' : '#f1f5f9') : 'transparent',
                        color: isSelected ? schoolPrimary : D.textPrimary,
                        fontFamily: D.mono,
                        fontSize: '12px',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span>{sq.label}</span>
                      {isSelected && <Check size={13} color={schoolPrimary} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <span style={{ color: D.textMuted }} className="hidden sm:inline">/</span>

          {/* Current Page Label */}
          <span className="hidden sm:inline" style={{ color: D.textPrimary, fontWeight: 700, fontSize: '13px' }}>
            {pageLabel}
          </span>
        </div>
      </div>

      {/* Center: Command Palette Trigger Input */}
      <div className="hidden md:flex" style={{ flex: 1, maxWidth: '440px', margin: '0 18px' }}>
        <button
          id="btn-omnisearch-trigger"
          onClick={onOpenCommandPalette}
          style={{
            width: '100%',
            height: '36px',
            padding: '0 12px',
            borderRadius: '8px',
            border: `1px solid ${D.border}`,
            background: D.isDark ? '#151e2e' : '#f8fafc',
            color: D.textMuted,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            fontFamily: D.body,
            fontSize: '13px',
            transition: 'border-color 0.15s ease, background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = D.borderMed;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = D.border;
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <Search size={15} color={D.textMuted} />
            <span>Search fixtures, players, pitches, stats...</span>
          </span>
          <kbd
            style={{
              fontSize: '10px',
              fontFamily: D.mono,
              padding: '2px 6px',
              borderRadius: '4px',
              background: D.isDark ? '#1c2638' : '#e2e8f0',
              color: D.textSecondary,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Action Cluster */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Role Switcher Pill */}
        <div ref={roleMenuRef} style={{ position: 'relative' }}>
          <button
            id="btn-role-switcher"
            onClick={() => {
              setRoleMenuOpen((v) => !v);
              setSchoolMenuOpen(false);
              setSquadMenuOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: '8px',
              border: `1px solid ${D.border}`,
              background: D.isDark ? '#151e2e' : '#f1f5f9',
              color: D.textPrimary,
              fontFamily: D.body,
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'border-color 0.15s ease',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: currentRoleMeta.color,
                flexShrink: 0,
              }}
            />
            <span className="hidden sm:inline">{currentRoleMeta.label}</span>
            <ChevronDown size={12} color={D.textMuted} />
          </button>

          {roleMenuOpen && (
            <div
              id="dropdown-roles"
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                zIndex: 100,
                width: '240px',
                maxHeight: '340px',
                overflowY: 'auto',
                background: D.surf0,
                border: `1px solid ${D.borderMed}`,
                borderRadius: '12px',
                boxShadow: D.isDark ? '0 12px 30px rgba(0,0,0,0.5)' : '0 10px 25px rgba(0,0,0,0.08)',
                padding: '6px',
              }}
            >
              <div style={{ padding: '6px 10px', fontFamily: D.mono, fontSize: '10px', textTransform: 'uppercase', color: D.textMuted, fontWeight: 700, letterSpacing: '0.05em' }}>
                Role & Persona RBAC
              </div>
              {Object.entries(ROLES).map(([rKey, rMeta]) => {
                const isSelected = currentRole === rKey;
                return (
                  <button
                    key={rKey}
                    onClick={() => {
                      onSelectRole(rKey);
                      setRoleMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '7px 9px',
                      borderRadius: '6px',
                      border: 'none',
                      background: isSelected ? (D.isDark ? '#1e293b' : '#f1f5f9') : 'transparent',
                      color: isSelected ? rMeta.color : D.textPrimary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: isSelected ? 700 : 500,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: rMeta.color,
                          flexShrink: 0,
                        }}
                      />
                      <span>{rMeta.label}</span>
                    </div>
                    {isSelected && <Check size={13} color={rMeta.color} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Tactical Signals Toggle */}
        <button
          id="btn-ai-signals"
          onClick={onOpenIntelligenceDrawer}
          title="SCRBRD AI Tactical Signals"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            border: `1px solid ${D.border}`,
            background: 'transparent',
            color: D.textSecondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
            transition: 'color 0.15s ease, background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = D.indigo;
            e.currentTarget.style.background = D.isDark ? '#151e2e' : '#f1f5f9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = D.textSecondary;
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <Sparkles size={16} />
        </button>

        {/* Notifications Icon with Badge */}
        <button
          id="btn-notifications"
          onClick={onOpenNotifications}
          title="Notifications & System Alerts"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            border: `1px solid ${D.border}`,
            background: 'transparent',
            color: D.textSecondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
            transition: 'color 0.15s ease, background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = D.textPrimary;
            e.currentTarget.style.background = D.isDark ? '#151e2e' : '#f1f5f9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = D.textSecondary;
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <Bell size={16} />
          {unreadNotificationsCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                minWidth: '15px',
                height: '15px',
                padding: '0 3px',
                borderRadius: '999px',
                background: D.rose,
                color: '#ffffff',
                fontFamily: D.mono,
                fontSize: '9px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Density Toggle */}
        <button
          id="btn-density-toggle"
          onClick={onToggleDensity}
          title={`Switch density: Currently ${isCompactDensity ? 'Compact' : 'Standard'}`}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            border: `1px solid ${D.border}`,
            background: isCompactDensity ? (D.isDark ? '#151e2e' : '#f1f5f9') : 'transparent',
            color: isCompactDensity ? D.indigo : D.textSecondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <SlidersHorizontal size={15} />
        </button>

        {/* Theme Toggle */}
        <button
          id="btn-theme-toggle"
          onClick={onToggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            border: `1px solid ${D.border}`,
            background: 'transparent',
            color: D.textSecondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'color 0.15s ease, background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = D.textPrimary;
            e.currentTarget.style.background = D.isDark ? '#151e2e' : '#f1f5f9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = D.textSecondary;
            e.currentTarget.style.background = 'transparent';
          }}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Primary CTA: Launch Scorer */}
        <button
          id="btn-launch-scorer-header"
          onClick={onLaunchScorer}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 13px',
            borderRadius: '8px',
            border: 'none',
            background: D.emerald,
            color: '#ffffff',
            fontFamily: D.body,
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          <Radio size={14} />
          <span>Live Scorer</span>
        </button>
      </div>
    </header>
  );
}
