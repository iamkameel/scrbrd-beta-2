'use client';

import React, { useState, useMemo } from 'react';
import { Theme, Player } from './types';
import { ROLES, SCHOOLS_REGISTRY, PLAYERS } from './data';
import { getSchoolSquads } from './multiSquadData';
import {
  Shield,
  Search,
  UserCheck,
  Edit2,
  Mail,
  Phone,
  Lock,
  CheckCircle2,
  AlertCircle,
  Award,
  BookOpen,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  Share2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Target,
  FileText,
  Clock,
  Swords,
  Zap,
  Star,
  Compass,
  MapPin,
  Calendar,
  Layers,
  Activity,
  CheckCircle,
  Copy,
  Printer
} from 'lucide-react';

export interface UserProfileItem {
  id: string;
  name: string;
  email: string;
  roles: string[];
  schoolId: string;
  assignedSquads?: string[];
  status: 'active' | 'suspended';
  phone?: string;
  isAthlete?: boolean;
  playerRef?: Player;
  title?: string;
  joinedYear?: number;
  accolades?: string[];
  certifications?: Array<{
    name: string;
    authority: string;
    licenseId: string;
    year: number;
    verified: boolean;
  }>;
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
  players?: Player[];
  initialSelectedProfileId?: string | null;
  onClearSelectedProfile?: () => void;
  onUpdateUser: (updatedUser: any) => void;
  currentRole: string;
  activeSchoolId: string;
  onOpenH2H?: (playerAId: string, playerBId?: string) => void;
  onTriggerToast: (msg: string) => void;
}

// Generate realistic certifications based on role
function getRoleCertifications(roleKey: string) {
  switch (roleKey) {
    case 'coach':
    case 'doc':
      return [
        { name: "Cricket South Africa (CSA) Level 3 High-Performance Coach", authority: "Cricket South Africa", licenseId: "CSA-COACH-8891-KZN", year: 2023, verified: true },
        { name: "BokSmart & World Rugby Concussion Protocol & Player Safety", authority: "SARU / BokSmart", licenseId: "BS-CONC-2025-412", year: 2025, verified: true },
        { name: "CSA Youth Talent Identification & Bio-Mechanics", authority: "CSA Coaching Academy", licenseId: "CSA-YTID-1044", year: 2024, verified: true },
        { name: "First Aid Level 2 & Sports Injury Triage", authority: "St John Ambulance South Africa", licenseId: "SJA-FA2-9981", year: 2024, verified: true }
      ];
    case 'scorer':
      return [
        { name: "CSA Accredited Level 2 Linear & Electronic Match Scorer", authority: "Cricket South Africa Scorers Assoc.", licenseId: "CSA-SCR-5521", year: 2024, verified: true },
        { name: "Scrbrd Live DLS & Telemetry Telecasting Operator", authority: "Scrbrd Digital Technologies", licenseId: "SCR-OPR-2025-09", year: 2025, verified: true },
        { name: "MCC Laws of Cricket Examination (Distinction)", authority: "Marylebone Cricket Club (MCC)", licenseId: "MCC-LAWS-2023-88", year: 2023, verified: true }
      ];
    case 'umpire':
      return [
        { name: "CSA Elite Panel School Umpire Accreditation Grade 1", authority: "Cricket South Africa Umpires Assoc.", licenseId: "CSA-UMP-7740", year: 2024, verified: true },
        { name: "Hawk-Eye DRS & Field Protocol Certification", authority: "CSA Match Officials Dept", licenseId: "DRS-KZN-331", year: 2025, verified: true },
        { name: "MCC Advanced Code of Laws & Disciplinary Sanctions", authority: "MCC Match Officials", licenseId: "MCC-DISC-901", year: 2023, verified: true }
      ];
    case 'groundskeeper':
      return [
        { name: "Turfgrass Management & Agronomy Specialist Diploma", authority: "Turfgrass Producers International / KZN", licenseId: "TPI-SA-CUR-819", year: 2023, verified: true },
        { name: "Clegg Impact Soil Compaction & Moisture Meter Accreditation", authority: "SA Sports Turf Agronomists", licenseId: "SAT-CLEGG-2024", year: 2024, verified: true },
        { name: "Sustainable Oval Water Conservation & Pitch Drainage", authority: "KZN Water Stewardship", licenseId: "KZN-TURF-552", year: 2025, verified: true }
      ];
    case 'headmaster':
    case 'schooladmin':
    case 'sportsmaster':
      return [
        { name: "Protection of Personal Information Act (POPIA) Compliance Officer", authority: "Information Regulator of SA", licenseId: "POPIA-EDU-2024-91", year: 2024, verified: true },
        { name: "SA Schools Sports Governance & Code of Conduct Certification", authority: "Department of Basic Education & SASCOC", licenseId: "SAS-GOV-882", year: 2023, verified: true },
        { name: "Minor Safeguarding & Child Protection in Interschool Sports", authority: "Childline SA / SA Sports Trust", licenseId: "SAFE-SPORT-2025", year: 2025, verified: true }
      ];
    case 'medical':
      return [
        { name: "HPCSA Registered Sports Physiotherapist & Rehabilitation", authority: "Health Professions Council of SA", licenseId: "HPCSA-PT-77612", year: 2022, verified: true },
        { name: "Advanced Trauma & Concussion Management in Youth Contact Sports", authority: "South African Sports Medicine Assoc.", licenseId: "SASMA-ATC-312", year: 2024, verified: true },
        { name: "Emergency Life Support & CPR BLS (Healthcare Provider)", authority: "Resuscitation Council of Southern Africa", licenseId: "RCSA-BLS-8812", year: 2025, verified: true }
      ];
    default:
      return [
        { name: "CSA School Cricket Governance & Ethics Certificate", authority: "Cricket South Africa", licenseId: "CSA-ETH-2024-11", year: 2024, verified: true },
        { name: "POPIA Minor Safeguarding in Sports Operations", authority: "KZN Schools Cricket Union", licenseId: "KZN-SAFE-2025", year: 2025, verified: true }
      ];
  }
}

// Generate realistic accolades based on role
function getRoleAccolades(roleKey: string, schoolName: string) {
  switch (roleKey) {
    case 'coach':
    case 'doc':
      return [
        `KZN Schools 1st XI Coach of the Year 2024`,
        `Sunfoil Schools Super League Title Winner with ${schoolName}`,
        `CSA National U17 Talent Developer of the Year Nominee`,
        `Over 15 Provincial Representatives Mentored into KZN Coastal / Inland Teams`
      ];
    case 'scorer':
      return [
        `CSA Premier Schools Match Scorer of the Year 2024`,
        `Flawless Digital Record Award (Zero Sync Discrepancies in 48 Matches)`,
        `Official Scorer for KZN Coastal Provincial U19 Trial Week`,
        `Scrbrd Certified Gold-Tier Linear Scorekeeper`
      ];
    case 'umpire':
      return [
        `KZN Umpires Association Official of the Season 2024`,
        `DRS Hawk-Eye Validation Accuracy: 96.8% (Premier Interschool Matches)`,
        `Lead Adjudicator: Hilton vs Michaelhouse 1st XI Derby 2025`,
        `Spirit of Cricket Fair Play Champion Award`
      ];
    case 'groundskeeper':
      return [
        `Goldstones / Bowden's Pitch Preparation Excellence Award 2024`,
        `Zero Weather-Related Abandonments (100% Drainage Efficiency Rating)`,
        `Average Pitch Curator Performance Rating: 9.6 / 10 across 34 Fixtures`,
        `Pace & Bounce Uniformity Certification - CSA Pitch Panel`
      ];
    default:
      return [
        `Institutional Service Honours at ${schoolName}`,
        `100% POPIA Compliance Audit Achievement Award 2024`,
        `KZN Inter-School Cricket Governance Award of Merit`
      ];
  }
}

// Generate athlete accolades
function getAthleteAccolades(p: Player, schoolName: string) {
  const accolades: string[] = [];
  if (p.avg > 40) {
    accolades.push(`Super League Century Club (112* vs Hilton College 2025)`);
    accolades.push(`Top Run-Scorer for ${schoolName} 1st XI (Average ${p.avg})`);
  } else if (p.avg > 30) {
    accolades.push(`Premier Match-Winning 50 in Derby Encounter`);
    accolades.push(`Middle-Order Anchor Award - 2025 Season`);
  }
  if (p.wkts > 10) {
    accolades.push(`Five-Wicket Haul Trophy (5/22 vs Maritzburg College)`);
    accolades.push(`Leading Wicket-Taker in Coastal Tier 1 Competition`);
  }
  if (p.cap === 'c' || p.cap === 'vc') {
    accolades.push(`${schoolName} 1st XI Captaincy Honours & Full Colours Blazer`);
    accolades.push(`KZN Schools Leadership & Sportsmanship Trophy 2025`);
  } else {
    accolades.push(`${schoolName} Cricket Full Colours Blazer`);
  }
  if (p.quotaEligible) {
    accolades.push(`Sunfoil Transformation Elite Academy Scholar`);
  }
  if (p.bursaryScholar) {
    accolades.push(`Bursary Trust Academic & Athletic High-Performance Scholar`);
  }
  accolades.push(`KZN Representative Squad Selection 2025/2026`);
  return accolades;
}

// Generate athlete certifications
function getAthleteCertifications(p: Player) {
  return [
    { name: "CSA Youth Leadership & Sports Ethics Certification", authority: "Cricket South Africa", licenseId: `CSA-YTH-${p.id.toUpperCase()}-25`, year: 2024, verified: true },
    { name: "BokSmart & CSA Concussion Safety & Injury Awareness", authority: "SARU / BokSmart", licenseId: `BS-ATH-${p.id.toUpperCase()}-2025`, year: 2025, verified: true },
    { name: "POPIA Minor Athlete Media & Performance Data Consent", authority: "KZN Schools Union / Department of Education", licenseId: `POP-ATH-${p.id.toUpperCase()}`, year: 2024, verified: true },
    ...(p.bursaryScholar ? [{ name: "High-Performance Athletic Bursary Award", authority: "South African Education & Sports Trust", licenseId: `HPB-2025-${p.id.toUpperCase()}`, year: 2025, verified: true }] : [])
  ];
}

export default function UserProfilesView({
  theme: D,
  users,
  players = PLAYERS,
  initialSelectedProfileId,
  onClearSelectedProfile,
  onUpdateUser,
  currentRole,
  activeSchoolId,
  onOpenH2H,
  onTriggerToast,
}: UserProfilesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  
  // Selected Profile for detailed view (Athlete or Staff)
  const [selectedProfile, setSelectedProfile] = useState<UserProfileItem | null>(() => {
    if (initialSelectedProfileId) {
      // Look in players
      const matchedPlayer = players.find(p => p.id === initialSelectedProfileId);
      if (matchedPlayer) {
        const pSchool = SCHOOLS_REGISTRY.find(s => s.id === matchedPlayer.school) || SCHOOLS_REGISTRY[0];
        return {
          id: matchedPlayer.id,
          name: matchedPlayer.name,
          email: `${matchedPlayer.name.toLowerCase().replace(/\s+/g, '.')}@${pSchool.name.toLowerCase().replace(/[^a-z]/g, '')}.co.za`,
          roles: ['player'],
          schoolId: matchedPlayer.school,
          assignedSquads: [matchedPlayer.team],
          status: 'active',
          isAthlete: true,
          playerRef: matchedPlayer,
          title: `Student Athlete · ${matchedPlayer.team} (${matchedPlayer.role})`,
          joinedYear: 2023,
          accolades: getAthleteAccolades(matchedPlayer, pSchool.name),
          certifications: getAthleteCertifications(matchedPlayer),
        };
      }
      const matchedUser = users.find(u => u.id === initialSelectedProfileId);
      if (matchedUser) {
        const uSchool = SCHOOLS_REGISTRY.find(s => s.id === matchedUser.schoolId) || SCHOOLS_REGISTRY[0];
        const primaryRole = matchedUser.roles[0] || 'coach';
        return {
          ...matchedUser,
          isAthlete: false,
          title: ROLES[primaryRole]?.label || primaryRole,
          joinedYear: 2021,
          accolades: getRoleAccolades(primaryRole, uSchool.name),
          certifications: getRoleCertifications(primaryRole),
        };
      }
    }
    return null;
  });

  const [editingUser, setEditingUser] = useState<any | null>(null);

  const activeSchool = SCHOOLS_REGISTRY.find(s => s.id === activeSchoolId) || SCHOOLS_REGISTRY[0];
  const schoolSquads = useMemo(() => getSchoolSquads(activeSchoolId), [activeSchoolId]);

  // RBAC check: Can current user edit profiles?
  const canManageProfiles = ['superadmin', 'schooladmin', 'sportsmaster', 'doc', 'headmaster'].includes(currentRole);

  // Combine Staff and Student Athletes into a comprehensive unified directory
  const allProfiles: UserProfileItem[] = useMemo(() => {
    const staffList: UserProfileItem[] = users.map(u => {
      const uSchool = SCHOOLS_REGISTRY.find(s => s.id === u.schoolId) || activeSchool;
      const primaryRole = u.roles[0] || 'coach';
      return {
        ...u,
        isAthlete: false,
        title: ROLES[primaryRole]?.label || primaryRole,
        joinedYear: 2022,
        accolades: getRoleAccolades(primaryRole, uSchool.name),
        certifications: getRoleCertifications(primaryRole),
      };
    });

    const athleteList: UserProfileItem[] = players.map(p => {
      const pSchool = SCHOOLS_REGISTRY.find(s => s.id === p.school) || activeSchool;
      const emailLocal = p.name.toLowerCase().replace(/[^a-z0-9]/g, '.');
      const domain = pSchool.shortName.toLowerCase().replace(/[^a-z0-9]/g, '');
      return {
        id: p.id,
        name: p.name,
        email: `${emailLocal}@${domain}.edu.za`,
        roles: ['player'],
        schoolId: p.school,
        assignedSquads: [p.team],
        status: 'active',
        phone: `+27 (0)31 ${200 + (p.name.length * 17) % 800}-${1000 + (p.name.length * 131) % 9000}`,
        isAthlete: true,
        playerRef: p,
        title: `Student Athlete · ${p.team} (${p.role === 'BAT' ? 'Batsman' : p.role === 'BOWL' ? 'Bowler' : p.role === 'ALL' ? 'All-Rounder' : 'Wicketkeeper'})`,
        joinedYear: 2022 + (p.age === 18 ? 0 : p.age === 17 ? 1 : 2),
        accolades: getAthleteAccolades(p, pSchool.name),
        certifications: getAthleteCertifications(p),
      };
    });

    return [...athleteList, ...staffList];
  }, [users, players, activeSchool]);

  // Filter profiles based on selected filters
  const filteredProfiles = useMemo(() => {
    return allProfiles.filter(p => {
      // 1. School scope check
      if (schoolFilter !== 'all') {
        if (p.schoolId !== schoolFilter) return false;
      }

      // 2. Category check
      if (categoryFilter === 'athletes' && !p.isAthlete) return false;
      if (categoryFilter === 'staff' && p.isAthlete) return false;
      if (categoryFilter === 'coaches' && (!p.roles.includes('coach') && !p.roles.includes('doc'))) return false;
      if (categoryFilter === 'officials' && !p.roles.includes('umpire')) return false;
      if (categoryFilter === 'scorers' && !p.roles.includes('scorer')) return false;
      if (categoryFilter === 'curators' && !p.roles.includes('groundskeeper')) return false;
      if (categoryFilter === 'admin' && (!p.roles.includes('schooladmin') && !p.roles.includes('headmaster') && !p.roles.includes('sportsmaster') && !p.roles.includes('superadmin'))) return false;

      // 3. Role check
      if (roleFilter !== 'all') {
        if (!p.roles.includes(roleFilter)) return false;
      }

      // 4. Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesEmail = p.email.toLowerCase().includes(q);
        const matchesTitle = p.title?.toLowerCase().includes(q);
        const matchesSchool = p.schoolId.toLowerCase().includes(q);
        const matchesPlayerRole = p.playerRef?.role.toLowerCase().includes(q);
        const matchesHometown = p.playerRef?.hometown?.toLowerCase().includes(q);
        const matchesAccolade = p.accolades?.some(a => a.toLowerCase().includes(q));
        if (!matchesName && !matchesEmail && !matchesTitle && !matchesSchool && !matchesPlayerRole && !matchesHometown && !matchesAccolade) {
          return false;
        }
      }

      return true;
    });
  }, [allProfiles, schoolFilter, categoryFilter, roleFilter, searchQuery]);

  // Counts for tabs
  const categoryCounts = useMemo(() => {
    return {
      all: allProfiles.length,
      athletes: allProfiles.filter(p => p.isAthlete).length,
      coaches: allProfiles.filter(p => p.roles.includes('coach') || p.roles.includes('doc')).length,
      officials: allProfiles.filter(p => p.roles.includes('umpire')).length,
      scorers: allProfiles.filter(p => p.roles.includes('scorer')).length,
      curators: allProfiles.filter(p => p.roles.includes('groundskeeper')).length,
      admin: allProfiles.filter(p => p.roles.includes('schooladmin') || p.roles.includes('headmaster') || p.roles.includes('sportsmaster') || p.roles.includes('superadmin')).length,
    };
  }, [allProfiles]);

  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    onUpdateUser(editingUser);
    // update local state if needed
    if (selectedProfile && selectedProfile.id === editingUser.id) {
      setSelectedProfile({
        ...selectedProfile,
        ...editingUser,
      });
    }
    setEditingUser(null);
    onTriggerToast(`User profile for ${editingUser.name} successfully updated!`);
  };

  const toggleUserRole = (roleKey: string) => {
    if (!editingUser) return;
    const currentRoles = editingUser.roles || [];
    if (currentRoles.includes(roleKey)) {
      if (currentRoles.length > 1) {
        setEditingUser({ ...editingUser, roles: currentRoles.filter((r: string) => r !== roleKey) });
      }
    } else {
      setEditingUser({ ...editingUser, roles: [...currentRoles, roleKey] });
    }
  };

  const toggleAssignedSquad = (squadId: string) => {
    if (!editingUser) return;
    const currentSquads = editingUser.assignedSquads || [];
    if (currentSquads.includes(squadId)) {
      setEditingUser({ ...editingUser, assignedSquads: currentSquads.filter((s: string) => s !== squadId) });
    } else {
      setEditingUser({ ...editingUser, assignedSquads: [...currentSquads, squadId] });
    }
  };

  const openProfileDetail = (item: UserProfileItem) => {
    setSelectedProfile(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeProfileDetail = () => {
    setSelectedProfile(null);
    if (onClearSelectedProfile) onClearSelectedProfile();
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER DEDICATED INDIVIDUAL PROFILE PAGE VIEW
  // ─────────────────────────────────────────────────────────────
  if (selectedProfile) {
    const profSchool = SCHOOLS_REGISTRY.find(s => s.id === selectedProfile.schoolId) || activeSchool;
    const pRef = selectedProfile.playerRef;
    const isAthlete = selectedProfile.isAthlete;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Breadcrumb Navigation Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            background: D.surf1,
            padding: '10px 16px',
            borderRadius: D.lg,
            border: `1px solid ${D.border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontFamily: D.mono }}>
            <button
              onClick={closeProfileDetail}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: D.surf2,
                border: `1px solid ${D.border}`,
                borderRadius: D.sm,
                padding: '4px 10px',
                color: D.textPrimary,
                cursor: 'pointer',
                fontFamily: D.mono,
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              <ArrowLeft size={13} />
              <span>Back to Directory</span>
            </button>
            <span style={{ color: D.textMuted }}>/</span>
            <span
              onClick={closeProfileDetail}
              style={{ color: D.textMuted, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Profiles Directory
            </span>
            <span style={{ color: D.textMuted }}>/</span>
            <span style={{ color: D.textMuted }}>{profSchool.shortName}</span>
            <span style={{ color: D.textMuted }}>/</span>
            <span style={{ color: D.indigo, fontWeight: 700 }}>{selectedProfile.name}</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {isAthlete && pRef && onOpenH2H && (
              <button
                onClick={() => onOpenH2H(pRef.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: D.indigo,
                  color: '#fff',
                  border: 'none',
                  borderRadius: D.pill,
                  padding: '6px 14px',
                  fontFamily: D.head,
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                <Swords size={13} />
                <span>Compare in H2H</span>
              </button>
            )}

            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                onTriggerToast(`Dossier URL for ${selectedProfile.name} copied to clipboard!`);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: D.surf2,
                color: D.textPrimary,
                border: `1px solid ${D.border}`,
                borderRadius: D.pill,
                padding: '6px 12px',
                fontFamily: D.mono,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Share2 size={13} />
              <span>Share Dossier</span>
            </button>
          </div>
        </div>

        {/* Hero Header Banner */}
        <div
          style={{
            borderRadius: D.xl,
            background: `linear-gradient(135deg, ${D.surf1} 0%, ${D.surf0} 100%)`,
            border: `1px solid ${D.borderMed}`,
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle background glow */}
          <div
            style={{
              position: 'absolute',
              top: '-60px',
              right: '-60px',
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              background: `${D.indigo}15`,
              filter: 'blur(50px)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              {/* Avatar / Crest Icon */}
              <div
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${D.indigo} 0%, ${D.sky} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  fontWeight: 900,
                  color: '#fff',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                  border: `3px solid ${D.surf0}`,
                }}
              >
                {selectedProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h1 style={{ fontFamily: D.head, fontSize: '24px', fontWeight: 900, color: D.textPrimary, margin: 0 }}>
                    {selectedProfile.name}
                  </h1>
                  {pRef?.cap && (
                    <span style={{ padding: '2px 8px', borderRadius: D.pill, background: `${D.amber}25`, color: D.amber, fontFamily: D.mono, fontSize: '10px', fontWeight: 800 }}>
                      {pRef.cap === 'c' ? 'CAPTAIN' : 'VICE-CAPTAIN'}
                    </span>
                  )}
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: D.pill,
                      background: selectedProfile.status === 'active' ? `${D.emerald}20` : `${D.rose}20`,
                      color: selectedProfile.status === 'active' ? D.emerald : D.rose,
                      fontFamily: D.mono,
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    ● {selectedProfile.status}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap', fontFamily: D.head, fontSize: '13px', color: D.textSecondary }}>
                  <span style={{ fontWeight: 800, color: D.indigo }}>{profSchool.crestIcon} {profSchool.name}</span>
                  <span>·</span>
                  <span style={{ color: D.textPrimary }}>{selectedProfile.title}</span>
                  {pRef && (
                    <>
                      <span>·</span>
                      <span style={{ fontFamily: D.mono, color: D.textMuted }}>Age {pRef.age} (Grade {pRef.academicGrade || 11})</span>
                    </>
                  )}
                </div>

                {/* Tags Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {pRef?.bursaryScholar && (
                    <span style={{ padding: '2px 8px', borderRadius: D.pill, background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', fontFamily: D.mono, fontSize: '10px', fontWeight: 700 }}>
                      🎓 Bursary Scholar
                    </span>
                  )}
                  {pRef?.quotaEligible && (
                    <span style={{ padding: '2px 8px', borderRadius: D.pill, background: `${D.emerald}20`, color: D.emerald, fontFamily: D.mono, fontSize: '10px', fontWeight: 700 }}>
                      🇿🇦 SA Transformation Pathway
                    </span>
                  )}
                  <span style={{ padding: '2px 8px', borderRadius: D.pill, background: D.surf2, color: D.textMuted, fontFamily: D.mono, fontSize: '10px' }}>
                    POPIA Consent: Verified & Stored
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Contact & Info Card */}
            <div style={{ background: D.surf2, padding: '14px 18px', borderRadius: D.lg, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: D.mono, fontSize: '11px', color: D.textSecondary }}>
                <Mail size={13} color={D.sky} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedProfile.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: D.mono, fontSize: '11px', color: D.textSecondary }}>
                <Phone size={13} color={D.emerald} />
                <span>{selectedProfile.phone || '+27 (0)31 765 2100'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: D.mono, fontSize: '11px', color: D.textSecondary }}>
                <MapPin size={13} color={D.amber} />
                <span>{pRef?.hometown || profSchool.city}, South Africa</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── ATHLETE SPECIFIC OR STAFF SPECIFIC STATS ───────── */}
        {isAthlete && pRef && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Primary Batting & Bowling Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '14px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, textAlign: 'center' }}>
                <div style={{ fontFamily: D.mono, fontSize: '24px', fontWeight: 800, color: D.indigo }}>{pRef.avg}</div>
                <div style={{ fontFamily: D.head, fontSize: '10px', color: D.textMuted, marginTop: '2px', textTransform: 'uppercase' }}>Batting Average</div>
              </div>
              <div style={{ padding: '14px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, textAlign: 'center' }}>
                <div style={{ fontFamily: D.mono, fontSize: '24px', fontWeight: 800, color: D.sky }}>{pRef.sr}</div>
                <div style={{ fontFamily: D.head, fontSize: '10px', color: D.textMuted, marginTop: '2px', textTransform: 'uppercase' }}>Strike Rate</div>
              </div>
              <div style={{ padding: '14px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, textAlign: 'center' }}>
                <div style={{ fontFamily: D.mono, fontSize: '24px', fontWeight: 800, color: D.emerald }}>{pRef.careerTotals?.runs || Math.round(pRef.avg * 18)}</div>
                <div style={{ fontFamily: D.head, fontSize: '10px', color: D.textMuted, marginTop: '2px', textTransform: 'uppercase' }}>Total Runs</div>
              </div>
              <div style={{ padding: '14px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, textAlign: 'center' }}>
                <div style={{ fontFamily: D.mono, fontSize: '24px', fontWeight: 800, color: D.amber }}>{pRef.careerTotals?.hs || Math.round(pRef.avg * 2.2)}*</div>
                <div style={{ fontFamily: D.head, fontSize: '10px', color: D.textMuted, marginTop: '2px', textTransform: 'uppercase' }}>High Score</div>
              </div>
              <div style={{ padding: '14px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, textAlign: 'center' }}>
                <div style={{ fontFamily: D.mono, fontSize: '24px', fontWeight: 800, color: D.rose }}>{pRef.wkts}</div>
                <div style={{ fontFamily: D.head, fontSize: '10px', color: D.textMuted, marginTop: '2px', textTransform: 'uppercase' }}>Season Wickets</div>
              </div>
              <div style={{ padding: '14px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, textAlign: 'center' }}>
                <div style={{ fontFamily: D.mono, fontSize: '24px', fontWeight: 800, color: D.teal }}>{pRef.econ ? `${pRef.econ} rpo` : '—'}</div>
                <div style={{ fontFamily: D.head, fontSize: '10px', color: D.textMuted, marginTop: '2px', textTransform: 'uppercase' }}>Bowling Economy</div>
              </div>
            </div>

            {/* Profile Dossier Split: Technical Bio & Match Logs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Technical Specifications */}
              <div style={{ padding: '20px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={16} color={D.indigo} />
                  <span>Technical & Physical Profile</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontFamily: D.mono, fontSize: '11px' }}>
                  <div style={{ padding: '8px 12px', background: D.surf2, borderRadius: D.md }}>
                    <span style={{ color: D.textMuted }}>Batting Hand:</span>{' '}
                    <strong style={{ color: D.textPrimary }}>{pRef.batHand === 'R' ? 'Right-Hand Bat' : 'Left-Hand Bat'}</strong>
                  </div>
                  <div style={{ padding: '8px 12px', background: D.surf2, borderRadius: D.md }}>
                    <span style={{ color: D.textMuted }}>Bowling Style:</span>{' '}
                    <strong style={{ color: D.textPrimary }}>{pRef.bowlArm === 'R' ? 'Right-Arm' : 'Left-Arm'} {pRef.bowlStyle === 'F' ? 'Fast' : pRef.bowlStyle === 'M' ? 'Medium' : 'Spin'}</strong>
                  </div>
                  <div style={{ padding: '8px 12px', background: D.surf2, borderRadius: D.md }}>
                    <span style={{ color: D.textMuted }}>House at School:</span>{' '}
                    <strong style={{ color: D.textPrimary }}>{pRef.houseAtSchool || 'Founders'}</strong>
                  </div>
                  <div style={{ padding: '8px 12px', background: D.surf2, borderRadius: D.md }}>
                    <span style={{ color: D.textMuted }}>Batting Position:</span>{' '}
                    <strong style={{ color: D.textPrimary }}>No. {pRef.battingPos || 1}</strong>
                  </div>
                  <div style={{ padding: '8px 12px', background: D.surf2, borderRadius: D.md }}>
                    <span style={{ color: D.textMuted }}>Height / Weight:</span>{' '}
                    <strong style={{ color: D.textPrimary }}>{pRef.height || '182cm'} · {pRef.weight || '74kg'}</strong>
                  </div>
                  <div style={{ padding: '8px 12px', background: D.surf2, borderRadius: D.md }}>
                    <span style={{ color: D.textMuted }}>Demographic / Quota:</span>{' '}
                    <strong style={{ color: D.textPrimary }}>{pRef.saDemographic || 'Generic'}</strong>
                  </div>
                </div>

                {pRef.bio && (
                  <div style={{ padding: '12px', background: D.surf2, borderRadius: D.md, fontFamily: D.body, fontSize: '12px', color: D.textSecondary, lineHeight: 1.6 }}>
                    <strong style={{ color: D.textPrimary }}>Coach Scouting Note:</strong> {pRef.bio}
                  </div>
                )}
              </div>

              {/* Recent Match Performances */}
              <div style={{ padding: '20px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={16} color={D.emerald} />
                  <span>Recent 1st XI Match Log</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { opp: 'Hilton College', runs: '74*', balls: 52, wkts: '1/18', ground: "Bowden's Oval", result: 'Won by 4 wkts' },
                    { opp: 'Michaelhouse', runs: '48', balls: 38, wkts: '0/22', ground: 'Meadows Oval', result: 'Won by 14 runs' },
                    { opp: 'Maritzburg College', runs: '89', balls: 64, wkts: '2/14', ground: 'Goldstones', result: 'Won by 38 runs' },
                    { opp: 'Durban High School (DHS)', runs: '32', balls: 24, wkts: '1/30', ground: 'The Oval', result: 'Lost by 2 wkts' },
                  ].map((m, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: D.surf2, borderRadius: D.md, fontSize: '11px' }}>
                      <div>
                        <strong style={{ fontFamily: D.head, color: D.textPrimary }}>vs {m.opp}</strong>
                        <div style={{ fontFamily: D.mono, color: D.textMuted, fontSize: '10px' }}>{m.ground}</div>
                      </div>
                      <div style={{ textAlign: 'right', fontFamily: D.mono }}>
                        <div style={{ color: D.indigo, fontWeight: 700 }}>
                          {pRef.role === 'BOWL' ? `Figures: ${m.wkts}` : `${m.runs} (${m.balls}b)`}
                        </div>
                        <div style={{ color: m.result.startsWith('Won') ? D.emerald : D.rose, fontSize: '10px' }}>
                          {m.result}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STAFF / COACH SPECIFIC STATS ───────────────────── */}
        {!isAthlete && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '18px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, textAlign: 'center' }}>
              <div style={{ fontFamily: D.mono, fontSize: '26px', fontWeight: 800, color: D.indigo }}>42</div>
              <div style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, marginTop: '4px', textTransform: 'uppercase' }}>Fixtures Overseen</div>
            </div>
            <div style={{ padding: '18px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, textAlign: 'center' }}>
              <div style={{ fontFamily: D.mono, fontSize: '26px', fontWeight: 800, color: D.emerald }}>78.6%</div>
              <div style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, marginTop: '4px', textTransform: 'uppercase' }}>Institutional Win Rate</div>
            </div>
            <div style={{ padding: '18px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, textAlign: 'center' }}>
              <div style={{ fontFamily: D.mono, fontSize: '26px', fontWeight: 800, color: D.sky }}>{selectedProfile.assignedSquads?.length || 1}</div>
              <div style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, marginTop: '4px', textTransform: 'uppercase' }}>Assigned School Squads</div>
            </div>
            <div style={{ padding: '18px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, textAlign: 'center' }}>
              <div style={{ fontFamily: D.mono, fontSize: '26px', fontWeight: 800, color: D.amber }}>100%</div>
              <div style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, marginTop: '4px', textTransform: 'uppercase' }}>POPIA Safeguarding Audit</div>
            </div>
          </div>
        )}

        {/* ── AWARDS & ACCOLADES SECTION ──────────────────────── */}
        <div style={{ padding: '22px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} color={D.amber} />
              <h3 style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                Official Awards, Honours & Accolades ({selectedProfile.accolades?.length || 0})
              </h3>
            </div>
            <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
              Institutional & Provincial Records
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
            {selectedProfile.accolades?.map((acc, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 16px',
                  background: D.surf2,
                  borderRadius: D.md,
                  border: `1px solid ${D.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: `${D.amber}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    flexShrink: 0,
                  }}
                >
                  🏆
                </div>
                <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary }}>
                  {acc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── QUALIFICATIONS & CERTIFICATIONS SECTION ─────────── */}
        <div style={{ padding: '22px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GraduationCap size={18} color={D.indigo} />
              <h3 style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                Accredited Qualifications & Verified Certifications ({selectedProfile.certifications?.length || 0})
              </h3>
            </div>
            <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.emerald, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} />
              All Credentials Verified & Current
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
            {selectedProfile.certifications?.map((cert, idx) => (
              <div
                key={idx}
                style={{
                  padding: '14px',
                  background: D.surf2,
                  borderRadius: D.md,
                  border: `1px solid ${D.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
                    {cert.name}
                  </div>
                  <span style={{ padding: '1px 6px', borderRadius: D.pill, background: `${D.emerald}20`, color: D.emerald, fontFamily: D.mono, fontSize: '9px', fontWeight: 700 }}>
                    VERIFIED
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: D.mono, fontSize: '10px', color: D.textMuted, borderTop: `1px dashed ${D.border}`, paddingTop: '6px' }}>
                  <span>Issuing Body: {cert.authority}</span>
                  <span>Year: {cert.year}</span>
                </div>

                <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.indigo }}>
                  Reg: {cert.licenseId}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RBAC / EDIT ACCESS BUTTON (FOR STAFF) ────────────── */}
        {!isAthlete && canManageProfiles && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
            <button
              onClick={() => setEditingUser({ ...selectedProfile, assignedSquads: selectedProfile.assignedSquads || [], roles: [...selectedProfile.roles] })}
              style={{
                padding: '8px 18px',
                borderRadius: D.pill,
                border: 'none',
                background: D.indigo,
                color: '#fff',
                fontFamily: D.head,
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Edit2 size={13} />
              <span>Edit Staff Roles & Permissions</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER DIRECTORY LIST / CARD VIEW
  // ─────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div
        style={{
          padding: '20px 24px',
          borderRadius: D.lg,
          background: `linear-gradient(135deg, ${D.indigo}18 0%, ${D.surf1} 100%)`,
          border: `1px solid ${D.indigo}33`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>👤</span>
            <div>
              <h1 style={{ fontFamily: D.head, fontSize: '20px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                {activeSchool.name} · Complete Profiles & Talent Directory
              </h1>
              <p style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted, margin: '2px 0 0' }}>
                Every student athlete, coach, official, and administrator with individual dossiers, stats, awards, and verified qualifications.
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: D.textMuted }} />
            <input
              type="text"
              placeholder="Search by name, role, school, stats..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: D.pill,
                background: D.surf2,
                border: `1px solid ${D.border}`,
                color: D.textPrimary,
                fontFamily: D.body,
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>

          {/* School Selector */}
          <select
            value={schoolFilter}
            onChange={e => setSchoolFilter(e.target.value)}
            style={{
              padding: '8px 12px',
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
            <option value="all">All Schools ({SCHOOLS_REGISTRY.length})</option>
            {SCHOOLS_REGISTRY.map(s => (
              <option key={s.id} value={s.id}>{s.crestIcon} {s.shortName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          borderBottom: `1px solid ${D.border}`,
        }}
      >
        {[
          { id: 'all', label: '🌟 All Profiles', count: categoryCounts.all },
          { id: 'athletes', label: '🏏 Student Athletes', count: categoryCounts.athletes },
          { id: 'coaches', label: '👔 Coaches & Directors', count: categoryCounts.coaches },
          { id: 'officials', label: '⚖️ Umpires & Officials', count: categoryCounts.officials },
          { id: 'scorers', label: '📝 Digital Scorers', count: categoryCounts.scorers },
          { id: 'curators', label: '🌿 Grounds Curators', count: categoryCounts.curators },
          { id: 'admin', label: '🛡️ School Leadership & Governance', count: categoryCounts.admin },
        ].map(cat => {
          const isActive = categoryFilter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: D.pill,
                background: isActive ? D.indigo : D.surf1,
                color: isActive ? '#fff' : D.textSecondary,
                border: `1px solid ${isActive ? D.indigo : D.border}`,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{cat.label}</span>
              <span
                style={{
                  padding: '1px 6px',
                  borderRadius: D.pill,
                  background: isActive ? 'rgba(255,255,255,0.2)' : D.surf2,
                  fontSize: '10px',
                  fontFamily: D.mono,
                  fontWeight: 700,
                }}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Counter and Results Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontFamily: D.mono, color: D.textMuted }}>
        <span>Showing <strong>{filteredProfiles.length}</strong> matching profiles</span>
        <span>Click "View Full Profile ↗" to inspect complete dossier, accolades, and certifications</span>
      </div>

      {/* Profiles Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {filteredProfiles.map(item => {
          const itemSchool = SCHOOLS_REGISTRY.find(s => s.id === item.schoolId) || activeSchool;
          const p = item.playerRef;

          return (
            <div
              key={item.id}
              style={{
                background: D.surf0,
                borderRadius: D.lg,
                border: `1px solid ${D.border}`,
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
              }}
            >
              <div>
                {/* Card Top: Avatar, Name & School */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: item.isAthlete ? `linear-gradient(135deg, ${D.indigo}, ${D.sky})` : `linear-gradient(135deg, ${D.emerald}, ${D.teal})`,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '14px',
                        fontFamily: D.head,
                        flexShrink: 0,
                      }}
                    >
                      {item.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h3 style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                        {item.name}
                      </h3>
                      <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted, marginTop: '2px' }}>
                        {itemSchool.crestIcon} {itemSchool.shortName} · {item.assignedSquads?.[0] || 'Staff'}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: D.pill,
                      background: item.isAthlete ? `${D.indigo}20` : `${D.emerald}20`,
                      color: item.isAthlete ? D.indigo : D.emerald,
                      fontFamily: D.mono,
                      fontSize: '9px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.isAthlete ? (p?.role || 'ATHLETE') : (item.roles[0] || 'STAFF')}
                  </span>
                </div>

                {/* Subtitle / Playing Role */}
                <div style={{ marginTop: '10px', fontSize: '11px', fontFamily: D.body, color: D.textSecondary }}>
                  {item.title}
                </div>

                {/* Metrics Preview for Athletes vs Staff */}
                {item.isAthlete && p ? (
                  <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', background: D.surf2, padding: '8px', borderRadius: D.md, textAlign: 'center' }}>
                    <div>
                      <div style={{ fontFamily: D.mono, fontSize: '13px', fontWeight: 800, color: D.indigo }}>{p.avg}</div>
                      <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>Avg</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: D.mono, fontSize: '13px', fontWeight: 800, color: D.sky }}>{p.sr}</div>
                      <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>SR</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: D.mono, fontSize: '13px', fontWeight: 800, color: D.emerald }}>{p.careerTotals?.runs || Math.round(p.avg * 16)}</div>
                      <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>Runs</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: D.mono, fontSize: '13px', fontWeight: 800, color: D.rose }}>{p.wkts}</div>
                      <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>Wkts</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: '10px', padding: '8px 10px', background: D.surf2, borderRadius: D.md, fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                    <div>Licence: {item.certifications?.[0]?.licenseId || 'CSA-REG-2024'}</div>
                    <div style={{ color: D.emerald, marginTop: '2px' }}>✓ {item.certifications?.length || 2} Verified Accreditations</div>
                  </div>
                )}

                {/* Badges / Accolade Snippet */}
                <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {item.accolades?.[0] && (
                    <span style={{ padding: '2px 8px', borderRadius: D.pill, background: `${D.amber}15`, color: D.amber, fontFamily: D.head, fontSize: '9px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Award size={11} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                        {item.accolades[0]}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ paddingTop: '10px', borderTop: `1px solid ${D.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => openProfileDetail(item)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: D.pill,
                    border: `1px solid ${D.indigo}`,
                    background: `${D.indigo}15`,
                    color: D.indigo,
                    fontFamily: D.head,
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>View Full Profile</span>
                  <ChevronRight size={13} />
                </button>

                <div style={{ display: 'flex', gap: '4px' }}>
                  {item.isAthlete && onOpenH2H && (
                    <button
                      onClick={() => onOpenH2H(item.id)}
                      title="Compare in H2H"
                      style={{
                        padding: '6px 10px',
                        borderRadius: D.pill,
                        border: `1px solid ${D.border}`,
                        background: D.surf2,
                        color: D.textPrimary,
                        fontFamily: D.head,
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Swords size={12} />
                      <span>H2H</span>
                    </button>
                  )}

                  {!item.isAthlete && canManageProfiles && (
                    <button
                      onClick={() => setEditingUser({ ...item, assignedSquads: item.assignedSquads || [], roles: [...item.roles] })}
                      title="Edit Roles"
                      style={{
                        padding: '6px 10px',
                        borderRadius: D.pill,
                        border: `1px solid ${D.border}`,
                        background: D.surf2,
                        color: D.textSecondary,
                        fontFamily: D.head,
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      <Edit2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── EDIT PROFILE MODAL (Sportsmaster / Admin) ──────────────── */}
      {editingUser && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: D.surf0,
              borderRadius: D.lg,
              border: `1px solid ${D.border}`,
              maxWidth: '600px',
              width: '100%',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                  Manage User Profile: {editingUser.name}
                </h3>
                <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted, marginTop: '2px' }}>
                  {editingUser.email} · {activeSchool.name}
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                style={{ background: 'none', border: 'none', color: D.textMuted, fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Status */}
              <div>
                <label style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textSecondary, display: 'block', marginBottom: '6px' }}>
                  Account Status
                </label>
                <select
                  value={editingUser.status}
                  onChange={e => setEditingUser({ ...editingUser, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: D.md,
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    color: D.textPrimary,
                    fontFamily: D.body,
                    fontSize: '12px',
                    outline: 'none',
                  }}
                >
                  <option value="active">Active (Full Access)</option>
                  <option value="suspended">Suspended (Access Revoked)</option>
                </select>
              </div>

              {/* Roles / Permissions Checkboxes */}
              <div>
                <label style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textSecondary, display: 'block', marginBottom: '8px' }}>
                  Assigned Roles & Permissions (Multi-Role Support)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px', maxHeight: '180px', overflowY: 'auto', padding: '8px', background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}` }}>
                  {Object.entries(ROLES).map(([key, r]) => {
                    const isChecked = editingUser.roles.includes(key);
                    return (
                      <label
                        key={key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          fontFamily: D.body,
                          fontSize: '11px',
                          color: D.textPrimary,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleUserRole(key)}
                          style={{ accentColor: D.indigo }}
                        />
                        <span>{r.icon} {r.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Team / Squad Assignments */}
              <div>
                <label style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textSecondary, display: 'block', marginBottom: '8px' }}>
                  Assigned Teams / Squads (Coaching & Management)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px', maxHeight: '160px', overflowY: 'auto', padding: '8px', background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}` }}>
                  {schoolSquads.map(sq => {
                    const isAssigned = (editingUser.assignedSquads || []).includes(sq.id);
                    return (
                      <label
                        key={sq.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          fontFamily: D.mono,
                          fontSize: '10px',
                          color: D.textPrimary,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          onChange={() => toggleAssignedSquad(sq.id)}
                          style={{ accentColor: D.emerald }}
                        />
                        <span>{sq.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: D.pill,
                    border: `1px solid ${D.border}`,
                    background: 'transparent',
                    color: D.textSecondary,
                    fontFamily: D.head,
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 20px',
                    borderRadius: D.pill,
                    border: 'none',
                    background: D.indigo,
                    color: '#fff',
                    fontFamily: D.head,
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
