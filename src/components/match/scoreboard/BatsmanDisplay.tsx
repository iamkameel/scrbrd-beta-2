import React from 'react';
import { cn } from '@/lib/utils';

interface BatsmanProps {
  name: string;
  runs: number;
  balls: number;
  isStriker: boolean;
}

interface BatsmanDisplayProps {
  striker: BatsmanProps | null;
  nonStriker: BatsmanProps | null;
}

export function BatsmanDisplay({ striker, nonStriker }: BatsmanDisplayProps) {
  return (
    <div className="flex items-center justify-center w-full max-w-3xl mx-auto mb-6">
      <div className="flex w-full h-12 md:h-14 rounded-full overflow-hidden shadow-md bg-slate-900">
        {/* Striker (Always Left for now, or we can swap based on who is striker if we want dynamic positioning, but usually Striker is highlighted) */}
        {/* Actually, the design shows Striker on Left. */}
        
        <div className="flex-1 flex items-center justify-between px-6 bg-[#3ecc78] text-white">
          <span className="font-bold text-lg md:text-xl uppercase truncate">
            {striker?.name || 'Striker'}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-xl md:text-2xl">{striker?.runs ?? 0}</span>
            <span className="text-sm md:text-base opacity-90">({striker?.balls ?? 0})</span>
          </div>
        </div>

        {/* Non-Striker */}
        <div className="flex-1 flex items-center justify-between px-6 bg-slate-900 text-white">
          <span className="font-bold text-lg md:text-xl uppercase truncate">
            {nonStriker?.name || 'Non-Striker'}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-xl md:text-2xl">{nonStriker?.runs ?? 0}</span>
            <span className="text-sm md:text-base opacity-90">({nonStriker?.balls ?? 0})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
