import { createLeagueAction } from "@/app/actions/leagueActions";
import { LeagueForm } from "@/components/leagues/LeagueForm";

export default function AddLeaguePage() {
  const initialState = {
    success: false,
    error: undefined,
    fieldErrors: undefined,
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <LeagueForm 
        mode="create"
        leagueAction={createLeagueAction}
        initialState={initialState}
      />
    </div>
  );
}
