import React from 'react';
import { PageHeader } from '../dashboard/PageHeader';
import { MetricCard } from '../dashboard/MetricCard';
import FixtureCentreCard from '../dashboard/FixtureCentreCard';
import { Trophy, Target, Activity, Calendar } from "lucide-react";

export default function PlayerDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader 
        title="Player Dashboard" 
        description="Track your performance, fitness, and upcoming schedule."
      />

      {/* Fixture Centre */}
      <FixtureCentreCard 
        role="Player"
        maxMatches={3}
      />

      {/* Stats Grid */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">My Stats</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={Trophy}
            label="Matches Played"
            value={12}
            subtitle="This season"
          />
          <MetricCard
            icon={Target}
            label="Batting Avg"
            value={45.2}
            subtitle="+2.5 from last season"
          />
          <MetricCard
            icon={Activity}
            label="Fitness Score"
            value={92}
            subtitle="Elite level"
          />
          <MetricCard
            icon={Calendar}
            label="Next Match"
            value="Sat"
            subtitle="vs Royal Challengers"
          />
        </div>
      </div>

      {/* Performance & Schedule */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
            [Stats Chart Placeholder]
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Schedule</h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 rounded-lg bg-muted/30 border border-border">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Team Training</p>
                <p className="text-xs text-muted-foreground">Today, 16:00 - Nets</p>
              </div>
            </div>
            <div className="flex items-center p-3 rounded-lg bg-muted/30 border border-border">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Physio Session</p>
                <p className="text-xs text-muted-foreground">Tomorrow, 10:00 - Gym</p>
              </div>
            </div>
            <div className="flex items-center p-3 rounded-lg bg-muted/30 border border-border">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-3 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Match Day</p>
                <p className="text-xs text-muted-foreground">Saturday, 09:00 - Home</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
