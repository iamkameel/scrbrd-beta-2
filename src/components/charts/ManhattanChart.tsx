"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Innings, Over } from '@/types/firestore';

interface ManhattanChartProps {
  innings: Innings;
  color?: string;
}

export function ManhattanChart({ innings, color = '#10b981' }: ManhattanChartProps) {
  const data = (innings.overHistory || []).map((over: Over) => ({
    over: over.overNumber,
    runs: over.runsConceded,
    wickets: over.wicketsTaken
  }));

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="over" 
            tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} 
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--color-background)', 
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'var(--color-text)'
            }}
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          />
          <Bar dataKey="runs" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.wickets > 0 ? '#ef4444' : color} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
