import React from 'react';

interface MatchFooterProps {
  competition?: string;
  date: string;
  time: string;
  venue?: string;
  weather?: string;
  currentInnings?: string;
}

export function MatchFooter({ competition, date, time, venue, weather, currentInnings }: MatchFooterProps) {
  return (
    <div className="w-full border-t border-slate-200 mt-auto pt-4">
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs md:text-sm font-medium text-slate-500 uppercase tracking-wide text-center">
        {competition && (
          <>
            <span>{competition}</span>
            <span className="text-slate-300">|</span>
          </>
        )}
        <span>{date}</span>
        <span className="text-slate-300">|</span>
        <span>{time}</span>
        {currentInnings && (
          <>
            <span className="text-slate-300">|</span>
            <span>{currentInnings}</span>
          </>
        )}
        {venue && (
          <>
            <span className="text-slate-300">|</span>
            <span>{venue}</span>
          </>
        )}
        {weather && (
          <>
            <span className="text-slate-300">|</span>
            <span>{weather}</span>
          </>
        )}
      </div>
    </div>
  );
}
