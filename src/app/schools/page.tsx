import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import Image from "next/image";

export default function SchoolsPage() {
  // Placeholder data
  const schools = [
    { id: 1, name: "Northwood School", fields: ["Main Oval", "West Field"], location: "Greenwood City" },
    { id: 2, name: "Riverdale Academy", fields: ["Academy Ground"], location: "Riverdale Town" },
    { id: 3, name: "Hillcrest College", fields: ["College Green", "Sports Complex Pitch 1"], location: "Hillcrest Heights" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">School Profiles</CardTitle>
          <CardDescription>Information about schools and their playing fields.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schools.map((school) => (
              <Card key={school.id} className="hover:shadow-lg transition-shadow">
                <Image 
                  src={`https://placehold.co/600x300.png`} 
                  alt={`${school.name} campus`} 
                  width={600} 
                  height={300} 
                  className="w-full h-40 object-cover"
                  data-ai-hint="school campus"
                />
                <CardHeader>
                  <CardTitle>{school.name}</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    {school.location}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-sm mb-1">Playing Fields:</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {school.fields.map(field => <li key={field}>{field}</li>)}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
