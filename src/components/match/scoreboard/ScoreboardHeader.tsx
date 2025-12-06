import React from 'react';

interface ScoreboardHeaderProps {
  homeTeamName: string;
  awayTeamName: string;
  division?: string;
}

export function ScoreboardHeader({ homeTeamName, awayTeamName, division }: ScoreboardHeaderProps) {
  return (
    <div className="text-center mb-6">
      <h2 className="text-sm md:text-base font-bold text-slate-700 uppercase tracking-wide">
        {homeTeamName} {division} <span className="text-slate-400 mx-1">vs</span> {awayTeamName} {division}
      </h2>
    </div>
  );
}
