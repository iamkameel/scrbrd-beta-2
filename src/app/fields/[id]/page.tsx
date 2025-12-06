import { fetchFieldById } from "@/lib/firestore";
import { notFound } from "next/navigation";
import { FieldDetailClient } from "@/components/fields/FieldDetailClient";

interface FieldPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function FieldPage({ params }: FieldPageProps) {
  const { id } = await params;
  const field = await fetchFieldById(id);

  if (!field) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <FieldDetailClient field={field as any} />
    </div>
  );
}

