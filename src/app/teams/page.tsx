import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import Image from "next/image";

export default function TeamsPage() {
  // Placeholder data
  const teams = [
    { id: 1, name: "Eagles High School", affiliation: "Northwood School", division: "A", suffix: "Eagles" },
    { id: 2, name: "Panthers Academy", affiliation: "Riverdale Academy", division: "B", suffix: "Panthers" },
    { id: 3, name: "Lions College", affiliation: "Hillcrest College", division: "A", suffix: "Lions" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Team Directory</CardTitle>
          <CardDescription>Search and browse cricket teams.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search teams..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Card key={team.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Image 
                  src={`https://placehold.co/600x400.png`} 
                  alt={`${team.name} crest`} 
                  width={600} 
                  height={400} 
                  className="w-full h-48 object-cover"
                  data-ai-hint="team crest" 
                />
                <CardHeader>
                  <CardTitle>{team.name} {team.suffix}</CardTitle>
                  <CardDescription>{team.affiliation}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Division: {team.division}</p>
                  <Button variant="link" className="p-0 h-auto mt-2">View Details</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
