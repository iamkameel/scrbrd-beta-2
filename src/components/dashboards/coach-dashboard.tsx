"use client";

import React, { useEffect, useState } from 'react';
import { PageHeader } from '../dashboard/PageHeader';
import { MetricCard } from '../dashboard/MetricCard';
import FixtureCentreCard from '../dashboard/FixtureCentreCard';
import { CalendarDays, ClipboardList, Users, Trophy } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { fetchPersonByEmail } from '@/app/actions/personActions';
import { fetchMatchesForTeams } from '@/app/actions/matchActions';
import { Match, Person } from '@/types/firestore';
import { format } from 'date-fns';

export default function CoachDashboard() {
  const { user } = useAuth();
  const [person, setPerson] = useState<Person | null>(null);
  const [matches, setMatches] = useState<{ upcoming: Match[], past: Match[], total: number }>({ upcoming: [], past: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.email) return;
      
      try {
        const profile = await fetchPersonByEmail(user.email);
        setPerson(profile);
        
        if (profile?.teamIds && profile.teamIds.length > 0) {
          const matchData = await fetchMatchesForTeams(profile.teamIds);
          if (matchData.success) {
            setMatches({
              upcoming: matchData.upcoming || [],
              past: matchData.past || [],
              total: matchData.total || 0
            });
          }
        }
      } catch (error) {
        console.error("Error loading coach dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const nextMatch = matches.upcoming[0];
  const wins = matches.past.filter(m => {
      // Simple win check logic (needs refinement based on result string or winnerId)
      // Assuming we can check winnerId against user's teamIds
      if (!m.completion?.winner) return false;
      // This is tricky without knowing which team is "my" team for a specific match if coach has multiple.
      // For now, let's just count completed matches as a placeholder or use a mock win rate.
      return false; 
  }).length;

  // Placeholder for active players count - would need a fetchPlayersByTeam action
  const activePlayers = 24; 

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader 
        title="Coach Dashboard" 
        description={`Welcome back, ${person?.firstName || user?.displayName || 'Coach'}. Manage your team and fixtures.`}
      />

      {/* Fixture Centre */}
      <FixtureCentreCard 
        role="Coach"
        maxMatches={3}
        teamId={person?.teamIds?.[0]} // Pass primary team ID for filtering
      />

      {/* Stats Grid */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Team Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={CalendarDays}
            label="Upcoming Matches"
            value={matches.upcoming.length}
            subtitle={nextMatch ? `Next: ${format(new Date(nextMatch.matchDate as string), 'EEE HH:mm')}` : "No upcoming matches"}
          />
          <MetricCard
            icon={Users}
            label="Active Players"
            value={activePlayers}
            subtitle="2 injured, 22 available"
          />
          <MetricCard
            icon={ClipboardList}
            label="Training Sessions"
            value={12}
            subtitle="Scheduled for this week"
          />
          <MetricCard
            icon={Trophy}
            label="Season Matches"
            value={matches.total}
            subtitle={`${matches.past.length} completed`}
          />
        </div>
      </div>

      {/* Training Schedule (Keep existing layout for now but styled) */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Team Performance</h3>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
            [Performance Chart Placeholder]
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Training Schedule</h3>
          <div className="space-y-4">
            <div className="flex items-center border-l-4 border-primary pl-4 py-1">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none text-foreground">Batting Practice</p>
                <p className="text-sm text-muted-foreground">Today, 15:00 - Nets A</p>
              </div>
            </div>
            <div className="flex items-center border-l-4 border-muted pl-4 py-1">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none text-foreground">Fielding Drills</p>
                <p className="text-sm text-muted-foreground">Tomorrow, 09:00 - Main Field</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
