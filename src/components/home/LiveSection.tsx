"use client";

import { useEffect, useState } from 'react';
import { fetchLiveMatches, fetchUpcomingMatches, fetchMatches } from "@/lib/firestore";
import { Match } from "@/types/firestore";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Calendar, Trophy, Activity } from "lucide-react";
import { format } from 'date-fns';

export function LiveSection() {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [recentResults, setRecentResults] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const [live, upcoming, recent] = await Promise.all([
          fetchLiveMatches(),
          fetchUpcomingMatches(5),
          fetchMatches(10)
        ]);
        
        setLiveMatches(live);
        setUpcomingMatches(upcoming);
        setRecentResults(recent.filter(m => m.status === 'completed').slice(0, 5));
      } catch (error) {
        console.error("Error loading matches:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Helper function to safely parse Firestore Timestamps
  const parseDate = (dateValue: unknown): Date | null => {
    if (!dateValue) return null;
    
    // Handle Firestore Timestamp objects
    if (typeof dateValue === 'object' && dateValue !== null && 'toDate' in dateValue) {
      return (dateValue as { toDate: () => Date }).toDate();
    }
    
    // Handle string or number
    if (typeof dateValue === 'string' || typeof dateValue === 'number') {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? null : date;
    }
    
    // Handle Date objects
    if (dateValue instanceof Date) {
      return isNaN(dateValue.getTime()) ? null : dateValue;
    }
    
    return null;
  };

  const formatMatchDate = (dateValue: unknown): string => {
    const date = parseDate(dateValue);
    if (!date) return 'TBA';
    try {
      return format(date, 'MMM d, h:mm a');
    } catch {
      return 'TBA';
    }
  };

  const MatchCard = ({ match }: { match: Match }) => (
    <Card className="mb-4 hover:border-primary transition-colors">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <Badge variant={match.status === 'live' ? 'destructive' : 'secondary'}>
            {match.status === 'live' ? 'LIVE' : match.status.toUpperCase()}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {formatMatchDate(match.dateTime)}
          </span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <div className="font-semibold text-lg">{match.homeTeamName || match.homeTeamId}</div>
          <div className="text-sm text-muted-foreground px-2">vs</div>
          <div className="font-semibold text-lg">{match.awayTeamName || match.awayTeamId}</div>
        </div>
        {(match.homeScore || match.awayScore) && (
          <div className="text-center font-mono text-xl font-bold bg-muted/50 py-2 rounded">
            {match.homeScore || '0'} - {match.awayScore || '0'}
          </div>
        )}
        {match.result && (
          <div className="mt-2 text-center text-sm text-primary font-medium">
            {match.result}
          </div>
        )}
      </CardContent>
    </Card>
  );


  return (
    <section className="py-12 bg-muted/30 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Match Center</h2>
          <p className="text-muted-foreground">Follow live scores, upcoming fixtures, and recent results</p>
        </div>

        <Tabs defaultValue="live" className="w-full max-w-3xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="live" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Live Scores</span>
              <span className="sm:hidden">Live</span>
              {liveMatches.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                  {liveMatches.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Fixtures</span>
              <span className="sm:hidden">Fixtures</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Results</span>
              <span className="sm:hidden">Results</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-4">
            {liveMatches.length > 0 ? (
              liveMatches.map(match => <MatchCard key={match.id} match={match} />)
            ) : (
              <div className="text-center py-12 text-muted-foreground bg-background rounded-lg border border-dashed">
                No live matches at the moment.
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingMatches.length > 0 ? (
              upcomingMatches.map(match => <MatchCard key={match.id} match={match} />)
            ) : (
              <div className="text-center py-12 text-muted-foreground bg-background rounded-lg border border-dashed">
                No upcoming matches scheduled.
              </div>
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {recentResults.length > 0 ? (
              recentResults.map(match => <MatchCard key={match.id} match={match} />)
            ) : (
              <div className="text-center py-12 text-muted-foreground bg-background rounded-lg border border-dashed">
                No recent results found.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
