"use client";

import React, { useEffect, useState } from 'react';
import ManagementCard from './ManagementCard';
import { 
  Users, UserCog, UserCheck, Shield, Trophy, ListChecks, 
  School, MapPin, Truck, Wallet, Handshake, Database, UsersRound 
} from 'lucide-react';
import { fetchPendingUserCount } from '@/app/actions/userActions';

export default function ManagementHub() {
  const [pendingUserCount, setPendingUserCount] = useState<number>(0);

  useEffect(() => {
    const loadCounts = async () => {
      const count = await fetchPendingUserCount();
      setPendingUserCount(count);
    };
    loadCounts();
  }, []);

  const managementCards = [
    {
      icon: Users,
      title: 'Player Management',
      description: 'Manage player profiles, stats, and specialized attributes.',
      href: '/players'
    },
    {
      icon: UserCog,
      title: 'Staff Management',
      description: 'Manage coaches, medical staff, and grounds keepers.',
      href: '/people'
    },
    {
      icon: UserCheck,
      title: 'Official Management',
      description: 'Manage umpires, scorers, and assign match officials.',
      href: '/people'
    },
    {
      icon: Shield,
      title: 'Team Management',
      description: 'Create teams, manage rosters, and assign captains.',
      href: '/teams'
    },
    {
      icon: Trophy,
      title: 'Competition Management',
      description: 'Set up leagues, cups, and tournaments.',
      href: '/browse-leagues'
    },
    {
      icon: ListChecks,
      title: 'Fixture Management',
      description: 'Schedule matches and manage ground availability.',
      href: '/matches'
    },
    {
      icon: School,
      title: 'School & Division Management',
      description: 'Manage schools, divisions, and seasons.',
      href: '/schools'
    },
    {
      icon: MapPin,
      title: 'Field & Venue Management',
      description: 'Manage grounds, facilities, and maintenance logs.',
      href: '/fields'
    },
    {
      icon: Truck,
      title: 'Transport Hub',
      description: 'Manage vehicles and driver assignments.',
      href: '/transport'
    },
    {
      icon: Wallet,
      title: 'Financials',
      description: 'Track income, expenses, and sponsor contributions.',
      href: '/financials'
    },
    {
      icon: Handshake,
      title: 'Sponsors',
      description: 'Manage league and team sponsors.',
      href: '/sponsors'
    },
    {
      icon: Database,
      title: 'Data Management',
      description: 'Migrate sample data or clear records.',
      href: '/data-management'
    },
    {
      icon: UsersRound,
      title: 'User Management',
      description: pendingUserCount > 0 ? `${pendingUserCount} new signups awaiting role assignment.` : 'Invite new users or manage existing user roles.',
      href: '/user-management',
      badge: pendingUserCount > 0 ? `${pendingUserCount} New` : undefined
    },
  ];

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Management Hub
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Quick access to key management areas where you can add and assign resources.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {managementCards.map((card, index) => (
          <ManagementCard key={index} {...card} />
        ))}
      </div>
    </div>
  );
}
