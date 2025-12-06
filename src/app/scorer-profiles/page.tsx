// Scorer Profiles listing page

"use client";

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Search, Briefcase, CalendarClock, FilePenLine, Loader2 } from "lucide-react";
import { fetchScorers, type ScorerProfile } from '@/lib/scorer-data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CompactStatDisplay: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
  <div className="text-center px-1">
    <p className="text-xs uppercase text-muted-foreground tracking-tight truncate">{label}</p>
    <p className="text-md font-semibold text-foreground">{value !== undefined ? String(value) : '-'}</p>
  </div>
);

export default function ScorerProfilesPage() {
  const [scorers, setScorers] = React.useState<ScorerProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [levelFilter, setLevelFilter] = React.useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = React.useState<string>("all");

  React.useEffect(() => {
    const loadScorers = async () => {
      try {
        const data = await fetchScorers();
        setScorers(data);
      } catch (error) {
        console.error('Error loading scorers:', error);
      } finally {
        setLoading(false);
      }
    };
    loadScorers();
  }, []);

  const uniqueLevels = React.useMemo(() => {
    const levels = new Set(scorers.map(scorer => scorer.scoringLevel));
    return ["all", ...Array.from(levels).sort()];
  }, [scorers]);

  const uniqueAvailabilities = React.useMemo(() => {
    const availabilities = new Set(scorers.map(scorer => scorer.availability));
    return ["all", ...Array.from(availabilities).sort()];
  }, [scorers]);

  const filteredScorers = React.useMemo(() => {
    return scorers.filter(scorer => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === "" ||
        scorer.name.toLowerCase().includes(searchLower) ||
        (scorer.associatedSchool && scorer.associatedSchool.toLowerCase().includes(searchLower));

      const matchesLevel =
        levelFilter === "all" || scorer.scoringLevel === levelFilter;

      const matchesAvailability =
        availabilityFilter === "all" || scorer.availability === availabilityFilter;

      return matchesSearch && matchesLevel && matchesAvailability;
    });
  }, [scorers, searchTerm, levelFilter, availabilityFilter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading scorers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <FilePenLine className="h-6 w-6 text-[hsl(var(--primary))]" />
            Scorer Profiles
          </CardTitle>
          <CardDescription>Manage and view profiles of match scorers. Filter by certification and availability.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name or affiliation..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-grow sm:flex-grow-0">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Level: {levelFilter === "all" ? "All" : levelFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter by Certification</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={levelFilter} onValueChange={setLevelFilter}>
                    {uniqueLevels.map(level => (
                      <DropdownMenuRadioItem key={level} value={level}>
                        {level === "all" ? "All Levels" : level}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-grow sm:flex-grow-0">
                    <CalendarClock className="mr-2 h-4 w-4" />
                    Availability: {availabilityFilter === "all" ? "All" : availabilityFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter by Availability</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                    {uniqueAvailabilities.map(avail => (
                      <DropdownMenuRadioItem key={avail} value={avail}>
                        {avail === "all" ? "All Availabilities" : avail}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {filteredScorers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScorers.map((scorer) => (
                <Card key={scorer.id} className="hover:shadow-lg transition-shadow flex flex-col">
                  <CardHeader className="flex flex-row items-start gap-4 pb-3">
                    <Avatar className="h-16 w-16 mt-1">
                      <AvatarImage src={scorer.avatar} alt={scorer.name} data-ai-hint="person portrait" />
                      <AvatarFallback>{scorer.name.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{scorer.name}</CardTitle>
                      <CardDescription>
                        <Badge variant="secondary" className="mr-1.5">{scorer.scoringLevel}</Badge>
                        <Badge variant="outline">{scorer.availability}</Badge>
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow py-3 space-y-2">
                     <div className="grid grid-cols-2 gap-2">
                        <CompactStatDisplay label="Experience" value={`${scorer.experienceYears} Yrs`} />
                        <CompactStatDisplay label="Matches" value={scorer.matchesScoredCount} />
                     </div>
                     {scorer.associatedSchool && (
                        <p className="text-sm text-muted-foreground pt-1">Affiliation: {scorer.associatedSchool}</p>
                     )}
                  </CardContent>
                  <CardContent className="pt-2 pb-4 mt-auto">
                     <Button asChild variant="default" size="sm" className="w-full">
                        <Link href={`/scorer/${scorer.id}`}>View Full Profile</Link>
                      </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              {scorers.length === 0 
                ? "No scorers found in the database." 
                : "No scorers found matching your search or filters."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
