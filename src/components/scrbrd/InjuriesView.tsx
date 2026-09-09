'use client';

import React, { useState } from 'react';
import { Theme, Player } from './types';
import { PLAYERS } from './data';

interface InjuriesViewProps {
  theme: Theme;
  players?: Player[];
}

interface InjuryRecord {
  id: string;
  playerId: string;
  type: string;
  severity: "mild" | "moderate" | "severe";
  dateInjured: string;
  expectedRTP: string;
  currentPhase: "Acute" | "Conditioning" | "Skill Integration" | "Cleared";
  progressPct: number;
  physioNotes: string;
  restrictions: string[];
  physioName: string;
  cleared: boolean;
}

const INITIAL_INJURIES: InjuryRecord[] = [
  {
    id: "inj1",
    playerId: "p5",
    type: "Grade 2 Bicep Femoris Hamstring Strain",
    severity: "moderate",
    dateInjured: "2026-02-22",
    expectedRTP: "2026-03-15",
    currentPhase: "Conditioning",
    progressPct: 70,
    physioNotes: "Ultrasound shows significant fibrillar healing. Pain-free at 70% submaximal straight-line sprint. Cleared for light batting drills without quick singles.",
    restrictions: ["No sprint decel", "No diving in field", "Max 40m throws"],
    physioName: "Dr S. Khumalo",
    cleared: false,
  },
  {
    id: "inj2",
    playerId: "p8",
    type: "Right Subacromial Shoulder Impingement",
    severity: "mild",
    dateInjured: "2026-03-01",
    expectedRTP: "2026-03-22",
    currentPhase: "Skill Integration",
    progressPct: 50,
    physioNotes: "Rotator cuff strengthening ongoing. Full pain-free range of motion during forward defense and drive. Overhead bowling action restricted to 4 overs per week.",
    restrictions: ["Bowling limited to 4 overs", "Underarm throwing only"],
    physioName: "Sr N. Dube",
    cleared: false,
  },
];

export default function InjuriesView({ theme: D, players = PLAYERS }: InjuriesViewProps) {
  const [injuries, setInjuries] = useState<InjuryRecord[]>(INITIAL_INJURIES);
  const [selectedInjId, setSelectedInjId] = useState<string>("inj1");

  const activeInjury = injuries.find(i => i.id === selectedInjId) || injuries[0];
  const activePlayer = (players || []).find(p => p.id === activeInjury?.playerId) || players[0];

  const handleClearPlayer = (id: string) => {
    setInjuries(prev => prev.map(i => {
      if (i.id !== id) return i;
      return {
        ...i,
        cleared: true,
        progressPct: 100,
        currentPhase: "Cleared",
        physioNotes: `${i.physioNotes} [OFFICIAL MEDICAL CLEARANCE ISSUED FOR MATCH SELECTION]`,
      };
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🏥</span>
            <h2 style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 800, color: D.textPrimary }}>
              Medical & Physiotherapy Rehabilitation Command
            </h2>
          </div>
          <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted, marginTop: '2px' }}>
            Sports medicine injury surveillance, phased return-to-play timelines, and clinical clearances
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: D.pill, background: `${D.rose}18`, border: `1px solid ${D.rose}33` }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: D.rose }} />
          <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.rose, fontWeight: 700 }}>
            {injuries.filter(i => !i.cleared).length} Active Squad Restrictions
          </span>
        </div>
      </div>

      {/* Medical Staff Overview Bar */}
      <div style={{ padding: '14px 18px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: `${D.rose}22`, border: `1px solid ${D.rose}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
            ⚕️
          </div>
          <div>
            <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
              WBHS Sports Medicine Department
            </div>
            <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
              Head Physician: Dr. Siphamandla Khumalo (MBChB, Sports Med) · Physio: Sr. N. Dube
            </div>
          </div>
        </div>

        <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.emerald, fontWeight: 600 }}>
          ✓ CSA Concussion & Cardiac Protocols Active
        </div>
      </div>

      {/* Main Grid: Injuries List & Patient Dossier */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(320px, 1.2fr)', gap: '16px' }}>
        {/* Left: Injury Roster */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
            ACTIVE SQUAD REHABILITATION CASES
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {injuries.map(inj => {
              const p = players.find(pl => pl.id === inj.playerId);
              const isSelected = selectedInjId === inj.id;
              return (
                <div
                  key={inj.id}
                  onClick={() => setSelectedInjId(inj.id)}
                  style={{
                    padding: '16px',
                    borderRadius: D.lg,
                    background: isSelected ? `${D.rose}14` : D.surf1,
                    border: `1px solid ${isSelected ? D.rose : D.border}`,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 700, color: D.textPrimary }}>
                        {p?.name} ({p?.team})
                      </div>
                      <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                        Injured: {inj.dateInjured} · Target RTP: {inj.expectedRTP}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: D.pill,
                        fontFamily: D.mono,
                        fontSize: '10px',
                        fontWeight: 700,
                        background: inj.cleared ? `${D.emerald}22` : `${D.rose}22`,
                        color: inj.cleared ? D.emerald : D.rose,
                      }}
                    >
                      {inj.currentPhase.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textSecondary }}>
                    {inj.type}
                  </div>

                  {/* Recovery Progress Bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                      <span>Rehab Progress</span>
                      <span style={{ color: D.emerald, fontWeight: 700 }}>{inj.progressPct}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: D.surf2, borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${inj.progressPct}%`, height: '100%', background: inj.cleared ? D.emerald : D.rose, borderRadius: '3px' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Player Medical Case Notes */}
        {activeInjury && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
              CLINICAL MANAGEMENT DOSSIER
            </div>

            <div style={{ padding: '20px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.textPrimary }}>
                    {activePlayer?.name}
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                    {activePlayer?.team} · {activePlayer?.role} · Squad Member #{activePlayer?.id}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>ATTENDING PHYSICIAN</div>
                  <div style={{ fontFamily: D.body, fontSize: '12px', fontWeight: 700, color: D.sky }}>{activeInjury.physioName}</div>
                </div>
              </div>

              {/* 4-Stage Return to Play Tracker */}
              <div style={{ padding: '12px', borderRadius: D.md, background: D.surf2 }}>
                <div style={{ fontFamily: D.head, fontSize: '10px', fontWeight: 700, color: D.textMuted, marginBottom: '8px' }}>
                  RETURN-TO-PLAY MILESTONE PIPELINE
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                  {[
                    { stage: "1. Acute", done: true },
                    { stage: "2. Conditioning", done: activeInjury.progressPct >= 50 },
                    { stage: "3. Skill Integration", done: activeInjury.progressPct >= 75 },
                    { stage: "4. Match Clearance", done: activeInjury.cleared },
                  ].map(step => (
                    <div
                      key={step.stage}
                      style={{
                        padding: '6px 4px',
                        borderRadius: D.sm,
                        textAlign: 'center',
                        background: step.done ? `${D.emerald}22` : D.surf3,
                        border: `1px solid ${step.done ? D.emerald + '44' : D.border}`,
                      }}
                    >
                      <div style={{ fontFamily: D.mono, fontSize: '9px', color: step.done ? D.emerald : D.textMuted, fontWeight: 700 }}>
                        {step.done ? '✓' : '○'} {step.stage}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Notes */}
              <div>
                <div style={{ fontFamily: D.head, fontSize: '10px', color: D.textMuted, marginBottom: '4px' }}>PHYSIOTHERAPIST CLINICAL LOG</div>
                <div style={{ padding: '12px', borderRadius: D.md, background: D.surf2, fontFamily: D.body, fontSize: '12px', color: D.textPrimary, lineHeight: 1.5 }}>
                  {activeInjury.physioNotes}
                </div>
              </div>

              {/* Restrictions List */}
              <div>
                <div style={{ fontFamily: D.head, fontSize: '10px', color: D.rose, fontWeight: 700, marginBottom: '4px' }}>ACTIVE ON-FIELD RESTRICTIONS</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {(activeInjury?.restrictions || []).map((r, i) => (
                    <span key={i} style={{ padding: '4px 10px', borderRadius: D.pill, background: `${D.rose}20`, border: `1px solid ${D.rose}44`, fontFamily: D.body, fontSize: '11px', color: D.rose, fontWeight: 600 }}>
                      ⚠️ {r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sign-Off Clearance Action */}
              {!activeInjury.cleared ? (
                <button
                  onClick={() => handleClearPlayer(activeInjury.id)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: D.pill,
                    background: D.gradLive,
                    border: 'none',
                    color: '#fff',
                    fontFamily: D.head,
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '6px',
                  }}
                >
                  ✓ Issue Official Match Selection Clearance
                </button>
              ) : (
                <div style={{ padding: '10px', borderRadius: D.md, background: `${D.emerald}20`, border: `1px solid ${D.emerald}`, textAlign: 'center', fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.emerald }}>
                  ✓ PLAYER MEDICALLY CLEARED FOR MATCH SELECTION
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
