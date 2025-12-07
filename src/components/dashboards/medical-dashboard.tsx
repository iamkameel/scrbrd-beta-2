"use client";

import React, { useEffect, useState } from 'react';
import { PageHeader } from '../dashboard/PageHeader';
import { MetricCard } from '../dashboard/MetricCard';
import FixtureCentreCard from '../dashboard/FixtureCentreCard';
import { HeartPulse, Activity, UserPlus, FileText } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { fetchPersonByEmail, fetchInjuredPlayers } from '@/app/actions/personActions';
import { Person } from '@/types/firestore';

export default function MedicalDashboard() {
  const { user } = useAuth();
  const [person, setPerson] = useState<Person | null>(null);
  const [injuredPlayers, setInjuredPlayers] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.email) return;
      
      try {
        const [profile, injured] = await Promise.all([
          fetchPersonByEmail(user.email),
          fetchInjuredPlayers()
        ]);
        
        setPerson(profile);
        setInjuredPlayers(injured || []);
      } catch (error) {
        console.error("Error loading medical dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader 
        title="Medical Centre" 
        description={`Welcome back, ${person?.firstName || user?.displayName || 'Doc'}. Track player health and rehabilitation.`}
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
            value={injuredPlayers.length}
            subtitle="Currently in rehab"
          />
          <MetricCard
            icon={Activity}
            label="Checkups Due"
            value={5} // Placeholder
            subtitle="This week"
          />
          <MetricCard
            icon={FileText}
            label="New Reports"
            value={12} // Placeholder
            subtitle="Filed this month"
          />
          <MetricCard
            icon={UserPlus}
            label="Cleared to Play"
            value={2} // Placeholder
            subtitle="Returned this week"
          />
        </div>
      </div>

      {/* Injury Status Board */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Injury Status Board</h3>
        <div className="space-y-4">
          {injuredPlayers.length > 0 ? (
            injuredPlayers.map(player => (
              <div key={player.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 font-bold">
                    {player.firstName[0]}{player.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{player.firstName} {player.lastName}</p>
                    <p className="text-sm text-muted-foreground">Undisclosed Injury</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:text-yellow-400">
                    Rehab
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">Est. Return: TBD</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No injured players reported.</p>
          )}
        </div>
      </div>
    </div>
  );
}
