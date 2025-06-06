"use client";
import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query as firestoreQuery, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Filter as FilterIcon, ListTree, School as SchoolIcon, Loader2, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
const fetchSchools = async () => {
    const schoolsCollectionRef = collection(db, 'schools');
    const q = firestoreQuery(schoolsCollectionRef, orderBy('name')); // Order by name for consistent listing
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }));
};
export default function SchoolsPage() {
    const [searchTerm, setSearchTerm] = React.useState("");
    const [locationFilter, setLocationFilter] = React.useState("all");
    const { data: schools, isLoading, isError, error } = useQuery({
        queryKey: ['schools'],
        queryFn: fetchSchools,
    });
    const uniqueLocations = React.useMemo(() => {
        if (!schools)
            return ["all"];
        const locations = new Set(schools.map(school => school.location));
        return ["all", ...Array.from(locations).sort()];
    }, [schools]);
    const filteredSchools = React.useMemo(() => {
        if (!schools)
            return [];
        return schools.filter(school => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = searchTerm === "" ||
                school.name.toLowerCase().includes(searchLower) ||
                school.location.toLowerCase().includes(searchLower);
            const matchesLocation = locationFilter === "all" || school.location === locationFilter;
            return matchesSearch && matchesLocation;
        });
    }, [searchTerm, locationFilter, schools]);
    if (isLoading) {
        return (<div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
        <p className="ml-2 text-muted-foreground">Loading schools...</p>
      </div>);
    }
    if (isError) {
        return (<Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-6 w-6"/> Error Loading Schools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">There was a problem fetching schools from the database.</p>
          <p className="text-xs text-muted-foreground mt-2">Details: {error?.message}</p>
        </CardContent>
      </Card>);
    }
    return (<div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <SchoolIcon className="h-6 w-6 text-[hsl(var(--primary))]"/> 
            School Profiles
          </CardTitle>
          <CardDescription>
            Discover KwaZulu-Natal's cricket-playing high schools. Filter by name or location.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
              <Input placeholder="Search by school name..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-grow sm:flex-grow-0">
                  <FilterIcon className="mr-2 h-4 w-4"/>
                  Location: {locationFilter === "all" ? "All" : locationFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Filter by Location</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={locationFilter} onValueChange={setLocationFilter}>
                  {uniqueLocations.map(loc => (<DropdownMenuRadioItem key={loc} value={loc}>
                      {loc === "all" ? "All Locations" : loc}
                    </DropdownMenuRadioItem>))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {filteredSchools.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchools.map((school) => (<Card key={school.id} className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 rounded-lg flex flex-col">
                  <Image src={school.bannerImageUrl || `https://placehold.co/600x300.png`} alt={`${school.name} campus`} width={600} height={300} className="w-full h-40 object-cover" data-ai-hint="school campus sport"/>
                  <CardHeader className="flex flex-row items-center gap-3 pb-3 pt-4">
                     <Image src={school.crestUrl || 'https://placehold.co/80x80.png'} alt={`${school.name} crest`} width={50} height={50} className="rounded-md object-contain border bg-background p-0.5 shadow-sm" data-ai-hint="school crest logo"/>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{school.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm flex-grow">
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground"/>
                      <Badge variant="secondary" className="text-xs">{school.location}</Badge>
                    </div>
                    <div className="flex items-center">
                      <ListTree className="mr-2 h-4 w-4 text-muted-foreground"/>
                      <span className="text-muted-foreground">
                        {school.fields?.length || 0} Playing Field{school.fields?.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {school.fields && school.fields.length > 0 && (<div>
                        <p className="font-medium text-xs text-muted-foreground mb-0.5">Fields:</p>
                        <ul className="list-disc list-inside pl-1 space-y-0.5 text-xs">
                          {school.fields.slice(0, 2).map(field => <li key={field} className="truncate" title={field}>{field}</li>)}
                          {school.fields.length > 2 && <li className="text-muted-foreground/80 text-xs">...and {school.fields.length - 2} more</li>}
                        </ul>
                      </div>)}
                  </CardContent>
                   <CardContent className="pt-3 pb-4 border-t mt-auto">
                     <Button asChild variant="outline" size="sm" className="w-full text-primary hover:bg-primary/10">
                        <Link href={`/schools/${school.id}`}>View School Details</Link>
                     </Button>
                   </CardContent>
                </Card>))}
            </div>) : (<p className="text-center text-muted-foreground py-4">No schools found matching your search or filters.</p>)}
        </CardContent>
      </Card>
    </div>);
}
