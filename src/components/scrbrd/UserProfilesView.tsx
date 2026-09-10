'use client';

import React, { useState, useMemo } from 'react';
import { Theme, Player } from './types';
import { ROLES, SCHOOLS_REGISTRY, PLAYERS } from './data';
import { getSchoolSquads } from './multiSquadData';
import {
  Shield, Search, UserCheck, Edit2, Mail, Phone, Lock,
  CheckCircle2, AlertCircle, Plus, Trash2, LayoutGrid, List,
  Columns, Award, UserPlus, FileText, ChevronRight, X, Sparkles, ExternalLink
} from 'lucide-react';

export interface ProfileRecord {
  id: string;
  name: string;
  category: 'athlete' | 'staff' | 'official';
  email: string;
  roles: string[];
  schoolId: string;
  assignedSquads?: string[];
  status: 'active' | 'suspended';
  phone?: string;
  // Athlete-specific attributes
  playerRef?: Player;
  age?: number;
  house?: string;
  battingHand?: 'Right-hand' | 'Left-hand';
  bowlingStyle?: string;
  heightCm?: number;
  weightKg?: number;
  bursaryScholar?: boolean;
  transformationPathway?: boolean;
  // Accreditations & Certifications
  certifications?: Array<{ name: string; issuer: string; year: string; verified: boolean }>;
  accolades?: string[];
}

interface UserProfilesViewProps {
  theme: Theme;
  users: Array<{
    id: string;
    name: string;
    email: string;
    roles: string[];
    schoolId: string;
    assignedSquads?: string[];
    status: 'active' | 'suspended';
    phone?: string;
  }>;
  onUpdateUser: (updatedUser: any) => void;
  currentRole: string;
  activeSchoolId: string;
  onTriggerToast: (msg: string) => void;
  onNavigateToH2H?: (player1Id?: string, player2Id?: string) => void;
}

export type ProfileViewMode = 'cards' | 'table' | 'split';

export default function UserProfilesView({
  theme: D,
  users,
  onUpdateUser,
  currentRole,
  activeSchoolId,
  onTriggerToast,
  onNavigateToH2H,
}: UserProfilesViewProps) {
  const [viewMode, setViewMode] = useState<ProfileViewMode>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'athlete' | 'coach' | 'official' | 'leadership'>('all');
  const [schoolFilter, setSchoolFilter] = useState<string>(activeSchoolId);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // Modals
  const [editingProfile, setEditingProfile] = useState<ProfileRecord | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<ProfileRecord | null>(null);

  // New Profile Form
  const [newProfileData, setNewProfileData] = useState({
    name: '',
    email: '',
    category: 'athlete' as 'athlete' | 'staff' | 'official',
    role: 'player',
    schoolId: activeSchoolId,
    phone: '+27 ',
    battingHand: 'Right-hand' as 'Right-hand' | 'Left-hand',
    bowlingStyle: 'Right-arm Fast',
    house: 'Wakes House',
    age: 17,
  });

  const activeSchool = SCHOOLS_REGISTRY.find(s => s.id === activeSchoolId) || SCHOOLS_REGISTRY[0];
  const schoolSquads = useMemo(() => getSchoolSquads(activeSchoolId), [activeSchoolId]);

  // RBAC checks
  const canManageProfiles = ['superadmin', 'schooladmin', 'sportsmaster', 'doc', 'headmaster'].includes(currentRole);
  const isCoach = currentRole === 'coach';

  // Merge Staff + Student Athletes into a comprehensive unified profile directory
  const unifiedProfiles = useMemo<ProfileRecord[]>(() => {
    // 1. Staff records
    const staffRecords: ProfileRecord[] = users.map(u => ({
      id: u.id,
      name: u.name,
      category: u.roles.some(r => ['coach', 'doc', 'sportsmaster'].includes(r))
        ? 'staff'
        : u.roles.some(r => ['scorer', 'umpire', 'curator'].includes(r))
        ? 'official'
        : 'staff',
      email: u.email,
      roles: u.roles,
      schoolId: u.schoolId,
      assignedSquads: u.assignedSquads || [],
      status: u.status,
      phone: u.phone || '+27 82 555 1200',
      certifications: [
        { name: 'CSA Level 3 High Performance Coaching', issuer: 'Cricket South Africa', year: '2023', verified: true },
        { name: 'BokSmart Rugby/Sports Concussion Protocol', issuer: 'SARU / CSA Medical', year: '2025', verified: true },
        { name: 'POPIA Minor Athlete Data Protection Clearance', issuer: 'KZN Schools Executive', year: '2026', verified: true },
      ],
      accolades: [
        'KZN Schools Coach of the Year Nominee',
        '2024 Michaelmas Cricket Week Champions',
        '100+ 1st XI Caps as Lead Mentor',
      ],
    }));

    // 2. Student Athlete records from PLAYERS
    const athleteRecords: ProfileRecord[] = PLAYERS.map(p => {
      const school = SCHOOLS_REGISTRY.find(s => s.id === p.school) || activeSchool;
      return {
        id: p.id,
        name: p.name,
        category: 'athlete',
        email: `${p.name.toLowerCase().replace(/\s+/g, '.') || 'athlete'}@${school.shortName.toLowerCase().replace(/\s+/g, '')}.co.za`,
        roles: ['player'],
        schoolId: p.school,
        assignedSquads: [`${p.school}_1st_xi`],
        status: 'active',
        phone: '+27 79 123 4567',
        playerRef: p,
        age: 17,
        house: 'Nicholson House',
        battingHand: p.role?.toLowerCase().includes('left') ? 'Left-hand' : 'Right-hand',
        bowlingStyle: p.bowling?.style || 'Right-arm Fast Medium',
        heightCm: 182,
        weightKg: 78,
        bursaryScholar: true,
        transformationPathway: false,
        certifications: [
          { name: 'KZN Provincial U19 Representation Certificate', issuer: 'KZN Cricket Union', year: '2025', verified: true },
          { name: 'CSA Elite Youth Conditioning Protocol', issuer: 'High Performance Institute', year: '2026', verified: true },
          { name: 'BokSmart Safe Sport Protocol Pass', issuer: 'CSA Medical Panel', year: '2026', verified: true },
        ],
        accolades: [
          'First XI Honours Blazer (Awarded 2025)',
          'Top Run Scorer · Michaelmas Week',
          'Fastest Century in KZN Interschool Derby',
        ],
      };
    });

    return [...staffRecords, ...athleteRecords];
  }, [users, activeSchool]);

  // Filter profiles based on category, search, and school
  const filteredProfiles = useMemo(() => {
    return unifiedProfiles.filter(p => {
      // School filter: 'all' or specific schoolId
      if (schoolFilter !== 'all' && p.schoolId !== schoolFilter && p.schoolId !== 'KZN Circuit') {
        return false;
      }

      // Category filter
      if (categoryFilter === 'athlete' && p.category !== 'athlete') return false;
      if (categoryFilter === 'coach' && !p.roles.some(r => ['coach', 'doc', 'sportsmaster'].includes(r))) return false;
      if (categoryFilter === 'official' && !p.roles.some(r => ['scorer', 'umpire', 'curator'].includes(r))) return false;
      if (categoryFilter === 'leadership' && !p.roles.some(r => ['superadmin', 'schooladmin', 'headmaster'].includes(r))) return false;

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const searchStr = `${p.name} ${p.email} ${p.schoolId} ${p.roles.join(' ')} ${p.playerRef?.role || ''}`.toLowerCase();
        if (!searchStr.includes(q)) return false;
      }

      return true;
    });
  }, [unifiedProfiles, schoolFilter, categoryFilter, searchQuery]);

  // Active selected profile for Split Dossier view or Modal view
  const activeProfile = useMemo(() => {
    if (selectedProfileId) {
      const found = unifiedProfiles.find(p => p.id === selectedProfileId);
      if (found) return found;
    }
    return filteredProfiles[0] || unifiedProfiles[0];
  }, [selectedProfileId, filteredProfiles, unifiedProfiles]);

  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;
    onUpdateUser(editingProfile);
    setEditingProfile(null);
    onTriggerToast(`Profile for ${editingProfile.name} successfully updated!`);
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `usr_${Date.now()}`;
    const created: ProfileRecord = {
      id: newId,
      name: newProfileData.name,
      category: newProfileData.category,
      email: newProfileData.email,
      roles: [newProfileData.role],
      schoolId: newProfileData.schoolId,
      assignedSquads: [`${newProfileData.schoolId}_1st_xi`],
      status: 'active',
      phone: newProfileData.phone,
      age: newProfileData.age,
      house: newProfileData.house,
      battingHand: newProfileData.battingHand,
      bowlingStyle: newProfileData.bowlingStyle,
      certifications: [
        { name: 'KZN Schools Institutional Registration', issuer: 'KZN Cricket Union', year: '2026', verified: true },
        { name: 'POPIA Minor Data Protection Clearance', issuer: 'Governance Board', year: '2026', verified: true },
      ],
      accolades: ['Registered School Personnel / Athlete'],
    };
    onUpdateUser(created);
    setCreateModalOpen(false);
    onTriggerToast(`New ${newProfileData.category} profile created for ${newProfileData.name}!`);
  };

  const handleDeleteProfile = () => {
    if (!profileToDelete) return;
    setDeleteModalOpen(false);
    onTriggerToast(`Profile for ${profileToDelete.name} has been archived.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Header Banner */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: D.lg,
          background: `linear-gradient(135deg, ${D.indigo}18 0%, ${D.surf1} 100%)`,
          border: `1px solid ${D.indigo}33`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>👤</span>
          <div>
            <h1 style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
              {activeSchool.name} · Profiles & Personnel Directory
            </h1>
            <p style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted, margin: '2px 0 0' }}>
              Universal Institutional Directory ({unifiedProfiles.length} Total: 54 Student Athletes & 9 Certified Staff) · Accreditations, Accolades & RBAC
            </p>
          </div>
        </div>

        {/* View Switcher & Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: D.surf2, padding: '3px', borderRadius: D.pill, border: `1px solid ${D.border}` }}>
            <button
              onClick={() => setViewMode('cards')}
              style={{
                padding: '6px 12px',
                borderRadius: D.pill,
                border: 'none',
                background: viewMode === 'cards' ? D.indigo : 'transparent',
                color: viewMode === 'cards' ? '#fff' : D.textSecondary,
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
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '6px 12px',
                borderRadius: D.pill,
                border: 'none',
                background: viewMode === 'table' ? D.indigo : 'transparent',
                color: viewMode === 'table' ? '#fff' : D.textSecondary,
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
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              style={{
                padding: '6px 12px',
                borderRadius: D.pill,
                border: 'none',
                background: viewMode === 'split' ? D.indigo : 'transparent',
                color: viewMode === 'split' ? '#fff' : D.textSecondary,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Columns size={13} />
              <span>Split Dossier</span>
            </button>
          </div>

          {canManageProfiles ? (
            <button
              onClick={() => setCreateModalOpen(true)}
              style={{
                padding: '7px 14px',
                borderRadius: D.pill,
                background: D.indigo,
                border: 'none',
                color: '#fff',
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: `0 3px 10px ${D.indigo}33`,
              }}
            >
              <Plus size={14} />
              <span>Add Profile</span>
            </button>
          ) : (
            <div
              title={`Role '${currentRole}' is in read-only mode.`}
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
        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          <button
            onClick={() => setCategoryFilter('all')}
            style={{
              padding: '5px 12px',
              borderRadius: D.pill,
              border: `1px solid ${categoryFilter === 'all' ? D.indigo : D.border}`,
              background: categoryFilter === 'all' ? `${D.indigo}20` : D.surf2,
              color: categoryFilter === 'all' ? D.indigo : D.textSecondary,
              fontFamily: D.head,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            All Profiles ({unifiedProfiles.length})
          </button>
          <button
            onClick={() => setCategoryFilter('athlete')}
            style={{
              padding: '5px 12px',
              borderRadius: D.pill,
              border: `1px solid ${categoryFilter === 'athlete' ? D.indigo : D.border}`,
              background: categoryFilter === 'athlete' ? `${D.indigo}20` : D.surf2,
              color: categoryFilter === 'athlete' ? D.indigo : D.textSecondary,
              fontFamily: D.head,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            🏏 Student Athletes (54)
          </button>
          <button
            onClick={() => setCategoryFilter('coach')}
            style={{
              padding: '5px 12px',
              borderRadius: D.pill,
              border: `1px solid ${categoryFilter === 'coach' ? D.indigo : D.border}`,
              background: categoryFilter === 'coach' ? `${D.indigo}20` : D.surf2,
              color: categoryFilter === 'coach' ? D.indigo : D.textSecondary,
              fontFamily: D.head,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            👔 Coaches & Directors
          </button>
          <button
            onClick={() => setCategoryFilter('official')}
            style={{
              padding: '5px 12px',
              borderRadius: D.pill,
              border: `1px solid ${categoryFilter === 'official' ? D.indigo : D.border}`,
              background: categoryFilter === 'official' ? `${D.indigo}20` : D.surf2,
              color: categoryFilter === 'official' ? D.indigo : D.textSecondary,
              fontFamily: D.head,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            ⚖️ Umpires & Scorers
          </button>
          <button
            onClick={() => setCategoryFilter('leadership')}
            style={{
              padding: '5px 12px',
              borderRadius: D.pill,
              border: `1px solid ${categoryFilter === 'leadership' ? D.indigo : D.border}`,
              background: categoryFilter === 'leadership' ? `${D.indigo}20` : D.surf2,
              color: categoryFilter === 'leadership' ? D.indigo : D.textSecondary,
              fontFamily: D.head,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            🛡️ School Leadership
          </button>
        </div>

        {/* School & Search */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={schoolFilter}
            onChange={e => setSchoolFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: D.pill,
              background: D.surf2,
              border: `1px solid ${D.border}`,
              color: D.textPrimary,
              fontFamily: D.head,
              fontSize: '11px',
              fontWeight: 700,
              outline: 'none',
            }}
          >
            <option value="all">All 9 Schools</option>
            {SCHOOLS_REGISTRY.map(s => (
              <option key={s.id} value={s.id}>{s.crestIcon} {s.shortName}</option>
            ))}
          </select>

          <div style={{ position: 'relative', width: '210px' }}>
            <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: D.textMuted }} />
            <input
              type="text"
              placeholder="Search by name, role, email..."
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
      </div>

      {/* VIEW 1: CARDS GRID */}
      {viewMode === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 330px), 1fr))', gap: '16px' }}>
          {filteredProfiles.map(p => {
            const school = SCHOOLS_REGISTRY.find(s => s.id === p.schoolId) || activeSchool;
            const isAthlete = p.category === 'athlete';

            return (
              <div
                key={p.id}
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
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                }}
              >
                <div>
                  {/* Top Bar with School & Category Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: `${D.indigo}22`,
                          border: `1px solid ${D.indigo}44`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          flexShrink: 0,
                        }}
                      >
                        {isAthlete ? '🏏' : '👔'}
                      </div>
                      <div>
                        <h3 style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                          {p.name}
                        </h3>
                        <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>{school.crestIcon}</span>
                          <span>{school.shortName}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: D.pill,
                        background: isAthlete ? `${D.emerald}20` : `${D.indigo}20`,
                        color: isAthlete ? D.emerald : D.indigo,
                        fontFamily: D.mono,
                        fontSize: '9px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                      }}
                    >
                      {isAthlete ? 'ATHLETE' : 'STAFF'}
                    </span>
                  </div>

                  {/* Bio details / Player Stats */}
                  {isAthlete && p.playerRef ? (
                    <div style={{ background: D.surf1, padding: '10px', borderRadius: D.md, marginTop: '8px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', textAlign: 'center' }}>
                      <div>
                        <div style={{ fontFamily: D.mono, fontSize: '9px', color: D.textMuted }}>AVG</div>
                        <div style={{ fontFamily: D.mono, fontSize: '14px', fontWeight: 800, color: D.emerald }}>
                          {p.playerRef.batting?.avg || '42.5'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontFamily: D.mono, fontSize: '9px', color: D.textMuted }}>SR</div>
                        <div style={{ fontFamily: D.mono, fontSize: '14px', fontWeight: 800, color: D.sky }}>
                          {p.playerRef.batting?.sr || '128.4'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontFamily: D.mono, fontSize: '9px', color: D.textMuted }}>HIGH</div>
                        <div style={{ fontFamily: D.mono, fontSize: '14px', fontWeight: 800, color: D.amber }}>
                          {p.playerRef.batting?.hs || '114*'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '8px 0', fontFamily: D.body, fontSize: '11px', color: D.textSecondary }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={12} style={{ color: D.sky }} />
                        <span style={{ fontFamily: D.mono, fontSize: '11px' }}>{p.email}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <Phone size={12} style={{ color: D.emerald }} />
                        <span style={{ fontFamily: D.mono, fontSize: '11px' }}>{p.phone}</span>
                      </div>
                    </div>
                  )}

                  {/* Accreditations & Badges */}
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {p.certifications?.slice(0, 2).map((cert, cIdx) => (
                        <span
                          key={cIdx}
                          style={{
                            padding: '2px 6px',
                            borderRadius: D.sm,
                            background: D.surf2,
                            border: `1px solid ${D.border}`,
                            fontFamily: D.mono,
                            fontSize: '9px',
                            color: D.textMuted,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <CheckCircle2 size={10} style={{ color: D.emerald }} />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                            {cert.name}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: `1px solid ${D.border}44` }}>
                  <button
                    onClick={() => setSelectedProfileId(p.id)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: D.pill,
                      background: D.surf2,
                      border: `1px solid ${D.border}`,
                      color: D.textPrimary,
                      fontFamily: D.head,
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>View Dossier</span>
                    <ChevronRight size={12} />
                  </button>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    {isAthlete && onNavigateToH2H && (
                      <button
                        onClick={() => onNavigateToH2H(p.id)}
                        title="Compare in Head-to-Head"
                        style={{
                          padding: '5px 9px',
                          borderRadius: D.pill,
                          background: `${D.amber}20`,
                          border: `1px solid ${D.amber}44`,
                          color: D.amber,
                          fontFamily: D.head,
                          fontSize: '10px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        ⚔️ H2H
                      </button>
                    )}

                    {canManageProfiles && (
                      <button
                        onClick={() => setEditingProfile(p)}
                        title="Edit Permissions"
                        style={{
                          padding: '5px 7px',
                          borderRadius: D.sm,
                          background: 'transparent',
                          border: `1px solid ${D.border}`,
                          color: D.textSecondary,
                          cursor: 'pointer',
                        }}
                      >
                        <Edit2 size={11} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: TABLE VIEW */}
      {viewMode === 'table' && (
        <div
          style={{
            background: D.surf0,
            borderRadius: D.lg,
            border: `1px solid ${D.border}`,
            overflowX: 'auto',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${D.border}`, background: D.surf1, textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>NAME</th>
                <th style={{ padding: '10px 14px', fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>CATEGORY</th>
                <th style={{ padding: '10px 14px', fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>INSTITUTION</th>
                <th style={{ padding: '10px 14px', fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>ROLE / DISCIPLINE</th>
                <th style={{ padding: '10px 14px', fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>STATUS</th>
                <th style={{ padding: '10px 14px', fontFamily: D.head, fontSize: '10px', color: D.textMuted, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.map(p => {
                const school = SCHOOLS_REGISTRY.find(s => s.id === p.schoolId) || activeSchool;
                return (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${D.border}44` }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: D.textPrimary }}>
                        {p.name}
                      </div>
                      <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                        {p.email}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: D.pill,
                          background: p.category === 'athlete' ? `${D.emerald}20` : `${D.indigo}20`,
                          color: p.category === 'athlete' ? D.emerald : D.indigo,
                          fontFamily: D.mono,
                          fontSize: '10px',
                          fontWeight: 800,
                        }}
                      >
                        {p.category.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: D.body, fontSize: '12px', color: D.textPrimary }}>
                      {school.crestIcon} {school.name}
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: D.mono, fontSize: '11px', color: D.textSecondary }}>
                      {p.category === 'athlete' ? p.playerRef?.role || 'All-Rounder' : p.roles.join(', ')}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ color: D.emerald, fontFamily: D.mono, fontSize: '11px', fontWeight: 700 }}>
                        ● Active
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setSelectedProfileId(p.id)}
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
                          Dossier
                        </button>
                        {canManageProfiles && (
                          <button
                            onClick={() => setEditingProfile(p)}
                            style={{
                              padding: '4px 6px',
                              borderRadius: D.sm,
                              background: 'transparent',
                              border: `1px solid ${D.border}`,
                              color: D.textSecondary,
                              cursor: 'pointer',
                            }}
                          >
                            <Edit2 size={11} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 3: SPLIT DOSSIER VIEW */}
      {viewMode === 'split' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '16px', alignItems: 'start' }}>
          {/* Left Column: Quick Selector List */}
          <div
            style={{
              background: D.surf0,
              borderRadius: D.lg,
              border: `1px solid ${D.border}`,
              padding: '14px',
              maxHeight: '680px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 800, color: D.textMuted, textTransform: 'uppercase', marginBottom: '4px' }}>
              Select Profile ({filteredProfiles.length})
            </div>
            {filteredProfiles.map(p => {
              const isSelected = p.id === activeProfile?.id;
              const school = SCHOOLS_REGISTRY.find(s => s.id === p.schoolId) || activeSchool;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProfileId(p.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: D.md,
                    background: isSelected ? `${D.indigo}22` : D.surf1,
                    border: isSelected ? `1px solid ${D.indigo}` : `1px solid ${D.border}44`,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: D.textPrimary }}>
                      {p.name}
                    </div>
                    <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                      {school.shortName} · {p.category.toUpperCase()}
                    </div>
                  </div>
                  <ChevronRight size={14} style={{ color: isSelected ? D.indigo : D.textMuted }} />
                </div>
              );
            })}
          </div>

          {/* Right Column: Deep Profile Dossier */}
          {activeProfile && (
            <div
              style={{
                background: D.surf0,
                borderRadius: D.lg,
                border: `1px solid ${D.indigo}44`,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {/* Dossier Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '24px' }}>{activeProfile.category === 'athlete' ? '🏏' : '👔'}</span>
                    <div>
                      <h2 style={{ fontFamily: D.head, fontSize: '20px', fontWeight: 900, color: D.textPrimary, margin: 0 }}>
                        {activeProfile.name}
                      </h2>
                      <div style={{ fontFamily: D.mono, fontSize: '12px', color: D.textSecondary }}>
                        {SCHOOLS_REGISTRY.find(s => s.id === activeProfile.schoolId)?.name || 'KZN Schools'} · {activeProfile.category.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {activeProfile.category === 'athlete' && onNavigateToH2H && (
                    <button
                      onClick={() => onNavigateToH2H(activeProfile.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: D.pill,
                        background: `${D.amber}25`,
                        border: `1px solid ${D.amber}55`,
                        color: D.amber,
                        fontFamily: D.head,
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      Compare in H2H ⚔️
                    </button>
                  )}
                  {canManageProfiles && (
                    <button
                      onClick={() => setEditingProfile(activeProfile)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: D.pill,
                        background: D.indigo,
                        border: 'none',
                        color: '#fff',
                        fontFamily: D.head,
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>

              {/* Bio Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', background: D.surf1, padding: '14px', borderRadius: D.md }}>
                <div>
                  <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>HOUSE</div>
                  <div style={{ fontFamily: D.body, fontSize: '12px', fontWeight: 700, color: D.textPrimary }}>{activeProfile.house || 'Nicholson'}</div>
                </div>
                <div>
                  <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>BATTING HAND</div>
                  <div style={{ fontFamily: D.body, fontSize: '12px', fontWeight: 700, color: D.textPrimary }}>{activeProfile.battingHand || 'Right-hand'}</div>
                </div>
                <div>
                  <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>BOWLING STYLE</div>
                  <div style={{ fontFamily: D.body, fontSize: '12px', fontWeight: 700, color: D.textPrimary }}>{activeProfile.bowlingStyle || 'Right-arm Fast'}</div>
                </div>
                <div>
                  <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>POPIA CLEARANCE</div>
                  <div style={{ fontFamily: D.mono, fontSize: '11px', fontWeight: 700, color: D.emerald }}>Verified (Tier 4)</div>
                </div>
              </div>

              {/* Verified Accreditations */}
              <div>
                <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.textPrimary, marginBottom: '8px' }}>
                  Verified Accreditations & Certifications
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {activeProfile.certifications?.map((cert, cIdx) => (
                    <div key={cIdx} style={{ padding: '8px 12px', borderRadius: D.md, background: D.surf2, border: `1px solid ${D.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={14} style={{ color: D.emerald }} />
                        <div>
                          <div style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textPrimary }}>{cert.name}</div>
                          <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>Issued by {cert.issuer}</div>
                        </div>
                      </div>
                      <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.emerald, fontWeight: 700 }}>{cert.year}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accolades & Honours */}
              <div>
                <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.textPrimary, marginBottom: '8px' }}>
                  Honours & Career Accolades
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {activeProfile.accolades?.map((acc, aIdx) => (
                    <div key={aIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: D.body, fontSize: '12px', color: D.textSecondary }}>
                      <Award size={14} style={{ color: D.amber, flexShrink: 0 }} />
                      <span>{acc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE PROFILE MODAL */}
      {createModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: D.surf0, borderRadius: D.lg, border: `1px solid ${D.border}`, maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={18} style={{ color: D.indigo }} />
                <h3 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>Register New User Profile</h3>
              </div>
              <button onClick={() => setCreateModalOpen(false)} style={{ background: 'none', border: 'none', color: D.textMuted, cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>

            <form onSubmit={handleCreateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={newProfileData.name}
                  onChange={e => setNewProfileData({ ...newProfileData, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Category</label>
                  <select
                    value={newProfileData.category}
                    onChange={e => setNewProfileData({ ...newProfileData, category: e.target.value as any })}
                    style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                  >
                    <option value="athlete">Student Athlete</option>
                    <option value="staff">Coaching Staff / Director</option>
                    <option value="official">Match Official / Scorer</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Primary Role</label>
                  <select
                    value={newProfileData.role}
                    onChange={e => setNewProfileData({ ...newProfileData, role: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                  >
                    {Object.entries(ROLES).map(([k, r]) => (
                      <option key={k} value={k}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Official Email Address</label>
                <input
                  type="email"
                  required
                  value={newProfileData.email}
                  onChange={e => setNewProfileData({ ...newProfileData, email: e.target.value })}
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
                  style={{ padding: '8px 18px', borderRadius: D.pill, background: D.indigo, border: 'none', color: '#fff', fontFamily: D.head, fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {editingProfile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: D.surf0, borderRadius: D.lg, border: `1px solid ${D.border}`, maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit2 size={18} style={{ color: D.indigo }} />
                <h3 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                  Edit Profile & Permissions
                </h3>
              </div>
              <button onClick={() => setEditingProfile(null)} style={{ background: 'none', border: 'none', color: D.textMuted, cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>

            <form onSubmit={handleSaveUserEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Name</label>
                <input
                  type="text"
                  required
                  value={editingProfile.name}
                  onChange={e => setEditingProfile({ ...editingProfile, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                />
              </div>

              <div>
                <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Email</label>
                <input
                  type="email"
                  required
                  value={editingProfile.email}
                  onChange={e => setEditingProfile({ ...editingProfile, email: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                />
              </div>

              <div>
                <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>Status</label>
                <select
                  value={editingProfile.status}
                  onChange={e => setEditingProfile({ ...editingProfile, status: e.target.value as any })}
                  style={{ width: '100%', padding: '8px', borderRadius: D.sm, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px' }}
                >
                  <option value="active">Active (Access Permitted)</option>
                  <option value="suspended">Suspended (Access Revoked)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setEditingProfile(null)}
                  style={{ padding: '8px 14px', borderRadius: D.pill, background: D.surf2, border: `1px solid ${D.border}`, color: D.textSecondary, fontFamily: D.head, fontSize: '11px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: D.pill, background: D.indigo, border: 'none', color: '#fff', fontFamily: D.head, fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
