'use client';

import React, { useState } from 'react';
import { Theme, Drill, Player } from './types';
import { PLAYERS } from './data';

interface TrainingViewProps {
  theme: Theme;
  players?: Player[];
}

const DRILL_LIBRARY: Drill[] = [
  {
    id: "dr1",
    name: "Front-Foot Drive Corridor Target",
    category: "batting",
    durationMins: 25,
    intensity: "medium",
    equipment: ["Sidearm ball thrower", "Cones", "6 Kookaburra balls"],
    description: "Batters hit full-length deliveries between two cones placed at extra cover and mid-off. Focus on leading with the head and elbow.",
    keyCoachingPoints: ["High front elbow aligned towards target", "Head positioned directly over ball at impact", "Weight transferred smoothly onto front knee"],
  },
  {
    id: "dr2",
    name: "Short-Ball Pull & Hook Mastery",
    category: "batting",
    durationMins: 20,
    intensity: "high",
    equipment: ["Bowling machine (125 km/h)", "Incrediballs / Leather", "Cones"],
    description: "Rapid delivery of chest-high bouncers. Batters practice rolling wrists on the pull to keep the ball grounded forward of square.",
    keyCoachingPoints: ["Quick back-and-across movement", "Eyes locked on ball; avoid turning head away", "Roll wrists over the ball at point of contact"],
  },
  {
    id: "dr3",
    name: "Death-Overs Yorker Target Challenge",
    category: "bowling",
    durationMins: 30,
    intensity: "high",
    equipment: ["Shoe boxes or cones at popping crease", "Speed radar"],
    description: "Bowlers attempt 18 deliveries aiming directly at a shoe box placed on the batting crease. Points awarded for clean hits.",
    keyCoachingPoints: ["Drive front knee hard through crease", "Lock wrist tightly at 12 o'clock release", "Do not shorten stride length on final bound"],
  },
  {
    id: "dr4",
    name: "Slip Cordon Reflex React & Catch",
    category: "fielding",
    durationMins: 20,
    intensity: "high",
    equipment: ["Katchet deflection ramp", "Soft reflex balls", "Catching mitts"],
    description: "Ramp-deflected balls simulating thick edges into 1st, 2nd, and 3rd slip. Players take rapid-fire reaction catches in low posture.",
    keyCoachingPoints: ["Soft hands giving with the ball", "Weight on balls of feet; hips down", "Watch ball into the cupped palms"],
  },
  {
    id: "dr5",
    name: "Run-Out Direct Hit Pressure Shuttle",
    category: "fielding",
    durationMins: 25,
    intensity: "high",
    equipment: ["Single stump target", "Stopwatch", "12 Cricket balls"],
    description: "Fielder sprints 20m from cover, picks up ball with one hand, and throws at one stump with 2-second time penalty.",
    keyCoachingPoints: ["Stay low when swooping on the ball", "Pick up cleanly outside the right foot", "Turn sideways and release in one fluid motion"],
  },
  {
    id: "dr6",
    name: "Fast-Bowler Repeat Sprint Interval (RSI)",
    category: "fitness",
    durationMins: 35,
    intensity: "high",
    equipment: ["Heart rate monitors", "Cones", "Agility ladders"],
    description: "6 sets of 30m maximum intensity sprints simulating run-up deceleration and repeat spells. 45 seconds rest between repetitions.",
    keyCoachingPoints: ["Explosive first 3 strides", "Maintain upright running posture", "Controlled deceleration over 10m"],
  },
];

export default function TrainingView({ theme: D, players = PLAYERS }: TrainingViewProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedDrill, setSelectedDrill] = useState<Drill>(DRILL_LIBRARY[0]);
  const safePlayers = players && players.length > 0 ? players : PLAYERS;
  const [attendance, setAttendance] = useState<Record<string, "present" | "rehab" | "absent">>({
    p1: "present",
    p2: "present",
    p3: "present",
    p4: "present",
    p5: "rehab",
    p6: "present",
    p7: "present",
    p8: "rehab",
    p9: "present",
    p10: "present",
  });

  const filteredDrills = categoryFilter === "all"
    ? DRILL_LIBRARY
    : DRILL_LIBRARY.filter(d => d.category === categoryFilter);

  const toggleStatus = (id: string) => {
    setAttendance(prev => {
      const cur = prev[id] || "present";
      const next = cur === "present" ? "rehab" : cur === "rehab" ? "absent" : "present";
      return { ...prev, [id]: next };
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>💪</span>
            <h2 style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 800, color: D.textPrimary }}>
              Squad Training & High Performance Drill Library
            </h2>
          </div>
          <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted, marginTop: '2px' }}>
            Structured technical coaching drills, high-intensity intervals, and squad attendance roll
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {['all', 'batting', 'bowling', 'fielding', 'fitness'].map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: D.pill,
              border: `1px solid ${categoryFilter === cat ? D.indigo : D.border}`,
              background: categoryFilter === cat ? D.indigo : D.surf1,
              color: categoryFilter === cat ? '#fff' : D.textSecondary,
              fontFamily: D.head,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {cat === 'all' ? 'All Drills' : cat}
          </button>
        ))}
      </div>

      {/* Main Grid: Drill Cards & Active Planner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(300px, 1fr)', gap: '16px' }}>
        {/* Left Column: Drills Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
            DRILL REPOSITORY ({filteredDrills.length})
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
            {filteredDrills.map(drill => {
              const isSelected = selectedDrill.id === drill.id;
              const catColor = drill.category === 'batting' ? D.sky : drill.category === 'bowling' ? D.violet : drill.category === 'fielding' ? D.emerald : D.rose;
              return (
                <div
                  key={drill.id}
                  onClick={() => setSelectedDrill(drill)}
                  style={{
                    padding: '14px',
                    borderRadius: D.lg,
                    background: isSelected ? `${D.indigo}18` : D.surf1,
                    border: `1px solid ${isSelected ? D.indigo : D.border}`,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: D.head, fontSize: '9px', fontWeight: 800, color: catColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {drill.category}
                    </span>
                    <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                      ⏱ {drill.durationMins} mins
                    </span>
                  </div>

                  <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: D.textPrimary }}>
                    {drill.name}
                  </div>

                  <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary, lineHeight: 1.4 }}>
                    {drill.description}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ padding: '2px 6px', borderRadius: D.sm, background: D.surf2, fontFamily: D.mono, fontSize: '9px', color: D.textMuted }}>
                      Intensity: <strong style={{ color: drill.intensity === 'high' ? D.rose : D.amber }}>{drill.intensity}</strong>
                    </span>
                    <span style={{ fontFamily: D.head, fontSize: '10px', color: D.sky, fontWeight: 700 }}>
                      Inspect Points →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Drill Deep Dive Inspector */}
          {selectedDrill && (
            <div style={{ padding: '18px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary }}>
                  COACHING FOCUS: {selectedDrill.name}
                </span>
                <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.sky, fontWeight: 700 }}>
                  {selectedDrill.durationMins} MINS · {selectedDrill.intensity.toUpperCase()} INTENSITY
                </span>
              </div>

              <div>
                <div style={{ fontFamily: D.head, fontSize: '10px', color: D.textMuted, marginBottom: '4px' }}>REQUIRED EQUIPMENT:</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {(selectedDrill?.equipment || []).map((eq, i) => (
                    <span key={i} style={{ padding: '3px 8px', borderRadius: D.pill, background: D.surf2, fontFamily: D.body, fontSize: '11px', color: D.textPrimary }}>
                      • {eq}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontFamily: D.head, fontSize: '10px', color: D.textMuted, marginBottom: '4px' }}>CRITICAL COACHING CUES:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {(selectedDrill?.keyCoachingPoints || []).map((pt, i) => (
                    <div key={i} style={{ display: 'flex', gap: '6px', fontFamily: D.body, fontSize: '12px', color: D.textPrimary, lineHeight: 1.4 }}>
                      <span style={{ color: D.emerald, fontWeight: 800 }}>✓</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Squad Attendance Roster */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
            SESSION ATTENDANCE ROLL (WESTVILLE U19A)
          </div>

          <div style={{ padding: '16px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted }}>
                Lead Coach: <strong>Craig Hendricks</strong>
              </div>
              <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.emerald }}>
                {Object.values(attendance).filter(v => v === "present").length} Present
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {safePlayers.map(p => {
                const status = attendance[p.id] || "present";
                const col = status === "present" ? D.emerald : status === "rehab" ? D.amber : D.rose;
                return (
                  <div
                    key={p.id}
                    onClick={() => toggleStatus(p.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 10px',
                      borderRadius: D.md,
                      background: D.surf2,
                      border: `1px solid ${col}33`,
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: D.body, fontSize: '12px', fontWeight: 600, color: D.textPrimary }}>
                        {p.name} {p.cap === 'c' && <span style={{ color: D.amber }}>©</span>}
                      </div>
                      <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                        {p.team} · {p.role}
                      </div>
                    </div>

                    <button
                      style={{
                        padding: '3px 10px',
                        borderRadius: D.pill,
                        background: col + '22',
                        border: `1px solid ${col}`,
                        color: col,
                        fontFamily: D.mono,
                        fontSize: '10px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {status.toUpperCase()}
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted, fontStyle: 'italic', textAlign: 'center', marginTop: '4px' }}>
              💡 Click status badge to cycle: Present ➔ Rehab ➔ Absent
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
