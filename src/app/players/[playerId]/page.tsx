
"use client";

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { playersData, type PlayerProfile, type PlayerSkills, type ScoreDetail } from '@/lib/player-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BarChart3, Briefcase, Info, ShieldCheck, Star, Target, Zap, Brain, CalendarDays, Hash, AtSign, Activity, TrendingUp, Crosshair, Users, Shirt, ShieldQuestion } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const StatItem: React.FC<{ label: string; value: string | number | undefined; icon?: React.ElementType }> = ({ label, value, icon: Icon }) => (
  <div className="flex justify-between py-2 border-b border-border/50 last:border-b-0">
    <div className="flex items-center text-muted-foreground">
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      <span>{label}</span>
    </div>
    <span className="font-semibold text-right">{value !== undefined ? value : 'N/A'}</span>
  </div>
);

const DetailedStat: React.FC<{ label: string; scoreDetail: ScoreDetail | undefined; icon: React.ElementType }> = ({ label, scoreDetail, icon: Icon }) => {
  if (!scoreDetail || !scoreDetail.value) {
    return (
      <div className="mt-4 pt-3 border-t">
        <h5 className="text-sm font-semibold mb-1 flex items-center">
          <Icon className="mr-2 h-4 w-4 text-yellow-500" /> {label}
        </h5>
        <p className="text-lg text-muted-foreground">N/A</p>
      </div>
    );
  }
  return (
    <div className="mt-4 pt-3 border-t">
      <h5 className="text-sm font-semibold mb-1 flex items-center">
        <Icon className="mr-2 h-4 w-4 text-yellow-500" /> {label}
      </h5>
      <p className="text-xl font-bold text-primary">{scoreDetail.value}</p>
      {scoreDetail.opponent && scoreDetail.year && scoreDetail.venue && (
        <p className="text-xs text-muted-foreground mt-0.5">
          vs {scoreDetail.opponent}, {scoreDetail.year} at {scoreDetail.venue}
        </p>
      )}
    </div>
  );
};


const SkillCategory: React.FC<{ title: string; skills: Record<string, number | undefined> | undefined; icon: React.ElementType }> = ({ title, skills, icon: Icon }) => {
  if (!skills || Object.values(skills).filter(v => v !== undefined).length === 0) {
    return null;
  }

  return (
    <div className="mb-6 last:mb-0">
      <h4 className="text-md font-semibold mb-3 flex items-center gap-1.5">
        <Icon className="h-5 w-5 text-[hsl(var(--accent))]"/> {title}
      </h4>
      <div className="space-y-3">
        {Object.entries(skills).map(([key, value]) => {
          if (value === undefined) return null;
          const skillName = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
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

const PlayerStatDisplay: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
  <div className="text-center">
    <p className="text-xs uppercase text-muted-foreground tracking-wider">{label}</p>
    <p className="text-xl font-bold text-foreground">{value !== undefined ? value : '-'}</p>
  </div>
);

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
  
  const roleAbbreviation = player.role.substring(0,2).toUpperCase();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Button variant="outline" asChild className="mb-6 print:hidden">
        <Link href="/players">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Players List
        </Link>
      </Button>

      {/* Player Card Overview */}
      <Card className="overflow-hidden shadow-xl bg-card border-2 border-primary/20 rounded-xl">
        <div className="relative p-6 bg-gradient-to-br from-primary/90 to-primary/70 text-primary-foreground rounded-t-lg">
          {/* Top section: Rating, Role, Team Logos (simplified) */}
          <div className="flex items-start justify-between mb-4">
            <div className="text-left">
              <p className="text-4xl font-bold leading-none">
                {/* Placeholder for Overall Rating, using a skill or N/A */}
                {player.skills?.technical?.battingTechnique ? Math.round(player.skills.technical.battingTechnique / 100 * 90) + 5 : 'N/A'}
              </p>
              <p className="text-lg font-semibold uppercase tracking-wider">{roleAbbreviation}</p>
            </div>
            <div className="flex flex-col items-end space-y-1">
               {/* Simplified Team display */}
              <div className="flex items-center gap-2 p-2 bg-black/20 rounded-md">
                <ShieldQuestion className="h-5 w-5" /> {/* Placeholder for team logo */}
                <span className="text-xs font-medium">{player.team}</span>
              </div>
              {/* Placeholder for national team if data was available */}
            </div>
          </div>

          {/* Player Image */}
          <div className="flex justify-center mb-2">
            <Avatar className="h-40 w-40 border-4 border-background shadow-2xl">
              <AvatarImage src={player.avatar} alt={player.name} data-ai-hint="player action" className="object-cover"/>
              <AvatarFallback className="text-5xl">{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        {/* Player Name */}
        <div className="text-center py-4 bg-card border-t border-b border-border">
          <h1 className="text-3xl font-bold text-foreground">{player.name}</h1>
          <p className="text-sm text-muted-foreground">{player.role} {player.careerSpan && `| ${player.careerSpan}`}</p>
        </div>

        {/* Stats Grid */}
        <div className="p-6 bg-card rounded-b-lg">
          <div className="space-y-5">
            {/* Batting Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <PlayerStatDisplay label="Mat" value={player.stats.matchesPlayed} />
              <PlayerStatDisplay label="Runs" value={player.stats.runs} />
              <PlayerStatDisplay label="Bat Avg" value={player.stats.average} />
              <PlayerStatDisplay label="SR" value={player.stats.strikeRate} />
            </div>
            {/* Bowling Stats & Fielding */}
            {(player.stats.wickets !== undefined || player.stats.bowlingAverage !== undefined || player.stats.economyRate !== undefined || player.stats.catches !== undefined) && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/50">
                <PlayerStatDisplay label="Wkts" value={player.stats.wickets} />
                <PlayerStatDisplay label="Bowl Avg" value={player.stats.bowlingAverage} />
                <PlayerStatDisplay label="Econ" value={player.stats.economyRate} />
                <PlayerStatDisplay label="Catches" value={player.stats.catches} />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Original Content: Bio, Detailed Stats Tabs, Skills etc. */}
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
                <BarChart3 className="h-5 w-5 text-[hsl(var(--primary))]"/> Detailed Career Statistics
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
                      <StatItem label="100s" value={player.stats.hundreds} />
                      <StatItem label="50s" value={player.stats.fifties} />
                    </div>
                    <DetailedStat label="Highest Score" scoreDetail={player.stats.highestScore} icon={Star} />
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
                    </div>
                    <DetailedStat label="Best Bowling" scoreDetail={player.stats.bestBowling} icon={Star} />
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
                <SkillCategory title="Technical Skills" skills={player.skills.technical} icon={Target} />
                <SkillCategory title="Tactical Awareness" skills={player.skills.tactical} icon={Briefcase} />
                <SkillCategory title="Physical & Mental Attributes" skills={player.skills.physicalMental} icon={Activity} />
                <SkillCategory title="Team & Leadership" skills={player.skills.teamLeadership} icon={Users} />
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

