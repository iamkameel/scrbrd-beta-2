'use client';

import React, { useState } from 'react';
import { Theme } from './types';

interface DRSReviewProps {
  theme: Theme;
}

type PitchingZone = 'In-Line' | 'Outside Off' | 'Outside Leg';
type ImpactZone = 'In-Line' | 'Outside Off' | 'Outside Leg' | "Umpire's Call";
type WicketsZone = 'Hitting Stumps' | 'Missing Stumps' | "Umpire's Call (Clipping)";

export default function DRSReview({ theme: D }: DRSReviewProps) {
  const [onFieldDecision, setOnFieldDecision] = useState<'OUT' | 'NOT OUT'>('NOT OUT');
  const [reviewingTeam, setReviewingTeam] = useState<'Westville U19A (Bowling)' | 'Michaelhouse (Batting)'>('Westville U19A (Bowling)');
  const [batterHand, setBatterHand] = useState<'Right-Hand Bat' | 'Left-Hand Bat'>('Right-Hand Bat');
  const [bowlerAngle, setBowlerAngle] = useState<'Right-Arm Over' | 'Right-Arm Round' | 'Left-Arm Over'>('Right-Arm Over');
  const [pitching, setPitching] = useState<PitchingZone>('In-Line');
  const [impact, setImpact] = useState<ImpactZone>('In-Line');
  const [wickets, setWickets] = useState<WicketsZone>('Hitting Stumps');
  const [hasBat, setHasBat] = useState<boolean>(false);
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [reviewStep, setReviewStep] = useState<number>(0);

  // Determine outcome
  const computeDecision = () => {
    if (hasBat) {
      return {
        verdict: 'NOT OUT',
        reason: 'UltraEdge confirms inside edge prior to pad impact.',
        retained: true,
        overturned: onFieldDecision === 'OUT',
      };
    }
    if (pitching === 'Outside Leg') {
      return {
        verdict: 'NOT OUT',
        reason: 'Pitching Outside Leg stump. Illegal pitching line for LBW Law 36.1.',
        retained: true,
        overturned: onFieldDecision === 'OUT',
      };
    }
    if (impact === 'Outside Off' || impact === 'Outside Leg') {
      return {
        verdict: 'NOT OUT',
        reason: 'Impact Outside Off stump with genuine shot offered.',
        retained: true,
        overturned: onFieldDecision === 'OUT',
      };
    }
    if (wickets === 'Missing Stumps') {
      return {
        verdict: 'NOT OUT',
        reason: 'Hawk-Eye trajectory indicates ball missing leg stump.',
        retained: false,
        overturned: onFieldDecision === 'OUT',
      };
    }
    if (wickets === "Umpire's Call (Clipping)") {
      return {
        verdict: onFieldDecision,
        reason: `Ball clipping bail (<50% ball volume). On-field call of ${onFieldDecision} stands.`,
        retained: true,
        overturned: false,
      };
    }
    if (impact === "Umpire's Call") {
      return {
        verdict: onFieldDecision,
        reason: `Point of impact is Umpire's Call. On-field call of ${onFieldDecision} stands.`,
        retained: true,
        overturned: false,
      };
    }
    // Clean Hitting
    return {
      verdict: 'OUT',
      reason: 'Pitching in line, Impact in line, Wickets hitting middle stump (100% projection).',
      retained: true,
      overturned: onFieldDecision === 'NOT OUT',
    };
  };

  const currentOutcome = computeDecision();

  const runSimulation = () => {
    setIsReviewing(true);
    setReviewStep(1);
    setTimeout(() => setReviewStep(2), 1200);
    setTimeout(() => setReviewStep(3), 2400);
    setTimeout(() => setReviewStep(4), 3600);
    setTimeout(() => setIsReviewing(false), 4400);
  };

  const setScenario = (type: 'plumb' | 'outsideLeg' | 'edge' | 'clipping' | 'missing') => {
    if (type === 'plumb') {
      setOnFieldDecision('NOT OUT');
      setHasBat(false);
      setPitching('In-Line');
      setImpact('In-Line');
      setWickets('Hitting Stumps');
    } else if (type === 'outsideLeg') {
      setOnFieldDecision('OUT');
      setHasBat(false);
      setPitching('Outside Leg');
      setImpact('In-Line');
      setWickets('Hitting Stumps');
    } else if (type === 'edge') {
      setOnFieldDecision('OUT');
      setHasBat(true);
      setPitching('In-Line');
      setImpact('In-Line');
      setWickets('Hitting Stumps');
    } else if (type === 'clipping') {
      setOnFieldDecision('NOT OUT');
      setHasBat(false);
      setPitching('In-Line');
      setImpact('In-Line');
      setWickets("Umpire's Call (Clipping)");
    } else if (type === 'missing') {
      setOnFieldDecision('OUT');
      setHasBat(false);
      setPitching('In-Line');
      setImpact('In-Line');
      setWickets('Missing Stumps');
    }
    runSimulation();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>📺</span>
            <h2 style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 800, color: D.textPrimary }}>
              SCRBRD DRS Decision Review Telemetry
            </h2>
          </div>
          <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted, marginTop: '2px' }}>
            High-precision ball tracking, UltraEdge audio snicko, and LBW Law 36 adjudicator
          </div>
        </div>

        {/* Quick Presets */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setScenario('plumb')}
            style={{ padding: '6px 12px', borderRadius: D.pill, background: `${D.emerald}22`, border: `1px solid ${D.emerald}55`, color: D.emerald, fontFamily: D.head, fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
          >
            Plumb LBW (Overturn)
          </button>
          <button
            onClick={() => setScenario('outsideLeg')}
            style={{ padding: '6px 12px', borderRadius: D.pill, background: `${D.rose}22`, border: `1px solid ${D.rose}55`, color: D.rose, fontFamily: D.head, fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
          >
            Pitching Outside Leg
          </button>
          <button
            onClick={() => setScenario('edge')}
            style={{ padding: '6px 12px', borderRadius: D.pill, background: `${D.sky}22`, border: `1px solid ${D.sky}55`, color: D.sky, fontFamily: D.head, fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
          >
            Snicko Inside Edge
          </button>
          <button
            onClick={() => setScenario('clipping')}
            style={{ padding: '6px 12px', borderRadius: D.pill, background: `${D.amber}22`, border: `1px solid ${D.amber}55`, color: D.amber, fontFamily: D.head, fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
          >
            Umpire's Call (Bail)
          </button>
        </div>
      </div>

      {/* Hardware & Optical Tech Stack Notice */}
      <div
        style={{
          padding: '10px 14px',
          borderRadius: D.md,
          background: `${D.surf2}`,
          border: `1px solid ${D.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '11px',
          fontFamily: D.body,
          color: D.textMuted,
        }}
      >
        <span style={{ fontSize: '16px' }}>🎥</span>
        <div>
          <strong style={{ color: D.sky, fontFamily: D.head }}>Optical Hardware & Broadcast Tech Stack Dependency:</strong> Live ball-tracking trajectory and LBW predictive paths require an integrated venue hardware rig (such as a 360° high-speed camera array and low-latency broadcast ingest). This interactive module demonstrates the telemetry adjudicator and Law 36 rules engine.
        </div>
      </div>

      {/* Main Review Cockpit */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 340px', gap: '16px' }}>
        {/* Left Side: Telemetry Stage */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* TV Screen Mockup */}
          <div
            style={{
              background: '#040711',
              borderRadius: D.xl,
              border: `2px solid ${D.borderMed}`,
              padding: '20px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 35px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* TV Broadcast Banner */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: isReviewing ? D.amber : D.rose, boxShadow: `0 0 8px ${isReviewing ? D.amber : D.rose}` }} />
                <span style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 800, color: '#fff', letterSpacing: '0.1em' }}>
                  {isReviewing ? 'TV UMPIRE REVIEW IN PROGRESS' : 'DECISION PENDING / FINALIZED'}
                </span>
              </div>
              <div style={{ fontFamily: D.mono, fontSize: '11px', color: '#94a3b8' }}>
                ON-FIELD CALL: <strong style={{ color: onFieldDecision === 'OUT' ? D.rose : D.emerald }}>{onFieldDecision}</strong>
              </div>
            </div>

            {/* Simulated 3D Stumps & Ball Path Graphic */}
            <div
              style={{
                height: '200px',
                background: 'linear-gradient(to bottom, #091e13 0%, #153c26 60%, #422817 100%)',
                borderRadius: D.lg,
                border: '1px solid rgba(255,255,255,0.15)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg viewBox="0 0 400 200" style={{ width: '100%', height: '100%' }}>
                {/* 3D Pitch Grid Lines */}
                <line x1="120" y1="200" x2="160" y2="80" stroke="#78350f" strokeWidth="1.5" opacity="0.4" />
                <line x1="280" y1="200" x2="240" y2="80" stroke="#78350f" strokeWidth="1.5" opacity="0.4" />
                <line x1="160" y1="80" x2="240" y2="80" stroke="#fde047" strokeWidth="1.5" opacity="0.6" />
                <text x="200" y="74" textAnchor="middle" fill="#fde047" fontSize="8" fontFamily="'DM Mono', monospace" opacity="0.7">POPPING CREASE</text>

                {/* Stumps & Bails (3 wood stumps) */}
                <g transform="translate(180, 50)">
                  {/* Off Stump */}
                  <rect x="10" y="0" width="5" height="50" rx="1" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                  {/* Middle Stump */}
                  <rect x="18" y="0" width="5" height="50" rx="1" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                  {/* Leg Stump */}
                  <rect x="26" y="0" width="5" height="50" rx="1" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                  {/* Bails */}
                  <rect x="8" y="-4" width="24" height="3" rx="1" fill={wickets.includes('Clipping') ? D.amber : '#eab308'} />
                </g>

                {/* Ball Trajectory Path */}
                {(!isReviewing || reviewStep >= 4) && (
                  <g>
                    {/* Trajectory curve */}
                    <path
                      d={
                        wickets === 'Hitting Stumps'
                          ? "M 100,180 Q 170,120 200,75"
                          : wickets === 'Missing Stumps'
                          ? "M 100,180 Q 180,120 235,50"
                          : "M 100,180 Q 175,120 215,48"
                      }
                      fill="none"
                      stroke={wickets === 'Missing Stumps' ? D.rose : D.emerald}
                      strokeWidth="3.5"
                      strokeDasharray={isReviewing ? "4,4" : "none"}
                    />
                    {/* Ball Marker */}
                    <circle
                      cx={wickets === 'Hitting Stumps' ? 200 : wickets === 'Missing Stumps' ? 235 : 212}
                      cy={wickets === 'Hitting Stumps' ? 75 : wickets === 'Missing Stumps' ? 50 : 48}
                      r="7"
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  </g>
                )}

                {/* Pitching Mat Spot */}
                {(!isReviewing || reviewStep >= 2) && (
                  <ellipse
                    cx={pitching === 'In-Line' ? 170 : pitching === 'Outside Off' ? 140 : 210}
                    cy="140"
                    rx="16"
                    ry="7"
                    fill={pitching === 'Outside Leg' ? D.rose + '88' : D.emerald + '88'}
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                )}

                {/* Impact Pad Spot */}
                {(!isReviewing || reviewStep >= 3) && (
                  <ellipse
                    cx={impact === 'In-Line' ? 185 : impact === 'Outside Off' ? 150 : 220}
                    cy="105"
                    rx="12"
                    ry="5"
                    fill={impact.includes('Outside') ? D.rose + '88' : D.emerald + '88'}
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                )}
              </svg>

              {/* Status overlay label inside screen */}
              <div style={{ position: 'absolute', bottom: '10px', left: '14px', background: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: D.sm, fontFamily: D.mono, fontSize: '10px', color: '#fff' }}>
                SPEED: 134.2 KM/H · IMPACT: 2.1m FROM STUMPS
              </div>
            </div>

            {/* UltraEdge Audio Waveform Check */}
            <div style={{ background: '#090d18', padding: '10px 14px', borderRadius: D.md, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontFamily: D.head, fontSize: '10px', fontWeight: 700, color: D.sky }}>
                  STEP 1: ULTRAEDGE / SNICKOMETER AUDIO FEED
                </span>
                <span style={{ fontFamily: D.mono, fontSize: '10px', color: hasBat ? D.rose : D.emerald, fontWeight: 700 }}>
                  {hasBat ? 'SPIKE DETECTED (BAT INVOLVEMENT)' : 'CLEAN AUDIO LINE (NO BAT)'}
                </span>
              </div>
              {/* Audio Wave Visualizer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '32px' }}>
                {Array.from({ length: 42 }).map((_, i) => {
                  const isSpike = hasBat && i >= 18 && i <= 24;
                  const h = isSpike ? (i === 21 ? 28 : 20) : (Math.sin(i * 0.5) * 3 + 5);
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: `${h}px`,
                        background: isSpike ? D.rose : '#334155',
                        borderRadius: '1px',
                        transition: 'height 0.2s ease',
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* 3 Telemetry Pillars: Pitching, Impact, Wickets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ padding: '10px', background: '#090d18', borderRadius: D.md, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>1. PITCHING</div>
                <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: pitching === 'Outside Leg' ? D.rose : D.emerald, marginTop: '4px' }}>
                  {pitching.toUpperCase()}
                </div>
              </div>
              <div style={{ padding: '10px', background: '#090d18', borderRadius: D.md, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>2. IMPACT</div>
                <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: impact.includes('Outside') ? D.rose : impact.includes('Call') ? D.amber : D.emerald, marginTop: '4px' }}>
                  {impact.toUpperCase()}
                </div>
              </div>
              <div style={{ padding: '10px', background: '#090d18', borderRadius: D.md, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>3. WICKETS</div>
                <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: wickets.includes('Missing') ? D.rose : wickets.includes('Call') ? D.amber : D.emerald, marginTop: '4px' }}>
                  {wickets.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Big Verdict Announcement */}
            <div
              style={{
                padding: '16px',
                borderRadius: D.lg,
                background: currentOutcome.verdict === 'OUT' ? `${D.rose}22` : `${D.emerald}22`,
                border: `2px solid ${currentOutcome.verdict === 'OUT' ? D.rose : D.emerald}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ fontFamily: D.head, fontSize: '20px', fontWeight: 900, color: currentOutcome.verdict === 'OUT' ? D.rose : D.emerald }}>
                  VERDICT: {currentOutcome.verdict}
                  {currentOutcome.overturned && <span style={{ fontSize: '13px', marginLeft: '10px', color: D.amber }}>(OVERTURNED)</span>}
                </div>
                <div style={{ fontFamily: D.body, fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>
                  {currentOutcome.reason}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: D.head, fontSize: '9px', color: '#94a3b8' }}>REVIEW STATUS</div>
                <div style={{ fontFamily: D.mono, fontSize: '13px', fontWeight: 700, color: currentOutcome.retained ? D.emerald : D.rose }}>
                  {currentOutcome.retained ? '✓ REVIEW RETAINED' : '✗ REVIEW LOST'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Configuration & Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Controls Card */}
          <div style={{ padding: '16px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.textPrimary }}>
              REVIEW SPECIFICATIONS
            </div>

            {/* On-Field Call */}
            <div>
              <label style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>ON-FIELD UMPIRE CALL</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {(['OUT', 'NOT OUT'] as const).map(call => (
                  <button
                    key={call}
                    onClick={() => setOnFieldDecision(call)}
                    style={{
                      padding: '8px',
                      borderRadius: D.sm,
                      border: `1px solid ${onFieldDecision === call ? (call === 'OUT' ? D.rose : D.emerald) : D.border}`,
                      background: onFieldDecision === call ? (call === 'OUT' ? D.rose + '22' : D.emerald + '22') : D.surf2,
                      color: onFieldDecision === call ? (call === 'OUT' ? D.rose : D.emerald) : D.textSecondary,
                      fontFamily: D.head,
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {call}
                  </button>
                ))}
              </div>
            </div>

            {/* Bat Involved Toggle */}
            <div>
              <label style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>BAT / EDGE INVOLVEMENT</label>
              <button
                onClick={() => setHasBat(prev => !prev)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: D.sm,
                  border: `1px solid ${hasBat ? D.sky : D.border}`,
                  background: hasBat ? D.sky + '22' : D.surf2,
                  color: hasBat ? D.sky : D.textSecondary,
                  fontFamily: D.head,
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {hasBat ? '⚡ Bat Involved (Edge Confirmed)' : 'No Bat (Pad First)'}
              </button>
            </div>

            {/* Pitching selector */}
            <div>
              <label style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>PITCHING LOCATION</label>
              <select
                value={pitching}
                onChange={e => setPitching(e.target.value as PitchingZone)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: '11px' }}
              >
                <option value="In-Line">In-Line (Between Stumps)</option>
                <option value="Outside Off">Outside Off Stump</option>
                <option value="Outside Leg">Outside Leg Stump (Not Out)</option>
              </select>
            </div>

            {/* Impact selector */}
            <div>
              <label style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>POINT OF IMPACT</label>
              <select
                value={impact}
                onChange={e => setImpact(e.target.value as ImpactZone)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: '11px' }}
              >
                <option value="In-Line">In-Line (Direct Wicket Line)</option>
                <option value="Umpire's Call">Umpire's Call (Margin zone)</option>
                <option value="Outside Off">Outside Off Stump</option>
              </select>
            </div>

            {/* Wickets selector */}
            <div>
              <label style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>PROJECTED WICKETS PATH</label>
              <select
                value={wickets}
                onChange={e => setWickets(e.target.value as WicketsZone)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: '11px' }}
              >
                <option value="Hitting Stumps">Hitting Stumps (Middle/Off/Leg)</option>
                <option value="Umpire's Call (Clipping)">Umpire's Call (Clipping Bails)</option>
                <option value="Missing Stumps">Missing Stumps (Passing Over/Wide)</option>
              </select>
            </div>

            {/* Trigger Simulation Button */}
            <button
              onClick={runSimulation}
              disabled={isReviewing}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: D.pill,
                background: D.gradMain,
                border: 'none',
                color: '#fff',
                fontFamily: D.head,
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                opacity: isReviewing ? 0.6 : 1,
              }}
            >
              {isReviewing ? 'Replaying Hawk-Eye 3D...' : '▶ Replay TV Telemetry'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
