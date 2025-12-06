import { notFound } from "next/navigation";
import { getLeagueAction, updateLeagueAction } from "@/app/actions/leagueActions";
import { LeagueForm } from "@/components/leagues/LeagueForm";

export default async function EditLeaguePage({ params }: { params: { id: string } }) {
  const league = await getLeagueAction(params.id);

  if (!league) {
    notFound();
  }

  const initialState = {
    success: false,
    error: undefined,
    fieldErrors: undefined,
  };

  const boundUpdateAction = updateLeagueAction.bind(null, params.id);

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <LeagueForm 
        mode="edit"
        leagueAction={boundUpdateAction}
        initialState={initialState}
        initialData={league}
      />
    </div>
  );
}
