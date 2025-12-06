"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface EndInningsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  runs: number;
  wickets: number;
  overs: number;
}

export function EndInningsDialog({
  open,
  onOpenChange,
  onConfirm,
  runs,
  wickets,
  overs
}: EndInningsDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to end innings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>End First Innings?</DialogTitle>
          <DialogDescription>
            Are you sure you want to end the innings? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 text-center">
          <div className="text-4xl font-bold mb-2">
            {runs}/{wickets}
          </div>
          <div className="text-muted-foreground">
            in {overs} overs
          </div>
          <div className="mt-4 p-3 bg-muted rounded-md">
            Target for 2nd Innings: <span className="font-bold">{runs + 1}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? "Ending..." : "Confirm & Start Break"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
