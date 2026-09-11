'use client';

import React, { useState } from 'react';
import { Theme, Player, Match } from './types';
import { TacticalPlanDirective } from './CoachCockpitView';
import {
  Shield, Zap, Target, TrendingUp, CheckCircle2, XCircle, Edit3,
  Clock, ArrowRight, Compass, Activity, Award, AlertCircle,
  Layers, ChevronRight, Check, X, Sliders, RefreshCw, Send
} from 'lucide-react';

interface CaptainCockpitViewProps {
  theme: Theme;
  activeSchoolId: string;
  currentRole: string;
  incomingTacticalPlan?: TacticalPlanDirective | null;
  onNavigateToCoach?: () => void;
  onTriggerToast?: (msg: string) => void;
}

export default function CaptainCockpitView({
  theme: D,
  activeSchoolId,
  currentRole,
  incomingTacticalPlan,
  onNavigateToCoach,
  onTriggerToast,
}: CaptainCockpitViewProps) {
  // Live Match Glance State
  const [matchState, setMatchState] = useState({
    score: 187,
    wickets: 4,
    overs: '32.3',
    totalOvers: 50,
    crr: '5.75',
    projected: 286,
    target: 284,
    rrr: '5.51',
    phase: 'Middle Overs (11-40)',
    momentum: '↗ Positive (+34 in last 5 ov)',
  });

  // Recent 12 Deliveries Ticker
  const recentDeliveries = ['6', '•', '1', '4', '2', '•', '|', '1', 'W', '•', '2', '1', '0'];

  // Current Batters Quick Cards
  const currentBatters = [
    {
      name: 'M. Patel',
      status: 'Striker (RHB)',
      score: '67',
      balls: '71',
      sr: '94.3',
      primaryTendency: 'Cover ↑ (68% boundaries)',
      threatLevel: 'High',
    },
    {
      name: 'S. Naidoo',
      status: 'Non-Striker (LHB)',
      score: '18',
      balls: '12',
      sr: '150.0',
      primaryTendency: 'Mid-Wicket ↑ (58% boundaries)',
      threatLevel: 'Aggressive',
    },
  ];

  // Current Bowler Card
  const [bowlerState, setBowlerState] = useState({
    name: 'D. Daniels',
    figures: '6.3–0–31–2',
    economy: '4.77',
    currentSpellDeliveries: ['•', '1', '•', 'W', '2', '•'],
    remainingAllocation: '3.3 overs',
    workloadAlert: 'Max 8.0 overs match limit (Physio restricted)',
  });

  // Tactical Directives from Coach (with Accept / Modify / Dismiss actions)
  const [coachDirective, setCoachDirective] = useState<TacticalPlanDirective>({
    id: 'dir_live',
    timestamp: '32.3 ov',
    title: 'OFF-SIDE CHOKE & 4TH STUMP SEAM PLAN',
    targetBatter: 'M. Patel (Striker)',
    bowler: 'D. Daniels',
    bowlingPlan: 'Bowl tight back of length on 4th stump. Keep deep cover posted and invite aerial drive over cover ring.',
    fieldPreset: 'Cover & Point Ring Lock',
    fieldPositions: [],
    instruction: 'Bowl tight back of length on 4th stump. Deep cover and backward point boundary protection.',
    rationale: 'Patel scores 68% off-side. 42% false shot rate on high pace back of length deliveries.',
    confidence: 86,
    sampleSize: 22,
    status: 'sent',
  });

  // Signature Over Planner State (Over 33)
  const [overPlan, setOverPlan] = useState([
    { ball: 1, intended: 'Good length outside off', actual: 'Good length outside off (• Dot)', adhered: true },
    { ball: 2, intended: 'Good length 4th stump', actual: 'Good length 4th stump (1 Single)', adhered: true },
    { ball: 3, intended: 'Short surprise bouncer', actual: 'Short bouncer (W Wicket!)', adhered: true },
    { ball: 4, intended: 'Full yorker attempt', actual: 'Overpitched half volley (4 Four)', adhered: false },
    { ball: 5, intended: 'Back of length outside off', actual: 'Back of length (• Dot)', adhered: true },
    { ball: 6, intended: 'Wide yorker on crease line', actual: 'Pending delivery...', adhered: null },
  ]);

  // Decision Timeline History
  const [decisionTimeline, setDecisionTimeline] = useState([
    { over: '31.0', event: 'Defensive boundary field deployed (Deep cover out)', impact: '+3 dots conceded' },
    { over: '28.0', event: 'Spin introduced (J. Whitfield on)', impact: 'Economy choked to 4.2 rpo' },
    { over: '24.3', event: '2nd Slip removed for Deep 3rd Man', impact: 'Boundary saved at 3rd man' },
    { over: '21.0', event: 'Bowling change (Daniels 2nd spell)', impact: 'Wicket of Pillay on 3rd ball!' },
    { over: '17.2', event: 'Field changed to LHB accumulator choke', impact: 'Naidoo kept on strike' },
  ]);

  // Quick Decision Logger Action
  const logCaptainDecision = (decisionType: string) => {
    const newEntry = {
      over: `${matchState.overs}`,
      event: `${decisionType} applied on-field`,
      impact: 'Decision recorded in tactical match ledger',
    };
    setDecisionTimeline([newEntry, ...decisionTimeline]);
    if (onTriggerToast) onTriggerToast(`Tactical Decision Logged: ${decisionType}`);
  };

  // Accept Coach Directive
  const handleAcceptDirective = () => {
    setCoachDirective(prev => ({ ...prev, status: 'accepted' }));
    logCaptainDecision(`Coach Directive Accepted: ${coachDirective.title}`);
  };

  // Dismiss Coach Directive
  const handleDismissDirective = () => {
    setCoachDirective(prev => ({ ...prev, status: 'dismissed' }));
    logCaptainDecision(`Coach Directive Dismissed by Captain`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '32px' }}>
      {/* ── 1. GLANCEABLE HIGH-CONTRAST CORE MATCH SCREEN ── */}
      <div
        style={{
          padding: '20px 24px',
          borderRadius: D.xl,
          background: `linear-gradient(135deg, ${D.surf1}, #080d1a)`,
          border: `1.5px solid ${D.borderMed}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: D.emerald, boxShadow: `0 0 8px ${D.emerald}` }} />
              <span style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 900, color: D.emerald, letterSpacing: '0.08em' }}>
                CAPTAINCY COMMAND COCKPIT · ON-FIELD SITUATIONAL AWARENESS
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginTop: '4px' }}>
              <span style={{ fontFamily: D.mono, fontSize: '36px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
                {matchState.score}/{matchState.wickets}
              </span>
              <span style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 800, color: D.cyan }}>
                {matchState.overs} OVERS
              </span>
              <span style={{ fontFamily: D.mono, fontSize: '16px', fontWeight: 700, color: D.textSecondary }}>
                RR {matchState.crr}
              </span>
              <span style={{ fontFamily: D.mono, fontSize: '16px', fontWeight: 700, color: D.amber }}>
                PROJECTED {matchState.projected}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {onNavigateToCoach && (
              <button
                onClick={onNavigateToCoach}
                style={{
                  padding: '8px 16px',
                  borderRadius: D.pill,
                  background: D.surf2,
                  border: `1px solid ${D.border}`,
                  color: D.textPrimary,
                  fontFamily: D.head,
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>View Full Coach Cockpit</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Recent Sequence Ticker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: D.surf0, borderRadius: D.md, border: `1px solid ${D.border}` }}>
          <span style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 800, color: D.textMuted }}>
            LAST DELIVERIES:
          </span>
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', alignItems: 'center' }}>
            {recentDeliveries.map((b, idx) => (
              <span
                key={idx}
                style={{
                  width: b === '|' ? '2px' : '26px',
                  height: b === '|' ? '18px' : '26px',
                  borderRadius: b === '|' ? '0' : '50%',
                  background: b === '|' ? D.border : b === 'W' ? D.rose : b === '6' ? D.purple : b === '4' ? D.cyan : b === '•' ? D.surf2 : `${D.emerald}30`,
                  color: b === 'W' || b === '6' || b === '4' ? '#000' : D.textPrimary,
                  fontFamily: D.mono,
                  fontSize: '11px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {b === '|' ? '' : b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. CURRENT BATTERS & BOWLER CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
        {/* Batters Quick Card */}
        {currentBatters.map(bat => (
          <div
            key={bat.name}
            style={{
              padding: '16px',
              borderRadius: D.lg,
              background: D.surf1,
              border: `1.5px solid ${bat.status.includes('Striker') ? D.indigo : D.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 900, color: D.textPrimary }}>
                  {bat.name}
                </span>
                <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>{bat.status}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 900, color: D.textPrimary }}>
                  {bat.score} <span style={{ fontSize: '12px', color: D.textMuted }}>({bat.balls})</span>
                </span>
                <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.cyan }}>SR: {bat.sr}</div>
              </div>
            </div>

            <div style={{ padding: '8px 10px', background: D.surf0, borderRadius: D.sm, border: `1px solid ${D.border}` }}>
              <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>Primary Scoring Tendency:</span>
              <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.amber, marginTop: '2px' }}>
                {bat.primaryTendency}
              </div>
            </div>
          </div>
        ))}

        {/* Current Bowler Card */}
        <div
          style={{
            padding: '16px',
            borderRadius: D.lg,
            background: D.surf1,
            border: `1.5px solid ${D.cyan}44`,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 900, color: D.textPrimary }}>
                {bowlerState.name}
              </span>
              <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>Right-Arm Fast · 2nd Spell</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontFamily: D.mono, fontSize: '18px', fontWeight: 900, color: D.cyan }}>
                {bowlerState.figures}
              </span>
              <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textSecondary }}>Econ: {bowlerState.economy}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: D.surf0, borderRadius: D.sm }}>
            <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>Remaining:</span>
            <span style={{ fontFamily: D.mono, fontSize: '12px', fontWeight: 800, color: D.emerald }}>{bowlerState.remainingAllocation}</span>
          </div>

          <div style={{ fontFamily: D.body, fontSize: '10px', color: D.amber }}>
            ⚠️ {bowlerState.workloadAlert}
          </div>
        </div>
      </div>

      {/* ── 3. CAPTAIN TACTICAL CARD (DIRECTIVE FROM COACH) ── */}
      <div
        style={{
          padding: '18px 20px',
          borderRadius: D.xl,
          background: coachDirective.status === 'accepted' ? `${D.emerald}15` : `${D.indigo}15`,
          border: `1.5px solid ${coachDirective.status === 'accepted' ? D.emerald : D.indigo}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={18} color={D.indigo} />
            <span style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 900, color: D.textPrimary }}>
              COACH RECOMMENDED TACTICAL DIRECTIVE
            </span>
            <span
              style={{
                fontFamily: D.mono,
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: D.pill,
                background: `${D.indigo}25`,
                color: D.indigo,
                fontWeight: 800,
              }}
            >
              {coachDirective.title}
            </span>
          </div>

          <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
            Confidence: {coachDirective.confidence}% (N={coachDirective.sampleSize})
          </span>
        </div>

        <div style={{ fontFamily: D.body, fontSize: '13px', color: D.textPrimary, lineHeight: 1.4 }}>
          🏏 <strong>Plan:</strong> {coachDirective.bowlingPlan}
        </div>

        <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
          📊 <strong>Evidence:</strong> {coachDirective.rationale}
        </div>

        {/* Captain Action Triggers: Accept / Modify / Dismiss */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
          {coachDirective.status === 'accepted' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: D.emerald, fontFamily: D.head, fontSize: '12px', fontWeight: 800 }}>
              <CheckCircle2 size={16} />
              <span>DIRECTIVE ACCEPTED & FIELD ACTIVE</span>
            </div>
          ) : (
            <>
              <button
                onClick={handleDismissDirective}
                style={{
                  padding: '8px 16px',
                  borderRadius: D.pill,
                  background: D.surf2,
                  border: `1px solid ${D.border}`,
                  color: D.textMuted,
                  fontFamily: D.head,
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Dismiss
              </button>
              <button
                onClick={handleAcceptDirective}
                style={{
                  padding: '8px 24px',
                  borderRadius: D.pill,
                  background: D.indigo,
                  border: 'none',
                  color: '#fff',
                  fontFamily: D.head,
                  fontSize: '12px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: `0 4px 14px ${D.indigo}44`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Check size={14} />
                <span>ACCEPT & EXECUTE FIELD</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── 4. SIGNATURE OVER PLANNER (OVER 33) ── */}
      <div style={{ padding: '20px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 900, color: D.textPrimary }}>
              🎯 OVER PLANNER & INTENT-TO-EXECUTION ADHERENCE
            </span>
            <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
              Over 33 · Bowler: Daniels · Comparing Tactical Intent vs Actual Delivery
            </div>
          </div>

          <span
            style={{
              padding: '4px 12px',
              borderRadius: D.pill,
              background: `${D.emerald}20`,
              color: D.emerald,
              fontFamily: D.mono,
              fontSize: '12px',
              fontWeight: 900,
              border: `1px solid ${D.emerald}44`,
            }}
          >
            Plan Adherence: 80%
          </span>
        </div>

        {/* 6-Ball Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
          {overPlan.map(ball => (
            <div
              key={ball.ball}
              style={{
                padding: '12px',
                borderRadius: D.md,
                background: D.surf0,
                border: `1px solid ${ball.adhered === true ? D.emerald : ball.adhered === false ? D.rose : D.border}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: D.mono, fontSize: '11px', fontWeight: 800, color: D.textMuted }}>
                  Ball {ball.ball}
                </span>
                <span style={{ fontFamily: D.mono, fontSize: '10px', color: ball.adhered === true ? D.emerald : ball.adhered === false ? D.rose : D.textMuted }}>
                  {ball.adhered === true ? '✓ Adhered' : ball.adhered === false ? '✗ Deviated' : 'Pending'}
                </span>
              </div>

              <div style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textPrimary }}>
                🎯 Plan: {ball.intended}
              </div>

              <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.cyan }}>
                🏏 {ball.actual}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. CAPTAIN DECISION TIMELINE & RAPID TRIGGER PAD ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
        {/* Rapid Tactical Decision Triggers (5 Cols) */}
        <div style={{ gridColumn: 'span 5', padding: '18px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
            ⚡ 1-TAP CAPTAINCY DECISION LOGGER
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { label: '+ Add 2nd Slip', type: 'Slip cordon reinforced' },
              { label: '- Remove Slip', type: 'Slip removed for boundary protection' },
              { label: '🛡️ Ring In (Save Single)', type: 'Ring brought in' },
              { label: '🏃 Protect Boundary', type: 'Boundary riders deployed' },
              { label: '🔄 Change Bowler', type: 'Bowling change initiated' },
              { label: '🌪️ Introduce Spin', type: 'Spin attack introduced' },
            ].map(btn => (
              <button
                key={btn.label}
                onClick={() => logCaptainDecision(btn.type)}
                style={{
                  padding: '10px',
                  borderRadius: D.md,
                  background: D.surf0,
                  border: `1px solid ${D.border}`,
                  color: D.textPrimary,
                  fontFamily: D.head,
                  fontSize: '11px',
                  fontWeight: 700,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Decision Timeline Log (7 Cols) */}
        <div style={{ gridColumn: 'span 7', padding: '18px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
            📜 CAPTAIN DECISION TIMELINE & IMPACT LEDGER
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
            {decisionTimeline.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px 12px',
                  background: D.surf0,
                  borderRadius: D.md,
                  border: `1px solid ${D.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontFamily: D.mono, fontSize: '11px', fontWeight: 800, color: D.cyan }}>
                      {item.over} ov
                    </span>
                    <span style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary }}>
                      {item.event}
                    </span>
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: '10px', color: D.emerald, marginTop: '2px' }}>
                    Impact: {item.impact}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
