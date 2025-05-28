
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import Image from "next/image";

export default function SchoolsPage() {
  // Updated list of KwaZulu-Natal cricket playing high schools
  const schools = [
    { id: 1, name: "Michaelhouse", fields: ["Roy Gathorne Oval", "Hannahs Field"], location: "Balgowan" },
    { id: 2, name: "Hilton College", fields: ["Weightman-Smith Oval", "Hart-Davis Oval"], location: "Hilton" },
    { id: 3, name: "Maritzburg College", fields: ["Goldstones", "Varsity Oval"], location: "Pietermaritzburg" },
    { id: 4, name: "Glenwood High School", fields: ["Dixons", "The Subway"], location: "Durban" },
    { id: 5, name: "Durban High School (DHS)", fields: ["The Memorial Ground", "Seabreeze Oval"], location: "Durban" },
    { id: 6, name: "Kearsney College", fields: ["AH Smith Oval", "Matterson Field"], location: "Botha's Hill" },
    { id: 7, name: "Westville Boys' High School", fields: ["Bowsden's Field", "Commons Field"], location: "Westville" },
    { id: 8, name: "Northwood School", fields: ["Northwood Crusaders Main Oval", "Knights Field"], location: "Durban North" },
    { id: 9, name: "Clifton School", fields: ["Clifton Riverside Sports Campus", "College Field"], location: "Durban" },
    { id: 10, name: "St Charles College", fields: ["Samke Khumalo Oval", "College Oval"], location: "Pietermaritzburg" },
    { id: 11, name: "Crawford College La Lucia", fields: ["Main Cricket Field"], location: "La Lucia" },
    { id: 12, name: "Ashton International College Ballito", fields: ["Main Sports Field"], location: "Ballito" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">KwaZulu-Natal Cricket Schools</CardTitle>
          <CardDescription>Profiles of prominent cricket-playing high schools in KwaZulu-Natal.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.map((school) => (
              <Card key={school.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Image
                  src={`https://placehold.co/600x300.png`}
                  alt={`${school.name} campus`}
                  width={600}
                  height={300}
                  className="w-full h-48 object-cover"
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
