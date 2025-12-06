import React from 'react';
import { PageHeader } from '../dashboard/PageHeader';
import { MetricCard } from '../dashboard/MetricCard';
import FixtureCentreCard from '../dashboard/FixtureCentreCard';
import { HeartPulse, Activity, UserPlus, FileText } from "lucide-react";

export default function MedicalDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader 
        title="Medical Centre" 
        description="Track player health, injuries, and rehabilitation progress."
      />

      {/* Fixture Centre */}
      <FixtureCentreCard 
        role="Medical"
        maxMatches={3}
      />

      {/* Stats Grid */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Health Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={HeartPulse}
            label="Injured Players"
            value={3}
            subtitle="Currently in rehab"
          />
          <MetricCard
            icon={Activity}
            label="Checkups Due"
            value={5}
            subtitle="This week"
          />
          <MetricCard
            icon={FileText}
            label="New Reports"
            value={12}
            subtitle="Filed this month"
          />
          <MetricCard
            icon={UserPlus}
            label="Cleared to Play"
            value={2}
            subtitle="Returned this week"
          />
        </div>
      </div>

      {/* Injury Status Board */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Injury Status Board</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 font-bold">BS</div>
              <div>
                <p className="font-medium text-foreground">Ben Stokes</p>
                <p className="text-sm text-muted-foreground">Hamstring Strain</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:text-yellow-400">
                Rehab - Week 2
              </span>
              <p className="text-xs text-muted-foreground mt-1">Est. Return: 14 Days</p>
            </div>
          </div>
          <div className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">JD</div>
              <div>
                <p className="font-medium text-foreground">John Doe</p>
                <p className="text-sm text-muted-foreground">Ankle Sprain</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-400">
                Cleared
              </span>
              <p className="text-xs text-muted-foreground mt-1">Return: Next Match</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
