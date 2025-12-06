import { FixtureWizard } from "@/components/fixtures/FixtureWizard";
import { fetchTeams, fetchFields } from "@/lib/firestore";

export default async function CreateFixturePage() {
  const [teams, fields] = await Promise.all([
    fetchTeams(),
    fetchFields() as Promise<any[]>
  ]);

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Schedule New Match</h1>
        <p className="text-muted-foreground">
          Use the smart scheduler to create a fixture with automatic conflict detection.
        </p>
      </div>
      
      <FixtureWizard 
        teams={teams}
        fields={fields}
      />
    </div>
  );
}