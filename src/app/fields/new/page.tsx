import { FieldForm } from "@/components/fields/FieldForm";
import { createFieldAction } from "@/app/actions/fieldActions";
import { fetchCollection } from "@/lib/firestore";
import { School } from "@/types/firestore";

export default async function NewFieldPage() {
  const schools = await fetchCollection<School>('schools');

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <FieldForm
        mode="create"
        fieldAction={createFieldAction}
        initialState={{}}
        schools={schools}
      />
    </div>
  );
}
