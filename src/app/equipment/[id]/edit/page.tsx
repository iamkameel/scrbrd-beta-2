import { fetchDocument } from '@/lib/firestore';
import { EquipmentForm } from '@/components/equipment/EquipmentForm';
import { updateEquipmentAction } from '@/app/actions/equipmentActions';
import { Equipment } from "@/types/firestore";
import { notFound } from 'next/navigation';

export default async function EditEquipmentPage({ params }: { params: { id: string } }) {
  const equipment = await fetchDocument<Equipment>('equipment', params.id);

  if (!equipment) {
    notFound();
  }

  // Bind the equipment ID to the action
  const boundUpdateAction = updateEquipmentAction.bind(null, params.id);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <EquipmentForm
        mode="edit"
        equipmentAction={boundUpdateAction}
        initialState={{}}
        initialData={{
          name: equipment.name,
          type: equipment.type,
          brand: equipment.brand,
          category: equipment.category,
          status: equipment.status as any,
          condition: equipment.condition as any,
          quantity: equipment.quantity,
          assignedTo: equipment.assignedTo,
          cost: equipment.cost,
        }}
      />
    </div>
  );
}
