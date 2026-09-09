'use client';

import React, { useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { Theme, Player } from './types';
import { getLatestCommittedAssessment, SkillAssessmentRecord } from './skillsAssessmentData';
import { SKILLS_MATRIX } from './data';

interface PlayerSkillRadarChartProps {
  theme: Theme;
  player: Player;
  assessment?: SkillAssessmentRecord;
  height?: number;
  showBenchmark?: boolean;
  compact?: boolean;
}

export default function PlayerSkillRadarChart({
  theme: D,
  player,
  assessment: propAssessment,
  height = 280,
  showBenchmark = true,
  compact = false,
}: PlayerSkillRadarChartProps) {
  // Fetch latest assessment if not passed explicitly
  const assessment = useMemo(() => {
    if (propAssessment) return propAssessment;
    return getLatestCommittedAssessment(player.id);
  }, [player.id, propAssessment]);

  // Fallback skills matrix data
  const matrixFallback = useMemo(() => {
    return SKILLS_MATRIX[player.id] || null;
  }, [player.id]);

  // Compute radar data points across core skill domains
  const radarData = useMemo(() => {
    const scores = assessment?.scores;

    // 1. Technical - Batting
    let battingScore = 70;
    if (scores?.batting) {
      const vals = Object.values(scores.batting) as number[];
      if (vals.length) battingScore = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    } else if (matrixFallback?.batting) {
      const vals = Object.values(matrixFallback.batting) as number[];
      if (vals.length) battingScore = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    } else if (player.avg) {
      battingScore = Math.min(98, Math.max(50, Math.round(player.avg * 1.6 + (player.sr || 100) * 0.2)));
    }

    // 2. Technical - Bowling
    let bowlingScore = 65;
    if (scores?.bowling) {
      const vals = Object.values(scores.bowling) as number[];
      if (vals.length) bowlingScore = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    } else if (matrixFallback?.bowling) {
      const vals = Object.values(matrixFallback.bowling) as number[];
      if (vals.length) bowlingScore = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    } else if (player.wkts) {
      bowlingScore = Math.min(96, Math.max(52, Math.round(player.wkts * 1.8 + 50)));
    } else if (player.role === 'BAT') {
      bowlingScore = 55;
    }

    // 3. Fielding & Agility
    let fieldingScore = 74;
    if (scores?.fielding) {
      const vals = Object.values(scores.fielding) as number[];
      if (vals.length) fieldingScore = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    } else if (matrixFallback?.fielding) {
      const vals = Object.values(matrixFallback.fielding) as number[];
      if (vals.length) fieldingScore = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    }

    // 4. Tactical & Match IQ
    let tacticalScore = 75;
    if (scores?.tacticalMental?.matchIQ) {
      tacticalScore = scores.tacticalMental.matchIQ;
    } else if (player.cap === 'c' || player.cap === 'vc') {
      tacticalScore = 88;
    }

    // 5. Physical & Athleticism
    let physicalScore = 76;
    if (scores?.physical) {
      const phys = scores.physical;
      const mob = phys.mobilityIndex || 70;
      const tol = phys.weeklyOverTolerance || 65;
      physicalScore = Math.round((mob + tol) / 2);
    }

    // 6. Mental & Composure
    let mentalScore = 72;
    if (scores?.tacticalMental?.pressureComposure) {
      mentalScore = scores.tacticalMental.pressureComposure;
    }

    // Determine age group benchmark
    const ageGroup = player.ageGroupEligibility || assessment?.ageGroup || 'Open';
    const baseBench = ageGroup === 'U14' ? 52 : ageGroup === 'U15' ? 58 : ageGroup === 'U16' ? 65 : 72;

    return [
      {
        attribute: 'Batting Tech',
        fullAttributeName: 'Batting Mechanics & Execution',
        playerScore: battingScore,
        benchmark: baseBench + 2,
        fullMark: 100,
      },
      {
        attribute: 'Bowling Control',
        fullAttributeName: 'Bowling Seam & Line/Length',
        playerScore: bowlingScore,
        benchmark: baseBench - 2,
        fullMark: 100,
      },
      {
        attribute: 'Fielding/Reflexes',
        fullAttributeName: 'Fielding, Catching & Throwing',
        playerScore: fieldingScore,
        benchmark: baseBench + 1,
        fullMark: 100,
      },
      {
        attribute: 'Tactical IQ',
        fullAttributeName: 'Match Situation & Game Reading',
        playerScore: tacticalScore,
        benchmark: baseBench,
        fullMark: 100,
      },
      {
        attribute: 'Physical Power',
        fullAttributeName: 'Aerobic Yo-Yo & Mobility',
        playerScore: physicalScore,
        benchmark: baseBench + 3,
        fullMark: 100,
      },
      {
        attribute: 'Mental Composure',
        fullAttributeName: 'Pressure Composure & Focus',
        playerScore: mentalScore,
        benchmark: baseBench + 1,
        fullMark: 100,
      },
    ];
  }, [assessment, matrixFallback, player]);

  // Primary accent color based on player role or team
  const primaryColor = D.sky || D.emerald || '#38bdf8';
  const benchmarkColor = D.amber || '#f59e0b';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      width: '100%',
    }}>
      {/* Header Info */}
      {!compact && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
              ATHLETE SKILL ATTRIBUTES RADAR
            </div>
            <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted, marginTop: '2px' }}>
              6-Axis Skill Evaluation · POPIA Compliant Assessment Log
            </div>
          </div>
          <span style={{
            fontFamily: D.mono,
            fontSize: '10px',
            padding: '2px 8px',
            borderRadius: D.pill,
            background: `${D.emerald}22`,
            color: D.emerald,
            fontWeight: 700,
            border: `1px solid ${D.emerald}44`,
          }}>
            {assessment ? `Evaluated: ${assessment.window}` : 'Current Rating'}
          </span>
        </div>
      )}

      {/* Recharts Radar Chart */}
      <div style={{ width: '100%', height: `${height}px`, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
            <PolarGrid stroke={D.borderMed || '#333333'} />
            <PolarAngleAxis
              dataKey="attribute"
              tick={{ fill: D.textSecondary || '#cbd5e1', fontSize: 10, fontFamily: D.head, fontWeight: 700 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: D.textMuted || '#64748b', fontSize: 8 }}
              stroke={`${D.border || '#333'}55`}
            />
            <Radar
              name={`${player.name} Rating`}
              dataKey="playerScore"
              stroke={primaryColor}
              fill={primaryColor}
              fillOpacity={0.45}
              dot={{ r: 3, fill: primaryColor }}
            />
            {showBenchmark && (
              <Radar
                name="Age Group Par Benchmark"
                dataKey="benchmark"
                stroke={benchmarkColor}
                fill={benchmarkColor}
                fillOpacity={0.12}
                strokeDasharray="4 4"
                dot={false}
              />
            )}
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0].payload;
                const relIndex = (data.playerScore / data.benchmark).toFixed(2);

                return (
                  <div style={{
                    background: D.surf0 || '#0f172a',
                    border: `1px solid ${D.borderMed || '#334155'}`,
                    padding: '10px 12px',
                    borderRadius: D.md || '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    fontFamily: D.head,
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: D.textPrimary }}>
                      {data.fullAttributeName}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '12px', fontFamily: D.mono }}>
                      <div>
                        <span style={{ color: D.textMuted }}>Athlete: </span>
                        <strong style={{ color: primaryColor }}>{data.playerScore}/100</strong>
                      </div>
                      <div>
                        <span style={{ color: D.textMuted }}>Age Par: </span>
                        <strong style={{ color: benchmarkColor }}>{data.benchmark}/100</strong>
                      </div>
                    </div>
                    <div style={{ marginTop: '4px', fontSize: '10px', color: Number(relIndex) >= 1.05 ? D.emerald : D.textMuted, fontFamily: D.mono }}>
                      Relative Index: {relIndex}x Par ({Number(relIndex) >= 1.05 ? 'Above Par' : 'On Par'})
                    </div>
                  </div>
                );
              }}
            />
            <Legend
              wrapperStyle={{
                fontFamily: D.head,
                fontSize: '11px',
                color: D.textSecondary,
                paddingTop: '6px',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Attribute Summary Grid below chart */}
      {!compact && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '8px',
          marginTop: '4px',
        }}>
          {radarData.map(item => {
            const relIndex = (item.playerScore / item.benchmark).toFixed(2);
            const isAbove = Number(relIndex) >= 1.05;

            return (
              <div
                key={item.attribute}
                style={{
                  padding: '8px 10px',
                  borderRadius: D.sm,
                  background: D.surf2,
                  border: `1px solid ${D.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <div style={{ fontFamily: D.head, fontSize: '10px', fontWeight: 700, color: D.textMuted }}>
                  {item.attribute}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: D.mono, fontSize: '14px', fontWeight: 800, color: primaryColor }}>
                    {item.playerScore}
                  </span>
                  <span style={{
                    fontFamily: D.mono,
                    fontSize: '10px',
                    color: isAbove ? D.emerald : D.textMuted,
                    fontWeight: 700,
                  }}>
                    {relIndex}x Par
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
