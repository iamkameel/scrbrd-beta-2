'use client';

import React, { useState } from 'react';
import { Theme, Match } from '../scrbrd/types';
import { CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, XCircle } from 'lucide-react';

interface ReviewConfirmModalProps {
  theme: Theme;
  match: Match;
  inningsNumber: number;
  runs: number;
  wickets: number;
  overs: number;
  ballsInOver: number;
  battingTeamName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ReviewConfirmModal({
  theme: D,
  match,
  inningsNumber,
  runs,
  wickets,
  overs,
  ballsInOver,
  battingTeamName,
  onConfirm,
  onCancel,
}: ReviewConfirmModalProps) {
  const [scoreboardReconciled, setScoreboardReconciled] = useState(true);
  const [extrasChecked, setExtrasChecked] = useState(true);
  const [umpiresSignedOff, setUmpiresSignedOff] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canConfirm = scoreboardReconciled && extrasChecked;

  const handleConfirm = () => {
    if (!canConfirm) {
      setErrorMsg('Please complete mandatory verification items before submitting.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onConfirm();
    }, 400);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(6, 9, 16, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          background: D.isDark ? '#0f172a' : '#ffffff',
          borderRadius: '24px',
          border: `1px solid ${D.borderMed}`,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Header banner */}
        <div
          style={{
            padding: '24px 28px',
            background: `linear-gradient(135deg, ${D.indigo}15, ${D.emerald}15)`,
            borderBottom: `1px solid ${D.border}`,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '28px',
              background: `${D.emerald}20`,
              color: D.emerald,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
            }}
          >
            <ShieldCheck size={32} />
          </div>
          <h2
            style={{
              fontFamily: D.head,
              fontSize: '22px',
              fontWeight: 800,
              color: D.textPrimary,
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em',
            }}
          >
            Review Innings {inningsNumber} Conclusion
          </h2>
          <p
            style={{
              fontFamily: D.body,
              fontSize: '13px',
              color: D.textSecondary,
              margin: 0,
            }}
          >
            {battingTeamName} · Institutional match state verification
          </p>
        </div>

        {/* Score Summary Block */}
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px',
            }}
          >
            <div
              style={{
                background: D.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                padding: '16px',
                borderRadius: '16px',
                border: `1px solid ${D.border}`,
                textAlign: 'center',
              }}
            >
              <div style={{ fontFamily: D.mono, fontSize: '11px', textTransform: 'uppercase', color: D.textMuted, marginBottom: '4px' }}>
                Final Innings Score
              </div>
              <div style={{ fontFamily: D.mono, fontSize: '32px', fontWeight: 800, color: D.emerald }}>
                {runs}/{wickets}
              </div>
            </div>

            <div
              style={{
                background: D.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                padding: '16px',
                borderRadius: '16px',
                border: `1px solid ${D.border}`,
                textAlign: 'center',
              }}
            >
              <div style={{ fontFamily: D.mono, fontSize: '11px', textTransform: 'uppercase', color: D.textMuted, marginBottom: '4px' }}>
                Overs Bowled
              </div>
              <div style={{ fontFamily: D.mono, fontSize: '32px', fontWeight: 800, color: D.sky }}>
                {overs}{ballsInOver > 0 ? `.${ballsInOver}` : ''}
              </div>
            </div>
          </div>

          {/* Pre-completion verification checklist */}
          <div
            style={{
              background: D.isDark ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.03)',
              borderRadius: '16px',
              padding: '16px 18px',
              border: `1px solid ${D.indigo}30`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <AlertTriangle size={16} color={D.amber} />
              <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: D.textPrimary }}>
                Scorer Protocol Pre-Completion Checklist
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: D.textSecondary,
                }}
              >
                <input
                  type="checkbox"
                  checked={scoreboardReconciled}
                  onChange={(e) => setScoreboardReconciled(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: D.emerald, cursor: 'pointer' }}
                />
                Reconciled with physical ground scoreboard & umpire score sheet
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: D.textSecondary,
                }}
              >
                <input
                  type="checkbox"
                  checked={extrasChecked}
                  onChange={(e) => setExtrasChecked(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: D.emerald, cursor: 'pointer' }}
                />
                All sundries (wides, no-balls, byes, leg-byes) and bowling allocations verified
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: D.textSecondary,
                }}
              >
                <input
                  type="checkbox"
                  checked={umpiresSignedOff}
                  onChange={(e) => setUmpiresSignedOff(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: D.emerald, cursor: 'pointer' }}
                />
                Standing umpires notified for end-of-session sign-off
              </label>
            </div>
          </div>

          {errorMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '10px',
                background: `${D.rose}15`,
                border: `1px solid ${D.rose}40`,
                color: D.rose,
                fontSize: '12px',
              }}
            >
              <XCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                border: `1px solid ${D.border}`,
                background: 'transparent',
                color: D.textSecondary,
                fontFamily: D.body,
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Go Back & Edit
            </button>

            <button
              onClick={handleConfirm}
              disabled={!canConfirm || isSubmitting}
              style={{
                flex: 1.4,
                padding: '12px 18px',
                borderRadius: '12px',
                border: 'none',
                background: canConfirm ? D.emerald : D.surf3,
                color: canConfirm ? '#ffffff' : D.textMuted,
                fontFamily: D.body,
                fontSize: '14px',
                fontWeight: 700,
                cursor: canConfirm ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: canConfirm ? `0 8px 20px ${D.emerald}30` : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {isSubmitting ? (
                'Committing...'
              ) : (
                <>
                  <span>Confirm & Transition</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
