
// src/app/teams/[teamId]/page.tsx
"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { detailedTeamsData, type Team, type Player } from '@/lib/team-data';
import { fixtures as allFixtures, type Fixture } from '@/lib/fixtures-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, BarChartBig, CalendarDays, ShieldCheck, Trophy } from "lucide-react";

export default function TeamDetailsPage() {
  const params = useParams();
  const teamId = params.teamId ? parseInt(params.teamId as string, 10) : null;

  const team: Team | undefined = detailedTeamsData.find(t => t.id === teamId);

  const teamFixtures: Fixture[] = team ? allFixtures.filter(
    fixture => 
      (fixture.teamA.includes(team.affiliation) && fixture.teamA.includes(team.teamName)) || 
      (fixture.teamB.includes(team.affiliation) && fixture.teamB.includes(team.teamName))
  ) : [];

  if (!team) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Team Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Sorry, we couldn't find details for this team.</p>
            <Button asChild>
              <Link href="/teams">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Teams Directory
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Helper to get initials for avatar fallback
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length -1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Back Button */}
      <Button asChild variant="outline" className="mb-6">
        <Link href="/teams">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Teams Directory
        </Link>
      </Button>

      {/* Team Header */}
      <Card className="overflow-hidden">
        <div className="relative h-48 md:h-64 bg-muted">
          <Image 
            src={`https://placehold.co/1200x400.png`} // Generic team banner
            alt={`${team.affiliation} ${team.teamName} Banner`}
            layout="fill"
            objectFit="cover"
            data-ai-hint="team banner sport"
          />
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              {team.affiliation}
            </h1>
            <h2 className="text-2xl md:text-4xl font-semibold text-primary-foreground/90">
              {team.teamName} {team.mascot && `(${team.mascot})`}
            </h2>
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column / Main Column on smaller screens */}
        <div className="lg:col-span-2 space-y-6">
          {/* Squad Members Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-6 w-6 text-[hsl(var(--primary))]" />
                Squad Members ({team.squad.length})
              </CardTitle>
              <CardDescription>Players representing {team.teamName}.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {team.squad.map((player) => (
                  <Card key={player.id} className="p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={player.avatar} alt={player.name} data-ai-hint="player portrait" />
                        <AvatarFallback>{getInitials(player.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{player.name}</p>
                        <p className="text-xs text-muted-foreground">{player.role}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Match Fixtures Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CalendarDays className="h-6 w-6 text-[hsl(var(--primary))]" />
                Match Fixtures & Results
              </CardTitle>
              <CardDescription>Upcoming and past matches for {team.teamName}.</CardDescription>
            </CardHeader>
            <CardContent>
              {teamFixtures.length > 0 ? (
                <div className="space-y-3">
                  {teamFixtures.map((fixture) => (
                    <div key={fixture.id} className="p-3 border rounded-md bg-muted/50">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-semibold text-sm">{fixture.teamA} vs {fixture.teamB}</p>
                        <Badge variant={fixture.status === "Upcoming" ? "default" : fixture.status === "Live" ? "destructive" : "secondary"} className={fixture.status === "Upcoming" ? "bg-[hsl(var(--accent))] text-accent-foreground" : ""}>
                          {fixture.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(fixture.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} - {fixture.time} at {fixture.location}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No fixtures found for this team.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column / Secondary Column on smaller screens */}
        <div className="space-y-6">
          {/* Team Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ShieldCheck className="h-6 w-6 text-[hsl(var(--primary))]" />
                Team Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Affiliation:</strong> {team.affiliation}</p>
              <p><strong>Team Name:</strong> {team.teamName}</p>
              {team.mascot && <p><strong>Mascot:</strong> {team.mascot}</p>}
              <p><strong>Age Group:</strong> <Badge variant="outline">{team.ageGroup}</Badge></p>
              <p><strong>Division:</strong> <Badge variant="outline">{team.division}</Badge></p>
            </CardContent>
          </Card>

          {/* Performance Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <BarChartBig className="h-6 w-6 text-[hsl(var(--primary))]" />
                Performance Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Matches Played:</strong> {team.performanceStats.matchesPlayed}</p>
              <p><strong>Wins:</strong> <span className="font-semibold text-green-600">{team.performanceStats.wins}</span></p>
              <p><strong>Losses:</strong> <span className="font-semibold text-red-600">{team.performanceStats.losses}</span></p>
              {team.performanceStats.draws !== undefined && <p><strong>Draws:</strong> {team.performanceStats.draws}</p>}
              <p><strong>Win Percentage:</strong> <Badge variant="secondary">{team.performanceStats.winPercentage}</Badge></p>
              {team.performanceStats.titles !== undefined && team.performanceStats.titles > 0 && (
                <div className="flex items-center pt-2">
                  <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                  <p><strong>Titles Won:</strong> {team.performanceStats.titles}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

