import { fetchTeams } from '@/lib/firestore';
import { TeamComparison } from "@/components/teams/TeamComparison";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function TeamComparePage() {
  const teams = await fetchTeams();

  return (
    <div className="container mx-auto py-8 max-w-6xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/teams">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Teams
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Compare Teams</h1>
        <p className="text-muted-foreground mt-1">
          View head-to-head statistics between teams
        </p>
      </div>

      <TeamComparison teams={teams} />
    </div>
  );
}
