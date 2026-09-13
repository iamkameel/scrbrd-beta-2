'use client';

import React from 'react';

interface ScrbrdLogoProps {
  height?: number;
  width?: number;
  size?: number;
  theme?: any;
  className?: string;
  isDark?: boolean;
}

export function ScrbrdLogo({ height = 26, width, size, className }: ScrbrdLogoProps) {
  const effectiveHeight = size || height;
  // Calculated width keeping the 486 x 96 ratio (~5.06:1)
  const calcWidth = width || Math.round(effectiveHeight * 5.0625);

  return (
    <svg
      viewBox="0 0 486 96"
      width={calcWidth}
      height={height}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="SCRBRD Logo"
    >
      <defs>
        <linearGradient id="scrbrdTileTopGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2c2d30" />
          <stop offset="25%" stopColor="#222326" />
          <stop offset="95%" stopColor="#18191b" />
          <stop offset="100%" stopColor="#121314" />
        </linearGradient>
        <linearGradient id="scrbrdTileBottomGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#141517" />
          <stop offset="15%" stopColor="#1c1d20" />
          <stop offset="85%" stopColor="#232427" />
          <stop offset="100%" stopColor="#191a1c" />
        </linearGradient>

        <g id="scrbrdSingleTile">
          {/* Base Tile */}
          <rect x="0" y="2" width="72" height="92" rx="6" fill="#0c0d0e" stroke="#050607" strokeWidth="1.5" />
          
          {/* Top Half Flap */}
          <path d="M 0,8 A 6,6 0 0,1 6,2 L 66,2 A 6,6 0 0,1 72,8 L 72,46.5 L 0,46.5 Z" fill="url(#scrbrdTileTopGrad)" />
          <line x1="6" y1="3.5" x2="66" y2="3.5" stroke="#4b4d52" strokeWidth="1" strokeLinecap="round" />
          
          {/* Bottom Half Flap */}
          <path d="M 0,49.5 L 72,49.5 L 72,88 A 6,6 0 0,1 66,94 L 6,94 A 6,6 0 0,1 0,88 Z" fill="url(#scrbrdTileBottomGrad)" />
          <line x1="6" y1="93" x2="66" y2="93" stroke="#111213" strokeWidth="1" />
          
          {/* Center Split Line & Crease */}
          <rect x="0" y="46.5" width="72" height="3" fill="#070809" />
          <line x1="0" y1="46.5" x2="72" y2="46.5" stroke="#000000" strokeWidth="1.2" />
          <line x1="0" y1="49.5" x2="72" y2="49.5" stroke="#33353a" strokeWidth="0.75" />

          {/* Left & Right Mechanical Hinge Pins */}
          <rect x="-2.5" y="41" width="5" height="14" rx="1.5" fill="#151618" stroke="#050506" strokeWidth="1" />
          <line x1="-1.5" y1="48" x2="1.5" y2="48" stroke="#52545a" strokeWidth="1" />
          <rect x="69.5" y="41" width="5" height="14" rx="1.5" fill="#151618" stroke="#050506" strokeWidth="1" />
          <line x1="70.5" y1="48" x2="73.5" y2="48" stroke="#52545a" strokeWidth="1" />
        </g>
      </defs>

      {/* TILE 1: S */}
      <g transform="translate(6, 0)">
        <use href="#scrbrdSingleTile" />
        <path d="M 54,23 L 54,34 L 30,34 L 30,42 L 54,44 L 54,73 L 18,73 L 18,62 L 42,62 L 42,54 L 18,52 L 18,23 Z" fill="#ffffff" />
        <rect x="0" y="46.5" width="72" height="3" fill="#000000" fillOpacity="0.85" />
        <line x1="0" y1="49.5" x2="72" y2="49.5" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1" />
      </g>

      {/* TILE 2: C */}
      <g transform="translate(86, 0)">
        <use href="#scrbrdSingleTile" />
        <path d="M 54,23 L 54,34 L 30,34 L 30,62 L 54,62 L 54,73 L 18,73 L 18,23 Z" fill="#ffffff" />
        <rect x="0" y="46.5" width="72" height="3" fill="#000000" fillOpacity="0.85" />
        <line x1="0" y1="49.5" x2="72" y2="49.5" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1" />
      </g>

      {/* TILE 3: R */}
      <g transform="translate(166, 0)">
        <use href="#scrbrdSingleTile" />
        <path d="M 18,23 L 46,23 C 51,23 54,26 54,31 L 54,42 C 54,47 50,49 44,50 L 54,73 L 41,73 L 32,52 L 30,52 L 30,73 L 18,73 Z M 30,33 L 30,43 L 41,43 C 43,43 43,42 43,40 L 43,36 C 43,34 43,33 41,33 Z" fill="#ffffff" />
        <rect x="0" y="46.5" width="72" height="3" fill="#000000" fillOpacity="0.85" />
        <line x1="0" y1="49.5" x2="72" y2="49.5" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1" />
      </g>

      {/* TILE 4: B */}
      <g transform="translate(246, 0)">
        <use href="#scrbrdSingleTile" />
        <path d="M 18,23 L 45,23 C 50,23 53,25 53,29 L 53,37 C 53,41 50,43 46,45 C 51,46 54,49 54,53 L 54,67 C 54,71 50,73 45,73 L 18,73 Z M 30,33 L 30,42 L 41,42 C 42,42 43,41 43,39 L 43,36 C 43,34 42,33 41,33 Z M 30,51 L 30,63 L 41,63 C 42,63 43,62 43,60 L 43,54 C 43,52 42,51 41,51 Z" fill="#ffffff" />
        <rect x="0" y="46.5" width="72" height="3" fill="#000000" fillOpacity="0.85" />
        <line x1="0" y1="49.5" x2="72" y2="49.5" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1" />
      </g>

      {/* TILE 5: R */}
      <g transform="translate(326, 0)">
        <use href="#scrbrdSingleTile" />
        <path d="M 18,23 L 46,23 C 51,23 54,26 54,31 L 54,42 C 54,47 50,49 44,50 L 54,73 L 41,73 L 32,52 L 30,52 L 30,73 L 18,73 Z M 30,33 L 30,43 L 41,43 C 43,43 43,42 43,40 L 43,36 C 43,34 43,33 41,33 Z" fill="#ffffff" />
        <rect x="0" y="46.5" width="72" height="3" fill="#000000" fillOpacity="0.85" />
        <line x1="0" y1="49.5" x2="72" y2="49.5" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1" />
      </g>

      {/* TILE 6: D */}
      <g transform="translate(406, 0)">
        <use href="#scrbrdSingleTile" />
        <path d="M 18,23 L 42,23 C 49,23 54,27 54,35 L 54,61 C 54,69 49,73 42,73 L 18,73 Z M 30,34 L 30,62 L 41,62 C 43,62 43,60 43,56 L 43,40 C 43,36 43,34 41,34 Z" fill="#ffffff" />
        <rect x="0" y="46.5" width="72" height="3" fill="#000000" fillOpacity="0.85" />
        <line x1="0" y1="49.5" x2="72" y2="49.5" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1" />
      </g>
    </svg>
  );
}

export default ScrbrdLogo;
