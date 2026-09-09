'use client';

import React, { useState } from 'react';
import { Theme, PitchCondition } from './types';

interface FieldsViewProps {
  theme: Theme;
}

const INITIAL_GROUNDS: PitchCondition[] = [
  {
    groundId: "g1",
    name: "Bowden's Field (1st XI Oval)",
    surface: "Bulli Clay & Kikuyu Grass Outfield",
    moisturePct: 17,
    grassHeightMm: 4.0,
    rollerCompaction: "2.5-ton motorized roller (12 passes)",
    bounceRating: 8.8,
    paceRating: 8.6,
    outfieldSpeed: "Fast",
    coversStatus: "standby",
    drainageTimeMin: 30,
    curatorNotes: "Strip #2 selected for KZN Derby. Firm bulli base, consistent carry to the wicket-keeper. Fast outfield cut this morning.",
    lastMaintained: "Today 06:15 by Head Curator E. Mzimba",
  },
  {
    groundId: "g2",
    name: "Commons Field (2nd XI / U15A)",
    surface: "Turf Bulli Strip, Natural Camber",
    moisturePct: 19,
    grassHeightMm: 5.5,
    rollerCompaction: "1.8-ton roller (8 passes)",
    bounceRating: 7.4,
    paceRating: 7.2,
    outfieldSpeed: "Medium",
    coversStatus: "off",
    drainageTimeMin: 45,
    curatorNotes: "Surface holding together well. Moderate spin expected after lunch session.",
    lastMaintained: "Yesterday 16:30",
  },
  {
    groundId: "g3",
    name: "Roy Couzens Junior Oval",
    surface: "Turf Strip, Kikuyu Outfield",
    moisturePct: 22,
    grassHeightMm: 6.0,
    rollerCompaction: "1.2-ton roller (6 passes)",
    bounceRating: 6.9,
    paceRating: 6.8,
    outfieldSpeed: "Medium",
    coversStatus: "off",
    drainageTimeMin: 60,
    curatorNotes: "Junior boundary markers set at 52m. Prepared for U13A fixture.",
    lastMaintained: "Yesterday 15:00",
  },
  {
    groundId: "g4",
    name: "Main Practice Nets (Nets 1-8)",
    surface: "4 Turf Wickets + 4 Synthetic Astro Strips",
    moisturePct: 16,
    grassHeightMm: 4.5,
    rollerCompaction: "Hand roller applied",
    bounceRating: 8.2,
    paceRating: 8.0,
    outfieldSpeed: "Fast",
    coversStatus: "off",
    drainageTimeMin: 20,
    curatorNotes: "Turf nets 1-2 open for 1st XI technical scrimmage at 14:30.",
    lastMaintained: "Today 08:00",
  },
];

const CURATOR_TASKS = [
  { id: "t1", task: "Mow Bowden's 30-yard ring & outfield to 4.0mm", done: true, time: "06:00" },
  { id: "t2", task: "12-pass heavy rolling on Match Strip #2", done: true, time: "07:30" },
  { id: "t3", task: "Re-paint popping creases and bowling creases with white emulsion", done: true, time: "08:45" },
  { id: "t4", task: "Inspect boundary ropes and sponsor foam wedges", done: true, time: "09:30" },
  { id: "t5", task: "Test drainage sub-pumps ahead of afternoon storm forecast", done: false, time: "13:00" },
  { id: "t6", task: "Light syringe watering of practice nets for tomorrow", done: false, time: "16:30" },
];

export default function FieldsView({ theme: D }: FieldsViewProps) {
  const [grounds, setGrounds] = useState<PitchCondition[]>(INITIAL_GROUNDS);
  const [selectedGroundId, setSelectedGroundId] = useState<string>("g1");
  const [tasks, setTasks] = useState(CURATOR_TASKS);

  const activeGround = grounds.find(g => g.groundId === selectedGroundId) || grounds[0];

  const toggleCovers = (id: string) => {
    setGrounds(prev => prev.map(g => {
      if (g.groundId !== id) return g;
      const nextStatus = g.coversStatus === "on" ? "off" : "on";
      return { ...g, coversStatus: nextStatus };
    }));
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🌿</span>
            <h2 style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 800, color: D.textPrimary }}>
              Grounds & Turfgrass Curator Management
            </h2>
          </div>
          <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted, marginTop: '2px' }}>
            Bowden's Field bulli clay moisture telemetry, compaction logs, grass cut heights, and rain cover protocols
          </div>
        </div>

        <button
          onClick={() => toggleCovers(activeGround.groundId)}
          style={{
            padding: '8px 16px',
            borderRadius: D.pill,
            background: activeGround.coversStatus === 'on' ? `${D.rose}22` : `${D.emerald}22`,
            border: `1px solid ${activeGround.coversStatus === 'on' ? D.rose : D.emerald}`,
            color: activeGround.coversStatus === 'on' ? D.rose : D.emerald,
            fontFamily: D.head,
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>{activeGround.coversStatus === 'on' ? '☔ Covers Deployed' : '☀️ Covers Off'}</span>
          <span style={{ fontFamily: D.mono, fontSize: '9px' }}>(Toggle)</span>
        </button>
      </div>

      {/* Grounds Navigation Selector */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {grounds.map(g => (
          <button
            key={g.groundId}
            onClick={() => setSelectedGroundId(g.groundId)}
            style={{
              padding: '8px 16px',
              borderRadius: D.pill,
              border: `1px solid ${selectedGroundId === g.groundId ? D.emerald : D.border}`,
              background: selectedGroundId === g.groundId ? `${D.emerald}22` : D.surf1,
              color: selectedGroundId === g.groundId ? D.emerald : D.textPrimary,
              fontFamily: D.head,
              fontSize: '12px',
              fontWeight: selectedGroundId === g.groundId ? 700 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {g.name}
          </button>
        ))}
      </div>

      {/* Main Ground Detail & Curator Cockpit */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 340px', gap: '16px' }}>
        {/* Left: Pitch Condition Dossier */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Main Hero Card */}
          <div style={{ padding: '20px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 800, color: D.textPrimary }}>
                  {activeGround.name}
                </div>
                <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted }}>
                  Surface: {activeGround.surface}
                </div>
              </div>
              <span style={{ padding: '4px 10px', borderRadius: D.pill, background: `${D.emerald}22`, color: D.emerald, fontFamily: D.mono, fontSize: '11px', fontWeight: 700 }}>
                MATCH READY
              </span>
            </div>

            {/* 4 Pitch Telemetry Gauges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '6px' }}>
              <div style={{ padding: '10px', background: D.surf2, borderRadius: D.md, textAlign: 'center' }}>
                <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>MOISTURE</div>
                <div style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 800, color: D.sky, marginTop: '2px' }}>{activeGround.moisturePct}%</div>
                <div style={{ fontFamily: D.body, fontSize: '10px', color: D.emerald }}>Optimal firm</div>
              </div>
              <div style={{ padding: '10px', background: D.surf2, borderRadius: D.md, textAlign: 'center' }}>
                <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>CUT HEIGHT</div>
                <div style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 800, color: D.emerald, marginTop: '2px' }}>{activeGround.grassHeightMm}mm</div>
                <div style={{ fontFamily: D.body, fontSize: '10px', color: D.textMuted }}>Laser mown</div>
              </div>
              <div style={{ padding: '10px', background: D.surf2, borderRadius: D.md, textAlign: 'center' }}>
                <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>BOUNCE CARRY</div>
                <div style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 800, color: D.amber, marginTop: '2px' }}>{activeGround.bounceRating}/10</div>
                <div style={{ fontFamily: D.body, fontSize: '10px', color: D.textMuted }}>True & even</div>
              </div>
              <div style={{ padding: '10px', background: D.surf2, borderRadius: D.md, textAlign: 'center' }}>
                <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>OUTFIELD</div>
                <div style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 800, color: D.teal, marginTop: '2px' }}>{activeGround.outfieldSpeed}</div>
                <div style={{ fontFamily: D.body, fontSize: '10px', color: D.textMuted }}>Drainage: {activeGround.drainageTimeMin}m</div>
              </div>
            </div>

            {/* Curator Notes */}
            <div style={{ padding: '12px 14px', borderRadius: D.md, background: D.surf2, fontFamily: D.body, fontSize: '12px', color: D.textSecondary, lineHeight: 1.5 }}>
              <strong>Curator Assessment:</strong> {activeGround.curatorNotes}
              <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, marginTop: '4px' }}>
                Log: {activeGround.lastMaintained}
              </div>
            </div>
          </div>

          {/* Boundary Dimensions Diagram */}
          <div style={{ padding: '18px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}` }}>
            <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.textPrimary, marginBottom: '10px' }}>
              OFFICIAL BOUNDARY ROPE DIMENSIONS (WESTVILLE BOWDEN'S FIELD)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[
                { sector: "Straight (Long On/Off)", dist: "72m", grade: "CSA Standard" },
                { sector: "Square of Wicket (Point)", dist: "68m", grade: "Full Oval" },
                { sector: "Square Leg Boundary", dist: "66m", grade: "Full Oval" },
                { sector: "Fine Leg / Third Man", dist: "60m", grade: "Short Angle" },
              ].map(b => (
                <div key={b.sector} style={{ padding: '10px', background: D.surf2, borderRadius: D.md }}>
                  <div style={{ fontFamily: D.head, fontSize: '8px', color: D.textMuted }}>{b.sector}</div>
                  <div style={{ fontFamily: D.mono, fontSize: '16px', fontWeight: 700, color: D.emerald, marginTop: '2px' }}>{b.dist}</div>
                  <div style={{ fontFamily: D.body, fontSize: '10px', color: D.textMuted }}>{b.grade}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Daily Curator Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ padding: '18px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.textPrimary }}>
                CURATOR MATCH PREP LOG
              </span>
              <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.emerald, fontWeight: 700 }}>
                {tasks.filter(t => t.done).length}/{tasks.length} Complete
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tasks.map(t => (
                <div
                  key={t.id}
                  onClick={() => toggleTask(t.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: D.md,
                    background: t.done ? `${D.emerald}12` : D.surf2,
                    border: `1px solid ${t.done ? D.emerald + '33' : D.border}`,
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      background: t.done ? D.emerald : 'transparent',
                      border: `1px solid ${t.done ? D.emerald : D.textMuted}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 900,
                      flexShrink: 0,
                    }}
                  >
                    {t.done && '✓'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: D.body, fontSize: '11px', fontWeight: 600, color: D.textPrimary, textDecoration: t.done ? 'line-through' : 'none', opacity: t.done ? 0.8 : 1 }}>
                      {t.task}
                    </div>
                    <div style={{ fontFamily: D.mono, fontSize: '9px', color: D.textMuted }}>Scheduled: {t.time}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '10px', borderRadius: D.md, background: D.surf2, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>🌿</span>
              <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary }}>
                Head Curator: <strong>Mr Ernest Mzimba</strong> (CSA Turfgrass Cert, 26 yrs tenure)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
