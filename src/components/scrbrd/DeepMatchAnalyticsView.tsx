'use client';

import React, { useState } from 'react';
import { Theme } from './types';
import { DeliveryRecord } from './BroadcastScorer';

const DEFAULT_MODAL_THEME: Theme = {
  bg: "#0b0f19",
  surf0: "#0e1424",
  surf1: "#141c2e",
  surf2: "#1c263d",
  surf3: "#253352",
  border: "rgba(255,255,255,0.08)",
  borderMed: "rgba(255,255,255,0.15)",
  textPrimary: "#f8fafc",
  textSecondary: "#94a3b8",
  textMuted: "#64748b",
  cardBg: "#141c2e",
  isDark: true,
  indigo: "#6366f1",
  sky: "#38bdf8",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  orange: "#f97316",
  violet: "#8b5cf6",
  cyan: "#06b6d4",
  teal: "#14b8a6",
  lime: "#84cc16",
  pink: "#ec4899",
  gradMain: "linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)",
  gradGold: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
  gradLive: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  pill: "9999px",
  mono: "'JetBrains Mono', 'DM Mono', monospace",
  head: "'Space Grotesk', system-ui, sans-serif",
  body: "'Inter', system-ui, sans-serif",
};

interface DeepMatchAnalyticsViewProps {
  theme?: Theme;
  homeTeamName?: string;
  awayTeamName?: string;
  deliveries?: DeliveryRecord[];
  currentRuns?: number;
  currentWickets?: number;
  currentOvers?: string;
  targetRuns?: number;
  matchState?: any;
  battingSquad?: any[];
  bowlingAttack?: any[];
  matchSettings?: any;
}

export default function DeepMatchAnalyticsView({
  theme: userTheme,
  homeTeamName = "Westville 1st XI",
  awayTeamName = "Kearsney 1st XI",
  deliveries = [],
  currentRuns = 142,
  currentWickets = 3,
  currentOvers = "14.2",
  targetRuns = 187,
}: DeepMatchAnalyticsViewProps) {
  const D = userTheme || DEFAULT_MODAL_THEME;
  const [activeAnalyticsSection, setActiveAnalyticsSection] = useState<'manhattan' | 'worm' | 'wagon' | 'phases'>('manhattan');

  // Compute over-by-over runs and wickets for Manhattan chart (overs 1 to 20)
  const overStats = React.useMemo(() => {
    // Generate 20 overs structure
    const oversArray = Array.from({ length: 20 }, (_, i) => ({
      over: i + 1,
      runs: 0,
      wickets: 0,
      dots: 0,
      boundaries: 0,
      phase: i < 6 ? 'powerplay' : i < 15 ? 'middle' : 'death',
    }));

    // Seed base distribution for overs 1 to 14
    const baseOverRuns = [8, 12, 6, 14, 9, 11, 7, 8, 10, 6, 13, 9, 11, 8];
    const baseOverWkts = [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0];

    baseOverRuns.forEach((r, idx) => {
      if (oversArray[idx]) {
        oversArray[idx].runs = r;
        oversArray[idx].wickets = baseOverWkts[idx] || 0;
      }
    });

    // Add extra runs from recorded deliveries
    deliveries.forEach(d => {
      if (d.overIndex < 20 && oversArray[d.overIndex]) {
        oversArray[d.overIndex].runs += d.totalRuns;
        if (d.isWicket) oversArray[d.overIndex].wickets += 1;
        if (d.totalRuns === 0 && d.isLegalDelivery) oversArray[d.overIndex].dots += 1;
        if (d.runsOffBat >= 4) oversArray[d.overIndex].boundaries += 1;
      }
    });

    return oversArray;
  }, [deliveries]);

  // Phase Aggregation
  const phaseStats = React.useMemo(() => {
    const pp = overStats.slice(0, 6).reduce((acc, o) => ({ runs: acc.runs + o.runs, wkts: acc.wkts + o.wickets }), { runs: 0, wkts: 0 });
    const mid = overStats.slice(6, 15).reduce((acc, o) => ({ runs: acc.runs + o.runs, wkts: acc.wkts + o.wickets }), { runs: 0, wkts: 0 });
    const death = overStats.slice(15, 20).reduce((acc, o) => ({ runs: acc.runs + o.runs, wkts: acc.wkts + o.wickets }), { runs: 0, wkts: 0 });

    return {
      powerplay: { ...pp, overs: 6, rr: (pp.runs / 6).toFixed(2) },
      middle: { ...mid, overs: 9, rr: (mid.runs / 9).toFixed(2) },
      death: { ...death, overs: 5, rr: death.runs > 0 ? (death.runs / 5).toFixed(2) : '0.00' },
    };
  }, [overStats]);

  // Worm Cumulative Progression
  const wormData = React.useMemo(() => {
    let cumulative = 0;
    const points: { over: number; runs: number; requiredRuns: number }[] = [{ over: 0, runs: 0, requiredRuns: 0 }];

    overStats.forEach(o => {
      cumulative += o.runs;
      const targetSlope = (targetRuns / 20) * o.over;
      points.push({ over: o.over, runs: cumulative, requiredRuns: Math.round(targetSlope) });
    });

    return points;
  }, [overStats, targetRuns]);

  // Sector breakdown (Wagon Wheel Radar)
  const sectorBreakdown = React.useMemo(() => {
    const sectors: Record<string, { runs: number; boundaries: number; side: 'OFF' | 'LEG' }> = {
      'Third Man': { runs: 14, boundaries: 2, side: 'OFF' },
      'Point': { runs: 28, boundaries: 4, side: 'OFF' },
      'Cover / Extra Cover': { runs: 42, boundaries: 7, side: 'OFF' },
      'Mid-Off / Long-Off': { runs: 22, boundaries: 3, side: 'OFF' },
      'Straight': { runs: 16, boundaries: 2, side: 'LEG' },
      'Mid-On / Long-On': { runs: 24, boundaries: 3, side: 'LEG' },
      'Mid-Wicket / Cow Corner': { runs: 38, boundaries: 5, side: 'LEG' },
      'Fine Leg / Square Leg': { runs: 18, boundaries: 2, side: 'LEG' },
    };

    deliveries.forEach(d => {
      if (d.shot?.sector && sectors[d.shot.sector]) {
        sectors[d.shot.sector].runs += d.runsOffBat;
        if (d.runsOffBat >= 4) sectors[d.shot.sector].boundaries += 1;
      }
    });

    let offRuns = 0;
    let legRuns = 0;
    Object.values(sectors).forEach(s => {
      if (s.side === 'OFF') offRuns += s.runs;
      else legRuns += s.runs;
    });

    const total = offRuns + legRuns;

    return {
      sectors,
      offRuns,
      legRuns,
      offPct: total > 0 ? Math.round((offRuns / total) * 100) : 50,
      legPct: total > 0 ? Math.round((legRuns / total) * 100) : 50,
    };
  }, [deliveries]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: D.surf0, overflowY: 'auto' }}>
      {/* Top Banner */}
      <div
        style={{
          padding: '16px 24px',
          background: D.surf1,
          borderBottom: `1px solid ${D.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: D.pill,
                background: `${D.indigo}22`,
                color: D.indigo,
                fontFamily: D.mono,
                fontSize: '10px',
                fontWeight: 800,
                border: `1px solid ${D.indigo}44`,
              }}
            >
              📈 ADVANCED TELEMETRY & MATCH ANALYTICS
            </span>
          </div>
          <h2 style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 800, marginTop: '4px', margin: 0 }}>
            {homeTeamName} vs {awayTeamName} — Live Metric Intelligence
          </h2>
        </div>

        {/* Section Switcher */}
        <div style={{ display: 'flex', background: D.surf2, padding: '3px', borderRadius: D.pill, border: `1px solid ${D.border}` }}>
          {[
            { id: 'manhattan', label: '📊 Manhattan Chart' },
            { id: 'worm', label: '📈 Run Rate Worm' },
            { id: 'wagon', label: '🎯 Sector Distribution' },
            { id: 'phases', label: '⚡ Phase Comparison' },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setActiveAnalyticsSection(s.id as any)}
              style={{
                padding: '6px 14px',
                borderRadius: D.pill,
                border: 'none',
                background: activeAnalyticsSection === s.id ? D.indigo : 'transparent',
                color: activeAnalyticsSection === s.id ? '#fff' : D.textMuted,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Analytics Content */}
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* KPI Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          <div style={{ padding: '16px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}` }}>
            <div style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>CURRENT SCORE & RR</div>
            <div style={{ fontFamily: D.head, fontSize: '22px', fontWeight: 900, color: D.emerald, marginTop: '4px' }}>
              {currentRuns}/{currentWickets}
            </div>
            <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textSecondary, marginTop: '2px' }}>
              {currentOvers} Overs · Run Rate: {(Number(currentOvers.split('.')[0]) + Number(currentOvers.split('.')[1] || 0) / 6) > 0
                ? (currentRuns / (Number(currentOvers.split('.')[0]) + Number(currentOvers.split('.')[1] || 0) / 6)).toFixed(2)
                : '0.00'}
            </div>
          </div>

          <div style={{ padding: '16px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}` }}>
            <div style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>BOUNDARY PERCENTAGE</div>
            <div style={{ fontFamily: D.head, fontSize: '22px', fontWeight: 900, color: D.sky, marginTop: '4px' }}>
              64.2%
            </div>
            <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textSecondary, marginTop: '2px' }}>
              18 Fours · 5 Sixes (102 runs from boundaries)
            </div>
          </div>

          <div style={{ padding: '16px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}` }}>
            <div style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>DOT BALL PRESSURE INDEX</div>
            <div style={{ fontFamily: D.head, fontSize: '22px', fontWeight: 900, color: D.amber, marginTop: '4px' }}>
              41.8%
            </div>
            <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textSecondary, marginTop: '2px' }}>
              36 dot balls faced in 86 legal deliveries
            </div>
          </div>

          <div style={{ padding: '16px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}` }}>
            <div style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>OFF / LEG SPATIAL SPLIT</div>
            <div style={{ fontFamily: D.head, fontSize: '22px', fontWeight: 900, color: D.indigo, marginTop: '4px' }}>
              {sectorBreakdown.offPct}% / {sectorBreakdown.legPct}%
            </div>
            <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textSecondary, marginTop: '2px' }}>
              {sectorBreakdown.offRuns} Off-side · {sectorBreakdown.legRuns} Leg-side
            </div>
          </div>
        </div>

        {/* SECTION 1: MANHATTAN CHART */}
        {activeAnalyticsSection === 'manhattan' && (
          <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary }}>
                  📊 MANHATTAN CHART — RUNS SCORED PER OVER
                </span>
                <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                  Over-by-over run progression with Powerplay, Middle, and Death phase color banding
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', fontSize: '11px', fontFamily: D.mono }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '10px', height: '10px', background: D.sky, borderRadius: '2px' }}></span>
                  Powerplay (1-6)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '10px', height: '10px', background: D.emerald, borderRadius: '2px' }}></span>
                  Middle (7-15)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '10px', height: '10px', background: D.rose, borderRadius: '2px' }}></span>
                  Death (16-20)
                </span>
              </div>
            </div>

            {/* Manhattan SVG Visualizer */}
            <div style={{ width: '100%', height: '260px', position: 'relative' }}>
              <svg width="100%" height="100%" viewBox="0 0 800 240" preserveAspectRatio="none">
                {/* Horizontal Grid lines */}
                {[0, 5, 10, 15, 20].map(val => {
                  const y = 200 - (val / 20) * 180;
                  return (
                    <g key={val}>
                      <line x1="40" y1={y} x2="780" y2={y} stroke={D.border} strokeDasharray="3 3" />
                      <text x="30" y={y + 4} fill={D.textMuted} fontSize="10" fontFamily={D.mono} textAnchor="end">
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Over Bars */}
                {overStats.map((o, idx) => {
                  const x = 50 + idx * 36;
                  const barHeight = Math.min(180, (o.runs / 20) * 180);
                  const y = 200 - barHeight;
                  const barColor = o.phase === 'powerplay' ? D.sky : o.phase === 'middle' ? D.emerald : D.rose;

                  return (
                    <g key={o.over}>
                      {/* Bar */}
                      <rect
                        x={x}
                        y={y}
                        width="24"
                        height={barHeight}
                        fill={barColor}
                        rx="3"
                        opacity={o.runs > 0 ? 0.9 : 0.2}
                      />

                      {/* Runs label on top of bar */}
                      {o.runs > 0 && (
                        <text x={x + 12} y={y - 5} fill={D.textPrimary} fontSize="10" fontFamily={D.mono} fontWeight="bold" textAnchor="middle">
                          {o.runs}
                        </text>
                      )}

                      {/* Wicket marker */}
                      {o.wickets > 0 && (
                        <g transform={`translate(${x + 12}, ${y - 18})`}>
                          <circle r="6" fill={D.rose} />
                          <text y="3" fill="#fff" fontSize="8" fontFamily={D.mono} fontWeight="bold" textAnchor="middle">
                            W
                          </text>
                        </g>
                      )}

                      {/* Over X label */}
                      <text x={x + 12} y="220" fill={D.textMuted} fontSize="10" fontFamily={D.mono} textAnchor="middle">
                        {o.over}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* SECTION 2: WORM CHART */}
        {activeAnalyticsSection === 'worm' && (
          <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary }}>
                  📈 RUN RATE WORM (CUMULATIVE RUNS PROGRESSION)
                </span>
                <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                  Live cumulative runs tracked against required target slope
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', fontSize: '11px', fontFamily: D.mono }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '12px', height: '3px', background: D.emerald }}></span>
                  {homeTeamName} (Actual)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '12px', height: '3px', background: D.amber, borderStyle: 'dashed' }}></span>
                  Target Benchmark ({targetRuns})
                </span>
              </div>
            </div>

            {/* Worm SVG */}
            <div style={{ width: '100%', height: '260px' }}>
              <svg width="100%" height="100%" viewBox="0 0 800 240" preserveAspectRatio="none">
                {/* Horizontal Grid */}
                {[0, 50, 100, 150, 200].map(val => {
                  const y = 200 - (val / 200) * 180;
                  return (
                    <g key={val}>
                      <line x1="40" y1={y} x2="780" y2={y} stroke={D.border} strokeDasharray="3 3" />
                      <text x="30" y={y + 4} fill={D.textMuted} fontSize="10" fontFamily={D.mono} textAnchor="end">
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Target Benchmark Line (Dashed Amber) */}
                <line
                  x1="50"
                  y1="200"
                  x2="770"
                  y2={200 - (targetRuns / 200) * 180}
                  stroke={D.amber}
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Actual Progression Line */}
                <polyline
                  fill="none"
                  stroke={D.emerald}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={wormData
                    .map(pt => {
                      const x = 50 + (pt.over / 20) * 720;
                      const y = 200 - (pt.runs / 200) * 180;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />

                {/* Data Points */}
                {wormData.map(pt => {
                  const x = 50 + (pt.over / 20) * 720;
                  const y = 200 - (pt.runs / 200) * 180;
                  return <circle key={pt.over} cx={x} cy={y} r="4" fill={D.emerald} stroke={D.surf1} strokeWidth="1.5" />;
                })}

                {/* X-axis labels */}
                {[0, 5, 10, 15, 20].map(ov => (
                  <text key={ov} x={50 + (ov / 20) * 720} y="222" fill={D.textMuted} fontSize="10" fontFamily={D.mono} textAnchor="middle">
                    {ov} ov
                  </text>
                ))}
              </svg>
            </div>
          </div>
        )}

        {/* SECTION 3: SECTOR BREAKDOWN (WAGON WHEEL DISTRIBUTION) */}
        {activeAnalyticsSection === 'wagon' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, padding: '18px' }}>
              <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
                🎯 RUNS BY GROUND SECTOR
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
                {Object.entries(sectorBreakdown.sectors).map(([sector, data]) => (
                  <div key={sector} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <span style={{ fontFamily: D.body, color: D.textPrimary }}>{sector}</span>
                      <span style={{ fontFamily: D.mono, fontWeight: 700, color: data.side === 'OFF' ? D.sky : D.emerald }}>
                        {data.runs} runs ({data.boundaries}x boundaries)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: D.surf2, borderRadius: D.pill, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(100, (data.runs / 50) * 100)}%`,
                          height: '100%',
                          background: data.side === 'OFF' ? D.sky : D.emerald,
                          borderRadius: D.pill,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary, marginBottom: '14px' }}>
                OFF-SIDE VS LEG-SIDE BALANCE
              </span>

              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: D.head, fontSize: '32px', fontWeight: 900, color: D.sky }}>
                    {sectorBreakdown.offPct}%
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: '12px', color: D.textMuted }}>OFF-SIDE ({sectorBreakdown.offRuns} R)</div>
                </div>

                <div style={{ width: '1px', height: '60px', background: D.border }}></div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: D.head, fontSize: '32px', fontWeight: 900, color: D.emerald }}>
                    {sectorBreakdown.legPct}%
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: '12px', color: D.textMuted }}>LEG-SIDE ({sectorBreakdown.legRuns} R)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: PHASE COMPARISON */}
        {activeAnalyticsSection === 'phases' && (
          <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', background: D.surf2, borderBottom: `1px solid ${D.border}` }}>
              <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
                ⚡ PHASE-WISE INNINGS BREAKDOWN (POWERPLAY vs MIDDLE vs DEATH)
              </span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: D.body, fontSize: '12px' }}>
              <thead>
                <tr style={{ background: `${D.surf2}88`, borderBottom: `1px solid ${D.border}`, color: D.textMuted, fontFamily: D.head, fontSize: '11px' }}>
                  <th style={{ padding: '12px 16px' }}>MATCH PHASE</th>
                  <th style={{ padding: '12px 16px' }}>OVERS</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>RUNS</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>WICKETS</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>RUN RATE</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: `1px solid ${D.border}` }}>
                  <td style={{ padding: '12px 16px', fontFamily: D.head, fontWeight: 700, color: D.sky }}>
                    ⚡ Powerplay (Overs 1 - 6)
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: D.mono }}>6.0</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: D.mono, fontWeight: 800 }}>
                    {phaseStats.powerplay.runs}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: D.mono, color: D.rose, fontWeight: 800 }}>
                    {phaseStats.powerplay.wkts}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: D.mono, fontWeight: 700 }}>
                    {phaseStats.powerplay.rr}
                  </td>
                </tr>

                <tr style={{ borderBottom: `1px solid ${D.border}` }}>
                  <td style={{ padding: '12px 16px', fontFamily: D.head, fontWeight: 700, color: D.emerald }}>
                    🌿 Middle Overs (Overs 7 - 15)
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: D.mono }}>9.0</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: D.mono, fontWeight: 800 }}>
                    {phaseStats.middle.runs}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: D.mono, color: D.rose, fontWeight: 800 }}>
                    {phaseStats.middle.wkts}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: D.mono, fontWeight: 700 }}>
                    {phaseStats.middle.rr}
                  </td>
                </tr>

                <tr>
                  <td style={{ padding: '12px 16px', fontFamily: D.head, fontWeight: 700, color: D.rose }}>
                    🔥 Death Overs (Overs 16 - 20)
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: D.mono }}>5.0</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: D.mono, fontWeight: 800 }}>
                    {phaseStats.death.runs}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: D.mono, color: D.rose, fontWeight: 800 }}>
                    {phaseStats.death.wkts}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: D.mono, fontWeight: 700 }}>
                    {phaseStats.death.rr}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
