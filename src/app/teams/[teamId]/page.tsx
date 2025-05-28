
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
import { ArrowLeft, Users, BarChartBig, CalendarDays, ShieldCheck, Trophy, TrendingUp, Crosshair, Hand, FileText, ClipboardList } from "lucide-react";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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

  const StatBox: React.FC<{ icon: React.ElementType, label: string, value: string | number | undefined, className?: string }> = ({ icon: Icon, label, value, className }) => (
    <div className={cn("flex flex-col items-center justify-center p-3 bg-muted rounded-lg shadow-sm text-center", className)}>
      <Icon className="h-5 w-5 mb-1 text-[hsl(var(--primary))]" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-md font-semibold text-foreground">{value !== undefined ? value : '-'}</p>
    </div>
  );

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
            src={`https://placehold.co/1200x400.png`} 
            alt={`${team.affiliation} ${team.teamName} Banner`}
            fill
            style={{objectFit: "cover"}}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {team.squad.map((player) => (
                  <Card key={player.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-start gap-3 pb-3">
                      <Avatar className="h-14 w-14 mt-1">
                        <AvatarImage src={player.avatar} alt={player.name} data-ai-hint="player portrait" />
                        <AvatarFallback>{getInitials(player.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-md mb-0.5">{player.name}</CardTitle>
                        <CardDescription className="text-xs">{player.role}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {player.stats && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 text-xs">
                           <StatBox icon={TrendingUp} label="Runs" value={player.stats.runs} />
                           <StatBox icon={Crosshair} label="Wickets" value={player.stats.wickets} />
                           <StatBox icon={Hand} label="Catches" value={player.stats.catches} />
                        </div>
                      )}
                    </CardContent>
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
                <div className="space-y-4">
                  {teamFixtures.map((fixture) => (
                    <div key={fixture.id} className="p-4 border rounded-lg bg-muted/50 shadow-sm">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                        <p className="font-semibold text-md mb-1 sm:mb-0">{fixture.teamA} vs {fixture.teamB}</p>
                        <Badge 
                          variant={fixture.status === "Upcoming" ? "default" : fixture.status === "Live" ? "destructive" : "secondary"} 
                          className={cn(
                            fixture.status === "Upcoming" && "bg-[hsl(var(--accent))] text-accent-foreground",
                            "whitespace-nowrap"
                          )}
                        >
                          {fixture.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {format(new Date(fixture.date), 'EEE, MMM d')} - {fixture.time} at {fixture.location}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {fixture.status === "Upcoming" && (
                          <Button asChild variant="outline" size="sm">
                            <Link href="#">
                              <ClipboardList className="mr-2 h-4 w-4" />
                              View Pre-Match Team
                            </Link>
                          </Button>
                        )}
                        {fixture.status === "Past" && (
                          <Button asChild variant="outline" size="sm">
                           <Link href="#">
                              <FileText className="mr-2 h-4 w-4" />
                              View Scorecard
                            </Link>
                          </Button>
                        )}
                      </div>
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
            <CardContent className="space-y-3 text-sm">
              <div><strong>Affiliation:</strong> {team.affiliation}</div>
              <div><strong>Team Name:</strong> {team.teamName}</div>
              {team.mascot && <div><strong>Mascot:</strong> {team.mascot}</div>}
              <div><strong>Age Group:</strong> <Badge variant="outline" className="text-xs">{team.ageGroup}</Badge></div>
              <div><strong>Division:</strong> <Badge variant="outline" className="text-xs">{team.division}</Badge></div>
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
              <div><strong>Matches Played:</strong> {team.performanceStats.matchesPlayed}</div>
              <div><strong>Wins:</strong> <span className="font-semibold text-[hsl(var(--accent))]">{team.performanceStats.wins}</span></div>
              <div><strong>Losses:</strong> <span className="font-semibold text-destructive">{team.performanceStats.losses}</span></div>
              {team.performanceStats.draws !== undefined && <div><strong>Draws:</strong> {team.performanceStats.draws}</div>}
              <div><strong>Win Percentage:</strong> <Badge variant="secondary" className="text-xs">{team.performanceStats.winPercentage}</Badge></div>
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
