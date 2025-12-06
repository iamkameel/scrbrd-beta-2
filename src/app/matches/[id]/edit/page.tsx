import { MatchForm } from "@/components/matches/MatchForm";
import { updateMatchAction } from "@/app/actions/matchActions";
import { fetchMatchById, fetchTeams, fetchFields } from "@/lib/firestore";
import { notFound } from "next/navigation";

interface EditMatchPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditMatchPage({ params }: EditMatchPageProps) {
  const { id } = await params;
  const [match, teams, fields] = await Promise.all([
    fetchMatchById(id),
    fetchTeams(),
    fetchFields()
  ]);

  if (!match) {
    notFound();
  }

  const updateActionWithId = updateMatchAction.bind(null, match.id);

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Match</h1>
        <p className="text-muted-foreground">Update match details.</p>
      </div>
      
      <MatchForm 
        mode="edit" 
        matchAction={updateActionWithId} 
        initialState={{}}
        initialData={match as any}
        teams={teams as any}
        fields={fields as any}
      />
    </div>
  );
}

