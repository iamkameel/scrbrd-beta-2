import { PlayerForm } from "@/components/players/PlayerForm";
import { createPlayerAction } from "@/app/actions/playerActions";
import { fetchSchools } from "@/lib/firestore";

export default async function AddPersonPage() {
  const schools = await fetchSchools();

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add Person</h1>
        <p className="text-muted-foreground">Add a new player, coach, or staff member to the system.</p>
      </div>
      
      <PlayerForm 
        mode="create" 
        playerAction={createPlayerAction} 
        initialState={{}}
        schools={schools}
      />
    </div>
  );
}
