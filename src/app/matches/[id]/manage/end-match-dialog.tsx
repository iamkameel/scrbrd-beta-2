"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EndMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (result: { winnerId?: string; margin?: string; resultText: string }) => Promise<void>;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
}

export function EndMatchDialog({
  open,
  onOpenChange,
  onConfirm,
  homeTeamId,
  awayTeamId,
  homeTeamName,
  awayTeamName
}: EndMatchDialogProps) {
  const [loading, setLoading] = useState(false);
  const [winnerId, setWinnerId] = useState<string>("");
  const [margin, setMargin] = useState("");
  const [resultText, setResultText] = useState("");

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // Auto-generate text if empty
      let finalResultText = resultText;
      if (!finalResultText && winnerId) {
        const winnerName = winnerId === homeTeamId ? homeTeamName : awayTeamName;
        finalResultText = `${winnerName} won by ${margin}`;
      }

      await onConfirm({
        winnerId: winnerId || undefined,
        margin,
        resultText: finalResultText
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to end match:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>End Match</DialogTitle>
          <DialogDescription>
            Declare the result and complete the match.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Winner</Label>
            <Select value={winnerId} onValueChange={setWinnerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Winner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={homeTeamId}>{homeTeamName}</SelectItem>
                <SelectItem value={awayTeamId}>{awayTeamName}</SelectItem>
                <SelectItem value="draw">Match Drawn / Tied</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {winnerId && winnerId !== 'draw' && (
            <div className="space-y-2">
              <Label>Margin (e.g., &ldquo;20 runs&rdquo;, &ldquo;5 wickets&rdquo;)</Label>
              <Input 
                value={margin} 
                onChange={(e) => setMargin(e.target.value)} 
                placeholder="Enter margin"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Result Description</Label>
            <Input 
              value={resultText} 
              onChange={(e) => setResultText(e.target.value)} 
              placeholder={winnerId ? `${winnerId === homeTeamId ? homeTeamName : awayTeamName} won by...` : "Match ended in a draw"}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? "Completing..." : "Complete Match"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
