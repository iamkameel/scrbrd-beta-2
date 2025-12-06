"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Player {
  id: string;
  name: string;
  role?: string;
}

interface NewBowlerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availablePlayers: Player[];
  onSelect: (playerId: string) => void;
  previousBowlerId?: string;
}

export function NewBowlerDialog({
  open,
  onOpenChange,
  availablePlayers,
  onSelect,
  previousBowlerId
}: NewBowlerDialogProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');

  const handleSubmit = () => {
    if (selectedPlayerId) {
      onSelect(selectedPlayerId);
      onOpenChange(false);
      setSelectedPlayerId('');
    }
  };

  // Filter out previous bowler (can't bowl consecutive overs)
  const eligibleBowlers = availablePlayers.filter(p => p.id !== previousBowlerId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Next Bowler</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="bowler">Bowler</Label>
            <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
              <SelectTrigger id="bowler">
                <SelectValue placeholder="Select player..." />
              </SelectTrigger>
              <SelectContent>
                {eligibleBowlers.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name} {player.role ? `(${player.role})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={!selectedPlayerId}>
            Confirm Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
