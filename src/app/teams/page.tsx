import { fetchTeams, fetchSchools, fetchDivisions } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Shield } from "lucide-react";
import { TeamsClient } from "@/components/teams/TeamsClient";

export const dynamic = 'force-dynamic';

export default async function TeamsPage() {
  const [teams, schools, divisions] = await Promise.all([
    fetchTeams(),
    fetchSchools(),
    fetchDivisions()
  ]);

  return (
    <div className="container mx-auto py-8 max-w-6xl space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Teams</h1>
          </div>
          <p className="text-muted-foreground">
            Manage team rosters and view team statistics
          </p>
        </div>
        <Link href="/teams/add">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Team
          </Button>
        </Link>
      </div>

      <TeamsClient teams={teams} schools={schools} divisions={divisions} />
    </div>
  );
}
