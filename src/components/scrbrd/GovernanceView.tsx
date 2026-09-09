'use client';

import React, { useState } from 'react';
import { Theme } from './types';
import { ROLES, ROLE_LAYERS, POPIA_POLICIES, getData, PLAYERS, INJURIES } from './data';

interface GovernanceViewProps {
  theme: Theme;
  activeSchoolId: string;
}

export default function GovernanceView({ theme: D, activeSchoolId }: GovernanceViewProps) {
  const [selectedRole, setSelectedRole] = useState<string>("coach");

  const policy = POPIA_POLICIES[selectedRole] || POPIA_POLICIES.spectator;
  const roleMeta = ROLES[selectedRole] || ROLES.coach;

  // Filtered/Redacted sample data according to current role
  const samplePlayers = getData("players", selectedRole, activeSchoolId);
  const sampleInjuries = getData("injuries", selectedRole, activeSchoolId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>🛡️</span>
            <h2 style={{ fontFamily: D.head, fontSize: "18px", fontWeight: 800, color: D.textPrimary }}>
              POPIA COMPLIANCE & 17-ROLE RBAC GOVERNANCE
            </h2>
          </div>
          <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted, marginTop: "2px" }}>
            South African Protection of Personal Information Act (Child Welfare) & Field-Level Redaction Choke Point
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontFamily: D.mono, fontSize: "11px", color: D.textMuted }}>SIMULATE ROLE:</span>
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
      </div>

      {/* Role Policy Summary Card */}
      <div
        style={{
          padding: "16px 20px",
          background: D.surf1,
          borderRadius: D.lg,
          border: `1px solid ${D.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: D.md,
              background: `${roleMeta.color || D.indigo}20`,
              border: `1px solid ${roleMeta.color || D.indigo}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
            }}
          >
            🛡️
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontFamily: D.head, fontSize: "15px", fontWeight: 800, color: D.textPrimary }}>
                {roleMeta.label}
              </span>
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: D.pill,
                  background: `${roleMeta.color || D.indigo}20`,
                  color: roleMeta.color || D.indigo,
                  fontFamily: D.mono,
                  fontSize: "10px",
                  fontWeight: 700,
                }}
              >
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

      {/* Interactive Field Redaction Inspector Table */}
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
                <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>BIOMETRICS</th>
              </tr>
            </thead>
            <tbody>
              {samplePlayers.slice(0, 4).map((p: any) => (
                <tr key={p.id} style={{ borderBottom: `1px solid ${D.border}` }}>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontFamily: D.body, fontSize: "13px", fontWeight: 700, color: D.textPrimary }}>
                      {p.name}
                    </div>
                    <div style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>
                      {p.role} · {p.team}
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", fontFamily: D.head, fontSize: "12px", color: D.textSecondary }}>
                    {p.school}
                  </td>
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
                  <td style={{ padding: "12px 14px" }}>
                    {p.height ? (
                      <span style={{ fontFamily: D.mono, fontSize: "12px", color: D.textPrimary }}>{p.height}, {p.weight}</span>
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

      {/* Clinical Injury Privacy Comparison */}
      <div style={{ padding: "16px 20px", background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}` }}>
        <div style={{ fontFamily: D.head, fontSize: "13px", fontWeight: 800, color: D.textPrimary, marginBottom: "6px" }}>
          CLINICAL HEALTH & INJURY ACCESS LEVEL
        </div>
        <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted, marginBottom: "12px" }}>
          Under POPIA Section 26, child health telemetry is special personal information. Spectators and Scouts receive zero clinical disclosure.
        </div>

        {sampleInjuries.length === 0 ? (
          <div style={{ padding: "14px", background: `${D.rose}15`, border: `1px solid ${D.rose}33`, borderRadius: D.md, fontFamily: D.body, fontSize: "12px", color: D.rose }}>
            ⛔ Strict Zero Clinical Disclosure: Role &apos;{selectedRole}&apos; is barred from accessing player rehabilitation and injury diagnoses.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" }}>
            {sampleInjuries.map((inj: any) => (
              <div key={inj.id} style={{ padding: "12px", background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: D.head, fontSize: "12px", fontWeight: 700, color: D.textPrimary }}>
                    {inj.player}
                  </span>
                  <span style={{ padding: "2px 6px", borderRadius: D.pill, background: `${D.amber}20`, color: D.amber, fontFamily: D.mono, fontSize: "9px" }}>
                    {inj.phase}
                  </span>
                </div>
                <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, marginTop: "6px" }}>
                  {inj.injury ? `Diagnosis: ${inj.injury}` : "Clinical Diagnosis: Masked for Coach"}
                </div>
                <div style={{ fontFamily: D.mono, fontSize: "10px", color: D.emerald, marginTop: "4px" }}>
                  Estimated Clearance: {inj.rtw}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 17 Roles Governance Matrix Summary */}
      <div style={{ padding: "16px 20px", background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}` }}>
        <div style={{ fontFamily: D.head, fontSize: "13px", fontWeight: 800, color: D.textPrimary, marginBottom: "12px" }}>
          6-LAYER SECURITY MATRIX TAXONOMY
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
          {ROLE_LAYERS.map(layer => {
            const layerRoles = Object.entries(ROLES).filter(([_, r]) => r.layer === layer.id);
            return (
              <div key={layer.id} style={{ padding: "12px", background: D.surf2, borderRadius: D.md, borderTop: `3px solid ${layer.color}` }}>
                <div style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 800, color: layer.color }}>
                  {layer.label}
                </div>
                <div style={{ fontFamily: D.body, fontSize: "10px", color: D.textMuted, marginTop: "2px" }}>
                  {layerRoles.map(([k, r]) => r.label).join(", ")}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
