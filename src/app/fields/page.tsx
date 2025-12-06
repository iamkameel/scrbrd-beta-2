import { fieldService } from '@/services/fieldService';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MapPin, Plus } from "lucide-react";
import { FieldsClient } from "@/components/fields/FieldsClient";

export const dynamic = 'force-dynamic';

export default async function FieldsPage() {
  const fields = await fieldService.getAllFields();

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <MapPin className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Fields</h1>
          </div>
          <p className="text-muted-foreground">
            Browse cricket fields and grounds
          </p>
        </div>
        <Link href="/fields/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </Link>
      </div>

      <FieldsClient fields={fields} />
    </div>
  );
}
