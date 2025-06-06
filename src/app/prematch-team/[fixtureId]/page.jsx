"use client";
import { useParams, useRouter } from 'next/navigation';
import { fixtures as allFixtures } from '@/lib/fixtures-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarDays, Clock, MapPin, Users, UserCheck, ClipboardList } from "lucide-react";
import { format } from 'date-fns';
export default function PrematchTeamPage() {
    const params = useParams();
    const router = useRouter();
    const fixtureId = params.fixtureId ? parseInt(params.fixtureId, 10) : null;
    const fixture = fixtureId ? allFixtures.find(f => f.id === fixtureId) : undefined;
    if (!fixture) {
        return (<div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Fixture Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Sorry, we couldn't find details for this fixture's pre-match team.</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4"/>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>);
    }
    return (<div className="container mx-auto py-8 space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4"/>
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Pre-Match Details: {fixture.teamAId} vs {fixture.teamBId}</CardTitle>
          <CardDescription>
            Fixture scheduled for {format(new Date(fixture.date), 'EEEE, MMMM d, yyyy')} at {fixture.time}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm border p-4 rounded-lg bg-muted/50">
            <div className="flex items-center">
              <CalendarDays className="mr-2 h-5 w-5 text-[hsl(var(--primary))]"/>
              <span>{format(new Date(fixture.date), 'EEEE, MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-[hsl(var(--primary))]"/>
              <span>{fixture.time}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-[hsl(var(--primary))]"/>
              <span>{fixture.location}</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="h-6 w-6 text-[hsl(var(--accent))]"/>
                Team Line-ups
              </CardTitle>
              <CardDescription>Official team selections for the match.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Pre-match team line-ups and further analysis will be displayed here once finalized.
                This feature is under development.
              </p>
              {/* Placeholder for actual team line-ups */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{fixture.teamAId}</h3>
                  <ul className="list-disc list-inside pl-2 text-muted-foreground">
                    <li>Player 1 (Captain)</li>
                    <li>Player 2 (Wicket-keeper)</li>
                    <li>Player 3</li>
                    <li>Player 4</li>
                    <li>Player 5</li>
                    <li>Player 6</li>
                    <li>Player 7</li>
                    <li>Player 8</li>
                    <li>Player 9</li>
                    <li>Player 10</li>
                    <li>Player 11</li>
                    <li>Player 12 (12th Man)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{fixture.teamBId}</h3>
                   <ul className="list-disc list-inside pl-2 text-muted-foreground">
                    <li>Player 1 (Captain)</li>
                    <li>Player 2 (Wicket-keeper)</li>
                    <li>Player 3</li>
                    <li>Player 4</li>
                    <li>Player 5</li>
                    <li>Player 6</li>
                    <li>Player 7</li>
                    <li>Player 8</li>
                    <li>Player 9</li>
                    <li>Player 10</li>
                    <li>Player 11</li>
                    <li>Player 12 (12th Man)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <UserCheck className="h-6 w-6 text-[hsl(var(--accent))]"/>
                Match Officials & Personnel
              </CardTitle>
              <CardDescription>Assigned umpires and scorers for the match.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(fixture.umpires && fixture.umpires.length > 0) || (fixture.scorers && fixture.scorers.length > 0) ? (<>
                  {fixture.umpires && fixture.umpires.length > 0 && (<div>
                      <h3 className="font-semibold text-md mb-1 flex items-center gap-1.5">
                        <UserCheck className="h-5 w-5 text-muted-foreground"/>
                        Umpires
                      </h3>
                      <ul className="list-disc list-inside pl-2 text-muted-foreground">
                        {fixture.umpires.map((umpire, index) => <li key={`umpire-${index}`}>{umpire}</li>)}
                      </ul>
                    </div>)}
                  {fixture.scorers && fixture.scorers.length > 0 && (<div className={fixture.umpires && fixture.umpires.length > 0 ? "mt-4" : ""}>
                      <h3 className="font-semibold text-md mb-1 flex items-center gap-1.5">
                        <ClipboardList className="h-5 w-5 text-muted-foreground"/>
                        Scorers
                      </h3>
                      <ul className="list-disc list-inside pl-2 text-muted-foreground">
                        {fixture.scorers.map((scorer, index) => <li key={`scorer-${index}`}>{scorer}</li>)}
                      </ul>
                    </div>)}
                </>) : (<p className="text-sm text-muted-foreground">Match officials and personnel not yet assigned.</p>)}
            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>);
}
