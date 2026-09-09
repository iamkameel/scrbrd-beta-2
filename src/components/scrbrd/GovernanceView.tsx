'use client';

import React, { useState } from 'react';
import { Theme } from './types';
import { ROLES, ROLE_LAYERS, POPIA_POLICIES, getData, PLAYERS, INJURIES } from './data';

interface GovernanceViewProps {
  theme: Theme;
  activeSchoolId: string;
}

interface ConsentRecord {
  id: string;
  studentName: string;
  grade: string;
  team: string;
  guardianName: string;
  guardianEmail: string;
  status: "GRANTED" | "PENDING" | "REDACTED";
  videoConsent: boolean;
  telemetryConsent: boolean;
  medicalConsent: boolean;
  signedAt?: string;
  signatureHash?: string;
}

interface IDPRecord {
  id: string;
  playerId: string;
  playerName: string;
  squad: string;
  coachName: string;
  horizon: "30_DAYS" | "60_DAYS" | "90_DAYS";
  category: "Technical" | "Tactical" | "Fitness" | "Mental";
  title: string;
  targetMetric: string;
  currentValue: string;
  progressPct: number;
  status: "IN_PROGRESS" | "ACHIEVED" | "ATTENTION_REQUIRED";
  coachNotes: string;
  studentFeedback: string;
  updatedAt: string;
}

interface SchoolAsset {
  id: string;
  category: "Facility / Oval" | "Nets & Lanes" | "Electronic Telemetry" | "Machine & Gear";
  name: string;
  location: string;
  condition: "EXCELLENT" | "GOOD" | "MAINTENANCE_REQUIRED" | "CALIBRATION_DUE";
  status: "OPERATIONAL" | "RESERVED" | "UNDER_SERVICE";
  lastInspected: string;
  inspector: string;
  details: string;
}

export default function GovernanceView({ theme: D, activeSchoolId }: GovernanceViewProps) {
  const [activeTab, setActiveTab] = useState<"rbac_popia" | "parent_popia_consent" | "idp_tracker" | "asset_manager">("rbac_popia");
  const [selectedRole, setSelectedRole] = useState<string>("coach");

  const policy = POPIA_POLICIES[selectedRole] || POPIA_POLICIES.spectator;
  const roleMeta = ROLES[selectedRole] || ROLES.coach;

  // Filtered/Redacted sample data according to current role
  const samplePlayers = (getData("players", selectedRole, activeSchoolId) as any[]) || [];
  const sampleInjuries = (getData("injuries", selectedRole, activeSchoolId) as any[]) || [];

  // 1. Parent POPIA Consent State
  const [consentList, setConsentList] = useState<ConsentRecord[]>([
    { id: "c1", studentName: "Samuel Whitfield", grade: "Grade 12", team: "1st XI", guardianName: "David Whitfield", guardianEmail: "d.whitfield@mweb.co.za", status: "GRANTED", videoConsent: true, telemetryConsent: true, medicalConsent: true, signedAt: "2026-01-15", signatureHash: "SHA256-8F90A" },
    { id: "c2", studentName: "C. Solomons", grade: "Grade 11", team: "1st XI", guardianName: "M. Solomons", guardianEmail: "solomons.m@gmail.com", status: "GRANTED", videoConsent: true, telemetryConsent: true, medicalConsent: true, signedAt: "2026-01-18", signatureHash: "SHA256-4B12C" },
    { id: "c3", studentName: "Liam Campbell", grade: "Grade 12", team: "1st XI", guardianName: "Sarah Campbell", guardianEmail: "s.campbell@durban.gov.za", status: "GRANTED", videoConsent: true, telemetryConsent: true, medicalConsent: true, signedAt: "2026-01-12", signatureHash: "SHA256-7E88D" },
    { id: "c4", studentName: "Thabo Mthembu", grade: "Grade 9", team: "U15A", guardianName: "J. Mthembu", guardianEmail: "j.mthembu@iafrica.com", status: "PENDING", videoConsent: false, telemetryConsent: false, medicalConsent: true },
    { id: "c5", studentName: "R. Naidoo", grade: "Grade 8", team: "U14A", guardianName: "P. Naidoo", guardianEmail: "pnaidoo@law.co.za", status: "REDACTED", videoConsent: false, telemetryConsent: false, medicalConsent: false },
  ]);

  const [consentFilter, setConsentFilter] = useState<string>("ALL");

  // 2. IDP Records State
  const [idpList, setIdpList] = useState<IDPRecord[]>([
    { id: "idp1", playerId: "w1", playerName: "Samuel Whitfield", squad: "1st XI", coachName: "Brian Wessels", horizon: "30_DAYS", category: "Technical", title: "Short Ball Defense & Pull Shot Control", targetMetric: "Reduce Dismissals vs Fast Short Balls to < 10%", currentValue: "14% Dismissal Rate", progressPct: 75, status: "IN_PROGRESS", coachNotes: "Middling the ball cleanly off high backlift. Working on swivel foot movement in nets.", studentFeedback: "Feeling much more comfortable against 130km/h short deliveries in side-arm drills.", updatedAt: "2026-03-05" },
    { id: "idp2", playerId: "w2", playerName: "C. Solomons", squad: "1st XI", coachName: "Brian Wessels", horizon: "60_DAYS", category: "Tactical", title: "Middle Overs Strike Rotation vs Leg Spin", targetMetric: "Dot Ball % in Overs 7-15 < 35%", currentValue: "32% Dot Ball Rate", progressPct: 90, status: "ACHIEVED", coachNotes: "Excellent sweep and wrist flick off pads. Strike rate maintained at 128.5 in middle overs.", studentFeedback: "Target achieved in past 3 league fixtures.", updatedAt: "2026-03-07" },
    { id: "idp3", playerId: "w3", playerName: "Liam Campbell", squad: "1st XI", coachName: "Craig Hendricks", horizon: "30_DAYS", category: "Fitness", title: "Yo-Yo Intermittent Recovery Test Level 19.2", targetMetric: "Level 19.2 (National U19 Benchmark)", currentValue: "Level 18.6", progressPct: 60, status: "ATTENTION_REQUIRED", coachNotes: "Needs 2 additional interval shuttle sessions weekly with fitness trainer.", studentFeedback: "Working on leg stamina after minor quad tightness last month.", updatedAt: "2026-03-01" },
    { id: "idp4", playerId: "w4", playerName: "D. Ngcobo", squad: "1st XI", coachName: "Brian Wessels", horizon: "90_DAYS", category: "Technical", title: "Outswing Wrist Position & Yorker Precision", targetMetric: "Land 8/10 Death Overs Yorkers in Box", currentValue: "6/10 Yorkers Landed", progressPct: 80, status: "IN_PROGRESS", coachNotes: "Great arm action. Focusing on seam alignment on the release stride.", studentFeedback: "Seam position feels repeatable.", updatedAt: "2026-03-06" },
  ]);

  // 3. School Asset Roster
  const [assets, setAssets] = useState<SchoolAsset[]>([
    { id: "a1", category: "Facility / Oval", name: "Bowden's Field Main Oval", location: "North Campus, Westville", condition: "EXCELLENT", status: "OPERATIONAL", lastInspected: "2026-03-07", inspector: "J. Curator (Turf Master)", details: "Turf moisture 38%, compaction rating 8.8. Ready for Saturday derby match." },
    { id: "a2", category: "Facility / Oval", name: "Roy Couzens Oval", location: "South Campus, Westville", condition: "GOOD", status: "OPERATIONAL", lastInspected: "2026-03-06", inspector: "J. Curator", details: "Grass height 4.2mm, clean outfield boundary lines." },
    { id: "a3", category: "Nets & Lanes", name: "High-Perf Indoor Nets 1-6", location: "Cricket Pavilion", condition: "EXCELLENT", status: "OPERATIONAL", lastInspected: "2026-03-04", inspector: "C. Hendricks", details: "Synthetic turf lanes 1-3 resurfaced; LED lighting calibrated at 850 lux." },
    { id: "a4", category: "Electronic Telemetry", name: "Hawk-Eye Pocket Speed Radars (x4)", location: "Scoring Booth A", condition: "GOOD", status: "OPERATIONAL", lastInspected: "2026-03-05", inspector: "T. Analyst", details: "Lithium battery banks at 94%. Speed measurement error margin < 0.5 km/h." },
    { id: "a5", category: "Machine & Gear", name: "Bola Professional 2026 Bowling Machine", location: "Net 1", condition: "CALIBRATION_DUE", status: "RESERVED", lastInspected: "2026-02-28", inspector: "B. Wessels", details: "Wheel alignment check due before Friday afternoon 1st XI practice session." },
  ]);

  const toggleConsent = (id: string, field: "videoConsent" | "telemetryConsent" | "medicalConsent") => {
    setConsentList(prev => prev.map(c => {
      if (c.id !== id) return c;
      const updated = { ...c, [field]: !c[field] };
      const allTrue = updated.videoConsent && updated.telemetryConsent && updated.medicalConsent;
      return {
        ...updated,
        status: allTrue ? "GRANTED" : "PENDING",
        signedAt: new Date().toISOString().split("T")[0],
      };
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* Module Title Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>🛡️</span>
            <h2 style={{ fontFamily: D.head, fontSize: "18px", fontWeight: 800, color: D.textPrimary }}>
              INSTITUTIONAL GOVERNANCE & ACCESS CONTROL
            </h2>
          </div>
          <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted, marginTop: "2px" }}>
            POPIA child protection, 17-role RBAC enforcement, parent consent portal, IDPs, and school facility asset management
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: "6px", background: D.surf2, padding: "4px", borderRadius: D.pill, border: `1px solid ${D.border}` }}>
          {[
            { id: "rbac_popia", label: "🛡️ RBAC & POPIA Matrix" },
            { id: "parent_popia_consent", label: "📜 Parent Consent Portal" },
            { id: "idp_tracker", label: "🎯 Player IDP Tracker" },
            { id: "asset_manager", label: "🏟️ Oval & Asset Manager" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: "6px 14px",
                borderRadius: D.pill,
                border: "none",
                background: activeTab === tab.id ? D.indigo : "transparent",
                color: activeTab === tab.id ? "#fff" : D.textSecondary,
                fontFamily: D.head,
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB 1: RBAC & POPIA Matrix ── */}
      {activeTab === "rbac_popia" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Role Simulation Selector */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", padding: "12px 16px", background: D.surf1, borderRadius: D.md, border: `1px solid ${D.border}` }}>
            <span style={{ fontFamily: D.head, fontSize: "12px", fontWeight: 800, color: D.textPrimary }}>
              SIMULATED USER ROLE FOR FIELD-LEVEL REDACTION PREVIEW:
            </span>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              style={{
                padding: "6px 12px",
                borderRadius: D.pill,
                background: D.surf2,
                border: `1px solid ${D.border}`,
                color: D.textPrimary,
                fontFamily: D.body,
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              {Object.entries(ROLES).map(([key, r]) => (
                <option key={key} value={key}>
                  {r.label} ({ROLE_LAYERS.find(l => l.id === r.layer)?.label})
                </option>
              ))}
            </select>
          </div>

          {/* Role Policy Summary Card */}
          <div style={{ padding: "16px 20px", background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: D.md, background: `${roleMeta.color || D.indigo}20`, border: `1px solid ${roleMeta.color || D.indigo}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
                🛡️
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontFamily: D.head, fontSize: "15px", fontWeight: 800, color: D.textPrimary }}>
                    {roleMeta.label}
                  </span>
                  <span style={{ padding: "2px 8px", borderRadius: D.pill, background: `${roleMeta.color || D.indigo}20`, color: roleMeta.color || D.indigo, fontFamily: D.mono, fontSize: "10px", fontWeight: 700 }}>
                    Security Level {policy.sensitivityMax}/4
                  </span>
                </div>
                <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted, marginTop: "2px" }}>
                  Scope: {(policy.scope || "school").toUpperCase()} · Access: {(policy.access || policy.can || "read").toUpperCase()} · Redaction Masking Active
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", textAlign: "right" }}>
              <div style={{ padding: "8px 12px", background: D.surf2, borderRadius: D.md }}>
                <div style={{ fontFamily: D.mono, fontSize: "14px", fontWeight: 700, color: D.emerald }}>
                  {(policy.access || policy.can || "read").toUpperCase()}
                </div>
                <div style={{ fontFamily: D.head, fontSize: "9px", color: D.textMuted }}>CRUD PERMISSIONS</div>
              </div>
              <div style={{ padding: "8px 12px", background: D.surf2, borderRadius: D.md }}>
                <div style={{ fontFamily: D.mono, fontSize: "14px", fontWeight: 700, color: D.sky }}>
                  {(policy.scope || "all").toUpperCase()}
                </div>
                <div style={{ fontFamily: D.head, fontSize: "9px", color: D.textMuted }}>BOUNDARY SCOPE</div>
              </div>
            </div>
          </div>

          {/* Redaction Table */}
          <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${D.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: D.head, fontSize: "13px", fontWeight: 800 }}>LIVE FIELD-LEVEL REDACTION PREVIEW</div>
                <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted }}>
                  Demonstrating automated field redaction when querying via getData() under current role
                </div>
              </div>
              <span style={{ fontFamily: D.mono, fontSize: "11px", color: D.emerald }}>
                ✓ Verified POPIA Zero-Trust Choke Point
              </span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${D.border}`, background: D.surf0 }}>
                    <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>PLAYER</th>
                    <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>SCHOOL</th>
                    <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>SPORTING STATS</th>
                    <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>BIRTHDATE (PII)</th>
                    <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>HOUSE (PII)</th>
                  </tr>
                </thead>
                <tbody>
                  {samplePlayers.slice(0, 4).map((p: any) => (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${D.border}` }}>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontFamily: D.body, fontSize: "13px", fontWeight: 700, color: D.textPrimary }}>{p.name}</div>
                        <div style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>{p.role} · {p.team}</div>
                      </td>
                      <td style={{ padding: "12px 14px", fontFamily: D.head, fontSize: "12px", color: D.textSecondary }}>{p.school}</td>
                      <td style={{ padding: "12px 14px", fontFamily: D.mono, fontSize: "12px", color: D.sky }}>
                        Avg {p.avg} · SR {p.sr} · {p.wkts} wkts
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {p.born ? (
                          <span style={{ fontFamily: D.mono, fontSize: "12px", color: D.textPrimary }}>{p.born}</span>
                        ) : (
                          <span style={{ padding: "2px 6px", borderRadius: D.sm, background: `${D.rose}20`, color: D.rose, fontFamily: D.mono, fontSize: "9px", fontWeight: 700 }}>
                            [POPIA REDACTED]
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {p.houseAtSchool ? (
                          <span style={{ fontFamily: D.body, fontSize: "12px", color: D.textPrimary }}>{p.houseAtSchool}</span>
                        ) : (
                          <span style={{ padding: "2px 6px", borderRadius: D.sm, background: `${D.rose}20`, color: D.rose, fontFamily: D.mono, fontSize: "9px", fontWeight: 700 }}>
                            [POPIA REDACTED]
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: Parent POPIA Consent Portal ── */}
      {activeTab === "parent_popia_consent" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Header & Filter */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", padding: "16px", background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}` }}>
            <div>
              <div style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 800, color: D.textPrimary }}>
                📜 PARENT & GUARDIAN POPIA DIGITAL CONSENT MANAGEMENT
              </div>
              <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, marginTop: "2px" }}>
                Required under South African POPIA Act for minors (under 18) before broadcasting telemetry, video overlays, and media profiles.
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              {["ALL", "GRANTED", "PENDING", "REDACTED"].map(st => (
                <button
                  key={st}
                  onClick={() => setConsentFilter(st)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: D.pill,
                    border: `1px solid ${D.border}`,
                    background: consentFilter === st ? D.indigo : D.surf2,
                    color: consentFilter === st ? "#fff" : D.textSecondary,
                    fontFamily: D.mono,
                    fontSize: "10px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Consent Records Table */}
          <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${D.border}`, background: D.surf0 }}>
                    <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>STUDENT ATHLETE</th>
                    <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>GUARDIAN / PARENT</th>
                    <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>STATUS</th>
                    <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>VIDEO BROADCAST</th>
                    <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>RADAR TELEMETRY</th>
                    <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>MEDICAL RELEASE</th>
                    <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>DIGITAL AUDIT</th>
                  </tr>
                </thead>
                <tbody>
                  {consentList.filter(c => consentFilter === "ALL" || c.status === consentFilter).map(c => {
                    const statusColor = c.status === "GRANTED" ? D.emerald : c.status === "PENDING" ? D.amber : D.rose;
                    return (
                      <tr key={c.id} style={{ borderBottom: `1px solid ${D.border}` }}>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ fontFamily: D.body, fontSize: "13px", fontWeight: 700, color: D.textPrimary }}>
                            {c.studentName}
                          </div>
                          <div style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>
                            {c.grade} · {c.team}
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textSecondary }}>
                            {c.guardianName}
                          </div>
                          <div style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>
                            {c.guardianEmail}
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ padding: "3px 8px", borderRadius: D.pill, background: `${statusColor}20`, color: statusColor, fontFamily: D.head, fontSize: "10px", fontWeight: 800 }}>
                            {c.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <button
                            onClick={() => toggleConsent(c.id, "videoConsent")}
                            style={{
                              padding: "4px 8px",
                              borderRadius: D.sm,
                              border: `1px solid ${c.videoConsent ? D.emerald : D.border}`,
                              background: c.videoConsent ? `${D.emerald}20` : D.surf2,
                              color: c.videoConsent ? D.emerald : D.textMuted,
                              fontFamily: D.mono,
                              fontSize: "10px",
                              cursor: "pointer",
                            }}
                          >
                            {c.videoConsent ? "✓ Approved" : "✕ Revoked"}
                          </button>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <button
                            onClick={() => toggleConsent(c.id, "telemetryConsent")}
                            style={{
                              padding: "4px 8px",
                              borderRadius: D.sm,
                              border: `1px solid ${c.telemetryConsent ? D.sky : D.border}`,
                              background: c.telemetryConsent ? `${D.sky}20` : D.surf2,
                              color: c.telemetryConsent ? D.sky : D.textMuted,
                              fontFamily: D.mono,
                              fontSize: "10px",
                              cursor: "pointer",
                            }}
                          >
                            {c.telemetryConsent ? "✓ Enabled" : "✕ Disabled"}
                          </button>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <button
                            onClick={() => toggleConsent(c.id, "medicalConsent")}
                            style={{
                              padding: "4px 8px",
                              borderRadius: D.sm,
                              border: `1px solid ${c.medicalConsent ? D.indigo : D.border}`,
                              background: c.medicalConsent ? `${D.indigo}20` : D.surf2,
                              color: c.medicalConsent ? D.indigo : D.textMuted,
                              fontFamily: D.mono,
                              fontSize: "10px",
                              cursor: "pointer",
                            }}
                          >
                            {c.medicalConsent ? "✓ Cleared" : "✕ Restricted"}
                          </button>
                        </td>
                        <td style={{ padding: "12px 14px", fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>
                          {c.signedAt ? (
                            <div>
                              <div>Date: {c.signedAt}</div>
                              <div style={{ color: D.emerald, fontSize: "9px" }}>{c.signatureHash}</div>
                            </div>
                          ) : (
                            <span style={{ color: D.amber }}>Awaiting Signature</span>
                          )}
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

      {/* ── TAB 3: Player IDP Tracker ── */}
      {activeTab === "idp_tracker" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", padding: "16px", background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}` }}>
            <div>
              <div style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 800, color: D.textPrimary }}>
                🎯 COACH-TO-PLAYER INDIVIDUAL DEVELOPMENT PLAN (IDP) TRACKER
              </div>
              <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, marginTop: "2px" }}>
                30, 60, and 90-day actionable technical, tactical, physical, and mental milestones logged by squad coaches.
              </div>
            </div>

            <button
              onClick={() => {
                const newTitle = prompt("Enter IDP Goal Title:", "Death Overs Power Hitting & Range Hitting");
                if (!newTitle) return;
                const newRecord: IDPRecord = {
                  id: `idp_${Date.now()}`,
                  playerId: "w1",
                  playerName: "Samuel Whitfield",
                  squad: "1st XI",
                  coachName: "Brian Wessels",
                  horizon: "30_DAYS",
                  category: "Technical",
                  title: newTitle,
                  targetMetric: "SR > 165 in last 5 overs",
                  currentValue: "SR 142.0",
                  progressPct: 35,
                  status: "IN_PROGRESS",
                  coachNotes: "Newly assigned milestone.",
                  studentFeedback: "Ready for range hitting sessions.",
                  updatedAt: new Date().toISOString().split("T")[0],
                };
                setIdpList([newRecord, ...idpList]);
              }}
              style={{
                padding: "8px 16px",
                borderRadius: D.pill,
                background: D.indigo,
                border: "none",
                color: "#fff",
                fontFamily: D.head,
                fontSize: "11px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              + Create New IDP Goal
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "14px" }}>
            {idpList.map(idp => {
              const statusColor = idp.status === "ACHIEVED" ? D.emerald : idp.status === "IN_PROGRESS" ? D.sky : D.rose;
              return (
                <div key={idp.id} style={{ padding: "18px", borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}`, display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ padding: "2px 8px", borderRadius: D.pill, background: `${D.indigo}20`, color: D.indigo, fontFamily: D.mono, fontSize: "9px", fontWeight: 800 }}>
                          {idp.category.toUpperCase()}
                        </span>
                        <span style={{ padding: "2px 8px", borderRadius: D.pill, background: D.surf2, color: D.textMuted, fontFamily: D.mono, fontSize: "9px" }}>
                          {idp.horizon.replace("_", " ")}
                        </span>
                      </div>
                      <div style={{ fontFamily: D.head, fontSize: "15px", fontWeight: 800, color: D.textPrimary, marginTop: "6px" }}>
                        {idp.title}
                      </div>
                    </div>

                    <span style={{ padding: "3px 10px", borderRadius: D.pill, background: `${statusColor}20`, color: statusColor, fontFamily: D.head, fontSize: "10px", fontWeight: 800 }}>
                      {idp.status.replace("_", " ")}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", fontFamily: D.body, padding: "8px 12px", background: D.surf2, borderRadius: D.md }}>
                    <div>
                      <span style={{ color: D.textMuted }}>Athlete: </span>
                      <strong style={{ color: D.textPrimary }}>{idp.playerName} ({idp.squad})</strong>
                    </div>
                    <div>
                      <span style={{ color: D.textMuted }}>Coach: </span>
                      <strong style={{ color: D.textSecondary }}>{idp.coachName}</strong>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontFamily: D.mono, marginBottom: "4px" }}>
                      <span style={{ color: D.textMuted }}>Target: {idp.targetMetric}</span>
                      <span style={{ color: statusColor, fontWeight: 800 }}>{idp.progressPct}%</span>
                    </div>
                    <div style={{ height: "8px", borderRadius: D.pill, background: D.surf2, overflow: "hidden" }}>
                      <div style={{ width: `${idp.progressPct}%`, height: "100%", background: statusColor, transition: "width 0.3s ease" }}></div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px", fontFamily: D.body }}>
                    <div style={{ padding: "8px 10px", borderRadius: D.md, background: D.surf2, borderLeft: `3px solid ${D.indigo}` }}>
                      <span style={{ fontWeight: 700, color: D.indigo }}>Coach Note: </span>
                      <span style={{ color: D.textSecondary }}>{idp.coachNotes}</span>
                    </div>
                    <div style={{ padding: "8px 10px", borderRadius: D.md, background: D.surf2, borderLeft: `3px solid ${D.sky}` }}>
                      <span style={{ fontWeight: 700, color: D.sky }}>Student Self-Feedback: </span>
                      <span style={{ color: D.textSecondary }}>{idp.studentFeedback}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 4: School Oval & Equipment Asset Manager ── */}
      {activeTab === "asset_manager" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", padding: "16px", background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}` }}>
            <div>
              <div style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 800, color: D.textPrimary }}>
                🏟️ SCHOOL OVAL, TURF PITCH & EQUIPMENT ASSET MANAGER
              </div>
              <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, marginTop: "2px" }}>
                Curator pitch telemetry, turf compaction ratings, bowling machine calibration, and radar hardware inventory.
              </div>
            </div>

            <button
              onClick={() => alert("Asset maintenance log updated.")}
              style={{
                padding: "8px 16px",
                borderRadius: D.pill,
                background: D.emerald,
                border: "none",
                color: "#fff",
                fontFamily: D.head,
                fontSize: "11px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              + Log Curator Inspection
            </button>
          </div>

          <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${D.border}`, background: D.surf0 }}>
                    <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>CATEGORY</th>
                    <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>ASSET / FACILITY NAME</th>
                    <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>LOCATION</th>
                    <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>CONDITION</th>
                    <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>STATUS</th>
                    <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>LAST INSPECTED</th>
                    <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>CURATOR TELEMETRY</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map(ast => {
                    const condColor = ast.condition === "EXCELLENT" ? D.emerald : ast.condition === "GOOD" ? D.sky : ast.condition === "CALIBRATION_DUE" ? D.amber : D.rose;
                    return (
                      <tr key={ast.id} style={{ borderBottom: `1px solid ${D.border}` }}>
                        <td style={{ padding: "12px 14px", fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>
                          {ast.category}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ fontFamily: D.head, fontSize: "13px", fontWeight: 800, color: D.textPrimary }}>
                            {ast.name}
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px", fontFamily: D.body, fontSize: "12px", color: D.textSecondary }}>
                          📍 {ast.location}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ padding: "3px 8px", borderRadius: D.pill, background: `${condColor}20`, color: condColor, fontFamily: D.head, fontSize: "10px", fontWeight: 800 }}>
                            {ast.condition.replace("_", " ")}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ padding: "3px 8px", borderRadius: D.pill, background: D.surf2, color: D.textPrimary, fontFamily: D.mono, fontSize: "10px" }}>
                            {ast.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", fontFamily: D.mono, fontSize: "11px", color: D.textMuted }}>
                          <div>{ast.lastInspected}</div>
                          <div style={{ color: D.textSecondary, fontSize: "9px" }}>By {ast.inspector}</div>
                        </td>
                        <td style={{ padding: "12px 14px", fontFamily: D.body, fontSize: "11px", color: D.textMuted, maxWidth: "260px" }}>
                          {ast.details}
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
    </div>
  );
}
