import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { UserCheck } from "lucide-react";

export default function UmpireProfilesPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-[hsl(var(--primary))]" /> Umpire Profiles
          </CardTitle>
          <CardDescription>Manage and view profiles of match umpires. (Feature Coming Soon)</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Image 
            src="https://placehold.co/600x400.png" 
            alt="Umpire Profiles Placeholder" 
            width={600} 
            height={400} 
            className="mx-auto my-6 rounded-lg shadow-md"
            data-ai-hint="official person"
          />
          <p className="text-muted-foreground">
            This section will enable management of umpire profiles, their availability, match assignments,
            and any relevant ratings or feedback.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
