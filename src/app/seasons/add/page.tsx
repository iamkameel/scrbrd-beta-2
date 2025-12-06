import { SeasonForm } from "@/components/seasons/SeasonForm";
import { createSeasonAction } from "@/app/actions/seasonActions";

export default function AddSeasonPage() {
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <SeasonForm 
        mode="create" 
        seasonAction={createSeasonAction} 
        initialState={{}} 
      />
    </div>
  );
}
