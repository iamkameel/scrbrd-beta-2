'use client';

import React, { useState, useMemo } from 'react';
import { Theme, MatchScorecard, InningsScorecard, BattingEntry, BowlingEntry } from './types';

interface ScorecardWagonHeatmapViewProps {
  theme: Theme;
  scorecard: MatchScorecard;
  activeInnings: 1 | 2;
}

interface PlayerShotPoint {
  id: string;
  x: number; // -1 to 1 on ground
  y: number; // -1 to 1 on ground
  runs: number;
  isWicket?: boolean;
  shotType: string;
  sector: string;
  side: 'OFF' | 'LEG';
  distanceMeters: number;
  pitchLength: 'yorker' | 'full' | 'good_length' | 'back_of_length' | 'short';
  pitchLine: 'outside_off' | 'off_stump' | 'middle' | 'leg_stump' | 'down_leg';
  pace: string;
}

export default function ScorecardWagonHeatmapView({
  theme: D,
  scorecard,
  activeInnings,
}: ScorecardWagonHeatmapViewProps) {
  const currentInnings: InningsScorecard =
    activeInnings === 1 ? scorecard.innings1 : (scorecard.innings2 || scorecard.innings1);

  // Selected player ID or null for entire team
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [playerType, setPlayerType] = useState<'all' | 'batter' | 'bowler'>('all');
  const [activeVisualizer, setActiveVisualizer] = useState<'both' | 'wagon' | 'pitchmap'>('both');
  const [shotFilter, setShotFilter] = useState<'all' | 'boundaries' | 'singles' | 'wickets'>('all');

  // Synthetic deterministic shot database for all batters and bowlers in the scorecard
  const matchShotsDatabase = useMemo(() => {
    const map: Record<string, PlayerShotPoint[]> = {};

    // Seed shots for each batter
    currentInnings.batting.forEach((batter, bIdx) => {
      const shots: PlayerShotPoint[] = [];
      const totalBalls = Math.max(batter.balls, 1);
      const totalRuns = batter.runs;
      const fours = batter.fours;
      const sixes = batter.sixes;

      // Deterministic pseudo-random generation based on player name and index
      let remainingRuns = totalRuns - (fours * 4 + sixes * 6);
      let runIndex = 0;

      // Generate 6s
      for (let i = 0; i < sixes; i++) {
        const angle = ((bIdx * 47 + i * 73 + 120) % 360) * (Math.PI / 180);
        const radius = 0.88 + (i % 3) * 0.04;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        const side = x < 0 ? 'OFF' : 'LEG';
        const sector = x < -0.4 ? 'Deep Extra Cover' : x < 0 ? 'Long Off' : x < 0.4 ? 'Long On' : 'Deep Midwicket';
        shots.push({
          id: `${batter.id}_6_${i}`,
          x,
          y,
          runs: 6,
          shotType: i % 2 === 0 ? 'Lofted Drive' : 'Pull Shot',
          sector,
          side,
          distanceMeters: 82 + (i * 4) % 15,
          pitchLength: i % 2 === 0 ? 'full' : 'short',
          pitchLine: i % 2 === 0 ? 'middle' : 'outside_off',
          pace: '138 km/h',
        });
      }

      // Generate 4s
      for (let i = 0; i < fours; i++) {
        const angle = ((bIdx * 31 + i * 59 + 45) % 360) * (Math.PI / 180);
        const radius = 0.82 + (i % 3) * 0.05;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        const side = x < 0 ? 'OFF' : 'LEG';
        const sector = x < -0.5 ? 'Cover Point' : x < -0.1 ? 'Extra Cover' : x < 0.3 ? 'Square Leg' : 'Fine Leg';
        shots.push({
          id: `${batter.id}_4_${i}`,
          x,
          y,
          runs: 4,
          shotType: i % 3 === 0 ? 'Cover Drive' : i % 3 === 1 ? 'Square Cut' : 'Sweep Shot',
          sector,
          side,
          distanceMeters: 68 + (i * 3) % 12,
          pitchLength: i % 3 === 0 ? 'full' : i % 3 === 1 ? 'back_of_length' : 'good_length',
          pitchLine: i % 2 === 0 ? 'outside_off' : 'off_stump',
          pace: '134 km/h',
        });
      }

      // Generate 1s, 2s, dots
      const otherBalls = Math.max(0, totalBalls - fours - sixes);
      for (let i = 0; i < Math.min(otherBalls, 30); i++) {
        const isRun = remainingRuns > 0 && i % 2 === 0;
        const runVal = isRun ? (remainingRuns >= 2 && i % 3 === 0 ? 2 : 1) : 0;
        if (isRun) remainingRuns -= runVal;

        const angle = ((bIdx * 19 + i * 29 + 15) % 360) * (Math.PI / 180);
        const radius = runVal > 0 ? 0.35 + (i % 5) * 0.08 : 0.15 + (i % 3) * 0.05;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        const side = x < 0 ? 'OFF' : 'LEG';
        const sector = x < -0.3 ? 'Point' : x < 0 ? 'Cover' : x < 0.3 ? 'Mid-On' : 'Square Leg';

        shots.push({
          id: `${batter.id}_singles_${i}`,
          x,
          y,
          runs: runVal,
          shotType: runVal === 0 ? 'Forward Defence' : i % 2 === 0 ? 'Push & Run' : 'Flick',
          sector,
          side,
          distanceMeters: Math.round(radius * 75),
          pitchLength: i % 4 === 0 ? 'yorker' : i % 4 === 1 ? 'good_length' : i % 4 === 2 ? 'back_of_length' : 'full',
          pitchLine: i % 3 === 0 ? 'off_stump' : i % 3 === 1 ? 'middle' : 'leg_stump',
          pace: '131 km/h',
        });
      }

      // If out, add wicket ball
      if (!batter.isNotOut) {
        shots.push({
          id: `${batter.id}_wkt`,
          x: 0.35,
          y: -0.45,
          runs: 0,
          isWicket: true,
          shotType: 'Edged / Miscued',
          sector: 'Slip / Wicketkeeper',
          side: 'OFF',
          distanceMeters: 22,
          pitchLength: 'good_length',
          pitchLine: 'outside_off',
          pace: '141 km/h',
        });
      }

      map[batter.id] = shots;
    });

    // Seed balls for bowlers
    currentInnings.bowling.forEach((bowler, bwIdx) => {
      const bowlerShots: PlayerShotPoint[] = [];
      const oversVal = parseFloat(bowler.overs) || 3;
      const totalBalls = Math.round(oversVal * 6);
      const wickets = bowler.wickets;
      const runs = bowler.runs;

      for (let i = 0; i < totalBalls; i++) {
        const isWkt = i < wickets;
        const isBoundary = !isWkt && (i % 6 === 0 && runs > 15);
        const runVal = isWkt ? 0 : isBoundary ? (i % 12 === 0 ? 6 : 4) : (i % 3 === 0 ? 1 : 0);

        const angle = ((bwIdx * 41 + i * 37 + 60) % 360) * (Math.PI / 180);
        const radius = runVal >= 4 ? 0.85 : runVal > 0 ? 0.45 : 0.2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        const side = x < 0 ? 'OFF' : 'LEG';
        const sector = x < -0.3 ? 'Point' : x < 0 ? 'Cover' : x < 0.3 ? 'Midwicket' : 'Fine Leg';

        const lengthList: Array<'yorker' | 'full' | 'good_length' | 'back_of_length' | 'short'> = [
          'good_length',
          'good_length',
          'full',
          'back_of_length',
          'yorker',
          'short',
        ];
        const lineList: Array<'outside_off' | 'off_stump' | 'middle' | 'leg_stump' | 'down_leg'> = [
          'outside_off',
          'off_stump',
          'middle',
          'off_stump',
          'leg_stump',
        ];

        bowlerShots.push({
          id: `${bowler.id}_ball_${i}`,
          x,
          y,
          runs: runVal,
          isWicket: isWkt,
          shotType: isWkt ? 'Wicket Ball' : runVal >= 4 ? 'Boundary Conceded' : runVal === 0 ? 'Dot Ball' : 'Single',
          sector,
          side,
          distanceMeters: Math.round(radius * 75),
          pitchLength: lengthList[i % lengthList.length],
          pitchLine: lineList[(i + bwIdx) % lineList.length],
          pace: `${125 + (bwIdx * 6 + i) % 18} km/h`,
        });
      }

      map[bowler.id] = bowlerShots;
    });

    return map;
  }, [currentInnings]);

  // Selected player info
  const selectedBatter = useMemo(
    () => currentInnings.batting.find(b => b.id === selectedPlayerId),
    [currentInnings, selectedPlayerId]
  );
  const selectedBowler = useMemo(
    () => currentInnings.bowling.find(b => b.id === selectedPlayerId),
    [currentInnings, selectedPlayerId]
  );

  // Active shots to display (filtered by selected player and filter toggles)
  const activeShots = useMemo(() => {
    let list: PlayerShotPoint[] = [];

    if (selectedPlayerId) {
      list = matchShotsDatabase[selectedPlayerId] || [];
    } else {
      // Aggregate entire team shots
      Object.values(matchShotsDatabase).forEach(arr => {
        list.push(...arr);
      });
    }

    if (shotFilter === 'boundaries') {
      return list.filter(s => s.runs >= 4);
    }
    if (shotFilter === 'singles') {
      return list.filter(s => s.runs > 0 && s.runs < 4);
    }
    if (shotFilter === 'wickets') {
      return list.filter(s => s.isWicket);
    }

    return list;
  }, [selectedPlayerId, matchShotsDatabase, shotFilter]);

  // Sector breakdown calculations
  const sectorSummary = useMemo(() => {
    const sectors: Record<string, { runs: number; shots: number; boundaries: number; side: 'OFF' | 'LEG' }> = {
      'Third Man': { runs: 0, shots: 0, boundaries: 0, side: 'OFF' },
      'Point': { runs: 0, shots: 0, boundaries: 0, side: 'OFF' },
      'Cover': { runs: 0, shots: 0, boundaries: 0, side: 'OFF' },
      'Mid-Off': { runs: 0, shots: 0, boundaries: 0, side: 'OFF' },
      'Mid-On': { runs: 0, shots: 0, boundaries: 0, side: 'LEG' },
      'Midwicket': { runs: 0, shots: 0, boundaries: 0, side: 'LEG' },
      'Square Leg': { runs: 0, shots: 0, boundaries: 0, side: 'LEG' },
      'Fine Leg': { runs: 0, shots: 0, boundaries: 0, side: 'LEG' },
    };

    let totalRuns = 0;
    let offRuns = 0;
    let legRuns = 0;

    activeShots.forEach(s => {
      totalRuns += s.runs;
      if (s.side === 'OFF') offRuns += s.runs;
      else legRuns += s.runs;

      let key = 'Cover';
      if (s.sector.includes('Point')) key = 'Point';
      else if (s.sector.includes('Third Man') || s.sector.includes('Slip')) key = 'Third Man';
      else if (s.sector.includes('Cover')) key = 'Cover';
      else if (s.sector.includes('Mid-Off') || s.sector.includes('Long Off')) key = 'Mid-Off';
      else if (s.sector.includes('Mid-On') || s.sector.includes('Long On')) key = 'Mid-On';
      else if (s.sector.includes('Midwicket') || s.sector.includes('Cow Corner')) key = 'Midwicket';
      else if (s.sector.includes('Square Leg')) key = 'Square Leg';
      else if (s.sector.includes('Fine Leg')) key = 'Fine Leg';

      if (sectors[key]) {
        sectors[key].runs += s.runs;
        sectors[key].shots += 1;
        if (s.runs >= 4) sectors[key].boundaries += 1;
      }
    });

    return {
      sectors,
      totalRuns,
      offRuns,
      legRuns,
      offPct: totalRuns > 0 ? Math.round((offRuns / totalRuns) * 100) : 50,
      legPct: totalRuns > 0 ? Math.round((legRuns / totalRuns) * 100) : 50,
    };
  }, [activeShots]);

  // Pitch length distribution summary
  const pitchSummary = useMemo(() => {
    const lengths = {
      yorker: { count: 0, runs: 0, wickets: 0, label: 'Yorker (0-2m)' },
      full: { count: 0, runs: 0, wickets: 0, label: 'Full (2-6m)' },
      good_length: { count: 0, runs: 0, wickets: 0, label: 'Good Length (6-8m)' },
      back_of_length: { count: 0, runs: 0, wickets: 0, label: 'Back of Length (8-10m)' },
      short: { count: 0, runs: 0, wickets: 0, label: 'Short Pitch (10m+)' },
    };

    activeShots.forEach(s => {
      if (lengths[s.pitchLength]) {
        lengths[s.pitchLength].count += 1;
        lengths[s.pitchLength].runs += s.runs;
        if (s.isWicket) lengths[s.pitchLength].wickets += 1;
      }
    });

    return lengths;
  }, [activeShots]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Banner: Overview & View Options */}
      <div
        style={{
          padding: '14px 18px',
          background: D.surf0,
          borderRadius: D.lg,
          border: `1px solid ${D.borderMed}`,
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
                background: `${D.emerald}20`,
                color: D.emerald,
                fontFamily: D.mono,
                fontSize: '10px',
                fontWeight: 800,
                border: `1px solid ${D.emerald}40`,
              }}
            >
              🎯 SPATIAL INTELLIGENCE & TELEMETRY
            </span>
            <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
              Innings {currentInnings.inningsNumber} · {currentInnings.teamName}
            </span>
          </div>
          <h3 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, margin: '4px 0 0 0' }}>
            {selectedBatter
              ? `Batter Dossier: ${selectedBatter.name} (${selectedBatter.runs} runs, ${selectedBatter.balls} balls)`
              : selectedBowler
              ? `Bowler Dossier: ${selectedBowler.name} (${selectedBowler.overs} ov, ${selectedBowler.wickets}w/${selectedBowler.runs}r)`
              : `Team Wagon Wheel & Pitch Heatmaps — ${currentInnings.teamName}`}
          </h3>
        </div>

        {/* View Layout Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', background: D.surf2, borderRadius: D.pill, padding: '3px', border: `1px solid ${D.border}` }}>
            {[
              { id: 'both', label: '📊 Dual View' },
              { id: 'wagon', label: '🎯 Wagon Wheel' },
              { id: 'pitchmap', label: '🌿 Pitch Heatmap' },
            ].map(v => (
              <button
                key={v.id}
                onClick={() => setActiveVisualizer(v.id as any)}
                style={{
                  padding: '4px 10px',
                  borderRadius: D.pill,
                  border: 'none',
                  background: activeVisualizer === v.id ? D.indigo : 'transparent',
                  color: activeVisualizer === v.id ? '#fff' : D.textMuted,
                  fontFamily: D.head,
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Shot Filtering */}
          <div style={{ display: 'flex', background: D.surf2, borderRadius: D.pill, padding: '3px', border: `1px solid ${D.border}` }}>
            {[
              { id: 'all', label: 'All Balls' },
              { id: 'boundaries', label: '4s & 6s' },
              { id: 'singles', label: '1s & 2s' },
              { id: 'wickets', label: 'Wickets' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setShotFilter(f.id as any)}
                style={{
                  padding: '4px 8px',
                  borderRadius: D.pill,
                  border: 'none',
                  background: shotFilter === f.id ? (f.id === 'boundaries' ? D.amber : f.id === 'wickets' ? D.rose : D.sky) : 'transparent',
                  color: shotFilter === f.id ? '#000' : D.textMuted,
                  fontFamily: D.head,
                  fontSize: '10px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PLAYER SELECTOR ROSTER CAROUSEL / CHIPS */}
      <div
        style={{
          background: D.surf1,
          borderRadius: D.lg,
          border: `1px solid ${D.border}`,
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.textPrimary }}>
              👤 SELECT PLAYER TO INSPECT INDIVIDUAL WAGON & HEATMAP:
            </span>
          </div>

          {/* Player Type Switcher */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setPlayerType('all')}
              style={{
                padding: '2px 8px',
                borderRadius: D.sm,
                background: playerType === 'all' ? D.surf3 : 'transparent',
                border: `1px solid ${playerType === 'all' ? D.borderMed : 'transparent'}`,
                color: playerType === 'all' ? D.textPrimary : D.textMuted,
                fontFamily: D.mono,
                fontSize: '10px',
                cursor: 'pointer',
              }}
            >
              All Players
            </button>
            <button
              onClick={() => setPlayerType('batter')}
              style={{
                padding: '2px 8px',
                borderRadius: D.sm,
                background: playerType === 'batter' ? `${D.sky}25` : 'transparent',
                border: `1px solid ${playerType === 'batter' ? D.sky : 'transparent'}`,
                color: playerType === 'batter' ? D.sky : D.textMuted,
                fontFamily: D.mono,
                fontSize: '10px',
                cursor: 'pointer',
              }}
            >
              🏏 Batters Only
            </button>
            <button
              onClick={() => setPlayerType('bowler')}
              style={{
                padding: '2px 8px',
                borderRadius: D.sm,
                background: playerType === 'bowler' ? `${D.violet}25` : 'transparent',
                border: `1px solid ${playerType === 'bowler' ? D.violet : 'transparent'}`,
                color: playerType === 'bowler' ? D.violet : D.textMuted,
                fontFamily: D.mono,
                fontSize: '10px',
                cursor: 'pointer',
              }}
            >
              🎯 Bowlers Only
            </button>
          </div>
        </div>

        {/* Scrollable Player Chips */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {/* Entire Team Option */}
          <button
            onClick={() => setSelectedPlayerId(null)}
            style={{
              padding: '6px 14px',
              borderRadius: D.pill,
              background: selectedPlayerId === null ? D.emerald : D.surf2,
              border: `1px solid ${selectedPlayerId === null ? D.emerald : D.border}`,
              color: selectedPlayerId === null ? '#000' : D.textPrimary,
              fontFamily: D.head,
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>👥 Entire Team Overview</span>
            <span
              style={{
                padding: '1px 6px',
                borderRadius: D.pill,
                background: selectedPlayerId === null ? 'rgba(0,0,0,0.2)' : D.surf3,
                fontSize: '9px',
                fontFamily: D.mono,
              }}
            >
              {currentInnings.totalRuns}/{currentInnings.totalWickets}
            </span>
          </button>

          {/* Batters */}
          {(playerType === 'all' || playerType === 'batter') &&
            currentInnings.batting.map(b => {
              const isSelected = selectedPlayerId === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedPlayerId(b.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: D.pill,
                    background: isSelected ? D.sky : D.surf2,
                    border: `1px solid ${isSelected ? D.sky : D.border}`,
                    color: isSelected ? '#000' : D.textPrimary,
                    fontFamily: D.head,
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>🏏 {b.name}</span>
                  <span
                    style={{
                      padding: '1px 6px',
                      borderRadius: D.pill,
                      background: isSelected ? 'rgba(0,0,0,0.2)' : `${D.sky}20`,
                      color: isSelected ? '#000' : D.sky,
                      fontSize: '10px',
                      fontFamily: D.mono,
                      fontWeight: 800,
                    }}
                  >
                    {b.runs} ({b.balls})
                  </span>
                </button>
              );
            })}

          {/* Bowlers */}
          {(playerType === 'all' || playerType === 'bowler') &&
            currentInnings.bowling.map(bw => {
              const isSelected = selectedPlayerId === bw.id;
              return (
                <button
                  key={bw.id}
                  onClick={() => setSelectedPlayerId(bw.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: D.pill,
                    background: isSelected ? D.violet : D.surf2,
                    border: `1px solid ${isSelected ? D.violet : D.border}`,
                    color: isSelected ? '#fff' : D.textPrimary,
                    fontFamily: D.head,
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>🎯 {bw.name}</span>
                  <span
                    style={{
                      padding: '1px 6px',
                      borderRadius: D.pill,
                      background: isSelected ? 'rgba(255,255,255,0.2)' : `${D.violet}20`,
                      color: isSelected ? '#fff' : D.violet,
                      fontSize: '10px',
                      fontFamily: D.mono,
                      fontWeight: 800,
                    }}
                  >
                    {bw.wickets}w / {bw.runs}r
                  </span>
                </button>
              );
            })}
        </div>
      </div>

      {/* SELECTED PLAYER STATS SUMMARY CARD (IF PLAYER SELECTED) */}
      {(selectedBatter || selectedBowler) && (
        <div
          style={{
            padding: '14px 18px',
            background: D.surf2,
            borderRadius: D.lg,
            border: `1px solid ${selectedBatter ? D.sky : D.violet}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {selectedBatter && (
            <>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800 }}>
                    {selectedBatter.name}
                  </span>
                  <span style={{ padding: '2px 8px', borderRadius: D.pill, background: selectedBatter.isNotOut ? `${D.emerald}25` : `${D.rose}25`, color: selectedBatter.isNotOut ? D.emerald : D.rose, fontSize: '10px', fontFamily: D.mono, fontWeight: 800 }}>
                    {selectedBatter.isNotOut ? 'NOT OUT' : selectedBatter.dismissal}
                  </span>
                </div>
                <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted, marginTop: '2px' }}>
                  Position #{selectedBatter.battingPos || 1} · Control: ~86% · Scoring Shots: {selectedBatter.fours + selectedBatter.sixes + 8}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 900, color: D.textPrimary }}>
                    {selectedBatter.runs}
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>RUNS ({selectedBatter.balls}b)</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 900, color: D.emerald }}>
                    {selectedBatter.sr.toFixed(1)}
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>STRIKE RATE</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 900, color: D.amber }}>
                    {selectedBatter.fours}
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>FOURS</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 900, color: D.violet }}>
                    {selectedBatter.sixes}
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>SIXES</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 900, color: D.sky }}>
                    {selectedBatter.runs > 0 ? Math.round(((selectedBatter.fours * 4 + selectedBatter.sixes * 6) / selectedBatter.runs) * 100) : 0}%
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>BOUNDARIES %</div>
                </div>
              </div>
            </>
          )}

          {selectedBowler && (
            <>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800 }}>
                    {selectedBowler.name}
                  </span>
                  <span style={{ padding: '2px 8px', borderRadius: D.pill, background: `${D.violet}25`, color: D.violet, fontSize: '10px', fontFamily: D.mono, fontWeight: 800 }}>
                    BOWLING METRICS
                  </span>
                </div>
                <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted, marginTop: '2px' }}>
                  Dot Ball %: {selectedBowler.overs ? Math.round((selectedBowler.dots / (parseFloat(selectedBowler.overs) * 6)) * 100) : 0}% · Wickets: {selectedBowler.wickets}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 900, color: D.textPrimary }}>
                    {selectedBowler.overs}
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>OVERS ({selectedBowler.maidens}m)</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 900, color: D.rose }}>
                    {selectedBowler.wickets}
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>WICKETS</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 900, color: D.amber }}>
                    {selectedBowler.runs}
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>RUNS CONCEDED</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 900, color: D.emerald }}>
                    {selectedBowler.economy.toFixed(2)}
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>ECONOMY</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 900, color: D.sky }}>
                    {selectedBowler.dots}
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>DOT BALLS</div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* MAIN VISUALIZATION GRID: WAGON WHEEL & 2D PITCH HEATMAP */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: activeVisualizer === 'both' ? '1fr 1fr' : '1fr',
          gap: '16px',
        }}
      >
        {/* 1. 360° WAGON WHEEL VISUALIZER */}
        {(activeVisualizer === 'both' || activeVisualizer === 'wagon') && (
          <div
            style={{
              background: D.surf1,
              borderRadius: D.lg,
              border: `1px solid ${D.border}`,
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
                  🎯 360° WAGON WHEEL (GROUND DISTRIBUTION)
                </span>
                <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                  {selectedPlayerId ? `Shot trajectories for ${selectedBatter?.name || selectedBowler?.name}` : 'All team shot trajectories'}
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: '8px', fontSize: '10px', fontFamily: D.mono }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: D.violet }}></span> 6s
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: D.emerald }}></span> 4s
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: D.sky }}></span> 1s/2s
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: D.rose }}></span> Wkt
                </span>
              </div>
            </div>

            {/* SVG Wagon Wheel Radar */}
            <div style={{ position: 'relative', width: '100%', height: '340px', background: '#070b13', borderRadius: D.md, overflow: 'hidden', border: `1px solid ${D.border}` }}>
              <svg width="100%" height="100%" viewBox="-120 -120 240 240">
                {/* Outfield Grass Circle */}
                <circle cx="0" cy="0" r="105" fill="#0c1816" stroke="#163830" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="88" fill="none" stroke="#163830" strokeWidth="1" strokeDasharray="3 3" />
                {/* Infield 30-Yard Circle */}
                <circle cx="0" cy="0" r="50" fill="none" stroke="#225545" strokeWidth="1.2" strokeDasharray="4 4" />
                {/* Pitch Rectangle in Center */}
                <rect x="-5" y="-12" width="10" height="24" fill="#695738" rx="1.5" />
                <line x1="-3" y1="-10" x2="3" y2="-10" stroke="#fff" strokeWidth="1" />
                <line x1="-3" y1="10" x2="3" y2="10" stroke="#fff" strokeWidth="1" />

                {/* Sector Dividers */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
                  const rad = (deg * Math.PI) / 180;
                  return (
                    <line
                      key={deg}
                      x1="0"
                      y1="0"
                      x2={105 * Math.cos(rad)}
                      y2={105 * Math.sin(rad)}
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Shot Vector Trajectories */}
                {activeShots.map(shot => {
                  const targetX = shot.x * 100;
                  const targetY = shot.y * 100;
                  const strokeColor = shot.isWicket
                    ? D.rose
                    : shot.runs === 6
                    ? D.violet
                    : shot.runs === 4
                    ? D.emerald
                    : shot.runs > 0
                    ? D.sky
                    : 'rgba(255,255,255,0.2)';

                  return (
                    <g key={shot.id}>
                      <line
                        x1="0"
                        y1="0"
                        x2={targetX}
                        y2={targetY}
                        stroke={strokeColor}
                        strokeWidth={shot.runs >= 4 ? 2.2 : 1.2}
                        strokeOpacity={shot.runs >= 4 ? 0.9 : 0.6}
                      />
                      <circle
                        cx={targetX}
                        cy={targetY}
                        r={shot.isWicket ? 4 : shot.runs === 6 ? 4.5 : shot.runs === 4 ? 3.5 : 2.5}
                        fill={strokeColor}
                      />
                    </g>
                  );
                })}

                {/* Ground Sector Labels */}
                <text x="0" y="-108" fill={D.textMuted} fontSize="7" fontFamily={D.mono} textAnchor="middle">STRAIGHT / LONG-OFF / LONG-ON</text>
                <text x="-110" y="0" fill={D.sky} fontSize="7" fontFamily={D.mono} textAnchor="start">OFF-SIDE (COVER/POINT)</text>
                <text x="110" y="0" fill={D.emerald} fontSize="7" fontFamily={D.mono} textAnchor="end">LEG-SIDE (MIDWICKET)</text>
                <text x="0" y="112" fill={D.textMuted} fontSize="7" fontFamily={D.mono} textAnchor="middle">THIRD MAN / FINE LEG</text>
              </svg>
            </div>

            {/* Off vs Leg Balance Meter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: D.mono }}>
                <span style={{ color: D.sky }}>OFF-SIDE: {sectorSummary.offRuns} R ({sectorSummary.offPct}%)</span>
                <span style={{ color: D.emerald }}>LEG-SIDE: {sectorSummary.legRuns} R ({sectorSummary.legPct}%)</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: D.surf2, borderRadius: D.pill, overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${sectorSummary.offPct}%`, background: D.sky, transition: 'width 0.3s ease' }} />
                <div style={{ width: `${sectorSummary.legPct}%`, background: D.emerald, transition: 'width 0.3s ease' }} />
              </div>
            </div>

            {/* Sector Breakdown Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px' }}>
              {Object.entries(sectorSummary.sectors).map(([sec, data]) => (
                <div
                  key={sec}
                  style={{
                    padding: '6px 10px',
                    background: D.surf2,
                    borderRadius: D.sm,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '11px',
                  }}
                >
                  <span style={{ fontFamily: D.body, color: D.textPrimary }}>{sec}</span>
                  <span style={{ fontFamily: D.mono, fontWeight: 700, color: data.side === 'OFF' ? D.sky : D.emerald }}>
                    {data.runs}r ({data.boundaries}x 4/6)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. 2D PITCH LENGTH & LINE HEATMAP */}
        {(activeVisualizer === 'both' || activeVisualizer === 'pitchmap') && (
          <div
            style={{
              background: D.surf1,
              borderRadius: D.lg,
              border: `1px solid ${D.border}`,
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
                  🌿 2D PITCH DELIVERY HEATMAP (LENGTH & LINE)
                </span>
                <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                  Delivery landing clusters mapped across cricket pitch zones
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', fontSize: '10px', fontFamily: D.mono }}>
                <span style={{ background: `${D.emerald}20`, color: D.emerald, padding: '2px 6px', borderRadius: D.sm }}>Good Length</span>
                <span style={{ background: `${D.sky}20`, color: D.sky, padding: '2px 6px', borderRadius: D.sm }}>Full</span>
                <span style={{ background: `${D.amber}20`, color: D.amber, padding: '2px 6px', borderRadius: D.sm }}>Short</span>
              </div>
            </div>

            {/* Pitch 2D SVG Visualizer */}
            <div style={{ position: 'relative', width: '100%', height: '340px', background: '#0a1017', borderRadius: D.md, overflow: 'hidden', border: `1px solid ${D.border}` }}>
              <svg width="100%" height="100%" viewBox="0 0 200 320" preserveAspectRatio="none">
                {/* Turf Pitch Base */}
                <rect x="25" y="20" width="150" height="280" fill="#2d2212" stroke="#4a3b22" strokeWidth="2" rx="3" />

                {/* Stumps & Creases */}
                {/* Bowling Crease (Top) */}
                <line x1="25" y1="50" x2="175" y2="50" stroke="#ffffff" strokeWidth="1.5" />
                {/* Bowling Stumps (Top) */}
                <circle cx="95" cy="48" r="2" fill="#fff" />
                <circle cx="100" cy="48" r="2" fill="#fff" />
                <circle cx="105" cy="48" r="2" fill="#fff" />

                {/* Popping Crease (Bottom - Batting End) */}
                <line x1="25" y1="270" x2="175" y2="270" stroke="#ffffff" strokeWidth="2" />
                {/* Batting Stumps (Bottom) */}
                <circle cx="95" cy="272" r="2.5" fill="#f59e0b" />
                <circle cx="100" cy="272" r="2.5" fill="#f59e0b" />
                <circle cx="105" cy="272" r="2.5" fill="#f59e0b" />

                {/* Length Zone Dividers */}
                {/* Short Length: y 60 - 110 */}
                <rect x="26" y="60" width="148" height="50" fill="rgba(244, 63, 94, 0.08)" />
                <line x1="26" y1="110" x2="174" y2="110" stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
                <text x="32" y="85" fill={D.rose} fontSize="8" fontFamily={D.mono}>SHORT PITCH</text>

                {/* Back of Length: y 110 - 160 */}
                <rect x="26" y="110" width="148" height="50" fill="rgba(245, 158, 11, 0.08)" />
                <line x1="26" y1="160" x2="174" y2="160" stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
                <text x="32" y="135" fill={D.amber} fontSize="8" fontFamily={D.mono}>BACK OF LENGTH</text>

                {/* Good Length: y 160 - 220 */}
                <rect x="26" y="160" width="148" height="60" fill="rgba(16, 185, 129, 0.12)" />
                <line x1="26" y1="220" x2="174" y2="220" stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
                <text x="32" y="190" fill={D.emerald} fontSize="8" fontFamily={D.mono} fontWeight="bold">GOOD LENGTH ZONE</text>

                {/* Full Pitch: y 220 - 260 */}
                <rect x="26" y="220" width="148" height="40" fill="rgba(56, 189, 248, 0.1)" />
                <line x1="26" y1="260" x2="174" y2="260" stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
                <text x="32" y="240" fill={D.sky} fontSize="8" fontFamily={D.mono}>FULL</text>

                {/* Yorker: y 260 - 275 */}
                <rect x="26" y="260" width="148" height="15" fill="rgba(139, 92, 246, 0.15)" />
                <text x="32" y="268" fill={D.violet} fontSize="7" fontFamily={D.mono}>YORKER</text>

                {/* Line markers (Vertical grid lines) */}
                <line x1="70" y1="50" x2="70" y2="270" stroke="rgba(255,255,255,0.06)" />
                <line x1="88" y1="50" x2="88" y2="270" stroke="rgba(255,255,255,0.06)" />
                <line x1="100" y1="50" x2="100" y2="270" stroke="rgba(255,255,255,0.12)" />
                <line x1="112" y1="50" x2="112" y2="270" stroke="rgba(255,255,255,0.06)" />
                <line x1="130" y1="50" x2="130" y2="270" stroke="rgba(255,255,255,0.06)" />

                {/* Ball Landing Heatmap Dots */}
                {activeShots.map(shot => {
                  let yPos = 190;
                  if (shot.pitchLength === 'yorker') yPos = 265;
                  else if (shot.pitchLength === 'full') yPos = 238;
                  else if (shot.pitchLength === 'good_length') yPos = 188;
                  else if (shot.pitchLength === 'back_of_length') yPos = 135;
                  else if (shot.pitchLength === 'short') yPos = 85;

                  // Add slight jitter for heatmap realism
                  const jitterY = ((parseInt(shot.id.replace(/\D/g, '0')) || 1) % 9) - 4;
                  yPos += jitterY;

                  let xPos = 100;
                  if (shot.pitchLine === 'outside_off') xPos = 65;
                  else if (shot.pitchLine === 'off_stump') xPos = 88;
                  else if (shot.pitchLine === 'middle') xPos = 100;
                  else if (shot.pitchLine === 'leg_stump') xPos = 112;
                  else if (shot.pitchLine === 'down_leg') xPos = 135;

                  const jitterX = ((parseInt(shot.id.replace(/\D/g, '0')) || 3) % 7) - 3;
                  xPos += jitterX;

                  const dotColor = shot.isWicket
                    ? D.rose
                    : shot.runs >= 4
                    ? D.amber
                    : shot.runs > 0
                    ? D.sky
                    : D.emerald;

                  return (
                    <g key={shot.id}>
                      {/* Glow halo for heatmap density effect */}
                      <circle cx={xPos} cy={yPos} r="7" fill={dotColor} fillOpacity="0.25" />
                      <circle cx={xPos} cy={yPos} r="3" fill={dotColor} stroke="#000" strokeWidth="0.5" />
                    </g>
                  );
                })}

                <text x="65" y="295" fill={D.textMuted} fontSize="6" fontFamily={D.mono} textAnchor="middle">OUTSIDE OFF</text>
                <text x="100" y="295" fill={D.textMuted} fontSize="6" fontFamily={D.mono} textAnchor="middle">STUMPS</text>
                <text x="135" y="295" fill={D.textMuted} fontSize="6" fontFamily={D.mono} textAnchor="middle">LEG SIDE</text>
              </svg>
            </div>

            {/* Pitch Length Breakdown Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {Object.entries(pitchSummary).map(([k, p]) => (
                <div
                  key={k}
                  style={{
                    padding: '6px 10px',
                    background: D.surf2,
                    borderRadius: D.sm,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '11px',
                  }}
                >
                  <span style={{ fontFamily: D.body, color: D.textPrimary }}>{p.label}</span>
                  <div style={{ display: 'flex', gap: '8px', fontFamily: D.mono }}>
                    <span style={{ color: D.textSecondary }}>{p.count} balls</span>
                    <span style={{ color: D.amber, fontWeight: 700 }}>{p.runs} runs</span>
                    {p.wickets > 0 && <span style={{ color: D.rose, fontWeight: 800 }}>({p.wickets}w)</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
