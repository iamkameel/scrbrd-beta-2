'use client';

import React, { useState, useMemo } from 'react';
import { Theme } from './types';
import { Search, Filter, Download, BarChart3, TrendingUp, Award, Layers, Globe } from 'lucide-react';

interface StatsGuruQueryEngineViewProps {
  theme?: Theme;
  players?: any[];
}

const DEFAULT_THEME: Theme = {
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

export default function StatsGuruQueryEngineView({
  theme: userTheme,
  players = [],
}: StatsGuruQueryEngineViewProps) {
  const D = userTheme || DEFAULT_THEME;

  // Query Filter States
  const [format, setFormat] = useState<string>('all');
  const [opposition, setOpposition] = useState<string>('all');
  const [venue, setVenue] = useState<string>('all');
  const [season, setSeason] = useState<string>('2026');
  const [category, setCategory] = useState<'batting' | 'bowling' | 'allround'>('batting');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Simulated comprehensive StatsGuru dataset based on players
  const guruData = useMemo(() => {
    return [
      { id: '1', name: 'T. Ndlovu', format: 'T20', opposition: 'Kearsney', venue: 'Home', matches: 14, runs: 584, avg: 58.4, sr: 154.2, hs: '112*', fifties: 4, hundreds: 2, wk: 2, eco: 6.8 },
      { id: '2', name: 'M. Khumalo', format: 'T20', opposition: 'Hilton', venue: 'Away', matches: 12, runs: 390, avg: 39.0, sr: 142.1, hs: '85', fifties: 3, hundreds: 0, wk: 18, eco: 5.4 },
      { id: '3', name: 'K. Govender', format: 'ODI', opposition: 'Michaelhouse', venue: 'Neutral', matches: 15, runs: 240, avg: 24.0, sr: 92.5, hs: '64', fifties: 1, hundreds: 0, wk: 26, eco: 4.2 },
      { id: '4', name: 'D. Smith', format: 'T20', opposition: 'Clifton', venue: 'Home', matches: 13, runs: 450, avg: 45.0, sr: 138.8, hs: '92*', fifties: 4, hundreds: 0, wk: 4, eco: 7.1 },
      { id: '5', name: 'S. Naidoo', format: 'T20', opposition: 'Kearsney', venue: 'Away', matches: 10, runs: 310, avg: 31.0, sr: 128.4, hs: '74', fifties: 2, hundreds: 0, wk: 14, eco: 6.2 },
    ];
  }, []);

  const filteredData = useMemo(() => {
    return guruData.filter(item => {
      if (format !== 'all' && item.format !== format) return false;
      if (opposition !== 'all' && item.opposition !== opposition) return false;
      if (venue !== 'all' && item.venue !== venue) return false;
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [guruData, format, opposition, venue, searchQuery]);

  return (
    <div style={{
      padding: '24px',
      maxWidth: '1320px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      color: D.textPrimary,
      fontFamily: D.body,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>📊</span>
            <h1 style={{ fontFamily: D.head, fontSize: '22px', fontWeight: 800, margin: 0 }}>
              StatsGuru Advanced Query Engine
            </h1>
          </div>
          <p style={{ fontFamily: D.body, fontSize: '13px', color: D.textMuted, margin: '4px 0 0 0' }}>
            Granular multi-dimensional statistical query builder inspired by professional Cricket Statsguru platforms
          </p>
        </div>

        <button
          onClick={() => alert('Exporting StatsGuru filtered CSV report...')}
          style={{
            padding: '8px 14px',
            borderRadius: D.md,
            background: D.surf2,
            border: `1px solid ${D.border}`,
            color: D.textPrimary,
            fontFamily: D.head,
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Download size={15} />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Query Filter Toolbar */}
      <div style={{
        padding: '16px',
        borderRadius: D.lg,
        background: D.cardBg,
        border: `1px solid ${D.border}`,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        alignItems: 'center',
      }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={16} color={D.textMuted} style={{ position: 'absolute', left: '10px', top: '50% - 8px', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search player..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px 8px 32px',
              borderRadius: D.sm,
              background: D.surf2,
              border: `1px solid ${D.border}`,
              color: D.textPrimary,
              fontFamily: D.body,
              fontSize: '12px',
            }}
          />
        </div>

        {/* Format Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>FORMAT</span>
          <select
            value={format}
            onChange={e => setFormat(e.target.value)}
            style={{ padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px', fontFamily: D.head }}
          >
            <option value="all">All Formats</option>
            <option value="T20">T20 Schools</option>
            <option value="ODI">50-Over ODI</option>
          </select>
        </div>

        {/* Opposition Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>OPPOSITION</span>
          <select
            value={opposition}
            onChange={e => setOpposition(e.target.value)}
            style={{ padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px', fontFamily: D.head }}
          >
            <option value="all">All Oppositions</option>
            <option value="Kearsney">Kearsney College</option>
            <option value="Hilton">Hilton College</option>
            <option value="Michaelhouse">Michaelhouse</option>
            <option value="Clifton">Clifton College</option>
          </select>
        </div>

        {/* Venue Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>VENUE</span>
          <select
            value={venue}
            onChange={e => setVenue(e.target.value)}
            style={{ padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px', fontFamily: D.head }}
          >
            <option value="all">All Venues (Home/Away)</option>
            <option value="Home">Home Ground</option>
            <option value="Away">Away</option>
            <option value="Neutral">Neutral</option>
          </select>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>DISCIPLINE</span>
          <div style={{ display: 'flex', background: D.surf2, borderRadius: D.sm, padding: '2px', border: `1px solid ${D.border}` }}>
            {(['batting', 'bowling'] as const).map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  flex: 1,
                  padding: '6px',
                  borderRadius: D.sm,
                  background: category === c ? D.indigo : 'transparent',
                  color: category === c ? '#fff' : D.textMuted,
                  border: 'none',
                  fontFamily: D.head,
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div style={{
        borderRadius: D.lg,
        background: D.cardBg,
        border: `1px solid ${D.border}`,
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '14px 18px',
          background: D.surf0,
          borderBottom: `1px solid ${D.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800 }}>
            QUERY RESULTS ({filteredData.length} records found)
          </span>
          <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.emerald }}>
            Live Query Engine Active
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: D.body, fontSize: '12px' }}>
            <thead>
              <tr style={{ background: D.surf0, borderBottom: `1px solid ${D.border}`, color: D.textMuted, fontFamily: D.mono, fontSize: '10px' }}>
                <th style={{ padding: '12px 16px' }}>PLAYER</th>
                <th style={{ padding: '12px 16px' }}>FORMAT</th>
                <th style={{ padding: '12px 16px' }}>OPPONENT</th>
                <th style={{ padding: '12px 16px' }}>VENUE</th>
                <th style={{ padding: '12px 16px' }}>MAT</th>
                {category === 'batting' ? (
                  <>
                    <th style={{ padding: '12px 16px' }}>RUNS</th>
                    <th style={{ padding: '12px 16px' }}>AVG</th>
                    <th style={{ padding: '12px 16px' }}>S/R</th>
                    <th style={{ padding: '12px 16px' }}>H/S</th>
                    <th style={{ padding: '12px 16px' }}>50/100</th>
                  </>
                ) : (
                  <>
                    <th style={{ padding: '12px 16px' }}>WICKETS</th>
                    <th style={{ padding: '12px 16px' }}>ECONOMY</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, i) => (
                <tr key={row.id} style={{ borderBottom: `1px solid ${D.border}`, background: i % 2 === 0 ? 'transparent' : `${D.surf2}33` }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, fontFamily: D.head }}>{row.name}</td>
                  <td style={{ padding: '12px 16px', fontFamily: D.mono }}>{row.format}</td>
                  <td style={{ padding: '12px 16px' }}>{row.opposition}</td>
                  <td style={{ padding: '12px 16px' }}>{row.venue}</td>
                  <td style={{ padding: '12px 16px', fontFamily: D.mono }}>{row.matches}</td>
                  {category === 'batting' ? (
                    <>
                      <td style={{ padding: '12px 16px', fontFamily: D.mono, fontWeight: 700, color: D.emerald }}>{row.runs}</td>
                      <td style={{ padding: '12px 16px', fontFamily: D.mono }}>{row.avg}</td>
                      <td style={{ padding: '12px 16px', fontFamily: D.mono }}>{row.sr}</td>
                      <td style={{ padding: '12px 16px', fontFamily: D.mono }}>{row.hs}</td>
                      <td style={{ padding: '12px 16px', fontFamily: D.mono }}>{row.fifties} / {row.hundreds}</td>
                    </>
                  ) : (
                    <>
                      <td style={{ padding: '12px 16px', fontFamily: D.mono, fontWeight: 700, color: D.sky }}>{row.wk}</td>
                      <td style={{ padding: '12px 16px', fontFamily: D.mono }}>{row.eco}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
