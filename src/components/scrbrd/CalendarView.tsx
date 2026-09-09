'use client';

import React, { useState } from 'react';
import { Theme } from './types';
import MatchDetailsModal, { FixtureDetail } from './MatchDetailsModal';

interface CalendarViewProps {
  theme: Theme;
  onOpenScorer?: () => void;
}

interface FixtureEvent extends FixtureDetail {}

const FIXTURES: FixtureEvent[] = [
  { id: "f1", date: "2026-03-08", time: "09:30", homeTeam: "Westville U19A", awayTeam: "Kearsney College", venue: "Bowden's Field", division: "U19A", competition: "T20 League", status: "live", weather: "☀️ 26°C Clear", scorer: "Brian Wessels" },
  { id: "f2", date: "2026-03-09", time: "14:30", homeTeam: "Westville U19A", awayTeam: "Practice Scrimmage", venue: "Nets 1-3", division: "U19A", competition: "Scrimmage", status: "upcoming", weather: "⛅ 23°C Mild", scorer: "Craig Hendricks" },
  { id: "f3", date: "2026-03-11", time: "10:00", homeTeam: "Westville U13A", awayTeam: "Michaelhouse Prep", venue: "Roy Couzens Oval", division: "U13A", competition: "50-Over Cup", status: "upcoming", weather: "☀️ 25°C Crisp", bus: "Self-travel", scorer: "Stacey Miller" },
  { id: "f4", date: "2026-03-14", time: "09:00", homeTeam: "Durban High School", awayTeam: "Westville U19A", venue: "The Memorial Ground, Durban", division: "U19A", competition: "Traditional Derby", status: "upcoming", weather: "☀️ 28°C Warm", bus: "Iveco Coach (Depart 06:30)", scorer: "Themba Nxumalo (Driver)" },
  { id: "f5", date: "2026-03-15", time: "09:30", homeTeam: "Westville U15A", awayTeam: "Maritzburg College", venue: "Commons Field", division: "U15A", competition: "T20 League", status: "upcoming", weather: "🌥️ 21°C Overcast", scorer: "S. Khumalo" },
  { id: "f6", date: "2026-03-21", time: "09:00", homeTeam: "Michaelhouse 1st XI", awayTeam: "Westville U19A", venue: "Meadow's Oval, Balgowan", division: "U19A", competition: "Traditional Derby", status: "upcoming", weather: "⛅ 20°C Mild", bus: "Iveco Coach (Depart 05:45)", scorer: "Brian Wessels" },
  { id: "f7", date: "2026-03-28", time: "09:30", homeTeam: "Westville U19A", awayTeam: "Hilton College", venue: "Bowden's Field", division: "U19A", competition: "Traditional Derby", status: "upcoming", weather: "☀️ 24°C Clear", scorer: "Brian Wessels" },
];

export default function CalendarView({ theme: D, onOpenScorer }: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<"agenda" | "month">("agenda");
  const [compFilter, setCompFilter] = useState<string>("all");
  const [divFilter, setDivFilter] = useState<string>("all");
  const [selectedFixture, setSelectedFixture] = useState<FixtureEvent | null>(null);

  const filteredFixtures = FIXTURES.filter(f => {
    if (compFilter !== "all" && f.competition !== compFilter) return false;
    if (divFilter !== "all" && f.division !== divFilter) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>📅</span>
            <h2 style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 800, color: D.textPrimary }}>
              Strategic Cricket Fixtures Calendar & Agenda
            </h2>
          </div>
          <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted, marginTop: '2px' }}>
            Season 2026 master schedule across T20 League, 50-Over Cup, and traditional Saturday derbies
          </div>
        </div>

        {/* View mode toggle */}
        <div style={{ display: 'flex', gap: '6px', background: D.surf2, padding: '4px', borderRadius: D.pill, border: `1px solid ${D.border}` }}>
          <button
            onClick={() => setViewMode('agenda')}
            style={{
              padding: '6px 14px',
              borderRadius: D.pill,
              border: 'none',
              background: viewMode === 'agenda' ? D.indigo : 'transparent',
              color: viewMode === 'agenda' ? '#fff' : D.textSecondary,
              fontFamily: D.head,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Chronological Agenda
          </button>
          <button
            onClick={() => setViewMode('month')}
            style={{
              padding: '6px 14px',
              borderRadius: D.pill,
              border: 'none',
              background: viewMode === 'month' ? D.indigo : 'transparent',
              color: viewMode === 'month' ? '#fff' : D.textSecondary,
              fontFamily: D.head,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Monthly Grid
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>COMPETITION:</span>
          <select
            value={compFilter}
            onChange={e => setCompFilter(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: '11px' }}
          >
            <option value="all">All Competitions</option>
            <option value="T20 League">T20 League</option>
            <option value="50-Over Cup">50-Over Cup</option>
            <option value="Traditional Derby">Traditional Derby</option>
            <option value="Scrimmage">Training Scrimmage</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>SQUAD:</span>
          <select
            value={divFilter}
            onChange={e => setDivFilter(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: '11px' }}
          >
            <option value="all">All Squads</option>
            <option value="U19A">U19A (1st XI)</option>
            <option value="U15A">U15A</option>
            <option value="U13A">U13A</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto', fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
          Showing {filteredFixtures.length} Fixtures
        </div>
      </div>

      {/* Agenda Mode View */}
      {viewMode === 'agenda' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredFixtures.map(f => {
            const isLive = f.status === 'live';
            const compColor = f.competition === 'T20 League' ? D.emerald : f.competition === 'Traditional Derby' ? D.amber : f.competition === '50-Over Cup' ? D.sky : D.violet;
            return (
              <div
                key={f.id}
                style={{
                  padding: '18px',
                  borderRadius: D.lg,
                  background: isLive ? `${D.emerald}10` : D.surf1,
                  border: `1px solid ${isLive ? D.emerald + '55' : D.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}
              >
                {/* Left Date & Time Block */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '160px' }}>
                  <div style={{ padding: '10px 14px', background: D.surf2, borderRadius: D.md, textAlign: 'center' }}>
                    <div style={{ fontFamily: D.mono, fontSize: '18px', fontWeight: 800, color: D.textPrimary }}>
                      {f.date.split("-")[2]}
                    </div>
                    <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted, textTransform: 'uppercase' }}>
                      MAR 2026
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: D.mono, fontSize: '13px', fontWeight: 700, color: D.textPrimary }}>
                      {f.time}
                    </div>
                    <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                      {f.weather}
                    </div>
                  </div>
                </div>

                {/* Center Fixture Info */}
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: D.pill, background: compColor + '22', color: compColor, fontFamily: D.head, fontSize: '9px', fontWeight: 800 }}>
                      {f.competition}
                    </span>
                    <span style={{ padding: '2px 8px', borderRadius: D.pill, background: D.surf2, color: D.textSecondary, fontFamily: D.mono, fontSize: '9px', fontWeight: 700 }}>
                      {f.division}
                    </span>
                    {isLive && (
                      <span style={{ padding: '2px 8px', borderRadius: D.pill, background: D.emerald, color: '#fff', fontFamily: D.head, fontSize: '9px', fontWeight: 800 }}>
                        ● LIVE NOW
                      </span>
                    )}
                  </div>

                  <div style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.textPrimary }}>
                    {f.homeTeam} <span style={{ color: D.textMuted, fontWeight: 400 }}>vs</span> {f.awayTeam}
                  </div>

                  <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted, marginTop: '2px' }}>
                    📍 {f.venue} · Scorer: {f.scorer}
                  </div>
                </div>

                {/* Right Transport & Action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {f.bus && (
                    <div style={{ padding: '6px 10px', borderRadius: D.md, background: D.surf2, fontFamily: D.mono, fontSize: '10px', color: D.amber }}>
                      🚌 {f.bus}
                    </div>
                  )}

                  {isLive ? (
                    <button
                      onClick={onOpenScorer}
                      style={{
                        padding: '8px 18px',
                        borderRadius: D.pill,
                        background: D.gradLive,
                        border: 'none',
                        color: '#fff',
                        fontFamily: D.head,
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: `0 4px 14px ${D.emerald}33`,
                      }}
                    >
                      Open Live Scorer ↗
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedFixture(f)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: D.pill,
                        background: D.surf2,
                        border: `1px solid ${D.border}`,
                        color: D.textPrimary,
                        fontFamily: D.head,
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Match Details →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Monthly Grid View */}
      {viewMode === 'month' && (
        <div style={{ padding: '20px', borderRadius: D.xl, background: D.surf1, border: `1px solid ${D.border}` }}>
          <div style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, marginBottom: '14px', textAlign: 'center' }}>
            MARCH 2026 · CRICKET FIXTURES MATRIX
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
              <div key={day} style={{ textAlign: 'center', fontFamily: D.head, fontSize: '10px', color: D.textMuted, paddingBottom: '6px' }}>
                {day}
              </div>
            ))}
            {/* Days 1 to 31 */}
            {Array.from({ length: 31 }).map((_, i) => {
              const dayNum = i + 1;
              const dateKey = `2026-03-${dayNum < 10 ? '0' + dayNum : dayNum}`;
              const dayEvents = FIXTURES.filter(f => f.date === dateKey);
              const isToday = dayNum === 8;

              return (
                <div
                  key={dayNum}
                  style={{
                    minHeight: '80px',
                    padding: '8px',
                    borderRadius: D.md,
                    background: isToday ? `${D.indigo}15` : D.surf2,
                    border: `1px solid ${D.indigo + '55'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: D.mono, fontSize: '11px', fontWeight: isToday ? 800 : 500, color: isToday ? D.indigo : D.textMuted }}>
                      {dayNum}
                    </span>
                    {isToday && <span style={{ fontFamily: D.head, fontSize: '8px', color: D.emerald, fontWeight: 800 }}>TODAY</span>}
                  </div>

                  {dayEvents.map(ev => (
                    <div
                      key={ev.id}
                      onClick={() => ev.status === 'live' ? onOpenScorer?.() : setSelectedFixture(ev)}
                      style={{
                        padding: '3px 5px',
                        borderRadius: '3px',
                        background: ev.status === 'live' ? D.emerald : D.surf3,
                        color: ev.status === 'live' ? '#fff' : D.textPrimary,
                        fontFamily: D.body,
                        fontSize: '9px',
                        fontWeight: 700,
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        cursor: 'pointer',
                      }}
                      title={`${ev.homeTeam} vs ${ev.awayTeam} (${ev.venue}) - Click for details`}
                    >
                      {ev.homeTeam.split(" ")[0]} vs {ev.awayTeam.split(" ")[0]}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Match Details Modal */}
      {selectedFixture && (
        <MatchDetailsModal
          theme={D}
          fixture={selectedFixture}
          onClose={() => setSelectedFixture(null)}
          onOpenScorer={onOpenScorer}
        />
      )}
    </div>
  );
}
