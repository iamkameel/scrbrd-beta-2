
"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Filter as FilterIcon, ListTree, School } from "lucide-react"; // Added School icon
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

// Updated list of KwaZulu-Natal cricket playing high schools
const schoolsData = [
  { id: 1, name: "Michaelhouse", fields: ["Roy Gathorne Oval", "Hannahs Field"], location: "Balgowan", crestUrl: "https://placehold.co/80x80.png" },
  { id: 2, name: "Hilton College", fields: ["Weightman-Smith Oval", "Hart-Davis Oval"], location: "Hilton", crestUrl: "https://placehold.co/80x80.png" },
  { id: 3, name: "Maritzburg College", fields: ["Goldstones", "Varsity Oval", "Bavers"], location: "Pietermaritzburg", crestUrl: "https://placehold.co/80x80.png" },
  { id: 4, name: "Glenwood High School", fields: ["Dixons", "The Subway"], location: "Durban", crestUrl: "https://placehold.co/80x80.png" },
  { id: 5, name: "Durban High School (DHS)", fields: ["The Memorial Ground", "Seabreeze Oval"], location: "Durban", crestUrl: "https://placehold.co/80x80.png" },
  { id: 6, name: "Kearsney College", fields: ["AH Smith Oval", "Matterson Field"], location: "Botha's Hill", crestUrl: "https://placehold.co/80x80.png" },
  { id: 7, name: "Westville Boys' High School", fields: ["Bowsden's Field", "Commons Field", "Roy Couzens Oval"], location: "Westville", crestUrl: "https://placehold.co/80x80.png" },
  { id: 8, name: "Northwood School", fields: ["Northwood Crusaders Main Oval", "Knights Field"], location: "Durban North", crestUrl: "https://placehold.co/80x80.png" },
  { id: 9, name: "Clifton School", fields: ["Clifton Riverside Sports Campus", "College Field"], location: "Durban", crestUrl: "https://placehold.co/80x80.png" },
  { id: 10, name: "St Charles College", fields: ["Samke Khumalo Oval", "College Oval"], location: "Pietermaritzburg", crestUrl: "https://placehold.co/80x80.png" },
  { id: 11, name: "Crawford College La Lucia", fields: ["Main Cricket Field"], location: "La Lucia", crestUrl: "https://placehold.co/80x80.png" },
  { id: 12, name: "Ashton International College Ballito", fields: ["Main Sports Field"], location: "Ballito", crestUrl: "https://placehold.co/80x80.png" },
];

export default function SchoolsPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [locationFilter, setLocationFilter] = React.useState("all");

  const uniqueLocations = React.useMemo(() => {
    const locations = new Set(schoolsData.map(school => school.location));
    return ["all", ...Array.from(locations).sort()];
  }, []);

  const filteredSchools = React.useMemo(() => {
    return schoolsData.filter(school => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === "" ||
        school.name.toLowerCase().includes(searchLower) ||
        school.location.toLowerCase().includes(searchLower);

      const matchesLocation =
        locationFilter === "all" || school.location === locationFilter;

      return matchesSearch && matchesLocation;
    });
  }, [searchTerm, locationFilter]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <School className="h-6 w-6 text-[hsl(var(--primary))]" /> 
            School Profiles
          </CardTitle>
          <CardDescription>
            Discover KwaZulu-Natal's cricket-playing high schools. Filter by name or location.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by school name..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-grow sm:flex-grow-0">
                  <FilterIcon className="mr-2 h-4 w-4" />
                  Location: {locationFilter === "all" ? "All" : locationFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Filter by Location</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={locationFilter} onValueChange={setLocationFilter}>
                  {uniqueLocations.map(loc => (
                    <DropdownMenuRadioItem key={loc} value={loc}>
                      {loc === "all" ? "All Locations" : loc}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {filteredSchools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchools.map((school) => (
                <Card key={school.id} className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 rounded-lg flex flex-col">
                  <div className="relative">
                    <Image
                      src={`https://placehold.co/600x300.png`} // General campus image
                      alt={`${school.name} campus`}
                      width={600}
                      height={300}
                      className="w-full h-40 object-cover"
                      data-ai-hint="school campus sport"
                    />
                    <div className="absolute bottom-2 left-2 bg-background/80 p-1.5 rounded-full shadow-lg">
                       <Image
                        src={school.crestUrl} // School crest
                        alt={`${school.name} crest`}
                        width={50}
                        height={50}
                        className="rounded-full object-contain"
                        data-ai-hint="school crest logo"
                      />
                    </div>
                  </div>
                  <CardHeader className="pb-3 pt-4">
                    <CardTitle className="text-lg">{school.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm flex-grow">
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Badge variant="secondary" className="text-xs">{school.location}</Badge>
                    </div>
                    <div className="flex items-center">
                      <ListTree className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {school.fields.length} Playing Field{school.fields.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-xs text-muted-foreground mb-0.5">Fields:</p>
                      <ul className="list-disc list-inside pl-1 space-y-0.5 text-xs">
                        {school.fields.slice(0, 2).map(field => <li key={field} className="truncate" title={field}>{field}</li>)}
                        {school.fields.length > 2 && <li className="text-muted-foreground/80 text-xs">...and {school.fields.length - 2} more</li>}
                      </ul>
                    </div>
                  </CardContent>
                   <CardContent className="pt-3 pb-4 border-t mt-auto">
                     <Button variant="outline" size="sm" className="w-full text-primary hover:bg-primary/10">
                        View School Details {/* Placeholder for future navigation */}
                     </Button>
                   </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No schools found matching your search or filters.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
