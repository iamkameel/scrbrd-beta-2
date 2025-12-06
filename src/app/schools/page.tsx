import { fetchSchools } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, GraduationCap } from "lucide-react";
import { SchoolsClient } from "@/components/schools/SchoolsClient";

export const dynamic = 'force-dynamic';

export default async function SchoolsPage() {
  const schools = await fetchSchools();

  return (
    <div className="container mx-auto py-8 max-w-6xl space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Schools</h1>
          </div>
          <p className="text-muted-foreground">
            Manage schools, view profiles, and track performance
          </p>
        </div>
        <Link href="/schools/add">
          <Button className="bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4 mr-2" />
            Add School
          </Button>
        </Link>
      </div>

      <SchoolsClient schools={schools} />
    </div>
  );
}
