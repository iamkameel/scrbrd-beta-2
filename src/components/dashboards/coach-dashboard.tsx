import React from 'react';
import { PageHeader } from '../dashboard/PageHeader';
import { MetricCard } from '../dashboard/MetricCard';
import FixtureCentreCard from '../dashboard/FixtureCentreCard';
import { CalendarDays, ClipboardList, Users, Trophy } from "lucide-react";

export default function CoachDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader 
        title="Coach Dashboard" 
        description="Manage your team, training sessions, and upcoming fixtures."
      />

      {/* Fixture Centre */}
      <FixtureCentreCard 
        role="Coach"
        maxMatches={3}
      />

      {/* Stats Grid */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Team Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={CalendarDays}
            label="Upcoming Matches"
            value={3}
            subtitle="Next match in 2 days"
          />
          <MetricCard
            icon={Users}
            label="Active Players"
            value={24}
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
            label="Season Wins"
            value={8}
            subtitle="Win rate: 75%"
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
