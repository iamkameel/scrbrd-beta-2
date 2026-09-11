'use client';

import React, { useState } from 'react';
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
  Users,
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

  return (
    <header
      style={{
        height: isCompactDensity ? '56px' : '64px',
        background: D.isDark ? 'rgba(10, 15, 29, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${D.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        transition: 'height 0.15s ease',
      }}
    >
      {/* Left side: Hamburger (mobile) + Breadcrumbs & Context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onToggleMobileNav}
          className="md:hidden"
          style={{
            background: 'transparent',
            border: 'none',
            color: D.textPrimary,
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Menu size={20} />
        </button>

        {/* M3 Tonal Breadcrumb trail */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontFamily: D.body }}>
          <span style={{ fontWeight: 700, color: schoolPrimary, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{activeSchool.crestIcon}</span>
            <span>{activeSchool.shortName}</span>
          </span>

          <span style={{ color: D.textMuted }}>/</span>

          {/* Squad context chip */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setSquadMenuOpen(!squadMenuOpen);
                setSchoolMenuOpen(false);
                setRoleMenuOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '8px',
                background: D.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
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
                style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  zIndex: 100,
                  width: '130px',
                  background: D.isDark ? '#0f172a' : '#ffffff',
                  border: `1px solid ${D.borderMed}`,
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                  padding: '6px',
                }}
              >
                {squadOptions.map((sq) => (
                  <button
                    key={sq.id}
                    onClick={() => {
                      onSelectSquad(sq.id);
                      setSquadMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: selectedSquadId === sq.id ? `${D.indigo}20` : 'transparent',
                      color: selectedSquadId === sq.id ? D.indigo : D.textPrimary,
                      fontFamily: D.mono,
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>{sq.label}</span>
                    {selectedSquadId === sq.id && <Check size={12} color={D.indigo} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span style={{ color: D.textMuted }}>/</span>

          <span style={{ color: D.textPrimary, fontWeight: 700 }}>
            {NAV_META[currentPage]?.label || currentPage}
          </span>
        </div>
      </div>

      {/* Center: Command Palette Trigger Input (Desktop) */}
      <div className="hidden lg:flex" style={{ flex: 1, maxWidth: '420px', margin: '0 20px' }}>
        <button
          onClick={onOpenCommandPalette}
          style={{
            width: '100%',
            height: '38px',
            padding: '0 14px',
            borderRadius: '12px',
            border: `1px solid ${D.border}`,
            background: D.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            color: D.textMuted,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            fontFamily: D.body,
            fontSize: '13px',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = D.borderMed;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = D.border;
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={15} color={D.textMuted} />
            Search matches, athletes, pitches or stats...
          </span>
          <kbd
            style={{
              fontSize: '10px',
              fontFamily: D.mono,
              padding: '2px 6px',
              borderRadius: '6px',
              background: D.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
              color: D.textSecondary,
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Action Cluster */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* School Switcher Pill */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setSchoolMenuOpen(!schoolMenuOpen);
              setRoleMenuOpen(false);
              setSquadMenuOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '999px',
              border: `1px solid ${D.border}`,
              background: D.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
              color: D.textPrimary,
              fontFamily: D.body,
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Building size={13} color={schoolPrimary} />
            <span className="hidden sm:inline">{activeSchool.shortName}</span>
            <ChevronDown size={12} color={D.textMuted} />
          </button>

          {schoolMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                zIndex: 100,
                width: '260px',
                background: D.isDark ? '#0f172a' : '#ffffff',
                border: `1px solid ${D.borderMed}`,
                borderRadius: '16px',
                boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
                padding: '8px',
              }}
            >
              <div style={{ padding: '6px 10px', fontFamily: D.mono, fontSize: '10px', textTransform: 'uppercase', color: D.textMuted, fontWeight: 700 }}>
                Select Active Institution
              </div>
              {Object.values(SCHOOLS_REGISTRY).map((school) => (
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
                    borderRadius: '10px',
                    border: 'none',
                    background: activeSchool.id === school.id ? `${D.indigo}15` : 'transparent',
                    color: activeSchool.id === school.id ? D.indigo : D.textPrimary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{school.crestIcon}</span>
                    <span style={{ fontWeight: 600 }}>{school.name}</span>
                  </div>
                  {activeSchool.id === school.id && <Check size={14} color={D.indigo} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Role Switcher Pill */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setRoleMenuOpen(!roleMenuOpen);
              setSchoolMenuOpen(false);
              setSquadMenuOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '999px',
              border: `1px solid ${currentRoleMeta.color}40`,
              background: `${currentRoleMeta.color}15`,
              color: currentRoleMeta.color,
              fontFamily: D.body,
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <ShieldCheck size={13} />
            <span>{currentRoleMeta.label}</span>
            <ChevronDown size={12} />
          </button>

          {roleMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                zIndex: 100,
                width: '240px',
                maxHeight: '340px',
                overflowY: 'auto',
                background: D.isDark ? '#0f172a' : '#ffffff',
                border: `1px solid ${D.borderMed}`,
                borderRadius: '16px',
                boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
                padding: '8px',
              }}
            >
              <div style={{ padding: '6px 10px', fontFamily: D.mono, fontSize: '10px', textTransform: 'uppercase', color: D.textMuted, fontWeight: 700 }}>
                Switch Role Persona
              </div>
              {Object.entries(ROLES).map(([rKey, rMeta]) => (
                <button
                  key={rKey}
                  onClick={() => {
                    onSelectRole(rKey);
                    setRoleMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: currentRole === rKey ? `${rMeta.color}20` : 'transparent',
                    color: currentRole === rKey ? rMeta.color : D.textPrimary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: rMeta.color,
                      }}
                    />
                    <span>{rMeta.label}</span>
                  </div>
                  {currentRole === rKey && <Check size={14} color={rMeta.color} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live Match Pulsing Button */}
        {liveMatchCount > 0 && (
          <button
            onClick={onLaunchScorer}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '999px',
              border: `1px solid ${D.emerald}50`,
              background: `${D.emerald}18`,
              color: D.emerald,
              fontFamily: D.mono,
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
            title="Launch Authoritative Scorer Hub"
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: D.emerald,
                animation: 'pulse 1.5s infinite',
              }}
            />
            <span>LIVE SCORER</span>
          </button>
        )}

        {/* AI Intelligence Drawer Toggle */}
        <button
          onClick={onOpenIntelligenceDrawer}
          title="Open SCRBRD Intelligence Signals"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            border: `1px solid ${D.indigo}40`,
            background: `${D.indigo}15`,
            color: D.indigo,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <Sparkles size={17} />
          <span
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: D.indigo,
            }}
          />
        </button>

        {/* Density Toggle (Comfortable vs Compact) */}
        <button
          onClick={onToggleDensity}
          title={`Switch density: Currently ${isCompactDensity ? 'Compact' : 'Comfortable'}`}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            border: `1px solid ${D.border}`,
            background: isCompactDensity ? `${D.sky}20` : 'transparent',
            color: isCompactDensity ? D.sky : D.textMuted,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <SlidersHorizontal size={16} />
        </button>

        {/* Notifications Icon with Badge */}
        <button
          onClick={onOpenNotifications}
          title="View Action Center & Notifications"
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
            position: 'relative',
          }}
        >
          <Bell size={17} />
          {unreadNotificationsCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                minWidth: '16px',
                height: '16px',
                padding: '0 4px',
                borderRadius: '8px',
                background: D.amber,
                color: '#000',
                fontFamily: D.mono,
                fontSize: '9px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
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
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
}
