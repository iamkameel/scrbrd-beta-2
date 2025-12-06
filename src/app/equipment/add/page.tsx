import { EquipmentForm } from '@/components/equipment/EquipmentForm';
import { createEquipmentAction } from '@/app/actions/equipmentActions';

export default function AddEquipmentPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <EquipmentForm
        mode="create"
        equipmentAction={createEquipmentAction}
        initialState={{}}
      />
    </div>
  );
}
