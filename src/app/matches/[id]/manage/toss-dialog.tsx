'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Trophy } from 'lucide-react';
import { Team } from '@/types/firestore';
import { useToast } from '@/hooks/use-toast';
import { updateTossAction } from '@/app/actions/matchActions';

interface TossDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: string;
  homeTeam: Team;
  awayTeam: Team;
  onTossRecorded?: () => void;
}

export function TossDialog({ 
  open, 
  onOpenChange, 
  matchId, 
  homeTeam, 
  awayTeam,
  onTossRecorded 
}: TossDialogProps) {
  const { toast } = useToast();
  const [winnerId, setWinnerId] = useState<string>('');
  const [decision, setDecision] = useState<'bat' | 'bowl' | ''>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    console.log('handleSubmit called', { winnerId, decision });
    if (!winnerId || !decision) {
      console.log('Missing winnerId or decision, returning');
      return;
    }

    setLoading(true);
    try {
      console.log('Calling updateTossAction with:', { matchId, winnerId, decision });
      const result = await updateTossAction(matchId, {
        winnerId,
        decision: decision as 'bat' | 'bowl'
      });
      console.log('updateTossAction result:', result);

      if (result.success) {
        toast({
          title: 'Toss Recorded',
          description: `${winnerId === homeTeam.id ? homeTeam.name : awayTeam.name} won the toss and elected to ${decision}.`,
        });
        onOpenChange(false);
        if (onTossRecorded) onTossRecorded();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to record toss',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Match Toss
          </DialogTitle>
          <DialogDescription>
            Record the result of the coin toss.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Who won the toss?</Label>
            <RadioGroup value={winnerId} onValueChange={setWinnerId} className="grid grid-cols-2 gap-4">
              <div>
                <RadioGroupItem value={homeTeam.id!} id="home" className="peer sr-only" />
                <Label
                  htmlFor="home"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <span className="text-lg font-bold mb-1">{homeTeam.name}</span>
                  <span className="text-xs text-muted-foreground">Home</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value={awayTeam.id!} id="away" className="peer sr-only" />
                <Label
                  htmlFor="away"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <span className="text-lg font-bold mb-1">{awayTeam.name}</span>
                  <span className="text-xs text-muted-foreground">Away</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {winnerId && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
              <Label className="text-base font-semibold">Decision?</Label>
              <RadioGroup value={decision} onValueChange={(v) => setDecision(v as 'bat' | 'bowl')} className="grid grid-cols-2 gap-4">
                <div>
                  <RadioGroupItem value="bat" id="bat" className="peer sr-only" />
                  <Label
                    htmlFor="bat"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <span className="text-2xl mb-1">🏏</span>
                    <span className="font-semibold">Bat First</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="bowl" id="bowl" className="peer sr-only" />
                  <Label
                    htmlFor="bowl"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <span className="text-2xl mb-1">⚾</span>
                    <span className="font-semibold">Bowl First</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!winnerId || !decision || loading} className="w-32">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Toss'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
