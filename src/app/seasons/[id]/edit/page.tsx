import { SeasonForm } from "@/components/seasons/SeasonForm";
import { updateSeasonAction } from "@/app/actions/seasonActions";
import { fetchSeasonById } from "@/lib/firestore";
import { notFound } from "next/navigation";

export default async function EditSeasonPage({ params }: { params: { id: string } }) {
  const season = await fetchSeasonById(params.id);

  if (!season) {
    notFound();
  }

  const updateAction = updateSeasonAction.bind(null, params.id);

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <SeasonForm 
        mode="edit" 
        seasonAction={updateAction} 
        initialState={{}} 
        initialData={season as any}
      />
    </div>
  );
}
