import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { Map } from "lucide-react";

export default function FieldDirectoryPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Map className="h-6 w-6 text-[hsl(var(--primary))]" /> Field Directory
          </CardTitle>
          <CardDescription>A comprehensive list of cricket playing fields and venues. (Feature Coming Soon)</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Image 
            src="https://placehold.co/600x400.png" 
            alt="Field Directory Placeholder" 
            width={600} 
            height={400} 
            className="mx-auto my-6 rounded-lg shadow-md"
            data-ai-hint="map location"
          />
          <p className="text-muted-foreground">
            This directory will provide details about various cricket grounds, including location, facilities,
            associated schools/clubs, and potentially pitch conditions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
