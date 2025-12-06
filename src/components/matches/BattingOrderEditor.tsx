"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface BattingOrderEditorProps {
  matchId: string;
  homeTeamName: string;
  awayTeamName: string;
  homePlayingXI: { id: string; name: string; role?: string }[];
  awayPlayingXI: { id: string; name: string; role?: string }[];
  initialOrder?: {
    home: string[];
    away: string[];
  };
  onComplete: () => void;
}

export function BattingOrderEditor({
  matchId,
  homeTeamName,
  awayTeamName,
  homePlayingXI,
  awayPlayingXI,
  initialOrder,
  onComplete
}: BattingOrderEditorProps) {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Batting Order Editor (TEST)</h2>
      <p>Component loads successfully! This is a minimal test version.</p>
      <div className="flex gap-2">
        <Button variant="outline">{homeTeamName}</Button>
        <Button variant="outline">{awayTeamName}</Button>
      </div>
      <Button onClick={onComplete}>Complete</Button>
    </div>
  );
}
