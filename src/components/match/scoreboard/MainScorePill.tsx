import React from 'react';
import { cn } from '@/lib/utils';

interface MainScorePillProps {
  battingTeamShortName: string;
  bowlingTeamShortName: string;
  runs: number;
  wickets: number;
  overs: number;
  target?: number;
  firstInningsScore?: string;
  isFirstInnings: boolean;
}

export function MainScorePill({
  battingTeamShortName,
  bowlingTeamShortName,
  runs,
  wickets,
  overs,
  target,
  firstInningsScore,
  isFirstInnings
}: MainScorePillProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto mb-8">
      <div className="flex items-center justify-center w-full gap-2 md:gap-4">
        {/* Bowling Team Circle (Left) */}
        <div className="hidden md:flex items-center justify-center w-16 h-16 rounded-full bg-white border-2 border-slate-900 shadow-sm z-10">
          <span className="text-lg font-bold text-slate-900">{bowlingTeamShortName}</span>
        </div>

        {/* Central Pill */}
        <div className="flex flex-1 max-w-2xl h-16 md:h-20 rounded-full overflow-hidden shadow-lg mx-[-10px] md:mx-0 z-0">
          {/* Left Side: Matchup */}
          <div className="flex-[1.2] flex items-center justify-center bg-[#3ecc78] px-4 md:px-8">
            <h1 className="text-xl md:text-4xl font-bold text-white tracking-tight whitespace-nowrap">
              {bowlingTeamShortName} <span className="text-white/80 text-lg md:text-2xl font-normal mx-1">v</span> {battingTeamShortName}
            </h1>
          </div>

          {/* Right Side: Score */}
          <div className="flex-1 flex items-center justify-between bg-slate-900 px-6 md:px-10">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl md:text-5xl font-bold text-white">{runs}/{wickets}</span>
            </div>
            <div className="flex flex-col items-end justify-center leading-tight">
              <span className="text-xl md:text-3xl font-bold text-white">{overs}</span>
              <span className="text-[10px] md:text-xs font-medium text-slate-400 uppercase tracking-wider">OVERS</span>
            </div>
          </div>
        </div>

        {/* Batting Team Circle (Right) */}
        <div className="hidden md:flex items-center justify-center w-16 h-16 rounded-full bg-slate-900 shadow-sm z-10">
          <span className="text-lg font-bold text-white">{battingTeamShortName}</span>
        </div>
      </div>

      {/* Innings Info & Target */}
      <div className="flex items-center justify-between w-full max-w-2xl mt-3 px-4 text-sm font-medium">
        <div className="text-slate-600">
          {!isFirstInnings && firstInningsScore && (
            <span>1st Innings: {firstInningsScore}</span>
          )}
          {isFirstInnings && (
            <span>1st Innings Dynamic Stats</span>
          )}
        </div>
        
        {!isFirstInnings && target && (
          <div className="text-[#3ecc78] font-bold text-base tracking-wide">
            TARGET {target}
          </div>
        )}
      </div>
    </div>
  );
}
