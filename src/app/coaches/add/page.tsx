import { CoachForm } from "@/components/coaches/CoachForm";
import { createCoachAction } from "@/app/actions/coachActions";
import { fetchSchools } from "@/lib/firestore";

export default async function AddCoachPage() {
  const schools = await fetchSchools();

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add Coach</h1>
        <p className="text-muted-foreground">Create a new coach profile with detailed attributes.</p>
      </div>
      
      <CoachForm 
        mode="create" 
        coachAction={createCoachAction} 
        initialState={{}}
        schools={schools as any}
      />
    </div>
  );
}
