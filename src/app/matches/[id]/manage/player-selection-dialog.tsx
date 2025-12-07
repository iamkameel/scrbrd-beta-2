'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { updateLivePlayersAction } from '@/app/actions/matchActions';
import { useToast } from '@/hooks/use-toast';

import { Person } from '@/types/firestore';

interface PlayerSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: string;
  team1Players: Person[];
  team2Players: Person[];
  battingTeamId: string;
  bowlingTeamId: string;
  currentStrikerId?: string | null;
  currentNonStrikerId?: string | null;
  currentBowlerId?: string | null;
  unavailableBatsmenIds?: string[];
  unavailableBowlerIds?: string[];
}

export function PlayerSelectionDialog({
  open,
  onOpenChange,
  matchId,
  team1Players,
  team2Players,
  battingTeamId,
  bowlingTeamId,
  currentStrikerId,
  currentNonStrikerId,
  currentBowlerId,
  unavailableBatsmenIds = [],
  unavailableBowlerIds = []
}: PlayerSelectionDialogProps) {
  const { toast } = useToast();
  
  // Filter players by team
  const rawBattingPlayers = team1Players.some(p => p.id && team1Players.map(tp => tp.id).includes(p.id) && team1Players.find(t => t.id === battingTeamId)) 
    ? team1Players 
    : (team2Players.find(t => t.id === battingTeamId) ? team2Players : []);

  // Correct logic to identify batting team squad
  const isTeam1Batting = team1Players.length > 0 && team1Players[0].teamIds?.includes(battingTeamId);
  const battingSquad = isTeam1Batting ? team1Players : team2Players;
  const bowlingSquad = isTeam1Batting ? team2Players : team1Players;

  const battingPlayers = battingSquad.filter(p => !unavailableBatsmenIds.includes(p.id));
  const bowlingPlayers = bowlingSquad.filter(p => !unavailableBowlerIds.includes(p.id));

  const [strikerId, setStrikerId] = useState<string>(currentStrikerId || '');
  const [nonStrikerId, setNonStrikerId] = useState<string>(currentNonStrikerId || '');
  const [bowlerId, setBowlerId] = useState<string>(currentBowlerId || '');
  const [bowlingAngle, setBowlingAngle] = useState<'Over the Wicket' | 'Round the Wicket'>('Over the Wicket');
  const [loading, setLoading] = useState(false);

  const getPlayerName = (p: Person) => `${p.firstName} ${p.lastName}`;

  const handleSubmit = async () => {
    // Validation
    if (!strikerId || !nonStrikerId || !bowlerId) {
      toast({
        title: 'Incomplete Selection',
        description: 'Please select striker, non-striker, and bowler',
        variant: 'destructive'
      });
      return;
    }

    if (strikerId === nonStrikerId) {
      toast({
        title: 'Invalid Selection',
        description: 'Striker and non-striker must be different players',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await updateLivePlayersAction(matchId, {
        strikerId,
        nonStrikerId,
        bowlerId,
        bowlingAngle
      });

      if (result.success) {
        toast({
          title: 'Players Updated',
          description: 'Ready to start scoring',
        });
        onOpenChange(false);
      } else {
        throw new Error(result.error || 'Failed to update players');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update players. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select Players</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Striker Selection */}
          <div className="space-y-2">
            <Label>Striker (On Strike) *</Label>
            <Select value={strikerId} onValueChange={setStrikerId}>
              <SelectTrigger data-testid="select-striker">
                <SelectValue placeholder="Select striker" />
              </SelectTrigger>
              <SelectContent>
                {battingPlayers.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {getPlayerName(player)} {player.playingRole && `(${player.playingRole})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Non-Striker Selection */}
          <div className="space-y-2">
            <Label>Non-Striker *</Label>
            <Select value={nonStrikerId} onValueChange={setNonStrikerId}>
              <SelectTrigger data-testid="select-non-striker">
                <SelectValue placeholder="Select non-striker" />
              </SelectTrigger>
              <SelectContent>
                {battingPlayers.map((player) => (
                  <SelectItem 
                    key={player.id} 
                    value={player.id}
                    disabled={player.id === strikerId}
                  >
                    {getPlayerName(player)} {player.playingRole && `(${player.playingRole})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bowler Selection */}
          <div className="space-y-2">
            <Label>Bowler *</Label>
            <Select value={bowlerId} onValueChange={setBowlerId}>
              <SelectTrigger data-testid="select-bowler">
                <SelectValue placeholder="Select bowler" />
              </SelectTrigger>
              <SelectContent>
                {bowlingPlayers.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {getPlayerName(player)} 
                    {player.bowlingStyle ? ` (${player.bowlingStyle})` : (player.playingRole ? ` (${player.playingRole})` : '')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bowling Angle */}
          <div className="space-y-3">
            <Label>Bowling Angle</Label>
            <RadioGroup value={bowlingAngle} onValueChange={(v) => setBowlingAngle(v as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Over the Wicket" id="over" />
                <Label htmlFor="over" className="cursor-pointer font-normal">
                  Over the Wicket
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Round the Wicket" id="round" />
                <Label htmlFor="round" className="cursor-pointer font-normal">
                  Round the Wicket
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Updating...' : 'Confirm Selection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
