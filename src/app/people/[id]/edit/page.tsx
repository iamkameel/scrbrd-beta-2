import { fetchPersonById, fetchSchools } from "@/lib/firestore";
import { PlayerForm } from "@/components/players/PlayerForm";
import { updatePlayerAction } from "@/app/actions/playerActions";
import { updateCoachAction, CoachActionState } from "@/app/actions/coachActions";
import { notFound } from "next/navigation";
import { PlayerActionState } from "@/app/actions/playerActions";
import { CoachForm } from "@/components/coaches/CoachForm";
import { USER_ROLES } from "@/lib/roles";

export default async function EditPersonPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  const [person, schools] = await Promise.all([
    fetchPersonById(id),
    fetchSchools()
  ]);

  if (!person) {
    notFound();
  }

  // Create a wrapper action that matches the expected signature
  async function handleUpdate(prevState: PlayerActionState, formData: FormData): Promise<PlayerActionState> {
    'use server';
    return updatePlayerAction(id, prevState, formData);
  }

  // Initial state for the form
  const initialState: PlayerActionState = {
    success: false,
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Person</h1>
        <p className="text-muted-foreground">
          Update information for {person.firstName} {person.lastName}
        </p>
      </div>
      
      
      {(person.role === USER_ROLES.COACH || person.role === USER_ROLES.ASSISTANT_COACH) ? (
        <CoachForm 
          mode="edit" 
          coachAction={async (prevState, formData) => {
            'use server';
            return updateCoachAction(id, prevState, formData);
          }} 
          initialState={{ success: false }}
          initialData={person}
          schools={schools}
        />
      ) : (
        <PlayerForm 
          mode="edit" 
          playerAction={handleUpdate} 
          initialState={initialState}
          initialData={person}
          schools={schools}
        />
      )}
    </div>
  );
}
