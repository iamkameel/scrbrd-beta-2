// Scorer Detail page

"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchScorerById, type ScorerProfile } from '@/lib/scorer-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Mail, Phone, ShieldCheck, CalendarClock, CheckCircle, Star, ListChecks, Info, Building, Briefcase, FileText, Loader2 } from "lucide-react";

const DetailItem: React.FC<{ label: string; value: string | number | undefined | React.ReactNode; icon?: React.ElementType; className?: string }> = ({ label, value, icon: Icon, className }) => (
  <div className={`flex items-start py-2 ${className || ''}`}>
    {Icon && <Icon className="mr-3 h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />}
    <div className="flex-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {value !== undefined && value !== null ? (
        typeof value === 'string' || typeof value === 'number' ? (
          <p className="text-md text-foreground">{value}</p>
        ) : (
          <div className="text-md text-foreground">{value}</div>
        )
      ) : (
        <p className="text-md text-muted-foreground">N/A</p>
      )}
    </div>
  </div>
);

export default function ScorerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const scorerId = params.scorerId as string;
  
  const [scorer, setScorer] = React.useState<ScorerProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadScorer = async () => {
      try {
        const data = await fetchScorerById(scorerId);
        setScorer(data);
      } catch (error) {
        console.error('Error loading scorer:', error);
      } finally {
        setLoading(false);
      }
    };
    loadScorer();
  }, [scorerId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading scorer details...</p>
      </div>
    );
  }

  if (!scorer) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Scorer Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Sorry, we couldn&apos;t find details for this scorer.</p>
            <Button onClick={() => router.push('/scorer-profiles')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Scorer Profiles
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Button variant="outline" asChild className="mb-6 print:hidden">
        <Link href="/scorer-profiles">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Scorer Profiles
        </Link>
      </Button>

      <Card className="overflow-hidden shadow-lg rounded-xl">
        <CardHeader className="bg-muted/50 p-6 flex flex-col items-center text-center space-y-3 md:flex-row md:text-left md:space-y-0 md:space-x-6">
          <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-background shadow-md">
            <AvatarImage src={scorer.avatar} alt={scorer.name} data-ai-hint="person portrait" />
            <AvatarFallback className="text-3xl">{scorer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold">{scorer.name}</CardTitle>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <Badge variant="default" className="text-sm px-3 py-1">{scorer.scoringLevel}</Badge>
              <Badge variant="secondary" className="text-sm px-3 py-1">{scorer.availability}</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {scorer.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Info className="h-5 w-5 text-[hsl(var(--primary))]" /> About {scorer.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">{scorer.bio}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-[hsl(var(--primary))]" /> Recent Match Assignments
              </CardTitle>
              <CardDescription>Matches recently scored by {scorer.name}.</CardDescription>
            </CardHeader>
            <CardContent>
              {scorer.recentMatchesScored.length > 0 ? (
                <div className="space-y-4">
                  {scorer.recentMatchesScored.map((match) => (
                    <Card key={match.fixtureId} className="bg-muted/30 p-4 shadow-sm">
                      <p className="font-semibold text-md">{match.matchDescription}</p>
                      <p className="text-sm text-muted-foreground">Date: {match.date}</p>
                      {match.result && (
                        <p className="text-sm text-muted-foreground">Result: {match.result}</p>
                      )}
                      <Button asChild variant="link" size="sm" className="p-0 h-auto mt-1 text-primary">
                        <Link href={`/scorecard/${match.fixtureId}`}>View Scorecard</Link>
                      </Button>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No recent match assignments found.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[hsl(var(--primary))]" /> Professional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              <DetailItem label="Scoring Level" value={scorer.scoringLevel} icon={ShieldCheck} />
              <DetailItem label="Availability" value={scorer.availability} icon={CalendarClock} />
              <DetailItem label="Years of Experience" value={`${scorer.experienceYears} years`} icon={CheckCircle} />
              <DetailItem label="Total Matches Scored" value={scorer.matchesScoredCount} icon={FileText} />
              {scorer.accuracyScore !== undefined && (
                <DetailItem 
                  label="Accuracy Score" 
                  value={
                    <div className="flex items-center gap-2">
                      <span>{scorer.accuracyScore}/100</span>
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                  } 
                  icon={Star} 
                />
              )}
              {scorer.associatedSchool && (
                <DetailItem label="Primary Affiliation" value={scorer.associatedSchool} icon={Building} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Mail className="h-5 w-5 text-[hsl(var(--primary))]" /> Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              <DetailItem label="Email Address" value={scorer.email} icon={Mail} />
              <DetailItem label="Phone Number" value={scorer.phone} icon={Phone} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
