
"use client";

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fixtures as allFixtures, type Fixture } from '@/lib/fixtures-data';
import { resultsData, type Result } from '@/lib/results-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarDays, Clock, MapPin, Star, Trophy } from "lucide-react";
import { format } from 'date-fns';

export default function ScorecardPage() {
  const params = useParams();
  const router = useRouter();
  const fixtureId = params.fixtureId ? parseInt(params.fixtureId as string, 10) : null;

  const fixture: Fixture | undefined = fixtureId ? allFixtures.find(f => f.id === fixtureId) : undefined;
  const result: Result | undefined = fixtureId ? resultsData.find(r => r.fixtureId === fixtureId) : undefined;

  if (!fixture || !result) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Scorecard Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Sorry, we couldn't find a scorecard for this fixture. It might be an upcoming match or data is not yet available.
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Match Scorecard: {fixture.teamA} vs {fixture.teamB}</CardTitle>
          <CardDescription>
            Played on {format(new Date(fixture.date), 'EEEE, MMMM d, yyyy')} at {fixture.location}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Match Summary */}
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-xl">Match Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-lg ">
                <div className="text-center md:text-left">
                  <p className="font-semibold text-lg">{result.teamA}</p>
                  <p className="text-2xl font-bold text-[hsl(var(--primary))]">{result.teamAScore}</p>
                </div>
                <p className="text-xl font-medium text-muted-foreground">vs</p>
                <div className="text-center md:text-right">
                  <p className="font-semibold text-lg">{result.teamB}</p>
                  <p className="text-2xl font-bold text-[hsl(var(--primary))]">{result.teamBScore}</p>
                </div>
              </div>
              <div className="text-center mt-4 p-3 bg-background rounded-md shadow">
                <p className="text-lg font-semibold text-[hsl(var(--accent))] flex items-center justify-center">
                  <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                  {result.winner} won by {result.margin}
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Player of the Match */}
          <Card>
            <CardHeader>
                <CardTitle className="text-xl">Player of the Match</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center text-md bg-muted p-4 rounded-md">
                <Star className="mr-3 h-6 w-6 text-yellow-500" />
                <p><strong className="font-semibold">{result.playerOfTheMatch}</strong></p>
            </CardContent>
          </Card>

          {/* Placeholder for Detailed Scorecards */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Detailed Innings</CardTitle>
              <CardDescription>Full batting and bowling details.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed innings-by-innings scorecards will be available here. This feature is under development.
              </p>
            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>
  );
}
