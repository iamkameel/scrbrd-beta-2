import React from 'react';
import { PageHeader } from '../dashboard/PageHeader';
import { MetricCard } from '../dashboard/MetricCard';
import FixtureCentreCard from '../dashboard/FixtureCentreCard';
import { Truck, MapPin, Clock, Calendar } from "lucide-react";

export default function DriverDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader 
        title="Transport Dashboard" 
        description="Manage vehicle assignments, trips, and schedules."
      />

      {/* Fixture Centre */}
      <FixtureCentreCard 
        role="Driver"
        maxMatches={3}
      />

      {/* Stats Grid */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">My Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={Calendar}
            label="Next Trip"
            value="08:00"
            subtitle="Tomorrow: Team A to Stadium"
          />
          <MetricCard
            icon={Truck}
            label="Vehicle Status"
            value="Good"
            subtitle="Bus #42 - Fuel: 80%"
          />
          <MetricCard
            icon={MapPin}
            label="Total Trips"
            value={15}
            subtitle="This month"
          />
          <MetricCard
            icon={Clock}
            label="Hours Logged"
            value={42.5}
            subtitle="Hours this week"
          />
        </div>
      </div>

      {/* Upcoming Schedule */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Upcoming Schedule</h3>
        <div className="space-y-4">
           <div className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
              <div>
                <p className="font-medium text-foreground">Team A - Away Match</p>
                <p className="text-sm text-muted-foreground">Pickup: School Main Gate</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">Tomorrow, 08:00 AM</p>
                <p className="text-sm text-muted-foreground">Destination: City Stadium</p>
              </div>
           </div>
           <div className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
              <div>
                <p className="font-medium text-foreground">Equipment Transport</p>
                <p className="text-sm text-muted-foreground">Pickup: Storage Facility</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">Wed, 10:00 AM</p>
                <p className="text-sm text-muted-foreground">Destination: Training Grounds</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
