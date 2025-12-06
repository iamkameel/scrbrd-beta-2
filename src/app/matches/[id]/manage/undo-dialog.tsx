'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { undoLastBallAction } from '@/app/actions/matchActions';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';

interface UndoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: string;
  lastBall?: {
    runs: number;
    isWicket: boolean;
    extraType?: string;
  } | null;
}

export function UndoDialog({
  open,
  onOpenChange,
  matchId,
  lastBall
}: UndoDialogProps) {
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUndo = async () => {
    if (!reason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for undoing this ball',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await undoLastBallAction(matchId, reason);

      if (result.success) {
        toast({
          title: 'Ball Undone',
          description: `Reversed ${result.undoneRuns} run(s)`,
        });
        setReason('');
        onOpenChange(false);
      } else {
        throw new Error(result.error || 'Failed to undo ball');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to undo ball. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Undo Last Ball
          </DialogTitle>
          <DialogDescription>
            This action will reverse all statistics for the last ball. Please provide a reason for the audit trail.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {lastBall && (
            <div className="rounded-lg bg-muted p-3 space-y-1 text-sm">
              <div className="font-medium">Last Ball:</div>
              <div className="text-muted-foreground">
                {lastBall.runs} run(s)
                {lastBall.extraType && ` + ${lastBall.extraType}`}
                {lastBall.isWicket && ' + WICKET'}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Undo *</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Incorrect entry, Wrong player selected, Scoring error"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {reason.length}/200 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              setReason('');
              onOpenChange(false);
            }} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleUndo} 
            disabled={loading || !reason.trim()}
          >
            {loading ? 'Undoing...' : 'Undo Ball'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
