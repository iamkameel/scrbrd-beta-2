'use client';

import React, { useState } from 'react';
import {
  DETAILED_SCHOOLS,
  SCHOOL_SPORT_PROGRAMMES,
  SCHOOL_ROLE_ASSIGNMENTS,
  SCHOOL_FACILITIES,
  PROGRAMME_STRENGTH_MATRICES,
  LONGITUDINAL_STRENGTH,
  SCHOOL_RIVALRIES,
  SCHOOL_HONOURS,
  SCHOOL_RECORDS,
  SCHOOL_SPONSORS,
  getSchoolDerivedStats,
  SchoolEntity,
} from './schoolProfileData';
import { MATCHES, PLAYERS, DERBY_RECORDS } from './data';
import { getSchoolSquads } from './multiSquadData';
import { Theme } from './types';

interface SchoolProfileViewProps {
  theme: Theme;
  schoolId: string;
  role: string;
  onSelectSchool?: (schoolId: string) => void;
  onOpenScorecard?: (matchId: string) => void;
  onOpenPlayerProfile?: (playerId: string) => void;
  onNavigateToRegister?: () => void;
  onUpdateSchool?: (updatedSchool: Partial<SchoolEntity>) => void;
}

export const SchoolProfileView: React.FC<SchoolProfileViewProps> = ({
  theme: D,
  schoolId,
  role,
  onSelectSchool,
  onOpenScorecard,
  onOpenPlayerProfile,
  onNavigateToRegister,
  onUpdateSchool,
}) => {
  // Active states
  const [selectedSeason, setSelectedSeason] = useState<string>("2026");
  const [selectedSquadFilter, setSelectedSquadFilter] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "programme"
    | "teams"
    | "performance"
    | "strength"
    | "pathway"
    | "fixtures"
    | "competitions"
    | "facilities"
    | "rivalries"
    | "honours"
    | "records"
    | "media"
    | "sponsors"
  >("overview");

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editActiveTab, setEditActiveTab] = useState<
    "identity" | "leadership" | "branding" | "facilities" | "rivalries" | "provenance"
  >("identity");

  // Selected school entity
  const school: SchoolEntity = DETAILED_SCHOOLS[schoolId] || DETAILED_SCHOOLS.WES;
  const derivedStats = getSchoolDerivedStats(school.id, selectedSeason, selectedSquadFilter);
  const programmes = SCHOOL_SPORT_PROGRAMMES[school.id] || SCHOOL_SPORT_PROGRAMMES.WES;
  const roleAssignments = SCHOOL_ROLE_ASSIGNMENTS[school.id] || SCHOOL_ROLE_ASSIGNMENTS.WES;
  const facilities = SCHOOL_FACILITIES[school.id] || SCHOOL_FACILITIES.WES;
  const strengthRadar = PROGRAMME_STRENGTH_MATRICES[school.id] || PROGRAMME_STRENGTH_MATRICES.WES;
  const longitudinal = LONGITUDINAL_STRENGTH[school.id] || LONGITUDINAL_STRENGTH.WES;
  const rivalries = SCHOOL_RIVALRIES[school.id] || SCHOOL_RIVALRIES.WES;
  const honours = SCHOOL_HONOURS[school.id] || SCHOOL_HONOURS.WES;
  const records = SCHOOL_RECORDS[school.id] || SCHOOL_RECORDS.WES;
  const sponsors = SCHOOL_SPONSORS[school.id] || SCHOOL_SPONSORS.WES;
  const squads = getSchoolSquads(school.id);
  const schoolPlayers = PLAYERS.filter(p => p.school === school.id);
  const schoolMatches = MATCHES.filter(
    m => m.schoolId === school.id || m.homeTeam.includes(school.shortCode) || m.awayTeam.includes(school.shortCode)
  );

  // Edit Form State
  const [editFormData, setEditFormData] = useState<Partial<SchoolEntity>>({
    officialName: school.officialName,
    displayName: school.displayName,
    shortCode: school.shortCode,
    emisNumber: school.emisNumber,
    foundedYear: school.foundedYear,
    schoolType: school.schoolType,
    dayBoarding: school.dayBoarding,
    motto: school.motto,
    mottoTranslation: school.mottoTranslation,
    biography: school.biography,
    website: school.website,
    crestIcon: school.crestIcon,
    primaryColour: school.primaryColour,
    secondaryColour: school.secondaryColour,
    address: school.address,
    suburb: school.suburb,
    city: school.city,
    province: school.province,
    regionId: school.regionId,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveEdit = () => {
    if (onUpdateSchool) {
      onUpdateSchool(editFormData);
    }
    showToast(`Institutional profile for ${editFormData.displayName || school.displayName} successfully updated.`);
    setEditModalOpen(false);
  };

  const schoolPrimary = school.primaryColour || D.indigo;
  const schoolSecondary = school.secondaryColour || D.amber;

  // Head of Cricket lookup from relational assignments
  const headOfCricket = roleAssignments.find(r => r.roleKey === "head_of_cricket") || roleAssignments[0];
  const directorOfSport = roleAssignments.find(r => r.roleKey === "director_of_sport");
  const headCoach1stXI = roleAssignments.find(r => r.roleKey === "1st_xi_head_coach");
  const mainFacility = facilities.find(f => f.tier === "Primary") || facilities[0];

  // RBAC Permission checks
  const canEditSchool = ["superadmin", "headmaster", "schooladmin"].includes(role);
  const canManageRoles = ["superadmin", "headmaster", "doc", "sportsmaster", "schooladmin"].includes(role);
  const isSuperAdmin = role === "superadmin";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", paddingBottom: "60px" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            background: D.surf0,
            border: `1px solid ${D.emerald}`,
            borderRadius: D.lg,
            padding: "12px 20px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            fontFamily: D.head,
            fontSize: "12px",
            fontWeight: 700,
            color: D.emerald,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>✓</span> {toastMessage}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. HERO & IDENTITY BANNER (STADIUM ATMOSPHERE)
      ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          borderRadius: D.xl,
          overflow: "hidden",
          border: `1px solid ${D.border}`,
          background: D.surf1,
          boxShadow: "0 8px 30px rgba(0,0,0,0.22)",
        }}
      >
        {/* Cover Photo / Stadium Atmosphere Backdrop */}
        <div
          style={{
            height: "180px",
            position: "relative",
            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(10,12,16,0.92) 100%), url(${school.coverImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
          }}
        >
          {/* Top Bar inside Cover */}
          <div style={{ position: "absolute", top: "14px", left: "16px", right: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={onNavigateToRegister}
                style={{
                  padding: "5px 12px",
                  borderRadius: D.pill,
                  background: "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(6px)",
                  border: `1px solid rgba(255,255,255,0.2)`,
                  color: "#fff",
                  fontFamily: D.head,
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                ← Back to Master Register
              </button>

              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: D.pill,
                  background: "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(6px)",
                  border: `1px solid rgba(255,255,255,0.15)`,
                  color: "#e2e8f0",
                  fontFamily: D.mono,
                  fontSize: "10px",
                  fontWeight: 700,
                }}
              >
                EMIS: {school.emisNumber}
              </span>
            </div>

            {/* Quick School Switcher */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <select
                value={school.id}
                onChange={e => onSelectSchool && onSelectSchool(e.target.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: D.pill,
                  background: "rgba(0,0,0,0.75)",
                  backdropFilter: "blur(8px)",
                  border: `1px solid ${schoolPrimary}88`,
                  color: "#fff",
                  fontFamily: D.head,
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {Object.values(DETAILED_SCHOOLS).map(s => (
                  <option key={s.id} value={s.id} style={{ background: "#111", color: "#fff" }}>
                    {s.crestIcon} {s.displayName} ({s.shortCode})
                  </option>
                ))}
              </select>

              {canEditSchool && (
                <button
                  onClick={() => setEditModalOpen(true)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: D.pill,
                    background: schoolPrimary,
                    border: "none",
                    color: "#fff",
                    fontFamily: D.head,
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: `0 2px 10px ${schoolPrimary}44`,
                  }}
                >
                  ⚙️ Edit School Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Identity Row (Overlapping avatar) */}
        <div style={{ padding: "0 24px 20px 24px", position: "relative", marginTop: "-48px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            {/* Crest + Names */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: "18px" }}>
              <div
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: D.lg,
                  background: D.surf0,
                  border: `3px solid ${schoolPrimary}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "44px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                  flexShrink: 0,
                }}
              >
                {school.crestIcon}
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <h1 style={{ fontFamily: D.head, fontSize: "24px", fontWeight: 900, color: D.textPrimary, margin: 0 }}>
                    {school.officialName.toUpperCase()}
                  </h1>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: D.pill,
                      background: `${schoolPrimary}25`,
                      border: `1px solid ${schoolPrimary}66`,
                      color: schoolPrimary,
                      fontFamily: D.mono,
                      fontSize: "11px",
                      fontWeight: 800,
                    }}
                  >
                    {school.shortCode}
                  </span>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: D.pill,
                      background: `${D.emerald}20`,
                      border: `1px solid ${D.emerald}55`,
                      color: D.emerald,
                      fontFamily: D.mono,
                      fontSize: "10px",
                      fontWeight: 700,
                    }}
                  >
                    ✓ Verified Entity
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "4px", flexWrap: "wrap" }}>
                  <span style={{ fontFamily: D.body, fontSize: "12px", color: D.textSecondary, fontStyle: "italic" }}>
                    &ldquo;{school.motto}&rdquo; {school.mottoTranslation ? `(${school.mottoTranslation})` : ""}
                  </span>
                  <span style={{ fontFamily: D.mono, fontSize: "11px", color: D.textMuted }}>•</span>
                  <span style={{ fontFamily: D.mono, fontSize: "11px", color: D.textMuted }}>Est. {school.foundedYear}</span>
                  <span style={{ fontFamily: D.mono, fontSize: "11px", color: D.textMuted }}>•</span>
                  <span style={{ fontFamily: D.mono, fontSize: "11px", color: D.textMuted }}>{school.suburb}, {school.city}</span>
                  <span style={{ fontFamily: D.mono, fontSize: "11px", color: D.textMuted }}>•</span>
                  <span style={{ fontFamily: D.mono, fontSize: "11px", color: D.textMuted }}>{school.schoolType} ({school.dayBoarding})</span>
                </div>
              </div>
            </div>

            {/* Quick Multi-Sport Selector & Share */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", background: D.surf2, padding: "3px", borderRadius: D.pill, border: `1px solid ${D.border}` }}>
                <button
                  style={{
                    padding: "4px 12px",
                    borderRadius: D.pill,
                    background: schoolPrimary,
                    border: "none",
                    color: "#fff",
                    fontFamily: D.head,
                    fontSize: "11px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  🏏 Cricket (Active)
                </button>
                <button
                  onClick={() => showToast("Multi-Sport Rugby module is queued in the SCRBRD roadmap.")}
                  style={{
                    padding: "4px 10px",
                    borderRadius: D.pill,
                    background: "transparent",
                    border: "none",
                    color: D.textMuted,
                    fontFamily: D.head,
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  🏉 Rugby
                </button>
                <button
                  onClick={() => showToast("Multi-Sport Water Polo module is queued in the SCRBRD roadmap.")}
                  style={{
                    padding: "4px 10px",
                    borderRadius: D.pill,
                    background: "transparent",
                    border: "none",
                    color: D.textMuted,
                    fontFamily: D.head,
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  🤽 Polo
                </button>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  showToast("Shareable institutional profile link copied to clipboard.");
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: D.pill,
                  background: D.surf2,
                  border: `1px solid ${D.border}`,
                  color: D.textPrimary,
                  fontFamily: D.head,
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                🔗 Share
              </button>
            </div>
          </div>

          {/* Contextual Perspective Bar */}
          <div
            style={{
              marginTop: "16px",
              padding: "8px 14px",
              borderRadius: D.md,
              background: `${schoolPrimary}10`,
              border: `1px solid ${schoolPrimary}25`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px" }}>👁️</span>
              <span style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700, color: D.textPrimary }}>
                Active Perspective: <strong style={{ color: schoolPrimary }}>{role.toUpperCase()} VIEW</strong>
              </span>
              <span style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted }}>
                — {isSuperAdmin ? "Full root provenance, telemetry audit, and relational schema management" : "Institutional high-performance analytics & verified records"}
              </span>
            </div>

            {/* Season & Squad Tier Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>Season:</span>
                <select
                  value={selectedSeason}
                  onChange={e => setSelectedSeason(e.target.value)}
                  style={{
                    padding: "3px 8px",
                    borderRadius: D.sm,
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    color: D.textPrimary,
                    fontFamily: D.mono,
                    fontSize: "11px",
                    fontWeight: 700,
                    outline: "none",
                  }}
                >
                  <option value="2026">2026 Season</option>
                  <option value="2025">2025 Season</option>
                  <option value="2024">2024 Season</option>
                  <option value="all_time">All-Time</option>
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>Tier:</span>
                <select
                  value={selectedSquadFilter}
                  onChange={e => setSelectedSquadFilter(e.target.value)}
                  style={{
                    padding: "3px 8px",
                    borderRadius: D.sm,
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    color: D.textPrimary,
                    fontFamily: D.mono,
                    fontSize: "11px",
                    fontWeight: 700,
                    outline: "none",
                  }}
                >
                  <option value="All">All Cricket (8 Squads)</option>
                  <option value="1st XI">1st XI Elite</option>
                  <option value="2nd XI">2nd XI Senior</option>
                  <option value="U16A">U16A Division</option>
                  <option value="U15A">U15A Division</option>
                  <option value="U14A">U14A Division</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. HORIZONTAL TAB NAVIGATION (14 SECTIONS)
        ───────────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            overflowX: "auto",
            borderTop: `1px solid ${D.border}`,
            background: D.surf0,
            padding: "0 12px",
            gap: "2px",
          }}
        >
          {[
            { id: "overview", label: "🏛️ Overview" },
            { id: "programme", label: "🏆 Leadership & Staff" },
            { id: "teams", label: "👥 Teams (8)" },
            { id: "performance", label: "📈 Performance" },
            { id: "strength", label: "⚡ Strength Matrix" },
            { id: "pathway", label: "🌲 Player Pathway" },
            { id: "fixtures", label: "📅 Fixtures & Results" },
            { id: "competitions", label: "🎖️ Competitions" },
            { id: "facilities", label: "🏟️ Facilities & Grounds" },
            { id: "rivalries", label: "⚔️ Rivalries & H2H" },
            { id: "honours", label: "📜 Honours & Archive" },
            { id: "records", label: "📊 Cricket Records" },
            { id: "media", label: "📰 Media & Reports" },
            { id: "sponsors", label: "🤝 Official Partners" },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: "10px 14px",
                  whiteSpace: "nowrap",
                  background: "transparent",
                  border: "none",
                  borderBottom: isActive ? `3px solid ${schoolPrimary}` : "3px solid transparent",
                  color: isActive ? D.textPrimary : D.textSecondary,
                  fontFamily: D.head,
                  fontSize: "12px",
                  fontWeight: isActive ? 800 : 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. TAB CONTENT SECTIONS
      ───────────────────────────────────────────────────────────── */}

      {/* ── TAB 1: OVERVIEW (EXECUTIVE DASHBOARD) ────────────────── */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Derived KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
            <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.lg, padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Active Cricketers
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: "26px", fontWeight: 800, color: D.sky, marginTop: "4px" }}>
                    {derivedStats.activePlayersCount}
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: "10px", color: D.textMuted, marginTop: "2px" }}>
                    🔵 Derived: 8 Squad Rosters
                  </div>
                </div>
                <span style={{ fontSize: "20px" }}>👥</span>
              </div>
            </div>

            <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.lg, padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Win Rate ({selectedSeason})
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: "26px", fontWeight: 800, color: D.emerald, marginTop: "4px" }}>
                    {derivedStats.winRate}
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: "10px", color: D.textMuted, marginTop: "2px" }}>
                    {derivedStats.wins}W · {derivedStats.losses}L · {derivedStats.draws}D (47 Matches)
                  </div>
                </div>
                <span style={{ fontSize: "20px" }}>📈</span>
              </div>
            </div>

            <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.lg, padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Provincial Reps
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: "26px", fontWeight: 800, color: D.violet, marginTop: "4px" }}>
                    {derivedStats.provincialReps} SA / KZN
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: "10px", color: D.textMuted, marginTop: "2px" }}>
                    Khaya Majola & U17 Coastal
                  </div>
                </div>
                <span style={{ fontSize: "20px" }}>🇿🇦</span>
              </div>
            </div>

            <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.lg, padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    1st XI Standing
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: "26px", fontWeight: 800, color: D.amber, marginTop: "4px" }}>
                    #4 in KZN
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: "10px", color: D.textMuted, marginTop: "2px" }}>
                    KZN Premier League 2026
                  </div>
                </div>
                <span style={{ fontSize: "20px" }}>🏆</span>
              </div>
            </div>

            <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.lg, padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Campus Facilities
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: "26px", fontWeight: 800, color: D.indigo, marginTop: "4px" }}>
                    {facilities.length} Turf Ovals
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: "10px", color: D.textMuted, marginTop: "2px" }}>
                    {mainFacility.name}
                  </div>
                </div>
                <span style={{ fontSize: "20px" }}>🏟️</span>
              </div>
            </div>
          </div>

          {/* Grid Layout: Programme Leadership & Next Match */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {/* Programme Leadership Card */}
            <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.lg, padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <h3 style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                  🏆 Cricket Directorate & Leadership
                </h3>
                <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>
                  Relational Lookups
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", borderRadius: D.md, background: D.surf2 }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: `${schoolPrimary}22`, color: schoolPrimary, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: D.head, fontWeight: 800, fontSize: "14px" }}>
                    WS
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: D.head, fontSize: "12px", fontWeight: 700, color: D.textPrimary }}>
                        {headOfCricket.personName}
                      </span>
                      <span style={{ fontFamily: D.mono, fontSize: "9px", padding: "1px 6px", borderRadius: D.pill, background: `${schoolPrimary}20`, color: schoolPrimary }}>
                        {headOfCricket.roleTitle}
                      </span>
                    </div>
                    <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, marginTop: "2px" }}>
                      {headOfCricket.qualifications.join(" · ")}
                    </div>
                  </div>
                </div>

                {directorOfSport && (
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", borderRadius: D.md, background: D.surf2 }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: `${D.indigo}22`, color: D.indigo, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: D.head, fontWeight: 800, fontSize: "14px" }}>
                      TS
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontFamily: D.head, fontSize: "12px", fontWeight: 700, color: D.textPrimary }}>
                          {directorOfSport.personName}
                        </span>
                        <span style={{ fontFamily: D.mono, fontSize: "9px", padding: "1px 6px", borderRadius: D.pill, background: `${D.indigo}20`, color: D.indigo }}>
                          {directorOfSport.roleTitle}
                        </span>
                      </div>
                      <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, marginTop: "2px" }}>
                        {directorOfSport.qualifications.join(" · ")}
                      </div>
                    </div>
                  </div>
                )}

                {headCoach1stXI && (
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", borderRadius: D.md, background: D.surf2 }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: `${D.emerald}22`, color: D.emerald, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: D.head, fontWeight: 800, fontSize: "14px" }}>
                      DD
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontFamily: D.head, fontSize: "12px", fontWeight: 700, color: D.textPrimary }}>
                          {headCoach1stXI.personName}
                        </span>
                        <span style={{ fontFamily: D.mono, fontSize: "9px", padding: "1px 6px", borderRadius: D.pill, background: `${D.emerald}20`, color: D.emerald }}>
                          {headCoach1stXI.roleTitle}
                        </span>
                      </div>
                      <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, marginTop: "2px" }}>
                        {headCoach1stXI.qualifications.join(" · ")}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Next Fixture & Live Form Card */}
            <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.lg, padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <h3 style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                  🏏 Next Major Match & Recent Form
                </h3>
                <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.emerald }}>
                  ● 1st XI Fixture
                </span>
              </div>

              {/* Next Fixture Box */}
              <div style={{ padding: "14px", borderRadius: D.md, background: `${schoolPrimary}12`, border: `1px solid ${schoolPrimary}33`, marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 800, color: schoolPrimary, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Next Saturday Clash
                  </span>
                  <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>
                    Saturday 09:30 SAST
                  </span>
                </div>
                <div style={{ fontFamily: D.head, fontSize: "16px", fontWeight: 800, color: D.textPrimary, marginTop: "6px" }}>
                  {school.displayName} 1st XI vs Durban High School (DHS)
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "6px", fontFamily: D.mono, fontSize: "11px", color: D.textSecondary }}>
                  <span>🏟️ {mainFacility.name} (Home)</span>
                  <span>•</span>
                  <span>50-Over Limited Overs</span>
                  <span>•</span>
                  <span style={{ color: D.emerald }}>Pitch: True Hard Bounce</span>
                </div>
              </div>

              {/* 5-Match Form Ticker */}
              <div>
                <span style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700, color: D.textMuted }}>
                  Recent 5-Match Form (1st XI):
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                  {derivedStats.form.map((res, i) => (
                    <div
                      key={i}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: D.md,
                        background: res === "W" ? `${D.emerald}25` : res === "L" ? `${D.rose}25` : `${D.amber}25`,
                        border: `1px solid ${res === "W" ? D.emerald : res === "L" ? D.rose : D.amber}`,
                        color: res === "W" ? D.emerald : res === "L" ? D.rose : D.amber,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: D.mono,
                        fontSize: "13px",
                        fontWeight: 900,
                      }}
                    >
                      {res}
                    </div>
                  ))}
                  <span style={{ fontFamily: D.body, fontSize: "11px", color: D.textSecondary, marginLeft: "8px" }}>
                    Wins vs Kearsney (37r), Clifton (6w), Northwood (4w)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Institutional Biography & Grounds Summary */}
          <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.lg, padding: "20px" }}>
            <h3 style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 800, color: D.textPrimary, margin: "0 0 8px 0" }}>
              🏛️ Institutional Sporting Biography
            </h3>
            <p style={{ fontFamily: D.body, fontSize: "13px", color: D.textSecondary, lineHeight: 1.6, margin: 0 }}>
              {school.biography}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "14px", paddingTop: "14px", borderTop: `1px solid ${D.border}`, flexWrap: "wrap" }}>
              <span style={{ fontFamily: D.mono, fontSize: "11px", color: D.textMuted }}>
                <strong>Official Website:</strong> <a href={school.website} target="_blank" rel="noreferrer" style={{ color: schoolPrimary }}>{school.website}</a>
              </span>
              <span style={{ fontFamily: D.mono, fontSize: "11px", color: D.textMuted }}>
                <strong>Campus Address:</strong> {school.address}, {school.suburb}, {school.city}
              </span>
              <span style={{ fontFamily: D.mono, fontSize: "11px", color: D.textMuted }}>
                <strong>GPS Coords:</strong> {school.latitude}, {school.longitude}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: CRICKET PROGRAMME & LEADERSHIP ────────────────── */}
      {activeTab === "programme" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontFamily: D.head, fontSize: "18px", fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                🏆 Cricket Programme Leadership & Staff Taxonomy
              </h2>
              <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted, marginTop: "2px" }}>
                Relational staff assignments across coaching, sports science, telemetry analytics, and age-group coordinators
              </div>
            </div>

            {canManageRoles && (
              <button
                onClick={() => showToast("Role assignment creation workflow opened for institutional admin.")}
                style={{
                  padding: "6px 14px",
                  borderRadius: D.pill,
                  background: schoolPrimary,
                  border: "none",
                  color: "#fff",
                  fontFamily: D.head,
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                + Add Staff Assignment
              </button>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "14px" }}>
            {roleAssignments.map(sra => (
              <div
                key={sra.id}
                style={{
                  background: D.surf1,
                  border: `1px solid ${D.border}`,
                  borderRadius: D.lg,
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: D.pill,
                          background: `${schoolPrimary}20`,
                          color: schoolPrimary,
                          fontFamily: D.mono,
                          fontSize: "10px",
                          fontWeight: 700,
                        }}
                      >
                        {sra.roleTitle}
                      </span>
                      <h4 style={{ fontFamily: D.head, fontSize: "15px", fontWeight: 800, color: D.textPrimary, marginTop: "6px", margin: "6px 0 2px 0" }}>
                        {sra.personName}
                      </h4>
                      <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>
                        {sra.department} · Tenure: {sra.tenureStart}–Present
                      </span>
                    </div>
                    <span style={{ fontSize: "22px" }}>👤</span>
                  </div>

                  {sra.bio && (
                    <p style={{ fontFamily: D.body, fontSize: "11px", color: D.textSecondary, lineHeight: 1.4, margin: "10px 0" }}>
                      {sra.bio}
                    </p>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "10px" }}>
                    <div style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, textTransform: "uppercase" }}>
                      Qualifications & Badges:
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {sra.qualifications.map((q, idx) => (
                        <span key={idx} style={{ padding: "2px 6px", borderRadius: D.sm, background: D.surf2, color: D.textSecondary, fontFamily: D.mono, fontSize: "10px" }}>
                          ✓ {q}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {sra.email && (
                  <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: `1px solid ${D.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>
                      📧 {sra.email}
                    </span>
                    <span style={{ fontFamily: D.mono, fontSize: "9px", color: D.emerald, fontWeight: 700 }}>
                      ● Active Lease
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: TEAMS (2026 SEASON) ───────────────────────────── */}
      {activeTab === "teams" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontFamily: D.head, fontSize: "18px", fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                👥 Active Cricket Squads (8 Registered Tiers)
              </h2>
              <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted, marginTop: "2px" }}>
                Canonical team hierarchy from 1st XI Open through U14 Transition age groups
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
            {squads.map(squad => {
              const squadPlayerList = schoolPlayers.filter(p => p.team === squad.name || p.squadName === squad.name);
              const count = squadPlayerList.length || 14;
              return (
                <div
                  key={squad.id}
                  style={{
                    background: D.surf1,
                    border: `1px solid ${D.border}`,
                    borderRadius: D.lg,
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: D.pill,
                          background: squad.division === "Open" ? `${D.emerald}20` : `${D.sky}20`,
                          color: squad.division === "Open" ? D.emerald : D.sky,
                          fontFamily: D.mono,
                          fontSize: "10px",
                          fontWeight: 700,
                        }}
                      >
                        {squad.division} Division
                      </span>
                      <span style={{ fontFamily: D.mono, fontSize: "11px", color: D.textMuted }}>
                        Class #{squad.classRank}
                      </span>
                    </div>

                    <h3 style={{ fontFamily: D.head, fontSize: "16px", fontWeight: 800, color: D.textPrimary, marginTop: "8px", margin: "8px 0 2px 0" }}>
                      {squad.name}
                    </h3>
                    <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted }}>
                      Head Coach: <strong>{squad.headCoachName}</strong>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "12px", padding: "8px 10px", borderRadius: D.md, background: D.surf2 }}>
                      <div>
                        <div style={{ fontFamily: D.mono, fontSize: "14px", fontWeight: 800, color: D.textPrimary }}>
                          {count}
                        </div>
                        <div style={{ fontFamily: D.body, fontSize: "9px", color: D.textMuted }}>
                          Roster Count
                        </div>
                      </div>
                      <div style={{ width: "1px", height: "20px", background: D.border }} />
                      <div>
                        <div style={{ fontFamily: D.mono, fontSize: "14px", fontWeight: 800, color: D.emerald }}>
                          {squad.division === "Open" ? "82%" : "75%"}
                        </div>
                        <div style={{ fontFamily: D.body, fontSize: "9px", color: D.textMuted }}>
                          Win Rate
                        </div>
                      </div>
                      <div style={{ width: "1px", height: "20px", background: D.border }} />
                      <div>
                        <div style={{ fontFamily: D.mono, fontSize: "14px", fontWeight: 800, color: D.amber }}>
                          {squad.division === "Open" ? "P14 W11" : "P12 W9"}
                        </div>
                        <div style={{ fontFamily: D.body, fontSize: "9px", color: D.textMuted }}>
                          Record
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: "14px", display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => showToast(`Opening active roster sheet for ${squad.name}.`)}
                      style={{
                        flex: 1,
                        padding: "5px 10px",
                        borderRadius: D.pill,
                        background: D.surf2,
                        border: `1px solid ${D.border}`,
                        color: D.textPrimary,
                        fontFamily: D.head,
                        fontSize: "11px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      View Squad Roster →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 4: PERFORMANCE INTELLIGENCE ──────────────────────── */}
      {activeTab === "performance" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h2 style={{ fontFamily: D.head, fontSize: "18px", fontWeight: 800, color: D.textPrimary, margin: 0 }}>
              📈 Performance Intelligence & Scoring Telemetry
            </h2>
            <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted, marginTop: "2px" }}>
              Calculated phase-by-phase run rates, dismissal breakdowns, and key performance leaders
            </div>
          </div>

          {/* Leaders Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
            <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.lg, padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700, color: D.sky, textTransform: "uppercase" }}>
                  🏏 Leading Run Scorer ({selectedSeason})
                </span>
                <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>1st XI</span>
              </div>
              <div style={{ fontFamily: D.head, fontSize: "18px", fontWeight: 800, color: D.textPrimary }}>
                {derivedStats.topRunScorer.name}
              </div>
              <div style={{ display: "flex", gap: "14px", marginTop: "8px", fontFamily: D.mono, fontSize: "12px" }}>
                <div><span style={{ color: D.textMuted }}>Runs:</span> <strong style={{ color: D.sky }}>{derivedStats.topRunScorer.runs}</strong></div>
                <div><span style={{ color: D.textMuted }}>Avg:</span> <strong>{derivedStats.topRunScorer.avg}</strong></div>
                <div><span style={{ color: D.textMuted }}>SR:</span> <strong>{derivedStats.topRunScorer.sr}</strong></div>
              </div>
            </div>

            <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.lg, padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700, color: D.emerald, textTransform: "uppercase" }}>
                  🎯 Leading Wicket Taker ({selectedSeason})
                </span>
                <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>1st XI</span>
              </div>
              <div style={{ fontFamily: D.head, fontSize: "18px", fontWeight: 800, color: D.textPrimary }}>
                {derivedStats.leadingWicketTaker.name}
              </div>
              <div style={{ display: "flex", gap: "14px", marginTop: "8px", fontFamily: D.mono, fontSize: "12px" }}>
                <div><span style={{ color: D.textMuted }}>Wkts:</span> <strong style={{ color: D.emerald }}>{derivedStats.leadingWicketTaker.wickets}</strong></div>
                <div><span style={{ color: D.textMuted }}>Avg:</span> <strong>{derivedStats.leadingWicketTaker.avg}</strong></div>
                <div><span style={{ color: D.textMuted }}>Econ:</span> <strong>{derivedStats.leadingWicketTaker.econ}</strong></div>
              </div>
            </div>

            <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.lg, padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700, color: D.amber, textTransform: "uppercase" }}>
                  ⚡ Boundary & Scoring Zones
                </span>
                <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>Telemetry</span>
              </div>
              <div style={{ fontFamily: D.head, fontSize: "18px", fontWeight: 800, color: D.textPrimary }}>
                56.4% Boundary Ratio
              </div>
              <div style={{ display: "flex", gap: "14px", marginTop: "8px", fontFamily: D.mono, fontSize: "12px" }}>
                <div><span style={{ color: D.textMuted }}>Off-side:</span> <strong>62%</strong></div>
                <div><span style={{ color: D.textMuted }}>Leg-side:</span> <strong>38%</strong></div>
                <div><span style={{ color: D.textMuted }}>Dot %:</span> <strong>44.8%</strong></div>
              </div>
            </div>
          </div>

          {/* Phase Scoring Analysis */}
          <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.lg, padding: "20px" }}>
            <h3 style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 800, color: D.textPrimary, margin: "0 0 14px 0" }}>
              ⏱️ Phase Scoring Dynamics (50-Over Matches)
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              <div style={{ padding: "12px", borderRadius: D.md, background: D.surf2 }}>
                <div style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700, color: D.sky }}>Powerplay (Overs 1–10)</div>
                <div style={{ fontFamily: D.mono, fontSize: "20px", fontWeight: 800, color: D.textPrimary, marginTop: "4px" }}>6.42 RPO</div>
                <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, marginTop: "2px" }}>Avg Loss: 1.1 Wickets</div>
              </div>

              <div style={{ padding: "12px", borderRadius: D.md, background: D.surf2 }}>
                <div style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700, color: D.amber }}>Middle Overs (Overs 11–40)</div>
                <div style={{ fontFamily: D.mono, fontSize: "20px", fontWeight: 800, color: D.textPrimary, marginTop: "4px" }}>4.88 RPO</div>
                <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, marginTop: "2px" }}>Strike Rotation: 78.4%</div>
              </div>

              <div style={{ padding: "12px", borderRadius: D.md, background: D.surf2 }}>
                <div style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700, color: D.emerald }}>Death Overs (Overs 41–50)</div>
                <div style={{ fontFamily: D.mono, fontSize: "20px", fontWeight: 800, color: D.textPrimary, marginTop: "4px" }}>8.64 RPO</div>
                <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, marginTop: "2px" }}>Boundary Rate: 1 every 3.8 balls</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: SCHOOL STRENGTH MATRIX ────────────────────────── */}
      {activeTab === "strength" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h2 style={{ fontFamily: D.head, fontSize: "18px", fontWeight: 800, color: D.textPrimary, margin: 0 }}>
              ⚡ 8-Metric Programme Strength Matrix & Benchmark
            </h2>
            <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted, marginTop: "2px" }}>
              Algorithmic ratings (0–100) benchmarked against premier KwaZulu-Natal schoolboy ecosystems
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {/* Strength Dimensions Bar Chart */}
            <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.lg, padding: "20px" }}>
              <h3 style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 800, color: D.textPrimary, margin: "0 0 16px 0" }}>
                📊 Dimension Breakdown
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { label: "Fast Bowling Attack", val: strengthRadar.fastBowling, color: D.rose },
                  { label: "Overall Squad Player Depth", val: strengthRadar.playerDepth, color: D.sky },
                  { label: "Powerplay Batting Execution", val: strengthRadar.powerplayBatting, color: D.amber },
                  { label: "Wicketkeeping Standards", val: strengthRadar.wicketkeeping, color: D.violet },
                  { label: "Ground Fielding & Catches", val: strengthRadar.fielding, color: D.emerald },
                  { label: "Batting Depth (Tiers 1–4)", val: strengthRadar.battingDepth, color: D.indigo },
                  { label: "Death Overs Bowling", val: strengthRadar.deathBowling, color: D.rose },
                  { label: "Spin Bowling Variations", val: strengthRadar.spinBowling, color: D.teal || D.emerald },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: D.head, fontSize: "11px", fontWeight: 700, color: D.textPrimary, marginBottom: "4px" }}>
                      <span>{item.label}</span>
                      <span style={{ fontFamily: D.mono, color: item.color }}>{item.val} / 100</span>
                    </div>
                    <div style={{ height: "8px", background: D.surf2, borderRadius: D.pill, overflow: "hidden" }}>
                      <div style={{ width: `${item.val}%`, height: "100%", background: item.color, borderRadius: D.pill }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Longitudinal Trend (2022–2026) */}
            <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.lg, padding: "20px" }}>
              <h3 style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 800, color: D.textPrimary, margin: "0 0 16px 0" }}>
                📈 5-Year Longitudinal Progression
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {longitudinal.map(row => (
                  <div key={row.year} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px", borderRadius: D.md, background: D.surf2 }}>
                    <div>
                      <span style={{ fontFamily: D.mono, fontSize: "13px", fontWeight: 800, color: D.textPrimary }}>
                        {row.year} Season
                      </span>
                      <div style={{ fontFamily: D.body, fontSize: "10px", color: D.textMuted, marginTop: "2px" }}>
                        {row.provincialReps} Provincial Reps · {row.winRate}% Win Rate
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontFamily: D.mono, fontSize: "16px", fontWeight: 900, color: schoolPrimary }}>
                        {row.rating}
                      </span>
                      <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 6: PLAYER PATHWAY & DEVELOPMENT ──────────────────── */}
      {activeTab === "pathway" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h2 style={{ fontFamily: D.head, fontSize: "18px", fontWeight: 800, color: D.textPrimary, margin: 0 }}>
              🌲 Player Pathway & Representative Tracking
            </h2>
            <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted, marginTop: "2px" }}>
              Development pipeline from junior intake through senior provincial and international caps
            </div>
          </div>

          {/* Pathway Stage Funnel */}
          <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.lg, padding: "20px" }}>
            <h3 style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 800, color: D.textPrimary, margin: "0 0 16px 0" }}>
              🏉 Pipeline Stages (2026 Cohort)
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
              <div style={{ padding: "12px", borderRadius: D.md, background: `${D.sky}15`, border: `1px solid ${D.sky}44`, textAlign: "center" }}>
                <div style={{ fontFamily: D.mono, fontSize: "20px", fontWeight: 900, color: D.sky }}>14</div>
                <div style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 800, color: D.textPrimary, marginTop: "4px" }}>U14 Intake</div>
                <div style={{ fontFamily: D.body, fontSize: "9px", color: D.textMuted }}>Foundation</div>
              </div>

              <div style={{ padding: "12px", borderRadius: D.md, background: `${D.sky}25`, border: `1px solid ${D.sky}55`, textAlign: "center" }}>
                <div style={{ fontFamily: D.mono, fontSize: "20px", fontWeight: 900, color: D.sky }}>12</div>
                <div style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 800, color: D.textPrimary, marginTop: "4px" }}>U15 Academy</div>
                <div style={{ fontFamily: D.body, fontSize: "9px", color: D.textMuted }}>Skill Acceleration</div>
              </div>

              <div style={{ padding: "12px", borderRadius: D.md, background: `${D.indigo}25`, border: `1px solid ${D.indigo}55`, textAlign: "center" }}>
                <div style={{ fontFamily: D.mono, fontSize: "20px", fontWeight: 900, color: D.indigo }}>11</div>
                <div style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 800, color: D.textPrimary, marginTop: "4px" }}>U16 Division</div>
                <div style={{ fontFamily: D.body, fontSize: "9px", color: D.textMuted }}>High Performance</div>
              </div>

              <div style={{ padding: "12px", borderRadius: D.md, background: `${schoolPrimary}25`, border: `1px solid ${schoolPrimary}66`, textAlign: "center" }}>
                <div style={{ fontFamily: D.mono, fontSize: "20px", fontWeight: 900, color: schoolPrimary }}>16</div>
                <div style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 800, color: D.textPrimary, marginTop: "4px" }}>1st / 2nd XI</div>
                <div style={{ fontFamily: D.body, fontSize: "9px", color: D.textMuted }}>Elite Senior</div>
              </div>

              <div style={{ padding: "12px", borderRadius: D.md, background: `${D.violet}25`, border: `1px solid ${D.violet}66`, textAlign: "center" }}>
                <div style={{ fontFamily: D.mono, fontSize: "20px", fontWeight: 900, color: D.violet }}>14</div>
                <div style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 800, color: D.textPrimary, marginTop: "4px" }}>KZN Reps</div>
                <div style={{ fontFamily: D.body, fontSize: "9px", color: D.textMuted }}>Khaya Majola & U17</div>
              </div>

              <div style={{ padding: "12px", borderRadius: D.md, background: `${D.emerald}25`, border: `1px solid ${D.emerald}66`, textAlign: "center" }}>
                <div style={{ fontFamily: D.mono, fontSize: "20px", fontWeight: 900, color: D.emerald }}>4</div>
                <div style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 800, color: D.textPrimary, marginTop: "4px" }}>Pro Proteas/Dolphins</div>
                <div style={{ fontFamily: D.body, fontSize: "9px", color: D.textMuted }}>Active Alumni</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 7: FIXTURES & RESULTS ────────────────────────────── */}
      {activeTab === "fixtures" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h2 style={{ fontFamily: D.head, fontSize: "18px", fontWeight: 800, color: D.textPrimary, margin: 0 }}>
              📅 Fixtures, Timeline & Results ({selectedSeason})
            </h2>
            <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted, marginTop: "2px" }}>
              Official match logs and scorecards across all age divisions
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {schoolMatches.map(match => (
              <div
                key={match.id}
                style={{
                  background: D.surf1,
                  border: `1px solid ${D.border}`,
                  borderRadius: D.lg,
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: D.md,
                      background: match.status === "live" ? `${D.emerald}20` : D.surf2,
                      border: `1px solid ${match.status === "live" ? D.emerald : D.border}`,
                      color: match.status === "live" ? D.emerald : D.textPrimary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      flexShrink: 0,
                    }}
                  >
                    {match.status === "live" ? "●" : "🏏"}
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 800, color: D.textPrimary }}>
                        {match.homeTeam} vs {match.awayTeam}
                      </span>
                      <span style={{ fontFamily: D.mono, fontSize: "10px", padding: "1px 6px", borderRadius: D.pill, background: D.surf2, color: D.textMuted }}>
                        {match.format}
                      </span>
                    </div>
                    <div style={{ fontFamily: D.mono, fontSize: "11px", color: D.textMuted, marginTop: "2px" }}>
                      🏟️ {match.venue} · {match.summary}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {onOpenScorecard && (
                    <button
                      onClick={() => onOpenScorecard(match.id)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: D.pill,
                        background: D.surf2,
                        border: `1px solid ${D.border}`,
                        color: D.textPrimary,
                        fontFamily: D.head,
                        fontSize: "11px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      View Scorecard →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 8: COMPETITIONS ──────────────────────────────────── */}
      {activeTab === "competitions" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h2 style={{ fontFamily: D.head, fontSize: "18px", fontWeight: 800, color: D.textPrimary, margin: 0 }}>
              🎖️ Tournaments & League Standings
            </h2>
            <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted, marginTop: "2px" }}>
              Active tournament leagues and historic festival honours
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
            <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.lg, padding: "18px" }}>
              <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.emerald, fontWeight: 700 }}>
                ● Active League
              </span>
              <h3 style={{ fontFamily: D.head, fontSize: "15px", fontWeight: 800, color: D.textPrimary, margin: "6px 0 2px 0" }}>
                KZN Schools Premier League 2026
              </h3>
              <div style={{ fontFamily: D.mono, fontSize: "12px", color: D.textSecondary, marginTop: "8px" }}>
                Position: <strong style={{ color: D.amber }}>#4</strong> · Played: 8 · Won: 6 · Lost: 2 · Pts: 26
              </div>
            </div>

            <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.lg, padding: "18px" }}>
              <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.sky, fontWeight: 700 }}>
                ● Annual Festival
              </span>
              <h3 style={{ fontFamily: D.head, fontSize: "15px", fontWeight: 800, color: D.textPrimary, margin: "6px 0 2px 0" }}>
                Oppenheimer Michaelmas Cricket Week
              </h3>
              <div style={{ fontFamily: D.mono, fontSize: "12px", color: D.textSecondary, marginTop: "8px" }}>
                Pietermaritzburg Oval Circuit · Historic Champions (2003)
              </div>
            </div>

            <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.lg, padding: "18px" }}>
              <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.violet, fontWeight: 700 }}>
                ● T20 Knockout
              </span>
              <h3 style={{ fontFamily: D.head, fontSize: "15px", fontWeight: 800, color: D.textPrimary, margin: "6px 0 2px 0" }}>
                Coastal Schools T20 Championship
              </h3>
              <div style={{ fontFamily: D.mono, fontSize: "12px", color: D.textSecondary, marginTop: "8px" }}>
                Reigning Champions 2024 · CSA National Qualifiers
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 9: FACILITIES & GROUNDS ──────────────────────────── */}
      {activeTab === "facilities" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h2 style={{ fontFamily: D.head, fontSize: "18px", fontWeight: 800, color: D.textPrimary, margin: 0 }}>
              🏟️ Campus Grounds & Oval Telemetry
            </h2>
            <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted, marginTop: "2px" }}>
              Relational facility profiles, pitch soil compaction, boundary dimensions, and match conditions
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {facilities.map(fac => (
              <div
                key={fac.fieldId}
                style={{
                  background: D.surf1,
                  border: `1px solid ${D.border}`,
                  borderRadius: D.lg,
                  padding: "20px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: D.pill,
                        background: fac.tier === "Primary" ? `${schoolPrimary}20` : `${D.sky}20`,
                        color: fac.tier === "Primary" ? schoolPrimary : D.sky,
                        fontFamily: D.mono,
                        fontSize: "10px",
                        fontWeight: 700,
                      }}
                    >
                      {fac.tier} Oval
                    </span>
                    <h3 style={{ fontFamily: D.head, fontSize: "17px", fontWeight: 800, color: D.textPrimary, margin: "6px 0 2px 0" }}>
                      {fac.name}
                    </h3>
                    <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted }}>
                      {fac.pavilionName}
                    </div>
                  </div>
                  <span style={{ fontSize: "24px" }}>🌿</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px", marginTop: "14px" }}>
                  <div style={{ padding: "8px", borderRadius: D.md, background: D.surf2 }}>
                    <div style={{ fontFamily: D.body, fontSize: "10px", color: D.textMuted }}>Turf Grass</div>
                    <div style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700, color: D.textPrimary, marginTop: "2px" }}>{fac.pitchType}</div>
                  </div>
                  <div style={{ padding: "8px", borderRadius: D.md, background: D.surf2 }}>
                    <div style={{ fontFamily: D.body, fontSize: "10px", color: D.textMuted }}>Straight Boundary</div>
                    <div style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700, color: D.textPrimary, marginTop: "2px" }}>{fac.boundaryDimensions.straight}m</div>
                  </div>
                  <div style={{ padding: "8px", borderRadius: D.md, background: D.surf2 }}>
                    <div style={{ fontFamily: D.body, fontSize: "10px", color: D.textMuted }}>Compaction</div>
                    <div style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700, color: D.textPrimary, marginTop: "2px" }}>{fac.soilCompaction}</div>
                  </div>
                  <div style={{ padding: "8px", borderRadius: D.md, background: D.surf2 }}>
                    <div style={{ fontFamily: D.body, fontSize: "10px", color: D.textMuted }}>Avg 1st Inn Score</div>
                    <div style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700, color: D.emerald, marginTop: "2px" }}>{fac.stats.avgFirstInningsScore}</div>
                  </div>
                </div>

                <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: `1px solid ${D.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>
                  <span>Curator: <strong>{fac.curatorName}</strong></span>
                  <span>{fac.hasFloodlights ? "💡 Lights Enabled" : "Daylight Only"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 10: RIVALRIES & HEAD-TO-HEAD ─────────────────────── */}
      {activeTab === "rivalries" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h2 style={{ fontFamily: D.head, fontSize: "18px", fontWeight: 800, color: D.textPrimary, margin: 0 }}>
              ⚔️ Traditional Rivalries & Head-to-Head Showpieces
            </h2>
            <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted, marginTop: "2px" }}>
              Annual derby clashes, perpetual trophy holders, and historical win-loss records
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {rivalries.map(riv => (
              <div
                key={riv.id}
                style={{
                  background: D.surf1,
                  border: `1px solid ${D.border}`,
                  borderRadius: D.lg,
                  padding: "20px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: D.pill,
                        background: `${D.amber}20`,
                        color: D.amber,
                        fontFamily: D.mono,
                        fontSize: "10px",
                        fontWeight: 800,
                      }}
                    >
                      🏆 Trophy: {riv.perpetualTrophy}
                    </span>
                    <h3 style={{ fontFamily: D.head, fontSize: "18px", fontWeight: 900, color: D.textPrimary, margin: "8px 0 4px 0" }}>
                      {riv.derbyName}
                    </h3>
                    <div style={{ fontFamily: D.mono, fontSize: "11px", color: D.textMuted }}>
                      Inaugurated {riv.inauguralYear} · Current Shield Holder: <strong style={{ color: schoolPrimary }}>{school.displayName}</strong>
                    </div>
                  </div>

                  {/* Head to Head Record */}
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "10px 16px", borderRadius: D.md, background: D.surf2 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: D.mono, fontSize: "18px", fontWeight: 900, color: schoolPrimary }}>{riv.schoolAWins}</div>
                      <div style={{ fontFamily: D.body, fontSize: "9px", color: D.textMuted }}>{school.shortCode} Wins</div>
                    </div>
                    <div style={{ fontFamily: D.mono, fontSize: "14px", color: D.textMuted }}>vs</div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: D.mono, fontSize: "18px", fontWeight: 900, color: D.textPrimary }}>{riv.schoolBWins}</div>
                      <div style={{ fontFamily: D.body, fontSize: "9px", color: D.textMuted }}>Opponent Wins</div>
                    </div>
                    <div style={{ width: "1px", height: "24px", background: D.border }} />
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: D.mono, fontSize: "18px", fontWeight: 900, color: D.textMuted }}>{riv.drawsOrNoResult}</div>
                      <div style={{ fontFamily: D.body, fontSize: "9px", color: D.textMuted }}>Draws/NR</div>
                    </div>
                  </div>
                </div>

                <p style={{ fontFamily: D.body, fontSize: "12px", color: D.textSecondary, lineHeight: 1.5, margin: "14px 0 10px 0" }}>
                  {riv.description}
                </p>

                <div style={{ padding: "8px 12px", borderRadius: D.md, background: `${schoolPrimary}10`, border: `1px solid ${schoolPrimary}22`, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: D.mono, fontSize: "11px" }}>
                  <span>Last Encounter ({riv.lastClash.date}): <strong>{riv.lastClash.venue}</strong></span>
                  <span style={{ color: D.emerald, fontWeight: 700 }}>✓ {riv.lastClash.resultSummary}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 11: HONOURS & DIGITAL ARCHIVE ────────────────────── */}
      {activeTab === "honours" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h2 style={{ fontFamily: D.head, fontSize: "18px", fontWeight: 800, color: D.textPrimary, margin: 0 }}>
              📜 Honours, Heritage & Notable Alumni
            </h2>
            <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted, marginTop: "2px" }}>
              70+ years of cricketing heritage, national representatives, and international Proteas
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {/* Timeline */}
            <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.lg, padding: "20px" }}>
              <h3 style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 800, color: D.textPrimary, margin: "0 0 14px 0" }}>
                ⏳ Heritage Timeline
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {honours.timeline.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ padding: "4px 8px", borderRadius: D.sm, background: `${schoolPrimary}20`, color: schoolPrimary, fontFamily: D.mono, fontSize: "11px", fontWeight: 800, flexShrink: 0 }}>
                      {item.year}
                    </div>
                    <div>
                      <div style={{ fontFamily: D.head, fontSize: "12px", fontWeight: 700, color: D.textPrimary }}>
                        {item.title}
                      </div>
                      <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, marginTop: "2px", lineHeight: 1.4 }}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notable Alumni */}
            <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.lg, padding: "20px" }}>
              <h3 style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 800, color: D.textPrimary, margin: "0 0 14px 0" }}>
                🌟 Notable Alumni in Professional Cricket
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {honours.notableAlumni.map((alum, idx) => (
                  <div key={idx} style={{ padding: "12px", borderRadius: D.md, background: D.surf2 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: D.head, fontSize: "13px", fontWeight: 800, color: D.textPrimary }}>
                        {alum.name}
                      </span>
                      <span style={{ fontFamily: D.mono, fontSize: "10px", color: schoolPrimary, fontWeight: 700 }}>
                        {alum.yearsAtSchool}
                      </span>
                    </div>
                    <div style={{ fontFamily: D.mono, fontSize: "10px", color: D.emerald, marginTop: "2px" }}>
                      {alum.highestLevel} · {alum.role}
                    </div>
                    <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, marginTop: "4px" }}>
                      {alum.statsSummary}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 12: CRICKET RECORDS ──────────────────────────────── */}
      {activeTab === "records" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h2 style={{ fontFamily: D.head, fontSize: "18px", fontWeight: 800, color: D.textPrimary, margin: 0 }}>
              📊 All-Time Institutional Cricket Records
            </h2>
            <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted, marginTop: "2px" }}>
              Highest scores, lowest defended totals, individual bowling records, and historical partnerships
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "12px" }}>
            {records.map(rec => (
              <div
                key={rec.id}
                style={{
                  background: D.surf1,
                  border: `1px solid ${D.border}`,
                  borderRadius: D.lg,
                  padding: "16px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: D.pill,
                      background: rec.category === "team" ? `${D.sky}20` : rec.category === "individual_bat" ? `${D.amber}20` : `${D.emerald}20`,
                      color: rec.category === "team" ? D.sky : rec.category === "individual_bat" ? D.amber : D.emerald,
                      fontFamily: D.mono,
                      fontSize: "10px",
                      fontWeight: 700,
                    }}
                  >
                    {rec.title}
                  </span>
                  <span style={{ fontFamily: D.mono, fontSize: "11px", color: D.textMuted }}>{rec.year}</span>
                </div>

                <div style={{ fontFamily: D.mono, fontSize: "20px", fontWeight: 900, color: D.textPrimary, marginTop: "8px" }}>
                  {rec.recordValue}
                </div>

                <div style={{ fontFamily: D.head, fontSize: "12px", fontWeight: 700, color: schoolPrimary, marginTop: "4px" }}>
                  {rec.holder}
                </div>

                <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, marginTop: "2px" }}>
                  {rec.opponent} · 🏟️ {rec.ground}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 13: MEDIA & MATCH REPORTS ────────────────────────── */}
      {activeTab === "media" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h2 style={{ fontFamily: D.head, fontSize: "18px", fontWeight: 800, color: D.textPrimary, margin: 0 }}>
              📰 Match Reports, High Performance News & Media
            </h2>
            <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted, marginTop: "2px" }}>
              Editorial fixture recaps, captain interviews, and tactical reviews
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.lg, padding: "20px" }}>
              <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.emerald, fontWeight: 700 }}>
                ● 1st XI Match Report
              </span>
              <h3 style={{ fontFamily: D.head, fontSize: "16px", fontWeight: 800, color: D.textPrimary, margin: "6px 0 8px 0" }}>
                Highway Derby Victory: Whitfield Masterclass Seals 37-Run Triumph Over Kearsney
              </h3>
              <p style={{ fontFamily: D.body, fontSize: "12px", color: D.textSecondary, lineHeight: 1.5, margin: 0 }}>
                In front of an electric Bowden&apos;s Field embankment, Westville 1st XI defended 248 with discipline as Dupavillon&apos;s seamers claimed 4 crucial middle-order scalps.
              </p>
              <div style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted, marginTop: "12px" }}>
                Published 2 days ago · WBHS Sports Media Bureau
              </div>
            </div>

            <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.lg, padding: "20px" }}>
              <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.sky, fontWeight: 700 }}>
                ● Selection Advisory
              </span>
              <h3 style={{ fontFamily: D.head, fontSize: "16px", fontWeight: 800, color: D.textPrimary, margin: "6px 0 8px 0" }}>
                14 Westville Cricketers Selected for KZN Coastal Provincial Weeks
              </h3>
              <p style={{ fontFamily: D.body, fontSize: "12px", color: D.textSecondary, lineHeight: 1.5, margin: 0 }}>
                The KwaZulu-Natal Schools Cricket Association confirmed its 2026 provincial touring teams, with Westville achieving the largest single-school representation in the coastal union.
              </p>
              <div style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted, marginTop: "12px" }}>
                Published 1 week ago · High Performance Directorate
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 14: OFFICIAL PARTNERS & SPONSORSHIP ──────────────── */}
      {activeTab === "sponsors" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h2 style={{ fontFamily: D.head, fontSize: "18px", fontWeight: 800, color: D.textPrimary, margin: 0 }}>
              🤝 Official Partners & Commercial Rights
            </h2>
            <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted, marginTop: "2px" }}>
              Authorized commercial sponsors safely partitioned from minor athlete PII in strict adherence to POPIA
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
            {sponsors.map(sp => (
              <div
                key={sp.id}
                style={{
                  background: D.surf1,
                  border: `1px solid ${D.border}`,
                  borderRadius: D.lg,
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: D.pill,
                        background: sp.tier === "Platinum" ? `${D.amber}20` : `${D.sky}20`,
                        color: sp.tier === "Platinum" ? D.amber : D.sky,
                        fontFamily: D.mono,
                        fontSize: "10px",
                        fontWeight: 700,
                      }}
                    >
                      {sp.tier} Partner
                    </span>
                    <span style={{ fontSize: "18px" }}>🛡️</span>
                  </div>

                  <h3 style={{ fontFamily: D.head, fontSize: "16px", fontWeight: 800, color: D.textPrimary, margin: "8px 0 2px 0" }}>
                    {sp.brandName}
                  </h3>
                  <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted }}>
                    {sp.category} · {sp.scope}
                  </div>
                </div>

                <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: `1px solid ${D.border}`, fontFamily: D.mono, fontSize: "10px", color: D.emerald }}>
                  ✓ POPIA Data Isolation Verified
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. REDESIGNED 6-TAB INSTITUTIONAL EDIT MODAL
      ───────────────────────────────────────────────────────────── */}
      {editModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "840px",
              maxHeight: "90vh",
              background: D.surf0,
              border: `1px solid ${D.border}`,
              borderRadius: D.xl,
              boxShadow: "0 25px 50px rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${D.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: D.surf1 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "20px" }}>🏛️</span>
                  <h2 style={{ fontFamily: D.head, fontSize: "16px", fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                    Edit Institutional Entity: {school.displayName}
                  </h2>
                </div>
                <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, marginTop: "2px" }}>
                  Structured architecture separating Entered Data, Relational Lookups, and Derived Metrics
                </div>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: D.textMuted,
                  fontSize: "18px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div style={{ display: "flex", overflowX: "auto", borderBottom: `1px solid ${D.border}`, background: D.surf1, padding: "0 12px" }}>
              {[
                { id: "identity", label: "1. Identity & Bio" },
                { id: "leadership", label: "2. Sport Leadership" },
                { id: "branding", label: "3. Branding & Visuals" },
                { id: "facilities", label: "4. Campus Grounds" },
                { id: "rivalries", label: "5. Rivalries & Derby" },
                { id: "provenance", label: "6. Data Governance" },
              ].map(t => {
                const isActive = editActiveTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setEditActiveTab(t.id as any)}
                    style={{
                      padding: "10px 14px",
                      whiteSpace: "nowrap",
                      background: "transparent",
                      border: "none",
                      borderBottom: isActive ? `3px solid ${schoolPrimary}` : "3px solid transparent",
                      color: isActive ? D.textPrimary : D.textSecondary,
                      fontFamily: D.head,
                      fontSize: "11px",
                      fontWeight: isActive ? 800 : 600,
                      cursor: "pointer",
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Modal Tab Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* TAB 1: IDENTITY */}
              {editActiveTab === "identity" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ padding: "8px 12px", borderRadius: D.md, background: `${D.emerald}15`, border: `1px solid ${D.emerald}33`, fontFamily: D.mono, fontSize: "10px", color: D.emerald }}>
                    🟢 Direct Entered Fields (Canonical Institutional Bio)
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, marginBottom: "4px" }}>
                        Official School Name:
                      </label>
                      <input
                        type="text"
                        value={editFormData.officialName || ""}
                        onChange={e => setEditFormData({ ...editFormData, officialName: e.target.value })}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.head, fontSize: "12px" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, marginBottom: "4px" }}>
                        Display Name:
                      </label>
                      <input
                        type="text"
                        value={editFormData.displayName || ""}
                        onChange={e => setEditFormData({ ...editFormData, displayName: e.target.value })}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.head, fontSize: "12px" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, marginBottom: "4px" }}>
                        Short Code (3-4 Letters):
                      </label>
                      <input
                        type="text"
                        value={editFormData.shortCode || ""}
                        onChange={e => setEditFormData({ ...editFormData, shortCode: e.target.value })}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.mono, fontSize: "12px", fontWeight: 700 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, marginBottom: "4px" }}>
                        EMIS Registry Number:
                      </label>
                      <input
                        type="text"
                        value={editFormData.emisNumber || ""}
                        onChange={e => setEditFormData({ ...editFormData, emisNumber: e.target.value })}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.mono, fontSize: "12px" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, marginBottom: "4px" }}>
                        Founded Year:
                      </label>
                      <input
                        type="number"
                        value={editFormData.foundedYear || 1955}
                        onChange={e => setEditFormData({ ...editFormData, foundedYear: parseInt(e.target.value) || 1955 })}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.mono, fontSize: "12px" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, marginBottom: "4px" }}>
                        School Motto (Latin / Traditional):
                      </label>
                      <input
                        type="text"
                        value={editFormData.motto || ""}
                        onChange={e => setEditFormData({ ...editFormData, motto: e.target.value })}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.head, fontSize: "12px" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, marginBottom: "4px" }}>
                      Institutional Biography:
                    </label>
                    <textarea
                      rows={3}
                      value={editFormData.biography || ""}
                      onChange={e => setEditFormData({ ...editFormData, biography: e.target.value })}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: "12px", lineHeight: 1.4 }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: SPORT LEADERSHIP */}
              {editActiveTab === "leadership" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ padding: "8px 12px", borderRadius: D.md, background: `${D.sky}15`, border: `1px solid ${D.sky}33`, fontFamily: D.mono, fontSize: "10px", color: D.sky }}>
                    🔵 Relational Lookups (Linked to `school_role_assignments`)
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ padding: "12px", borderRadius: D.md, background: D.surf2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700, color: D.textMuted }}>Head of Cricket</div>
                        <div style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 800, color: D.textPrimary }}>{headOfCricket.personName}</div>
                        <div style={{ fontFamily: D.mono, fontSize: "10px", color: D.emerald }}>Role ID: {headOfCricket.id}</div>
                      </div>
                      <button
                        onClick={() => showToast("Role reassignment picker opened.")}
                        style={{ padding: "4px 10px", borderRadius: D.pill, background: D.surf3, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.head, fontSize: "11px", cursor: "pointer" }}
                      >
                        Change Assignee
                      </button>
                    </div>

                    {directorOfSport && (
                      <div style={{ padding: "12px", borderRadius: D.md, background: D.surf2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700, color: D.textMuted }}>Director of Sport</div>
                          <div style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 800, color: D.textPrimary }}>{directorOfSport.personName}</div>
                          <div style={{ fontFamily: D.mono, fontSize: "10px", color: D.emerald }}>Role ID: {directorOfSport.id}</div>
                        </div>
                        <button
                          onClick={() => showToast("Role reassignment picker opened.")}
                          style={{ padding: "4px 10px", borderRadius: D.pill, background: D.surf3, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.head, fontSize: "11px", cursor: "pointer" }}
                        >
                          Change Assignee
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: BRANDING */}
              {editActiveTab === "branding" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ padding: "8px 12px", borderRadius: D.md, background: `${D.emerald}15`, border: `1px solid ${D.emerald}33`, fontFamily: D.mono, fontSize: "10px", color: D.emerald }}>
                    🟢 Direct Visual Branding Properties
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, marginBottom: "4px" }}>
                        Crest Emoji / Asset Icon:
                      </label>
                      <input
                        type="text"
                        value={editFormData.crestIcon || "🛡️"}
                        onChange={e => setEditFormData({ ...editFormData, crestIcon: e.target.value })}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.head, fontSize: "16px" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, marginBottom: "4px" }}>
                        Primary Brand Colour:
                      </label>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input
                          type="color"
                          value={editFormData.primaryColour || "#800000"}
                          onChange={e => setEditFormData({ ...editFormData, primaryColour: e.target.value })}
                          style={{ width: "36px", height: "36px", borderRadius: "50%", border: "none", cursor: "pointer" }}
                        />
                        <input
                          type="text"
                          value={editFormData.primaryColour || "#800000"}
                          onChange={e => setEditFormData({ ...editFormData, primaryColour: e.target.value })}
                          style={{ flex: 1, padding: "8px 10px", borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.mono, fontSize: "12px" }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, marginBottom: "4px" }}>
                        Secondary Brand Colour:
                      </label>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input
                          type="color"
                          value={editFormData.secondaryColour || "#C0C0C0"}
                          onChange={e => setEditFormData({ ...editFormData, secondaryColour: e.target.value })}
                          style={{ width: "36px", height: "36px", borderRadius: "50%", border: "none", cursor: "pointer" }}
                        />
                        <input
                          type="text"
                          value={editFormData.secondaryColour || "#C0C0C0"}
                          onChange={e => setEditFormData({ ...editFormData, secondaryColour: e.target.value })}
                          style={{ flex: 1, padding: "8px 10px", borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.mono, fontSize: "12px" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: FACILITIES */}
              {editActiveTab === "facilities" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ padding: "8px 12px", borderRadius: D.md, background: `${D.sky}15`, border: `1px solid ${D.sky}33`, fontFamily: D.mono, fontSize: "10px", color: D.sky }}>
                    🔵 Relational Facility Links (Linked to `school_facilities`)
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {facilities.map(f => (
                      <div key={f.fieldId} style={{ padding: "10px 14px", borderRadius: D.md, background: D.surf2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span style={{ fontFamily: D.head, fontSize: "12px", fontWeight: 700, color: D.textPrimary }}>{f.name}</span>
                          <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted, marginLeft: "8px" }}>({f.pitchType} · {f.boundaryDimensions.straight}m straight)</span>
                        </div>
                        <span style={{ fontFamily: D.mono, fontSize: "10px", color: schoolPrimary }}>fieldId: {f.fieldId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: RIVALRIES */}
              {editActiveTab === "rivalries" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ padding: "8px 12px", borderRadius: D.md, background: `${D.sky}15`, border: `1px solid ${D.sky}33`, fontFamily: D.mono, fontSize: "10px", color: D.sky }}>
                    🔵 Traditional Rivalry Entities (Linked to `school_rivalries`)
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {rivalries.map(r => (
                      <div key={r.id} style={{ padding: "10px 14px", borderRadius: D.md, background: D.surf2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span style={{ fontFamily: D.head, fontSize: "12px", fontWeight: 700, color: D.textPrimary }}>{r.derbyName}</span>
                          <div style={{ fontFamily: D.body, fontSize: "10px", color: D.textMuted }}>Trophy: {r.perpetualTrophy}</div>
                        </div>
                        <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.emerald }}>P{r.matchesPlayed} W{r.schoolAWins} L{r.schoolBWins}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: DATA PROVENANCE */}
              {editActiveTab === "provenance" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ padding: "8px 12px", borderRadius: D.md, background: `${D.violet}15`, border: `1px solid ${D.violet}33`, fontFamily: D.mono, fontSize: "10px", color: D.violet }}>
                    🟣 SCRBRD Data Architecture & Provenance Matrix
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
                    <div style={{ padding: "12px", borderRadius: D.md, background: D.surf2, border: `1px solid ${D.emerald}33` }}>
                      <div style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 800, color: D.emerald }}>🟢 ENTERED DATA</div>
                      <div style={{ fontFamily: D.body, fontSize: "10px", color: D.textSecondary, marginTop: "4px", lineHeight: 1.4 }}>
                        Institutional facts directly provided by school admins: Official Name, Motto, Founded Year, Brand Colours, Crest Icon, Website.
                      </div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: D.md, background: D.surf2, border: `1px solid ${D.sky}33` }}>
                      <div style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 800, color: D.sky }}>🔵 RELATIONAL DATA</div>
                      <div style={{ fontFamily: D.body, fontSize: "10px", color: D.textSecondary, marginTop: "4px", lineHeight: 1.4 }}>
                        Resolved from normalized tables via entity IDs: Head of Cricket, Director of Sport, Grounds (`fieldId`), Traditional Rivalries.
                      </div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: D.md, background: D.surf2, border: `1px solid ${D.violet}33` }}>
                      <div style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 800, color: D.violet }}>🟣 DERIVED DATA</div>
                      <div style={{ fontFamily: D.body, fontSize: "10px", color: D.textSecondary, marginTop: "4px", lineHeight: 1.4 }}>
                        Proved by live SCRBRD telemetry: Active Players (53), Win Rate (68.1%), Provincial Reps (14 SA/KZN), Form (W W L W W).
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "14px 20px", borderTop: `1px solid ${D.border}`, display: "flex", justifyContent: "flex-end", gap: "10px", background: D.surf1 }}>
              <button
                onClick={() => setEditModalOpen(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: D.pill,
                  background: D.surf2,
                  border: `1px solid ${D.border}`,
                  color: D.textSecondary,
                  fontFamily: D.head,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                style={{
                  padding: "8px 20px",
                  borderRadius: D.pill,
                  background: schoolPrimary,
                  border: "none",
                  color: "#fff",
                  fontFamily: D.head,
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: `0 2px 10px ${schoolPrimary}44`,
                }}
              >
                Save Institutional Changes ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
