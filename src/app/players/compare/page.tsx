import { getPlayers } from '@/services/playerService';
import { PlayerComparison } from "@/components/players/PlayerComparison";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function PlayerComparePage() {
  const players = await getPlayers();

  return (
    <div className="container mx-auto py-8 max-w-7xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/players">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Players
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Compare Players</h1>
        <p className="text-muted-foreground mt-1">
          Select multiple players to compare their statistics side-by-side
        </p>
      </div>

      <PlayerComparison availablePlayers={players} />
    </div>
  );
}
