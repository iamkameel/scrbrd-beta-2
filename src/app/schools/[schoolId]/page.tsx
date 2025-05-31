
"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc, collection, getDocs, query as firestoreQuery, where, Timestamp, or } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import type { SchoolProfile as StaticSchoolProfile, SchoolTeam } from '@/lib/schools-data'; // For structure reference
import type { DisplayFixture } from '@/app/fixtures/page'; // Re-use fixture display type
import type { Result as StaticResult } from '@/lib/results-data'; // For structure reference

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Info, MapPin, Shield, Trophy, ListChecks, ClipboardList, Building, Users, BarChart, CalendarDays, FileText, Loader2, AlertTriangle } from "lucide-react";
import { cn } from '@/lib/utils';
import { format, isFuture, parseISO, subDays, isWithinInterval } from 'date-fns';

// Firestore data structures
interface FirestoreSchoolDoc {
  id: string;
  name: string;
  location: string;
  crestUrl: string;
  fields: string[];
  bannerImageUrl?: string;
  about?: string;
  awardsAndAccolades?: string[];
  teams?: SchoolTeam[]; // Assuming SchoolTeam has { id: string; name: string; ageGroup?: string; division?: string }
  records?: string[];
  divisionId?: string;
  // any other fields stored in Firestore
}

interface FirestoreFixtureDoc {
  id: string;
  homeTeamId: string;
  homeTeamName?: string;
  awayTeamId: string;
  awayTeamName?: string;
  scheduledDate: Timestamp;
  time: string;
  venueId: string; // Field name
  status: "Scheduled" | "Upcoming" | "Live" | "Completed" | "Match Abandoned" | "Rain-Delay" | "Play Suspended";
  // ... other fixture fields
}

interface FirestoreResultDoc {
  id: string;
  fixtureId: string;
  teamAId: string; // Corresponds to homeTeamId from fixture
  teamAScore: string;
  teamBId: string; // Corresponds to awayTeamId from fixture
  teamBScore: string;
  winner: string;
  margin: string;
  playerOfTheMatch?: string;
  // ... other result fields
}

const fetchSchool = async (schoolId: string): Promise<FirestoreSchoolDoc | null> => {
  if (!schoolId) return null;
  const schoolDocRef = doc(db, 'schools', schoolId);
  const schoolSnap = await getDoc(schoolDocRef);
  if (schoolSnap.exists()) {
    return { id: schoolSnap.id, ...schoolSnap.data() } as FirestoreSchoolDoc;
  }
  return null;
};

const fetchSchoolFixtures = async (teamIds: string[]): Promise<DisplayFixture[]> => {
  if (!teamIds || teamIds.length === 0) return [];
  
  const fixturesCollectionRef = collection(db, 'fixtures');
  // Firestore 'in' query limit is 30 items per query. If more teams, need batching or alternative.
  // For simplicity, assuming teamIds length is manageable.
  const homeQuery = firestoreQuery(fixturesCollectionRef, where('homeTeamId', 'in', teamIds));
  const awayQuery = firestoreQuery(fixturesCollectionRef, where('awayTeamId', 'in', teamIds));

  const [homeSnapshot, awaySnapshot] = await Promise.all([getDocs(homeQuery), getDocs(awayQuery)]);
  
  const fixturesMap = new Map<string, DisplayFixture>();

  const processSnapshot = (snapshot: any) => {
    snapshot.docs.forEach((docSnap: any) => {
      const data = docSnap.data() as Omit<FirestoreFixtureDoc, 'id'>;
      const scheduledDateTime = data.scheduledDate.toDate();
      const fixtureDisplayData = {
        id: docSnap.id,
        teamA: data.homeTeamName || data.homeTeamId,
        teamB: data.awayTeamName || data.awayTeamId,
        date: format(scheduledDateTime, 'yyyy-MM-dd'),
        displayDate: format(scheduledDateTime, 'EEE, MMM d, yyyy'),
        time: data.time,
        location: data.venueId,
        status: data.status,
      } as DisplayFixture & { displayDate: string };
      fixturesMap.set(docSnap.id, fixtureDisplayData);
    });
  };

  processSnapshot(homeSnapshot);
  processSnapshot(awaySnapshot);
  
  return Array.from(fixturesMap.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};


const fetchSchoolResults = async (fixtureIds: string[]): Promise<FirestoreResultDoc[]> => {
  if (!fixtureIds || fixtureIds.length === 0) return [];
  const resultsCollectionRef = collection(db, 'results');
  // Similar to fixtures, 'in' query limit applies.
  const q = firestoreQuery(resultsCollectionRef, where('fixtureId', 'in', fixtureIds));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<FirestoreResultDoc, 'id'>),
  }));
};


// Helper function to determine badge variant based on status
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
    case "Live": return "destructive";
    case "Completed": return "default"; // Will be styled specifically later
    case "Match Abandoned": return "secondary";
    case "Rain-Delay": 
    case "Play Suspended": return "default"; // Can be styled specifically
    case "Scheduled": // General scheduled beyond 5 days or if Upcoming status is not explicitly set
    default: return "outline";
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

export default function SchoolProfilePage() {
  const params = useParams();
  const router = useRouter();
  const schoolId = params.schoolId as string;

  const { data: school, isLoading: isLoadingSchool, isError: isErrorSchool, error: schoolError } = useQuery<FirestoreSchoolDoc | null, Error>({
    queryKey: ['school', schoolId],
    queryFn: () => fetchSchool(schoolId),
    enabled: !!schoolId,
  });

  const schoolTeamIds = React.useMemo(() => school?.teams?.map(t => t.id) || [], [school]);

  const { data: schoolFixtures, isLoading: isLoadingFixtures } = useQuery<DisplayFixture[], Error>({
    queryKey: ['schoolFixtures', schoolId, schoolTeamIds],
    queryFn: () => fetchSchoolFixtures(schoolTeamIds),
    enabled: !!school && schoolTeamIds.length > 0,
  });
  
  const upcomingSchoolFixtures = React.useMemo(() => {
    return schoolFixtures
      ?.filter((fixture) => ["Scheduled", "Upcoming", "Live", "Rain-Delay", "Play Suspended"].includes(getStatusDisplayName(fixture.status, fixture.date)))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];
  }, [schoolFixtures]);

  const completedSchoolFixtureIds = React.useMemo(() => {
    return schoolFixtures
      ?.filter((fixture) => ["Completed", "Match Abandoned"].includes(fixture.status))
      .map(f => f.id) || [];
  }, [schoolFixtures]);

  const { data: schoolResultsData, isLoading: isLoadingResults } = useQuery<FirestoreResultDoc[], Error>({
    queryKey: ['schoolResults', schoolId, completedSchoolFixtureIds],
    queryFn: () => fetchSchoolResults(completedSchoolFixtureIds),
    enabled: !!school && completedSchoolFixtureIds.length > 0,
  });

  const schoolResults = React.useMemo(() => {
    return schoolResultsData
      ?.sort((a,b) => {
        const fixtureA = schoolFixtures?.find(f => f.id === a.fixtureId);
        const fixtureB = schoolFixtures?.find(f => f.id === b.fixtureId);
        if (fixtureA && fixtureB) {
          return new Date(fixtureB.date).getTime() - new Date(fixtureA.date).getTime();
        }
        return 0;
      })
      .slice(0,5) || [];
  }, [schoolResultsData, schoolFixtures]);


  if (isLoadingSchool || isLoadingFixtures || isLoadingResults) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading school profile...</p>
      </div>
    );
  }

  if (isErrorSchool) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle />Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground mb-4">Could not load school data: {schoolError?.message}</p>
            <Button onClick={() => router.push('/schools')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Schools List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>School Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Sorry, we couldn't find details for this school.</p>
            <Button onClick={() => router.push('/schools')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Schools List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Button variant="outline" asChild className="mb-6 print:hidden">
        <Link href="/schools">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Schools List
        </Link>
      </Button>

      {school.bannerImageUrl && (
        <Card className="overflow-hidden shadow-lg rounded-xl">
          <div className="relative h-48 md:h-72">
            <Image
              src={school.bannerImageUrl}
              alt={`${school.name} Banner`}
              fill
              style={{ objectFit: "cover" }}
              priority
              data-ai-hint="school building campus"
            />
          </div>
        </Card>
      )}

      <Card className="shadow-lg rounded-xl">
        <CardHeader className="flex flex-col items-center text-center p-6 space-y-4">
          <Avatar className="h-24 w-24 border-4 border-background shadow-md">
            <AvatarImage src={school.crestUrl} alt={`${school.name} Crest`} data-ai-hint="school logo crest" />
            <AvatarFallback className="text-3xl">{school.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold">{school.name}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground flex items-center justify-center gap-1.5">
              <MapPin className="h-5 w-5" /> {school.location}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {school.about && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Info className="h-5 w-5 text-[hsl(var(--primary))]" /> About {school.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">{school.about}</p>
              </CardContent>
            </Card>
          )}

          {school.fields && school.fields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Building className="h-5 w-5 text-[hsl(var(--primary))]" /> Playing Fields
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {school.fields.map((field, index) => (
                    <li key={index}>{field}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-[hsl(var(--primary))]" /> Latest Match Results
              </CardTitle>
              <CardDescription>Recent outcomes for {school.name}'s teams.</CardDescription>
            </CardHeader>
            <CardContent>
              {schoolResults.length > 0 ? (
                <div className="space-y-4">
                  {schoolResults.map((result) => {
                    const fixture = schoolFixtures?.find(f => f.id === result.fixtureId);
                    return (
                      <div key={result.id} className="p-4 border rounded-lg bg-muted/50 shadow-sm space-y-2">
                        <p className="font-semibold text-md">{fixture?.teamA || result.teamAId} vs {fixture?.teamB || result.teamBId}</p>
                        {fixture && <p className="text-xs text-muted-foreground">{format(parseISO(fixture.date), 'EEE, MMM d, yyyy')}</p>}
                        <p className="text-sm"><span className="font-medium">{fixture?.teamA || result.teamAId}:</span> {result.teamAScore} &nbsp;&nbsp; <span className="font-medium">{fixture?.teamB || result.teamBId}:</span> {result.teamBScore}</p>
                        <p className="text-sm font-semibold text-[hsl(var(--accent))]">{result.winner} won by {result.margin}</p>
                        <Button asChild variant="outline" size="sm" className="mt-2">
                          <Link href={`/scorecard/${result.fixtureId}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Scorecard
                          </Link>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">No recent match results found for {school.name}.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-[hsl(var(--primary))]" /> Upcoming Fixtures
              </CardTitle>
              <CardDescription>Scheduled matches for {school.name}'s teams.</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingSchoolFixtures.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSchoolFixtures.map((fixture) => {
                    const currentStatus = getStatusDisplayName(fixture.status, fixture.date);
                    const badgeVariant = getStatusBadgeVariant(fixture.status, fixture.date);
                    return (
                      <div key={fixture.id} className="p-4 border rounded-lg bg-muted/50 shadow-sm space-y-2">
                        <div className="flex justify-between items-start">
                          <p className="font-semibold text-md">{fixture.teamA} vs {fixture.teamB}</p>
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
                        <p className="text-sm text-muted-foreground">
                          {fixture.displayDate} - {fixture.time} at {fixture.location}
                        </p>
                        {(currentStatus === "Upcoming" || currentStatus === "Scheduled") && (
                          <Button asChild variant="outline" size="sm" className="mt-2">
                            <Link href={`/prematch-team/${fixture.id}`}>
                              <ClipboardList className="mr-2 h-4 w-4" />
                              View Pre-Match
                            </Link>
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">No upcoming fixtures found for {school.name}.</p>
              )}
            </CardContent>
          </Card>

        </div>

        <div className="space-y-6">
          {school.teams && school.teams.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="h-5 w-5 text-[hsl(var(--primary))]" /> Affiliated Cricket Teams
                </CardTitle>
                <CardDescription>Total Teams: {school.teams.length}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {school.teams.slice(0, 10).map((team) => ( // Show more teams if available
                    <div key={team.id} className="flex justify-between items-center p-2 bg-muted/50 rounded-md text-sm">
                      <span>{team.name} {team.ageGroup && `(${team.ageGroup})`}</span>
                      {team.division && <Badge variant="outline">{team.division} Div</Badge>}
                    </div>
                  ))}
                  {school.teams.length > 10 && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      ...and {school.teams.length - 10} more teams.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {school.awardsAndAccolades && school.awardsAndAccolades.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-[hsl(var(--primary))]" /> Awards & Accolades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {school.awardsAndAccolades.map((award, index) => (
                    <li key={index}>{award}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {school.records && school.records.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-[hsl(var(--primary))]" /> School Cricket Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {school.records.map((record, index) => (
                    <li key={index}>{record}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
