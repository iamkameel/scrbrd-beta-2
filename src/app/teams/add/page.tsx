import { SmartTeamCreator } from "@/components/teams/SmartTeamCreator";
import { fetchSchools, fetchDivisions, fetchActiveSeason } from "@/lib/firestore";

export default async function AddTeamPage() {
  const [schools, divisions, activeSeason] = await Promise.all([
    fetchSchools(),
    fetchDivisions(),
    fetchActiveSeason()
  ]);

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Team</h1>
        <p className="text-muted-foreground">
          Use the smart builder to create a team, assign coaches, and prevent duplicates.
        </p>
      </div>
      
      <SmartTeamCreator 
        schools={schools}
        divisions={divisions}
        activeSeason={activeSeason}
      />
    </div>
  );
}
