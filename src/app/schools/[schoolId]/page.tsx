
"use client";

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { schoolsData, type SchoolProfile } from '@/lib/schools-data';
import { fixtures as allFixtures, type Fixture } from '@/lib/fixtures-data';
import { resultsData, type Result } from '@/lib/results-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Info, MapPin, Shield, Trophy, ListChecks, ClipboardList, Building, Users, BarChart, CalendarDays, FileText } from "lucide-react";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Helper function to determine badge variant based on status
const getStatusBadgeVariant = (status: Fixture["status"]): "default" | "secondary" | "destructive" | "outline" => {
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

export default function SchoolProfilePage() {
  const params = useParams();
  const router = useRouter();
  const schoolId = params.schoolId ? parseInt(params.schoolId as string, 10) : null;

  const school: SchoolProfile | undefined = schoolId ? schoolsData.find(s => s.id === schoolId) : undefined;

  // Filter fixtures and results relevant to the school
  const schoolFixtures: Fixture[] = school
    ? allFixtures.filter(
        (fixture) =>
          fixture.teamA.includes(school.name) || fixture.teamB.includes(school.name)
      )
    : [];

  const upcomingSchoolFixtures: Fixture[] = schoolFixtures
    .filter((fixture) => ["Upcoming", "Scheduled", "Live", "Rain-Delay", "Play Suspended"].includes(fixture.status))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const completedSchoolFixtureIds: number[] = schoolFixtures
    .filter((fixture) => fixture.status === "Completed" || fixture.status === "Match Abandoned")
    .map(f => f.id);
    
  const schoolResults: Result[] = resultsData
    .filter((result) => completedSchoolFixtureIds.includes(result.fixtureId))
    .sort((a, b) => {
      // Find corresponding fixture dates for sorting
      const fixtureA = schoolFixtures.find(f => f.id === a.fixtureId);
      const fixtureB = schoolFixtures.find(f => f.id === b.fixtureId);
      if (fixtureA && fixtureB) {
        return new Date(fixtureB.date).getTime() - new Date(fixtureA.date).getTime();
      }
      return 0;
    })
    .slice(0, 5); // Show latest 5 results

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

          {/* Latest Match Results Card */}
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
                    const fixture = schoolFixtures.find(f => f.id === result.fixtureId);
                    return (
                      <div key={result.id} className="p-4 border rounded-lg bg-muted/50 shadow-sm space-y-2">
                        <p className="font-semibold text-md">{result.teamA} vs {result.teamB}</p>
                        {fixture && <p className="text-xs text-muted-foreground">{format(new Date(fixture.date), 'EEE, MMM d, yyyy')}</p>}
                        <p className="text-sm"><span className="font-medium">{result.teamA}:</span> {result.teamAScore} &nbsp;&nbsp; <span className="font-medium">{result.teamB}:</span> {result.teamBScore}</p>
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

          {/* Upcoming Fixtures Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-[hsl(var(--primary))]" /> Upcoming Fixtures
              </CardTitle>
              <CardDescription>Scheduled matches for {school.name}'s teams.</CardDescription>
              {/* Add filters here in future if team data in fixtures becomes more structured */}
            </CardHeader>
            <CardContent>
              {upcomingSchoolFixtures.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSchoolFixtures.map((fixture) => (
                    <div key={fixture.id} className="p-4 border rounded-lg bg-muted/50 shadow-sm space-y-2">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-md">{fixture.teamA} vs {fixture.teamB}</p>
                        <Badge
                          variant={getStatusBadgeVariant(fixture.status)}
                          className={cn(
                            "whitespace-nowrap",
                            fixture.status === "Upcoming" && "bg-[hsl(var(--accent))] text-accent-foreground border-transparent",
                            fixture.status === "Completed" && "bg-[hsl(120,60%,30%)] text-accent-foreground border-transparent",
                            fixture.status === "Live" && "bg-destructive text-destructive-foreground border-transparent animate-pulse",
                            fixture.status === "Rain-Delay" && "bg-[hsl(var(--primary))] text-primary-foreground border-transparent opacity-80",
                            fixture.status === "Play Suspended" && "bg-[hsl(var(--chart-3))] text-card-foreground border-transparent",
                             fixture.status === "Match Abandoned" && "bg-[hsl(var(--secondary))] text-muted-foreground opacity-80 border-transparent"
                          )}
                        >
                          {fixture.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(fixture.date), 'EEE, MMM d, yyyy')} - {fixture.time} at {fixture.location}
                      </p>
                      {(fixture.status === "Upcoming" || fixture.status === "Scheduled") && (
                        <Button asChild variant="outline" size="sm" className="mt-2">
                          <Link href={`/prematch-team/${fixture.id}`}>
                            <ClipboardList className="mr-2 h-4 w-4" />
                            View Pre-Match
                          </Link>
                        </Button>
                      )}
                    </div>
                  ))}
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
                  {school.teams.slice(0, 5).map((team) => (
                    <div key={team.id} className="flex justify-between items-center p-2 bg-muted/50 rounded-md text-sm">
                      <span>{team.name} ({team.ageGroup})</span>
                      <Badge variant="outline">{team.division} Div</Badge>
                    </div>
                  ))}
                  {school.teams.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      ...and {school.teams.length - 5} more teams.
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
