"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Trophy, Coffee, AlertTriangle } from "lucide-react";

export type TransitionType = 'innings_break' | 'complete_match';

interface MatchTransitionDialogProps {
  isOpen: boolean;
  type: TransitionType;
  matchData: {
    homeTeamName: string;
    awayTeamName: string;
    currentInnings: 1 | 2;
    totalRuns: number;
    wickets: number;
    overs: string;
    target?: number;
  };
  onConfirm: (data?: any) => void;
  onCancel: () => void;
}

export function MatchTransitionDialog({
  isOpen,
  type,
  matchData,
  onConfirm,
  onCancel
}: MatchTransitionDialogProps) {
  const [playerOfMatch, setPlayerOfMatch] = useState("");
  const [matchResult, setMatchResult] = useState("");

  // Auto-calculate result suggestion
  const getResultData = () => {
    if (type !== 'complete_match') return { result: "", winner: "" };
    
    const { homeTeamName, awayTeamName, totalRuns, wickets, target, currentInnings } = matchData;
    
    if (!target) return { result: "Match Concluded", winner: "draw" }; // Should not happen for 2nd innings end

    if (totalRuns >= target) {
      // Chasing team won (Team batting 2nd)
      // If currentInnings is 2, the team batting NOW is the chasing team
      // We need to know WHO is batting. 
      // Assumption: Home bats 1st -> Away bats 2nd OR Away bats 1st -> Home bats 2nd
      // We need 'toss' data to know for sure, but for now let's assume standard flow or pass battingTeamId
      
      const wicketsLeft = 10 - wickets;
      // For now, returning generic result string. Winner ID logic needs team IDs.
      return { 
        result: `${currentInnings === 2 ? 'Chasing team' : 'Batting team'} won by ${wicketsLeft} wickets`,
        winner: 'chasing_team' 
      };
    } else {
      // Defending team won
      const runsShort = target - totalRuns - 1;
      return { 
        result: `${currentInnings === 2 ? 'Defending team' : 'Bowling team'} won by ${runsShort} runs`,
        winner: 'defending_team'
      };
    }
  };

  const handleConfirm = () => {
    if (type === 'complete_match') {
      onConfirm({
        playerOfMatch,
        result: matchResult || getResultData().result,
        winner: getResultData().winner // This needs to be mapped to 'home' or 'away' in parent
      });
    } else {
      onConfirm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {type === 'innings_break' ? (
              <Coffee className="h-6 w-6 text-orange-500" />
            ) : (
              <Trophy className="h-6 w-6 text-yellow-500" />
            )}
            <DialogTitle>
              {type === 'innings_break' ? 'End Innings?' : 'Complete Match?'}
            </DialogTitle>
          </div>
          <DialogDescription>
            {type === 'innings_break' 
              ? "Are you sure you want to end the current innings? This will start the innings break."
              : "This will finalize the match and lock the scorecard. This action cannot be undone."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">Session Summary</h4>
            <div className="flex justify-between text-sm">
              <span>Score:</span>
              <span className="font-mono font-bold">{matchData.totalRuns}/{matchData.wickets}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Overs:</span>
              <span className="font-mono">{matchData.overs}</span>
            </div>
          </div>

          {type === 'complete_match' && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="result">Match Result</Label>
                <Input
                  id="result"
                  defaultValue={getResultData().result}
                  onChange={(e) => setMatchResult(e.target.value)}
                  placeholder="e.g. Team A won by 20 runs"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pom">Player of the Match</Label>
                <Input
                  id="pom"
                  value={playerOfMatch}
                  onChange={(e) => setPlayerOfMatch(e.target.value)}
                  placeholder="Enter player name"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleConfirm} variant={type === 'complete_match' ? "default" : "secondary"}>
            {type === 'innings_break' ? 'Start Break' : 'Finalize Match'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
