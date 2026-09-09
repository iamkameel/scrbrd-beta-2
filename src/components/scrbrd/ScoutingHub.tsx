'use client';

import React, { useState, useMemo } from 'react';
import { Theme, Player } from './types';
import { PLAYERS, VERIFIED_SCOUTS } from './data';

interface ScoutingHubProps {
  theme: Theme;
  players?: Player[];
}

const SCOUTING_REPORTS: Record<string, {
  mechanics: {
    batting: { stance: string; trigger: string; headPos: string; pointOfImpact: string };
    bowling?: { runUp: string; gather: string; kneeBrace: string; releasePoint: string; seam: string };
  };
  strengths: string[];
  growthAreas: string[];
  proComparison: { name: string; school: string; similarityPct: number; notes: string };
  scoutSummary: string;
}> = {
  p1: {
    mechanics: {
      batting: {
        stance: "Balanced base, feet shoulder-width, slight crouch keeping eyes level with bowler's release window.",
        trigger: "Subtle back-and-across movement onto balls of feet, preparing for rapid weight transfer.",
        headPos: "Exceptional stillness at impact; nose aligned directly over the line of off-stump.",
        pointOfImpact: "Early contact beneath the eyes on the front foot; superb delayed wrists when cutting.",
      },
      bowling: {
        runUp: "Rhythmic 14-step approach with consistent velocity build-up.",
        gather: "Semi-open chest posture during leap.",
        kneeBrace: "Solid front leg stabilization providing 118 km/h seam.",
        releasePoint: "High 11 o'clock arm path with upright seam presentation.",
        seam: "Wobble seam with occasional late inswing into right-handers.",
      },
    },
    strengths: [
      "Elite temperament under high pressure in derby fixtures",
      "Pristine cover drive with high elbow and pure balance",
      "Quick footwork against quality finger spin in the powerplay",
      "Natural leader on-field with calm decision-making",
    ],
    growthAreas: [
      "Vulnerability to rapid short-pitched bouncers angled into the ribcage",
      "Strike rotation in middle overs (overs 9–14) when boundary sweepers are deployed",
      "Occasionally plants front foot too early against incoming swing",
    ],
    proComparison: {
      name: "Graeme Smith",
      school: "King Edward VII (KES)",
      similarityPct: 88,
      notes: "Commanding presence at the crease with imposing off-side boundary power and gritty match-winning resolve.",
    },
    scoutSummary: "Top-tier provincial prospect. Technical base is mature beyond U19 level. High ceiling for national academy intake.",
  },
  p2: {
    mechanics: {
      batting: {
        stance: "Narrow upright stance with high backlift aiming for long-lever extension.",
        trigger: "Front foot press forward without deep backlift.",
        headPos: "Slight head fall to off side on aggressive pull shots.",
        pointOfImpact: "Extended reach out in front of the body.",
      },
      bowling: {
        runUp: "Aggressive, explosive 18-step build-up generating immense momentum through the crease.",
        gather: "Side-on coil with strong counter-rotation of shoulders.",
        kneeBrace: "Rock-solid front knee lock with zero flex on delivery stride, maximizing kinetic transfer.",
        releasePoint: "Violent snap of the wrist at 12 o'clock, releasing at 128–132 km/h.",
        seam: "Upright seam hitting the deck hard on a 6–7m good length.",
      },
    },
    strengths: [
      "Genuinely rapid pace (consistently over 128 km/h with heavy ball effect)",
      "Lethal scrambled-seam yorker targeted at toes in the 19th/20th overs",
      "Relentless stamina; maintains top ball speed into third spell",
      "Aggressive bouncer with sharp climbing trajectory",
    ],
    growthAreas: [
      "Over-bowls short ball when frustrated by disciplined leaves",
      "Follow-through crosses into the danger zone under fatigue",
      "Batting defense requires tightening against genuine leg-spin",
    ],
    proComparison: {
      name: "Dale Steyn",
      school: "Hans Strijdom High",
      similarityPct: 91,
      notes: "Skiddy, aggressive pace through the air with intimidating seam bounce and natural outswing.",
    },
    scoutSummary: "Premier fast bowling talent in KZN school cricket. Genuine strike bowler with high wicket-taking probability.",
  },
  p3: {
    mechanics: {
      batting: {
        stance: "Wide, crouched base suited for 360-degree power hitting as a left-hander.",
        trigger: "Deep backward press into the crease to create room through the off side.",
        headPos: "Level eyes with explosive rotary hip swing on contact.",
        pointOfImpact: "Power arc impact through mid-wicket and extra cover.",
      },
    },
    strengths: [
      "Devastating boundary striker in death overs (SR 142.0)",
      "Unorthodox ramp and scoop options against express pacers",
      "Clean hand-eye coordination with high bat speed",
    ],
    growthAreas: [
      "Shot selection in first 10 balls before eye is in",
      "Defensive patience on damp, seaming pitches",
    ],
    proComparison: {
      name: "David Miller",
      school: "Maritzburg College",
      similarityPct: 86,
      notes: "Clean-hitting white-ball destroyer with rapid forearm snap through the ball.",
    },
    scoutSummary: "Exceptional white-ball batting firepower. Game-changer in T20 and high-chase situations.",
  },
  p81: {
    mechanics: {
      batting: {
        stance: "Broad athletic base, shoulders square to mid-off, relaxed grip.",
        trigger: "Backward and across shuffle onto back foot.",
        headPos: "Stable chin tucked down over ball trajectory.",
        pointOfImpact: "Under the eyes, punishing anything short or wide.",
      },
      bowling: {
        runUp: "Smooth 15-step approach accelerating toward the crease.",
        gather: "Chest-on jump with high front arm.",
        kneeBrace: "Firm front block delivering 120-124 km/h seam.",
        releasePoint: "11:30 arm release with sharp wrist action.",
        seam: "Upright seam hitting the crack with sharp off-cutter variation.",
      },
    },
    strengths: [
      "Northwood captain with supreme match awareness",
      "Heavy back-foot pull and cut strokes on fast coastal wickets",
      "Clutch death overs bowling with reliable wide yorkers",
    ],
    growthAreas: [
      "Tendency to poke at fifth-stump line in early overs",
      "Can get caught on the crease against skiddy arm-balls",
    ],
    proComparison: {
      name: "Shaun Pollock",
      school: "Northwood School",
      similarityPct: 89,
      notes: "Intelligent tactical bowling and dependable counter-attacking stroke-maker.",
    },
    scoutSummary: "High-character leader and complete all-rounder. Ready for Dolphins Academy intake.",
  },
};

const PRESET_QUERIES = [
  "Who is the leading wicket-taker in the U19 league?",
  "Which batsman has the highest strike rate in the death overs?",
  "Show fast bowlers with SR > 120 and lethal outswing",
  "Compare James Whitfield vs Ryan Brand metrics",
];

export default function ScoutingHub({ theme: D, players }: ScoutingHubProps) {
  const allPlayers = players || PLAYERS;
  const [hubTab, setHubTab] = useState<"mechanics" | "search" | "network" | "compare">("mechanics");

  // Selected player for Mechanics View
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("p1");
  const [queryInput, setQueryInput] = useState<string>("");
  const [queryResult, setQueryResult] = useState<string | null>(null);
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [dreamTeamOpen, setDreamTeamOpen] = useState<boolean>(false);

  // Multi-criteria talent search filters
  const [filterRole, setFilterRole] = useState<string>("All");
  const [filterBowlingStyle, setFilterBowlingStyle] = useState<string>("All");
  const [filterMinAvg, setFilterMinAvg] = useState<number>(30);
  const [filterMinWkts, setFilterMinWkts] = useState<number>(10);
  const [filterTier, setFilterTier] = useState<string>("All");

  // Comparison state
  const [comparePlayerAId, setComparePlayerAId] = useState<string>("p1");
  const [comparePlayerBId, setComparePlayerBId] = useState<string>("p81");

  const activePlayer = allPlayers.find(p => p.id === selectedPlayerId) || allPlayers[0];
  const report = SCOUTING_REPORTS[selectedPlayerId] || SCOUTING_REPORTS.p1;

  // Filtered players for talent search
  const filteredTalent = useMemo(() => {
    return allPlayers.filter(p => {
      if (filterRole !== "All" && p.role !== filterRole) return false;
      if (filterBowlingStyle !== "All" && p.bowlStyle !== filterBowlingStyle) return false;
      if (p.avg < filterMinAvg) return false;
      if (p.wkts < filterMinWkts && p.role !== "BAT" && p.role !== "WK") return false;
      return true;
    });
  }, [allPlayers, filterRole, filterBowlingStyle, filterMinAvg, filterMinWkts]);

  const handleRunQuery = (q: string) => {
    setQueryInput(q);
    setIsQuerying(true);
    setTimeout(() => {
      setIsQuerying(false);
      if (q.toLowerCase().includes("wicket") || q.toLowerCase().includes("bowler")) {
        setQueryResult("📊 Luca De Villiers (Westville) leads the league with 24 wickets @ 18.4 avg. Followed closely by Callum Henderson (Northwood) with 27 wickets @ 14.2 avg on coastal tracks.");
      } else if (q.toLowerCase().includes("strike rate") || q.toLowerCase().includes("death")) {
        setQueryResult("⚡ Ethan Solomons (Westville) & Ryan Brand (Northwood) lead death-overs strike rate (>134.0), converting 42% of balls in overs 16–20 into boundaries.");
      } else if (q.toLowerCase().includes("fast") || q.toLowerCase().includes("outswing")) {
        setQueryResult("🎯 Scout Match: Callum Henderson (Northwood, 188cm, 27 wkts) & Luca De Villiers (Westville, 130 km/h) match elite pace criteria with verified outswing.");
      } else {
        setQueryResult(`🔍 Analysis for ${activePlayer.name}: 48.2 Batting Avg, 135.4 Strike Rate. Pro Comparison: ${report.proComparison.name} (${report.proComparison.similarityPct}% mechanical similarity). Recommended for provincial academy contract.`);
      }
    }, 500);
  };

  const compPlayerA = allPlayers.find(p => p.id === comparePlayerAId) || allPlayers[0];
  const compPlayerB = allPlayers.find(p => p.id === comparePlayerBId) || allPlayers[1];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* Header & Mode Switcher */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>🎯</span>
            <h2 style={{ fontFamily: D.head, fontSize: "18px", fontWeight: 800, color: D.textPrimary }}>
              TALENT DISCOVERY & BIOMECHANICAL SCOUTING SUITE
            </h2>
          </div>
          <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted, marginTop: "2px" }}>
            Verified Scout Network, Explainable Multi-Criteria Queries & POPIA-Compliant Talent Tiers
          </div>
        </div>

        {/* Hub Tabs */}
        <div style={{ display: "flex", background: D.surf2, borderRadius: D.pill, padding: "2px", border: `1px solid ${D.border}` }}>
          {[
            { id: "mechanics", label: "Biomechanical Dossier" },
            { id: "search", label: "Explainable Talent Finder" },
            { id: "compare", label: "Head-to-Head Compare" },
            { id: "network", label: "Verified Scout Roster" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setHubTab(t.id as any)}
              style={{
                padding: "6px 12px",
                borderRadius: D.pill,
                background: hubTab === t.id ? D.indigo : "transparent",
                border: "none",
                color: hubTab === t.id ? "#fff" : D.textSecondary,
                fontFamily: D.head,
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB 1: BIOMECHANICAL DOSSIER ───────────────── */}
      {hubTab === "mechanics" && (
        <>
          {/* AI Natural Language Query Strip */}
          <div style={{ padding: "14px 16px", borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}`, display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px" }}>🤖</span>
              <span style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 800, color: D.sky }}>
                SCRBRD NATURAL LANGUAGE SCOUTING QUERY AGENT
              </span>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={queryInput}
                onChange={e => setQueryInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleRunQuery(queryInput)}
                placeholder="Ask anything (e.g. 'Fastest bowler on coastal wickets' or 'Death overs strike rate leaders')..."
                style={{
                  flex: 1,
                  padding: "8px 14px",
                  borderRadius: D.pill,
                  background: D.surf2,
                  border: `1px solid ${D.border}`,
                  color: D.textPrimary,
                  fontFamily: D.body,
                  fontSize: "12px",
                  outline: "none",
                }}
              />
              <button
                onClick={() => handleRunQuery(queryInput || PRESET_QUERIES[0])}
                disabled={isQuerying}
                style={{
                  padding: "0 18px",
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
                {isQuerying ? "Analyzing..." : "Ask Agent"}
              </button>
            </div>

            {/* Query Result Box */}
            {queryResult && (
              <div style={{ padding: "10px 14px", borderRadius: D.md, background: `${D.indigo}18`, border: `1px solid ${D.indigo}44`, fontFamily: D.body, fontSize: "12px", color: D.textPrimary, lineHeight: 1.5 }}>
                {queryResult}
              </div>
            )}
          </div>

          {/* Player Selector Bar */}
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
            {allPlayers.map(p => {
              const isSelected = p.id === selectedPlayerId;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlayerId(p.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: D.pill,
                    background: isSelected ? D.indigo : D.surf1,
                    border: `1px solid ${isSelected ? D.indigo : D.border}`,
                    color: isSelected ? "#fff" : D.textPrimary,
                    fontFamily: D.head,
                    fontSize: "11px",
                    fontWeight: isSelected ? 700 : 500,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>{p.role === "BAT" ? "🏏" : p.role === "BOWL" ? "⚡" : "★"}</span>
                  <span>{p.name}</span>
                  <span style={{ fontFamily: D.mono, fontSize: "9px", opacity: 0.8 }}>({p.school})</span>
                </button>
              );
            })}
          </div>

          {/* Main Scouting Dossier Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 1fr) 340px", gap: "16px" }}>
            {/* Left: Biomechanical Breakdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Overview Banner */}
              <div style={{ padding: "16px", borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: D.head, fontSize: "16px", fontWeight: 800, color: D.textPrimary }}>
                      {activePlayer.name} · Technical Dossier
                    </div>
                    <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textMuted }}>
                      {activePlayer.school} · {activePlayer.team} · {activePlayer.role} · Bat: {activePlayer.batHand}HB · Bowl: {activePlayer.bowlArm}A {activePlayer.bowlStyle}
                    </div>
                  </div>
                  <div style={{ padding: "4px 10px", borderRadius: D.pill, background: `${D.emerald}20`, border: `1px solid ${D.emerald}44`, fontFamily: D.mono, fontSize: "10px", color: D.emerald, fontWeight: 700 }}>
                    Verified Scout Network Tier
                  </div>
                </div>

                <div style={{ marginTop: "10px", padding: "10px", borderRadius: D.md, background: D.surf2, fontFamily: D.body, fontSize: "12px", color: D.textSecondary, fontStyle: "italic", lineHeight: 1.5 }}>
                  &ldquo;{report.scoutSummary}&rdquo;
                </div>
              </div>

              {/* Batting Biomechanics */}
              <div style={{ padding: "16px", borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}`, display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontFamily: D.head, fontSize: "12px", fontWeight: 800, color: D.sky, display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>🏏</span> BATTING BIOMECHANICAL AUDIT
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div style={{ padding: "10px", background: D.surf2, borderRadius: D.md }}>
                    <div style={{ fontFamily: D.head, fontSize: "9px", color: D.textMuted }}>STANCE & BALANCE</div>
                    <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textPrimary, marginTop: "4px", lineHeight: 1.5 }}>{report.mechanics.batting.stance}</div>
                  </div>
                  <div style={{ padding: "10px", background: D.surf2, borderRadius: D.md }}>
                    <div style={{ fontFamily: D.head, fontSize: "9px", color: D.textMuted }}>TRIGGER MOVEMENT</div>
                    <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textPrimary, marginTop: "4px", lineHeight: 1.5 }}>{report.mechanics.batting.trigger}</div>
                  </div>
                  <div style={{ padding: "10px", background: D.surf2, borderRadius: D.md }}>
                    <div style={{ fontFamily: D.head, fontSize: "9px", color: D.textMuted }}>HEAD & SIGHTLINE</div>
                    <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textPrimary, marginTop: "4px", lineHeight: 1.5 }}>{report.mechanics.batting.headPos}</div>
                  </div>
                  <div style={{ padding: "10px", background: D.surf2, borderRadius: D.md }}>
                    <div style={{ fontFamily: D.head, fontSize: "9px", color: D.textMuted }}>CONTACT POINT</div>
                    <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textPrimary, marginTop: "4px", lineHeight: 1.5 }}>{report.mechanics.batting.pointOfImpact}</div>
                  </div>
                </div>
              </div>

              {/* Bowling Mechanics */}
              {report.mechanics.bowling && (
                <div style={{ padding: "16px", borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}`, display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ fontFamily: D.head, fontSize: "12px", fontWeight: 800, color: D.violet, display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>⚡</span> BOWLING KINETIC CHAIN AUDIT
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "10px" }}>
                    <div style={{ padding: "10px", background: D.surf2, borderRadius: D.md }}>
                      <div style={{ fontFamily: D.head, fontSize: "9px", color: D.textMuted }}>RUN-UP RHYTHM</div>
                      <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textPrimary, marginTop: "4px", lineHeight: 1.5 }}>{report.mechanics.bowling.runUp}</div>
                    </div>
                    <div style={{ padding: "10px", background: D.surf2, borderRadius: D.md }}>
                      <div style={{ fontFamily: D.head, fontSize: "9px", color: D.textMuted }}>GATHER & COIL</div>
                      <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textPrimary, marginTop: "4px", lineHeight: 1.5 }}>{report.mechanics.bowling.gather}</div>
                    </div>
                    <div style={{ padding: "10px", background: D.surf2, borderRadius: D.md }}>
                      <div style={{ fontFamily: D.head, fontSize: "9px", color: D.textMuted }}>FRONT KNEE BRACE</div>
                      <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textPrimary, marginTop: "4px", lineHeight: 1.5 }}>{report.mechanics.bowling.kneeBrace}</div>
                    </div>
                    <div style={{ padding: "10px", background: D.surf2, borderRadius: D.md }}>
                      <div style={{ fontFamily: D.head, fontSize: "9px", color: D.textMuted }}>RELEASE & SEAM</div>
                      <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textPrimary, marginTop: "4px", lineHeight: 1.5 }}>{report.mechanics.bowling.releasePoint}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side: Pro Comparison & Verified Strengths */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ padding: "16px", borderRadius: D.lg, background: `linear-gradient(135deg, ${D.surf1}, ${D.surf2})`, border: `1px solid ${D.borderMed}`, display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: D.head, fontSize: "10px", fontWeight: 800, color: D.amber, letterSpacing: "0.06em" }}>
                    ★ PRO PLAYER ARCHETYPE
                  </span>
                  <span style={{ fontFamily: D.mono, fontSize: "13px", fontWeight: 800, color: D.amber }}>
                    {report.proComparison.similarityPct}% Match
                  </span>
                </div>

                <div>
                  <div style={{ fontFamily: D.head, fontSize: "16px", fontWeight: 800, color: D.textPrimary }}>
                    {report.proComparison.name}
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted }}>
                    Alma Mater: {report.proComparison.school}
                  </div>
                </div>

                <div style={{ width: "100%", height: "5px", background: D.surf3, borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${report.proComparison.similarityPct}%`, height: "100%", background: D.amber, borderRadius: "3px" }} />
                </div>

                <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textSecondary, lineHeight: 1.4, marginTop: "4px" }}>
                  {report.proComparison.notes}
                </div>
              </div>

              {/* Strengths */}
              <div style={{ padding: "14px", borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}`, display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 800, color: D.emerald }}>
                  ✓ VERIFIED TECHNICAL STRENGTHS
                </div>
                {report.strengths.map((s, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "6px", fontFamily: D.body, fontSize: "11px", color: D.textPrimary, lineHeight: 1.4 }}>
                    <span style={{ color: D.emerald, fontWeight: 700 }}>•</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>

              {/* Growth Areas */}
              <div style={{ padding: "14px", borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}`, display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ fontFamily: D.head, fontSize: "11px", fontWeight: 800, color: D.rose }}>
                  △ DEVELOPMENTAL REFINEMENTS
                </div>
                {report.growthAreas.map((g, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "6px", fontFamily: D.body, fontSize: "11px", color: D.textPrimary, lineHeight: 1.4 }}>
                    <span style={{ color: D.rose, fontWeight: 700 }}>•</span>
                    <span>{g}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── TAB 2: EXPLAINABLE TALENT SEARCH ──────────── */}
      {hubTab === "search" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Filters Bar */}
          <div style={{ padding: "16px 20px", background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}` }}>
            <div style={{ fontFamily: D.head, fontSize: "13px", fontWeight: 800, color: D.textPrimary, marginBottom: "12px" }}>
              MULTI-CRITERIA TALENT SEARCH FILTER
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
              <div>
                <label style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted, display: "block", marginBottom: "4px" }}>ROLE</label>
                <select
                  value={filterRole}
                  onChange={e => setFilterRole(e.target.value)}
                  style={{ width: "100%", padding: "6px 10px", background: D.surf2, border: `1px solid ${D.border}`, borderRadius: D.sm, color: D.textPrimary, fontSize: "12px" }}
                >
                  <option value="All">All Roles</option>
                  <option value="BAT">Batsman (BAT)</option>
                  <option value="BOWL">Bowler (BOWL)</option>
                  <option value="ALL">All-Rounder (ALL)</option>
                  <option value="WK">Wicketkeeper (WK)</option>
                </select>
              </div>

              <div>
                <label style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted, display: "block", marginBottom: "4px" }}>MIN BATTING AVG</label>
                <input
                  type="range"
                  min={20}
                  max={50}
                  value={filterMinAvg}
                  onChange={e => setFilterMinAvg(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
                <span style={{ fontFamily: D.mono, fontSize: "11px", color: D.indigo }}>{filterMinAvg}+ runs/innings</span>
              </div>

              <div>
                <label style={{ fontFamily: D.mono, fontSize: "10px", color: D.textMuted, display: "block", marginBottom: "4px" }}>MIN WICKETS</label>
                <input
                  type="range"
                  min={5}
                  max={30}
                  value={filterMinWkts}
                  onChange={e => setFilterMinWkts(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
                <span style={{ fontFamily: D.mono, fontSize: "11px", color: D.sky }}>{filterMinWkts}+ wickets</span>
              </div>
            </div>
          </div>

          {/* Matches Roster */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "14px" }}>
            {filteredTalent.map(p => (
              <div
                key={p.id}
                style={{
                  padding: "16px",
                  borderRadius: D.lg,
                  background: D.surf1,
                  border: `1px solid ${D.border}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 800, color: D.textPrimary }}>
                      {p.name}
                    </div>
                    <div style={{ fontFamily: D.mono, fontSize: "11px", color: D.textMuted }}>
                      {p.school} · {p.team} · {p.role}
                    </div>
                  </div>
                  <span style={{ padding: "2px 8px", borderRadius: D.pill, background: `${D.emerald}20`, color: D.emerald, fontFamily: D.head, fontSize: "9px", fontWeight: 700 }}>
                    APPROVED SCOUT TIER
                  </span>
                </div>

                {/* Key Metrics */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", textAlign: "center" }}>
                  <div style={{ padding: "6px", background: D.surf2, borderRadius: D.sm }}>
                    <div style={{ fontFamily: D.mono, fontSize: "14px", fontWeight: 700, color: D.indigo }}>{p.avg}</div>
                    <div style={{ fontFamily: D.head, fontSize: "8px", color: D.textMuted }}>BATTING AVG</div>
                  </div>
                  <div style={{ padding: "6px", background: D.surf2, borderRadius: D.sm }}>
                    <div style={{ fontFamily: D.mono, fontSize: "14px", fontWeight: 700, color: D.sky }}>{p.sr}</div>
                    <div style={{ fontFamily: D.head, fontSize: "8px", color: D.textMuted }}>STRIKE RATE</div>
                  </div>
                  <div style={{ padding: "6px", background: D.surf2, borderRadius: D.sm }}>
                    <div style={{ fontFamily: D.mono, fontSize: "14px", fontWeight: 700, color: D.emerald }}>{p.wkts}</div>
                    <div style={{ fontFamily: D.head, fontSize: "8px", color: D.textMuted }}>WICKETS</div>
                  </div>
                </div>

                {/* Explainable Discovery Rationale */}
                <div style={{ padding: "8px 10px", background: `${D.indigo}12`, borderRadius: D.sm, border: `1px solid ${D.indigo}33`, fontFamily: D.body, fontSize: "11px", color: D.textSecondary, lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 700, color: D.indigo }}>Scout Rationale: </span>
                  {p.role === "ALL"
                    ? `Dual-threat all-rounder with ${p.sr} SR in death overs and reliable seam control.`
                    : p.role === "BOWL"
                    ? `Strike bowler with ${p.wkts} wickets and steep bounce on coastal tracks.`
                    : `Anchoring top-order bat averaging ${p.avg} with proven derby composure.`}
                </div>

                <button
                  onClick={() => {
                    setSelectedPlayerId(p.id);
                    setHubTab("mechanics");
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
                    textAlign: "center",
                  }}
                >
                  View Biomechanical Dossier →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: HEAD-TO-HEAD COMPARE ───────────────── */}
      {hubTab === "compare" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ padding: "14px 20px", background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ fontFamily: D.head, fontSize: "13px", fontWeight: 800 }}>
              SELECT TWO PLAYERS FOR SIDE-BY-SIDE EVALUATION
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <select
                value={comparePlayerAId}
                onChange={e => setComparePlayerAId(e.target.value)}
                style={{ padding: "6px 10px", background: D.surf2, border: `1px solid ${D.border}`, borderRadius: D.sm, color: D.textPrimary, fontSize: "11px" }}
              >
                {allPlayers.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.school})</option>
                ))}
              </select>
              <span style={{ fontFamily: D.mono, color: D.amber, alignSelf: "center", fontWeight: 700 }}>VS</span>
              <select
                value={comparePlayerBId}
                onChange={e => setComparePlayerBId(e.target.value)}
                style={{ padding: "6px 10px", background: D.surf2, border: `1px solid ${D.border}`, borderRadius: D.sm, color: D.textPrimary, fontSize: "11px" }}
              >
                {allPlayers.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.school})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparison Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {[compPlayerA, compPlayerB].map((player, idx) => (
              <div key={player.id} style={{ padding: "20px", background: D.surf1, borderRadius: D.lg, border: `1px solid ${idx === 0 ? D.indigo : D.sky}44`, display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: D.head, fontSize: "18px", fontWeight: 800, color: D.textPrimary }}>{player.name}</div>
                    <div style={{ fontFamily: D.mono, fontSize: "11px", color: D.textMuted }}>{player.school} · {player.role} · {player.team}</div>
                  </div>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: idx === 0 ? `${D.indigo}25` : `${D.sky}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                    {idx === 0 ? "A" : "B"}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                  <div style={{ padding: "10px", background: D.surf2, borderRadius: D.md }}>
                    <div style={{ fontFamily: D.head, fontSize: "9px", color: D.textMuted }}>BATTING AVERAGE</div>
                    <div style={{ fontFamily: D.mono, fontSize: "20px", fontWeight: 800, color: D.emerald }}>{player.avg}</div>
                  </div>
                  <div style={{ padding: "10px", background: D.surf2, borderRadius: D.md }}>
                    <div style={{ fontFamily: D.head, fontSize: "9px", color: D.textMuted }}>STRIKE RATE</div>
                    <div style={{ fontFamily: D.mono, fontSize: "20px", fontWeight: 800, color: D.sky }}>{player.sr}</div>
                  </div>
                  <div style={{ padding: "10px", background: D.surf2, borderRadius: D.md }}>
                    <div style={{ fontFamily: D.head, fontSize: "9px", color: D.textMuted }}>WICKETS TAKEN</div>
                    <div style={{ fontFamily: D.mono, fontSize: "20px", fontWeight: 800, color: D.amber }}>{player.wkts}</div>
                  </div>
                  <div style={{ padding: "10px", background: D.surf2, borderRadius: D.md }}>
                    <div style={{ fontFamily: D.head, fontSize: "9px", color: D.textMuted }}>CAREER RUNS</div>
                    <div style={{ fontFamily: D.mono, fontSize: "20px", fontWeight: 800, color: D.indigo }}>{player.careerTotals?.runs || 0}</div>
                  </div>
                </div>

                <div style={{ fontFamily: D.body, fontSize: "12px", color: D.textSecondary, lineHeight: 1.5, padding: "10px", background: D.surf2, borderRadius: D.md }}>
                  {player.bio}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: VERIFIED SCOUT ROSTER ───────────────── */}
      {hubTab === "network" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ padding: "16px 20px", background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}` }}>
            <div style={{ fontFamily: D.head, fontSize: "13px", fontWeight: 800, color: D.emerald, marginBottom: "4px" }}>
              ✓ VERIFIED INSTITUTIONAL SCOUT NETWORK
            </div>
            <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted }}>
              Accredited scouts with legal clearance and POPIA compliance tokens to observe KZN circuit fixtures
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
            {VERIFIED_SCOUTS.map(scout => (
              <div key={scout.id} style={{ padding: "16px", background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontFamily: D.head, fontSize: "14px", fontWeight: 800, color: D.textPrimary }}>
                      {scout.name}
                    </div>
                    <div style={{ fontFamily: D.body, fontSize: "11px", color: D.sky, fontWeight: 600 }}>
                      {scout.organisation}
                    </div>
                  </div>
                  <span style={{ padding: "2px 8px", borderRadius: D.pill, background: `${D.emerald}20`, color: D.emerald, fontFamily: D.mono, fontSize: "9px", fontWeight: 700 }}>
                    VERIFIED
                  </span>
                </div>

                <div style={{ fontFamily: D.body, fontSize: "11px", color: D.textMuted }}>
                  Role: {scout.role} · Scope: {scout.scoutingScope}
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "4px", paddingTop: "8px", borderTop: `1px solid ${D.border}` }}>
                  <div style={{ fontFamily: D.mono, fontSize: "10px", color: D.textSecondary }}>
                    Shortlisted: <span style={{ fontWeight: 700, color: D.indigo }}>{scout.shortlistCount} players</span>
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: "10px", color: D.textSecondary }}>
                    Verified Since: <span style={{ color: D.textMuted }}>{scout.verifiedDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
