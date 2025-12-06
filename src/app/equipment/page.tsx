import { fetchEquipment } from "@/lib/firestore";
import { EquipmentList } from "@/components/equipment/EquipmentList";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";
import Link from "next/link";

export default async function EquipmentPage() {
  const equipment = await fetchEquipment();

  return (
    <div className="container mx-auto py-8 max-w-6xl space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Equipment Manager</h1>
          </div>
          <p className="text-muted-foreground">
            Track inventory, manage assignments, and monitor equipment condition.
          </p>
        </div>
        <Link href="/equipment/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Equipment
          </Button>
        </Link>
      </div>

      <EquipmentList initialEquipment={equipment as any[]} />
    </div>
  );
}


