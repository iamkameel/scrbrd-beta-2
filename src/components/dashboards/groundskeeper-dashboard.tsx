"use client";

import React, { useEffect, useState } from 'react';
import { PageHeader } from '../dashboard/PageHeader';
import { MetricCard } from '../dashboard/MetricCard';
import FixtureCentreCard from '../dashboard/FixtureCentreCard';
import { Tractor, CloudRain, CalendarDays, CheckCircle } from "lucide-react";
import { fetchFields, fetchEquipment } from '@/lib/firestore';
import { Field, Equipment } from '@/types/firestore';
import { useAuth } from '@/contexts/AuthContext';

export default function GroundskeeperDashboard() {
  const { user } = useAuth();
  const [fields, setFields] = useState<Field[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fieldsData, equipmentData] = await Promise.all([
          fetchFields(),
          fetchEquipment()
        ]);
        setFields(fieldsData as Field[]);
        setEquipment(equipmentData as Equipment[]);
      } catch (error) {
        console.error("Error loading grounds data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const operationalMowers = equipment.filter(e => e.type === 'Mower' && e.status === 'Operational').length;
  const totalMowers = equipment.filter(e => e.type === 'Mower').length;
  const mainOval = fields.find(f => f.name.includes('Main')) || fields[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader 
        title="Grounds Dashboard" 
        description={`Welcome back, ${user?.displayName || 'Groundskeeper'}. Manage field conditions and equipment.`}
      />

      {/* Fixture Centre */}
      <FixtureCentreCard 
        role="Grounds-Keeper"
        maxMatches={3}
      />

      {/* Stats Grid */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Field Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={CheckCircle}
            label="Field Status"
            value={mainOval?.status || "Unknown"}
            subtitle={mainOval ? `${mainOval.name} condition` : "No fields found"}
          />
          <MetricCard
            icon={CloudRain}
            label="Weather"
            value="24°C"
            subtitle="Clear skies, 10% rain"
          />
          <MetricCard
            icon={Tractor}
            label="Equipment"
            value={`${operationalMowers}/${totalMowers}`}
            subtitle="Mowers operational"
          />
          <MetricCard
            icon={CalendarDays}
            label="Next Prep"
            value="Tmrw"
            subtitle="Pitch rolling scheduled"
          />
        </div>
      </div>

      {/* Maintenance & Inventory */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Maintenance Schedule</h3>
          <ul className="space-y-2">
            <li className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
              <span className="font-medium text-foreground">Mow Outfield</span>
              <span className="text-sm text-muted-foreground">Today, 2:00 PM</span>
            </li>
            <li className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
              <span className="font-medium text-foreground">Mark Boundary Lines</span>
              <span className="text-sm text-muted-foreground">Tomorrow, 9:00 AM</span>
            </li>
            <li className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
              <span className="font-medium text-foreground">Pitch Watering</span>
              <span className="text-sm text-muted-foreground">Wed, 6:00 AM</span>
            </li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Inventory</h3>
          <div className="space-y-4">
             <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-foreground">Fertilizer</span>
                  <span className="font-medium text-foreground">80%</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
             </div>
             
             <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-foreground">Paint (White)</span>
                  <span className="font-medium text-foreground">45%</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
