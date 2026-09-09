'use client';

import React, { useState } from "react";
import { Theme, Player, Match } from "./types";
import {
  makeTheme,
  SCRBRD_LOGO,
  ROLE_LAYERS,
  ROLES,
  NAV_META,
  SCHOOLS_REGISTRY,
  PLAYERS,
  MATCHES,
  COMPETITIONS,
  WEATHER,
  INJURIES,
  USERS_INITIAL,
  SKILLS_MATRIX,
  SHOT_DATA_SAMPLE,
  SCHOOL_PITCH_CONDITIONS,
  DERBY_RECORDS,
  pctDays,
} from "./data";
import BroadcastScorer from "./BroadcastScorer";
import WagonWheel from "./WagonWheel";
import DRSReview from "./DRSReview";
import ScorecardModal from "./ScorecardModal";
import PhaseScoringView from "./PhaseScoringView";
import MatchAnalyticsView from "./MatchAnalyticsView";
import { MATCH_SCORECARDS } from "./scorecardData";
import { POPIA_POLICIES } from "./data";
import { MatchScorecard } from "./types";
import ScoutingHub from "./ScoutingHub";
import SkillsMatrixView from "./SkillsMatrixView";
import PlayerSearchFilterSelect from "./PlayerSearchFilterSelect";
import LogisticsView from "./LogisticsView";
import FieldsView from "./FieldsView";
import TrainingView from "./TrainingView";
import InjuriesView from "./InjuriesView";
import CalendarView from "./CalendarView";
import NotificationsView, { isRoleAuthorizedForNotification, NotificationCategory } from "./NotificationsView";
import CommercialView from "./CommercialView";
import GovernanceView from "./GovernanceView";
import MultiSquadCoachView from "./MultiSquadCoachView";
import { getSchoolSquads } from "./multiSquadData";
import { ScrbrdLogo } from "./ScrbrdLogo";
import Image from "next/image";

export default function ScrbrdOS() {
  const [role, setRole] = useState<string>("superadmin");
  const [page, setPage] = useState<string>("dashboard");
  const [activeSchoolId, setActiveSchoolId] = useState<string>("WES");
  const [selectedSquadId, setSelectedSquadId] = useState<string>("WES_1ST");
  const [isDark, setIsDark] = useState<boolean>(true);
  const [users] = useState(USERS_INITIAL);
  const [scorerOpen, setScorerOpen] = useState<boolean>(false);
  const [activeScorerMatch, setActiveScorerMatch] = useState<Match | undefined>(undefined);
  const [selectedPlayer, setSelectedPlayer] = useState<Player>(PLAYERS[0]);
  const [analyticsSubTab, setAnalyticsSubTab] = useState<"analytics" | "phases" | "wagon" | "drs">("analytics");
  const [scorecardModalOpen, setScorecardModalOpen] = useState<boolean>(false);
  const [activeScorecard, setActiveScorecard] = useState<MatchScorecard | null>(null);
  const [rbacNotice, setRbacNotice] = useState<string | null>(null);

  // Top Navigation Bar Notification & Toast System
  const [notifDropdownOpen, setNotifDropdownOpen] = useState<boolean>(false);
  const [toastNotification, setToastNotification] = useState<{
    id: string;
    title: string;
    body: string;
    category?: string;
    targetPage?: string;
    icon?: string;
  } | null>(null);

  const [navAlerts, setNavAlerts] = useState<Array<{
    id: string;
    icon: string;
    title: string;
    body: string;
    time: string;
    read: boolean;
    targetPage?: string;
    category: NotificationCategory;
    allowedRoles?: string[];
    deniedRoles?: string[];
  }>>([
    // Live Match Telemetry Alert (Blocked for Finance Admin, Drivers, Curators, Medical)
    {
      id: "n1",
      icon: "🏏",
      title: "Century Partnership",
      body: "Westville 1st XI: Whitfield (74*) & Campbell (48*) 112-run opening stand.",
      time: "2m ago",
      read: false,
      targetPage: "matches",
      category: "match",
      deniedRoles: ["financeadmin", "driver", "groundskeeper", "medical"],
      allowedRoles: ["superadmin", "headcoach", "coach", "assistant", "analyst", "scorer", "sportsmaster", "doc", "headmaster", "player", "parent", "spectator", "scout"],
    },
    // Medical Physio Clearance (Blocked for Finance Admin, Analysts, Drivers, Curators, Scorers)
    {
      id: "n2",
      icon: "⚕️",
      title: "Physio Clearance",
      body: "Theo Pretorius cleared for Stage 3 batting drills.",
      time: "45m ago",
      read: false,
      targetPage: "injuries",
      category: "medical",
      deniedRoles: ["financeadmin", "analyst", "driver", "groundskeeper", "scorer", "spectator", "scout", "platformsupport"],
      allowedRoles: ["superadmin", "medical", "doc", "sportsmaster", "headcoach", "coach", "player", "parent"],
    },
    // Commercial Sponsorship Alert (Targeted to Finance Admin, Headmaster, School Admin, Super Admin)
    {
      id: "n_fin1",
      icon: "💳",
      title: "Sponsorship Tranche",
      body: "Derivco R 145,000 Q3 sponsorship disbursement allocated to Sporting Fund.",
      time: "15m ago",
      read: false,
      targetPage: "sponsorship",
      category: "finance",
      allowedRoles: ["superadmin", "financeadmin", "headmaster", "schooladmin"],
    },
    // Fleet Transport Invoice Sign-off (Targeted to Finance Admin, Headmaster, Super Admin)
    {
      id: "n_fin2",
      icon: "🧾",
      title: "Bus Fleet Invoice",
      body: "Monthly transport & tollgate invoice (R 38,400) submitted for finance audit.",
      time: "1h ago",
      read: false,
      targetPage: "logistics",
      category: "finance",
      allowedRoles: ["superadmin", "financeadmin", "headmaster"],
    },
    // Fleet Logistics Dispatch
    {
      id: "n3",
      icon: "🚌",
      title: "Bus En Route",
      body: "U15A Coach ND 849-211 cleared tollgate towards DHS.",
      time: "2h ago",
      read: false,
      targetPage: "logistics",
      category: "logistics",
      deniedRoles: ["scorer", "analyst", "groundskeeper", "spectator", "scout"],
    },
    // Curator Pitch Moisture Advisory
    {
      id: "n_grd",
      icon: "🌿",
      title: "Curator Moisture Alert",
      body: "Bowden's Field Strip #2 moisture at 16.8% (Bat First recommendation).",
      time: "3h ago",
      read: true,
      targetPage: "fields",
      category: "grounds",
      deniedRoles: ["financeadmin", "medical", "driver", "scorer", "player", "parent", "spectator", "scout"],
    },
    // Team Sheet Sign-off
    {
      id: "n4",
      icon: "📋",
      title: "Team Sheet Sign-off",
      body: "Playing XI team sheets submitted for umpire verification.",
      time: "3h ago",
      read: true,
      targetPage: "matches",
      category: "match",
      deniedRoles: ["financeadmin", "driver", "groundskeeper", "medical", "player", "parent", "analyst"],
    },
  ]);

  const triggerToast = (title: string, body: string, category: string = "match", targetPage?: string) => {
    // RBAC Check for incoming toast: if the current role is denied for this category, suppress unsolicited popups
    const notifCategory = (category as NotificationCategory) || "match";
    const dummyItem = {
      id: "test",
      type: "alert" as const,
      category: notifCategory,
      title,
      sender: "System",
      senderRole: "Service",
      body,
      time: "Just now",
      read: false,
    };

    if (role !== "superadmin" && !isRoleAuthorizedForNotification(role, dummyItem)) {
      // Role is not authorized to receive this toast
      return;
    }

    const icons: Record<string, string> = { match: "🏏", medical: "⚕️", logistics: "🚌", grounds: "🌿", approval: "📋", message: "✉️", finance: "💳", governance: "⚖️", academic: "🎓" };
    const newToast = {
      id: `toast_${Date.now()}`,
      title,
      body,
      category,
      targetPage,
      icon: icons[category] || "🔔",
    };
    setToastNotification(newToast);

    // Auto add to navAlerts as unread
    setNavAlerts(prev => [
      { id: newToast.id, icon: newToast.icon, title: newToast.title, body: newToast.body, time: "Just now", read: false, targetPage: targetPage || "notifications", category: notifCategory },
      ...prev.slice(0, 8),
    ]);

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      setToastNotification(curr => (curr?.id === newToast.id ? null : curr));
    }, 6000);
  };

  // Strictly filter visible alerts in navigation & topbar dropdown by active role RBAC
  const authorizedNavAlerts = navAlerts.filter(a =>
    isRoleAuthorizedForNotification(role, {
      id: a.id,
      type: "alert",
      category: a.category,
      title: a.title,
      sender: "System",
      senderRole: "Service",
      body: a.body,
      time: a.time,
      read: a.read,
      allowedRoles: a.allowedRoles,
      deniedRoles: a.deniedRoles,
    })
  );

  const unreadAlertsCount = authorizedNavAlerts.filter(a => !a.read).length;

  // RBAC permissions helper
  const canAccessScorer = (roleKey: string) => {
    return ["superadmin", "scorer", "coach", "headofcricket"].includes(roleKey);
  };

  const handleLaunchScorer = (match?: Match) => {
    if (!canAccessScorer(role)) {
      setRbacNotice(`Access Restricted by POPIA / Role Model: '${ROLES[role]?.label || role}' does not hold Match Officiating Scorer lease rights. Switch to 'Official Scorer', 'Head of Cricket', or 'Superadmin' to score.`);
      setTimeout(() => setRbacNotice(null), 6000);
      return;
    }
    setActiveScorerMatch(match || activeHeroMatch);
    setScorerOpen(true);
  };

  const handleOpenScorecard = (matchId?: string) => {
    const sc = MATCH_SCORECARDS[matchId || "m1"] || MATCH_SCORECARDS["m1"];
    setActiveScorecard(sc);
    setScorecardModalOpen(true);
  };

  // Squad filters
  const [squadTeamFilter, setSquadTeamFilter] = useState<string>("All");
  const [squadRoleFilter, setSquadRoleFilter] = useState<string>("All");

  // Matches view filter
  const [matchScopeFilter, setMatchScopeFilter] = useState<"school" | "all" | "live">("school");

  // Interactive Live Score simulation state per match
  const [liveScores, setLiveScores] = useState<Record<string, { runs: number; wkts: number; balls: number; overStr: string }>>({
    m1: { runs: 142, wkts: 3, balls: 86, overStr: "14.2" },
    m2: { runs: 214, wkts: 4, balls: 289, overStr: "48.1" },
    m3: { runs: 189, wkts: 6, balls: 220, overStr: "36.4" },
    m4: { runs: 98, wkts: 2, balls: 66, overStr: "11.0" },
  });

  // Interactive Derby Simulator State
  const [derbySimRunning, setDerbySimRunning] = useState<boolean>(false);
  const [derbySimResult, setDerbySimResult] = useState<{
    projectedWinner: string;
    probA: number;
    probB: number;
    predictedScore: string;
    keyMatchup: string;
  } | null>(null);

  const D: Theme = makeTheme(isDark);
  const activeSchool = SCHOOLS_REGISTRY.find(s => s.id === activeSchoolId) || SCHOOLS_REGISTRY[0];
  const currentNav = ROLES[role]?.nav || ROLES.superadmin.nav;

  // School dynamic brand colors
  const schoolPrimary = activeSchool.colors[0] || D.indigo;
  const schoolSecondary = activeSchool.colors[1] || D.amber;

  // Filter school players & matches
  const schoolPlayers = PLAYERS.filter(p => p.school === activeSchool.id);
  const allSchoolMatches = MATCHES.filter(
    m => m.schoolId === activeSchool.id || m.homeTeam.includes(activeSchool.shortName) || m.awayTeam.includes(activeSchool.shortName)
  );
  const liveMatches = MATCHES.filter(m => m.status === "live");
  const activeHeroMatch = allSchoolMatches.find(m => m.status === "live") || MATCHES.find(m => m.status === "live") || MATCHES[0];
  const schoolPitch = SCHOOL_PITCH_CONDITIONS[activeSchool.id] || SCHOOL_PITCH_CONDITIONS["WES"];
  const schoolInjuries = INJURIES.filter(inj => inj.schoolId === activeSchool.id);

  // Derby lookup
  const derbyKey = Object.keys(DERBY_RECORDS).find(k => k.includes(activeSchool.id)) || "WES_KEA";
  const activeDerby = DERBY_RECORDS[derbyKey] || DERBY_RECORDS["WES_KEA"];

  // Helper to trigger live simulation run addition
  const handleSimulateBall = (matchId: string, runAdd: number, isWkt: boolean = false) => {
    setLiveScores(prev => {
      const current = prev[matchId] || { runs: 140, wkts: 3, balls: 84, overStr: "14.0" };
      const nextBalls = current.balls + 1;
      const completedOvers = Math.floor(nextBalls / 6);
      const remBalls = nextBalls % 6;
      return {
        ...prev,
        [matchId]: {
          runs: current.runs + runAdd,
          wkts: isWkt ? Math.min(10, current.wkts + 1) : current.wkts,
          balls: nextBalls,
          overStr: `${completedOvers}.${remBalls}`,
        },
      };
    });
  };

  // Run Derby Simulator calculation
  const runDerbySimulator = () => {
    setDerbySimRunning(true);
    setDerbySimResult(null);
    setTimeout(() => {
      const isA = Math.random() > 0.45;
      const winner = isA ? activeDerby.schoolA : activeDerby.schoolB;
      const pA = Math.round(52 + (Math.random() * 14 - 7));
      const pB = 100 - pA;
      const score = `${Math.floor(190 + Math.random() * 45)}/${Math.floor(4 + Math.random() * 5)} (50 ov) vs ${Math.floor(175 + Math.random() * 35)} all out`;
      setDerbySimResult({
        projectedWinner: winner,
        probA: pA,
        probB: pB,
        predictedScore: score,
        keyMatchup: "Top Order Pace vs Death Overs Spin Variation",
      });
      setDerbySimRunning(false);
    }, 600);
  };

  // UI Primitives
  const Card = ({ children, sx = {}, onClick }: { children: React.ReactNode; sx?: React.CSSProperties; onClick?: () => void }) => (
    <div
      onClick={onClick}
      style={{
        background: D.surf1,
        border: `1px solid ${D.border}`,
        borderRadius: D.lg,
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
        ...sx,
      }}
    >
      {children}
    </div>
  );

  const KPICard = ({ label, value, sub, icon, color = D.indigo }: { label: string; value: string | number; sub?: string; icon: string; color?: string }) => (
    <Card sx={{ padding: "16px 18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>{label}</div>
          <div style={{ fontFamily: D.mono, fontSize: "24px", fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, marginTop: "4px" }}>{sub}</div>}
        </div>
        <div style={{ width: "36px", height: "36px", borderRadius: D.md, background: color + "18", border: `1px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
          {icon}
        </div>
      </div>
    </Card>
  );

  const SectionHeader = ({ title, sub, actions, color = D.indigo }: { title: string; sub?: string; actions?: React.ReactNode; color?: string }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "4px", height: "20px", borderRadius: "2px", background: color }} />
          <h2 style={{ fontFamily: D.head, fontSize: "17px", fontWeight: 700, color: D.textPrimary }}>{title}</h2>
        </div>
        {sub && <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted, marginTop: "2px", paddingLeft: "12px" }}>{sub}</div>}
      </div>
      {actions && <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>{actions}</div>}
    </div>
  );

  const Btn = ({ children, onClick, variant = "primary", size = "md", disabled }: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "success" | "danger" | "ghost" | "tonal"; size?: "sm" | "md" | "lg"; disabled?: boolean }) => {
    const bg = variant === "primary" ? D.gradMain : variant === "success" ? D.gradLive : variant === "danger" ? D.rose : variant === "ghost" ? "transparent" : D.surf3;
    const col = variant === "ghost" ? D.textSecondary : "#fff";
    const pad = size === "sm" ? "5px 12px" : size === "lg" ? "12px 24px" : "8px 18px";
    const fs = size === "sm" ? "11px" : size === "lg" ? "14px" : "12px";
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className="pressBtn"
        style={{
          padding: pad,
          borderRadius: D.pill,
          border: `1px solid ${variant === "ghost" ? D.border : "transparent"}`,
          background: bg,
          color: col,
          cursor: disabled ? "not-allowed" : "pointer",
          fontFamily: D.head,
          fontSize: fs,
          fontWeight: 700,
          letterSpacing: "0.04em",
          opacity: disabled ? 0.4 : 1,
          boxShadow: variant === "primary" ? `0 2px 12px ${D.indigo}33` : "none",
        }}
      >
        {children}
      </button>
    );
  };

  const Badge = ({ children, color = D.indigo }: { children: React.ReactNode; color?: string }) => (
    <span
      style={{
        padding: "3px 9px",
        borderRadius: D.pill,
        fontFamily: D.mono,
        fontSize: "10px",
        fontWeight: 700,
        background: color + "18",
        border: `1px solid ${color}35`,
        color,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {children}
    </span>
  );

  const Avatar = ({ name, size = 36, color = D.indigo }: { name: string; size?: number; color?: string }) => {
    const initials = name.split(" ").map(n => n[0]).slice(0, 2).join("");
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${color}, ${color}88)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: D.head,
          fontSize: `${size * 0.38}px`,
          fontWeight: 700,
          color: "#fff",
          flexShrink: 0,
          boxShadow: `0 2px 8px ${color}33`,
        }}
      >
        {initials}
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: D.bg, color: D.textPrimary, fontFamily: D.body, display: "flex" }}>
      {/* Live Scorer Modal Overlay */}
      {scorerOpen && (
        <BroadcastScorer
          theme={D}
          onClose={() => setScorerOpen(false)}
          activeMatch={activeScorerMatch || activeHeroMatch}
          activeSchool={activeSchool}
        />
      )}

      {/* Full Match Scorecard Modal Overlay */}
      {scorecardModalOpen && activeScorecard && (
        <ScorecardModal
          theme={D}
          scorecard={activeScorecard}
          onClose={() => setScorecardModalOpen(false)}
        />
      )}

      {/* RBAC Security / POPIA Policy Enforcement Toast */}
      {rbacNotice && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            maxWidth: "460px",
            background: D.surf1,
            border: `1px solid ${D.rose}66`,
            borderRadius: D.lg,
            padding: "16px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            zIndex: 99999,
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <div style={{ fontSize: "24px" }}>🛡️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: D.head, fontSize: "13px", fontWeight: 800, color: D.rose }}>
              POPIA / RBAC ACCESS ENFORCEMENT
            </div>
            <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textSecondary, marginTop: "4px", lineHeight: "1.4" }}>
              {rbacNotice}
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
              <button
                onClick={() => {
                  setRole("scorer");
                  setRbacNotice(null);
                }}
                style={{
                  padding: "4px 10px",
                  borderRadius: D.pill,
                  background: `${D.emerald}25`,
                  border: `1px solid ${D.emerald}44`,
                  color: D.emerald,
                  fontFamily: D.head,
                  fontSize: "10px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Switch to Official Scorer
              </button>
              <button
                onClick={() => setRbacNotice(null)}
                style={{
                  padding: "4px 10px",
                  borderRadius: D.pill,
                  background: D.surf2,
                  border: `1px solid ${D.border}`,
                  color: D.textMuted,
                  fontFamily: D.head,
                  fontSize: "10px",
                  cursor: "pointer",
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Sidebar */}
      <aside style={{ width: "230px", background: D.surf0, borderRight: `1px solid ${D.border}`, display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0, flexShrink: 0 }}>
        {/* Brand Header */}
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${D.border}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
            <ScrbrdLogo height={24} isDark={isDark} />
            <span
              style={{
                fontFamily: D.mono,
                fontSize: "10px",
                fontWeight: 800,
                padding: "2px 6px",
                borderRadius: "4px",
                background: `${schoolPrimary}22`,
                color: schoolPrimary,
                border: `1px solid ${schoolPrimary}44`,
                letterSpacing: "0.05em",
              }}
            >
              OS
            </span>
          </div>
          <div style={{ fontFamily: D.mono, fontSize: "9px", color: D.textMuted, letterSpacing: "0.02em" }}>
            KZN School Intelligence
          </div>
        </div>

        {/* Active School Selector with Crest Badge */}
        <div style={{ padding: "12px 14px", borderBottom: `1px solid ${D.border}`, background: `linear-gradient(180deg, ${schoolPrimary}0a, transparent)` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontFamily: D.head, fontSize: "9px", fontWeight: 700, color: D.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Selected School</span>
            <span style={{ fontSize: "14px" }}>{activeSchool.crestIcon}</span>
          </div>
          <select
            value={activeSchoolId}
            onChange={e => {
              setActiveSchoolId(e.target.value);
              // reset selected player to first player of that school
              const newSchoolPlayers = PLAYERS.filter(p => p.school === e.target.value);
              if (newSchoolPlayers.length > 0) setSelectedPlayer(newSchoolPlayers[0]);
            }}
            style={{
              width: "100%", padding: "7px 9px", borderRadius: D.sm, background: D.surf2,
              border: `1px solid ${D.borderMed}`, color: D.textPrimary, fontFamily: D.head,
              fontSize: "12px", fontWeight: 700, outline: "none", cursor: "pointer",
            }}
          >
            {SCHOOLS_REGISTRY.map(s => (
              <option key={s.id} value={s.id}>{s.crestIcon} {s.shortName}</option>
            ))}
          </select>
          <div style={{ fontFamily: D.body, fontSize: "10px", color: D.textMuted, fontStyle: "italic", marginTop: "5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            &ldquo;{activeSchool.motto}&rdquo;
          </div>
        </div>

        {/* Role Pill */}
        <div style={{ padding: "8px 14px", borderBottom: `1px solid ${D.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 8px", borderRadius: D.md, background: (ROLES[role]?.color || D.indigo) + "15", border: `1px solid ${(ROLES[role]?.color || D.indigo)}33` }}>
            <span>{ROLES[role]?.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: ROLES[role]?.color || D.indigo, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ROLES[role]?.label}</div>
              <div style={{ fontFamily: D.mono, fontSize: "8px", color: D.textMuted }}>POPIA Level: {POPIA_POLICIES[role]?.sensitivityMax || 1}/4</div>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {currentNav.map((k: string) => {
            const meta = NAV_META[k];
            if (!meta) return null;
            const isActive = page === k;
            return (
              <button
                key={k}
                onClick={() => setPage(k)}
                style={{
                  width: "100%",
                  padding: "8px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: isActive ? `${schoolPrimary}18` : "transparent",
                  borderLeft: isActive ? `3px solid ${schoolPrimary}` : "3px solid transparent",
                  borderTop: "none",
                  borderRight: "none",
                  borderBottom: "none",
                  color: isActive ? D.textPrimary : D.textSecondary,
                  fontFamily: D.head,
                  fontSize: "12px",
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ fontSize: "14px" }}>{meta.icon}</span>
                <span style={{ flex: 1 }}>{meta.label}</span>
                {(k === "notifications" || k === "inbox") && unreadAlertsCount > 0 && (
                  <span
                    style={{
                      background: D.rose,
                      color: "#fff",
                      fontFamily: D.mono,
                      fontSize: "10px",
                      fontWeight: 800,
                      padding: "1px 6px",
                      borderRadius: D.pill,
                      lineHeight: "1.2",
                    }}
                  >
                    {unreadAlertsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Scorer Trigger CTA */}
        <div style={{ padding: "12px 14px", borderTop: `1px solid ${D.border}` }}>
          <button
            onClick={() => handleLaunchScorer(activeHeroMatch)}
            className="pressBtn"
            style={{
              width: "100%", padding: "8px 12px", borderRadius: D.pill, cursor: "pointer",
              background: D.gradLive, border: "none", color: "#fff", fontFamily: D.head,
              fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              boxShadow: `0 4px 14px ${D.emerald}33`,
            }}
          >
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#fff" }} />
            Open Scorer ↗
          </button>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {/* Top Navbar */}
        <header style={{ height: "54px", background: D.surf0, borderBottom: `1px solid ${D.border}`, display: "flex", alignItems: "center", padding: "0 20px", gap: "14px", position: "sticky", top: 0, zIndex: 100 }}>
          {/* Quick Active School Indicator & Colors */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>{activeSchool.crestIcon}</span>
            <span style={{ fontFamily: D.head, fontSize: "13px", fontWeight: 800 }}>{activeSchool.name}</span>
            <div style={{ display: "flex", gap: "3px", marginLeft: "4px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: schoolPrimary, border: "1px solid rgba(255,255,255,0.2)" }} title="Primary color" />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: schoolSecondary, border: "1px solid rgba(255,255,255,0.2)" }} title="Secondary color" />
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Quick Switch School Pills */}
          <div style={{ display: "none", alignItems: "center", gap: "4px" }} className="md:flex">
            {SCHOOLS_REGISTRY.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveSchoolId(s.id);
                  const newSchoolPlayers = PLAYERS.filter(p => p.school === s.id);
                  if (newSchoolPlayers.length > 0) setSelectedPlayer(newSchoolPlayers[0]);
                }}
                style={{
                  padding: "4px 8px", borderRadius: D.pill, border: `1px solid ${s.id === activeSchoolId ? schoolPrimary : D.border}`,
                  background: s.id === activeSchoolId ? `${schoolPrimary}20` : "transparent",
                  color: s.id === activeSchoolId ? D.textPrimary : D.textMuted,
                  fontFamily: D.mono, fontSize: "10px", fontWeight: 700, cursor: "pointer",
                }}
              >
                {s.shortName}
              </button>
            ))}
          </div>

          {/* Active Squad Switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>Squad:</span>
            <select
              value={selectedSquadId}
              onChange={e => {
                setSelectedSquadId(e.target.value);
                if (page !== "squad" && (role === "headcoach" || role === "coach" || role === "doc")) {
                  // Keep user focused
                }
              }}
              style={{
                padding: "5px 10px",
                borderRadius: D.pill,
                background: D.surf2,
                border: `1px solid ${D.border}`,
                color: D.sky || D.indigo,
                fontFamily: D.head,
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                outline: "none",
              }}
            >
              <optgroup label="Open Division (1st - 7th XI)">
                {getSchoolSquads(activeSchoolId).filter(s => s.division === "Open").map(s => (
                  <option key={s.id} value={s.id}>{s.name} · {s.headCoachName}</option>
                ))}
              </optgroup>
              <optgroup label="U16 Age Division (U16A - U16D)">
                {getSchoolSquads(activeSchoolId).filter(s => s.division === "U16").map(s => (
                  <option key={s.id} value={s.id}>{s.name} · {s.headCoachName}</option>
                ))}
              </optgroup>
              <optgroup label="U15 Age Division (U15A - U15E)">
                {getSchoolSquads(activeSchoolId).filter(s => s.division === "U15").map(s => (
                  <option key={s.id} value={s.id}>{s.name} · {s.headCoachName}</option>
                ))}
              </optgroup>
              <optgroup label="U14 Age Division (U14A - U14G)">
                {getSchoolSquads(activeSchoolId).filter(s => s.division === "U14").map(s => (
                  <option key={s.id} value={s.id}>{s.name} · {s.headCoachName}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Role switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>Role:</span>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              style={{ padding: "5px 10px", borderRadius: D.pill, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: "11px", cursor: "pointer", outline: "none" }}
            >
              {Object.entries(ROLES).map(([key, r]) => (
                <option key={key} value={key}>{r.icon} {r.label}</option>
              ))}
            </select>
          </div>

          {/* Top Navbar Notification Icon with Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setNotifDropdownOpen(prev => !prev)}
              className="pressBtn"
              style={{
                position: "relative",
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: notifDropdownOpen ? `${D.indigo}25` : D.surf2,
                border: `1px solid ${notifDropdownOpen ? D.indigo : D.border}`,
                color: D.textPrimary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "14px",
              }}
              title="Notifications & Live Alerts"
            >
              <span>🔔</span>
              {unreadAlertsCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-2px",
                    right: "-2px",
                    padding: "1px 5px",
                    borderRadius: D.pill,
                    background: D.rose,
                    color: "#fff",
                    fontFamily: D.mono,
                    fontSize: "9px",
                    fontWeight: 800,
                    border: `2px solid ${D.surf0}`,
                    minWidth: "16px",
                    textAlign: "center",
                    lineHeight: "12px",
                  }}
                >
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Notification Flyout Dropdown */}
            {notifDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "42px",
                  right: 0,
                  width: "340px",
                  background: D.surf0,
                  border: `1px solid ${D.borderMed}`,
                  borderRadius: D.lg,
                  boxShadow: "0 12px 35px rgba(0,0,0,0.45)",
                  zIndex: 1000,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ padding: "12px 14px", borderBottom: `1px solid ${D.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: D.surf1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontFamily: D.head, fontSize: "12px", fontWeight: 800, color: D.textPrimary }}>
                      Live Alerts & Feed
                    </span>
                    <span style={{ fontFamily: D.mono, fontSize: "9px", padding: "1px 5px", borderRadius: D.pill, background: `${D.indigo}25`, color: D.indigo, fontWeight: 700 }}>
                      {unreadAlertsCount} unread
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setNavAlerts(prev => prev.map(a => ({ ...a, read: true })));
                    }}
                    style={{ background: "none", border: "none", color: D.textMuted, fontFamily: D.head, fontSize: "10px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Mark all read
                  </button>
                </div>

                <div style={{ maxHeight: "280px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
                  {authorizedNavAlerts.length === 0 ? (
                    <div style={{ padding: "20px 14px", textAlign: "center", color: D.textMuted, fontFamily: D.body, fontSize: "11px" }}>
                      No active alerts for {ROLES[role]?.label || role}
                    </div>
                  ) : (
                    authorizedNavAlerts.map(item => (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (item.targetPage) setPage(item.targetPage);
                          setNavAlerts(prev => prev.map(a => a.id === item.id ? { ...a, read: true } : a));
                          setNotifDropdownOpen(false);
                        }}
                        style={{
                          padding: "10px 14px",
                          borderBottom: `1px solid ${D.border}33`,
                          background: !item.read ? `${D.indigo}0c` : "transparent",
                          cursor: "pointer",
                          display: "flex",
                          gap: "10px",
                          alignItems: "flex-start",
                        }}
                      >
                        <div style={{ fontSize: "16px", marginTop: "2px" }}>{item.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700, color: D.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {item.title}
                            </span>
                            <span style={{ fontFamily: D.mono, fontSize: "9px", color: D.textMuted, flexShrink: 0 }}>
                              {item.time}
                            </span>
                          </div>
                          <div style={{ fontFamily: D.body, fontSize: "10px", color: D.textSecondary, marginTop: "2px", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {item.body}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ padding: "8px 12px", borderTop: `1px solid ${D.border}`, background: D.surf1, textAlign: "center" }}>
                  <button
                    onClick={() => {
                      setPage("notifications");
                      setNotifDropdownOpen(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "6px 0",
                      background: "transparent",
                      border: "none",
                      color: D.sky || D.indigo,
                      fontFamily: D.head,
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Open Unified Inbox & Alerts →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Theme switcher */}
          <button
            onClick={() => setIsDark(prev => !prev)}
            className="pressBtn"
            style={{ width: "32px", height: "32px", borderRadius: "50%", background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </header>

        {/* Floating Top Toast Notification Banner */}
        {toastNotification && (
          <div
            style={{
              position: "fixed",
              top: "64px",
              right: "24px",
              zIndex: 9999,
              maxWidth: "400px",
              width: "calc(100vw - 48px)",
              background: D.surf0,
              border: `1px solid ${D.indigo}66`,
              borderRadius: D.lg,
              boxShadow: `0 12px 36px rgba(0,0,0,0.5), 0 0 16px ${D.indigo}30`,
              padding: "12px 16px",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <div style={{ fontSize: "22px", flexShrink: 0, marginTop: "2px" }}>
              {toastNotification.icon || "🔔"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                <span style={{ fontFamily: D.head, fontSize: "12px", fontWeight: 800, color: D.textPrimary }}>
                  {toastNotification.title}
                </span>
                <span style={{ fontFamily: D.mono, fontSize: "9px", color: D.textMuted }}>
                  Just now
                </span>
              </div>
              <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textSecondary, marginTop: "2px", lineHeight: 1.4 }}>
                {toastNotification.body}
              </div>
              {toastNotification.targetPage && (
                <button
                  onClick={() => {
                    setPage(toastNotification.targetPage!);
                    setToastNotification(null);
                  }}
                  style={{
                    marginTop: "6px",
                    padding: "3px 8px",
                    borderRadius: D.sm,
                    background: `${D.indigo}20`,
                    border: `1px solid ${D.indigo}44`,
                    color: D.sky || D.indigo,
                    fontFamily: D.head,
                    fontSize: "10px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  View in {NAV_META[toastNotification.targetPage]?.label || "Module"} →
                </button>
              )}
            </div>
            <button
              onClick={() => setToastNotification(null)}
              style={{
                background: "none",
                border: "none",
                color: D.textMuted,
                cursor: "pointer",
                fontSize: "14px",
                padding: "0 2px",
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Saturday Circuit Live Matches Ticker */}
        <div
          style={{
            background: D.surf2, borderBottom: `1px solid ${D.border}`,
            padding: "8px 20px", display: "flex", alignItems: "center", gap: "12px",
            overflowX: "auto", whiteSpace: "nowrap", flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: D.emerald }} />
            <span style={{ fontFamily: D.mono, fontSize: "10px", fontWeight: 700, color: D.emerald, textTransform: "uppercase" }}>KZN Circuit Live</span>
          </div>
          {liveMatches.map(m => {
            const sc = liveScores[m.id] || { runs: 140, wkts: 3, overStr: "14.0" };
            const isMatchOfActiveSchool = m.schoolId === activeSchool.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  if (m.schoolId) setActiveSchoolId(m.schoolId);
                  setActiveScorerMatch(m);
                }}
                className="pressBtn"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px", padding: "4px 12px",
                  borderRadius: D.pill, background: isMatchOfActiveSchool ? `${schoolPrimary}22` : D.surf1,
                  border: `1px solid ${isMatchOfActiveSchool ? schoolPrimary : D.border}`,
                  cursor: "pointer", flexShrink: 0,
                }}
              >
                <span style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700, color: D.textPrimary }}>
                  {m.homeTeam.split(" ")[0]} vs {m.awayTeam.split(" ")[0]}
                </span>
                <span style={{ fontFamily: D.mono, fontSize: "11px", fontWeight: 700, color: D.emerald }}>
                  {sc.runs}/{sc.wkts} ({sc.overStr} ov)
                </span>
              </button>
            );
          })}
        </div>

        {/* Content View Router */}
        <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {page === "dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* School Heritage Banner */}
              <Card
                sx={{
                  padding: "20px 24px",
                  background: `linear-gradient(135deg, ${schoolPrimary}24 0%, ${D.surf1} 100%)`,
                  border: `1px solid ${schoolPrimary}44`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "24px" }}>{activeSchool.crestIcon}</span>
                      <Badge color={schoolPrimary}>{activeSchool.region} · Established {activeSchool.founded}</Badge>
                      <Badge color={D.sky}>Head of Cricket: {activeSchool.headOfCricket}</Badge>
                    </div>
                    <h1 style={{ fontFamily: D.head, fontSize: "22px", fontWeight: 800, color: D.textPrimary, margin: "4px 0" }}>
                      {activeSchool.name}
                    </h1>
                    <div style={{ fontFamily: D.body, fontSize: "13px", color: D.textSecondary }}>
                      &ldquo;{activeSchool.motto}&rdquo; · Main Venue: <strong style={{ color: D.textPrimary }}>{activeSchool.mainOval}</strong>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Btn
                      variant="success"
                      size="sm"
                      onClick={() => {
                        setActiveScorerMatch(activeHeroMatch);
                        setScorerOpen(true);
                      }}
                    >
                      🏏 Launch Broadcast Scorer
                    </Btn>
                    <Btn variant="tonal" size="sm" onClick={() => setPage("fields")}>
                      🌿 Turfgrass Telemetry
                    </Btn>
                  </div>
                </div>

                {/* Trophy & Honors Ticker */}
                <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: `1px solid ${D.border}`, display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <span style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>Honors Cabinet:</span>
                  {activeSchool.trophies.map((t, idx) => (
                    <span key={idx} style={{ fontFamily: D.body, fontSize: "11px", padding: "2px 8px", borderRadius: D.pill, background: D.surf2, border: `1px solid ${D.border}`, color: D.textSecondary }}>
                      🏆 {t}
                    </span>
                  ))}
                </div>
              </Card>

              {/* Dynamic KPI Metrics for Active School */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <KPICard label="Active Players" value={activeSchool.stats.activePlayers} sub="1st XI, U16A, U15A, U14A" icon="👥" color={D.sky} />
                <KPICard label="League Standing" value={activeSchool.stats.leaguePos} sub="KZN Super League 2026" icon="🏆" color={D.amber} />
                <KPICard label="Win Rate" value={activeSchool.stats.winRate} sub="5-Match Form: " icon="📈" color={D.emerald} />
                <KPICard label="Provincial Reps" value={activeSchool.stats.provincialReps} sub="SA Schools & KZN Inland/Coastal" icon="🇿🇦" color={D.violet} />
                <KPICard label="Injuries Restricted" value={schoolInjuries.length} sub="Under Medical Protocol" icon="🏥" color={D.rose} />
              </div>

              {/* Interactive Live Match Hero Card */}
              {activeHeroMatch && (
                <Card sx={{ padding: "20px", background: `linear-gradient(135deg, ${D.emerald}12, ${D.surf1})`, border: `1px solid ${D.emerald}33` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
                    <div style={{ flex: 1, minWidth: "280px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Badge color={D.emerald}>● Live Match in Progress</Badge>
                        <span style={{ fontFamily: D.mono, fontSize: "11px", color: D.textMuted }}>{activeHeroMatch.format} Match · {activeHeroMatch.venue}</span>
                      </div>
                      <div style={{ fontFamily: D.head, fontSize: "20px", fontWeight: 800, marginTop: "8px" }}>
                        {activeHeroMatch.homeTeam} vs {activeHeroMatch.awayTeam}
                      </div>

                      {/* Live Score Ticker with Interactive Quick Run Simulator */}
                      {(() => {
                        const curScore = liveScores[activeHeroMatch.id] || { runs: 142, wkts: 3, overStr: "14.2" };
                        return (
                          <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginTop: "4px" }}>
                            <div style={{ fontFamily: D.mono, fontSize: "34px", fontWeight: 700, color: D.emerald }}>
                              {curScore.runs}/{curScore.wkts}{" "}
                              <span style={{ fontSize: "16px", color: D.textMuted }}>({curScore.overStr} ov)</span>
                            </div>
                            <span style={{ fontFamily: D.mono, fontSize: "12px", color: D.textMuted }}>Target: {activeHeroMatch.target || "245"}</span>
                          </div>
                        );
                      })()}

                      <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textSecondary, marginTop: "4px" }}>
                        {activeHeroMatch.battingTeam} Batting · <strong style={{ color: D.textPrimary }}>{activeHeroMatch.strikerSummary}</strong>
                      </div>
                      <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, marginTop: "4px" }}>
                        {activeHeroMatch.summary}
                      </div>

                      {/* Interactive Quick Scoring Simulator Bar */}
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "12px", flexWrap: "wrap" }}>
                        <span style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, textTransform: "uppercase" }}>Interactive Ball Sim:</span>
                        <button
                          onClick={() => handleSimulateBall(activeHeroMatch.id, 1)}
                          style={{ padding: "3px 8px", borderRadius: D.pill, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.mono, fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                        >
                          +1 Single
                        </button>
                        <button
                          onClick={() => handleSimulateBall(activeHeroMatch.id, 4)}
                          style={{ padding: "3px 8px", borderRadius: D.pill, background: `${D.emerald}20`, border: `1px solid ${D.emerald}44`, color: D.emerald, fontFamily: D.mono, fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                        >
                          +4 Four!
                        </button>
                        <button
                          onClick={() => handleSimulateBall(activeHeroMatch.id, 6)}
                          style={{ padding: "3px 8px", borderRadius: D.pill, background: `${D.sky}20`, border: `1px solid ${D.sky}44`, color: D.sky, fontFamily: D.mono, fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                        >
                          +6 Six!
                        </button>
                        <button
                          onClick={() => handleSimulateBall(activeHeroMatch.id, 0, true)}
                          style={{ padding: "3px 8px", borderRadius: D.pill, background: `${D.rose}20`, border: `1px solid ${D.rose}44`, color: D.rose, fontFamily: D.mono, fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                        >
                          W Wicket!
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <Btn
                        variant="success"
                        size="md"
                        onClick={() => handleLaunchScorer(activeHeroMatch)}
                      >
                        🏏 Open Live Scorer →
                      </Btn>
                      <Btn
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenScorecard(activeHeroMatch.id)}
                      >
                        📊 Full Scorecard & Phases
                      </Btn>
                      <Btn
                        variant="tonal"
                        size="sm"
                        onClick={() => {
                          setPage("analytics");
                          setAnalyticsSubTab("analytics");
                        }}
                      >
                        📈 Match Analytics & Worm
                      </Btn>
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPage("analytics");
                          setAnalyticsSubTab("wagon");
                        }}
                      >
                        🎯 360° Wagon Wheel
                      </Btn>
                    </div>
                  </div>
                </Card>
              )}

              {/* Derby Day Matrix & Simulator Module */}
              <Card sx={{ padding: "20px" }}>
                <SectionHeader
                  title={`${activeDerby.derbyTitle}`}
                  sub={`${activeDerby.schoolA} vs ${activeDerby.schoolB} · Contested since ${activeDerby.sinceYear} · ${activeDerby.trophyName}`}
                  color={D.amber}
                  actions={
                    <Btn
                      variant="primary"
                      size="sm"
                      onClick={runDerbySimulator}
                      disabled={derbySimRunning}
                    >
                      {derbySimRunning ? "Simulating Match..." : "⚡ Simulate Derby Clash"}
                    </Btn>
                  }
                />

                {/* Head to Head Visual Record */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginTop: "10px" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: D.head, fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                      <span>{activeDerby.schoolA}: {activeDerby.winsA} Wins ({Math.round((activeDerby.winsA / activeDerby.totalClashes) * 100)}%)</span>
                      <span>Draws: {activeDerby.draws}</span>
                      <span>{activeDerby.schoolB}: {activeDerby.winsB} Wins ({Math.round((activeDerby.winsB / activeDerby.totalClashes) * 100)}%)</span>
                    </div>
                    {/* Visual bar */}
                    <div style={{ width: "100%", height: "10px", background: D.surf3, borderRadius: D.pill, overflow: "hidden", display: "flex" }}>
                      <div style={{ width: `${(activeDerby.winsA / activeDerby.totalClashes) * 100}%`, background: schoolPrimary }} />
                      <div style={{ width: `${(activeDerby.draws / activeDerby.totalClashes) * 100}%`, background: D.borderMed }} />
                      <div style={{ width: `${(activeDerby.winsB / activeDerby.totalClashes) * 100}%`, background: schoolSecondary }} />
                    </div>

                    <div style={{ fontFamily: D.mono, fontSize: "11px", color: D.textMuted, marginTop: "8px" }}>
                      Total Official Encounters: <strong>{activeDerby.totalClashes}</strong> matches recorded in historical archives.
                    </div>
                  </div>

                  {/* Recent Clashes Table */}
                  <div>
                    <div style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700, color: D.textMuted, textTransform: "uppercase", marginBottom: "6px" }}>
                      Recent Clashes on Record
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {activeDerby.recentEncounters.map((enc, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: D.surf2, borderRadius: D.md, fontSize: "11px" }}>
                          <div>
                            <strong>{enc.year} ({enc.venue})</strong>: <span style={{ color: D.emerald }}>{enc.winner} won by {enc.margin}</span>
                          </div>
                          <span style={{ fontFamily: D.mono, color: D.textMuted }}>{enc.starPerformer}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Derby Simulation Result Banner */}
                {derbySimResult && (
                  <div style={{ marginTop: "16px", padding: "12px 16px", borderRadius: D.md, background: `${D.amber}18`, border: `1px solid ${D.amber}44`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <Badge color={D.amber}>Derby AI Projection Engine</Badge>
                      <div style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 800, color: D.textPrimary, marginTop: "4px" }}>
                        Projected Winner: <span style={{ color: D.amber }}>{derbySimResult.projectedWinner}</span> ({derbySimResult.probA}% vs {derbySimResult.probB}%)
                      </div>
                      <div style={{ fontFamily: D.mono, fontSize: "11px", color: D.textSecondary, marginTop: "2px" }}>
                        Projected Scoreline: {derbySimResult.predictedScore} · Key Clash: {derbySimResult.keyMatchup}
                      </div>
                    </div>
                    <Btn
                      variant="tonal"
                      size="sm"
                      onClick={() => {
                        setPage("scouting");
                      }}
                    >
                      Open AI Scouting Suite →
                    </Btn>
                  </div>
                )}
              </Card>

              {/* Pitch Conditions & Home Ground Curator Telemetry */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
                <Card sx={{ padding: "18px" }}>
                  <SectionHeader title={`Venue Conditions: ${schoolPitch.name}`} color={D.teal} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: D.body, fontSize: "12px" }}>
                        <span>Pitch Surface:</span>
                        <strong style={{ color: D.textPrimary }}>{schoolPitch.surface}</strong>
                      </div>
                    </div>

                    {/* Sensor Meters */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div style={{ padding: "10px", background: D.surf2, borderRadius: D.md }}>
                        <div style={{ fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>SOIL MOISTURE</div>
                        <div style={{ fontFamily: D.mono, fontSize: "20px", fontWeight: 700, color: D.sky }}>{schoolPitch.moisturePct}%</div>
                        <div style={{ fontFamily: D.body, fontSize: "10px", color: D.textMuted }}>Target: 22-26%</div>
                      </div>
                      <div style={{ padding: "10px", background: D.surf2, borderRadius: D.md }}>
                        <div style={{ fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>GRASS CUT HEIGHT</div>
                        <div style={{ fontFamily: D.mono, fontSize: "20px", fontWeight: 700, color: D.emerald }}>{schoolPitch.grassHeightMm} mm</div>
                        <div style={{ fontFamily: D.body, fontSize: "10px", color: D.textMuted }}>Roller: {schoolPitch.rollerCompaction}</div>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div style={{ padding: "10px", background: D.surf2, borderRadius: D.md }}>
                        <div style={{ fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>BOUNCE RATING</div>
                        <div style={{ fontFamily: D.mono, fontSize: "18px", fontWeight: 700, color: D.amber }}>{schoolPitch.bounceRating} / 10</div>
                      </div>
                      <div style={{ padding: "10px", background: D.surf2, borderRadius: D.md }}>
                        <div style={{ fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>PACE RATING</div>
                        <div style={{ fontFamily: D.mono, fontSize: "18px", fontWeight: 700, color: D.rose }}>{schoolPitch.paceRating} / 10</div>
                      </div>
                    </div>

                    <div style={{ padding: "10px", background: `${D.teal}12`, borderRadius: D.md, border: `1px solid ${D.teal}33` }}>
                      <div style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.teal, textTransform: "uppercase" }}>Curator Match Morning Assessment</div>
                      <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textSecondary, marginTop: "3px" }}>
                        {schoolPitch.curatorNotes}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* School Squad Health & RTP Medical Status */}
                <Card sx={{ padding: "18px" }}>
                  <SectionHeader title={`${activeSchool.shortName} Health & Physio Status`} color={D.rose} />
                  {schoolInjuries.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {schoolInjuries.map(inj => {
                        const pl = PLAYERS.find(p => p.id === inj.player);
                        const pct = pctDays(inj.dateInj, inj.rtw);
                        return (
                          <div key={inj.id} style={{ padding: "12px", background: D.surf2, borderRadius: D.md, display: "flex", flexDirection: "column", gap: "6px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontFamily: D.head, fontSize: "13px", fontWeight: 700 }}>{pl?.name} ({pl?.team})</span>
                              <Badge color={D.rose}>{inj.phase}</Badge>
                            </div>
                            <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted }}>{inj.type} · Target Return: {inj.rtw}</div>
                            <div style={{ width: "100%", height: "5px", background: D.surf3, borderRadius: "3px", overflow: "hidden" }}>
                              <div style={{ width: `${pct}%`, height: "100%", background: D.rose }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ padding: "24px 12px", textAlign: "center", color: D.textMuted }}>
                      <span style={{ fontSize: "28px" }}>✅</span>
                      <div style={{ fontFamily: D.head, fontSize: "13px", fontWeight: 700, color: D.emerald, marginTop: "8px" }}>
                        Full Squad Fit & Available
                      </div>
                      <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, marginTop: "2px" }}>
                        No players currently on clinical RTP restriction at {activeSchool.shortName}.
                      </div>
                    </div>
                  )}

                  {/* Upcoming school fixtures */}
                  <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: `1px solid ${D.border}` }}>
                    <div style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700, color: D.textMuted, textTransform: "uppercase", marginBottom: "8px" }}>
                      Next Scheduled Fixture
                    </div>
                    {allSchoolMatches.filter(m => m.status === "upcoming").slice(0, 1).map(m => (
                      <div key={m.id} style={{ padding: "10px", background: D.surf2, borderRadius: D.md, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontFamily: D.body, fontSize: "12px", fontWeight: 600 }}>{m.homeTeam} vs {m.awayTeam}</div>
                          <div style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>{m.date} · 📍 {m.venue}</div>
                        </div>
                        {m.transport && <Badge color={D.amber}>🚌 Bus {m.transport.depart}</Badge>}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Matches & Match Centre View */}
          {page === "matches" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <SectionHeader
                title="Match Centre & Fixtures"
                sub="Live scores, completed scorecards, fixtures and pitch conditions"
                color={D.emerald}
                actions={
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <Btn
                      variant={matchScopeFilter === "school" ? "primary" : "ghost"}
                      size="sm"
                      onClick={() => setMatchScopeFilter("school")}
                    >
                      {activeSchool.shortName} Fixtures
                    </Btn>
                    <Btn
                      variant={matchScopeFilter === "all" ? "primary" : "ghost"}
                      size="sm"
                      onClick={() => setMatchScopeFilter("all")}
                    >
                      All KZN Circuit ({MATCHES.length})
                    </Btn>
                    <Btn
                      variant={matchScopeFilter === "live" ? "primary" : "ghost"}
                      size="sm"
                      onClick={() => setMatchScopeFilter("live")}
                    >
                      Live Matches ({liveMatches.length})
                    </Btn>
                    <Btn variant="success" size="sm" onClick={() => setScorerOpen(true)}>
                      🏏 Open Scorer
                    </Btn>
                  </div>
                }
              />

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {(matchScopeFilter === "school"
                  ? allSchoolMatches
                  : matchScopeFilter === "live"
                  ? liveMatches
                  : MATCHES
                ).map(m => {
                  const w = WEATHER[m.id];
                  const sc = liveScores[m.id];
                  return (
                    <Card key={m.id} sx={{ padding: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                        <div style={{ flex: 1, minWidth: "260px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                            <Badge color={m.status === "live" ? D.emerald : m.status === "complete" ? D.sky : D.amber}>{m.status}</Badge>
                            <span style={{ fontFamily: D.mono, fontSize: "11px", color: D.textMuted }}>{m.date} · {m.time}</span>
                            {w && <span style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted }}>{w.icon} {w.tempC}°C {w.condition}</span>}
                          </div>
                          <div style={{ fontFamily: D.head, fontSize: "16px", fontWeight: 700 }}>{m.homeTeam} vs {m.awayTeam}</div>
                          <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted, marginTop: "2px" }}>📍 {m.venue}</div>

                          {m.status === "live" && sc && (
                            <div style={{ fontFamily: D.mono, fontSize: "18px", fontWeight: 700, color: D.emerald, marginTop: "4px" }}>
                              {sc.runs}/{sc.wkts} ({sc.overStr} ov)
                            </div>
                          )}

                          {m.result && <div style={{ fontFamily: D.body, fontSize: "12px", color: D.emerald, fontWeight: 600, marginTop: "4px" }}>{m.result}</div>}
                          {m.summary && <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, marginTop: "2px" }}>{m.summary}</div>}
                        </div>

                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                          <Btn
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenScorecard(m.id)}
                          >
                            📊 Scorecard & Phases
                          </Btn>
                          <Btn
                            variant="tonal"
                            size="sm"
                            onClick={() => {
                              setPage("analytics");
                              setAnalyticsSubTab("analytics");
                            }}
                          >
                            📈 Live Analytics
                          </Btn>
                          {m.status === "live" && (
                            <Btn
                              variant="success"
                              size="sm"
                              onClick={() => handleLaunchScorer(m)}
                            >
                              🏏 Live Scorer →
                            </Btn>
                          )}
                          <Btn variant="ghost" size="sm" onClick={() => { setPage("analytics"); setAnalyticsSubTab("drs"); }}>
                            📺 DRS
                          </Btn>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Competitions & Leagues View */}
          {(page === "competitions" || page === "leagues") && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <SectionHeader title="Competitions & League Standings" sub="KZN Schools Tournaments and Official Standings" color={D.amber} />
              <Card sx={{ padding: "16px" }}>
                <div style={{ fontFamily: D.head, fontSize: "15px", fontWeight: 700, marginBottom: "12px" }}>{COMPETITIONS[0].name}</div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "550px" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${D.border}`, textAlign: "left" }}>
                        <th style={{ padding: "8px", fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>#</th>
                        <th style={{ padding: "8px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>INSTITUTION</th>
                        <th style={{ padding: "8px", fontFamily: D.mono, fontSize: "10px", color: D.textMuted, textAlign: "center" }}>P</th>
                        <th style={{ padding: "8px", fontFamily: D.mono, fontSize: "10px", color: D.textMuted, textAlign: "center" }}>W</th>
                        <th style={{ padding: "8px", fontFamily: D.mono, fontSize: "10px", color: D.textMuted, textAlign: "center" }}>L</th>
                        <th style={{ padding: "8px", fontFamily: D.mono, fontSize: "10px", color: D.textMuted, textAlign: "center" }}>PTS</th>
                        <th style={{ padding: "8px", fontFamily: D.mono, fontSize: "10px", color: D.textMuted, textAlign: "right" }}>NRR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {COMPETITIONS[0].table.map((row, idx) => {
                        const isCurrentSchool = row.schoolId === activeSchool.id;
                        return (
                          <tr key={row.team} style={{ borderBottom: `1px solid ${D.border}`, background: isCurrentSchool ? `${schoolPrimary}20` : "transparent" }}>
                            <td style={{ padding: "10px 8px", fontFamily: D.mono, fontSize: "12px", color: idx === 0 ? D.amber : D.textMuted }}>{idx + 1}</td>
                            <td style={{ padding: "10px 8px", fontFamily: D.body, fontSize: "13px", fontWeight: isCurrentSchool ? 800 : 600, color: isCurrentSchool ? D.textPrimary : D.textSecondary }}>
                              {row.team} {isCurrentSchool && <span style={{ color: schoolPrimary, fontSize: "10px" }}>(Selected)</span>}
                            </td>
                            <td style={{ padding: "10px 8px", fontFamily: D.mono, fontSize: "12px", textAlign: "center" }}>{row.P}</td>
                            <td style={{ padding: "10px 8px", fontFamily: D.mono, fontSize: "12px", textAlign: "center", color: D.emerald }}>{row.W}</td>
                            <td style={{ padding: "10px 8px", fontFamily: D.mono, fontSize: "12px", textAlign: "center", color: D.rose }}>{row.L}</td>
                            <td style={{ padding: "10px 8px", fontFamily: D.mono, fontSize: "13px", fontWeight: 700, textAlign: "center", color: D.textPrimary }}>{row.pts}</td>
                            <td style={{ padding: "10px 8px", fontFamily: D.mono, fontSize: "12px", textAlign: "right", color: row.nrr >= 0 ? D.emerald : D.rose }}>{row.nrr >= 0 ? `+${row.nrr.toFixed(2)}` : row.nrr.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Squad & Multi-Tier Coaching Management */}
          {page === "squad" && (
            <MultiSquadCoachView
              theme={D}
              activeSchoolId={activeSchool.id}
              currentRole={role}
              selectedSquadId={selectedSquadId}
              onSelectSquad={(squadId) => setSelectedSquadId(squadId)}
              onSelectPlayerProfile={(p) => {
                setSelectedPlayer(p);
                setPage("profiles");
              }}
              onNavigateToSkills={() => setPage("skills")}
            />
          )}

          {/* Profiles View */}
          {page === "profiles" && selectedPlayer && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <SectionHeader title={`Player Profile: ${selectedPlayer.name}`} sub={`${selectedPlayer.team} · ${selectedPlayer.role} · ${activeSchool.name}`} color={schoolPrimary} />
                <div style={{ width: "360px", maxWidth: "100%" }}>
                  <PlayerSearchFilterSelect
                    theme={D}
                    players={PLAYERS}
                    selectedPlayerId={selectedPlayer.id}
                    onSelectPlayer={p => {
                      setSelectedPlayer(p);
                      if (p.school !== activeSchoolId) {
                        setActiveSchoolId(p.school);
                      }
                    }}
                    label="SWITCH PLAYER PROFILE (1000+)"
                    placeholder="Search any player across all schools..."
                    accentColor={schoolPrimary}
                    compact
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
                <Card sx={{ padding: "20px" }}>
                  <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                    <Avatar name={selectedPlayer.name} size={64} color={schoolPrimary} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: D.head, fontSize: "18px", fontWeight: 800 }}>
                        {selectedPlayer.name} {selectedPlayer.cap === "c" && <span style={{ color: D.amber }}>© (Captain)</span>}
                      </div>
                      <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted }}>{selectedPlayer.bio}</div>
                      <div style={{ fontFamily: D.mono, fontSize: "11px", color: D.textSecondary, marginTop: "4px" }}>
                        Born: {selectedPlayer.born} · House: {selectedPlayer.houseAtSchool} · Bowl: {selectedPlayer.bowlArm}A{selectedPlayer.bowlStyle}
                      </div>
                    </div>
                  </div>

                  {/* Batting Stance Profile Definition (RHS vs LHS) */}
                  <div style={{ marginTop: "14px", padding: "12px", background: D.surf2, borderRadius: D.md, border: `1px solid ${selectedPlayer.batHand === "R" ? D.sky : D.amber}44`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 800, color: D.textMuted, letterSpacing: "0.05em" }}>
                        DEFINED BATTING STANCE (3-PHASE SCORING ENGINE)
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                        <span style={{ fontFamily: D.head, fontSize: "13px", fontWeight: 800, color: selectedPlayer.batHand === "R" ? D.sky : D.amber }}>
                          🏏 {selectedPlayer.batHand === "R" ? "Right-Hand Stance (RHS)" : "Left-Hand Stance (LHS)"}
                        </span>
                        <span style={{ fontFamily: D.mono, fontSize: "10px", padding: "2px 6px", borderRadius: D.pill, background: `${selectedPlayer.batHand === "R" ? D.sky : D.amber}22`, color: selectedPlayer.batHand === "R" ? D.sky : D.amber }}>
                          {selectedPlayer.batHand === "R" ? "Off = Left / Leg = Right" : "Off = Right / Leg = Left (Mirrored)"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        selectedPlayer.batHand = selectedPlayer.batHand === "R" ? "L" : "R";
                        setSelectedPlayer({ ...selectedPlayer });
                      }}
                      style={{
                        padding: "6px 12px",
                        borderRadius: D.pill,
                        background: D.surf3,
                        border: `1px solid ${D.border}`,
                        color: D.textPrimary,
                        fontFamily: D.head,
                        fontSize: "11px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      ⇄ Toggle Stance
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginTop: "18px" }}>
                    <div style={{ padding: "10px", background: D.surf2, borderRadius: D.md, textAlign: "center" }}>
                      <div style={{ fontFamily: D.mono, fontSize: "20px", fontWeight: 700, color: D.emerald }}>{selectedPlayer.avg}</div>
                      <div style={{ fontFamily: D.head, fontSize: "9px", color: D.textMuted }}>BATTING AVG</div>
                    </div>
                    <div style={{ padding: "10px", background: D.surf2, borderRadius: D.md, textAlign: "center" }}>
                      <div style={{ fontFamily: D.mono, fontSize: "20px", fontWeight: 700, color: D.sky }}>{selectedPlayer.sr}</div>
                      <div style={{ fontFamily: D.head, fontSize: "9px", color: D.textMuted }}>STRIKE RATE</div>
                    </div>
                    <div style={{ padding: "10px", background: D.surf2, borderRadius: D.md, textAlign: "center" }}>
                      <div style={{ fontFamily: D.mono, fontSize: "20px", fontWeight: 700, color: D.violet }}>{selectedPlayer.wkts}</div>
                      <div style={{ fontFamily: D.head, fontSize: "9px", color: D.textMuted }}>TOTAL WICKETS</div>
                    </div>
                  </div>

                  {selectedPlayer.careerTotals && (
                    <div style={{ marginTop: "14px", padding: "10px", background: D.surf2, borderRadius: D.md, display: "flex", justifyContent: "space-between", fontFamily: D.mono, fontSize: "11px" }}>
                      <span>Innings: <strong>{selectedPlayer.careerTotals.innings}</strong></span>
                      <span>Runs: <strong>{selectedPlayer.careerTotals.runs}</strong></span>
                      <span>High Score: <strong>{selectedPlayer.careerTotals.hs}*</strong></span>
                      <span>50s: <strong>{selectedPlayer.careerTotals.fifties}</strong></span>
                      <span>100s: <strong>{selectedPlayer.careerTotals.hundreds}</strong></span>
                    </div>
                  )}
                </Card>

                {/* Skill Attributes */}
                <Card sx={{ padding: "20px" }}>
                  <div style={{ fontFamily: D.head, fontSize: "13px", fontWeight: 700, marginBottom: "12px" }}>TECHNICAL SKILL METRICS</div>
                  {SKILLS_MATRIX[selectedPlayer.id] ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {Object.entries(SKILLS_MATRIX[selectedPlayer.id].batting || {}).map(([skill, val]) => (
                        <div key={skill}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: D.body, fontSize: "11px", marginBottom: "3px" }}>
                            <span style={{ textTransform: "capitalize" }}>{skill}</span>
                            <span style={{ fontFamily: D.mono, fontWeight: 700, color: D.sky }}>{Number(val)}</span>
                          </div>
                          <div style={{ width: "100%", height: "5px", background: D.surf3, borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ width: `${Number(val)}%`, height: "100%", background: D.sky }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {[
                        { name: "Front Foot Defense", val: 86 },
                        { name: "Cover Drive Execution", val: 91 },
                        { name: "Pull / Hook Control", val: 82 },
                        { name: "Running Between Wickets", val: 88 },
                        { name: "Throwing Accuracy", val: 85 },
                      ].map(item => (
                        <div key={item.name}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: D.body, fontSize: "11px", marginBottom: "3px" }}>
                            <span>{item.name}</span>
                            <span style={{ fontFamily: D.mono, fontWeight: 700, color: D.emerald }}>{item.val}</span>
                          </div>
                          <div style={{ width: "100%", height: "5px", background: D.surf3, borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ width: `${item.val}%`, height: "100%", background: D.emerald }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* Analytics View (Match Analytics, Phase Scoring, Wagon Wheel & DRS Telemetry) */}
          {page === "analytics" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <SectionHeader title="Match Telemetry & Shot Analytics" sub="Live Manhattan charts, Worm curves, 360° Wagon Wheel, Phase dynamics, and Hawkeye DRS" color={D.sky} />
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <Btn
                    variant={analyticsSubTab === "analytics" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setAnalyticsSubTab("analytics")}
                  >
                    📈 Match Telemetry & Worm
                  </Btn>
                  <Btn
                    variant={analyticsSubTab === "phases" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setAnalyticsSubTab("phases")}
                  >
                    ⏱️ Phase Scoring Dynamics
                  </Btn>
                  <Btn
                    variant={analyticsSubTab === "wagon" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setAnalyticsSubTab("wagon")}
                  >
                    🎯 360° Wagon Wheel
                  </Btn>
                  <Btn
                    variant={analyticsSubTab === "drs" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setAnalyticsSubTab("drs")}
                  >
                    📺 Hawk-Eye DRS Review
                  </Btn>
                </div>
              </div>

              {analyticsSubTab === "analytics" && (
                <MatchAnalyticsView
                  theme={D}
                  activeSchoolId={activeSchool.id}
                  scorecard={MATCH_SCORECARDS[activeHeroMatch?.id || "m1"] || MATCH_SCORECARDS["m1"]}
                  onOpenScorer={() => handleLaunchScorer()}
                />
              )}

              {analyticsSubTab === "phases" && (
                <PhaseScoringView
                  theme={D}
                  scorecard={MATCH_SCORECARDS[activeHeroMatch?.id || "m1"] || MATCH_SCORECARDS["m1"]}
                />
              )}

              {analyticsSubTab === "wagon" && (
                <WagonWheel
                  theme={D}
                  shots={SHOT_DATA_SAMPLE}
                  batsmanName={selectedPlayer?.name || "J. Whitfield"}
                  inningsSummary="67 runs off 44 balls · Strike Rate 152.27"
                />
              )}

              {analyticsSubTab === "drs" && (
                <DRSReview theme={D} />
              )}
            </div>
          )}

          {/* Squad Skills Matrix & Player Development Passport */}
          {page === "skills" && (
            <SkillsMatrixView
              theme={D}
              players={PLAYERS}
              currentRole={role}
              activeSchoolId={activeSchool.id}
              currentUser={role === "player" ? "James Whitfield" : role === "parent" ? "David Whitfield (Parent)" : "Wayne Scott (Coach)"}
              onNavigateToScouting={() => setPage("scouting")}
              onSelectPlayerProfile={(p) => {
                setSelectedPlayer(p);
                setPage("profiles");
              }}
            />
          )}

          {/* Talent Discovery & AI Scouting Hub */}
          {page === "scouting" && (
            <ScoutingHub
              theme={D}
              players={PLAYERS}
              currentRole={role}
              activeSchoolId={activeSchool.id}
              onNavigateToSkills={() => setPage("skills")}
            />
          )}

          {/* Commercial & Sponsorship Management */}
          {page === "sponsorship" && <CommercialView theme={D} activeSchoolId={activeSchool.id} />}

          {/* POPIA Compliance & RBAC Governance */}
          {page === "governance" && <GovernanceView theme={D} activeSchoolId={activeSchool.id} />}

          {/* Training & Drills View */}
          {page === "training" && <TrainingView theme={D} players={PLAYERS} />}

          {/* Injuries & Physio Command View */}
          {page === "injuries" && <InjuriesView theme={D} players={PLAYERS} />}

          {/* Logistics & Fleet Operations */}
          {page === "logistics" && <LogisticsView theme={D} />}

          {/* Fields & Turfgrass Management */}
          {page === "fields" && <FieldsView theme={D} />}

          {/* Master Strategic Calendar */}
          {page === "calendar" && <CalendarView theme={D} onOpenScorer={() => handleLaunchScorer()} />}

          {/* Unified Inbox & System Alerts */}
          {(page === "notifications" || page === "inbox") && (
            <NotificationsView
              theme={D}
              currentRole={role}
              onNavigate={(targetPage) => setPage(targetPage)}
              onTriggerToast={triggerToast}
            />
          )}

          {/* Staff & User Management */}
          {page === "staff" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <SectionHeader title="Staff & Access Control" sub="Role-Based Permissions for Registered School Personnel" color={D.violet} />
              <Card sx={{ padding: "16px" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${D.border}`, textAlign: "left" }}>
                        <th style={{ padding: "8px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>NAME</th>
                        <th style={{ padding: "8px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>EMAIL</th>
                        <th style={{ padding: "8px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>ROLE</th>
                        <th style={{ padding: "8px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} style={{ borderBottom: `1px solid ${D.border}` }}>
                          <td style={{ padding: "10px 8px", fontFamily: D.body, fontSize: "13px", fontWeight: 600 }}>{u.name}</td>
                          <td style={{ padding: "10px 8px", fontFamily: D.mono, fontSize: "12px", color: D.textMuted }}>{u.email}</td>
                          <td style={{ padding: "10px 8px" }}><Badge color={ROLES[u.role]?.color || D.indigo}>{ROLES[u.role]?.label || u.role}</Badge></td>
                          <td style={{ padding: "10px 8px" }}><Badge color={D.emerald}>{u.status}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Rulebook & Documentation */}
          {(page === "rulebook" || page === "pitchdeck") && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <SectionHeader title="SCRBRD OS Architecture & Rulebook" sub="Specifications for SA Schools Cricket Governance" color={D.sky} />
              <Card sx={{ padding: "20px" }}>
                <div style={{ fontFamily: D.head, fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>
                  Six-Layer RBAC Security Model
                </div>
                <p style={{ fontFamily: D.body, fontSize: "13px", color: D.textSecondary, lineHeight: "1.6" }}>
                  SCRBRD OS implements strict zero-trust data zoning between Platform Governance, Competition Councils, School Institutions, Sporting Leaders, Participants, and Public Spectators. Sensitive medical health records, bus driver GPS telemetry, and clinical Return-to-Play pipelines are protected under POPIA and child welfare safety standards.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", marginTop: "16px" }}>
                  {ROLE_LAYERS.map(l => (
                    <div key={l.id} style={{ padding: "12px", background: D.surf2, borderRadius: D.md, borderLeft: `3px solid ${l.color}` }}>
                      <div style={{ fontFamily: D.head, fontSize: "12px", fontWeight: 700, color: l.color }}>{l.label}</div>
                      <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, marginTop: "4px" }}>
                        Governs {Object.values(ROLES).filter(r => r.layer === l.id).length} dedicated operational roles.
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
