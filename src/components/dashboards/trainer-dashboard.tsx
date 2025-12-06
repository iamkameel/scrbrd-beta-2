import React from 'react';
import { PageHeader } from '../dashboard/PageHeader';
import { MetricCard } from '../dashboard/MetricCard';
import FixtureCentreCard from '../dashboard/FixtureCentreCard';
import { Dumbbell, Activity, Calendar, Users } from "lucide-react";

export default function TrainerDashboard() {
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
            value={4}
            subtitle="Today"
          />
          <MetricCard
            icon={Activity}
            label="Player Fitness"
            value="95%"
            subtitle="Squad average"
          />
          <MetricCard
            icon={Calendar}
            label="Workload"
            value="High"
            subtitle="Pre-season peak"
          />
          <MetricCard
            icon={Users}
            label="Group Size"
            value={15}
            subtitle="Avg per session"
          />
        </div>
      </div>

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
