
"use client";

import * as React from 'react';
import Link from "next/link";
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, Timestamp, orderBy, query as firestoreQuery } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, MapPin, ListChecks, AlertTriangle, Loader2 } from "lucide-react";
import { format, isFuture, subDays, isWithinInterval, parseISO, isValid } from 'date-fns';
import { cn } from "@/lib/utils";

// Interface for the data structure of a fixture coming from Firestore
// Based on the schema provided by the user and what's saved by create-fixture page
interface FirestoreFixture {
  id: string; // Firestore document ID
  homeTeamId: string;
  homeTeamName?: string;
  awayTeamId: string;
  awayTeamName?: string;
  matchType: 'T20' | 'ODI' | 'Test';
  venueId: string; // Stores field name for now
  scheduledDate: Timestamp | null; // Firestore Timestamp, can be null from older data
  time: string; // Time string e.g., "14:00"
  overs: number;
  ageGroup: string;
  status: 'Scheduled' | 'Team Confirmed' | 'Ground Ready' | 'Live' | 'Completed' | 'Match Abandoned' | 'Rain-Delay' | 'Play Suspended'; // Extended status
  umpireIds: string[];
  scorerId: string | null;
  // Optional fields from schema
  leagueId?: string | null;
  provinceId?: string | null;
  createdAt?: Timestamp;
}

// Interface for how we want to display fixtures in the UI
export interface DisplayFixture {
  id: string;
  teamA: string;
  teamB: string;
  date: string; // Formatted date string
  displayDate: string; // Formatted for display
  time: string; // Time string
  location: string;
  status: FirestoreFixture['status'];
  // Optional: If you want to display umpires/scorers directly, add them here
  // umpires?: string[]; 
  // scorer?: string;
}

const fetchFixtures = async (): Promise<DisplayFixture[]> => {
  const fixturesCollectionRef = collection(db, 'fixtures');
  // Order by scheduledDate in descending order to show upcoming/recent first
  // Firestore queries cannot order by null values first/last easily without workarounds.
  // We will filter out null dates client-side or handle them.
  const q = firestoreQuery(fixturesCollectionRef, orderBy('createdAt', 'desc')); // Fallback sort if scheduledDate is problematic
  const querySnapshot = await getDocs(q);
  
  const fixturesList = querySnapshot.docs.reduce((acc, doc) => {
    const data = doc.data() as Omit<FirestoreFixture, 'id'>;
    
    if (data.scheduledDate && typeof data.scheduledDate.toDate === 'function') {
      const scheduledDateTime = data.scheduledDate.toDate();
      if (isValid(scheduledDateTime)) { // Check if the date is valid after conversion
        acc.push({
          id: doc.id,
          teamA: data.homeTeamName || data.homeTeamId,
          teamB: data.awayTeamName || data.awayTeamId,
          date: format(scheduledDateTime, 'yyyy-MM-dd'),
          displayDate: format(scheduledDateTime, 'EEE, MMM d, yyyy'),
          time: data.time,
          location: data.venueId,
          status: data.status,
        } as DisplayFixture);
      } else {
        console.warn(`Fixture with ID ${doc.id} has an invalid scheduledDate after toDate() conversion.`);
      }
    } else {
      console.warn(`Fixture with ID ${doc.id} has missing, null, or invalid scheduledDate field.`);
    }
    return acc;
  }, [] as DisplayFixture[]);
  
  // Sort by date after fetching and processing, ensuring valid dates are handled
  return fixturesList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
      case "Upcoming":
      case "Rain-Delay":
      case "Play Suspended":
      case "Completed":
        return "default";
      case "Live":
        return "destructive";
      case "Match Abandoned":
        return "secondary";
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
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{fixture.teamA} vs {fixture.teamB}</CardTitle>
                        <Badge
                          variant={badgeVariant}
                          className={cn(
                            "whitespace-nowrap",
                            currentStatus === "Upcoming" && "bg-[hsl(var(--accent))] text-accent-foreground border-transparent", 
                            fixture.status === "Completed" && "bg-[hsl(120,60%,30%)] text-accent-foreground border-transparent",
                            fixture.status === "Live" && "bg-destructive text-destructive-foreground border-transparent animate-pulse",
                            fixture.status === "Rain-Delay" && "bg-[hsl(var(--primary))] text-primary-foreground border-transparent opacity-80",
                            fixture.status === "Play Suspended" && "bg-[hsl(var(--chart-3))] text-card-foreground border-transparent",
                            fixture.status === "Match Abandoned" && "bg-[hsl(var(--secondary))] text-muted-foreground opacity-80 border-transparent"
                          )}
                        >
                          {currentStatus}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
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

