'use client';

import React, { useState, useMemo } from 'react';
import { Theme } from './types';
import { SCHOOLS_REGISTRY, ROLES } from './data';
import {
  Users, Award, Shield, UserCheck, Edit2, Trash2, Plus,
  Search, LayoutGrid, List, Calendar, CheckCircle2, AlertCircle,
  Mail, Phone, Clock, FileCheck, CheckSquare, X
} from 'lucide-react';

export interface StaffRecord {
  id: string;
  name: string;
  department: 'Cricket Leadership' | 'High Performance Coaching' | 'Match Officiating' | 'Electronic Scoring' | 'Grounds & Facilities' | 'Medical & Physio';
  roleTitle: string;
  roleKey: string;
  schoolId: string;
  email: string;
  phone: string;
  csaLevel: 'Level 1' | 'Level 2' | 'Level 3 HP' | 'ICC/CSA Elite Panel' | 'Certified Scorer';
  bokSmartExpiry: string;
  vettingStatus: 'Verified (Cleared)' | 'Renewal Pending' | 'In Progress';
  popiaTier: number;
  status: 'active' | 'suspended';
  assignedTeams: string[];
  weekendRotaDuty?: string;
}

interface StaffManagementViewProps {
  theme: Theme;
  activeSchoolId: string;
  currentRole: string;
  onTriggerToast: (title: string, body?: string, category?: string, targetPage?: string) => void;
}

export type StaffViewMode = 'directory' | 'compliance' | 'rota';

const INITIAL_STAFF: StaffRecord[] = [
  {
    id: "st1",
    name: "Craig Hendricks",
    department: "Cricket Leadership",
    roleTitle: "Director of Cricket / 1st XI Head Coach",
    roleKey: "doc",
    schoolId: "WES",
    email: "craig.hendricks@wbhs.co.za",
    phone: "+27 82 449 1102",
    csaLevel: "Level 3 HP",
    bokSmartExpiry: "2027-02-15",
    vettingStatus: "Verified (Cleared)",
    popiaTier: 4,
    status: "active",
    assignedTeams: ["1st XI", "Open Squad"],
    weekendRotaDuty: "Lead Selector & 1st XI Head Coach vs DHS",
  },
  {
    id: "st2",
    name: "Dean Abrahams",
    department: "High Performance Coaching",
    roleTitle: "Lead Batting & Transition Coach",
    roleKey: "coach",
    schoolId: "WES",
    email: "dean.abrahams@wbhs.co.za",
    phone: "+27 83 902 4410",
    csaLevel: "Level 3 HP",
    bokSmartExpiry: "2026-11-30",
    vettingStatus: "Verified (Cleared)",
    popiaTier: 3,
    status: "active",
    assignedTeams: ["2nd XI", "U16A"],
    weekendRotaDuty: "2nd XI Head Coach vs Kearsney",
  },
  {
    id: "st3",
    name: "Shaun George",
    department: "Match Officiating",
    roleTitle: "CSA Elite Interschool Umpire",
    roleKey: "umpire",
    schoolId: "WES",
    email: "s.george@csa-officials.co.za",
    phone: "+27 82 110 9988",
    csaLevel: "ICC/CSA Elite Panel",
    bokSmartExpiry: "2026-08-20",
    vettingStatus: "Verified (Cleared)",
    popiaTier: 2,
    status: "active",
    assignedTeams: ["1st XI Matches"],
    weekendRotaDuty: "Lead Standing Umpire WBHS vs DHS (Commons Oval)",
  },
  {
    id: "st4",
    name: "Brian Wessels",
    department: "Electronic Scoring",
    roleTitle: "Senior Broadcast Scorer",
    roleKey: "scorer",
    schoolId: "WES",
    email: "brian.wessels@wbhs.co.za",
    phone: "+27 76 331 4455",
    csaLevel: "Certified Scorer",
    bokSmartExpiry: "2027-04-10",
    vettingStatus: "Verified (Cleared)",
    popiaTier: 3,
    status: "active",
    assignedTeams: ["1st XI", "2nd XI"],
    weekendRotaDuty: "Live Electronic Stream Scorer vs DHS",
  },
  {
    id: "st5",
    name: "Jabu Khumalo",
    department: "Grounds & Facilities",
    roleTitle: "Master Head Groundskeeper & Turf Curator",
    roleKey: "curator",
    schoolId: "WES",
    email: "jabu.khumalo@wbhs.co.za",
    phone: "+27 84 551 2299",
    csaLevel: "Level 2",
    bokSmartExpiry: "2026-10-01",
    vettingStatus: "Verified (Cleared)",
    popiaTier: 2,
    status: "active",
    assignedTeams: ["All School Ovals"],
    weekendRotaDuty: "Early Morning Pitch & Covers Telemetry (05:30)",
  },
  {
    id: "st6",
    name: "Sister Lauren Ndlovu",
    department: "Medical & Physio",
    roleTitle: "High Performance Lead Physiotherapist",
    roleKey: "sportsmaster",
    schoolId: "WES",
    email: "lauren.ndlovu@wbhs.co.za",
    phone: "+27 83 440 9912",
    csaLevel: "Level 3 HP",
    bokSmartExpiry: "2027-01-20",
    vettingStatus: "Verified (Cleared)",
    popiaTier: 4,
    status: "active",
    assignedTeams: ["All Divisions"],
    weekendRotaDuty: "Pitchside Medical Response & Concussion Assessments",
  },
  {
    id: "st7",
    name: "Markus Venter",
    department: "Cricket Leadership",
    roleTitle: "Director of Sport / Sportsmaster",
    roleKey: "sportsmaster",
    schoolId: "WES",
    email: "markus.venter@wbhs.co.za",
    phone: "+27 82 770 1234",
    csaLevel: "Level 3 HP",
    bokSmartExpiry: "2026-12-15",
    vettingStatus: "Verified (Cleared)",
    popiaTier: 4,
    status: "active",
    assignedTeams: ["All 23 Squads"],
    weekendRotaDuty: "Overall Circuit Matchday Operations & Protocol",
  },
];

export default function StaffManagementView({
  theme: D,
  activeSchoolId,
  currentRole,
  onTriggerToast,
}: StaffManagementViewProps) {
  const [viewMode, setViewMode] = useState<StaffViewMode>('directory');
  const [staffList, setStaffList] = useState<StaffRecord[]>(INITIAL_STAFF);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    department: 'High Performance Coaching' as StaffRecord['department'],
    roleTitle: '',
    roleKey: 'coach',
    email: '',
    phone: '+27 ',
    csaLevel: 'Level 2' as StaffRecord['csaLevel'],
    bokSmartExpiry: '2027-01-15',
    vettingStatus: 'Verified (Cleared)' as StaffRecord['vettingStatus'],
    popiaTier: 3,
    status: 'active' as StaffRecord['status'],
    weekendRotaDuty: '',
  });

  const activeSchool = SCHOOLS_REGISTRY.find(s => s.id === activeSchoolId) || SCHOOLS_REGISTRY[0];

  // RBAC checks
  const canManageStaff = ['superadmin', 'schooladmin', 'sportsmaster', 'doc', 'headmaster'].includes(currentRole);
  const isReadOnly = ['player', 'parent', 'coach', 'scorer', 'umpire'].includes(currentRole);

  const filteredStaff = useMemo(() => {
    return staffList.filter(s => {
      if (departmentFilter !== 'all' && s.department !== departmentFilter) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const str = `${s.name} ${s.roleTitle} ${s.department} ${s.email} ${s.csaLevel}`.toLowerCase();
        if (!str.includes(q)) return false;
      }
      return true;
    });
  }, [staffList, departmentFilter, searchQuery]);

  const handleOpenCreate = () => {
    if (!canManageStaff) {
      onTriggerToast(`Access Restricted: Role '${currentRole}' cannot register staff.`);
      return;
    }
    setFormData({
      name: '',
      department: 'High Performance Coaching',
      roleTitle: 'Assistant Coach / Fast Bowling Specialist',
      roleKey: 'coach',
      email: `@${activeSchool.shortName.toLowerCase()}.co.za`,
      phone: '+27 82 ',
      csaLevel: 'Level 2',
      bokSmartExpiry: '2027-02-01',
      vettingStatus: 'Verified (Cleared)',
      popiaTier: 3,
      status: 'active',
      weekendRotaDuty: 'Saturday Morning Junior Nets / U14A Supervision',
    });
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (staff: StaffRecord) => {
    if (!canManageStaff) {
      onTriggerToast(`Access Restricted: Role '${currentRole}' cannot edit staff records.`);
      return;
    }
    setSelectedStaff(staff);
    setFormData({
      name: staff.name,
      department: staff.department,
      roleTitle: staff.roleTitle,
      roleKey: staff.roleKey,
      email: staff.email,
      phone: staff.phone,
      csaLevel: staff.csaLevel,
      bokSmartExpiry: staff.bokSmartExpiry,
      vettingStatus: staff.vettingStatus,
      popiaTier: staff.popiaTier,
      status: staff.status,
      weekendRotaDuty: staff.weekendRotaDuty || '',
    });
    setEditModalOpen(true);
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newStaff: StaffRecord = {
      id: `st_${Date.now()}`,
      name: formData.name,
      department: formData.department,
      roleTitle: formData.roleTitle,
      roleKey: formData.roleKey,
      schoolId: activeSchoolId,
      email: formData.email,
      phone: formData.phone,
      csaLevel: formData.csaLevel,
      bokSmartExpiry: formData.bokSmartExpiry,
      vettingStatus: formData.vettingStatus,
      popiaTier: formData.popiaTier,
      status: formData.status,
      assignedTeams: ['Open Squad'],
      weekendRotaDuty: formData.weekendRotaDuty,
    };
    setStaffList(prev => [...prev, newStaff]);
    setCreateModalOpen(false);
    onTriggerToast(`Staff record registered: ${formData.name}`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setStaffList(prev => prev.map(s => s.id === selectedStaff.id ? {
      ...s,
      name: formData.name,
      department: formData.department,
      roleTitle: formData.roleTitle,
      roleKey: formData.roleKey,
      email: formData.email,
      phone: formData.phone,
      csaLevel: formData.csaLevel,
      bokSmartExpiry: formData.bokSmartExpiry,
      vettingStatus: formData.vettingStatus,
      popiaTier: formData.popiaTier,
      status: formData.status,
      weekendRotaDuty: formData.weekendRotaDuty,
    } : s));
    setEditModalOpen(false);
    onTriggerToast(`Staff credentials updated: ${formData.name}`);
  };

  const handleConfirmDelete = () => {
    if (!selectedStaff) return;
    setStaffList(prev => prev.filter(s => s.id !== selectedStaff.id));
    setDeleteModalOpen(false);
    onTriggerToast(`Staff member deactivated: ${selectedStaff.name}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Header Banner */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: D.lg,
          background: `linear-gradient(135deg, ${D.violet || D.indigo}18 0%, ${D.surf1} 100%)`,
          border: `1px solid ${(D.violet || D.indigo)}33`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>🛡️</span>
          <div>
            <h1 style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
              {activeSchool.name} · Staff & Governance Operations
            </h1>
            <p style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted, margin: '2px 0 0' }}>
              Certified Coaches, CSA Umpires, Electronic Scorers, Curators, BokSmart Safety Expiries & Weekend Duty Rota
            </p>
          </div>
        </div>

        {/* View Switcher & Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: D.surf2, padding: '3px', borderRadius: D.pill, border: `1px solid ${D.border}` }}>
            <button
              onClick={() => setViewMode('directory')}
              style={{
                padding: '6px 12px',
                borderRadius: D.pill,
                border: 'none',
                background: viewMode === 'directory' ? (D.violet || D.indigo) : 'transparent',
                color: viewMode === 'directory' ? '#fff' : D.textSecondary,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <LayoutGrid size={13} />
              <span>Directory Cards</span>
            </button>
            <button
              onClick={() => setViewMode('compliance')}
              style={{
                padding: '6px 12px',
                borderRadius: D.pill,
                border: 'none',
                background: viewMode === 'compliance' ? (D.violet || D.indigo) : 'transparent',
                color: viewMode === 'compliance' ? '#fff' : D.textSecondary,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <List size={13} />
              <span>Compliance & Accreditations</span>
            </button>
            <button
              onClick={() => setViewMode('rota')}
              style={{
                padding: '6px 12px',
                borderRadius: D.pill,
                border: 'none',
                background: viewMode === 'rota' ? (D.violet || D.indigo) : 'transparent',
                color: viewMode === 'rota' ? '#fff' : D.textSecondary,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Calendar size={13} />
              <span>Duty Rota</span>
            </button>
          </div>

          {canManageStaff ? (
            <button
              onClick={handleOpenCreate}
              style={{
                padding: '7px 14px',
                borderRadius: D.pill,
                background: D.violet || D.indigo,
                border: 'none',
                color: '#fff',
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: `0 3px 10px ${(D.violet || D.indigo)}33`,
              }}
            >
              <Plus size={14} />
              <span>Register Staff</span>
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

      {/* Filter Tabs & Search Bar */}
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
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {['all', 'Cricket Leadership', 'High Performance Coaching', 'Match Officiating', 'Electronic Scoring', 'Grounds & Facilities', 'Medical & Physio'].map(dept => (
            <button
              key={dept}
              onClick={() => setDepartmentFilter(dept)}
              style={{
                padding: '5px 12px',
                borderRadius: D.pill,
                border: `1px solid ${departmentFilter === dept ? (D.violet || D.indigo) : D.border}`,
                background: departmentFilter === dept ? `${(D.violet || D.indigo)}20` : D.surf2,
                color: departmentFilter === dept ? (D.violet || D.indigo) : D.textSecondary,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {dept === 'all' ? `All Personnel (${staffList.length})` : dept}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '220px' }}>
          <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: D.textMuted }} />
          <input
            type="text"
            placeholder="Search staff, role, CSA level..."
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
      </div>

      {/* VIEW 1: DIRECTORY CARDS */}
      {viewMode === 'directory' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 330px), 1fr))', gap: '16px' }}>
          {filteredStaff.map(s => {
            const roleMeta = ROLES[s.roleKey] || { icon: '👔', color: D.indigo };
            return (
              <div
                key={s.id}
                style={{
                  background: D.surf0,
                  borderRadius: D.lg,
                  border: `1px solid ${D.border}`,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          background: `${roleMeta.color || D.indigo}20`,
                          border: `1px solid ${roleMeta.color || D.indigo}44`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          flexShrink: 0,
                        }}
                      >
                        {roleMeta.icon}
                      </div>
                      <div>
                        <h3 style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                          {s.name}
                        </h3>
                        <div style={{ fontFamily: D.body, fontSize: '11px', color: roleMeta.color || D.indigo, fontWeight: 700 }}>
                          {s.roleTitle}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: D.pill,
                        background: s.status === 'active' ? `${D.emerald}20` : `${D.rose}20`,
                        color: s.status === 'active' ? D.emerald : D.rose,
                        fontFamily: D.mono,
                        fontSize: '9px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                      }}
                    >
                      {s.status}
                    </span>
                  </div>

                  {/* Accreditations & CSA Badge */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                    <div style={{ padding: '8px 10px', background: D.surf2, borderRadius: D.md }}>
                      <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>CSA CERTIFICATION</div>
                      <div style={{ fontFamily: D.mono, fontSize: '11px', fontWeight: 700, color: D.textPrimary, marginTop: '2px' }}>
                        {s.csaLevel}
                      </div>
                    </div>
                    <div style={{ padding: '8px 10px', background: D.surf2, borderRadius: D.md }}>
                      <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>BOKSMART SAFETY</div>
                      <div style={{ fontFamily: D.mono, fontSize: '11px', fontWeight: 700, color: D.emerald, marginTop: '2px' }}>
                        Valid: {s.bokSmartExpiry}
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px', fontFamily: D.mono, fontSize: '11px', color: D.textSecondary }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={12} style={{ color: D.sky }} />
                      <span>{s.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={12} style={{ color: D.emerald }} />
                      <span>{s.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom / Action Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: `1px solid ${D.border}44` }}>
                  <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                    POPIA Tier: {s.popiaTier}/4
                  </span>

                  {canManageStaff && (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => handleOpenEdit(s)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: D.sm,
                          background: D.surf2,
                          border: `1px solid ${D.border}`,
                          color: D.textPrimary,
                          fontFamily: D.head,
                          fontSize: '10px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Edit2 size={11} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStaff(s);
                          setDeleteModalOpen(true);
                        }}
                        style={{
                          padding: '4px 6px',
                          borderRadius: D.sm,
                          background: 'transparent',
                          border: `1px solid ${D.rose}44`,
                          color: D.rose,
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: COMPLIANCE & ACCREDITATIONS TABLE */}
      {viewMode === 'compliance' && (
        <div
          style={{
            background: D.surf0,
            borderRadius: D.lg,
            border: `1px solid ${D.border}`,
            overflowX: 'auto',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '780px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${D.border}`, background: D.surf1, textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>PERSONNEL</th>
                <th style={{ padding: '10px 14px', fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>DEPARTMENT</th>
                <th style={{ padding: '10px 14px', fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>CSA ACCREDITATION</th>
                <th style={{ padding: '10px 14px', fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>BOKSMART EXPIRY</th>
                <th style={{ padding: '10px 14px', fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>POLICE VETTING</th>
                <th style={{ padding: '10px 14px', fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>POPIA TIER</th>
                <th style={{ padding: '10px 14px', fontFamily: D.head, fontSize: '10px', color: D.textMuted, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map(s => (
                <tr key={s.id} style={{ borderBottom: `1px solid ${D.border}44` }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: D.textPrimary }}>
                      {s.name}
                    </div>
                    <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                      {s.roleTitle}
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: D.body, fontSize: '12px', color: D.textPrimary }}>
                    {s.department}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: D.pill,
                        background: `${D.indigo}20`,
                        color: D.indigo,
                        fontFamily: D.mono,
                        fontSize: '10px',
                        fontWeight: 700,
                      }}
                    >
                      {s.csaLevel}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: D.mono, fontSize: '11px', color: D.emerald, fontWeight: 700 }}>
                    {s.bokSmartExpiry}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: D.emerald, fontFamily: D.body, fontSize: '11px', fontWeight: 600 }}>
                      <CheckCircle2 size={13} />
                      <span>{s.vettingStatus}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: D.mono, fontSize: '12px', color: D.textPrimary }}>
                    Level {s.popiaTier} / 4
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    {canManageStaff && (
                      <button
                        onClick={() => handleOpenEdit(s)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: D.sm,
                          background: D.surf2,
                          border: `1px solid ${D.border}`,
                          color: D.textPrimary,
                          fontFamily: D.head,
                          fontSize: '10px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 3: MATCHDAY DUTY ROTA */}
      {viewMode === 'rota' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ padding: '12px 16px', background: D.surf1, borderRadius: D.md, border: `1px solid ${D.border}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} style={{ color: D.violet || D.indigo }} />
            <span style={{ fontFamily: D.body, fontSize: '12px', color: D.textPrimary }}>
              <strong>Saturday Interschool Circuit Rota:</strong> Scheduled matchday staff duties, head coaches, umpires, broadcast scorers, and pitch curators.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '14px' }}>
            {filteredStaff.map(s => (
              <div
                key={s.id}
                style={{
                  background: D.surf0,
                  borderRadius: D.lg,
                  border: `1px solid ${D.border}`,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                      {s.name}
                    </h3>
                    <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                      {s.roleTitle}
                    </div>
                  </div>
                  <span style={{ fontFamily: D.mono, fontSize: '9px', padding: '2px 6px', borderRadius: D.pill, background: D.surf2, color: D.textSecondary }}>
                    {s.department.split(' ')[0]}
                  </span>
                </div>

                <div style={{ padding: '10px', background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}` }}>
                  <div style={{ fontFamily: D.head, fontSize: '9px', fontWeight: 700, color: D.violet || D.indigo, textTransform: 'uppercase', marginBottom: '4px' }}>
                    Assigned Matchday Duty
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textPrimary, fontWeight: 600 }}>
                    {s.weekendRotaDuty || 'Standby Reserve / Campus Protocol'}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                  <span>Contact: {s.phone}</span>
                  <span style={{ color: D.emerald }}>● Confirmed Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE STAFF MODAL */}
      {createModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: D.surf0, borderRadius: D.lg, border: `1px solid ${D.border}`, maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} style={{ color: D.violet || D.indigo }} />
                <h3 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>Register New Staff Member</h3>
              </div>
              <button onClick={() => setCreateModalOpen(false)} style={{ background: 'none', border: 'none', color: D.textMuted, cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>

            <form onSubmit={handleSaveCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Department</label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value as any })}
                    style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                  >
                    <option value="Cricket Leadership">Cricket Leadership</option>
                    <option value="High Performance Coaching">High Performance Coaching</option>
                    <option value="Match Officiating">Match Officiating</option>
                    <option value="Electronic Scoring">Electronic Scoring</option>
                    <option value="Grounds & Facilities">Grounds & Facilities</option>
                    <option value="Medical & Physio">Medical & Physio</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Role Title</label>
                  <input
                    type="text"
                    required
                    value={formData.roleTitle}
                    onChange={e => setFormData({ ...formData, roleTitle: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>CSA Accreditation</label>
                  <select
                    value={formData.csaLevel}
                    onChange={e => setFormData({ ...formData, csaLevel: e.target.value as any })}
                    style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                  >
                    <option value="Level 1">Level 1</option>
                    <option value="Level 2">Level 2</option>
                    <option value="Level 3 HP">Level 3 HP</option>
                    <option value="ICC/CSA Elite Panel">ICC/CSA Elite Panel</option>
                    <option value="Certified Scorer">Certified Scorer</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>BokSmart Safety Expiry</label>
                  <input
                    type="date"
                    required
                    value={formData.bokSmartExpiry}
                    onChange={e => setFormData({ ...formData, bokSmartExpiry: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Matchday Duty Rota Assignment</label>
                <input
                  type="text"
                  value={formData.weekendRotaDuty}
                  onChange={e => setFormData({ ...formData, weekendRotaDuty: e.target.value })}
                  placeholder="e.g. Lead Standing Umpire, Head Coach 1st XI..."
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
                  style={{ padding: '8px 18px', borderRadius: D.pill, background: D.violet || D.indigo, border: 'none', color: '#fff', fontFamily: D.head, fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Save Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STAFF MODAL */}
      {editModalOpen && selectedStaff && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: D.surf0, borderRadius: D.lg, border: `1px solid ${D.border}`, maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit2 size={18} style={{ color: D.violet || D.indigo }} />
                <h3 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>Edit Staff Credentials</h3>
              </div>
              <button onClick={() => setEditModalOpen(false)} style={{ background: 'none', border: 'none', color: D.textMuted, cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                />
              </div>

              <div>
                <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Role Title</label>
                <input
                  type="text"
                  required
                  value={formData.roleTitle}
                  onChange={e => setFormData({ ...formData, roleTitle: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>CSA Accreditation</label>
                  <select
                    value={formData.csaLevel}
                    onChange={e => setFormData({ ...formData, csaLevel: e.target.value as any })}
                    style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                  >
                    <option value="Level 1">Level 1</option>
                    <option value="Level 2">Level 2</option>
                    <option value="Level 3 HP">Level 3 HP</option>
                    <option value="ICC/CSA Elite Panel">ICC/CSA Elite Panel</option>
                    <option value="Certified Scorer">Certified Scorer</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Matchday Duty Rota</label>
                <input
                  type="text"
                  value={formData.weekendRotaDuty}
                  onChange={e => setFormData({ ...formData, weekendRotaDuty: e.target.value })}
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
                  style={{ padding: '8px 18px', borderRadius: D.pill, background: D.violet || D.indigo, border: 'none', color: '#fff', fontFamily: D.head, fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && selectedStaff && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: D.surf0, borderRadius: D.lg, border: `1px solid ${D.rose}44`, maxWidth: '400px', width: '100%', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <AlertCircle size={20} style={{ color: D.rose }} />
              <h3 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.rose, margin: 0 }}>
                Deactivate Staff Member?
              </h3>
            </div>
            <p style={{ fontFamily: D.body, fontSize: '13px', color: D.textPrimary, lineHeight: 1.4 }}>
              Are you sure you want to deactivate <strong>{selectedStaff.name}</strong> ({selectedStaff.roleTitle})? Access to institutional fixtures and rosters will be revoked.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                onClick={() => setDeleteModalOpen(false)}
                style={{ padding: '7px 14px', borderRadius: D.pill, background: D.surf2, border: `1px solid ${D.border}`, color: D.textSecondary, fontFamily: D.head, fontSize: '11px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{ padding: '7px 16px', borderRadius: D.pill, background: D.rose, border: 'none', color: '#fff', fontFamily: D.head, fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
              >
                Confirm Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
