"use client";

import { useState, useEffect } from 'react';
import { fetchCollection } from '@/lib/firestore';
import { MetricCard } from './MetricCard';
import { 
  Trophy, School, Shield, Users, UserCog, Heart, 
  MapPin, UserCheck, Shovel, ListChecks, Truck, Medal 
} from 'lucide-react';
import { where } from 'firebase/firestore';

export default function DashboardStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    async function loadStats() {
      try {
        const [
          schools,
          teams,
          players,
          staffProfiles,
          medicalStaff,
          fields,
          officials,
          groundStaff,
          matches,
          vehicles
        ] = await Promise.all([
          fetchCollection('schools'),
          fetchCollection('teams'),
          fetchCollection('people', [where('role', '==', 'Player')]),
          fetchCollection('staffProfiles'),
          fetchCollection('people', [where('role', 'in', ['Medical', 'Trainer'])]),
          fetchCollection('fields'),
          fetchCollection('people', [where('role', 'in', ['Umpire', 'Scorer'])]),
          fetchCollection('people', [where('role', '==', 'Groundskeeper')]),
          fetchCollection('matches'),
          fetchCollection('vehicles')
        ]);

        const statsData = [
          {
            icon: Trophy,
            label: 'Competitions',
            value: 1,
            subtitle: 'active this season'
          },
          {
            icon: School,
            label: 'Schools',
            value: schools.length,
            subtitle: 'registered in system'
          },
          {
            icon: Shield,
            label: 'Teams',
            value: teams.length,
            subtitle: 'across all divisions'
          },
          {
            icon: Users,
            label: 'Players',
            value: players.length,
            subtitle: 'active players'
          },
          {
            icon: UserCog,
            label: 'Staff',
            value: staffProfiles.length,
            subtitle: 'coaches & officials'
          },
          {
            icon: Heart,
            label: 'Medical & Support',
            value: medicalStaff.length,
            subtitle: 'all support staff'
          },
          {
            icon: MapPin,
            label: 'Fields & Venues',
            value: fields.length,
            subtitle: 'available for booking'
          },
          {
            icon: UserCheck,
            label: 'Officials',
            value: officials.length,
            subtitle: 'umpires & scorers'
          },
          {
            icon: Shovel,
            label: 'Ground Staff',
            value: groundStaff.length,
            subtitle: 'assigned groundskeepers'
          },
          {
            icon: ListChecks,
            label: 'Fixtures',
            value: matches.length,
            subtitle: 'total matches'
          },
          {
            icon: Truck,
            label: 'Transport',
            value: vehicles.length,
            subtitle: 'vehicles in fleet'
          },
          {
            icon: Medal,
            label: 'Awards',
            value: 0,
            subtitle: 'trophies & accolades'
          },
        ];

        setStats(statsData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Global Overview
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Loading statistics...
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Global Overview
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        High-level metrics across the entire system. Click a card to navigate.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <MetricCard key={index} {...stat} />
        ))}
      </div>
    </div>
  );
}
