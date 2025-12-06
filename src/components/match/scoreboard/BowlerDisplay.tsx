import React from 'react';
import { cn } from '@/lib/utils';
import { Ball } from '@/types/firestore';

interface BowlerDisplayProps {
  name: string;
  wickets: number;
  runsConceded: number;
  overs: number;
  currentOver: Ball[];
}

export function BowlerDisplay({ name, wickets, runsConceded, overs, currentOver }: BowlerDisplayProps) {
  
  const getBallColor = (ball: Ball) => {
    if (ball.isWicket) return 'bg-[#dd514c] text-white'; // Red
    if (ball.runs === 6) return 'bg-[#dd514c] text-white'; // Red
    if (ball.runs === 4) return 'bg-[#3b83f6] text-white'; // Blue
    if (ball.runs === 3) return 'bg-[#f2c14b] text-black'; // Yellow
    if (ball.runs === 2) return 'bg-[#b2e358] text-black'; // Lime Green
    if (ball.runs === 1) return 'bg-[#ec4899] text-white'; // Pink
    if (ball.extrasType) return 'bg-[#5200bc] text-white'; // Purple
    return 'bg-white border border-slate-300 text-slate-700'; // Dot ball
  };

  const getBallText = (ball: Ball) => {
    if (ball.isWicket) return 'W';
    if (ball.extrasType) return `${ball.runs}${ball.extrasType[0].toUpperCase()}`;
    return ball.runs.toString();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto mb-8">
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12">
        {/* Bowler Stats */}
        <div className="flex items-center gap-4">
          <span className="text-xl md:text-2xl font-bold text-slate-900 uppercase">{name}</span>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-xl md:text-2xl font-bold text-slate-900">{runsConceded}/{wickets}</span>
            <span className="text-lg md:text-xl text-slate-500">{overs}</span>
          </div>
        </div>

        {/* Current Over */}
        <div className="flex items-center gap-2">
          {currentOver.map((ball, idx) => (
            <div 
              key={idx}
              className={cn(
                "flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full text-sm md:text-base font-bold shadow-sm",
                getBallColor(ball)
              )}
            >
              {getBallText(ball)}
            </div>
          ))}
          {/* Placeholders if over is empty? No, just show what we have */}
        </div>
      </div>
      
      {/* Required Rate (Optional/Dynamic) */}
      {/* <div className="mt-4 px-4 py-1 bg-[#b2e358]/20 text-[#4a6b18] rounded-full text-sm font-bold uppercase tracking-wide">
        Required Rate: 8.50
      </div> */}
    </div>
  );
}
