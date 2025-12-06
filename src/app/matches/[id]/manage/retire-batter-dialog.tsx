"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface RetireBatterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  striker: { id: string; name: string } | null;
  nonStriker: { id: string; name: string } | null;
  onRetire: (playerId: string, type: 'retired_hurt' | 'retired_out') => void;
}

export function RetireBatterDialog({
  open,
  onOpenChange,
  striker,
  nonStriker,
  onRetire
}: RetireBatterDialogProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [retirementType, setRetirementType] = useState<'retired_hurt' | 'retired_out'>('retired_out');

  const handleConfirm = () => {
    if (!selectedPlayerId) return;
    onRetire(selectedPlayerId, retirementType);
    onOpenChange(false);
    setSelectedPlayerId("");
    setRetirementType('retired_out');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Retire Batter</DialogTitle>
          <DialogDescription>
            Select which batter to retire and the reason.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Select Batter */}
          <div>
            <Label className="mb-2 block">Select Batter</Label>
            <RadioGroup value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
              {striker && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={striker.id} id="striker" />
                  <Label htmlFor="striker" className="cursor-pointer">
                    {striker.name} (Striker)
                  </Label>
                </div>
              )}
              {nonStriker && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={nonStriker.id} id="non-striker" />
                  <Label htmlFor="non-striker" className="cursor-pointer">
                    {nonStriker.name} (Non-Striker)
                  </Label>
                </div>
              )}
            </RadioGroup>
          </div>

          {/* Retirement Type */}
          <div>
            <Label className="mb-2 block">Retirement Reason</Label>
            <RadioGroup value={retirementType} onValueChange={(v) => setRetirementType(v as 'retired_hurt' | 'retired_out')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="retired_out" id="retired-out" />
                <Label htmlFor="retired-out" className="cursor-pointer">
                  Retired Out
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="retired_hurt" id="retired-hurt" />
                <Label htmlFor="retired-hurt" className="cursor-pointer">
                  Retired Hurt
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedPlayerId}>
            Retire Batter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
