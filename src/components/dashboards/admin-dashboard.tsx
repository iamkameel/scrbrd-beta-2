import React from 'react';
import DashboardStats from '../dashboard/DashboardStats';
import ManagementHub from '../dashboard/ManagementHub';
import { PageHeader } from '../dashboard/PageHeader';
import FixtureCentreCard from '../dashboard/FixtureCentreCard';

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader 
        title="Admin Dashboard" 
        description="High-level overview of all operations."
      />

      {/* Fixture Centre */}
      <FixtureCentreCard 
        role="System Architect"
        maxMatches={5}
      />

      {/* Global Overview Stats */}
      <DashboardStats />

      {/* Management Hub */}
      <ManagementHub />
    </div>
  );
}
