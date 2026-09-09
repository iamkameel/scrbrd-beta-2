'use client';

import React from 'react';
import { Theme } from './types';
import GoogleWeatherWidget from './GoogleWeatherWidget';

export interface FixtureDetail {
  id: string;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  venue: string;
  division: "U19A" | "U15A" | "U13A";
  competition: "T20 League" | "50-Over Cup" | "Traditional Derby" | "Scrimmage";
  status: "upcoming" | "live" | "complete";
  weather: string;
  bus?: string;
  scorer: string;
}

interface MatchDetailsModalProps {
  theme: Theme;
  fixture: FixtureDetail;
  onClose: () => void;
  onOpenScorer?: () => void;
}

export default function MatchDetailsModal({ theme: D, fixture, onClose, onOpenScorer }: MatchDetailsModalProps) {
  const isLive = fixture.status === 'live';
  const compColor = fixture.competition === 'T20 League' ? D.emerald : fixture.competition === 'Traditional Derby' ? D.amber : fixture.competition === '50-Over Cup' ? D.sky : D.violet;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.82)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 10005,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: D.surf1,
          border: `1px solid ${D.borderMed}`,
          borderRadius: D.xl,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.8)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ padding: '3px 10px', borderRadius: D.pill, background: compColor + '25', color: compColor, fontFamily: D.head, fontSize: '10px', fontWeight: 800 }}>
                {fixture.competition}
              </span>
              <span style={{ padding: '3px 10px', borderRadius: D.pill, background: D.surf2, color: D.textSecondary, fontFamily: D.mono, fontSize: '10px', fontWeight: 700 }}>
                {fixture.division}
              </span>
              {isLive && (
                <span style={{ padding: '3px 10px', borderRadius: D.pill, background: D.emerald, color: '#fff', fontFamily: D.head, fontSize: '10px', fontWeight: 800 }}>
                  ● LIVE NOW
                </span>
              )}
            </div>

            <h2 style={{ fontFamily: D.head, fontSize: '22px', fontWeight: 900, color: D.textPrimary }}>
              {fixture.homeTeam} <span style={{ color: D.textMuted, fontWeight: 400 }}>vs</span> {fixture.awayTeam}
            </h2>
            <div style={{ fontFamily: D.body, fontSize: '13px', color: D.textMuted, marginTop: '2px' }}>
              📍 {fixture.venue} · Scheduled Start: {fixture.date} at {fixture.time} SAST
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: D.surf2,
              border: `1px solid ${D.border}`,
              color: D.textMuted,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Google Weather API Live Widget */}
        <GoogleWeatherWidget theme={D} venue={fixture.venue} />

        {/* Section 2: Match Day Logistics & Staffing Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {/* Logistics & Fleet Transport */}
          <div style={{ padding: '16px', background: D.surf2, borderRadius: D.lg, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.sky, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🚌</span> FLEET TRANSPORT & LOGISTICS
            </div>

            <div style={{ fontFamily: D.body, fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>
                <span style={{ color: D.textMuted }}>Transport Mode: </span>
                <strong style={{ color: D.textPrimary }}>{fixture.bus || "School Bus Coach A (Iveco 32-Seater)"}</strong>
              </div>
              <div>
                <span style={{ color: D.textMuted }}>Departure Protocol: </span>
                <strong style={{ color: D.amber }}>06:30 SAST (North Gate Bus Depot)</strong>
              </div>
              <div>
                <span style={{ color: D.textMuted }}>Driver in Charge: </span>
                <strong style={{ color: D.textPrimary }}>Themba Nxumalo (PDP Certified)</strong>
              </div>
              <div>
                <span style={{ color: D.textMuted }}>Passenger Manifest: </span>
                <strong>14 Athletes + 2 Coaches + 1 Physio</strong>
              </div>
            </div>
          </div>

          {/* Official Match Staffing */}
          <div style={{ padding: '16px', background: D.surf2, borderRadius: D.lg, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.emerald, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📋</span> APPOINTED MATCH OFFICIALS
            </div>

            <div style={{ fontFamily: D.body, fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>
                <span style={{ color: D.textMuted }}>Official Scorer: </span>
                <strong style={{ color: D.textPrimary }}>{fixture.scorer} (CSA Accredited)</strong>
              </div>
              <div>
                <span style={{ color: D.textMuted }}>Umpires: </span>
                <strong>A. Molyneux (KZN Umpires) & D. Chetty</strong>
              </div>
              <div>
                <span style={{ color: D.textMuted }}>Match Commissioner: </span>
                <strong>G. Van Zyl (School Sports Exec)</strong>
              </div>
              <div>
                <span style={{ color: D.textMuted }}>Physio On-Duty: </span>
                <strong style={{ color: D.rose }}>Dr. S. Naidoo (Concussion Protocol)</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Expected Squad Lineups & Predefined Stances */}
        <div style={{ padding: '16px', background: D.surf2, borderRadius: D.lg, border: `1px solid ${D.border}` }}>
          <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.indigo, marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🏏 EXPECTED SQUAD LINEUP & PREDEFINED STANCES</span>
            <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>RHB / LHB Locked</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Home Team Squad */}
            <div>
              <div style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textPrimary, paddingBottom: '4px', borderBottom: `1px solid ${D.border}` }}>
                {fixture.homeTeam}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                {[
                  { name: "S. Whitfield", role: "Batter", stance: "RHB", cap: "C" },
                  { name: "C. Solomons", role: "Batter", stance: "LHB" },
                  { name: "L. Campbell", role: "WK Batter", stance: "RHB", cap: "WK" },
                  { name: "D. Ngcobo", role: "All-rounder", stance: "RHB" },
                  { name: "M. Henderson", role: "Fast Bowler", stance: "RHB" },
                ].map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontFamily: D.body }}>
                    <span>{i + 1}. {p.name} {p.cap ? `(${p.cap})` : ''}</span>
                    <span style={{ fontFamily: D.mono, fontSize: '9px', padding: '1px 5px', borderRadius: D.pill, background: `${D.indigo}20`, color: D.indigo }}>
                      {p.stance}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Away Team Squad */}
            <div>
              <div style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textPrimary, paddingBottom: '4px', borderBottom: `1px solid ${D.border}` }}>
                {fixture.awayTeam}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                {[
                  { name: "A. Baker", role: "Batter", stance: "RHB", cap: "C" },
                  { name: "R. Stewart", role: "WK Batter", stance: "LHB", cap: "WK" },
                  { name: "T. Higgs", role: "All-rounder", stance: "RHB" },
                  { name: "J. Dyer", role: "Pace Bowler", stance: "RHB" },
                  { name: "K. Mthembu", role: "Leg Spinner", stance: "RHB" },
                ].map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontFamily: D.body }}>
                    <span>{i + 1}. {p.name} {p.cap ? `(${p.cap})` : ''}</span>
                    <span style={{ fontFamily: D.mono, fontSize: '9px', padding: '1px 5px', borderRadius: D.pill, background: `${D.sky}20`, color: D.sky }}>
                      {p.stance}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '10px', borderTop: `1px solid ${D.border}` }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => alert(`Exporting ${fixture.homeTeam} vs ${fixture.awayTeam} fixture to Google Calendar (.ics)...`)}
              style={{
                padding: '8px 14px',
                borderRadius: D.pill,
                background: D.surf2,
                border: `1px solid ${D.border}`,
                color: D.textPrimary,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              📅 Sync Google Calendar
            </button>
            <button
              onClick={() => alert(`Generating Match Brief PDF for ${fixture.homeTeam}...`)}
              style={{
                padding: '8px 14px',
                borderRadius: D.pill,
                background: D.surf2,
                border: `1px solid ${D.border}`,
                color: D.textPrimary,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              📄 Match Brief PDF
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {isLive ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenScorer?.();
                }}
                style={{
                  padding: '8px 20px',
                  borderRadius: D.pill,
                  background: D.gradLive,
                  border: 'none',
                  color: '#fff',
                  fontFamily: D.head,
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Launch Live Broadcast Scorer ↗
              </button>
            ) : (
              <button
                onClick={onClose}
                style={{
                  padding: '8px 20px',
                  borderRadius: D.pill,
                  background: D.indigo,
                  border: 'none',
                  color: '#fff',
                  fontFamily: D.head,
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
