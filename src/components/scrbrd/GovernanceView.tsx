'use client';

import React, { useState } from 'react';
import { Theme } from './types';
import { ROLES, ROLE_LAYERS, POPIA_POLICIES, getData } from './data';

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

export default function GovernanceView({ theme: D, activeSchoolId }: GovernanceViewProps) {
  const [activeTab, setActiveTab] = useState<"rbac_popia" | "parent_popia_consent">("rbac_popia");
  const [selectedRole, setSelectedRole] = useState<string>("coach");

  const policy = POPIA_POLICIES[selectedRole] || POPIA_POLICIES.spectator;
  const roleMeta = ROLES[selectedRole] || ROLES.coach;

  // 1. Parent POPIA Consent State
  const [consentList, setConsentList] = useState<ConsentRecord[]>([
    { id: "c1", studentName: "Samuel Whitfield", grade: "Grade 12", team: "1st XI", guardianName: "David Whitfield", guardianEmail: "d.whitfield@mweb.co.za", status: "GRANTED", videoConsent: true, telemetryConsent: true, medicalConsent: true, signedAt: "2026-01-15", signatureHash: "SHA256-8F90A" },
    { id: "c2", studentName: "C. Solomons", grade: "Grade 11", team: "1st XI", guardianName: "M. Solomons", guardianEmail: "solomons.m@gmail.com", status: "GRANTED", videoConsent: true, telemetryConsent: true, medicalConsent: true, signedAt: "2026-01-18", signatureHash: "SHA256-4B12C" },
    { id: "c3", studentName: "Liam Campbell", grade: "Grade 12", team: "1st XI", guardianName: "Sarah Campbell", guardianEmail: "s.campbell@durban.gov.za", status: "GRANTED", videoConsent: true, telemetryConsent: true, medicalConsent: true, signedAt: "2026-01-12", signatureHash: "SHA256-7E88D" },
    { id: "c4", studentName: "Thabo Mthembu", grade: "Grade 9", team: "U15A", guardianName: "J. Mthembu", guardianEmail: "j.mthembu@iafrica.com", status: "PENDING", videoConsent: false, telemetryConsent: false, medicalConsent: true },
    { id: "c5", studentName: "R. Naidoo", grade: "Grade 8", team: "U14A", guardianName: "P. Naidoo", guardianEmail: "pnaidoo@law.co.za", status: "REDACTED", videoConsent: false, telemetryConsent: false, medicalConsent: false },
  ]);

  const [consentFilter, setConsentFilter] = useState<string>("ALL");

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

  const filteredConsents = consentList.filter(c => {
    if (consentFilter === "ALL") return true;
    return c.status === consentFilter;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "1320px", margin: "0 auto", width: "100%" }}>
      {/* Module Title Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>🛡️</span>
            <h2 style={{ fontFamily: D.head, fontSize: "18px", fontWeight: 800, color: D.textPrimary, margin: 0 }}>
              INSTITUTIONAL GOVERNANCE & POPIA COMPLIANCE
            </h2>
          </div>
          <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted, marginTop: "2px" }}>
            Protection of Personal Information Act (POPIA) child protection, guardian consent portal, and 17-role RBAC enforcement
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: "6px", background: D.surf2, padding: "4px", borderRadius: D.pill, border: `1px solid ${D.border}` }}>
          {[
            { id: "rbac_popia", label: "🛡️ RBAC & POPIA Matrix" },
            { id: "parent_popia_consent", label: "📜 Parent Consent Portal" },
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
        </div>
      )}

      {/* ── TAB 2: Parent POPIA Consent Portal ── */}
      {activeTab === "parent_popia_consent" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", padding: "16px", background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}` }}>
            <div>
              <div style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 800, color: D.textPrimary }}>
                📜 PARENTAL & GUARDIAN POPIA CONSENT PORTAL
              </div>
              <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, marginTop: "2px" }}>
                Mandatory guardian sign-off for minor athletes under Section 35 of the Protection of Personal Information Act.
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              {["ALL", "GRANTED", "PENDING", "REDACTED"].map(f => (
                <button
                  key={f}
                  onClick={() => setConsentFilter(f)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: D.sm,
                    background: consentFilter === f ? D.indigo : D.surf2,
                    color: consentFilter === f ? "#fff" : D.textSecondary,
                    border: `1px solid ${D.border}`,
                    fontFamily: D.head,
                    fontSize: "10px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontFamily: D.body, fontSize: "12px" }}>
                <thead>
                  <tr style={{ background: D.surf0, borderBottom: `1px solid ${D.border}`, color: D.textMuted, fontFamily: D.mono, fontSize: "10px" }}>
                    <th style={{ padding: "12px 14px" }}>ATHLETE</th>
                    <th style={{ padding: "12px 14px" }}>GUARDIAN & CONTACT</th>
                    <th style={{ padding: "12px 14px" }}>POPIA STATUS</th>
                    <th style={{ padding: "12px 14px" }}>VIDEO BROADCAST</th>
                    <th style={{ padding: "12px 14px" }}>TELEMETRY & RADAR</th>
                    <th style={{ padding: "12px 14px" }}>MEDICAL CLEARANCE</th>
                    <th style={{ padding: "12px 14px" }}>AUDIT SIGNATURE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredConsents.map(c => {
                    const statusColor = c.status === "GRANTED" ? D.emerald : c.status === "PENDING" ? D.amber : D.rose;
                    return (
                      <tr key={c.id} style={{ borderBottom: `1px solid ${D.border}` }}>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ fontFamily: D.head, fontWeight: 700, color: D.textPrimary }}>{c.studentName}</div>
                          <div style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>{c.grade} · {c.team}</div>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ fontWeight: 600, color: D.textSecondary }}>{c.guardianName}</div>
                          <div style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>{c.guardianEmail}</div>
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
                            {c.videoConsent ? "✓ Enabled" : "✕ Disabled"}
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
    </div>
  );
}
