"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface SkillsRadarProps {
  skills?: {
    batting: number;
    bowling: number;
    fielding: number;
    fitness: number;
    mental: number;
  };
  data?: any[];
  dataKeys?: string[];
  colors?: string[];
}

export function SkillsRadar({ skills, data: customData, dataKeys = ['A'], colors = ['var(--color-primary)'] }: SkillsRadarProps) {
  const data = customData || (skills ? [
    { subject: 'Batting', A: skills.batting, fullMark: 20 },
    { subject: 'Bowling', A: skills.bowling, fullMark: 20 },
    { subject: 'Fielding', A: skills.fielding, fullMark: 20 },
    { subject: 'Fitness', A: skills.fitness, fullMark: 20 },
    { subject: 'Mental', A: skills.mental, fullMark: 20 },
  ] : []);

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 20]} tick={false} axisLine={false} />
          {dataKeys.map((key, index) => (
            <Radar
              key={key}
              name={key}
              dataKey={key}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={0.3}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
