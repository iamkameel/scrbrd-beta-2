import { TeamForm } from "@/components/teams/TeamForm";
import { updateTeamAction } from "@/app/actions/teamActions";
import { fetchTeamById, fetchSchools, fetchDivisions } from "@/lib/firestore";
import { notFound } from "next/navigation";

interface EditTeamPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditTeamPage({ params }: EditTeamPageProps) {
  const { id } = await params;
  const [team, schools, divisions] = await Promise.all([
    fetchTeamById(id),
    fetchSchools(),
    fetchDivisions()
  ]);

  if (!team) {
    notFound();
  }

  const updateActionWithId = updateTeamAction.bind(null, team.id);

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Team</h1>
        <p className="text-muted-foreground">Update details for {team.name}.</p>
      </div>
      
      <TeamForm 
        mode="edit" 
        teamAction={updateActionWithId} 
        initialState={{}}
        initialData={team as any}
        schools={schools as any}
        divisions={divisions as any}
      />
    </div>
  );
}

