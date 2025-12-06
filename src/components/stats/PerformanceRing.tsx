"use client";

import { cn } from '@/lib/utils';

interface PerformanceRingProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showValue?: boolean;
  className?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

const sizeClasses = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
};

const colorClasses = {
  primary: 'text-primary',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  danger: 'text-red-500',
};

const strokeColorClasses = {
  primary: 'stroke-primary',
  success: 'stroke-green-500',
  warning: 'stroke-yellow-500',
  danger: 'stroke-red-500',
};

export function PerformanceRing({
  value,
  size = 'md',
  label,
  showValue = true,
  className,
  color = 'primary',
}: PerformanceRingProps) {
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        <svg className="transform -rotate-90 w-full h-full">
          {/* Background circle */}
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted/20"
          />
          {/* Progress circle */}
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn('transition-all duration-1000 ease-out', strokeColorClasses[color])}
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn('font-bold', textSizeClasses[size], colorClasses[color])}>
              {Math.round(value)}%
            </span>
          </div>
        )}
      </div>
      {label && (
        <span className="text-xs text-muted-foreground text-center font-medium">{label}</span>
      )}
    </div>
  );
}
