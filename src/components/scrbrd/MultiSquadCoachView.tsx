'use client';

import React, { useState, useMemo } from 'react';
import { Theme, Player, SchoolSquad, CoachingStaffMember, PlayerMovementRecord, SquadDivision } from './types';
import { SQUAD_TEMPLATES, getSchoolSquads, COACHING_STAFF_REGISTRY, INITIAL_PLAYER_MOVEMENTS, generateFullSchoolRoster } from './multiSquadData';
import { SCHOOLS_REGISTRY } from './data';
import {
  Users, Award, Shield, UserCheck, ArrowUpRight, ArrowDownRight,
  TrendingUp, Calendar, MapPin, Sparkles, CheckCircle2, AlertCircle,
  Plus, Edit2, Clock, Filter, Search, ChevronRight, RefreshCw, Send,
  Briefcase, CheckSquare, Layers, UserPlus, Info, Phone, Mail
} from 'lucide-react';

interface MultiSquadCoachViewProps {
  theme: Theme;
  activeSchoolId: string;
  currentRole: string;
  selectedSquadId?: string;
  onSelectSquad?: (squadId: string) => void;
  onSelectPlayerProfile?: (player: Player) => void;
  onNavigateToSkills?: () => void;
}

export default function MultiSquadCoachView({
  theme: D,
  activeSchoolId,
  currentRole,
  selectedSquadId,
  onSelectSquad,
  onSelectPlayerProfile,
  onNavigateToSkills,
}: MultiSquadCoachViewProps) {
  // All 23 squads for active school
  const schoolSquads = useMemo(() => getSchoolSquads(activeSchoolId), [activeSchoolId]);
  const activeSchool = SCHOOLS_REGISTRY.find(s => s.id === activeSchoolId) || SCHOOLS_REGISTRY[0];

  // Coaching staff registry for school
  const [coachingStaff, setCoachingStaff] = useState<CoachingStaffMember[]>(
    () => COACHING_STAFF_REGISTRY[activeSchoolId] || COACHING_STAFF_REGISTRY.WES
  );

  // Player movements history state
  const [movements, setMovements] = useState<PlayerMovementRecord[]>(INITIAL_PLAYER_MOVEMENTS);

  // Internal active squad state
  const [activeSquad, setActiveSquad] = useState<SchoolSquad>(() => {
    if (selectedSquadId) {
      const found = schoolSquads.find(s => s.id === selectedSquadId);
      if (found) return found;
    }
    return schoolSquads[0]; // Default 1st XI
  });

  // Division filter
  const [selectedDivision, setSelectedDivision] = useState<SquadDivision | "All">("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"squad_detail" | "all_squads_matrix" | "coaching_staff" | "player_movements">("squad_detail");

  // Promotion / Movement Modal state
  const [movementModalOpen, setMovementModalOpen] = useState<boolean>(false);
  const [selectedPlayerToMove, setSelectedPlayerToMove] = useState<Player | null>(null);
  const [targetSquadName, setTargetSquadName] = useState<string>("1st XI");
  const [movementType, setMovementType] = useState<"promotion" | "tactical_callup" | "form_reset" | "injury_cover" | "demotion">("promotion");
  const [movementReason, setMovementReason] = useState<string>("");

  // Assign Coach Modal state
  const [coachAssignModalOpen, setCoachAssignModalOpen] = useState<boolean>(false);
  const [selectedSquadForCoach, setSelectedSquadForCoach] = useState<SchoolSquad | null>(null);
  const [selectedCoachId, setSelectedCoachId] = useState<string>("");

  // Filtered squads
  const filteredSquads = useMemo(() => {
    return schoolSquads.filter(sq => {
      const matchesDiv = selectedDivision === "All" || sq.division === selectedDivision;
      const matchesSearch = searchQuery === "" ||
        sq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sq.headCoachName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sq.assignedGround.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDiv && matchesSearch;
    });
  }, [schoolSquads, selectedDivision, searchQuery]);

  // Generate full players pool for all 23 squads
  const allSchoolPlayers = useMemo(() => {
    return generateFullSchoolRoster(activeSchoolId, []);
  }, [activeSchoolId]);

  // Players in current active squad
  const currentSquadPlayers = useMemo(() => {
    return allSchoolPlayers.filter(p => p.team === activeSquad.name || p.squadId === activeSquad.id);
  }, [allSchoolPlayers, activeSquad]);

  // Quota breakdown for current active squad
  const quotaStats = useMemo(() => {
    const total = currentSquadPlayers.length;
    const blackAfrican = currentSquadPlayers.filter(p => p.saDemographic === "Black African").length;
    const genericBlack = currentSquadPlayers.filter(p => p.saDemographic === "Generic Black").length;
    const open = total - blackAfrican - genericBlack;
    const targetBA = activeSquad.targetQuota.blackAfricanMin;
    const targetGB = activeSquad.targetQuota.genericBlackMin;
    const compliant = blackAfrican >= targetBA && (blackAfrican + genericBlack) >= (targetBA + targetGB);

    return {
      total,
      blackAfrican,
      genericBlack,
      open,
      targetBA,
      targetGB,
      compliant,
    };
  }, [currentSquadPlayers, activeSquad]);

  // Handle switching squad
  const handleSelectSquad = (squad: SchoolSquad) => {
    setActiveSquad(squad);
    if (onSelectSquad) onSelectSquad(squad.id);
  };

  // Submit player movement (Promotion / Demotion)
  const handleExecutePlayerMovement = () => {
    if (!selectedPlayerToMove || !movementReason) return;

    const newRecord: PlayerMovementRecord = {
      id: `mov_${Date.now()}`,
      playerId: selectedPlayerToMove.id,
      playerName: selectedPlayerToMove.name,
      schoolId: activeSchoolId,
      fromSquad: selectedPlayerToMove.team,
      toSquad: targetSquadName,
      type: movementType,
      reason: movementReason,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      authorizedBy: currentRole === "doc" ? "Director of Cricket" : "Head Coach Command",
      status: "approved",
    };

    setMovements(prev => [newRecord, ...prev]);

    // Update player's team in memory
    selectedPlayerToMove.team = targetSquadName;
    selectedPlayerToMove.squadName = targetSquadName;

    setMovementModalOpen(false);
    setSelectedPlayerToMove(null);
    setMovementReason("");
  };

  // Handle Coach assignment
  const handleSaveCoachAssignment = () => {
    if (!selectedSquadForCoach || !selectedCoachId) return;
    const coach = coachingStaff.find(c => c.id === selectedCoachId);
    if (!coach) return;

    setCoachingStaff(prev => prev.map(c => {
      if (c.id === selectedCoachId) {
        return {
          ...c,
          assignedSquads: Array.from(new Set([...c.assignedSquads, selectedSquadForCoach.id])),
        };
      }
      return c;
    }));

    selectedSquadForCoach.headCoachId = coach.id;
    selectedSquadForCoach.headCoachName = coach.name;
    selectedSquadForCoach.headCoachTitle = `${selectedSquadForCoach.name} Head Coach`;

    setCoachAssignModalOpen(false);
    setSelectedSquadForCoach(null);
  };

  const isDoCOrAdmin = currentRole === "doc" || currentRole === "superadmin" || currentRole === "schooladmin" || currentRole === "sportsmaster";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Top Header Banner */}
      <div
        style={{
          padding: "20px 24px",
          borderRadius: D.lg,
          background: `linear-gradient(135deg, ${D.indigo}18 0%, ${D.surf1} 100%)`,
          border: `1px solid ${D.indigo}33`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "24px" }}>{activeSchool.crestIcon}</span>
            <div>
              <h1 style={{ fontFamily: D.head, fontSize: "20px", fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                {activeSchool.name} · Squads & Coaching Hierarchy
              </h1>
              <p style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted, margin: "2px 0 0" }}>
                Multi-Team High Performance Architecture · 23 Squads across 4 Age Divisions (1st-7th XI, U16A-D, U15A-E, U14A-G)
              </p>
            </div>
          </div>
        </div>

        {/* View Sub-Tabs */}
        <div style={{ display: "flex", gap: "6px", background: D.surf2, padding: "4px", borderRadius: D.pill, border: `1px solid ${D.border}` }}>
          <button
            onClick={() => setActiveTab("squad_detail")}
            style={{
              padding: "6px 14px",
              borderRadius: D.pill,
              border: "none",
              background: activeTab === "squad_detail" ? D.indigo : "transparent",
              color: activeTab === "squad_detail" ? "#fff" : D.textSecondary,
              fontFamily: D.head,
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            🏏 Active Squad ({activeSquad.name})
          </button>
          <button
            onClick={() => setActiveTab("all_squads_matrix")}
            style={{
              padding: "6px 14px",
              borderRadius: D.pill,
              border: "none",
              background: activeTab === "all_squads_matrix" ? D.indigo : "transparent",
              color: activeTab === "all_squads_matrix" ? "#fff" : D.textSecondary,
              fontFamily: D.head,
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            📋 All 23 Squads Matrix
          </button>
          <button
            onClick={() => setActiveTab("coaching_staff")}
            style={{
              padding: "6px 14px",
              borderRadius: D.pill,
              border: "none",
              background: activeTab === "coaching_staff" ? D.indigo : "transparent",
              color: activeTab === "coaching_staff" ? "#fff" : D.textSecondary,
              fontFamily: D.head,
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            👔 Coaching Staff ({coachingStaff.length})
          </button>
          <button
            onClick={() => setActiveTab("player_movements")}
            style={{
              padding: "6px 14px",
              borderRadius: D.pill,
              border: "none",
              background: activeTab === "player_movements" ? D.indigo : "transparent",
              color: activeTab === "player_movements" ? "#fff" : D.textSecondary,
              fontFamily: D.head,
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ⚡ Talent Ladder & Transfers ({movements.length})
          </button>
        </div>
      </div>

      {/* Division Switcher Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          background: D.surf0,
          padding: "12px 18px",
          borderRadius: D.lg,
          border: `1px solid ${D.border}`,
        }}
      >
        {/* Divisions Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700, color: D.textMuted, textTransform: "uppercase" }}>
            Division:
          </span>
          {(["All", "Open", "U16", "U15", "U14"] as (SquadDivision | "All")[]).map((div) => {
            const isSelected = selectedDivision === div;
            const count = div === "All" ? 23 : div === "Open" ? 7 : div === "U16" ? 4 : div === "U15" ? 5 : 7;
            return (
              <button
                key={div}
                onClick={() => setSelectedDivision(div)}
                style={{
                  padding: "5px 12px",
                  borderRadius: D.pill,
                  border: `1px solid ${isSelected ? D.indigo : D.border}`,
                  background: isSelected ? `${D.indigo}22` : D.surf2,
                  color: isSelected ? D.textPrimary : D.textSecondary,
                  fontFamily: D.head,
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>{div === "All" ? "All Divisions" : div === "Open" ? "Open (1st-7th XI)" : `${div} Age Division`}</span>
                <span
                  style={{
                    fontSize: "9px",
                    padding: "1px 6px",
                    borderRadius: D.pill,
                    background: isSelected ? D.indigo : D.surf3,
                    color: "#fff",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Search */}
        <div style={{ position: "relative", width: "240px", maxWidth: "100%" }}>
          <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: D.textMuted }} />
          <input
            type="text"
            placeholder="Search squad, coach, ground..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "6px 10px 6px 30px",
              borderRadius: D.pill,
              background: D.surf2,
              border: `1px solid ${D.border}`,
              color: D.textPrimary,
              fontFamily: D.body,
              fontSize: "11px",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* ── TAB 1: ACTIVE SQUAD DETAIL ───────────────────────────────── */}
      {activeTab === "squad_detail" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Active Squad Header Card */}
          <div
            style={{
              background: D.surf0,
              borderRadius: D.lg,
              border: `1px solid ${D.border}`,
              padding: "20px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {/* Squad Identification */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    padding: "8px 14px",
                    borderRadius: D.md,
                    background: `${D.indigo}20`,
                    border: `1px solid ${D.indigo}44`,
                    fontFamily: D.head,
                    fontSize: "18px",
                    fontWeight: 800,
                    color: D.sky || D.indigo,
                  }}
                >
                  {activeSquad.name}
                </div>
                <div>
                  <div style={{ fontFamily: D.head, fontSize: "16px", fontWeight: 800, color: D.textPrimary }}>
                    {activeSchool.shortName} · {activeSquad.name}
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: "11px", color: D.textMuted }}>
                    {activeSquad.division} Division · Tier {activeSquad.tier} · {activeSquad.matchFormat}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "14px" }}>
                <div style={{ padding: "8px 12px", background: D.surf2, borderRadius: D.md }}>
                  <div style={{ fontFamily: D.head, fontSize: "9px", color: D.textMuted, textTransform: "uppercase" }}>Head Coach</div>
                  <div style={{ fontFamily: D.head, fontSize: "12px", fontWeight: 700, color: D.textPrimary, marginTop: "2px" }}>
                    {activeSquad.headCoachName}
                  </div>
                </div>
                <div style={{ padding: "8px 12px", background: D.surf2, borderRadius: D.md }}>
                  <div style={{ fontFamily: D.head, fontSize: "9px", color: D.textMuted, textTransform: "uppercase" }}>Assigned Ground</div>
                  <div style={{ fontFamily: D.body, fontSize: "11px", fontWeight: 600, color: D.emerald, marginTop: "2px" }}>
                    📍 {activeSquad.assignedGround}
                  </div>
                </div>
              </div>
            </div>

            {/* Practice & Fixture Logistics */}
            <div>
              <div style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, textTransform: "uppercase", marginBottom: "6px" }}>
                Weekly Training & Net Slots
              </div>
              <div style={{ padding: "10px 14px", background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: D.mono, fontSize: "11px", color: D.textPrimary }}>
                  <Clock size={13} style={{ color: D.amber }} />
                  <span>{activeSquad.practiceSlot}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: D.body, fontSize: "11px", color: D.textSecondary, marginTop: "6px" }}>
                  <Shield size={13} style={{ color: D.teal }} />
                  <span>Match Format: <strong>{activeSquad.matchFormat}</strong></span>
                </div>
              </div>

              {/* Transformation / Quota Status */}
              <div style={{ marginTop: "10px", padding: "8px 12px", background: quotaStats.compliant ? `${D.emerald}14` : `${D.rose}14`, borderRadius: D.md, border: `1px solid ${quotaStats.compliant ? D.emerald + "33" : D.rose + "33"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: quotaStats.compliant ? D.emerald : D.rose }}>
                    {quotaStats.compliant ? "✓ SA Transformation Quota Met" : "⚠ Quota Shortfall"}
                  </span>
                  <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>
                    {quotaStats.blackAfrican} Black African (Min {quotaStats.targetBA}) · {quotaStats.genericBlack} Generic Black (Min {quotaStats.targetGB})
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Switch Squad Selector */}
            <div>
              <div style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, textTransform: "uppercase", marginBottom: "6px" }}>
                Switch Managed Squad ({filteredSquads.length} available)
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxHeight: "110px", overflowY: "auto", padding: "4px", background: D.surf2, borderRadius: D.md }}>
                {filteredSquads.map(sq => {
                  const isActive = sq.id === activeSquad.id;
                  return (
                    <button
                      key={sq.id}
                      onClick={() => handleSelectSquad(sq)}
                      style={{
                        padding: "3px 8px",
                        borderRadius: D.sm,
                        border: `1px solid ${isActive ? D.indigo : D.border}`,
                        background: isActive ? D.indigo : "transparent",
                        color: isActive ? "#fff" : D.textPrimary,
                        fontFamily: D.mono,
                        fontSize: "10px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {sq.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Squad Roster Table & Player Depth */}
          <div style={{ background: D.surf0, borderRadius: D.lg, border: `1px solid ${D.border}`, padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "4px", height: "18px", borderRadius: "2px", background: D.indigo }} />
                  <h2 style={{ fontFamily: D.head, fontSize: "15px", fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                    {activeSquad.name} Playing Roster & Depth Chart ({currentSquadPlayers.length} Athletes)
                  </h2>
                </div>
                <p style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, margin: "2px 0 0 12px" }}>
                  Official registration for South African high school Saturday leagues and declaration fixtures
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                {onNavigateToSkills && (
                  <button
                    onClick={onNavigateToSkills}
                    style={{
                      padding: "6px 12px",
                      borderRadius: D.pill,
                      border: `1px solid ${D.border}`,
                      background: D.surf2,
                      color: D.textPrimary,
                      fontFamily: D.head,
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    🎯 Open Squad Skills Matrix →
                  </button>
                )}
              </div>
            </div>

            {/* Players Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${D.border}`, background: D.surf2 }}>
                    <th style={{ padding: "10px 12px", fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>#</th>
                    <th style={{ padding: "10px 12px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>PLAYER</th>
                    <th style={{ padding: "10px 12px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>ROLE</th>
                    <th style={{ padding: "10px 12px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>STYLE</th>
                    <th style={{ padding: "10px 12px", fontFamily: D.mono, fontSize: "10px", color: D.textMuted, textAlign: "center" }}>AGE</th>
                    <th style={{ padding: "10px 12px", fontFamily: D.mono, fontSize: "10px", color: D.textMuted, textAlign: "right" }}>BAT AVG</th>
                    <th style={{ padding: "10px 12px", fontFamily: D.mono, fontSize: "10px", color: D.textMuted, textAlign: "right" }}>SR</th>
                    <th style={{ padding: "10px 12px", fontFamily: D.mono, fontSize: "10px", color: D.textMuted, textAlign: "right" }}>WKTS</th>
                    <th style={{ padding: "10px 12px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>TRANSFORMATION</th>
                    <th style={{ padding: "10px 12px", fontFamily: D.head, fontSize: "10px", color: D.textMuted, textAlign: "center" }}>TALENT LADDER</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSquadPlayers.map((player, idx) => {
                    return (
                      <tr
                        key={player.id}
                        style={{
                          borderBottom: `1px solid ${D.border}`,
                          background: idx % 2 === 0 ? "transparent" : `${D.surf2}50`,
                          transition: "background 0.15s ease",
                        }}
                      >
                        <td style={{ padding: "12px", fontFamily: D.mono, fontSize: "11px", color: D.textMuted }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <div
                            onClick={() => onSelectPlayerProfile && onSelectPlayerProfile(player)}
                            style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                          >
                            <span style={{ fontFamily: D.head, fontSize: "13px", fontWeight: 700, color: D.textPrimary }}>
                              {player.name}
                            </span>
                            {player.cap === "c" && <span style={{ color: D.amber, fontSize: "11px", fontWeight: 800 }} title="Captain">©</span>}
                            {player.cap === "vc" && <span style={{ color: D.sky, fontSize: "10px", fontWeight: 800 }} title="Vice Captain">VC</span>}
                          </div>
                          <div style={{ fontFamily: D.body, fontSize: "10px", color: D.textMuted }}>
                            {player.hometown} · {player.houseAtSchool}
                          </div>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: D.pill,
                              fontFamily: D.mono,
                              fontSize: "10px",
                              fontWeight: 700,
                              background: player.role === "BAT" ? `${D.sky}20` : player.role === "BOWL" ? `${D.violet}20` : player.role === "ALL" ? `${D.emerald}20` : `${D.amber}20`,
                              color: player.role === "BAT" ? D.sky : player.role === "BOWL" ? D.violet : player.role === "ALL" ? D.emerald : D.amber,
                            }}
                          >
                            {player.role}
                          </span>
                        </td>
                        <td style={{ padding: "12px", fontFamily: D.mono, fontSize: "11px", color: D.textSecondary }}>
                          {player.batHand}HB · {player.bowlArm}{player.bowlStyle}
                        </td>
                        <td style={{ padding: "12px", fontFamily: D.mono, fontSize: "11px", textAlign: "center", color: D.textPrimary }}>
                          {player.age}
                        </td>
                        <td style={{ padding: "12px", fontFamily: D.mono, fontSize: "12px", fontWeight: 700, textAlign: "right", color: player.avg >= 35 ? D.emerald : D.textPrimary }}>
                          {player.avg}
                        </td>
                        <td style={{ padding: "12px", fontFamily: D.mono, fontSize: "11px", textAlign: "right", color: D.textSecondary }}>
                          {player.sr}
                        </td>
                        <td style={{ padding: "12px", fontFamily: D.mono, fontSize: "12px", fontWeight: 700, textAlign: "right", color: player.wkts >= 15 ? D.violet : D.textPrimary }}>
                          {player.wkts}
                        </td>
                        <td style={{ padding: "12px" }}>
                          {player.saDemographic === "Black African" ? (
                            <span style={{ padding: "2px 6px", borderRadius: D.pill, background: `${D.emerald}20`, color: D.emerald, fontFamily: D.mono, fontSize: "9px", fontWeight: 700 }}>
                              Black African
                            </span>
                          ) : player.saDemographic === "Generic Black" ? (
                            <span style={{ padding: "2px 6px", borderRadius: D.pill, background: `${D.sky}20`, color: D.sky, fontFamily: D.mono, fontSize: "9px", fontWeight: 700 }}>
                              Generic Black
                            </span>
                          ) : (
                            <span style={{ fontFamily: D.mono, fontSize: "9px", color: D.textMuted }}>
                              Open
                            </span>
                          )}
                          {player.bursaryScholar && (
                            <span style={{ marginLeft: "4px", padding: "1px 4px", borderRadius: D.pill, background: `${D.amber}20`, color: D.amber, fontFamily: D.mono, fontSize: "8px", fontWeight: 700 }}>
                              Scholar
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <button
                            onClick={() => {
                              setSelectedPlayerToMove(player);
                              setTargetSquadName(activeSquad.tier > 1 ? schoolSquads[activeSquad.tier - 2]?.name || "1st XI" : "2nd XI");
                              setMovementType(activeSquad.tier > 1 ? "promotion" : "form_reset");
                              setMovementModalOpen(true);
                            }}
                            style={{
                              padding: "4px 10px",
                              borderRadius: D.pill,
                              border: `1px solid ${D.border}`,
                              background: D.surf2,
                              color: D.textPrimary,
                              fontFamily: D.head,
                              fontSize: "10px",
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <TrendingUp size={11} style={{ color: D.indigo }} />
                            Move / Promote
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: ALL 23 SQUADS MATRIX ──────────────────────────────── */}
      {activeTab === "all_squads_matrix" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
            {filteredSquads.map((squad) => {
              const squadPlayerCount = allSchoolPlayers.filter(p => p.team === squad.name || p.squadId === squad.id).length;
              const isSelected = squad.id === activeSquad.id;

              return (
                <div
                  key={squad.id}
                  style={{
                    background: D.surf0,
                    borderRadius: D.lg,
                    border: `1px solid ${isSelected ? D.indigo : D.border}`,
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "12px",
                    boxShadow: isSelected ? `0 4px 20px ${D.indigo}25` : "none",
                  }}
                >
                  <div>
                    {/* Header line */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <div>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: D.pill,
                            background: squad.division === "Open" ? `${D.sky}20` : squad.division === "U16" ? `${D.violet}20` : squad.division === "U15" ? `${D.emerald}20` : `${D.amber}20`,
                            color: squad.division === "Open" ? D.sky : squad.division === "U16" ? D.violet : squad.division === "U15" ? D.emerald : D.amber,
                            fontFamily: D.mono,
                            fontSize: "9px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                          }}
                        >
                          {squad.division} · Tier {squad.tier}
                        </span>
                        <h3 style={{ fontFamily: D.head, fontSize: "16px", fontWeight: 800, color: D.textPrimary, margin: "6px 0 0" }}>
                          {activeSchool.shortName} {squad.name}
                        </h3>
                      </div>

                      <span style={{ fontFamily: D.mono, fontSize: "11px", fontWeight: 700, color: D.emerald }}>
                        {squad.seasonRecord.won}W - {squad.seasonRecord.lost}L
                      </span>
                    </div>

                    {/* Coach & Ground info */}
                    <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: D.textPrimary, fontFamily: D.head }}>
                        <Briefcase size={12} style={{ color: D.indigo }} />
                        <span>Head Coach: <strong>{squad.headCoachName}</strong></span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: D.textMuted, fontFamily: D.body }}>
                        <MapPin size={12} style={{ color: D.emerald }} />
                        <span>{squad.assignedGround}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: D.textMuted, fontFamily: D.mono, fontSize: "10px" }}>
                        <Clock size={12} style={{ color: D.amber }} />
                        <span>{squad.practiceSlot.split("(")[0]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div style={{ paddingTop: "10px", borderTop: `1px solid ${D.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>
                      {squadPlayerCount} / {squad.squadCapCount} Players Registered
                    </span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {isDoCOrAdmin && (
                        <button
                          onClick={() => {
                            setSelectedSquadForCoach(squad);
                            setSelectedCoachId(squad.headCoachId);
                            setCoachAssignModalOpen(true);
                          }}
                          style={{
                            padding: "4px 8px",
                            borderRadius: D.pill,
                            border: `1px solid ${D.border}`,
                            background: D.surf2,
                            color: D.textMuted,
                            fontFamily: D.head,
                            fontSize: "10px",
                            cursor: "pointer",
                          }}
                        >
                          Reassign
                        </button>
                      )}
                      <button
                        onClick={() => {
                          handleSelectSquad(squad);
                          setActiveTab("squad_detail");
                        }}
                        style={{
                          padding: "4px 10px",
                          borderRadius: D.pill,
                          border: "none",
                          background: isSelected ? D.indigo : `${D.indigo}20`,
                          color: isSelected ? "#fff" : D.indigo,
                          fontFamily: D.head,
                          fontSize: "10px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Manage Roster →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 3: COACHING STAFF DIRECTORY ───────────────────────────── */}
      {activeTab === "coaching_staff" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
            {coachingStaff.map((coach) => {
              return (
                <div
                  key={coach.id}
                  style={{
                    background: D.surf0,
                    borderRadius: D.lg,
                    border: `1px solid ${D.border}`,
                    padding: "18px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "14px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <div>
                        <div style={{ fontFamily: D.head, fontSize: "15px", fontWeight: 800, color: D.textPrimary }}>
                          {coach.name}
                        </div>
                        <div style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700, color: D.indigo, marginTop: "2px" }}>
                          {coach.primaryRole}
                        </div>
                      </div>
                      <span
                        style={{
                          padding: "2px 6px",
                          borderRadius: D.pill,
                          background: `${D.emerald}18`,
                          border: `1px solid ${D.emerald}33`,
                          color: D.emerald,
                          fontFamily: D.mono,
                          fontSize: "9px",
                          fontWeight: 700,
                        }}
                      >
                        {coach.csaAccreditation.split(" ")[0]} {coach.csaAccreditation.split(" ")[1]}
                      </span>
                    </div>

                    <p style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, margin: "10px 0", lineHeight: 1.4 }}>
                      {coach.bio}
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "10px", fontFamily: D.mono, color: D.textSecondary }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Mail size={11} style={{ color: D.sky }} />
                        <span>{coach.email}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Phone size={11} style={{ color: D.emerald }} />
                        <span>{coach.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontFamily: D.head, fontSize: "9px", color: D.textMuted, textTransform: "uppercase", marginBottom: "4px" }}>
                      Assigned Squads ({coach.assignedSquads.length})
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {coach.assignedSquads.map((sqId) => {
                        const sq = schoolSquads.find(s => s.id === sqId);
                        return (
                          <span
                            key={sqId}
                            style={{
                              padding: "2px 6px",
                              borderRadius: D.pill,
                              background: D.surf2,
                              border: `1px solid ${D.border}`,
                              fontFamily: D.mono,
                              fontSize: "9px",
                              fontWeight: 700,
                              color: D.textPrimary,
                            }}
                          >
                            {sq?.name || sqId.replace(`${activeSchoolId}_`, "")}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 4: TALENT LADDER & PLAYER MOVEMENTS ──────────────────── */}
      {activeTab === "player_movements" && (
        <div style={{ background: D.surf0, borderRadius: D.lg, border: `1px solid ${D.border}`, padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "4px", height: "18px", borderRadius: "2px", background: D.amber }} />
                <h2 style={{ fontFamily: D.head, fontSize: "15px", fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                  Internal School Transfers & Promotion Audit Log
                </h2>
              </div>
              <p style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, margin: "2px 0 0 12px" }}>
                Official tracking of player promotions, injury call-ups, and form management across all 23 squads
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {movements.map((mov) => {
              return (
                <div
                  key={mov.id}
                  style={{
                    padding: "14px 16px",
                    background: D.surf2,
                    borderRadius: D.md,
                    border: `1px solid ${D.border}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: mov.type === "promotion" ? `${D.emerald}25` : mov.type === "tactical_callup" ? `${D.sky}25` : `${D.amber}25`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {mov.type === "promotion" ? (
                        <ArrowUpRight size={18} style={{ color: D.emerald }} />
                      ) : mov.type === "demotion" || mov.type === "form_reset" ? (
                        <ArrowDownRight size={18} style={{ color: D.amber }} />
                      ) : (
                        <RefreshCw size={16} style={{ color: D.sky }} />
                      )}
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontFamily: D.head, fontSize: "13px", fontWeight: 800, color: D.textPrimary }}>
                          {mov.playerName}
                        </span>
                        <span
                          style={{
                            padding: "1px 6px",
                            borderRadius: D.pill,
                            background: `${D.indigo}18`,
                            color: D.sky || D.indigo,
                            fontFamily: D.mono,
                            fontSize: "9px",
                            fontWeight: 700,
                          }}
                        >
                          {mov.fromSquad} → {mov.toSquad}
                        </span>
                      </div>
                      <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textSecondary, marginTop: "2px" }}>
                        {mov.reason}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right", fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>
                    <div>Authorized by: <strong>{mov.authorizedBy}</strong></div>
                    <div style={{ marginTop: "2px" }}>{mov.timestamp}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── PROMOTION / TRANSFER MODAL ───────────────────────────────── */}
      {movementModalOpen && selectedPlayerToMove && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: D.surf0,
              borderRadius: D.lg,
              border: `1px solid ${D.border}`,
              maxWidth: "500px",
              width: "100%",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontFamily: D.head, fontSize: "16px", fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                Promote / Transfer Player
              </h3>
              <button
                onClick={() => setMovementModalOpen(false)}
                style={{ background: "none", border: "none", color: D.textMuted, fontSize: "18px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "12px", background: D.surf2, borderRadius: D.md, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: D.head, fontSize: "13px", fontWeight: 800, color: D.textPrimary }}>
                  {selectedPlayerToMove.name}
                </div>
                <div style={{ fontFamily: D.mono, fontSize: "11px", color: D.textMuted }}>
                  Current Squad: {selectedPlayerToMove.team} · Avg {selectedPlayerToMove.avg} · {selectedPlayerToMove.role}
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700, color: D.textSecondary, display: "block", marginBottom: "6px" }}>
                Target Squad Destination
              </label>
              <select
                value={targetSquadName}
                onChange={e => setTargetSquadName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: D.md,
                  background: D.surf2,
                  border: `1px solid ${D.border}`,
                  color: D.textPrimary,
                  fontFamily: D.body,
                  fontSize: "12px",
                  outline: "none",
                }}
              >
                {schoolSquads.map(sq => (
                  <option key={sq.id} value={sq.name}>
                    {sq.name} ({sq.division} - Tier {sq.tier}) · Coach: {sq.headCoachName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700, color: D.textSecondary, display: "block", marginBottom: "6px" }}>
                Transfer Type
              </label>
              <select
                value={movementType}
                onChange={e => setMovementType(e.target.value as any)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: D.md,
                  background: D.surf2,
                  border: `1px solid ${D.border}`,
                  color: D.textPrimary,
                  fontFamily: D.body,
                  fontSize: "12px",
                  outline: "none",
                }}
              >
                <option value="promotion">Performance Promotion (Permanent / Form Elevation)</option>
                <option value="tactical_callup">Tactical Weekend Call-Up (Saturday Derby Cover)</option>
                <option value="injury_cover">Injury Replacement Cover</option>
                <option value="form_reset">Form Reset (Junior / Lower Tier Confidence Build)</option>
                <option value="demotion">Squad Demotion</option>
              </select>
            </div>

            <div>
              <label style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700, color: D.textSecondary, display: "block", marginBottom: "6px" }}>
                Technical Justification & Notes
              </label>
              <textarea
                placeholder="e.g. Scored 68* vs Michaelhouse 2nd XI with exceptional strike rate; covers fast bowler vacancy."
                value={movementReason}
                onChange={e => setMovementReason(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: D.md,
                  background: D.surf2,
                  border: `1px solid ${D.border}`,
                  color: D.textPrimary,
                  fontFamily: D.body,
                  fontSize: "12px",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
              <button
                onClick={() => setMovementModalOpen(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: D.pill,
                  border: `1px solid ${D.border}`,
                  background: "transparent",
                  color: D.textSecondary,
                  fontFamily: D.head,
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleExecutePlayerMovement}
                disabled={!movementReason}
                style={{
                  padding: "8px 18px",
                  borderRadius: D.pill,
                  border: "none",
                  background: D.indigo,
                  color: "#fff",
                  fontFamily: D.head,
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: !movementReason ? "not-allowed" : "pointer",
                  opacity: !movementReason ? 0.5 : 1,
                }}
              >
                Execute Transfer & Notify Coaches
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ASSIGN COACH MODAL ───────────────────────────────────────── */}
      {coachAssignModalOpen && selectedSquadForCoach && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: D.surf0,
              borderRadius: D.lg,
              border: `1px solid ${D.border}`,
              maxWidth: "460px",
              width: "100%",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontFamily: D.head, fontSize: "16px", fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                Assign Head Coach: {selectedSquadForCoach.name}
              </h3>
              <button
                onClick={() => setCoachAssignModalOpen(false)}
                style={{ background: "none", border: "none", color: D.textMuted, fontSize: "18px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div>
              <label style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 700, color: D.textSecondary, display: "block", marginBottom: "6px" }}>
                Select Accredited Coach
              </label>
              <select
                value={selectedCoachId}
                onChange={e => setSelectedCoachId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: D.md,
                  background: D.surf2,
                  border: `1px solid ${D.border}`,
                  color: D.textPrimary,
                  fontFamily: D.body,
                  fontSize: "12px",
                  outline: "none",
                }}
              >
                {coachingStaff.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.primaryRole} · {c.csaAccreditation})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
              <button
                onClick={() => setCoachAssignModalOpen(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: D.pill,
                  border: `1px solid ${D.border}`,
                  background: "transparent",
                  color: D.textSecondary,
                  fontFamily: D.head,
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCoachAssignment}
                style={{
                  padding: "8px 18px",
                  borderRadius: D.pill,
                  border: "none",
                  background: D.indigo,
                  color: "#fff",
                  fontFamily: D.head,
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
