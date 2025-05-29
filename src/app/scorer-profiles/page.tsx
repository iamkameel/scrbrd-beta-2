import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { FilePenLine } from "lucide-react";

export default function ScorerProfilesPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <FilePenLine className="h-6 w-6 text-[hsl(var(--primary))]" /> Scorer Profiles
          </CardTitle>
          <CardDescription>Manage and view profiles of match scorers. (Feature Coming Soon)</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Image 
            src="https://placehold.co/600x400.png" 
            alt="Scorer Profiles Placeholder" 
            width={600} 
            height={400} 
            className="mx-auto my-6 rounded-lg shadow-md"
            data-ai-hint="profiles list"
          />
          <p className="text-muted-foreground">
            This section will allow administrators to manage scorer accounts, view their assignment history,
            and track performance or certifications.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
