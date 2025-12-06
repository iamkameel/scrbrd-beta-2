import React from 'react';
import { PageHeader } from '../dashboard/PageHeader';
import { MetricCard } from '../dashboard/MetricCard';
import FixtureCentreCard from '../dashboard/FixtureCentreCard';
import { Ticket, Calendar, MapPin, Users, ChevronRight } from "lucide-react";
import Link from 'next/link';

export default function SpectatorDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader 
        title="Spectator Hub" 
        description="Follow live matches, buy tickets, and stay updated."
      />

      {/* Fixture Centre */}
      <FixtureCentreCard 
        role="Spectator"
        maxMatches={5}
      />

      {/* Stats Grid */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Event Info</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={Calendar}
            label="Next Big Match"
            value="Sun"
            subtitle="Finals: Team A vs Team B"
          />
          <MetricCard
            icon={Ticket}
            label="My Tickets"
            value={2}
            subtitle="Purchased for finals"
          />
          <MetricCard
            icon={MapPin}
            label="Venue"
            value="Oval"
            subtitle="Gate 4 Entry"
          />
          <MetricCard
            icon={Users}
            label="Attendance"
            value="5k+"
            subtitle="Expected crowd"
          />
        </div>
      </div>

      {/* News & Highlights */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Live Updates</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-foreground">Capitals</span>
                  <span className="text-muted-foreground text-xs">vs</span>
                  <span className="font-bold text-foreground">Sunrisers</span>
                </div>
                <div className="text-sm text-primary font-medium">145/3 (15.4 ov)</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="bg-red-500/10 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/20 animate-pulse">LIVE</div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">News & Highlights</h3>
          <div className="space-y-4">
            <div className="flex gap-4 group cursor-pointer">
              <div className="h-20 w-32 bg-muted rounded-lg border border-border group-hover:border-primary/50 transition-colors"></div>
              <div>
                <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">Top 5 Catches of the Week</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">Watch the best fielding moments from Round 4, featuring spectacular diving efforts.</p>
                <p className="text-[10px] text-muted-foreground mt-2">2 hours ago</p>
              </div>
            </div>
            <div className="flex gap-4 group cursor-pointer">
              <div className="h-20 w-32 bg-muted rounded-lg border border-border group-hover:border-primary/50 transition-colors"></div>
              <div>
                <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">Player Interview: Virat Kohli</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">Discussing the upcoming finals strategy and team preparation.</p>
                <p className="text-[10px] text-muted-foreground mt-2">5 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
