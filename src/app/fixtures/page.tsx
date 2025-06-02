
"use client";

import * as React from 'react';
import Link from "next/link";
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, Timestamp, orderBy, query as firestoreQuery } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, MapPin, ListChecks, AlertTriangle, Loader2, Users, Shield, BarChart2, Info } from "lucide-react";
import { format, isFuture, subDays, isWithinInterval, parseISO, isValid } from 'date-fns';
import { cn } from "@/lib/utils";
import { detailedTeamsData, type Team } from '@/lib/team-data'; // For team names and age groups
import { umpiresData, type UmpireProfile } from '@/lib/umpire-data'; // For umpire names
import { scorersData, type ScorerProfile } from '@/lib/scorer-data'; // For scorer names

// Interface for the data structure of a fixture coming from Firestore
interface FirestoreFixture {
  id: string; // Firestore document ID
  homeTeamId: string;
  // homeTeamName?: string; // We will fetch this
  awayTeamId: string;
  // awayTeamName?: string; // We will fetch this
  matchType: 'T20' | 'ODI' | 'Test';
  venueId: string; // Stores field name for now
  scheduledDate: Timestamp | null;
  time: string;
  overs?: number; // Optional, might not be set for Test
  ageGroup: string; // Should be available from fixture data or home team
  status: 'Scheduled' | 'Team Confirmed' | 'Ground Ready' | 'Live' | 'Completed' | 'Match Abandoned' | 'Rain-Delay' | 'Play Suspended';
  umpireIds: string[];
  scorerId: string | null;
  division?: string | null;
  leagueId?: string | null;
  provinceId?: string | null;
  createdAt?: Timestamp;
}

// Expanded Interface for how we want to display fixtures in the UI
export interface DisplayFixture {
  id: string;
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId: string;
  awayTeamName: string;
  date: string; // Formatted date string 'yyyy-MM-dd'
  displayDate: string; // Formatted for display 'EEE, MMM d, yyyy'
  time: string;
  location: string;
  status: FirestoreFixture['status'];
  matchType: FirestoreFixture['matchType'];
  ageGroup?: string;
  division?: string | null;
  umpiresDisplay?: string;
  scorerName?: string | null;
}

const fetchFixtures = async (): Promise<DisplayFixture[]> => {
  const fixturesCollectionRef = collection(db, 'fixtures');
  const q = firestoreQuery(fixturesCollectionRef, orderBy('scheduledDate', 'desc')); // Order by scheduledDate
  const querySnapshot = await getDocs(q);
  
  const fixturesList = querySnapshot.docs.reduce((acc, doc) => {
    const data = doc.data() as Omit<FirestoreFixture, 'id'>;
    
    if (data.scheduledDate && typeof data.scheduledDate.toDate === 'function') {
      const scheduledDateTime = data.scheduledDate.toDate();
      if (isValid(scheduledDateTime)) {
        const homeTeam = detailedTeamsData.find(t => t.id === data.homeTeamId);
        const awayTeam = detailedTeamsData.find(t => t.id === data.awayTeamId);

        const umpiresDisplayList = data.umpireIds && data.umpireIds.length > 0
          ? data.umpireIds.map(id => umpiresData.find(u => u.id === id)?.name || id).filter(Boolean).join(', ')
          : 'N/A';
        
        const scorerInfo = data.scorerId ? scorersData.find(s => s.id === data.scorerId) : null;

        acc.push({
          id: doc.id,
          homeTeamId: data.homeTeamId,
          homeTeamName: homeTeam?.teamName || data.homeTeamId,
          awayTeamId: data.awayTeamId,
          awayTeamName: awayTeam?.teamName || data.awayTeamId,
          date: format(scheduledDateTime, 'yyyy-MM-dd'),
          displayDate: format(scheduledDateTime, 'EEE, MMM d, yyyy'),
          time: data.time,
          location: data.venueId,
          status: data.status,
          matchType: data.matchType,
          ageGroup: data.ageGroup || homeTeam?.ageGroup || 'N/A',
          division: data.division || homeTeam?.division || 'N/A',
          umpiresDisplay: umpiresDisplayList,
          scorerName: scorerInfo?.name || 'N/A',
        } as DisplayFixture);
      } else {
        console.warn(`Fixture with ID ${doc.id} has an invalid scheduledDate after toDate() conversion.`);
      }
    } else {
      console.warn(`Fixture with ID ${doc.id} has missing, null, or invalid scheduledDate field.`);
    }
    return acc;
  }, [] as DisplayFixture[]);
  
  // Already sorted by Firestore query, no need to re-sort unless criteria changes
  return fixturesList;
};

export default function FixturesPage() {
  const { data: fixtures, isLoading, isError, error } = useQuery<DisplayFixture[], Error>({
    queryKey: ['fixtures'],
    queryFn: fetchFixtures,
  });

  const getStatusBadgeVariant = (status: DisplayFixture["status"], dateStr: string): "default" | "secondary" | "destructive" | "outline" => {
    const fixtureDate = parseISO(dateStr); 
    const today = new Date();
    today.setHours(0,0,0,0); 
    const fiveDaysFromNow = subDays(new Date(), -5); 
    fiveDaysFromNow.setHours(0,0,0,0);

    if (status === "Scheduled" && isFuture(fixtureDate) && isWithinInterval(fixtureDate, { start: today, end: fiveDaysFromNow })) {
      return "default"; 
    }
  
    switch (status) {
      case "Live":
        return "destructive";
      case "Completed":
         return "default"; // Will be styled green specifically
      case "Match Abandoned":
        return "secondary";
      case "Rain-Delay":
      case "Play Suspended":
        return "default"; // Will be styled orange/yellow specifically
      case "Scheduled": 
      default:
        return "outline";
    }
  };

  const getStatusDisplayName = (status: DisplayFixture["status"], dateStr: string): string => {
    const fixtureDate = parseISO(dateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    const fiveDaysFromNow = subDays(new Date(), -5);
    fiveDaysFromNow.setHours(0,0,0,0);

    if (status === "Scheduled" && isFuture(fixtureDate) && isWithinInterval(fixtureDate, { start: today, end: fiveDaysFromNow })) {
      return "Upcoming";
    }
    return status;
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading fixtures...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-6 w-6" /> Error Loading Fixtures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">There was a problem fetching the fixtures from the database.</p>
          <p className="text-xs text-muted-foreground mt-2">Details: {error?.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <ListChecks className="h-6 w-6 text-primary" /> Match Fixtures
              </CardTitle>
              <CardDescription>Upcoming and past match schedules from the database.</CardDescription>
            </div>
            <Button asChild>
              <Link href="/fixtures/create">Create New Fixture</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {fixtures && fixtures.length > 0 ? (
            <div className="space-y-4">
              {fixtures.map((fixture) => {
                const currentStatus = getStatusDisplayName(fixture.status, fixture.date);
                const badgeVariant = getStatusBadgeVariant(fixture.status, fixture.date);
                
                return (
                  <Card key={fixture.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{fixture.homeTeamName} vs {fixture.awayTeamName}</CardTitle>
                        <Badge
                          variant={badgeVariant}
                          className={cn(
                            "whitespace-nowrap",
                            currentStatus === "Upcoming" && "bg-[hsl(var(--accent))] text-accent-foreground border-transparent", 
                            fixture.status === "Completed" && "bg-green-600 text-white border-transparent", // Specific green for completed
                            fixture.status === "Live" && "bg-destructive text-destructive-foreground border-transparent animate-pulse",
                            (fixture.status === "Rain-Delay" || fixture.status === "Play Suspended") && "bg-yellow-500 text-black border-transparent", // Specific orange/yellow
                            fixture.status === "Match Abandoned" && "bg-gray-500 text-white opacity-80 border-transparent"
                          )}
                        >
                          {currentStatus}
                        </Badge>
                      </div>
                       <CardDescription className="text-xs pt-1">
                        {fixture.matchType} &bull; {fixture.ageGroup} {fixture.division && `(${fixture.division} Div)`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2 text-muted-foreground">
                        <div className="flex items-center">
                          <CalendarDays className="mr-2 h-4 w-4" />
                          <span>{fixture.displayDate}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          <span>{fixture.time}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4" />
                          <span>{fixture.location}</span>
                        </div>
                      </div>
                       {(fixture.umpiresDisplay && fixture.umpiresDisplay !== 'N/A') || (fixture.scorerName && fixture.scorerName !== 'N/A') ? (
                        <div className="pt-2 border-t mt-2 text-xs text-muted-foreground space-y-1">
                          {fixture.umpiresDisplay && fixture.umpiresDisplay !== 'N/A' && (
                            <div className="flex items-center">
                              <Users className="mr-2 h-3.5 w-3.5 text-primary/80" />
                              <span>Umpires: {fixture.umpiresDisplay}</span>
                            </div>
                          )}
                          {fixture.scorerName && fixture.scorerName !== 'N/A' && (
                            <div className="flex items-center">
                              <Info className="mr-2 h-3.5 w-3.5 text-primary/80" /> {/* Using Info as placeholder for scorer icon */}
                              <span>Scorer: {fixture.scorerName}</span>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No fixtures found in the database. Try creating some!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

