"use client";
import * as React from "react";
import Link from "next/link"; // Import Link
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import Image from "next/image";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
// Placeholder data:
import { detailedTeamsData } from "@/lib/team-data";
export default function TeamsPage() {
    const [searchTerm, setSearchTerm] = React.useState("");
    const [ageGroupFilter, setAgeGroupFilter] = React.useState("all");
    const [divisionFilter, setDivisionFilter] = React.useState("all");
    const filteredTeams = React.useMemo(() => {
        return detailedTeamsData.filter((team) => {
            const matchesSearch = team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                team.affiliation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (team.mascot && team.mascot.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesAgeGroup = ageGroupFilter === "all" || team.ageGroup === ageGroupFilter;
            const matchesDivision = divisionFilter === "all" || team.division === divisionFilter;
            return matchesSearch && matchesAgeGroup && matchesDivision;
        });
    }, [searchTerm, ageGroupFilter, divisionFilter]);
    const uniqueAgeGroups = React.useMemo(() => {
        const ageGroups = new Set(detailedTeamsData.map(team => team.ageGroup));
        return ["all", ...Array.from(ageGroups).sort()];
    }, [detailedTeamsData]);
    const uniqueDivisions = React.useMemo(() => {
        const divisions = new Set(detailedTeamsData.map(team => team.division));
        return ["all", ...Array.from(divisions).sort()];
    }, [searchTerm, ageGroupFilter, divisionFilter]);
    return (<div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Team Directory</CardTitle>
          <CardDescription>Search and browse cricket teams by affiliation, age group, and division.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
              <Input placeholder="Search teams by name, affiliation, mascot..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
            </div>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-grow sm:flex-grow-0">
                    <Filter className="mr-2 h-4 w-4"/>
                    Age: {ageGroupFilter === "all" ? "All" : ageGroupFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter by Age Group</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={ageGroupFilter} onValueChange={setAgeGroupFilter}>
                    {uniqueAgeGroups.map(ageGroup => (<DropdownMenuRadioItem key={ageGroup} value={ageGroup}>
                        {ageGroup === "all" ? "All Age Groups" : ageGroup}
                      </DropdownMenuRadioItem>))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-grow sm:flex-grow-0">
                    <Filter className="mr-2 h-4 w-4"/>
                    Division: {divisionFilter === "all" ? "All" : divisionFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter by Division</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={divisionFilter} onValueChange={setDivisionFilter}>
                    {uniqueDivisions.map(division => (<DropdownMenuRadioItem key={division} value={division}>
                        {division === "all" ? "All Divisions" : division}
                      </DropdownMenuRadioItem>))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {filteredTeams.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((team) => (<Card key={team.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <Image src={`https://placehold.co/600x400.png`} alt={`${team.affiliation} ${team.teamName} ${team.mascot ? `(${team.mascot})` : ''} Logo/Crest`} width={600} height={400} className="w-full h-48 object-cover" data-ai-hint="team crest"/>
                  <CardHeader>
                    <CardTitle>{team.affiliation} - {team.teamName}</CardTitle>
                    {team.mascot && <CardDescription>Nickname: {team.mascot}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Age Group: {team.ageGroup}</p>
                      <p>Division: {team.division}</p>
                    </div>
                    <Button asChild variant="link" className="p-0 h-auto mt-2 text-primary">
                      <Link href={`/teams/${team.id}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>))}
            </div>) : (<div className="text-center py-10">
              <p className="text-lg text-muted-foreground">No teams match your current filters.</p>
            </div>)}
        </CardContent>
      </Card>
    </div>);
}
