"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Innings, Over } from '@/types/firestore';

interface WormChartProps {
  innings1: Innings;
  innings2?: Innings;
  team1Name: string;
  team2Name: string;
  color1?: string;
  color2?: string;
}

export function WormChart({ 
  innings1, 
  innings2, 
  team1Name, 
  team2Name, 
  color1 = '#10b981', 
  color2 = '#3b82f6' 
}: WormChartProps) {
  
  // Process data to get cumulative runs
  const data = [];
  const maxOvers = Math.max(
    innings1.overHistory?.length || 0, 
    innings2?.overHistory?.length || 0
  );

  let cumRuns1 = 0;
  let cumRuns2 = 0;

  for (let i = 0; i <= maxOvers; i++) {
    const point: Record<string, number> = { over: i };
    
    if (i === 0) {
      point[team1Name] = 0;
      if (innings2) point[team2Name] = 0;
    } else {
      // Team 1 Data
      const over1 = innings1.overHistory?.find((o: Over) => o.overNumber === i);
      if (over1) {
        cumRuns1 += over1.runsConceded;
        point[team1Name] = cumRuns1;
      } else if (i <= (innings1.overHistory?.length || 0)) {
         // Keep previous value if data exists but not for this specific over index (unlikely with sequential array but safe)
         point[team1Name] = cumRuns1;
      }

      // Team 2 Data
      if (innings2) {
        const over2 = innings2.overHistory?.find((o: Over) => o.overNumber === i);
        if (over2) {
          cumRuns2 += over2.runsConceded;
          point[team2Name] = cumRuns2;
        } else if (i <= (innings2.overHistory?.length || 0)) {
          point[team2Name] = cumRuns2;
        }
      }
    }
    data.push(point);
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="over" 
            type="number"
            domain={[0, 'auto']}
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
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Line 
            type="monotone" 
            dataKey={team1Name} 
            stroke={color1} 
            strokeWidth={2} 
            dot={false} 
            activeDot={{ r: 6 }}
          />
          {innings2 && (
            <Line 
              type="monotone" 
              dataKey={team2Name} 
              stroke={color2} 
              strokeWidth={2} 
              dot={false} 
              activeDot={{ r: 6 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
