'use client';

import React, { useState } from 'react';
import { Theme } from './types';
import { SPONSORSHIP_CAMPAIGNS, SCHOOLS_REGISTRY } from './data';

interface CommercialViewProps {
  theme: Theme;
  activeSchoolId: string;
}

export default function CommercialView({ theme: D, activeSchoolId }: CommercialViewProps) {
  const [campaigns, setCampaigns] = useState(SPONSORSHIP_CAMPAIGNS);
  const [scopeFilter, setScopeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Conflict simulator state
  const [simBrand, setSimBrand] = useState("");
  const [simCategory, setSimCategory] = useState("Automotive");
  const [simScope, setSimScope] = useState("Coastal");
  const [simResult, setSimResult] = useState<{ conflict: boolean; message: string } | null>(null);

  // New campaign modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newSponsorName, setNewSponsorName] = useState("");
  const [newCategory, setNewCategory] = useState("Banking");
  const [newContractVal, setNewContractVal] = useState("95000");
  const [newInventory, setNewInventory] = useState("LIVE_MATCH_SCORE_BUG");

  // Calculations
  const totalContractVal = campaigns.reduce((acc, c) => acc + c.contractValueZar, 0);
  const schoolRevenueShareTotal = campaigns.reduce(
    (acc, c) => acc + (c.contractValueZar * (c.revenueShareSchoolPct / 100)),
    0
  );
  const platformRevenueShareTotal = totalContractVal - schoolRevenueShareTotal;
  const totalImpressions = campaigns.reduce((acc, c) => acc + c.impressions, 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + c.clickThroughs, 0);
  const avgCtr = ((totalClicks / (totalImpressions || 1)) * 100).toFixed(2);

  // Filtered campaigns
  const filteredCampaigns = campaigns.filter(c => {
    if (scopeFilter !== "all" && c.scopeType !== scopeFilter) return false;
    if (categoryFilter !== "all" && c.brandCategory !== categoryFilter) return false;
    return true;
  });

  // Check category conflict
  const handleCheckConflict = () => {
    const existing = campaigns.find(
      c => c.brandCategory.toLowerCase() === simCategory.toLowerCase() && c.exclusivityProtected
    );
    if (existing) {
      setSimResult({
        conflict: true,
        message: `CONFLICT DETECTED: '${existing.sponsorName}' has category exclusivity for '${existing.brandCategory}' under scope '${existing.scopeType}:${existing.scopeId}' until ${existing.endDate}. New deal cannot proceed without school board waiver.`,
      });
    } else {
      setSimResult({
        conflict: false,
        message: `CLEARED: No conflicting exclusive partner found in category '${simCategory}' for scope '${simScope}'. Deal complies with SCRBRD Commercial Governance.`,
      });
    }
  };

  const handleCreateCampaign = () => {
    if (!newSponsorName.trim()) return;
    const newCamp = {
      id: `camp_${Date.now()}`,
      sponsorName: newSponsorName,
      logoText: newSponsorName,
      logoBg: "#0f766e",
      brandCategory: newCategory,
      scopeType: "school",
      scopeId: activeSchoolId,
      inventoryType: newInventory,
      status: "active",
      startDate: "2026-03-01",
      endDate: "2026-10-31",
      contractValueZar: parseInt(newContractVal, 10) || 50000,
      revenueShareSchoolPct: 80,
      revenueSharePlatformPct: 20,
      impressions: 1200,
      viewableImpressions: 1100,
      clickThroughs: 48,
      exclusivityProtected: false,
      ctaText: `Official Partner of ${activeSchoolId} Cricket`,
    };
    setCampaigns(prev => [newCamp, ...prev]);
    setAddModalOpen(false);
    setNewSponsorName("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>💼</span>
            <h2 style={{ fontFamily: D.head, fontSize: "18px", fontWeight: 800, color: D.textPrimary }}>
              COMMERCIAL RIGHTS & SPONSORSHIP ENGINE
            </h2>
          </div>
          <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted, marginTop: "2px" }}>
            Decentralized Inventory Allocation, Exclusivity Protection & 80/20 Revenue Governance
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setAddModalOpen(true)}
            style={{
              padding: "8px 16px",
              borderRadius: D.pill,
              background: D.indigo,
              border: "none",
              color: "#fff",
              fontFamily: D.head,
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: `0 4px 12px ${D.indigo}40`,
            }}
          >
            + Register Campaign
          </button>
        </div>
      </div>

      {/* Executive Financial KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
        <div style={{ padding: "16px", background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}` }}>
          <div style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, letterSpacing: "0.08em" }}>
            TOTAL CONTRACT VALUE
          </div>
          <div style={{ fontFamily: D.mono, fontSize: "24px", fontWeight: 800, color: D.emerald, marginTop: "4px" }}>
            R {totalContractVal.toLocaleString()}
          </div>
          <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, marginTop: "2px" }}>
            Across {campaigns.length} active multi-tier contracts
          </div>
        </div>

        <div style={{ padding: "16px", background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}` }}>
          <div style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, letterSpacing: "0.08em" }}>
            SCHOOL POOL EARNINGS (80%)
          </div>
          <div style={{ fontFamily: D.mono, fontSize: "24px", fontWeight: 800, color: D.sky, marginTop: "4px" }}>
            R {schoolRevenueShareTotal.toLocaleString()}
          </div>
          <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, marginTop: "2px" }}>
            Distributed to institutional cricket trusts
          </div>
        </div>

        <div style={{ padding: "16px", background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}` }}>
          <div style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, letterSpacing: "0.08em" }}>
            PLATFORM OPERATIONS (20%)
          </div>
          <div style={{ fontFamily: D.mono, fontSize: "24px", fontWeight: 800, color: D.indigo, marginTop: "4px" }}>
            R {platformRevenueShareTotal.toLocaleString()}
          </div>
          <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, marginTop: "2px" }}>
            Powers telemetry, live streaming & turfgrass sensors
          </div>
        </div>

        <div style={{ padding: "16px", background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}` }}>
          <div style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, letterSpacing: "0.08em" }}>
            ENGAGEMENT AUDIT
          </div>
          <div style={{ fontFamily: D.mono, fontSize: "24px", fontWeight: 800, color: D.amber, marginTop: "4px" }}>
            {avgCtr}% CTR
          </div>
          <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, marginTop: "2px" }}>
            {totalImpressions.toLocaleString()} views · {totalClicks.toLocaleString()} click-throughs
          </div>
        </div>
      </div>

      {/* Category Exclusivity & Conflict Engine */}
      <div style={{ padding: "16px 20px", background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <div style={{ fontFamily: D.head, fontSize: "13px", fontWeight: 800, color: D.amber }}>
              ⚡ CATEGORY EXCLUSIVITY & CONFLICT CHECKER
            </div>
            <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted }}>
              Automated validation preventing competing brands from holding identical inventory tiers
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "10px", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Proposing Sponsor (e.g. BMW Durban)"
            value={simBrand}
            onChange={e => setSimBrand(e.target.value)}
            style={{
              padding: "8px 12px",
              background: D.surf2,
              border: `1px solid ${D.border}`,
              borderRadius: D.sm,
              color: D.textPrimary,
              fontFamily: D.body,
              fontSize: "12px",
            }}
          />

          <select
            value={simCategory}
            onChange={e => setSimCategory(e.target.value)}
            style={{
              padding: "8px 12px",
              background: D.surf2,
              border: `1px solid ${D.border}`,
              borderRadius: D.sm,
              color: D.textPrimary,
              fontFamily: D.body,
              fontSize: "12px",
            }}
          >
            <option value="Automotive">Automotive</option>
            <option value="Banking">Banking & Wealth</option>
            <option value="Sportswear">Sportswear & Equipment</option>
            <option value="Nutrition">Nutrition & Supplements</option>
            <option value="Education">Education & Tertiary</option>
          </select>

          <select
            value={simScope}
            onChange={e => setSimScope(e.target.value)}
            style={{
              padding: "8px 12px",
              background: D.surf2,
              border: `1px solid ${D.border}`,
              borderRadius: D.sm,
              color: D.textPrimary,
              fontFamily: D.body,
              fontSize: "12px",
            }}
          >
            <option value="Coastal">Coastal Circuit (Durban)</option>
            <option value="Midlands">Midlands Circuit (Hilton/Balgowan)</option>
            <option value="WES">Westville Only</option>
            <option value="HIL">Hilton Only</option>
            <option value="all">Platform-Wide</option>
          </select>

          <button
            onClick={handleCheckConflict}
            style={{
              padding: "8px 16px",
              borderRadius: D.pill,
              background: D.amber,
              border: "none",
              color: "#000",
              fontFamily: D.head,
              fontSize: "11px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Verify Exclusivity
          </button>
        </div>

        {simResult && (
          <div
            style={{
              marginTop: "12px",
              padding: "10px 14px",
              borderRadius: D.md,
              background: simResult.conflict ? `${D.rose}18` : `${D.emerald}18`,
              border: `1px solid ${simResult.conflict ? D.rose : D.emerald}44`,
              fontFamily: D.body,
              fontSize: "12px",
              color: simResult.conflict ? D.rose : D.emerald,
              lineHeight: 1.4,
            }}
          >
            {simResult.message}
          </div>
        )}
      </div>

      {/* Campaigns Directory & Inventory Slots */}
      <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, overflow: "hidden" }}>
        {/* Filter bar */}
        <div style={{ padding: "12px 18px", borderBottom: `1px solid ${D.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ fontFamily: D.head, fontSize: "13px", fontWeight: 800 }}>ACTIVE SPONSORSHIP PORTFOLIO</div>

          <div style={{ display: "flex", gap: "8px" }}>
            <select
              value={scopeFilter}
              onChange={e => setScopeFilter(e.target.value)}
              style={{
                padding: "5px 10px",
                borderRadius: D.sm,
                background: D.surf2,
                border: `1px solid ${D.border}`,
                color: D.textPrimary,
                fontFamily: D.body,
                fontSize: "11px",
              }}
            >
              <option value="all">All Scopes</option>
              <option value="school">School-Specific</option>
              <option value="region">Regional Circuits</option>
              <option value="competition">Competition Title</option>
              <option value="platform">Platform-Wide</option>
            </select>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              style={{
                padding: "5px 10px",
                borderRadius: D.sm,
                background: D.surf2,
                border: `1px solid ${D.border}`,
                color: D.textPrimary,
                fontFamily: D.body,
                fontSize: "11px",
              }}
            >
              <option value="all">All Categories</option>
              <option value="Automotive">Automotive</option>
              <option value="Banking">Banking</option>
              <option value="Sportswear">Sportswear</option>
              <option value="Nutrition">Nutrition</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${D.border}`, background: D.surf0 }}>
                <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>SPONSOR & BRAND</th>
                <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>CATEGORY</th>
                <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>SCOPE & INVENTORY</th>
                <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>CONTRACT VAL</th>
                <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>SCHOOL SPLIT (80%)</th>
                <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>EXCLUSIVITY</th>
                <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>IMPRESSIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map(c => {
                const schoolShare = c.contractValueZar * (c.revenueShareSchoolPct / 100);
                return (
                  <tr key={c.id} style={{ borderBottom: `1px solid ${D.border}` }}>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            padding: "4px 8px",
                            borderRadius: D.sm,
                            background: c.logoBg || D.indigo,
                            color: "#fff",
                            fontFamily: D.head,
                            fontSize: "11px",
                            fontWeight: 800,
                          }}
                        >
                          {c.logoText}
                        </div>
                        <div>
                          <div style={{ fontFamily: D.body, fontSize: "12px", fontWeight: 700, color: D.textPrimary }}>
                            {c.sponsorName}
                          </div>
                          <div style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted }}>
                            {c.startDate} to {c.endDate}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ padding: "2px 8px", borderRadius: D.pill, background: D.surf2, fontFamily: D.body, fontSize: "11px", color: D.textSecondary }}>
                        {c.brandCategory}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontFamily: D.mono, fontSize: "11px", fontWeight: 700, color: D.sky }}>
                        {c.inventoryType.replace(/_/g, " ")}
                      </div>
                      <div style={{ fontFamily: D.body, fontSize: "10px", color: D.textMuted }}>
                        Scope: {c.scopeType.toUpperCase()} ({c.scopeId})
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", fontFamily: D.mono, fontSize: "13px", fontWeight: 700, color: D.textPrimary }}>
                      R {c.contractValueZar.toLocaleString()}
                    </td>
                    <td style={{ padding: "12px 14px", fontFamily: D.mono, fontSize: "13px", fontWeight: 700, color: D.emerald }}>
                      R {schoolShare.toLocaleString()} ({c.revenueShareSchoolPct}%)
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      {c.exclusivityProtected ? (
                        <span style={{ padding: "2px 6px", borderRadius: D.pill, background: `${D.emerald}20`, border: `1px solid ${D.emerald}44`, color: D.emerald, fontFamily: D.head, fontSize: "9px", fontWeight: 700 }}>
                          PROTECTED
                        </span>
                      ) : (
                        <span style={{ padding: "2px 6px", borderRadius: D.pill, background: D.surf2, color: D.textMuted, fontFamily: D.head, fontSize: "9px" }}>
                          NON-EXCLUSIVE
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px", fontFamily: D.mono, fontSize: "12px", color: D.textSecondary }}>
                      {c.impressions.toLocaleString()} views
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Campaign Modal */}
      {addModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 10000,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              background: D.surf1,
              border: `1px solid ${D.borderMed}`,
              borderRadius: D.lg,
              padding: "22px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div style={{ fontFamily: D.head, fontSize: "16px", fontWeight: 800, color: D.textPrimary }}>
              REGISTER NEW COMMERCIAL CAMPAIGN
            </div>

            <div>
              <label style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted, display: "block", marginBottom: "4px" }}>
                SPONSOR / BRAND NAME
              </label>
              <input
                type="text"
                placeholder="e.g. Puma South Africa"
                value={newSponsorName}
                onChange={e => setNewSponsorName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: D.surf2,
                  border: `1px solid ${D.border}`,
                  borderRadius: D.sm,
                  color: D.textPrimary,
                  fontFamily: D.body,
                  fontSize: "12px",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted, display: "block", marginBottom: "4px" }}>
                  BRAND CATEGORY
                </label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    borderRadius: D.sm,
                    color: D.textPrimary,
                    fontFamily: D.body,
                    fontSize: "12px",
                  }}
                >
                  <option value="Banking">Banking & Wealth</option>
                  <option value="Automotive">Automotive</option>
                  <option value="Sportswear">Sportswear</option>
                  <option value="Nutrition">Nutrition</option>
                  <option value="Technology">Technology</option>
                </select>
              </div>

              <div>
                <label style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted, display: "block", marginBottom: "4px" }}>
                  CONTRACT VALUE (ZAR)
                </label>
                <input
                  type="number"
                  value={newContractVal}
                  onChange={e => setNewContractVal(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    borderRadius: D.sm,
                    color: D.textPrimary,
                    fontFamily: D.mono,
                    fontSize: "12px",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted, display: "block", marginBottom: "4px" }}>
                INVENTORY PLACEMENT SLOT
              </label>
              <select
                value={newInventory}
                onChange={e => setNewInventory(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  background: D.surf2,
                  border: `1px solid ${D.border}`,
                  borderRadius: D.sm,
                  color: D.textPrimary,
                  fontFamily: D.body,
                  fontSize: "12px",
                }}
              >
                <option value="LIVE_MATCH_SCORE_BUG">Live Match Score Bug (Overlay)</option>
                <option value="PUBLIC_HOME_HERO">Public Circuit Hero Banner</option>
                <option value="WAGON_WHEEL_SAFE_ZONE">Wagon Wheel Safe Zone Watermark</option>
                <option value="SIX_TRACKER_MOMENT">Six Distance Tracker Moment</option>
                <option value="SCORECARD_FOOTER">Institutional Scorecard Footer</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" }}>
              <button
                onClick={() => setAddModalOpen(false)}
                style={{
                  padding: "8px 14px",
                  borderRadius: D.pill,
                  background: D.surf2,
                  border: `1px solid ${D.border}`,
                  color: D.textSecondary,
                  fontFamily: D.head,
                  fontSize: "11px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCampaign}
                style={{
                  padding: "8px 16px",
                  borderRadius: D.pill,
                  background: D.indigo,
                  border: "none",
                  color: "#fff",
                  fontFamily: D.head,
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Approve & Activate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
