"use client";

import React, { useEffect, useState } from 'react';
import { PageHeader } from '../dashboard/PageHeader';
import { MetricCard } from '../dashboard/MetricCard';
import FixtureCentreCard from '../dashboard/FixtureCentreCard';
import { Truck, MapPin, Clock, Calendar, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getDriverTripsAction } from "@/app/actions/transportActions";
import { Trip } from "@/types/firestore";
import { format } from "date-fns";

export default function DriverDashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      getDriverTripsAction(user.email)
        .then(setTrips)
        .finally(() => setLoading(false));
    } else {
        setLoading(false);
    }
  }, [user]);

  // Calculate stats
  const upcomingTrips = trips.filter(t => new Date(t.date) > new Date());
  const nextTrip = upcomingTrips[0];
  const totalTrips = trips.length;
  const hoursLogged = 0; // Placeholder until we have duration data

  if (loading) {
      return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

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
            value={nextTrip ? format(new Date(nextTrip.date), "HH:mm") : "--:--"}
            subtitle={nextTrip ? `To: ${nextTrip.destination}` : "No upcoming trips"}
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
            value={totalTrips}
            subtitle="All time"
          />
          <MetricCard
            icon={Clock}
            label="Hours Logged"
            value={hoursLogged}
            subtitle="This week"
          />
        </div>
      </div>

      {/* Upcoming Schedule */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Upcoming Schedule</h3>
        {upcomingTrips.length > 0 ? (
            <div className="space-y-4">
            {upcomingTrips.map((trip) => (
                <div key={trip.tripId} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                    <div>
                        <p className="font-medium text-foreground">{trip.purpose}</p>
                        <p className="text-sm text-muted-foreground">Passengers: {trip.passengers || trip.passengerCount || 0}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-medium text-foreground">{format(new Date(trip.date), "EEE, MMM d, HH:mm")}</p>
                        <p className="text-sm text-muted-foreground">Destination: {trip.destination}</p>
                    </div>
                </div>
            ))}
            </div>
        ) : (
            <p className="text-muted-foreground">No upcoming trips scheduled.</p>
        )}
      </div>
    </div>
  );
}
