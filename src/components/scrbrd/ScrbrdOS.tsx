'use client';

import React, { useState, useEffect } from "react";
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
  getSchoolFieldConditions,
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
import PlayerSkillRadarChart from "./PlayerSkillRadarChart";
import LogisticsView from "./LogisticsView";
import FieldsView from "./FieldsView";
import TrainingView from "./TrainingView";
import InjuriesView from "./InjuriesView";
import CalendarView from "./CalendarView";
import NotificationsView, { isRoleAuthorizedForNotification, NotificationCategory } from "./NotificationsView";
import CommercialView from "./CommercialView";
import PromotionDemotionView from "./PromotionDemotionView";
import PerformanceAnalystCockpit from "./PerformanceAnalystCockpit";
import GovernanceView from "./GovernanceView";
import MultiSquadCoachView from "./MultiSquadCoachView";
import StatsGuruQueryEngineView from "./StatsGuruQueryEngineView";
import SettingsView from "./SettingsView";
import LeagueCompetitionsView from "./LeagueCompetitionsView";
import OfficialsView from "./OfficialsView";
import UserProfilesView from "./UserProfilesView";
import RulebookView from "./RulebookView";
import PitchDeckView from "./PitchDeckView";
import MatchesView from "./MatchesView";
import StaffManagementView from "./StaffManagementView";
import HeadToHeadComparisonView from "./HeadToHeadComparisonView";
import RegisterHubView from "./RegisterHubView";
import { SchoolProfileView } from "./SchoolProfileView";
import CoachCockpitView, { TacticalPlanDirective } from "./CoachCockpitView";
import CaptainCockpitView from "./CaptainCockpitView";
import { getSchoolSquads } from "./multiSquadData";
import { ScrbrdLogo } from "./ScrbrdLogo";
import MaterialNav from "./MaterialNav";
import MaterialTopBar from "./MaterialTopBar";
import CommandPaletteModal from "./CommandPaletteModal";
import IntelligenceDrawer from "./IntelligenceDrawer";
import DashboardIntelligenceView from "./DashboardIntelligenceView";
import ReviewConfirmModal from "../scoring/ReviewConfirmModal";
import Image from "next/image";

export default function ScrbrdOS() {
  const [role, setRole] = useState<string>("superadmin");
  const [page, setPage] = useState<string>("dashboard");
  const [historyStack, setHistoryStack] = useState<string[]>(["dashboard"]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activeSchoolId, setActiveSchoolId] = useState<string>("WES");
  const [selectedSquadId, setSelectedSquadId] = useState<string>("WES_1ST");
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isRailNav, setIsRailNav] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [intelligenceDrawerOpen, setIntelligenceDrawerOpen] = useState<boolean>(false);
  const [isCompactDensity, setIsCompactDensity] = useState<boolean>(false);
  const [reviewConfirmOpen, setReviewConfirmOpen] = useState<boolean>(false);
  const [matchesList, setMatchesList] = useState<Match[]>(MATCHES);
  const [h2hPlayers, setH2hPlayers] = useState<{ p1?: string; p2?: string }>({ p1: undefined, p2: undefined });
  const [tacticalPlanDirective, setTacticalPlanDirective] = useState<TacticalPlanDirective | null>(null);
  const [users, setUsers] = useState(() => USERS_INITIAL.map(u => ({
    ...u,
    roles: [u.role || 'coach'],
    assignedSquads: u.schoolId === 'WES' ? ['WES_2ND'] : [],
  })));

  const navigateToPage = (newPage: string) => {
    if (newPage !== page) {
      setHistoryStack(prev => [...prev, newPage]);
      setPage(newPage);
    }
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleGoBack = () => {
    if (historyStack.length > 1) {
      const updated = [...historyStack];
      updated.pop();
      const prevPage = updated[updated.length - 1];
      setHistoryStack(updated);
      setPage(prevPage);
    } else {
      setPage("dashboard");
    }
  };

  const handleCreateMatch = (newMatch: Match) => {
    setMatchesList(prev => [newMatch, ...prev]);
    triggerToast("Match Scheduled", `New fixture scheduled: ${newMatch.homeTeam} vs ${newMatch.awayTeam}`, "match", "matches");
  };

  const handleUpdateMatch = (updatedMatch: Match) => {
    setMatchesList(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));
    triggerToast("Match Updated", `Fixture details updated: ${updatedMatch.homeTeam} vs ${updatedMatch.awayTeam}`, "match", "matches");
  };

  const handleDeleteMatch = (matchId: string) => {
    setMatchesList(prev => prev.filter(m => m.id !== matchId));
    triggerToast("Match Cancelled", "Fixture removed from institutional calendar.", "match", "matches");
  };

  const handleUpdateUser = (updatedUser: any) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setToastNotification({
      id: `toast_${Date.now()}`,
      title: 'User Profile Updated',
      body: `Successfully updated permissions and squad assignments for ${updatedUser.name}.`,
      icon: '👤',
    });
  };
  const [scorerOpen, setScorerOpen] = useState<boolean>(false);
  const [activeScorerMatch, setActiveScorerMatch] = useState<Match | undefined>(undefined);
  const [selectedPlayer, setSelectedPlayer] = useState<Player>(PLAYERS[0]);
  const [analyticsSubTab, setAnalyticsSubTab] = useState<"analytics" | "phases" | "wagon" | "drs" | "cockpit">("analytics");
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

  // Pitch/Field selection for Venue Conditions
  const [activePitchIndex, setActivePitchIndex] = useState<number>(0);

  // Interactive Live Score simulation state per match
  const [liveScores, setLiveScores] = useState<Record<string, { runs: number; wkts: number; balls: number; overStr: string }>>({
    m1: { runs: 146, wkts: 3, balls: 88, overStr: "14.4" },
    m2: { runs: 214, wkts: 4, balls: 289, overStr: "48.1" },
    m3: { runs: 189, wkts: 6, balls: 220, overStr: "36.4" },
    m4: { runs: 98, wkts: 2, balls: 66, overStr: "11.0" },
  });

  // Dynamic Recent Delivery Trajectory Strip for Live Broadcast Hub
  const [recentBalls, setRecentBalls] = useState<Array<{ id: number; run: number; label: string; isWkt?: boolean; isFour?: boolean; isSix?: boolean; isExtra?: boolean }>>([
    { id: 1, run: 1, label: "1" },
    { id: 2, run: 0, label: "•" },
    { id: 3, run: 4, label: "4", isFour: true },
    { id: 4, run: 1, label: "1" },
    { id: 5, run: 6, label: "6", isSix: true },
    { id: 6, run: 0, label: "W", isWkt: true },
    { id: 7, run: 2, label: "2" },
    { id: 8, run: 4, label: "4", isFour: true },
  ]);

  // Dynamic Live Strikers & Bowler Figures for broadcast realism
  const [liveStriker, setLiveStriker] = useState({ name: "M. Dlamini", runs: 64, balls: 42, fours: 7, sixes: 2 });
  const [liveNonStriker, setLiveNonStriker] = useState({ name: "K. Anderson", runs: 34, balls: 26, fours: 4, sixes: 0 });
  const [liveBowler, setLiveBowler] = useState({ name: "J. van der Merwe", overs: "3.4", maidens: 0, runs: 32, wkts: 2, econ: "8.72" });
  const [lastSimEvent, setLastSimEvent] = useState<{ text: string; color: string } | null>(null);

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
  const schoolPitches = getSchoolFieldConditions(activeSchool.id);
  const currentPitchIdx = activePitchIndex < schoolPitches.length ? activePitchIndex : 0;
  const schoolPitch = schoolPitches[currentPitchIdx] || schoolPitches[0];
  const schoolInjuries = INJURIES.filter(inj => inj.schoolId === activeSchool.id);

  // Derby lookup
  const derbyKey = Object.keys(DERBY_RECORDS).find(k => k.includes(activeSchool.id)) || "WES_KEA";
  const activeDerby = DERBY_RECORDS[derbyKey] || DERBY_RECORDS["WES_KEA"];

  // Helper to trigger live simulation run addition with ball trajectory animation & stats
  const handleSimulateBall = (matchId: string, runAdd: number, isWkt: boolean = false, isExtra: boolean = false) => {
    let newScore = { runs: 146, wkts: 3, balls: 88, overStr: "14.4" };
    setLiveScores(prev => {
      const current = prev[matchId] || { runs: 146, wkts: 3, balls: 88, overStr: "14.4" };
      const nextBalls = isExtra ? current.balls : current.balls + 1;
      const completedOvers = Math.floor(nextBalls / 6);
      const remBalls = nextBalls % 6;
      const newRuns = current.runs + runAdd;
      const newWkts = isWkt ? Math.min(10, current.wkts + 1) : current.wkts;
      newScore = {
        runs: newRuns,
        wkts: newWkts,
        balls: nextBalls,
        overStr: `${completedOvers}.${remBalls}`,
      };
      return {
        ...prev,
        [matchId]: newScore,
      };
    });

    // Add ball to live recent strip
    const newBallId = Date.now();
    const label = isWkt ? "W" : runAdd === 0 ? "•" : isExtra ? "Wd" : `${runAdd}`;
    setRecentBalls(prev => [
      ...prev.slice(-9),
      { id: newBallId, run: runAdd, label, isWkt, isFour: runAdd === 4, isSix: runAdd === 6, isExtra },
    ]);

    // Flash event
    if (isWkt) {
      setLastSimEvent({ text: "WICKET! Bowling breakthrough!", color: D.rose });
      setLiveStriker({ name: "S. Khumalo", runs: 0, balls: 0, fours: 0, sixes: 0 });
      setLiveBowler(b => ({ ...b, runs: b.runs + runAdd, wkts: b.wkts + 1 }));
    } else if (runAdd === 6) {
      setLastSimEvent({ text: "MAXIMUM! 6 Runs over long-on!", color: D.violet });
    } else if (runAdd === 4) {
      setLastSimEvent({ text: "BOUNDARY 4! Swept through midwicket!", color: D.emerald });
    } else {
      setLastSimEvent(null);
    }

    if (!isWkt && !isExtra) {
      setLiveStriker(s => ({
        ...s,
        runs: s.runs + runAdd,
        balls: s.balls + 1,
        fours: runAdd === 4 ? s.fours + 1 : s.fours,
        sixes: runAdd === 6 ? s.sixes + 1 : s.sixes,
      }));
      setLiveBowler(b => {
        const nextRuns = b.runs + runAdd;
        const oNum = parseFloat(b.overs) + 0.1;
        return {
          ...b,
          runs: nextRuns,
          econ: (nextRuns / 3.5).toFixed(2),
        };
      });

      // Strike rotation on singles/triples
      if (runAdd % 2 === 1) {
        setLiveStriker(currStriker => {
          const prevNonStriker = liveNonStriker;
          setLiveNonStriker(currStriker);
          return prevNonStriker;
        });
      }
    }
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

  // Modern UI Primitives (Sports Dashboard Grade)
  const Card = ({ children, sx = {}, onClick }: { children: React.ReactNode; sx?: React.CSSProperties; onClick?: () => void }) => (
    <div
      onClick={onClick}
      style={{
        background: D.surf1,
        border: `1px solid ${D.border}`,
        borderRadius: "14px",
        overflow: "hidden",
        boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.32)" : "0 4px 20px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
        ...sx,
      }}
    >
      {children}
    </div>
  );

  const KPICard = ({
    label,
    value,
    sub,
    icon,
    color = D.indigo,
    delta,
    badge,
  }: {
    label: string;
    value: string | number;
    sub?: string;
    icon: string;
    color?: string;
    delta?: string;
    badge?: string;
  }) => (
    <Card sx={{ padding: "16px 18px", borderTop: `3px solid ${color}`, position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {label}
            </span>
            {badge && (
              <span style={{ fontSize: "9px", fontFamily: D.mono, fontWeight: 700, padding: "1px 6px", borderRadius: D.pill, background: `${color}18`, color, border: `1px solid ${color}33` }}>
                {badge}
              </span>
            )}
          </div>
          <div style={{ fontFamily: D.mono, fontSize: "26px", fontWeight: 800, color, lineHeight: 1.1, marginTop: "2px" }}>
            {value}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
            {delta && (
              <span style={{ fontFamily: D.mono, fontSize: "10px", fontWeight: 700, color: delta.startsWith("▲") || delta.startsWith("+") ? D.emerald : D.sky }}>
                {delta}
              </span>
            )}
            {sub && <span style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted }}>{sub}</span>}
          </div>
        </div>
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: color + "14",
            border: `1px solid ${color}28`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "19px",
            flexShrink: 0,
          }}
        >
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

  const Btn = ({
    children,
    onClick,
    variant = "primary",
    size = "md",
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "success" | "danger" | "ghost" | "tonal";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
  }) => {
    const bg = variant === "primary" ? D.gradMain : variant === "success" ? D.gradLive : variant === "danger" ? D.rose : variant === "ghost" ? "transparent" : D.surf3;
    const col = variant === "ghost" ? D.textSecondary : "#fff";
    const pad = size === "sm" ? "6px 14px" : size === "lg" ? "12px 24px" : "8px 18px";
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
          letterSpacing: "0.03em",
          opacity: disabled ? 0.4 : 1,
          boxShadow: variant === "primary" ? `0 4px 14px ${D.indigo}33` : variant === "success" ? `0 4px 14px ${D.emerald}33` : "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          whiteSpace: "nowrap",
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

      {/* Global Command Palette (⌘K / Ctrl+K) */}
      <CommandPaletteModal
        theme={D}
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={navigateToPage}
        onLaunchScorer={handleLaunchScorer}
        activeSchool={activeSchool}
      />

      {/* Material 3 Intelligence Signals Drawer */}
      <IntelligenceDrawer
        theme={D}
        isOpen={intelligenceDrawerOpen}
        onClose={() => setIntelligenceDrawerOpen(false)}
        activeSchool={activeSchool}
        currentRole={role}
        onNavigate={navigateToPage}
      />

      {/* Innings & Session Gated Verification Modal */}
      {reviewConfirmOpen && (
        <ReviewConfirmModal
          theme={D}
          isOpen={reviewConfirmOpen}
          onClose={() => setReviewConfirmOpen(false)}
          onConfirm={(summary) => {
            setReviewConfirmOpen(false);
            triggerToast(
              "Innings Verified",
              `Innings certified with status: ${summary.status}. Ready for next phase.`,
              "match",
              "matches"
            );
          }}
          matchData={{
            homeTeam: activeHeroMatch?.homeTeam || "Westville Boys' High",
            awayTeam: activeHeroMatch?.awayTeam || "Durban High School",
            currentInnings: 1,
            runs: liveScores[activeHeroMatch?.id || "m1"]?.runs || 248,
            wickets: liveScores[activeHeroMatch?.id || "m1"]?.wkts || 6,
            overs: liveScores[activeHeroMatch?.id || "m1"]?.overStr || "50.0",
          }}
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

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 140,
          }}
        />
      )}

      {/* Material 3 Responsive Navigation Rail / Drawer */}
      <div className={`${mobileMenuOpen ? "block fixed inset-y-0 left-0 z-[150]" : "hidden md:block"}`}>
        <MaterialNav
          theme={D}
          currentPage={page}
          onNavigate={navigateToPage}
          isRail={isRailNav}
          onToggleRail={() => setIsRailNav((prev) => !prev)}
          activeSchool={activeSchool}
          currentRole={role}
          liveMatchCount={matchesList.filter((m) => m.status === "live").length}
          unreadAlertCount={3}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onLaunchScorer={() => handleLaunchScorer(activeHeroMatch)}
        />
      </div>

      {/* Main Layout Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {/* Material 3 Dynamic Top App Bar */}
        <MaterialTopBar
          theme={D}
          currentPage={page}
          activeSchool={activeSchool}
          onSelectSchool={(schoolId) => {
            setActiveSchoolId(schoolId);
            const newSchoolPlayers = PLAYERS.filter((p) => p.school === schoolId);
            if (newSchoolPlayers.length > 0) setSelectedPlayer(newSchoolPlayers[0]);
            const newSquads = getSchoolSquads(schoolId);
            if (newSquads.length > 0) setSelectedSquadId(newSquads[0].id);
          }}
          selectedSquadId={selectedSquadId}
          onSelectSquad={setSelectedSquadId}
          currentRole={role}
          onSelectRole={setRole}
          isDark={isDark}
          onToggleTheme={() => setIsDark((prev) => !prev)}
          isCompactDensity={isCompactDensity}
          onToggleDensity={() => setIsCompactDensity((prev) => !prev)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenIntelligenceDrawer={() => setIntelligenceDrawerOpen(true)}
          onOpenNotifications={() => navigateToPage("inbox")}
          onLaunchScorer={() => handleLaunchScorer(activeHeroMatch)}
          onToggleMobileNav={() => setMobileMenuOpen((prev) => !prev)}
          liveMatchCount={matchesList.filter((m) => m.status === "live").length}
          unreadNotificationsCount={3}
        />

        {/* Content View Router */}
        <main style={{ flex: 1, overflowY: "auto", padding: isCompactDensity ? "14px" : "20px" }}>
          {/* Dashboard Intelligence (Material 3 Overhaul) */}
          {page === "dashboard" && (
            <DashboardIntelligenceView
              theme={D}
              activeSchool={activeSchool}
              currentRole={role}
              matches={matchesList}
              players={PLAYERS}
              isCompactDensity={isCompactDensity}
              onNavigate={navigateToPage}
              onLaunchScorer={handleLaunchScorer}
              onSelectPlayer={setSelectedPlayer}
              onOpenIntelligenceDrawer={() => setIntelligenceDrawerOpen(true)}
            />
          )}

          {/* Matches & Match Centre Multi-View (Cards, Table, Timeline, Live) */}
          {page === "matches" && (
            <MatchesView
              theme={D}
              activeSchoolId={activeSchool.id}
              currentRole={role}
              matches={matchesList}
              weather={WEATHER}
              liveScores={liveScores}
              onCreateMatch={handleCreateMatch}
              onUpdateMatch={handleUpdateMatch}
              onDeleteMatch={handleDeleteMatch}
              onLaunchScorer={handleLaunchScorer}
              onOpenScorecard={handleOpenScorecard}
              onTriggerToast={(msg) => triggerToast("Match Operations", msg, "matches", "matches")}
            />
          )}

          {/* Competitions & Leagues View */}
          {(page === "competitions" || page === "leagues") && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <SectionHeader title="Competitions & League Standings" sub="KZN Schools Tournaments and Official Standings" color={D.amber} />
                <Btn
                  variant="primary"
                  size="sm"
                  onClick={() => setPage("promotion_demotion")}
                >
                  ⚔️ Promotion & Demotion Control Room →
                </Btn>
              </div>
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

          {/* Dedicated Promotion & Demotion Control Room */}
          {page === "promotion_demotion" && (
            <PromotionDemotionView
              theme={D}
              activeSchoolId={activeSchool.id}
              currentRole={role}
            />
          )}

          {/* Coach Cockpit & Tactical Match Command */}
          {page === "coach_cockpit" && (
            <CoachCockpitView
              theme={D}
              activeSchoolId={activeSchool.id}
              currentRole={role}
              onNavigateToCaptain={() => navigateToPage("captain_cockpit")}
              onNavigateToSkills={() => navigateToPage("skills")}
              onNavigateToProfiles={(p) => {
                setSelectedPlayer(p);
                navigateToPage("profiles");
              }}
              onPushTacticalPlan={(directive) => {
                setTacticalPlanDirective(directive);
                triggerToast("Coach Directive", `Transmitted "${directive.title}" to Captain Cockpit`, "coach_cockpit", "tactical");
              }}
            />
          )}

          {/* Captain Tactical Cockpit */}
          {page === "captain_cockpit" && (
            <CaptainCockpitView
              theme={D}
              activeSchoolId={activeSchool.id}
              currentRole={role}
              incomingTacticalPlan={tacticalPlanDirective}
              onNavigateToCoach={() => navigateToPage("coach_cockpit")}
              onTriggerToast={(msg) => triggerToast("Captain Decision", msg, "captain_cockpit", "captain")}
            />
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
          {page === "profiles" && (
            <UserProfilesView
              theme={D}
              users={users}
              onUpdateUser={handleUpdateUser}
              currentRole={role}
              activeSchoolId={activeSchool.id}
              onNavigateToH2H={(p1, p2) => {
                setH2hPlayers({ p1, p2 });
                navigateToPage("compare");
              }}
              onTriggerToast={(msg) => {
                setToastNotification({
                  id: `toast_${Date.now()}`,
                  title: 'Profiles Action',
                  body: msg,
                  icon: '👤',
                });
              }}
            />
          )}

          {/* Head-to-Head Comparison View */}
          {(page === "compare" || page === "h2h") && (
            <HeadToHeadComparisonView
              theme={D}
              activeSchoolId={activeSchool.id}
              initialPlayerAId={h2hPlayers.p1 || 'w1'}
              initialPlayerBId={h2hPlayers.p2 || 'm1_p'}
              currentRole={role}
              onNavigateToSkills={() => setPage("skills")}
              onNavigateToScouting={() => setPage("scouting")}
              onSelectPlayerProfile={(p) => {
                setSelectedPlayer(p);
                setPage("profiles");
              }}
            />
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
                  <Btn
                    variant={analyticsSubTab === "cockpit" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setAnalyticsSubTab("cockpit")}
                  >
                    🔬 Analyst Tactical Cockpit
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

              {analyticsSubTab === "cockpit" && (
                <PerformanceAnalystCockpit
                  theme={D}
                  activeSchoolId={activeSchool.id}
                />
              )}
            </div>
          )}

          {/* Dedicated Performance Analyst Cockpit */}
          {page === "analyst_cockpit" && (
            <PerformanceAnalystCockpit
              theme={D}
              activeSchoolId={activeSchool.id}
            />
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

          {/* StatsGuru Query Engine */}
          {page === "statsguru" && (
            <StatsGuruQueryEngineView
              theme={D}
              players={PLAYERS}
            />
          )}

          {/* School Profile View */}
          {(page === "school" || page === "school_profile") && (
            <SchoolProfileView
              theme={D}
              schoolId={activeSchool.id}
              role={role}
              onSelectSchool={(sId) => setActiveSchoolId(sId)}
              onOpenScorecard={(mId) => {}}
              onOpenPlayerProfile={(pId) => {}}
              onNavigateToRegister={() => setPage("register")}
            />
          )}

          {/* Commercial & Sponsorship Management */}
          {page === "sponsorship" && <CommercialView theme={D} activeSchoolId={activeSchool.id} />}

          {/* League & Competitions Engine */}
          {(page === "competitions" || page === "leagues" || page === "tournaments") && (
            <LeagueCompetitionsView
              theme={D}
              role={role}
              onSelectMatch={(mId) => {
                const targetMatch = MATCHES.find((m) => m.id === mId) || MATCHES[0];
                setActiveHeroMatch(targetMatch);
                setPage("matches");
              }}
            />
          )}

          {/* Promotion & Demotion Regulation Matrix */}
          {page === "promotion_demotion" && (
            <PromotionDemotionView
              theme={D}
              activeSchoolId={activeSchool.id}
              currentRole={role}
            />
          )}

          {/* Match Officials & Umpire Appointments Hub */}
          {(page === "officials" || page === "umpires") && (
            <OfficialsView
              theme={D}
              currentRole={role}
              onSelectMatch={(mId) => {
                const targetMatch = MATCHES.find((m) => m.id === mId) || MATCHES[0];
                setActiveHeroMatch(targetMatch);
                setPage("matches");
              }}
            />
          )}

          {/* Dedicated Broadcast Rights & Syndication */}
          {page === "broadcast" && <CommercialView theme={D} activeSchoolId={activeSchool.id} initialTab="broadcast" />}

          {/* POPIA Compliance & RBAC Governance */}
          {page === "governance" && <GovernanceView theme={D} activeSchoolId={activeSchool.id} />}

          {/* Training & Drills View */}
          {page === "training" && <TrainingView theme={D} players={PLAYERS} />}

          {/* Injuries & Physio Command View */}
          {page === "injuries" && <InjuriesView theme={D} players={PLAYERS} currentRole={role} />}

          {/* Logistics & Fleet Operations (Kanban, Fleet, Timeline, Equipment) */}
          {page === "logistics" && (
            <LogisticsView
              theme={D}
              currentRole={role}
              onTriggerToast={(msg) => triggerToast("Fleet & Logistics", msg, "logistics", "logistics")}
            />
          )}

          {/* Fields & Turfgrass Management */}
          {page === "fields" && (
            <FieldsView
              theme={D}
              activeSchoolId={activeSchool.id}
              currentRole={role}
              onSelectSchool={(sId) => setActiveSchoolId(sId)}
            />
          )}

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

          {/* Master Register: Schools, Athletes, Umpires, Scorers, Coaches with RBAC */}
          {(page === "register" || page === "management") && (
            <RegisterHubView
              theme={D}
              currentRole={role}
              activeSchoolId={activeSchool.id}
              onTriggerToast={(msg) => triggerToast("Master Register", msg, "register", "register")}
              onNavigateToSquad={() => setPage("squad")}
              onNavigateToProfiles={() => setPage("profiles")}
              onOpenSchoolProfile={(schoolId) => {
                setActiveSchoolId(schoolId);
                setPage("school");
              }}
              onSelectPlayerProfile={(p) => {
                setSelectedPlayer(p);
                setPage("profiles");
              }}
              onNavigateToH2H={() => {
                setPage("h2h");
              }}
            />
          )}

          {/* Staff & User Management Multi-View (Directory, Compliance, Rota) */}
          {page === "staff" && (
            <StaffManagementView
              theme={D}
              activeSchoolId={activeSchool.id}
              currentRole={role}
              onTriggerToast={(msg) => triggerToast("Staff Operations", msg, "governance", "staff")}
            />
          )}

          {/* Settings View */}
          {page === "settings" && (
            <SettingsView
              theme={D}
              activeSchoolId={activeSchool.id}
              onTriggerToast={triggerToast}
            />
          )}

          {/* Rulebook: Official Regulations & Code */}
          {page === "rulebook" && <RulebookView theme={D} />}

          {/* Pitch Deck: Executive Strategic Presentation */}
          {page === "pitchdeck" && <PitchDeckView theme={D} />}
        </main>
      </div>
    </div>
  );
}
