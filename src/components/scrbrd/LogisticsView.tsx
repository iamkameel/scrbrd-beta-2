'use client';

import React, { useState, useMemo } from 'react';
import { Theme, Vehicle, Driver } from './types';
import {
  Truck, Users, Clock, MapPin, CheckCircle2, AlertCircle, Plus,
  Edit2, Trash2, Search, LayoutGrid, List, Kanban, Package,
  Shield, Phone, Calendar, ArrowRight, UserCheck, CheckSquare, X
} from 'lucide-react';

interface LogisticsViewProps {
  theme: Theme;
  currentRole?: string;
  onTriggerToast?: (msg: string) => void;
}

export type LogisticsViewMode = 'kanban' | 'fleet' | 'timeline' | 'equipment';

interface StudentPassenger {
  id: string;
  name: string;
  grade: string;
  checkedIn: boolean;
  emergencyContact: string;
}

interface TripManifest {
  id: string;
  trip: string;
  dest: string;
  vehicle: string;
  driver: string;
  departTime: string;
  returnTime: string;
  status: 'Scheduled' | 'Boarding' | 'In-Transit' | 'Completed';
  leadCoach: string;
  students: StudentPassenger[];
  kitNotes: string;
}

const INITIAL_VEHICLES: Vehicle[] = [
  { id: "v1", model: "Iveco Daily 35-Seater Coach", capacity: 35, plate: "ND 849-211", assignedDriver: "Mr Themba Nxumalo", status: "available", nextInspection: "2026-04-15", fuelPct: 88, mileageKm: 94200 },
  { id: "v2", model: "Toyota Quantum 22-Seater Commuter", capacity: 22, plate: "ND 523-887", assignedDriver: "Mr Vusi Cele", status: "in-transit", nextInspection: "2026-05-20", fuelPct: 65, mileageKm: 142800 },
  { id: "v3", model: "Mercedes-Benz Sprinter 16-Seater", capacity: 16, plate: "ND 119-044", assignedDriver: "Mr Sipho Ndlovu", status: "available", nextInspection: "2026-06-10", fuelPct: 92, mileageKm: 68400 },
  { id: "v4", model: "Toyota Hilux 4x4 Kit & Gear Truck", capacity: 3, plate: "ND 771-332", assignedDriver: "Mr Ernest Mzimba", status: "available", nextInspection: "2026-08-01", fuelPct: 75, mileageKm: 112000 },
];

const INITIAL_DRIVERS: Driver[] = [
  { id: "d1", name: "Themba Nxumalo", phone: "+27 76 881 5533", licenseNumber: "KZN-PRDP-84920", prdpStatus: "valid", assignedVehicle: "Iveco Daily (ND 849-211)", activeTrip: "U19A Away vs DHS" },
  { id: "d2", name: "Vusi Cele", phone: "+27 83 294 1180", licenseNumber: "KZN-PRDP-77123", prdpStatus: "valid", assignedVehicle: "Toyota Quantum (ND 523-887)", activeTrip: "U15A Away vs Maritzburg Col" },
  { id: "d3", name: "Sipho Ndlovu", phone: "+27 82 901 4452", licenseNumber: "KZN-PRDP-90412", prdpStatus: "renewing", assignedVehicle: "Mercedes Sprinter (ND 119-044)" },
];

const INITIAL_MANIFESTS: TripManifest[] = [
  {
    id: "m1",
    trip: "Westville U19A vs Durban High School",
    dest: "The Memorial Ground, Musgrave, Durban",
    vehicle: "Iveco Daily 35-Seater (ND 849-211)",
    driver: "Themba Nxumalo",
    departTime: "06:30",
    returnTime: "18:30",
    status: "In-Transit",
    leadCoach: "Craig Hendricks",
    kitNotes: "14 Match Bats, 2 Team Kit Bags, 6 White Kookaburra Balls, First Aid Defibrillator",
    students: [
      { id: "p1", name: "James Whitfield", grade: "Gr 12", checkedIn: true, emergencyContact: "+27 82 441 9021" },
      { id: "p2", name: "Luca De Villiers", grade: "Gr 12", checkedIn: true, emergencyContact: "+27 83 112 8840" },
      { id: "p3", name: "Ethan Solomons", grade: "Gr 11", checkedIn: true, emergencyContact: "+27 76 990 1204" },
      { id: "p4", name: "Marcus Ngcobo", grade: "Gr 12", checkedIn: true, emergencyContact: "+27 84 330 8912" },
      { id: "p6", name: "Aiden Petersen", grade: "Gr 11", checkedIn: true, emergencyContact: "+27 82 551 2290" },
      { id: "p7", name: "Dylan Fortuin", grade: "Gr 10", checkedIn: false, emergencyContact: "+27 83 440 1198" },
      { id: "p8", name: "Connor Walsh", grade: "Gr 12", checkedIn: true, emergencyContact: "+27 79 119 5500" },
      { id: "sc1", name: "Brian Wessels (Scorer)", grade: "Staff", checkedIn: true, emergencyContact: "+27 82 555 1100" },
    ],
  },
  {
    id: "m2",
    trip: "Westville U15A vs Michaelhouse Prep",
    dest: "Meadow's Oval, Balgowan, Midlands",
    vehicle: "Toyota Quantum 22-Seater (ND 523-887)",
    driver: "Vusi Cele",
    departTime: "05:45",
    returnTime: "19:00",
    status: "Boarding",
    leadCoach: "Dean Abrahams",
    kitNotes: "Junior Match Kit, 4 Red Balls, Boundary Markers, Scorers Tablet",
    students: [
      { id: "p9", name: "Sam Petersen", grade: "Gr 9", checkedIn: true, emergencyContact: "+27 82 991 3320" },
      { id: "p10", name: "Jude Mthembu", grade: "Gr 9", checkedIn: true, emergencyContact: "+27 83 441 5560" },
      { id: "p11", name: "Liam Naidoo", grade: "Gr 9", checkedIn: false, emergencyContact: "+27 76 220 8940" },
    ],
  },
  {
    id: "m3",
    trip: "Westville U16A vs Maritzburg College",
    dest: "Goldstones, Pietermaritzburg",
    vehicle: "Mercedes-Benz Sprinter (ND 119-044)",
    driver: "Sipho Ndlovu",
    departTime: "07:00",
    returnTime: "17:30",
    status: "Scheduled",
    leadCoach: "Kyle Van Zyl",
    kitNotes: "Protective Gear, Spare Helmets, Ice Packs",
    students: [
      { id: "p12", name: "Tiaan Botha", grade: "Gr 10", checkedIn: false, emergencyContact: "+27 82 110 4490" },
      { id: "p13", name: "Kagiso Molefe", grade: "Gr 10", checkedIn: false, emergencyContact: "+27 83 550 7712" },
    ],
  },
  {
    id: "m4",
    trip: "Westville 2nd XI vs Kearsney College",
    dest: "AH Smith Oval, Botha's Hill",
    vehicle: "Iveco Daily (ND 849-211)",
    driver: "Themba Nxumalo",
    departTime: "08:00",
    returnTime: "16:00",
    status: "Completed",
    leadCoach: "Markus Venter",
    kitNotes: "Returned and checked into WBHS Sports Pavilion",
    students: [
      { id: "p14", name: "Rowan Pillay", grade: "Gr 11", checkedIn: true, emergencyContact: "+27 76 112 4433" },
      { id: "p15", name: "Nathan Wright", grade: "Gr 12", checkedIn: true, emergencyContact: "+27 84 990 2211" },
    ],
  },
];

export default function LogisticsView({
  theme: D,
  currentRole = 'superadmin',
  onTriggerToast = () => {},
}: LogisticsViewProps) {
  const [viewMode, setViewMode] = useState<LogisticsViewMode>('kanban');
  const [manifests, setManifests] = useState<TripManifest[]>(INITIAL_MANIFESTS);
  const [vehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [drivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [selectedManifestId, setSelectedManifestId] = useState<string>('m1');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activeManifestToEdit, setActiveManifestToEdit] = useState<TripManifest | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    trip: '',
    dest: '',
    vehicle: 'Iveco Daily 35-Seater (ND 849-211)',
    driver: 'Themba Nxumalo',
    departTime: '06:30',
    returnTime: '18:00',
    status: 'Scheduled' as TripManifest['status'],
    leadCoach: 'Craig Hendricks',
    kitNotes: 'Team Kit Bags, 6 White Kookaburra Balls, First Aid Kit',
  });

  // RBAC checks
  const canManageLogistics = ['superadmin', 'schooladmin', 'sportsmaster', 'doc'].includes(currentRole);
  const canCheckIn = ['superadmin', 'schooladmin', 'sportsmaster', 'doc', 'coach'].includes(currentRole);
  const isReadOnly = ['player', 'parent'].includes(currentRole);

  const activeManifest = manifests.find(m => m.id === selectedManifestId) || manifests[0];

  const filteredManifests = useMemo(() => {
    if (!searchQuery.trim()) return manifests;
    const q = searchQuery.toLowerCase();
    return manifests.filter(m =>
      m.trip.toLowerCase().includes(q) ||
      m.dest.toLowerCase().includes(q) ||
      m.vehicle.toLowerCase().includes(q) ||
      m.leadCoach.toLowerCase().includes(q) ||
      m.driver.toLowerCase().includes(q)
    );
  }, [manifests, searchQuery]);

  const toggleStudentCheckin = (manifestId: string, studentId: string) => {
    if (!canCheckIn) {
      onTriggerToast(`Access Restricted: Role '${currentRole}' cannot modify passenger check-ins.`);
      return;
    }
    setManifests(prev => prev.map(m => {
      if (m.id !== manifestId) return m;
      return {
        ...m,
        students: m.students.map(s => s.id === studentId ? { ...s, checkedIn: !s.checkedIn } : s),
      };
    }));
    onTriggerToast('Passenger roll-call updated.');
  };

  const handleOpenCreateModal = () => {
    if (!canManageLogistics) {
      onTriggerToast(`Access Restricted: Role '${currentRole}' cannot schedule new fleet dispatches.`);
      return;
    }
    setFormData({
      trip: 'Westville U14A vs Glenwood High',
      dest: 'Dixons Oval, Glenwood, Durban',
      vehicle: 'Toyota Quantum 22-Seater (ND 523-887)',
      driver: 'Vusi Cele',
      departTime: '07:15',
      returnTime: '16:45',
      status: 'Scheduled',
      leadCoach: 'Neil Joubert',
      kitNotes: 'U14 Junior Match Kit, 4 Red Balls, Boundary Markers, Scorers Tablet',
    });
    setCreateModalOpen(true);
  };

  const handleOpenEditModal = (manifest: TripManifest) => {
    if (!canManageLogistics) {
      onTriggerToast(`Access Restricted: Role '${currentRole}' cannot edit trip manifests.`);
      return;
    }
    setActiveManifestToEdit(manifest);
    setFormData({
      trip: manifest.trip,
      dest: manifest.dest,
      vehicle: manifest.vehicle,
      driver: manifest.driver,
      departTime: manifest.departTime,
      returnTime: manifest.returnTime,
      status: manifest.status,
      leadCoach: manifest.leadCoach,
      kitNotes: manifest.kitNotes || '',
    });
    setEditModalOpen(true);
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newManifest: TripManifest = {
      id: `m_${Date.now()}`,
      trip: formData.trip,
      dest: formData.dest,
      vehicle: formData.vehicle,
      driver: formData.driver,
      departTime: formData.departTime,
      returnTime: formData.returnTime,
      status: formData.status,
      leadCoach: formData.leadCoach,
      kitNotes: formData.kitNotes,
      students: [
        { id: `p_${Date.now()}_1`, name: 'Squad Captain', grade: 'Gr 10', checkedIn: false, emergencyContact: '+27 82 990 1122' },
        { id: `p_${Date.now()}_2`, name: 'Opening Batsman', grade: 'Gr 10', checkedIn: false, emergencyContact: '+27 83 440 2233' },
      ],
    };
    setManifests(prev => [newManifest, ...prev]);
    setCreateModalOpen(false);
    onTriggerToast(`New trip manifest created: ${formData.trip}`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeManifestToEdit) return;
    setManifests(prev => prev.map(m => m.id === activeManifestToEdit.id ? {
      ...m,
      trip: formData.trip,
      dest: formData.dest,
      vehicle: formData.vehicle,
      driver: formData.driver,
      departTime: formData.departTime,
      returnTime: formData.returnTime,
      status: formData.status,
      leadCoach: formData.leadCoach,
      kitNotes: formData.kitNotes,
    } : m));
    setEditModalOpen(false);
    onTriggerToast(`Manifest updated: ${formData.trip}`);
  };

  const handleConfirmDelete = () => {
    if (!activeManifestToEdit) return;
    setManifests(prev => prev.filter(m => m.id !== activeManifestToEdit.id));
    setDeleteModalOpen(false);
    onTriggerToast(`Trip manifest cancelled: ${activeManifestToEdit.trip}`);
  };

  // KPIs
  const totalCapacity = vehicles.reduce((acc, v) => acc + v.capacity, 0);
  const inTransitCount = manifests.filter(m => m.status === 'In-Transit').length;
  const scheduledCount = manifests.filter(m => m.status === 'Scheduled' || m.status === 'Boarding').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Header Banner */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: D.lg,
          background: `linear-gradient(135deg, ${D.amber}18 0%, ${D.surf1} 100%)`,
          border: `1px solid ${D.amber}33`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>🚌</span>
          <div>
            <h1 style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
              Fleet Transport & Student Movement Logistics
            </h1>
            <p style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted, margin: '2px 0 0' }}>
              WBHS Bus Fleet, PrDP Certified Drivers, Away Match Manifests, Roll-Call Check-Ins & Kit Dispatch
            </p>
          </div>
        </div>

        {/* View Switcher & Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: D.surf2, padding: '3px', borderRadius: D.pill, border: `1px solid ${D.border}` }}>
            <button
              onClick={() => setViewMode('kanban')}
              style={{
                padding: '6px 12px',
                borderRadius: D.pill,
                border: 'none',
                background: viewMode === 'kanban' ? D.amber : 'transparent',
                color: viewMode === 'kanban' ? '#fff' : D.textSecondary,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Kanban size={13} />
              <span>Operations Board</span>
            </button>
            <button
              onClick={() => setViewMode('fleet')}
              style={{
                padding: '6px 12px',
                borderRadius: D.pill,
                border: 'none',
                background: viewMode === 'fleet' ? D.amber : 'transparent',
                color: viewMode === 'fleet' ? '#fff' : D.textSecondary,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Truck size={13} />
              <span>Fleet & Telemetry</span>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              style={{
                padding: '6px 12px',
                borderRadius: D.pill,
                border: 'none',
                background: viewMode === 'timeline' ? D.amber : 'transparent',
                color: viewMode === 'timeline' ? '#fff' : D.textSecondary,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Clock size={13} />
              <span>Trip Itinerary</span>
            </button>
            <button
              onClick={() => setViewMode('equipment')}
              style={{
                padding: '6px 12px',
                borderRadius: D.pill,
                border: 'none',
                background: viewMode === 'equipment' ? D.amber : 'transparent',
                color: viewMode === 'equipment' ? '#fff' : D.textSecondary,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Package size={13} />
              <span>Kit & Equipment</span>
            </button>
          </div>

          {canManageLogistics ? (
            <button
              onClick={handleOpenCreateModal}
              style={{
                padding: '7px 14px',
                borderRadius: D.pill,
                background: D.amber,
                border: 'none',
                color: '#fff',
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: `0 3px 10px ${D.amber}33`,
              }}
            >
              <Plus size={14} />
              <span>Dispatch Trip</span>
            </button>
          ) : (
            <div
              style={{
                padding: '6px 12px',
                borderRadius: D.pill,
                background: D.surf2,
                border: `1px solid ${D.border}`,
                color: D.textMuted,
                fontFamily: D.head,
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Shield size={12} />
              <span>RBAC Read Only</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '12px' }}>
        <div style={{ padding: '14px', borderRadius: D.lg, background: D.surf0, border: `1px solid ${D.border}` }}>
          <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>TOTAL FLEET CAPACITY</div>
          <div style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 800, color: D.sky, marginTop: '2px' }}>
            {totalCapacity} Seats
          </div>
          <div style={{ fontFamily: D.body, fontSize: '10px', color: D.textMuted }}>Across 4 School Buses & Vans</div>
        </div>

        <div style={{ padding: '14px', borderRadius: D.lg, background: D.surf0, border: `1px solid ${D.border}` }}>
          <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>ACTIVE IN-TRANSIT</div>
          <div style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 800, color: D.emerald, marginTop: '2px' }}>
            {inTransitCount} En Route
          </div>
          <div style={{ fontFamily: D.body, fontSize: '10px', color: D.textMuted }}>Live tracking enabled</div>
        </div>

        <div style={{ padding: '14px', borderRadius: D.lg, background: D.surf0, border: `1px solid ${D.border}` }}>
          <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>SCHEDULED / BOARDING</div>
          <div style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 800, color: D.amber, marginTop: '2px' }}>
            {scheduledCount} Departures
          </div>
          <div style={{ fontFamily: D.body, fontSize: '10px', color: D.textMuted }}>Saturday matchday circuit</div>
        </div>

        <div style={{ padding: '14px', borderRadius: D.lg, background: D.surf0, border: `1px solid ${D.border}` }}>
          <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>CERTIFIED PrDP DRIVERS</div>
          <div style={{ fontFamily: D.mono, fontSize: '20px', fontWeight: 800, color: D.textPrimary, marginTop: '2px' }}>
            {drivers.filter(d => d.prdpStatus === 'valid').length} / {drivers.length}
          </div>
          <div style={{ fontFamily: D.body, fontSize: '10px', color: D.emerald }}>All clearances verified</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: D.surf0,
          padding: '12px 16px',
          borderRadius: D.lg,
          border: `1px solid ${D.border}`,
        }}
      >
        <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
          <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: D.textMuted }} />
          <input
            type="text"
            placeholder="Search manifests, destinations, buses..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px 6px 30px',
              borderRadius: D.pill,
              background: D.surf2,
              border: `1px solid ${D.border}`,
              color: D.textPrimary,
              fontFamily: D.body,
              fontSize: '11px',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
          Showing {filteredManifests.length} Active Dispatch Manifests
        </div>
      </div>

      {/* VIEW 1: OPERATIONS KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '16px', alignItems: 'start' }}>
          {(['Scheduled', 'Boarding', 'In-Transit', 'Completed'] as const).map(stage => {
            const stageManifests = filteredManifests.filter(m => m.status === stage);
            const stageColor = stage === 'In-Transit' ? D.emerald : stage === 'Boarding' ? D.amber : stage === 'Completed' ? D.sky : D.indigo;

            return (
              <div
                key={stage}
                style={{
                  background: D.surf0,
                  borderRadius: D.lg,
                  border: `1px solid ${D.border}`,
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  minHeight: '340px',
                }}
              >
                {/* Column Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: `2px solid ${stageColor}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: stageColor }} />
                    <span style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.textPrimary }}>
                      {stage.toUpperCase()}
                    </span>
                  </div>
                  <span style={{ fontFamily: D.mono, fontSize: '10px', padding: '1px 6px', borderRadius: D.pill, background: D.surf2, color: D.textMuted }}>
                    {stageManifests.length}
                  </span>
                </div>

                {/* Cards in Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {stageManifests.length === 0 ? (
                    <div style={{ padding: '24px 10px', textAlign: 'center', color: D.textMuted, fontFamily: D.body, fontSize: '11px' }}>
                      No dispatches in {stage}
                    </div>
                  ) : (
                    stageManifests.map(m => {
                      const checkedCount = m.students.filter(s => s.checkedIn).length;
                      return (
                        <div
                          key={m.id}
                          style={{
                            background: D.surf1,
                            borderRadius: D.md,
                            border: `1px solid ${D.border}`,
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.textPrimary }}>
                              {m.trip}
                            </div>
                            {canManageLogistics && (
                              <button
                                onClick={() => handleOpenEditModal(m)}
                                style={{ background: 'none', border: 'none', color: D.textMuted, cursor: 'pointer', padding: 0 }}
                              >
                                <Edit2 size={11} />
                              </button>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: D.body, fontSize: '10px', color: D.textSecondary }}>
                            <MapPin size={11} style={{ color: D.textMuted, flexShrink: 0 }} />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.dest}</span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                            <span>Depart: <strong>{m.departTime}</strong></span>
                            <span>Return: <strong>{m.returnTime}</strong></span>
                          </div>

                          {/* Roll-call progress bar */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.mono, fontSize: '9px', marginBottom: '3px' }}>
                              <span>Roll-Call: {checkedCount}/{m.students.length}</span>
                              <span style={{ color: checkedCount === m.students.length ? D.emerald : D.amber }}>
                                {Math.round((checkedCount / Math.max(1, m.students.length)) * 100)}%
                              </span>
                            </div>
                            <div style={{ height: '4px', background: D.surf2, borderRadius: '2px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  height: '100%',
                                  width: `${(checkedCount / Math.max(1, m.students.length)) * 100}%`,
                                  background: checkedCount === m.students.length ? D.emerald : D.amber,
                                }}
                              />
                            </div>
                          </div>

                          {/* Action Button */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: `1px solid ${D.border}44` }}>
                            <span style={{ fontFamily: D.mono, fontSize: '9px', color: D.textMuted }}>
                              Coach: {m.leadCoach.split(' ')[1] || m.leadCoach}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedManifestId(m.id);
                                setViewMode('timeline');
                              }}
                              style={{
                                padding: '3px 8px',
                                borderRadius: D.pill,
                                background: D.surf2,
                                border: `1px solid ${D.border}`,
                                color: D.textPrimary,
                                fontFamily: D.head,
                                fontSize: '9px',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Details →
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: FLEET & VEHICLE TELEMETRY */}
      {viewMode === 'fleet' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '16px' }}>
          {vehicles.map(v => {
            const assignedDriver = drivers.find(d => d.assignedVehicle.includes(v.plate));
            return (
              <div
                key={v.id}
                style={{
                  background: D.surf0,
                  borderRadius: D.lg,
                  border: `1px solid ${D.border}`,
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                      {v.model}
                    </h3>
                    <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted, marginTop: '2px' }}>
                      Plate: {v.plate} · Capacity: {v.capacity} Passengers
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: D.pill,
                      background: v.status === 'available' ? `${D.emerald}20` : `${D.amber}20`,
                      color: v.status === 'available' ? D.emerald : D.amber,
                      fontFamily: D.mono,
                      fontSize: '9px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                    }}
                  >
                    {v.status}
                  </span>
                </div>

                {/* Telemetry Meters */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ padding: '10px', background: D.surf2, borderRadius: D.md }}>
                    <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>FUEL TANK LEVEL</div>
                    <div style={{ fontFamily: D.mono, fontSize: '18px', fontWeight: 800, color: D.sky }}>
                      {v.fuelPct}%
                    </div>
                    <div style={{ fontFamily: D.body, fontSize: '9px', color: D.textMuted }}>Range: ~450 km</div>
                  </div>
                  <div style={{ padding: '10px', background: D.surf2, borderRadius: D.md }}>
                    <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>ODOMETER</div>
                    <div style={{ fontFamily: D.mono, fontSize: '18px', fontWeight: 800, color: D.textPrimary }}>
                      {v.mileageKm.toLocaleString()} km
                    </div>
                    <div style={{ fontFamily: D.body, fontSize: '9px', color: D.textMuted }}>Inspection: {v.nextInspection}</div>
                  </div>
                </div>

                {/* Driver Info */}
                <div style={{ padding: '10px', background: D.surf1, borderRadius: D.md, border: `1px solid ${D.border}` }}>
                  <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted, textTransform: 'uppercase' }}>Assigned Driver</div>
                  <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, marginTop: '2px' }}>
                    {v.assignedDriver}
                  </div>
                  {assignedDriver && (
                    <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textSecondary, marginTop: '2px' }}>
                      PrDP: {assignedDriver.licenseNumber} ({assignedDriver.phone})
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: TRIP ITINERARY & ROLL CALL */}
      {viewMode === 'timeline' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '18px', alignItems: 'start' }}>
          {/* Manifest Selector & Itinerary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 800, color: D.textMuted, textTransform: 'uppercase' }}>
              Select Manifest Itinerary
            </div>

            {filteredManifests.map(m => {
              const isSelected = m.id === activeManifest.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedManifestId(m.id)}
                  style={{
                    padding: '14px',
                    borderRadius: D.lg,
                    background: isSelected ? `${D.amber}15` : D.surf0,
                    border: isSelected ? `1px solid ${D.amber}` : `1px solid ${D.border}`,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
                      {m.trip}
                    </div>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: D.pill,
                        background: m.status === 'In-Transit' ? `${D.emerald}25` : `${D.amber}25`,
                        color: m.status === 'In-Transit' ? D.emerald : D.amber,
                        fontFamily: D.mono,
                        fontSize: '9px',
                        fontWeight: 800,
                      }}
                    >
                      {m.status}
                    </span>
                  </div>

                  <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary }}>
                    📍 {m.dest}
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                    {m.vehicle} · Driver: {m.driver}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Manifest Detailed Roll-Call & Passenger List */}
          {activeManifest && (
            <div
              style={{
                background: D.surf0,
                borderRadius: D.lg,
                border: `1px solid ${D.border}`,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                    {activeManifest.trip}
                  </h2>
                  <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted, marginTop: '2px' }}>
                    Lead Coach: {activeManifest.leadCoach} · Vehicle: {activeManifest.vehicle}
                  </div>
                </div>

                {canManageLogistics && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleOpenEditModal(activeManifest)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: D.pill,
                        background: D.surf2,
                        border: `1px solid ${D.border}`,
                        color: D.textPrimary,
                        fontFamily: D.head,
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      Edit Manifest
                    </button>
                    <button
                      onClick={() => {
                        setActiveManifestToEdit(activeManifest);
                        setDeleteModalOpen(true);
                      }}
                      style={{
                        padding: '5px 10px',
                        borderRadius: D.pill,
                        background: 'transparent',
                        border: `1px solid ${D.rose}44`,
                        color: D.rose,
                        fontFamily: D.head,
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Student Roll-Call List */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.textPrimary }}>
                    Passenger Roll-Call & Safety Check-In ({activeManifest.students.filter(s => s.checkedIn).length} / {activeManifest.students.length})
                  </div>
                  {canCheckIn && (
                    <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                      Click checkbox to verify boarding
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '320px', overflowY: 'auto' }}>
                  {activeManifest.students.map(s => (
                    <div
                      key={s.id}
                      onClick={() => canCheckIn && toggleStudentCheckin(activeManifest.id, s.id)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: D.md,
                        background: s.checkedIn ? `${D.emerald}10` : D.surf2,
                        border: `1px solid ${s.checkedIn ? D.emerald + '44' : D.border}`,
                        cursor: canCheckIn ? 'pointer' : 'default',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '4px',
                            background: s.checkedIn ? D.emerald : 'transparent',
                            border: `2px solid ${s.checkedIn ? D.emerald : D.textMuted}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '12px',
                          }}
                        >
                          {s.checkedIn && '✓'}
                        </div>
                        <div>
                          <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary }}>
                            {s.name}
                          </div>
                          <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                            {s.grade} · Contact: {s.emergencyContact}
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          fontFamily: D.mono,
                          fontSize: '10px',
                          fontWeight: 700,
                          color: s.checkedIn ? D.emerald : D.rose,
                        }}
                      >
                        {s.checkedIn ? 'Boarded' : 'Not Checked In'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: KIT & EQUIPMENT DISPATCH */}
      {viewMode === 'equipment' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '16px' }}>
          {filteredManifests.map(m => (
            <div
              key={m.id}
              style={{
                background: D.surf0,
                borderRadius: D.lg,
                border: `1px solid ${D.border}`,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary }}>
                {m.trip}
              </div>
              <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                Departure: {m.departTime} · Bus: {m.vehicle.split(' ')[0]}
              </div>

              <div style={{ padding: '10px', background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}` }}>
                <div style={{ fontFamily: D.head, fontSize: '10px', fontWeight: 700, color: D.amber, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Equipment Inventory
                </div>
                <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textSecondary, lineHeight: 1.4 }}>
                  {m.kitNotes || 'Standard Match Bag, 6 White Kookaburra Balls, Defibrillator Kit'}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                <span>Custodian: {m.leadCoach}</span>
                <span style={{ color: D.emerald, fontWeight: 700 }}>✓ Verified Dispatched</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MANIFEST MODAL */}
      {createModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: D.surf0, borderRadius: D.lg, border: `1px solid ${D.border}`, maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={18} style={{ color: D.amber }} />
                <h3 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>Schedule Fleet Dispatch</h3>
              </div>
              <button onClick={() => setCreateModalOpen(false)} style={{ background: 'none', border: 'none', color: D.textMuted, cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>

            <form onSubmit={handleSaveCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Trip Name / Match Details</label>
                <input
                  type="text"
                  required
                  value={formData.trip}
                  onChange={e => setFormData({ ...formData, trip: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                />
              </div>

              <div>
                <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Destination Venue</label>
                <input
                  type="text"
                  required
                  value={formData.dest}
                  onChange={e => setFormData({ ...formData, dest: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Assigned Bus</label>
                  <select
                    value={formData.vehicle}
                    onChange={e => setFormData({ ...formData, vehicle: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={`${v.model} (${v.plate})`}>{v.model} ({v.plate})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>PrDP Driver</label>
                  <select
                    value={formData.driver}
                    onChange={e => setFormData({ ...formData, driver: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                  >
                    {drivers.map(d => (
                      <option key={d.id} value={d.name}>{d.name} ({d.phone})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Departure Time</label>
                  <input
                    type="time"
                    required
                    value={formData.departTime}
                    onChange={e => setFormData({ ...formData, departTime: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Estimated Return</label>
                  <input
                    type="time"
                    required
                    value={formData.returnTime}
                    onChange={e => setFormData({ ...formData, returnTime: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Lead Coach</label>
                <input
                  type="text"
                  required
                  value={formData.leadCoach}
                  onChange={e => setFormData({ ...formData, leadCoach: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  style={{ padding: '8px 14px', borderRadius: D.pill, background: D.surf2, border: `1px solid ${D.border}`, color: D.textSecondary, fontFamily: D.head, fontSize: '11px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: D.pill, background: D.amber, border: 'none', color: '#fff', fontFamily: D.head, fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Save Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MANIFEST MODAL */}
      {editModalOpen && activeManifestToEdit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: D.surf0, borderRadius: D.lg, border: `1px solid ${D.border}`, maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit2 size={18} style={{ color: D.amber }} />
                <h3 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>Edit Dispatch Manifest</h3>
              </div>
              <button onClick={() => setEditModalOpen(false)} style={{ background: 'none', border: 'none', color: D.textMuted, cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px', fontWeight: 700 }}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Boarding">Boarding</option>
                  <option value="In-Transit">In-Transit</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Trip Name</label>
                <input
                  type="text"
                  required
                  value={formData.trip}
                  onChange={e => setFormData({ ...formData, trip: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                />
              </div>

              <div>
                <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Destination</label>
                <input
                  type="text"
                  required
                  value={formData.dest}
                  onChange={e => setFormData({ ...formData, dest: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  style={{ padding: '8px 14px', borderRadius: D.pill, background: D.surf2, border: `1px solid ${D.border}`, color: D.textSecondary, fontFamily: D.head, fontSize: '11px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: D.pill, background: D.amber, border: 'none', color: '#fff', fontFamily: D.head, fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && activeManifestToEdit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: D.surf0, borderRadius: D.lg, border: `1px solid ${D.rose}44`, maxWidth: '400px', width: '100%', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <AlertCircle size={20} style={{ color: D.rose }} />
              <h3 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.rose, margin: 0 }}>
                Cancel Trip Dispatch?
              </h3>
            </div>
            <p style={{ fontFamily: D.body, fontSize: '13px', color: D.textPrimary, lineHeight: 1.4 }}>
              Are you sure you want to cancel the dispatch for <strong>{activeManifestToEdit.trip}</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                onClick={() => setDeleteModalOpen(false)}
                style={{ padding: '7px 14px', borderRadius: D.pill, background: D.surf2, border: `1px solid ${D.border}`, color: D.textSecondary, fontFamily: D.head, fontSize: '11px', cursor: 'pointer' }}
              >
                Keep Trip
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{ padding: '7px 16px', borderRadius: D.pill, background: D.rose, border: 'none', color: '#fff', fontFamily: D.head, fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
