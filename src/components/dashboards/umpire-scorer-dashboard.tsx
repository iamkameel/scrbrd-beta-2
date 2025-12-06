import React from 'react';
import { PageHeader } from '../dashboard/PageHeader';
import { MetricCard } from '../dashboard/MetricCard';
import FixtureCentreCard from '../dashboard/FixtureCentreCard';
import { Eye, BookOpen, Calendar, CheckSquare, ChevronRight } from "lucide-react";
import Link from 'next/link';

export default function UmpireScorerDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader 
        title="Officials Dashboard" 
        description="Manage your assignments, file reports, and access resources."
      />

      {/* Fixture Centre */}
      <FixtureCentreCard 
        role="Umpire"
        maxMatches={3}
      />

      {/* Stats Grid */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">My Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={Calendar}
            label="Next Assignment"
            value="Sat"
            subtitle="09:00 AM - Main Oval"
          />
          <MetricCard
            icon={Eye}
            label="Matches Officiated"
            value={8}
            subtitle="This season"
          />
          <MetricCard
            icon={CheckSquare}
            label="Reports Filed"
            value={8}
            subtitle="100% completion rate"
          />
          <MetricCard
            icon={BookOpen}
            label="Rulebook Updates"
            value="New"
            subtitle="v2.4 released yesterday"
          />
        </div>
      </div>

      {/* Resources & Quick Links */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Fixtures</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
              <div>
                <p className="font-medium text-foreground">Team A vs Team B</p>
                <p className="text-sm text-muted-foreground">Role: Main Umpire</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">Saturday, 09:00 AM</p>
                <p className="text-sm text-muted-foreground">Venue: Main Oval</p>
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
              <div>
                <p className="font-medium text-foreground">Team C vs Team D</p>
                <p className="text-sm text-muted-foreground">Role: Scorer</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">Sunday, 10:00 AM</p>
                <p className="text-sm text-muted-foreground">Venue: Field 2</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Resources</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/resources/rules" className="flex flex-col items-center justify-center p-4 border border-border rounded-lg hover:bg-muted/50 hover:border-primary/50 transition-all group">
                <BookOpen className="h-6 w-6 mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-foreground">Rule Book</span>
            </Link>
            <Link href="/reports/new" className="flex flex-col items-center justify-center p-4 border border-border rounded-lg hover:bg-muted/50 hover:border-primary/50 transition-all group">
                <CheckSquare className="h-6 w-6 mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-foreground">Match Report</span>
            </Link>
            <Link href="/resources/drs" className="flex flex-col items-center justify-center p-4 border border-border rounded-lg hover:bg-muted/50 hover:border-primary/50 transition-all group">
                <Eye className="h-6 w-6 mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-foreground">DRS Review</span>
            </Link>
            <Link href="/roster" className="flex flex-col items-center justify-center p-4 border border-border rounded-lg hover:bg-muted/50 hover:border-primary/50 transition-all group">
                <Calendar className="h-6 w-6 mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-foreground">Roster</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
