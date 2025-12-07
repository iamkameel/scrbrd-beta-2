import { MatchWizard } from "@/components/matches/MatchWizard";
import { createMatchAction } from "@/app/actions/matchActions";
import { fetchTeams, fetchFields, fetchSchools, fetchDivisions } from "@/lib/firestore";

export default async function AddMatchPage() {
  const [teams, fields, schools, divisions] = await Promise.all([
    fetchTeams(),
    fetchFields(),
    fetchSchools(),
    fetchDivisions()
  ]);

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Schedule Match</h1>
        <p className="text-muted-foreground">Create a new match fixture with our step-by-step wizard.</p>
      </div>
      
      <MatchWizard 
        mode="create" 
        matchAction={createMatchAction} 
        initialState={{}}
        teams={teams as any}
        fields={fields as any}
        schools={schools as any}
        divisions={divisions as any}
      />
    </div>
  );
}
