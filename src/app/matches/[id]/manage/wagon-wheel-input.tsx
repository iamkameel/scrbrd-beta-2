"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

interface WagonWheelInputProps {
  onCoordinateSelect: (coords: { angle: number; distance: number }) => void;
  selectedCoords?: { angle: number; distance: number };
  className?: string;
  readOnly?: boolean;
}

export function WagonWheelInput({
  onCoordinateSelect,
  selectedCoords,
  className,
  readOnly = false
}: WagonWheelInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (readOnly || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Click coordinates relative to center
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;
    
    // Calculate distance (0-100 scale, where 100 is boundary/radius)
    const maxRadius = rect.width / 2;
    const distancePx = Math.sqrt(x * x + y * y);
    const distance = Math.min((distancePx / maxRadius) * 100, 100);

    // Calculate angle in degrees (0 is North/Top, clockwise)
    // atan2(y, x) gives angle from positive X axis (East)
    // We want 0 at Top (North)
    let angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
    if (angle < 0) angle += 360;

    onCoordinateSelect({ angle, distance });
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-64 h-64 rounded-full border-2 border-green-800 bg-green-50 mx-auto overflow-hidden shadow-inner",
        !readOnly && "cursor-crosshair",
        className
      )}
      onClick={handleClick}
    >
      {/* Grass Texture / Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(34,197,94,0.1)_0%,rgba(21,128,61,0.2)_100%)]" />

      {/* Pitch / Wicket Area */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-16 bg-[#e4d5b7] border border-[#d4c5a7] shadow-sm z-10" />
      
      {/* 30 Yard Circle (Approx 40% radius) */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full border border-dashed border-green-700/50 pointer-events-none z-0" />
      
      {/* Compass / Direction Markers */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-green-800 font-bold opacity-50">N</div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-green-800 font-bold opacity-50">S</div>
      <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-green-800 font-bold opacity-50">W</div>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-green-800 font-bold opacity-50">E</div>

      {/* Selected Point */}
      {selectedCoords && (
        <div 
          className="absolute w-3 h-3 bg-red-600 rounded-full border border-white shadow-md transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 transition-all duration-200 ease-out"
          style={{
            left: `${50 + (selectedCoords.distance/2) * Math.sin(selectedCoords.angle * Math.PI / 180)}%`,
            top: `${50 - (selectedCoords.distance/2) * Math.cos(selectedCoords.angle * Math.PI / 180)}%`
          }}
        >
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/75 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap hidden group-hover:block">
            {Math.round(selectedCoords.distance)}m
          </div>
        </div>
      )}
    </div>
  );
}
