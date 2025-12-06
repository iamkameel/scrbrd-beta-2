import React from 'react';
import { PageHeader } from '../dashboard/PageHeader';
import { MetricCard } from '../dashboard/MetricCard';
import FixtureCentreCard from '../dashboard/FixtureCentreCard';
import { User, Calendar, Activity, GraduationCap } from "lucide-react";

export default function GuardianDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader 
        title="Guardian Dashboard" 
        description="Monitor your child's progress, schedule, and performance."
      />

      {/* Fixture Centre */}
      <FixtureCentreCard 
        role="Guardian"
        maxMatches={3}
      />

      {/* Stats Grid */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Child Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={User}
            label="Child Profile"
            value="Active"
            subtitle="John Doe Jr."
          />
          <MetricCard
            icon={Calendar}
            label="Next Match"
            value="Sat"
            subtitle="09:00 AM vs Team B"
          />
          <MetricCard
            icon={Activity}
            label="Performance"
            value="Good"
            subtitle="Last match: 45 runs"
          />
          <MetricCard
            icon={GraduationCap}
            label="Academic"
            value="On Track"
            subtitle="GPA: 3.8"
          />
        </div>
      </div>

      {/* Schedule & Updates */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Schedule</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
              <div>
                <p className="font-medium text-foreground">Training Session</p>
                <p className="text-sm text-muted-foreground">Today, 4:00 PM</p>
              </div>
              <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium border border-primary/20">Required</div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
              <div>
                <p className="font-medium text-foreground">Match Day</p>
                <p className="text-sm text-muted-foreground">Saturday, 9:00 AM</p>
              </div>
              <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium border border-primary/20">Home Game</div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Updates</h3>
          <div className="space-y-4">
            <div className="border-l-2 border-emerald-500 pl-4 py-1">
              <p className="text-sm font-medium text-foreground">Uniform Update</p>
              <p className="text-xs text-muted-foreground mt-0.5">Please ensure white kits are ready for Saturday.</p>
            </div>
            <div className="border-l-2 border-green-500 pl-4 py-1">
              <p className="text-sm font-medium text-foreground">Match Result</p>
              <p className="text-xs text-muted-foreground mt-0.5">Team won by 20 runs last weekend!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
