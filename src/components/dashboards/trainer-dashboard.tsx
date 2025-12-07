"use client";

import React, { useEffect, useState } from 'react';
import { PageHeader } from '../dashboard/PageHeader';
import { MetricCard } from '../dashboard/MetricCard';
import FixtureCentreCard from '../dashboard/FixtureCentreCard';
import { Dumbbell, Activity, Calendar, Users, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getTrainerPlayersAction } from "@/app/actions/trainerActions";
import { Person } from "@/types/firestore";

export default function TrainerDashboard() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      getTrainerPlayersAction(user.email)
        .then(setPlayers)
        .finally(() => setLoading(false));
    } else {
        setLoading(false);
    }
  }, [user]);

  // Calculate stats
  const totalPlayers = players.length;
  const injuredPlayers = players.filter(p => p.status === 'injured');
  
  // Calculate average fitness (assuming 1-100 scale or similar)
  const fitnessScores = players
    .map(p => p.playerProfile?.physicalAttributes?.coreFitness || 0)
    .filter(s => s > 0);
  const avgFitness = fitnessScores.length > 0 
    ? Math.round(fitnessScores.reduce((a, b) => a + b, 0) / fitnessScores.length) 
    : 0;

  if (loading) {
      return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader 
        title="Trainer Dashboard" 
        description="Manage training sessions, player fitness, and workload."
      />

      {/* Fixture Centre */}
      <FixtureCentreCard 
        role="Trainer"
        maxMatches={3}
      />

      {/* Stats Grid */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Training Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={Dumbbell}
            label="Active Sessions"
            value={4} // Still hardcoded as we don't have sessions schema
            subtitle="Today"
          />
          <MetricCard
            icon={Activity}
            label="Player Fitness"
            value={`${avgFitness}%`}
            subtitle="Squad average"
          />
          <MetricCard
            icon={AlertCircle}
            label="Injuries"
            value={injuredPlayers.length}
            subtitle={injuredPlayers.length > 0 ? "Requires attention" : "All clear"}
          />
          <MetricCard
            icon={Users}
            label="Squad Size"
            value={totalPlayers}
            subtitle="Assigned players"
          />
        </div>
      </div>

      {/* Injured Players List */}
      {injuredPlayers.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-destructive flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Injured Players
            </h3>
            <div className="space-y-4">
                {injuredPlayers.map(player => (
                    <div key={player.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                        <div>
                            <p className="font-medium text-foreground">{player.displayName || `${player.firstName} ${player.lastName}`}</p>
                            <p className="text-sm text-muted-foreground">{player.teamIds?.join(', ') || 'Unknown Team'}</p>
                        </div>
                        <div className="text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                                Injured
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Plan & Focus */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Today&apos;s Plan</h3>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-muted/30 rounded-lg border border-border">
              <div className="mr-4 text-center min-w-[60px] border-r border-border pr-4">
                <div className="text-sm font-bold text-foreground">06:00</div>
                <div className="text-xs text-muted-foreground">AM</div>
              </div>
              <div>
                <div className="font-medium text-foreground">Cardio & Conditioning</div>
                <div className="text-sm text-muted-foreground">Group A - Track</div>
              </div>
            </div>
            <div className="flex items-center p-4 bg-muted/30 rounded-lg border border-border">
              <div className="mr-4 text-center min-w-[60px] border-r border-border pr-4">
                <div className="text-sm font-bold text-foreground">16:00</div>
                <div className="text-xs text-muted-foreground">PM</div>
              </div>
              <div>
                <div className="font-medium text-foreground">Strength Training</div>
                <div className="text-sm text-muted-foreground">Group B - Gym</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Focus Areas</h3>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li><span className="text-foreground font-medium">Bowlers:</span> Improve shuttle run times.</li>
            <li><span className="text-foreground font-medium">Batters:</span> Core stability drills.</li>
            <li><span className="text-foreground font-medium">All Squad:</span> Recovery session post-match on Sunday.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
