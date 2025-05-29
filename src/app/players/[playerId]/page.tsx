
"use client";

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { playersData, type PlayerProfile, type PlayerSkills } from '@/lib/player-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BarChart3, Briefcase, Info, ShieldCheck, Star, Target, Zap, Brain, CalendarDays, Hash, AtSign, Activity, TrendingUp, Crosshair } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';

const StatItem: React.FC<{ label: string; value: string | number | undefined; icon?: React.ElementType }> = ({ label, value, icon: Icon }) => (
  <div className="flex justify-between py-2 border-b border-border/50 last:border-b-0">
    <div className="flex items-center text-muted-foreground">
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      <span>{label}</span>
    </div>
    <span className="font-semibold text-right">{value !== undefined ? value : 'N/A'}</span>
  </div>
);

const SkillCategory: React.FC<{ title: string; skills: Record<string, number | undefined> | undefined; icon: React.ElementType }> = ({ title, skills, icon: Icon }) => {
  if (!skills || Object.values(skills).every(val => val === undefined)) {
    return null;
  }

  return (
    <div className="mb-4">
      <h4 className="text-md font-semibold mb-3 flex items-center gap-1.5">
        <Icon className="h-5 w-5 text-[hsl(var(--accent))]"/> {title}
      </h4>
      <div className="space-y-3">
        {Object.entries(skills).map(([key, value]) => {
          if (value === undefined) return null;
          const skillName = key.charAt(0).toUpperCase() + key.slice(1);
          return (
            <div key={key}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">{skillName}</span>
                <span className="text-sm font-medium text-foreground">{value} / 100</span>
              </div>
              <Progress value={value} className="h-2" />
            </div>
          );
        })}
      </div>
    </div>
  );
};


export default function PlayerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const playerId = params.playerId as string;

  const player = playersData.find(p => p.id === playerId);

  if (!player) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Player Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Sorry, we couldn't find details for this player.</p>
            <Button onClick={() => router.push('/players')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Players List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Button variant="outline" asChild className="mb-6 print:hidden">
        <Link href="/players">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Players List
        </Link>
      </Button>

      <Card className="overflow-hidden">
        <CardHeader className="p-0 relative">
          <div className="h-40 bg-muted/50">
             <Image src="https://placehold.co/1200x300.png" alt={`${player.name} cover image`} layout="fill" objectFit="cover" className="opacity-50" data-ai-hint="stadium crowd" />
          </div>
          <div className="absolute bottom-0 left-6 transform translate-y-1/2">
            <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
              <AvatarImage src={player.avatar} alt={player.name} data-ai-hint="player action" />
              <AvatarFallback className="text-4xl">{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>
        <CardContent className="pt-20 pb-6 px-6">
          <CardTitle className="text-3xl font-bold">{player.name}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            {player.role} for {player.team}
          </CardDescription>
          {player.careerSpan && <p className="text-sm text-muted-foreground mt-1">{player.careerSpan}</p>}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {player.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Info className="h-5 w-5 text-[hsl(var(--primary))]"/> About {player.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">{player.bio}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[hsl(var(--primary))]"/> Career Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="batting" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="batting">Batting</TabsTrigger>
                  <TabsTrigger value="bowling">Bowling</TabsTrigger>
                  <TabsTrigger value="fielding">Fielding</TabsTrigger>
                </TabsList>
                <TabsContent value="batting" className="mt-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-1.5">
                      <Target className="h-5 w-5 text-[hsl(var(--accent))]"/> Batting
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                      <StatItem label="Matches" value={player.stats.matchesPlayed} icon={Hash}/>
                      <StatItem label="Runs Scored" value={player.stats.runs} icon={TrendingUp} />
                      <StatItem label="Average" value={player.stats.average} icon={Activity}/>
                      <StatItem label="Strike Rate" value={player.stats.strikeRate} icon={Zap}/>
                      <StatItem label="Highest Score" value={player.stats.highestScore} icon={Star}/>
                      <StatItem label="100s" value={player.stats.hundreds} />
                      <StatItem label="50s" value={player.stats.fifties} />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="bowling" className="mt-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-1.5">
                      <Zap className="h-5 w-5 text-[hsl(var(--accent))]"/> Bowling
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                      <StatItem label="Matches" value={player.stats.matchesPlayed} icon={Hash} />
                      <StatItem label="Wickets Taken" value={player.stats.wickets} icon={Crosshair}/>
                      <StatItem label="Average" value={player.stats.bowlingAverage} icon={Activity}/>
                      <StatItem label="Economy Rate" value={player.stats.economyRate} icon={Zap}/>
                      <StatItem label="Best Bowling" value={player.stats.bestBowling} icon={Star}/>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="fielding" className="mt-4">
                   <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="h-5 w-5 text-[hsl(var(--accent))]"/> Fielding
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                      <StatItem label="Catches" value={player.stats.catches} />
                      <StatItem label="Stumpings" value={player.stats.stumpings} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {player.skills && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Brain className="h-5 w-5 text-[hsl(var(--primary))]"/> Player Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SkillCategory title="Technical" skills={player.skills.technical} icon={Target} />
                <SkillCategory title="Tactical" skills={player.skills.tactical} icon={Briefcase} />
                <SkillCategory title="Physical & Mental" skills={player.skills.physicalMental} icon={Activity} />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[hsl(var(--primary))]"/> Player Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <StatItem label="Full Name" value={player.name} icon={AtSign} />
              <StatItem label="Team" value={player.team} icon={ShieldCheck}/>
              <StatItem label="Role" value={player.role} />
              {player.dateOfBirth && <StatItem label="Date of Birth" value={format(new Date(player.dateOfBirth), "MMMM d, yyyy")} icon={CalendarDays} />}
              {player.battingStyle && <StatItem label="Batting Style" value={player.battingStyle} />}
              {player.bowlingStyle && <StatItem label="Bowling Style" value={player.bowlingStyle} />}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Star className="h-5 w-5 text-[hsl(var(--primary))]"/> Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Player achievements will be listed here. (Coming Soon)</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

