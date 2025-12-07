"use client";

import React, { useEffect, useState } from 'react';
import { PageHeader } from '../dashboard/PageHeader';
import { MetricCard } from '../dashboard/MetricCard';
import FixtureCentreCard from '../dashboard/FixtureCentreCard';
import { Eye, BookOpen, Calendar, CheckSquare } from "lucide-react";
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { fetchPersonByEmail } from '@/app/actions/personActions';
import { fetchOfficialMatches } from '@/app/actions/matchActions';
import { Match, Person } from '@/types/firestore';
import { format } from 'date-fns';

export default function UmpireScorerDashboard() {
  const { user } = useAuth();
  const [person, setPerson] = useState<Person | null>(null);
  const [matches, setMatches] = useState<{ upcoming: Match[], past: Match[], total: number }>({ upcoming: [], past: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.email) return;
      
      try {
        // Fetch profile
        const profile = await fetchPersonByEmail(user.email);
        setPerson(profile);
        
        if (profile?.id) {
          // Fetch matches
          const matchData = await fetchOfficialMatches(profile.id);
          if (matchData.success) {
            setMatches({
              upcoming: matchData.upcoming || [],
              past: matchData.past || [],
              total: matchData.total || 0
            });
          }
        } else if (user.uid) {
           // Fallback to user.uid if no profile found (though unlikely for official)
           const matchData = await fetchOfficialMatches(user.uid);
           if (matchData.success) {
            setMatches({
              upcoming: matchData.upcoming || [],
              past: matchData.past || [],
              total: matchData.total || 0
            });
          }
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Calculate stats
  const matchesOfficiated = matches.past.filter(m => m.status === 'completed').length;
  const nextMatch = matches.upcoming[0];
  
  // Get certification from profile
  // Check umpireProfile or scorerProfile
  const certification = person?.umpireProfile?.certificationLevel || person?.scorerProfile?.certificationLevel || "N/A";

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader 
        title="Officials Dashboard" 
        description={`Welcome back, ${person?.firstName || user?.displayName || 'Official'}. Manage your assignments and reports.`}
      />

      {/* Fixture Centre - Pass assigned match IDs */}
      <FixtureCentreCard 
        role="Umpire"
        maxMatches={3}
        assignedMatches={[...matches.upcoming, ...matches.past].map(m => m.id)}
      />

      {/* Stats Grid */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">My Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={Calendar}
            label="Next Assignment"
            value={nextMatch ? format(new Date(nextMatch.matchDate as string), 'EEE') : "-"}
            subtitle={nextMatch ? `${format(new Date(nextMatch.matchDate as string), 'HH:mm')} - ${nextMatch.venue || 'TBD'}` : "No upcoming matches"}
          />
          <MetricCard
            icon={Eye}
            label="Matches Officiated"
            value={matchesOfficiated}
            subtitle="This season"
          />
          <MetricCard
            icon={CheckSquare}
            label="Certification"
            value={certification === "N/A" ? "-" : certification.split(' ')[0]} // e.g. "Level"
            subtitle={certification === "N/A" ? "No certification" : certification}
          />
           <MetricCard
            icon={BookOpen}
            label="Rulebook Updates"
            value="v2.4"
            subtitle="Latest version"
          />
        </div>
      </div>

      {/* Resources & Quick Links */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Fixtures</h3>
          <div className="space-y-4">
            {matches.upcoming.length > 0 ? (
              matches.upcoming.slice(0, 3).map(match => (
                <div key={match.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-foreground">{match.homeTeamName || 'Home'} vs {match.awayTeamName || 'Away'}</p>
                    <p className="text-sm text-muted-foreground">
                      {match.matchType || 'Match'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{format(new Date(match.matchDate as string), 'MMM d, HH:mm')}</p>
                    <p className="text-sm text-muted-foreground">Venue: {match.venue || 'TBD'}</p>
                  </div>
                </div>
              ))
            ) : (
               <p className="text-muted-foreground text-sm">No upcoming fixtures assigned.</p>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Resources</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/resources/rules" className="flex flex-col items-center justify-center p-4 border border-border rounded-lg hover:bg-muted/50 hover:border-primary/50 transition-all group">
                <BookOpen className="h-6 w-6 mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-foreground">Rule Book</span>
            </Link>
            <Link href="/reports/new" className="flex flex-col items-center justify-center p-4 border border-border rounded-lg hover:bg-muted/50 hover:border-primary/50 transition-all group">
                <CheckSquare className="h-6 w-6 mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-foreground">Match Report</span>
            </Link>
            <Link href="/resources/drs" className="flex flex-col items-center justify-center p-4 border border-border rounded-lg hover:bg-muted/50 hover:border-primary/50 transition-all group">
                <Eye className="h-6 w-6 mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-foreground">DRS Review</span>
            </Link>
            <Link href="/roster" className="flex flex-col items-center justify-center p-4 border border-border rounded-lg hover:bg-muted/50 hover:border-primary/50 transition-all group">
                <Calendar className="h-6 w-6 mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-foreground">Roster</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
