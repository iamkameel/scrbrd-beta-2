"use client";

import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Result = 'W' | 'L' | 'D';

interface FormIndicatorProps {
  results: Result[];
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  detailed?: boolean; // Show opponent/score on hover
  details?: Array<{
    result: Result;
    opponent?: string;
    score?: string;
    date?: string;
  }>;
}

const resultColors: Record<Result, string> = {
  W: 'bg-green-500 text-white',
  L: 'bg-red-500 text-white',
  D: 'bg-yellow-500 text-white',
};

const sizeClasses = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base',
};

export function FormIndicator({
  results,
  showLabel = true,
  size = 'md',
  className,
  detailed = false,
  details,
}: FormIndicatorProps) {
  // Take last 5 results
  const recentResults = results.slice(-5);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground">Recent Form</span>
      )}
      <div className="flex gap-1.5">
        {recentResults.map((result, index) => {
          const detail = details?.[results.length - 5 + index];
          
          const indicator = (
            <div
              key={index}
              className={cn(
                'rounded font-bold flex items-center justify-center transition-transform hover:scale-110',
                resultColors[result],
                sizeClasses[size]
              )}
            >
              {result}
            </div>
          );

          if (detailed && detail) {
            return (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {indicator}
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs space-y-1">
                      {detail.opponent && <div className="font-semibold">vs {detail.opponent}</div>}
                      {detail.score && <div>{detail.score}</div>}
                      {detail.date && <div className="text-muted-foreground">{detail.date}</div>}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          }

          return indicator;
        })}
      </div>
    </div>
  );
}
