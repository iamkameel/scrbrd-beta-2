// Umpire Profiles listing page

"use client";

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Search, UserCheck, CalendarClock, ShieldHalf, Loader2 } from "lucide-react";
import { fetchUmpires, type UmpireProfile } from '@/lib/umpire-data';
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

export default function UmpireProfilesPage() {
  const [umpires, setUmpires] = React.useState<UmpireProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [levelFilter, setLevelFilter] = React.useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = React.useState<string>("all");

  React.useEffect(() => {
    const loadUmpires = async () => {
      try {
        const data = await fetchUmpires();
        setUmpires(data);
      } catch (error) {
        console.error('Error loading umpires:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUmpires();
  }, []);

  const uniqueLevels = React.useMemo(() => {
    const levels = new Set(umpires.map(umpire => umpire.umpiringLevel));
    return ["all", ...Array.from(levels).sort()];
  }, [umpires]);

  const uniqueAvailabilities = React.useMemo(() => {
    const availabilities = new Set(umpires.map(umpire => umpire.availability));
    return ["all", ...Array.from(availabilities).sort()];
  }, [umpires]);

  const filteredUmpires = React.useMemo(() => {
    return umpires.filter(umpire => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === "" ||
        umpire.name.toLowerCase().includes(searchLower) ||
        (umpire.associatedClubOrUnion && umpire.associatedClubOrUnion.toLowerCase().includes(searchLower));

      const matchesLevel =
        levelFilter === "all" || umpire.umpiringLevel === levelFilter;

      const matchesAvailability =
        availabilityFilter === "all" || umpire.availability === availabilityFilter;

      return matchesSearch && matchesLevel && matchesAvailability;
    });
  }, [umpires, searchTerm, levelFilter, availabilityFilter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading umpires...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-[hsl(var(--primary))]" />
            Umpire Profiles
          </CardTitle>
          <CardDescription>Manage and view profiles of match umpires. Filter by umpiring level and availability.</CardDescription>
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
                    <ShieldHalf className="mr-2 h-4 w-4" />
                    Level: {levelFilter === "all" ? "All" : levelFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter by Umpiring Level</DropdownMenuLabel>
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

          {filteredUmpires.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUmpires.map((umpire) => (
                <Card key={umpire.id} className="hover:shadow-lg transition-shadow flex flex-col">
                  <CardHeader className="flex flex-row items-start gap-4 pb-3">
                    <Avatar className="h-16 w-16 mt-1">
                      <AvatarImage src={umpire.avatar} alt={umpire.name} data-ai-hint="person official" />
                      <AvatarFallback>{umpire.name.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{umpire.name}</CardTitle>
                      <CardDescription>
                        <Badge variant="secondary" className="mr-1.5">{umpire.umpiringLevel}</Badge>
                        <Badge variant="outline">{umpire.availability}</Badge>
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow py-3 space-y-2">
                     <div className="grid grid-cols-2 gap-2">
                        <CompactStatDisplay label="Experience" value={`${umpire.experienceYears} Yrs`} />
                        <CompactStatDisplay label="Matches" value={umpire.matchesOfficiatedCount} />
                     </div>
                     {umpire.associatedClubOrUnion && (
                        <p className="text-sm text-muted-foreground pt-1">Affiliation: {umpire.associatedClubOrUnion}</p>
                     )}
                  </CardContent>
                  <CardContent className="pt-2 pb-4 mt-auto">
                     <Button asChild variant="default" size="sm" className="w-full">
                        <Link href={`/umpire/${umpire.id}`}>View Full Profile</Link>
                      </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              {umpires.length === 0 
                ? "No umpires found in the database." 
                : "No umpires found matching your search or filters."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
