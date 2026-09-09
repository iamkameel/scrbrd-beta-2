'use client';

import React, { useState } from 'react';
import { Theme } from './types';
import { SPONSORSHIP_CAMPAIGNS, SCHOOLS_REGISTRY } from './data';

interface CommercialViewProps {
  theme: Theme;
  activeSchoolId: string;
}

export default function CommercialView({ theme: D, activeSchoolId }: CommercialViewProps) {
  const [activeTab, setActiveTab] = useState<"portfolio" | "exclusivity" | "inventory_simulator" | "revenue_ledger">("portfolio");
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

  // Live Overlay Inventory Simulator State
  const [simSlot, setSimSlot] = useState<"SCORE_BUG" | "WAGON_WHEEL" | "SIX_TRACKER" | "MOTM_AWARD">("SCORE_BUG");
  const [activeSimSponsorId, setActiveSimSponsorId] = useState<string>(campaigns[0]?.id || "c1");

  const selectedSimSponsor = campaigns.find(c => c.id === activeSimSponsorId) || campaigns[0];

  // Financial Calculations
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
        message: `⛔ CONFLICT DETECTED: '${existing.sponsorName}' holds exclusive Category Rights for '${existing.brandCategory}' under Scope '${existing.scopeType.toUpperCase()}:${existing.scopeId}' until ${existing.endDate}. Proposing '${simBrand || "New Brand"}' violates the anti-cannibalization clause. School Board waiver required.`,
      });
    } else {
      setSimResult({
        conflict: false,
        message: `✅ CLEARED: No conflicting exclusive partner found in Category '${simCategory}' for Scope '${simScope}'. New agreement complies with SCRBRD Commercial Governance.`,
      });
    }
  };

  const handleCreateCampaign = () => {
    if (!newSponsorName.trim()) return;
    const newCamp = {
      id: `camp_${Date.now()}`,
      sponsorName: newSponsorName,
      logoText: newSponsorName.split(" ")[0].toUpperCase(),
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
      exclusivityProtected: true,
      ctaText: `Official Partner of ${activeSchoolId} Cricket`,
    };
    setCampaigns(prev => [newCamp, ...prev]);
    setAddModalOpen(false);
    setNewSponsorName("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* Engine Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "22px" }}>💼</span>
            <h2 style={{ fontFamily: D.head, fontSize: "18px", fontWeight: 800, color: D.textPrimary }}>
              COMMERCIAL RIGHTS & SPONSORSHIP ENGINE
            </h2>
          </div>
          <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted, marginTop: "2px" }}>
            Decentralized Inventory Allocation, Exclusivity Protection, Broadcast Overlays & 80/20 Revenue Distribution
          </div>
        </div>

        {/* Engine Sub-Tab Navigation */}
        <div style={{ display: "flex", gap: "6px", background: D.surf2, padding: "4px", borderRadius: D.pill, border: `1px solid ${D.border}` }}>
          {[
            { id: "portfolio", label: "📊 Portfolio & Governance" },
            { id: "exclusivity", label: "⚡ Exclusivity Matrix" },
            { id: "inventory_simulator", label: "📺 Overlay Slot Simulator" },
            { id: "revenue_ledger", label: "🏛️ Revenue Ledger (80/20)" },
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
            Distributed directly to school cricket trusts
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
            Powers telemetry, Hawk-Eye & turfgrass sensors
          </div>
        </div>

        <div style={{ padding: "16px", background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}` }}>
          <div style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 700, color: D.textMuted, letterSpacing: "0.08em" }}>
            ENGAGEMENT & CTR AUDIT
          </div>
          <div style={{ fontFamily: D.mono, fontSize: "24px", fontWeight: 800, color: D.amber, marginTop: "4px" }}>
            {avgCtr}% CTR
          </div>
          <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, marginTop: "2px" }}>
            {totalImpressions.toLocaleString()} views · {totalClicks.toLocaleString()} click-throughs
          </div>
        </div>
      </div>

      {/* ── SUB-TAB 1: PORTFOLIO & GOVERNANCE ── */}
      {activeTab === "portfolio" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Campaigns Directory & Inventory Slots */}
          <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, overflow: "hidden" }}>
            {/* Filter bar */}
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${D.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <div style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 800, color: D.textPrimary }}>
                  ACTIVE SPONSORSHIP PORTFOLIO
                </div>
                <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted }}>
                  Real-time status, contract valuations, and impression telemetry
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <select
                  value={scopeFilter}
                  onChange={e => setScopeFilter(e.target.value)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: D.pill,
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
                    padding: "6px 12px",
                    borderRadius: D.pill,
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

                <button
                  onClick={() => setAddModalOpen(true)}
                  style={{
                    padding: "6px 14px",
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
                  + Register Campaign
                </button>
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
        </div>
      )}

      {/* ── SUB-TAB 2: EXCLUSIVITY MATRIX & CONFLICT CHECKER ── */}
      {activeTab === "exclusivity" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Interactive Conflict Checker */}
          <div style={{ padding: "20px", background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}` }}>
            <div style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 800, color: D.amber, marginBottom: "4px" }}>
              ⚡ REAL-TIME CATEGORY EXCLUSIVITY & ANTI-CANNIBALIZATION CHECKER
            </div>
            <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted, marginBottom: "14px" }}>
              Prevents competing brands from holding overlapping inventory across school broadcasts and regional circuits.
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
                  padding: "8px 18px",
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
                Verify Rights
              </button>
            </div>

            {simResult && (
              <div
                style={{
                  marginTop: "14px",
                  padding: "12px 16px",
                  borderRadius: D.md,
                  background: simResult.conflict ? `${D.rose}18` : `${D.emerald}18`,
                  border: `1px solid ${simResult.conflict ? D.rose : D.emerald}44`,
                  fontFamily: D.body,
                  fontSize: "12px",
                  color: simResult.conflict ? D.rose : D.emerald,
                  lineHeight: 1.5,
                }}
              >
                {simResult.message}
              </div>
            )}
          </div>

          {/* Circuit Exclusivity Protection Grid */}
          <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, padding: "18px" }}>
            <div style={{ fontFamily: D.head, fontSize: "13px", fontWeight: 800, color: D.textPrimary, marginBottom: "12px" }}>
              ACTIVE CATEGORY EXCLUSIVITY MAP BY REGIONAL CIRCUIT
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
              {[
                { circuit: "KZN Coastal Circuit", holder: "Hollywoodbets", category: "Sports Betting & Title", status: "LOCKED", expiry: "2027-12-31", color: D.indigo },
                { circuit: "Midlands Circuit", holder: "FirstNationalBank", category: "Banking & Wealth", status: "LOCKED", expiry: "2026-11-30", color: D.emerald },
                { circuit: "High Performance Nets", holder: "Puma South Africa", category: "Apparel & Sportswear", status: "LOCKED", expiry: "2026-10-15", color: D.sky },
                { circuit: "Live Broadcast Score Bug", holder: "Sunfoil", category: "Edible Oils & Fast Moving Goods", status: "LOCKED", expiry: "2027-04-01", color: D.amber },
              ].map((map, i) => (
                <div key={i} style={{ padding: "14px", background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}`, display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 800, color: map.color }}>
                      {map.circuit}
                    </span>
                    <span style={{ padding: "2px 6px", borderRadius: D.pill, background: `${D.emerald}20`, color: D.emerald, fontFamily: D.mono, fontSize: "9px", fontWeight: 800 }}>
                      {map.status}
                    </span>
                  </div>

                  <div style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 800, color: D.textPrimary }}>
                    {map.holder}
                  </div>

                  <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted }}>
                    Category: <strong style={{ color: D.textSecondary }}>{map.category}</strong>
                  </div>

                  <div style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted, marginTop: "4px" }}>
                    Exclusive through: {map.expiry}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 3: BROADCAST OVERLAY SLOT SIMULATOR ── */}
      {activeTab === "inventory_simulator" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Simulator Controls */}
          <div style={{ padding: "18px", background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 800, color: D.textPrimary }}>
                📺 LIVE BROADCAST OVERLAY & WATERMARK SLOT SIMULATOR
              </div>
              <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted }}>
                Test high-res sponsor brand rendering on broadcast score bugs, wagon wheels, and six tracker moments.
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <select
                value={activeSimSponsorId}
                onChange={e => setActiveSimSponsorId(e.target.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: D.pill,
                  background: D.surf2,
                  border: `1px solid ${D.border}`,
                  color: D.textPrimary,
                  fontFamily: D.body,
                  fontSize: "12px",
                }}
              >
                {campaigns.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.sponsorName} ({c.inventoryType.replace(/_/g, " ")})
                  </option>
                ))}
              </select>

              <div style={{ display: "flex", gap: "4px", background: D.surf2, padding: "2px", borderRadius: D.pill }}>
                {[
                  { id: "SCORE_BUG", label: "Score Bug" },
                  { id: "WAGON_WHEEL", label: "Wagon Wheel" },
                  { id: "SIX_TRACKER", label: "6 Distance" },
                  { id: "MOTM_AWARD", label: "MOTM Award" },
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSimSlot(s.id as any)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: D.pill,
                      border: "none",
                      background: simSlot === s.id ? D.indigo : "transparent",
                      color: simSlot === s.id ? "#fff" : D.textMuted,
                      fontFamily: D.mono,
                      fontSize: "10px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Simulator Canvas Stage */}
          <div style={{ padding: "30px", background: "#090d16", borderRadius: D.xl, border: `2px solid ${D.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "320px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "12px", left: "16px", fontFamily: D.mono, fontSize: "10px", color: D.emerald, display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: D.emerald }}></span>
              SIMULATING 1080P BROADCAST FEED
            </div>

            {/* SLOT 1: SCORE BUG */}
            {simSlot === "SCORE_BUG" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <div style={{ display: "flex", borderRadius: "8px", overflow: "hidden", boxShadow: "0 12px 32px rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  <div style={{ background: "#0f172a", padding: "10px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 900, color: "#fff" }}>WES</span>
                    <span style={{ fontFamily: D.mono, fontSize: "18px", fontWeight: 800, color: D.emerald }}>184/4</span>
                    <span style={{ fontFamily: D.mono, fontSize: "11px", color: "#94a3b8" }}>(18.2 OV)</span>
                  </div>

                  {/* SPONSOR PLACEMENT */}
                  <div style={{ background: selectedSimSponsor.logoBg || "#0d9488", padding: "10px 18px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontFamily: D.head, fontSize: "12px", fontWeight: 900, color: "#fff", letterSpacing: "0.05em" }}>
                      {selectedSimSponsor.logoText}
                    </span>
                    <span style={{ fontFamily: D.body, fontSize: "9px", color: "rgba(255,255,255,0.8)" }}>
                      OFFICIAL
                    </span>
                  </div>
                </div>
                <div style={{ fontFamily: D.body, fontSize: "11px", color: "#94a3b8" }}>
                  Live Score Bug Overlay — Position: Bottom-Left Screen Safe-Zone
                </div>
              </div>
            )}

            {/* SLOT 2: WAGON WHEEL */}
            {simSlot === "WAGON_WHEEL" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "220px", height: "220px", borderRadius: "50%", border: "2px dashed #0284c7", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle, #022c22 0%, #020617 100%)" }}>
                  {/* Pitch center */}
                  <div style={{ width: "12px", height: "30px", background: "#d97706", borderRadius: "2px" }}></div>
                  {/* Rays */}
                  <div style={{ position: "absolute", top: "20px", left: "140px", width: "70px", height: "2px", background: "#10b981", transform: "rotate(-30deg)" }}></div>
                  <div style={{ position: "absolute", bottom: "30px", right: "130px", width: "80px", height: "2px", background: "#38bdf8", transform: "rotate(45deg)" }}></div>

                  {/* Watermark Logo */}
                  <div style={{ position: "absolute", bottom: "16px", padding: "4px 10px", borderRadius: "12px", background: selectedSimSponsor.logoBg || "#0d9488", color: "#fff", fontFamily: D.head, fontSize: "10px", fontWeight: 900, opacity: 0.9 }}>
                    POWERED BY {selectedSimSponsor.sponsorName.toUpperCase()}
                  </div>
                </div>
                <div style={{ fontFamily: D.body, fontSize: "11px", color: "#94a3b8" }}>
                  360° Wagon Wheel Vector Watermark Overlay
                </div>
              </div>
            )}

            {/* SLOT 3: SIX TRACKER */}
            {simSlot === "SIX_TRACKER" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <div style={{ padding: "16px 28px", borderRadius: "16px", background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)", border: "2px solid #38bdf8", boxShadow: "0 10px 30px rgba(56,189,248,0.3)", textAlign: "center" }}>
                  <div style={{ fontFamily: D.head, fontSize: "12px", fontWeight: 800, color: "#e0f2fe" }}>
                    🚀 MAXIMUM SIX DISTANCE
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: "36px", fontWeight: 900, color: "#fff", margin: "4px 0" }}>
                    98.4 METRES
                  </div>
                  <div style={{ padding: "4px 12px", borderRadius: D.pill, background: "#ffffff", color: "#0f172a", fontFamily: D.head, fontSize: "11px", fontWeight: 900 }}>
                    {selectedSimSponsor.sponsorName} SIX TRACKER
                  </div>
                </div>
                <div style={{ fontFamily: D.body, fontSize: "11px", color: "#94a3b8" }}>
                  Triggered on Boundary 6s — Full Screen Stinger
                </div>
              </div>
            )}

            {/* SLOT 4: MOTM AWARD */}
            {simSlot === "MOTM_AWARD" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <div style={{ padding: "20px 32px", borderRadius: "16px", background: "#0f172a", border: "2px solid #f59e0b", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <div style={{ fontSize: "28px" }}>🏆</div>
                  <div style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 900, color: "#f59e0b" }}>
                    {selectedSimSponsor.sponsorName.toUpperCase()} MAN OF THE MATCH
                  </div>
                  <div style={{ fontFamily: D.head, fontSize: "18px", fontWeight: 800, color: "#fff" }}>
                    Samuel Whitfield (104* off 58 balls)
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: "11px", color: "#94a3b8" }}>
                    Prize: R 2,500 High-Performance Equipment Voucher
                  </div>
                </div>
                <div style={{ fontFamily: D.body, fontSize: "11px", color: "#94a3b8" }}>
                  Post-Match Presentation Title Sponsor Banner
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SUB-TAB 4: REVENUE DISTRIBUTION LEDGER (80/20) ── */}
      {activeTab === "revenue_ledger" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Governance Explanation */}
          <div style={{ padding: "18px", background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 800, color: D.emerald }}>
                🏛️ INSTITUTIONAL REVENUE GOVERNANCE & DISBURSEMENT LEDGER
              </div>
              <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted, marginTop: "2px" }}>
                Under the SCRBRD Charter, 80% of all gross sponsorship earnings flow directly to school cricket trusts, while 20% maintains platform telemetry infrastructure.
              </div>
            </div>

            <button
              onClick={() => alert("Downloading Official Revenue Audit & Section 18A Tax Certificates...")}
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
              📄 Export Audit Ledger (PDF)
            </button>
          </div>

          {/* School Revenue Distribution Breakdown Table */}
          <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${D.border}`, background: D.surf0 }}>
                    <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>INSTITUTIONAL SCHOOL TRUST</th>
                    <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>CIRCUIT REGION</th>
                    <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>TOTAL REVENUE SHARE (80%)</th>
                    <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>DISBURSED YTD</th>
                    <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>PENDING Q1 DISBURSEMENT</th>
                    <th style={{ padding: "10px 14px", fontFamily: D.head, fontSize: "10px", color: D.textMuted }}>BURSARY FUNDING</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { school: "Westville Boys' High School", circuit: "Coastal", total: 116000, disbursed: 92000, pending: 24000, bursary: 15000 },
                    { school: "Hilton College", circuit: "Midlands", total: 96000, disbursed: 76000, pending: 20000, bursary: 12000 },
                    { school: "Michaelhouse", circuit: "Midlands", total: 84000, disbursed: 68000, pending: 16000, bursary: 10000 },
                    { school: "Durban High School (DHS)", circuit: "Coastal", total: 72000, disbursed: 58000, pending: 14000, bursary: 18000 },
                    { school: "Kearsney College", circuit: "Inland", total: 68000, disbursed: 54000, pending: 14000, bursary: 8000 },
                    { school: "Maritzburg College", circuit: "Inland", total: 64000, disbursed: 50000, pending: 14000, bursary: 12000 },
                  ].map((s, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid ${D.border}` }}>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontFamily: D.head, fontSize: "13px", fontWeight: 800, color: D.textPrimary }}>
                          {s.school}
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", fontFamily: D.body, fontSize: "11px", color: D.textSecondary }}>
                        {s.circuit}
                      </td>
                      <td style={{ padding: "12px 14px", fontFamily: D.mono, fontSize: "13px", fontWeight: 800, color: D.emerald }}>
                        R {s.total.toLocaleString()}
                      </td>
                      <td style={{ padding: "12px 14px", fontFamily: D.mono, fontSize: "12px", color: D.sky }}>
                        R {s.disbursed.toLocaleString()}
                      </td>
                      <td style={{ padding: "12px 14px", fontFamily: D.mono, fontSize: "12px", color: D.amber, fontWeight: 700 }}>
                        R {s.pending.toLocaleString()}
                      </td>
                      <td style={{ padding: "12px 14px", fontFamily: D.mono, fontSize: "12px", color: D.indigo }}>
                        R {s.bursary.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Campaign Modal */}
      {addModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.82)",
            backdropFilter: "blur(4px)",
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
              maxWidth: "520px",
              background: D.surf1,
              border: `1px solid ${D.borderMed}`,
              borderRadius: D.lg,
              padding: "22px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              boxShadow: "0 24px 48px rgba(0,0,0,0.8)",
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
