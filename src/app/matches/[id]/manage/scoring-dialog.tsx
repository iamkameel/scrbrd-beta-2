import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { WagonWheelInput } from './wagon-wheel-input';
import { recordBallAction } from '@/app/actions/matchActions';

interface ScoringDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: string;
  striker: { id: string; name: string } | null;
  bowler: { id: string; name: string } | null;
  fieldingSquad?: { id: string; name: string }[];
  shotCoordinates?: { angle: number; distance: number };
}

export function ScoringDialog({
  open,
  onOpenChange,
  matchId,
  striker,
  bowler,
  fieldingSquad = [],
  shotCoordinates: initialCoordinates
}: ScoringDialogProps) {
  const { toast } = useToast();
  const [runs, setRuns] = useState<string>('0');
  const [isWicket, setIsWicket] = useState(false);
  const [wicketType, setWicketType] = useState<string>('');
  const [extraType, setExtraType] = useState<string>('');
  const [extraRuns, setExtraRuns] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState<{ angle: number; distance: number } | undefined>(initialCoordinates);
  const [fielderId, setFielderId] = useState<string>('');
  const [secondaryFielderId, setSecondaryFielderId] = useState<string>('');

  const handleSubmit = async () => {
    if (!striker || !bowler) {
      toast({
        title: 'Error',
        description: 'Striker and bowler must be selected',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const ballData = {
        runs: parseInt(runs),
        isWicket,
        wicketType: isWicket ? wicketType : undefined,
        extraType: extraType || undefined,
        extraRuns: extraType ? parseInt(extraRuns) : 0,
        strikerId: striker.id,
        bowlerId: bowler.id,
        coordinates: coordinates,
        fielderIds: isWicket && (wicketType === 'caught' || wicketType === 'runout') 
          ? [fielderId, secondaryFielderId].filter(Boolean) 
          : undefined,
      };

      const result = await recordBallAction(matchId, ballData);

      if (result.success) {
        // ... celebrations ...
        if (result.milestone) {
          toast({
            title: `🎉 ${result.milestone} Runs!`,
            description: `${striker.name} reaches a brilliant ${result.milestone}!`,
            duration: 5000,
          });
        } 
        else if (isWicket) {
          toast({
            title: '🎯 WICKET!',
            description: `${striker.name} is out ${wicketType}`,
            variant: 'destructive',
            duration: 4000,
          });
        }
        else if (parseInt(runs) === 6) {
          toast({
            title: '💥 SIX!',
            description: `That's gone all the way!`,
            duration: 3000,
          });
        }
        else if (parseInt(runs) === 4) {
          toast({
            title: '🏏 FOUR!',
            description: `Beautiful shot to the boundary`,
            duration: 2500,
          });
        }
        else {
          toast({
            title: 'Ball Recorded',
            description: `${runs} run(s) recorded successfully`,
          });
        }
        
        if (result.isDuck && isWicket) {
          setTimeout(() => {
            toast({
              title: '🦆 Duck',
              description: `${striker.name} departs without scoring`,
              variant: 'default',
            });
          }, 500);
        }
        
        if (result.isMaidenOver) {
          setTimeout(() => {
            toast({
              title: '🎯 Maiden Over!',
              description: `Excellent bowling by ${bowler.name}`,
            });
          }, 500);
        }

        onOpenChange(false);
        resetForm();
      } else {
        throw new Error('Failed to record ball');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record ball. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRuns('0');
    setIsWicket(false);
    setWicketType('');
    setExtraType('');
    setExtraRuns('0');
    setExtraRuns('0');
    setCoordinates(undefined);
    setFielderId('');
    setSecondaryFielderId('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto" data-testid="scoring-dialog">
        <DialogHeader>
          <DialogTitle>Record Ball</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Left Column: Wagon Wheel */}
          <div className="space-y-4">
            <Label>Shot Direction</Label>
            <WagonWheelInput 
              onCoordinateSelect={setCoordinates}
              selectedCoords={coordinates}
              className="w-full aspect-square max-w-[300px]"
              data-testid="wagon-wheel-input"
            />
            <p className="text-xs text-center text-muted-foreground">
              Click on the field to record shot placement
            </p>
          </div>

          {/* Right Column: Scoring Controls */}
          <div className="space-y-6">
            {/* Runs Scored */}
            <div className="space-y-3">
              <Label>Runs Scored off Bat</Label>
              <RadioGroup value={runs} onValueChange={setRuns} data-testid="runs-radio-group">
                <div className="grid grid-cols-4 gap-2">
                  {['0', '1', '2', '3', '4', '6'].map((r) => (
                    <div key={r} className="flex items-center space-x-2">
                      <RadioGroupItem value={r} id={`runs-${r}`} data-testid={`runs-${r}`} />
                      <Label htmlFor={`runs-${r}`} className="cursor-pointer">
                        {r}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Extras */}
            <div className="space-y-3">
              <Label>Extras</Label>
              <Select value={extraType} onValueChange={setExtraType}>
                <SelectTrigger data-testid="extras-select">
                  <SelectValue placeholder="No extras" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" data-testid="extra-none">No extras</SelectItem>
                  <SelectItem value="wide" data-testid="extra-wide">Wide</SelectItem>
                  <SelectItem value="noball" data-testid="extra-noball">No Ball</SelectItem>
                  <SelectItem value="bye" data-testid="extra-bye">Bye</SelectItem>
                  <SelectItem value="legbye" data-testid="extra-legbye">Leg Bye</SelectItem>
                </SelectContent>
              </Select>

              {extraType && (
                <div className="space-y-2">
                  <Label>Extra Runs</Label>
                  <RadioGroup value={extraRuns} onValueChange={setExtraRuns} data-testid="extra-runs-group">
                    <div className="grid grid-cols-4 gap-2">
                      {['0', '1', '2', '3', '4'].map((r) => (
                        <div key={r} className="flex items-center space-x-2">
                          <RadioGroupItem value={r} id={`extra-${r}`} data-testid={`extra-runs-${r}`} />
                          <Label htmlFor={`extra-${r}`} className="cursor-pointer">
                            {r}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>

            {/* Wicket */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="wicket"
                  checked={isWicket}
                  onChange={(e) => {
                    setIsWicket(e.target.checked);
                    if (!e.target.checked) setWicketType('');
                  }}
                  className="h-4 w-4"
                  data-testid="wicket-checkbox"
                />
                <Label htmlFor="wicket" className="cursor-pointer">
                  Wicket
                </Label>
              </div>

              {isWicket && (
                <div className="space-y-3">
                  <Select value={wicketType} onValueChange={setWicketType}>
                    <SelectTrigger data-testid="wicket-type-select">
                      <SelectValue placeholder="Select wicket type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bowled" data-testid="wicket-bowled">Bowled</SelectItem>
                      <SelectItem value="caught" data-testid="wicket-caught">Caught</SelectItem>
                      <SelectItem value="lbw" data-testid="wicket-lbw">LBW</SelectItem>
                      <SelectItem value="stumped" data-testid="wicket-stumped">Stumped</SelectItem>
                      <SelectItem value="runout" data-testid="wicket-runout">Run Out</SelectItem>
                      <SelectItem value="hitwicket" data-testid="wicket-hitwicket">Hit Wicket</SelectItem>
                    </SelectContent>
                  </Select>

                  {(wicketType === 'caught' || wicketType === 'runout') && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      <Label>Fielder</Label>
                      <Select value={fielderId} onValueChange={setFielderId}>
                        <SelectTrigger data-testid="fielder-select">
                          <SelectValue placeholder="Select fielder" />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldingSquad.map((player) => (
                            <SelectItem key={player.id} value={player.id} data-testid={`fielder-${player.id}`}>
                              {player.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {wicketType === 'runout' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      <Label>Secondary Fielder (Optional)</Label>
                      <Select value={secondaryFielderId} onValueChange={setSecondaryFielderId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assistant fielder" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {fieldingSquad
                            .filter(p => p.id !== fielderId)
                            .map((player) => (
                              <SelectItem key={player.id} value={player.id}>
                                {player.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} data-testid="submit-ball-button">
            {loading ? 'Recording...' : 'Record Ball'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
