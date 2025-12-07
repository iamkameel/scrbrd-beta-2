"use client";

import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { printMatchReport } from "@/lib/utils/exportUtils";

interface PrintableMatchReportProps {
  matchData: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    venue: string;
    date: string;
    format: string;
    result?: string;
    playerOfMatch?: string;
    totalRuns?: number;
    totalWickets?: number;
    totalBalls?: number;
    batsmen?: Array<{
      name: string;
      runs: number;
      balls: number;
      fours: number;
      sixes: number;
      strikeRate: number;
    }>;
    bowlers?: Array<{
      name: string;
      overs: number;
      runs: number;
      wickets: number;
      economy: number;
    }>;
  };
}

export function PrintableMatchReport({ matchData }: PrintableMatchReportProps) {
  const handlePrint = () => {
    printMatchReport(matchData);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
      >
        <Printer className="mr-2 h-4 w-4" />
        Print Report
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
      >
        <Download className="mr-2 h-4 w-4" />
        Download PDF
      </Button>
    </div>
  );
}
