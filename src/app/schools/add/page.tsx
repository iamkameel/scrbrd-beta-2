import { SchoolForm } from '@/components/schools/SchoolForm';
import { createSchoolAction } from '@/app/actions/schoolActions';

export default function AddSchoolPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <SchoolForm
        mode="create"
        schoolAction={createSchoolAction}
        initialState={{}}
      />
    </div>
  );
}
