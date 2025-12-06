"use client";

import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MATCH_STATES } from "@/lib/matchStates";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface StartSecondInningsButtonProps {
  matchId: string;
}

export function StartSecondInningsButton({ matchId }: StartSecondInningsButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStart = async () => {
    try {
      setIsLoading(true);
      const matchRef = doc(db, 'matches', matchId);
      
      // Update state to LIVE and set currentInnings to 2
      await updateDoc(matchRef, {
        state: MATCH_STATES.LIVE,
        'liveData.currentInnings': 2,
        lastUpdated: new Date().toISOString()
      });

      toast.success('Second innings started!');
      router.refresh();
    } catch (error) {
      console.error('Error starting second innings:', error);
      toast.error('Failed to start second innings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleStart} disabled={isLoading}>
      <Play className="h-4 w-4 mr-2" />
      {isLoading ? 'Starting...' : 'Start 2nd Innings'}
    </Button>
  );
}
