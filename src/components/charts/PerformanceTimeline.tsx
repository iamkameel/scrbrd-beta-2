"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformanceTimelineProps {
  history: {
    matchId: string;
    date: string;
    runs?: number;
    wickets?: number;
    opponent: string;
  }[];
}

export function PerformanceTimeline({ history }: PerformanceTimelineProps) {
  // Sort by date
  const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={sortedHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} 
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
          />
          <YAxis 
            yAxisId="left"
            tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
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
            labelFormatter={(date) => new Date(date).toLocaleDateString()}
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="runs" 
            stroke="#10b981" 
            strokeWidth={2} 
            dot={{ r: 4 }} 
            activeDot={{ r: 6 }}
            name="Runs"
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="wickets" 
            stroke="#ef4444" 
            strokeWidth={2} 
            dot={{ r: 4 }} 
            activeDot={{ r: 6 }}
            name="Wickets"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
