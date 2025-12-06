import { PlayerForm } from "@/components/players/PlayerForm";
import { createPlayerAction } from "@/app/actions/playerActions";
import { fetchSchools } from "@/lib/firestore";

export default async function AddPlayerPage() {
  const schools = await fetchSchools();

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add Player</h1>
        <p className="text-muted-foreground">Create a new player profile.</p>
      </div>
      
      <PlayerForm 
        mode="create" 
        playerAction={createPlayerAction} 
        initialState={{}}
        schools={schools as any}
      />
    </div>
  );
}

