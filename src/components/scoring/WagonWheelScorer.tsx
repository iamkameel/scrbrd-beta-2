"use client";

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface WagonWheelScorerProps {
  onShotRecorded: (angle: number, distance: number) => void;
  disabled?: boolean;
  className?: string;
}

interface ClickedShot {
  x: number;
  y: number;
  angle: number;
  distance: number;
}

export function WagonWheelScorer({ 
  onShotRecorded, 
  disabled = false,
  className 
}: WagonWheelScorerProps) {
  const [lastShot, setLastShot] = useState<ClickedShot | null>(null);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);

  const handleFieldClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (disabled) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    
    // Get click position relative to SVG
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to SVG coordinates (assuming 400x400 viewBox)
    const svgX = (x / rect.width) * 400;
    const svgY = (y / rect.height) * 400;
    
    // Center of field is (200, 200)
    const centerX = 200;
    const centerY = 200;
    
    // Calculate distance from center
    const dx = svgX - centerX;
    const dy = svgY - centerY;
    const distancePixels = Math.sqrt(dx * dx + dy * dy);
    
    // Max distance is ~190 (radius of field circle)
    const maxDistance = 190;
    const distancePercent = Math.min(100, (distancePixels / maxDistance) * 100);
    
    // Calculate angle (0° = top, clockwise)
    let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    
    const shot: ClickedShot = {
      x: svgX,
      y: svgY,
      angle: Math.round(angle),
      distance: Math.round(distancePercent)
    };
    
    setLastShot(shot);
    onShotRecorded(shot.angle, shot.distance);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (disabled) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const svgX = (x / rect.width) * 400;
    const svgY = (y / rect.height) * 400;
    
    setHover({ x: svgX, y: svgY });
  };

  const handleMouseLeave = () => {
    setHover(null);
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="mb-4 text-center">
        <h3 className="text-lg font-semibold mb-1">Tap Field to Record Shot</h3>
        <p className="text-sm text-muted-foreground">
          Click where the ball went on the field
        </p>
      </div>

      <div className="relative">
        <svg 
          width="400" 
          height="400" 
          viewBox="0 0 400 400"
          className={cn(
            "border border-border rounded-lg bg-muted/20",
            !disabled && "cursor-crosshair hover:bg-muted/30 transition-colors"
          )}
          onClick={handleFieldClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Field Background */}
          <circle 
            cx="200" 
            cy="200" 
            r="190" 
            fill="rgba(16, 185, 129, 0.05)" 
            stroke="rgba(255,255,255,0.3)" 
            strokeWidth="2" 
          />
          
          {/* Inner Circle (30 yards) */}
          <circle 
            cx="200" 
            cy="200" 
            r="85" 
            fill="none" 
            stroke="rgba(255,255,255,0.2)" 
            strokeWidth="1" 
            strokeDasharray="4 4" 
          />
          
          {/* Pitch */}
          <rect 
            x="195" 
            y="175" 
            width="10" 
            height="50" 
            fill="rgba(255,255,255,0.15)" 
            rx="2"
          />
          
          {/* Field zones (faint) */}
          <g opacity="0.1" stroke="rgba(255,255,255,0.5)" strokeWidth="1">
            <line x1="200" y1="10" x2="200" y2="390" />
            <line x1="10" y1="200" x2="390" y2="200" />
            <line x1="65" y1="65" x2="335" y2="335" />
            <line x1="335" y1="65" x2="65" y2="335" />
          </g>
          
          {/* Hover indicator */}
          {hover && !disabled && (
            <g>
              <line 
                x1="200" 
                y1="200" 
                x2={hover.x} 
                y2={hover.y} 
                stroke="rgba(59, 130, 246, 0.4)" 
                strokeWidth="2" 
                strokeDasharray="4 4"
              />
              <circle 
                cx={hover.x} 
                cy={hover.y} 
                r="6" 
                fill="rgba(59, 130, 246, 0.6)" 
                stroke="white"
                strokeWidth="2"
              />
            </g>
          )}
          
          {/* Last shot indicator */}
          {lastShot && (
            <g>
              <line 
                x1="200" 
                y1="200" 
                x2={lastShot.x} 
                y2={lastShot.y} 
                stroke="rgb(34, 197, 94)" 
                strokeWidth="3"
              />
              <circle 
                cx={lastShot.x} 
                cy={lastShot.y} 
                r="8" 
                fill="rgb(34, 197, 94)" 
                stroke="white"
                strokeWidth="2"
              />
              {/* Pulsing animation */}
              <circle 
                cx={lastShot.x} 
                cy={lastShot.y} 
                r="8" 
                fill="none"
                stroke="rgb(34, 197, 94)"
                strokeWidth="2"
                className="animate-ping"
              />
            </g>
          )}
          
          {/* Field labels */}
          <g fill="rgba(255,255,255,0.4)" fontSize="12" fontWeight="500" textAnchor="middle">
            <text x="200" y="25">OFF</text>
            <text x="200" y="380">LEG</text>
            <text x="25" y="205">THIRD</text>
            <text x="375" y="205">FINE</text>
          </g>
        </svg>

        {/* Status indicator */}
        {disabled && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Disabled
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Last shot info */}
      {lastShot && (
        <div className="mt-4 p-3 bg-primary/10 rounded-lg text-center">
          <p className="text-sm font-medium text-primary">
            Shot Recorded
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Angle: {lastShot.angle}° | Distance: {lastShot.distance}%
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Last Shot</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Hover Preview</span>
        </div>
      </div>
    </div>
  );
}
