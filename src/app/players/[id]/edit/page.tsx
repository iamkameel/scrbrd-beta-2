import { PlayerForm } from "@/components/players/PlayerForm";
import { updatePlayerAction } from "@/app/actions/playerActions";
import { fetchPersonById, fetchSchools } from "@/lib/firestore";
import { notFound } from "next/navigation";

interface EditPlayerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPlayerPage({ params }: EditPlayerPageProps) {
  const { id } = await params;
  const [player, schools] = await Promise.all([
    fetchPersonById(id),
    fetchSchools()
  ]);

  if (!player || player.role !== 'Player') {
    notFound();
  }

  const updateActionWithId = updatePlayerAction.bind(null, player.id);

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Player</h1>
        <p className="text-muted-foreground">Update profile for {player.firstName} {player.lastName}.</p>
      </div>
      
      <PlayerForm 
        mode="edit" 
        playerAction={updateActionWithId} 
        initialState={{}}
        initialData={player as any}
        schools={schools as any}
      />
    </div>
  );
}

