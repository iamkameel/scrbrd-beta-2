'use client';

import React, { useState } from 'react';
import { Theme, Vehicle, Driver } from './types';

interface LogisticsViewProps {
  theme: Theme;
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

const MANIFESTS = [
  {
    id: "m1",
    trip: "Westville U19A vs Durban High School",
    dest: "The Memorial Ground, Musgrave, Durban",
    vehicle: "Iveco Daily 35-Seater (ND 849-211)",
    driver: "Themba Nxumalo",
    departTime: "06:30",
    returnTime: "18:30",
    status: "Confirmed",
    leadCoach: "Craig Hendricks",
    students: [
      { id: "p1", name: "James Whitfield", checkedIn: true },
      { id: "p2", name: "Luca De Villiers", checkedIn: true },
      { id: "p3", name: "Ethan Solomons", checkedIn: true },
      { id: "p4", name: "Marcus Ngcobo", checkedIn: true },
      { id: "p6", name: "Aiden Petersen", checkedIn: true },
      { id: "p7", name: "Dylan Fortuin", checkedIn: false },
      { id: "p8", name: "Connor Walsh", checkedIn: true },
      { id: "sc1", name: "Brian Wessels (Scorer)", checkedIn: true },
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
    status: "Scheduled",
    leadCoach: "Dean Abrahams",
    students: [
      { id: "p9", name: "Sam Petersen", checkedIn: false },
      { id: "p10", name: "Jude Mthembu", checkedIn: false },
    ],
  },
];

export default function LogisticsView({ theme: D }: LogisticsViewProps) {
  const [vehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [drivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [manifests, setManifests] = useState(MANIFESTS);
  const [selectedManifestId, setSelectedManifestId] = useState<string>("m1");

  const activeManifest = manifests.find(m => m.id === selectedManifestId) || manifests[0];

  const toggleStudentCheckin = (manifestId: string, studentId: string) => {
    setManifests(prev => prev.map(m => {
      if (m.id !== manifestId) return m;
      return {
        ...m,
        students: m.students.map(s => s.id === studentId ? { ...s, checkedIn: !s.checkedIn } : s),
      };
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🚌</span>
            <h2 style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 800, color: D.textPrimary }}>
              Fleet Transport & Student Movement Operations
            </h2>
          </div>
          <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted, marginTop: '2px' }}>
            WBHS School bus tracking, certified PrDP drivers, passenger manifests, and departure schedules
          </div>
        </div>
      </div>

      {/* Fleet KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <div style={{ padding: '14px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}` }}>
          <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>TOTAL FLEET CAPACITY</div>
          <div style={{ fontFamily: D.mono, fontSize: '24px', fontWeight: 800, color: D.sky, marginTop: '4px' }}>76 Seats</div>
          <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted, marginTop: '2px' }}>4 Active Vehicles</div>
        </div>
        <div style={{ padding: '14px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}` }}>
          <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>IN-TRANSIT TODAY</div>
          <div style={{ fontFamily: D.mono, fontSize: '24px', fontWeight: 800, color: D.emerald, marginTop: '4px' }}>1 Coach</div>
          <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted, marginTop: '2px' }}>Toyota Quantum en route</div>
        </div>
        <div style={{ padding: '14px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}` }}>
          <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>SAFETY COMPLIANCE</div>
          <div style={{ fontFamily: D.mono, fontSize: '24px', fontWeight: 800, color: D.amber, marginTop: '4px' }}>100% Valid</div>
          <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted, marginTop: '2px' }}>PrDP & Roadworthy passed</div>
        </div>
      </div>

      {/* Grid: Fleet Status & Active Manifest */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(300px, 1fr)', gap: '16px' }}>
        {/* Left Column: Vehicle Fleet Directory */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
            VEHICLE FLEET INVENTORY
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {vehicles.map(v => (
              <div
                key={v.id}
                style={{
                  padding: '16px',
                  borderRadius: D.lg,
                  background: D.surf1,
                  border: `1px solid ${D.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 700, color: D.textPrimary }}>
                    {v.model}
                  </div>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: D.pill,
                      fontFamily: D.mono,
                      fontSize: '10px',
                      fontWeight: 700,
                      background: v.status === 'in-transit' ? `${D.emerald}22` : v.status === 'available' ? `${D.sky}22` : `${D.rose}22`,
                      color: v.status === 'in-transit' ? D.emerald : v.status === 'available' ? D.sky : D.rose,
                      border: `1px solid ${v.status === 'in-transit' ? D.emerald : v.status === 'available' ? D.sky : D.rose}44`,
                    }}
                  >
                    {v.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '4px' }}>
                  <div style={{ padding: '6px', background: D.surf2, borderRadius: D.sm }}>
                    <div style={{ fontFamily: D.head, fontSize: '8px', color: D.textMuted }}>PLATE</div>
                    <div style={{ fontFamily: D.mono, fontSize: '11px', fontWeight: 700 }}>{v.plate}</div>
                  </div>
                  <div style={{ padding: '6px', background: D.surf2, borderRadius: D.sm }}>
                    <div style={{ fontFamily: D.head, fontSize: '8px', color: D.textMuted }}>SEATS</div>
                    <div style={{ fontFamily: D.mono, fontSize: '11px', fontWeight: 700, color: D.sky }}>{v.capacity} pax</div>
                  </div>
                  <div style={{ padding: '6px', background: D.surf2, borderRadius: D.sm }}>
                    <div style={{ fontFamily: D.head, fontSize: '8px', color: D.textMuted }}>FUEL</div>
                    <div style={{ fontFamily: D.mono, fontSize: '11px', fontWeight: 700, color: D.emerald }}>{v.fuelPct}%</div>
                  </div>
                  <div style={{ padding: '6px', background: D.surf2, borderRadius: D.sm }}>
                    <div style={{ fontFamily: D.head, fontSize: '8px', color: D.textMuted }}>ODOMETER</div>
                    <div style={{ fontFamily: D.mono, fontSize: '11px', fontWeight: 700 }}>{v.mileageKm.toLocaleString()}km</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: D.body, fontSize: '11px', color: D.textMuted, marginTop: '2px' }}>
                  <span>Driver: <strong style={{ color: D.textPrimary }}>{v.assignedDriver}</strong></span>
                  <span>Inspection due: {v.nextInspection}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Certified Drivers Strip */}
          <div style={{ padding: '16px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.textPrimary }}>
              PRDP CERTIFIED DRIVERS ROSTER
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {drivers.map(d => (
                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: D.surf2, borderRadius: D.md }}>
                  <div>
                    <div style={{ fontFamily: D.body, fontSize: '12px', fontWeight: 700, color: D.textPrimary }}>{d.name}</div>
                    <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>{d.licenseNumber} · 📞 {d.phone}</div>
                  </div>
                  <span style={{ padding: '2px 8px', borderRadius: D.pill, background: `${D.emerald}20`, color: D.emerald, fontFamily: D.mono, fontSize: '10px', fontWeight: 700 }}>
                    {d.prdpStatus.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Active Passenger Manifest */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
            MATCH DAY PASSENGER MANIFEST
          </div>

          <div style={{ padding: '18px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Manifest Switcher */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {manifests.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedManifestId(m.id)}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: D.md,
                    border: `1px solid ${selectedManifestId === m.id ? D.indigo : D.border}`,
                    background: selectedManifestId === m.id ? `${D.indigo}22` : D.surf2,
                    color: selectedManifestId === m.id ? D.indigo : D.textSecondary,
                    fontFamily: D.head,
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div>{m.trip.split(" vs ")[1]}</div>
                  <div style={{ fontFamily: D.mono, fontSize: '9px', color: D.textMuted }}>Departs: {m.departTime}</div>
                </button>
              ))}
            </div>

            {/* Manifest Header Details */}
            <div style={{ padding: '12px', borderRadius: D.md, background: D.surf2, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary }}>
                {activeManifest.trip}
              </div>
              <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                📍 Destination: {activeManifest.dest}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px' }}>
                <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textSecondary }}>
                  🚌 {activeManifest.vehicle}
                </div>
                <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textSecondary }}>
                  👤 Driver: {activeManifest.driver}
                </div>
                <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textSecondary }}>
                  ⏰ Depart: {activeManifest.departTime}
                </div>
                <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textSecondary }}>
                  🏁 Return: {activeManifest.returnTime}
                </div>
              </div>
            </div>

            {/* Passenger Boarding Roll Call */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textMuted, letterSpacing: '0.06em' }}>
                  STUDENT ROLL CALL ({activeManifest.students.filter(s => s.checkedIn).length}/{activeManifest.students.length} ON BOARD)
                </span>
                <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.emerald, fontWeight: 700 }}>
                  Lead: {activeManifest.leadCoach}
                </span>
              </div>

              {activeManifest.students.map(s => (
                <div
                  key={s.id}
                  onClick={() => toggleStudentCheckin(activeManifest.id, s.id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: D.md,
                    background: s.checkedIn ? `${D.emerald}14` : D.surf2,
                    border: `1px solid ${s.checkedIn ? D.emerald + '44' : D.border}`,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '4px',
                        background: s.checkedIn ? D.emerald : 'transparent',
                        border: `1px solid ${s.checkedIn ? D.emerald : D.textMuted}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 900,
                      }}
                    >
                      {s.checkedIn && '✓'}
                    </div>
                    <span style={{ fontFamily: D.body, fontSize: '12px', fontWeight: 600, color: D.textPrimary }}>
                      {s.name}
                    </span>
                  </div>

                  <span
                    style={{
                      fontFamily: D.mono,
                      fontSize: '10px',
                      color: s.checkedIn ? D.emerald : D.rose,
                      fontWeight: 700,
                    }}
                  >
                    {s.checkedIn ? 'ON BOARD' : 'PENDING'}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Dispatch Action */}
            <button
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: D.pill,
                background: D.gradLive,
                border: 'none',
                color: '#fff',
                fontFamily: D.head,
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ✓ Confirm Manifest & Notify Parents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
