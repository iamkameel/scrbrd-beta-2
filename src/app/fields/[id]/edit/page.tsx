import { FieldForm } from "@/components/fields/FieldForm";
import { updateFieldAction } from "@/app/actions/fieldActions";
import { fetchDocument, fetchCollection } from "@/lib/firestore";
import { Field, School } from "@/types/firestore";
import { notFound } from "next/navigation";

export default async function EditFieldPage({ params }: { params: { id: string } }) {
  const [field, schools] = await Promise.all([
    fetchDocument<Field>('fields', params.id),
    fetchCollection<School>('schools')
  ]);

  if (!field) {
    notFound();
  }

  // Bind the field ID to the action
  const boundUpdateAction = updateFieldAction.bind(null, params.id);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <FieldForm
        mode="edit"
        fieldAction={boundUpdateAction}
        initialState={{}}
        initialData={field}
        schools={schools}
      />
    </div>
  );
}
