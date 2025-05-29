import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { Tractor } from "lucide-react";

export default function GroundskeeperProfilesPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Tractor className="h-6 w-6 text-[hsl(var(--primary))]" /> Groundskeeper Profiles
          </CardTitle>
          <CardDescription>Directory of groundskeepers and their assigned fields. (Feature Coming Soon)</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Image 
            src="https://placehold.co/600x400.png" 
            alt="Groundskeeper Profiles Placeholder" 
            width={600} 
            height={400} 
            className="mx-auto my-6 rounded-lg shadow-md"
            data-ai-hint="worker field"
          />
          <p className="text-muted-foreground">
            This area will list groundskeepers, the venues they manage, and potentially link to pitch reports
            or maintenance schedules.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
