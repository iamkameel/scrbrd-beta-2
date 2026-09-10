'use client';

import React, { useState, useMemo } from 'react';
import { Theme, SchoolRegistryItem, Player } from './types';
import { SCHOOLS_REGISTRY, PLAYERS, ROLES, POPIA_POLICIES } from './data';
import {
  Shield, Edit2, Plus, Search, Filter,
  CheckCircle2, AlertCircle, Mail, Phone, Lock,
  Unlock, FileSpreadsheet, Download, RefreshCw, X,
  BadgeCheck, Award, Eye, Trash2, SlidersHorizontal,
  LayoutGrid, List
} from 'lucide-react';

export type RegisterTab = 'schools' | 'athletes' | 'umpires' | 'scorers' | 'coaches';

export interface UmpireRecord {
  id: string;
  name: string;
  badgeNumber: string;
  association: string;
  region: 'Coastal' | 'Midlands' | 'Inland' | 'Provincial / Neutral';
  csaLevel: 'Level 1' | 'Level 2' | 'Level 3' | 'ICC / CSA Elite Panel';
  matchesOfficiated: number;
  disciplinaryReports: number;
  expiryDate: string;
  status: 'Available' | 'Appointed' | 'On Leave' | 'Suspended';
  phone: string;
  email: string;
  preferredVenues: string[];
  lastAssignedFixture?: string;
}

export interface ScorerRecord {
  id: string;
  name: string;
  schoolId: string;
  tokenCode: string;
  certification: 'CSA Level 1 Digital' | 'CSA Level 2 DLS Master' | 'Linear Scorebook Specialist' | 'CricClubs Certified';
  preferredTerminal: 'iPad Pro' | 'MacBook' | 'Surface Pro' | 'Android Tablet' | 'Linear Book';
  matchesLogged: number;
  status: 'Active' | 'Available' | 'Assigned' | 'Offline';
  phone: string;
  email: string;
  appointedSquads: string[];
}

export interface CoachRecord {
  id: string;
  name: string;
  schoolId: string;
  roleTitle: string;
  csaLevel: 'Level 1' | 'Level 2' | 'Level 3 HP' | 'Level 4 Elite';
  assignedSquad: string;
  bokSmartExpiry: string;
  sapsClearance: 'Verified (Cleared)' | 'Renewal Required' | 'In Progress';
  experienceYears: number;
  status: 'Active' | 'On Leave' | 'Suspended';
  phone: string;
  email: string;
  specialization: 'Head Coach' | 'Batting Specialist' | 'Pace Bowling' | 'Spin Bowling' | 'Fielding & Wicketkeeping' | 'S&C / High Performance';
}

const INITIAL_UMPIRES: UmpireRecord[] = [
  {
    id: "ump_1",
    name: "Shaun George",
    badgeNumber: "KZNCUA-EL-014",
    association: "KZN Cricket Umpires Association (Coastal)",
    region: "Coastal",
    csaLevel: "ICC / CSA Elite Panel",
    matchesOfficiated: 142,
    disciplinaryReports: 3,
    expiryDate: "2027-12-31",
    status: "Available",
    phone: "+27 82 555 0192",
    email: "sgeorge@kzncricket.co.za",
    preferredVenues: ["Bowden's Field Oval", "The Memorial Ground", "Riverside Complex"],
    lastAssignedFixture: "Westville vs DHS (1st XI)",
  },
  {
    id: "ump_2",
    name: "Adrian Holdstock",
    badgeNumber: "INLAND-EL-009",
    association: "Inland Umpires Board (PMB)",
    region: "Inland",
    csaLevel: "ICC / CSA Elite Panel",
    matchesOfficiated: 128,
    disciplinaryReports: 1,
    expiryDate: "2027-08-31",
    status: "Appointed",
    phone: "+27 83 440 9811",
    email: "aholdstock@inlandcricket.org.za",
    preferredVenues: ["Goldstones Oval", "Weightman-Smith Oval", "Roy Gathorne Oval"],
    lastAssignedFixture: "Hilton vs Maritzburg College (1st XI)",
  },
  {
    id: "ump_3",
    name: "Bongani Jele",
    badgeNumber: "KZNCUA-L3-082",
    association: "KZN Cricket Umpires Association (Coastal)",
    region: "Coastal",
    csaLevel: "Level 3",
    matchesOfficiated: 84,
    disciplinaryReports: 0,
    expiryDate: "2026-11-30",
    status: "Available",
    phone: "+27 84 991 2230",
    email: "bjele@kznc-umpires.org.za",
    preferredVenues: ["Dixons Oval", "Founders Field Oval", "AH Smith Oval"],
    lastAssignedFixture: "Glenwood vs Kearsney (1st XI)",
  },
  {
    id: "ump_4",
    name: "Stephen Harris",
    badgeNumber: "MIDLANDS-L2-044",
    association: "Midlands Independent Schools Panel",
    region: "Midlands",
    csaLevel: "Level 2",
    matchesOfficiated: 96,
    disciplinaryReports: 2,
    expiryDate: "2026-10-15",
    status: "Available",
    phone: "+27 82 312 8847",
    email: "sharris@midlands-schools.co.za",
    preferredVenues: ["Roy Gathorne Oval", "Weightman-Smith Oval", "Meadow's Oval"],
    lastAssignedFixture: "Michaelhouse vs Clifton (1st XI)",
  },
  {
    id: "ump_5",
    name: "Arno Jacobs",
    badgeNumber: "KZNCUA-L2-105",
    association: "Inland Umpires Board",
    region: "Inland",
    csaLevel: "Level 2",
    matchesOfficiated: 62,
    disciplinaryReports: 0,
    expiryDate: "2026-09-30",
    status: "Available",
    phone: "+27 71 883 4902",
    email: "ajacobs@inlandcricket.org.za",
    preferredVenues: ["Goldstones Oval", "Barns Field", "Roy Couzens Oval"],
    lastAssignedFixture: "Maritzburg College vs Northwood (1st XI)",
  },
  {
    id: "ump_6",
    name: "Sipho Ndaba",
    badgeNumber: "KZNCUA-L1-218",
    association: "KZN Coastal Development Panel",
    region: "Coastal",
    csaLevel: "Level 1",
    matchesOfficiated: 38,
    disciplinaryReports: 0,
    expiryDate: "2026-12-15",
    status: "On Leave",
    phone: "+27 79 120 7461",
    email: "sndaba@kzncu-dev.org.za",
    preferredVenues: ["Commons Field", "Seabreeze Oval", "Top Field"],
    lastAssignedFixture: "Westville 2nd XI vs DHS 2nd XI",
  },
];

const INITIAL_SCORERS: ScorerRecord[] = [
  {
    id: "sco_1",
    name: "Brian Wessels",
    schoolId: "WES",
    tokenCode: "WBHS-SCR-8812",
    certification: "CSA Level 2 DLS Master",
    preferredTerminal: "iPad Pro",
    matchesLogged: 184,
    status: "Active",
    phone: "+27 82 771 9044",
    email: "bwessels@wbhs.co.za",
    appointedSquads: ["1st XI", "2nd XI", "U16A"],
  },
  {
    id: "sco_2",
    name: "Patricia Mkhize",
    schoolId: "HIL",
    tokenCode: "HIL-SCR-4029",
    certification: "CSA Level 2 DLS Master",
    preferredTerminal: "MacBook",
    matchesLogged: 132,
    status: "Active",
    phone: "+27 83 220 8911",
    email: "pmkhize@hiltoncollege.com",
    appointedSquads: ["1st XI", "U16A"],
  },
  {
    id: "sco_3",
    name: "David Campbell",
    schoolId: "MIC",
    tokenCode: "MIC-SCR-1904",
    certification: "CSA Level 2 DLS Master",
    preferredTerminal: "iPad Pro",
    matchesLogged: 118,
    status: "Available",
    phone: "+27 82 994 3012",
    email: "dcampbell@michaelhouse.org",
    appointedSquads: ["1st XI", "2nd XI"],
  },
  {
    id: "sco_4",
    name: "Nomvula Sithole",
    schoolId: "MCB",
    tokenCode: "MCB-SCR-7721",
    certification: "CSA Level 1 Digital",
    preferredTerminal: "Surface Pro",
    matchesLogged: 92,
    status: "Active",
    phone: "+27 76 540 1198",
    email: "nsithole@mcollege.co.za",
    appointedSquads: ["1st XI", "U15A"],
  },
  {
    id: "sco_5",
    name: "Kevin Pillay",
    schoolId: "DHS",
    tokenCode: "DHS-SCR-3382",
    certification: "CSA Level 2 DLS Master",
    preferredTerminal: "iPad Pro",
    matchesLogged: 145,
    status: "Active",
    phone: "+27 84 332 9011",
    email: "kpillay@durbanhighschool.co.za",
    appointedSquads: ["1st XI", "2nd XI"],
  },
  {
    id: "sco_6",
    name: "Grant Meyer",
    schoolId: "KEA",
    tokenCode: "KEA-SCR-6102",
    certification: "CSA Level 2 DLS Master",
    preferredTerminal: "MacBook",
    matchesLogged: 104,
    status: "Available",
    phone: "+27 83 711 4409",
    email: "gmeyer@kearsney.com",
    appointedSquads: ["1st XI", "U16A"],
  },
  {
    id: "sco_7",
    name: "Bradley Peterson",
    schoolId: "NOR",
    tokenCode: "NOR-SCR-5091",
    certification: "CSA Level 1 Digital",
    preferredTerminal: "Android Tablet",
    matchesLogged: 67,
    status: "Available",
    phone: "+27 72 884 5501",
    email: "bpeterson@northwoodschool.co.za",
    appointedSquads: ["1st XI", "U15A"],
  },
];

const INITIAL_COACHES: CoachRecord[] = [
  {
    id: "cch_1",
    name: "Craig Hendricks",
    schoolId: "WES",
    roleTitle: "Director of Cricket / 1st XI Head Coach",
    csaLevel: "Level 3 HP",
    assignedSquad: "1st XI",
    bokSmartExpiry: "2027-02-15",
    sapsClearance: "Verified (Cleared)",
    experienceYears: 16,
    status: "Active",
    phone: "+27 82 449 1102",
    email: "craig.hendricks@wbhs.co.za",
    specialization: "Head Coach",
  },
  {
    id: "cch_2",
    name: "Dale Benkenstein",
    schoolId: "HIL",
    roleTitle: "Director of Cricket / 1st XI Lead",
    csaLevel: "Level 4 Elite",
    assignedSquad: "1st XI",
    bokSmartExpiry: "2027-06-30",
    sapsClearance: "Verified (Cleared)",
    experienceYears: 24,
    status: "Active",
    phone: "+27 83 911 3004",
    email: "dbenkenstein@hiltoncollege.com",
    specialization: "Head Coach",
  },
  {
    id: "cch_3",
    name: "Murray McDonald",
    schoolId: "MIC",
    roleTitle: "Director of Cricket",
    csaLevel: "Level 3 HP",
    assignedSquad: "1st XI",
    bokSmartExpiry: "2026-11-30",
    sapsClearance: "Verified (Cleared)",
    experienceYears: 14,
    status: "Active",
    phone: "+27 82 990 4118",
    email: "mmcdonald@michaelhouse.org",
    specialization: "Head Coach",
  },
  {
    id: "cch_4",
    name: "Kyle Nipper",
    schoolId: "MCB",
    roleTitle: "Director of Cricket / 1st XI Coach",
    csaLevel: "Level 3 HP",
    assignedSquad: "1st XI",
    bokSmartExpiry: "2027-04-10",
    sapsClearance: "Verified (Cleared)",
    experienceYears: 12,
    status: "Active",
    phone: "+27 84 221 8890",
    email: "knipper@mcollege.co.za",
    specialization: "Head Coach",
  },
  {
    id: "cch_5",
    name: "Fabian Lazarus",
    schoolId: "DHS",
    roleTitle: "Head of Cricket",
    csaLevel: "Level 3 HP",
    assignedSquad: "1st XI",
    bokSmartExpiry: "2026-12-15",
    sapsClearance: "Verified (Cleared)",
    experienceYears: 15,
    status: "Active",
    phone: "+27 82 667 4301",
    email: "flazarus@durbanhighschool.co.za",
    specialization: "Head Coach",
  },
  {
    id: "cch_6",
    name: "Andre van Zyl",
    schoolId: "KEA",
    roleTitle: "Head of Cricket",
    csaLevel: "Level 3 HP",
    assignedSquad: "1st XI",
    bokSmartExpiry: "2027-01-20",
    sapsClearance: "Verified (Cleared)",
    experienceYears: 18,
    status: "Active",
    phone: "+27 83 450 1198",
    email: "avanzyl@kearsney.com",
    specialization: "Head Coach",
  },
  {
    id: "cch_7",
    name: "Dean Abrahams",
    schoolId: "WES",
    roleTitle: "Lead Batting Coach",
    csaLevel: "Level 3 HP",
    assignedSquad: "2nd XI / U16A",
    bokSmartExpiry: "2026-10-31",
    sapsClearance: "Verified (Cleared)",
    experienceYears: 11,
    status: "Active",
    phone: "+27 83 902 4410",
    email: "dean.abrahams@wbhs.co.za",
    specialization: "Batting Specialist",
  },
  {
    id: "cch_8",
    name: "Greg Ford",
    schoolId: "HIL",
    roleTitle: "Pace Bowling & S&C Coach",
    csaLevel: "Level 2",
    assignedSquad: "U16A",
    bokSmartExpiry: "2027-03-31",
    sapsClearance: "Verified (Cleared)",
    experienceYears: 9,
    status: "Active",
    phone: "+27 82 119 7802",
    email: "gford@hiltoncollege.com",
    specialization: "Pace Bowling",
  },
  {
    id: "cch_9",
    name: "Morné van Vuuren",
    schoolId: "NOR",
    roleTitle: "Director of Cricket",
    csaLevel: "Level 3 HP",
    assignedSquad: "1st XI",
    bokSmartExpiry: "2027-05-15",
    sapsClearance: "Verified (Cleared)",
    experienceYears: 17,
    status: "Active",
    phone: "+27 82 334 9912",
    email: "mvanvuuren@northwoodschool.co.za",
    specialization: "Head Coach",
  },
];

interface RegisterHubViewProps {
  theme: Theme;
  activeSchoolId: string;
  currentRole: string;
  onTriggerToast: (msg: string) => void;
  onNavigateToH2H?: (p1Id?: string, p2Id?: string) => void;
  onSelectPlayerProfile?: (player: Player) => void;
  onNavigateToSquad?: () => void;
  onNavigateToProfiles?: () => void;
  onOpenSchoolProfile?: (schoolId: string) => void;
}

export default function RegisterHubView({
  theme: D,
  activeSchoolId,
  currentRole,
  onTriggerToast,
  onNavigateToH2H,
  onSelectPlayerProfile,
  onNavigateToSquad,
  onNavigateToProfiles,
  onOpenSchoolProfile,
}: RegisterHubViewProps) {
  const [activeTab, setActiveTab] = useState<RegisterTab>('schools');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [schoolFilter, setSchoolFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Local State Registers
  const [schools, setSchools] = useState<SchoolRegistryItem[]>(SCHOOLS_REGISTRY);
  const [athletes, setAthletes] = useState<Player[]>(PLAYERS);
  const [umpires, setUmpires] = useState<UmpireRecord[]>(INITIAL_UMPIRES);
  const [scorers, setScorers] = useState<ScorerRecord[]>(INITIAL_SCORERS);
  const [coaches, setCoaches] = useState<CoachRecord[]>(INITIAL_COACHES);

  // Edit / Create Modal State
  const [editingItem, setEditingItem] = useState<{ type: RegisterTab; data: any } | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [modalFormData, setModalFormData] = useState<any>({});

  // RBAC Permission Evaluator
  const rbacInfo = useMemo(() => {
    const isSuper = currentRole === 'superadmin';
    const isSchoolAdmin = currentRole === 'schooladmin' || currentRole === 'headmaster' || currentRole === 'doc';
    const isCoach = currentRole === 'headcoach' || currentRole === 'coach';
    const isMedical = currentRole === 'medical';
    const isScorer = currentRole === 'scorer';
    const isUmpire = currentRole === 'umpire';
    const isPlayer = currentRole === 'player';
    const isParent = currentRole === 'parent';
    const isScout = currentRole === 'scout';

    let tierLabel = "Viewer (Read Only)";
    let badgeColor = D.textMuted;
    let editSummary = "You have view-only access to published register records.";

    if (isSuper) {
      tierLabel = "Root Administrator (Level 4)";
      badgeColor = D.violet;
      editSummary = "Full platform authority. You can create, edit, reassign, and delete any record across all schools & officials.";
    } else if (isSchoolAdmin) {
      tierLabel = "Institutional Controller (Level 3)";
      badgeColor = D.indigo;
      editSummary = `School Admin rights for ${activeSchoolId}. You can manage all athletes, coaches, and staff registered to your institution.`;
    } else if (isCoach) {
      tierLabel = "Technical Coach (Level 2)";
      badgeColor = D.emerald;
      editSummary = `Coaching rights for ${activeSchoolId}. You can update squad tiers, playing roles, and skill ratings for your players.`;
    } else if (isMedical) {
      tierLabel = "Clinical Medical (Level 4 Medical)";
      badgeColor = D.rose;
      editSummary = "Physiotherapy & welfare authority. You can certify Return-to-Play and update medical clearance statuses.";
    } else if (isScorer) {
      tierLabel = "Match Scorer (Level 1)";
      badgeColor = D.amber;
      editSummary = "Scorer credentials. You can update your scoring terminal preferences and match availability.";
    } else if (isUmpire) {
      tierLabel = "Match Official (Level 2)";
      badgeColor = D.cyan;
      editSummary = "Umpire panel rights. You can update your availability, preferred venues, and contact numbers.";
    }

    return {
      isSuper,
      isSchoolAdmin,
      isCoach,
      isMedical,
      isScorer,
      isUmpire,
      isPlayer,
      isParent,
      isScout,
      tierLabel,
      badgeColor,
      editSummary,
    };
  }, [currentRole, activeSchoolId, D]);

  // Check if current user can edit a specific item
  const canEditItem = (tab: RegisterTab, item: any): boolean => {
    if (rbacInfo.isSuper) return true;

    if (tab === 'schools') {
      if (rbacInfo.isSchoolAdmin && item.id === activeSchoolId) return true;
      return false;
    }

    if (tab === 'athletes') {
      if (rbacInfo.isSchoolAdmin && item.school === activeSchoolId) return true;
      if (rbacInfo.isCoach && item.school === activeSchoolId) return true;
      if (rbacInfo.isMedical && item.school === activeSchoolId) return true;
      if (rbacInfo.isPlayer && item.id === 'w1') return true; // Simulated own player
      return false;
    }

    if (tab === 'coaches') {
      if (rbacInfo.isSchoolAdmin && item.schoolId === activeSchoolId) return true;
      if (rbacInfo.isCoach && item.schoolId === activeSchoolId) return true;
      return false;
    }

    if (tab === 'scorers') {
      if (rbacInfo.isSchoolAdmin && item.schoolId === activeSchoolId) return true;
      if (rbacInfo.isScorer && item.schoolId === activeSchoolId) return true;
      return false;
    }

    if (tab === 'umpires') {
      if (rbacInfo.isSuper) return true;
      if (rbacInfo.isUmpire && item.id === 'ump_1') return true;
      return false;
    }

    return false;
  };

  const canCreateInTab = (tab: RegisterTab): boolean => {
    if (rbacInfo.isSuper) return true;
    if (tab === 'athletes' || tab === 'coaches' || tab === 'scorers') {
      return rbacInfo.isSchoolAdmin;
    }
    return false;
  };

  // Open Edit Modal
  const handleOpenEdit = (type: RegisterTab, item: any) => {
    setEditingItem({ type, data: item });
    setIsCreatingNew(false);
    setModalFormData({ ...item });
  };

  // Open Create Modal
  const handleOpenCreate = (type: RegisterTab) => {
    setIsCreatingNew(true);
    let initialData: any = {};
    if (type === 'schools') {
      initialData = {
        id: `SCH_${Date.now().toString().slice(-4)}`,
        name: '',
        shortName: '',
        city: 'Durban',
        province: 'KwaZulu-Natal',
        region: 'Coastal',
        colors: ['#000000', '#ffffff'],
        motto: '',
        crestIcon: '🏫',
        founded: 2026,
        headOfCricket: '',
        fields: ['Main Oval'],
        mainOval: 'Main Oval',
        trophies: [],
        stats: { titles: 0, winRate: '0%', provincialReps: 0, activePlayers: 0, leaguePos: 'N/A', form: ['W'] },
        derbyRival: '',
        derbyName: '',
        about: '',
      };
    } else if (type === 'athletes') {
      initialData = {
        id: `ath_${Date.now()}`,
        name: '',
        school: rbacInfo.isSuper ? 'WES' : activeSchoolId,
        team: '1st XI',
        role: 'BAT',
        batHand: 'R',
        bowlArm: 'R',
        bowlStyle: 'M',
        age: 17,
        fitness: 'fit',
        avg: 0,
        sr: 100,
        wkts: 0,
        econ: 0,
        hometown: 'Durban',
        houseAtSchool: 'Founders',
        bio: 'Registered student athlete for the current season.',
        academicGrade: 'Grade 11',
      };
    } else if (type === 'umpires') {
      initialData = {
        id: `ump_${Date.now()}`,
        name: '',
        badgeNumber: `KZNCUA-L2-${Math.floor(100 + Math.random() * 900)}`,
        association: 'KZN Cricket Umpires Association',
        region: 'Coastal',
        csaLevel: 'Level 2',
        matchesOfficiated: 0,
        disciplinaryReports: 0,
        expiryDate: '2027-12-31',
        status: 'Available',
        phone: '+27 ',
        email: '',
        preferredVenues: ['Main Oval'],
      };
    } else if (type === 'scorers') {
      initialData = {
        id: `sco_${Date.now()}`,
        name: '',
        schoolId: rbacInfo.isSuper ? 'WES' : activeSchoolId,
        tokenCode: `${activeSchoolId}-SCR-${Math.floor(1000 + Math.random() * 9000)}`,
        certification: 'CSA Level 1 Digital',
        preferredTerminal: 'iPad Pro',
        matchesLogged: 0,
        status: 'Active',
        phone: '+27 ',
        email: '',
        appointedSquads: ['1st XI'],
      };
    } else if (type === 'coaches') {
      initialData = {
        id: `cch_${Date.now()}`,
        name: '',
        schoolId: rbacInfo.isSuper ? 'WES' : activeSchoolId,
        roleTitle: 'Squad Coach',
        csaLevel: 'Level 2',
        assignedSquad: '1st XI',
        bokSmartExpiry: '2027-12-31',
        sapsClearance: 'Verified (Cleared)',
        experienceYears: 5,
        status: 'Active',
        phone: '+27 ',
        email: '',
        specialization: 'Batting Specialist',
      };
    }
    setEditingItem({ type, data: initialData });
    setModalFormData(initialData);
  };

  // Save Modal
  const handleSaveModal = () => {
    if (!editingItem) return;
    const { type } = editingItem;

    if (type === 'schools') {
      if (isCreatingNew) {
        setSchools(prev => [modalFormData, ...prev]);
        onTriggerToast(`Registered school ${modalFormData.name} to the Circuit Directory.`);
      } else {
        setSchools(prev => prev.map(s => s.id === modalFormData.id ? modalFormData : s));
        onTriggerToast(`Updated school details for ${modalFormData.name}.`);
      }
    } else if (type === 'athletes') {
      if (isCreatingNew) {
        setAthletes(prev => [modalFormData, ...prev]);
        onTriggerToast(`Athlete ${modalFormData.name} added to ${modalFormData.school} register.`);
      } else {
        setAthletes(prev => prev.map(a => a.id === modalFormData.id ? modalFormData : a));
        onTriggerToast(`Updated athlete profile for ${modalFormData.name}.`);
      }
    } else if (type === 'umpires') {
      if (isCreatingNew) {
        setUmpires(prev => [modalFormData, ...prev]);
        onTriggerToast(`Umpire ${modalFormData.name} added to officiating register.`);
      } else {
        setUmpires(prev => prev.map(u => u.id === modalFormData.id ? modalFormData : u));
        onTriggerToast(`Updated umpire accreditation details for ${modalFormData.name}.`);
      }
    } else if (type === 'scorers') {
      if (isCreatingNew) {
        setScorers(prev => [modalFormData, ...prev]);
        onTriggerToast(`Scorer ${modalFormData.name} registered with token ${modalFormData.tokenCode}.`);
      } else {
        setScorers(prev => prev.map(sc => sc.id === modalFormData.id ? modalFormData : sc));
        onTriggerToast(`Updated scoring profile for ${modalFormData.name}.`);
      }
    } else if (type === 'coaches') {
      if (isCreatingNew) {
        setCoaches(prev => [modalFormData, ...prev]);
        onTriggerToast(`Coach ${modalFormData.name} appointed to ${modalFormData.assignedSquad}.`);
      } else {
        setCoaches(prev => prev.map(c => c.id === modalFormData.id ? modalFormData : c));
        onTriggerToast(`Updated coaching credentials for ${modalFormData.name}.`);
      }
    }

    setEditingItem(null);
  };

  // Delete Record
  const handleDeleteItem = (type: RegisterTab, id: string, name: string) => {
    if (!rbacInfo.isSuper && !rbacInfo.isSchoolAdmin) {
      onTriggerToast("Permission Denied: Only Superadmins or School Admins can remove register entries.");
      return;
    }

    if (type === 'schools') {
      setSchools(prev => prev.filter(s => s.id !== id));
    } else if (type === 'athletes') {
      setAthletes(prev => prev.filter(a => a.id !== id));
    } else if (type === 'umpires') {
      setUmpires(prev => prev.filter(u => u.id !== id));
    } else if (type === 'scorers') {
      setScorers(prev => prev.filter(s => s.id !== id));
    } else if (type === 'coaches') {
      setCoaches(prev => prev.filter(c => c.id !== id));
    }

    setEditingItem(null);
    onTriggerToast(`Removed ${name} from ${type} register.`);
  };

  // Export CSV
  const handleExportCSV = () => {
    let rows: string[] = [];
    let filename = `scrbrd_${activeTab}_register.csv`;

    if (activeTab === 'schools') {
      rows.push("ID,Name,ShortName,City,Region,HeadOfCricket,MainOval,ActivePlayers");
      schools.forEach(s => rows.push(`"${s.id}","${s.name}","${s.shortName}","${s.city}","${s.region}","${s.headOfCricket}","${s.mainOval}","${s.stats.activePlayers}"`));
    } else if (activeTab === 'athletes') {
      rows.push("ID,Name,School,Team,Role,BatHand,BowlArm,BowlStyle,Age,Fitness,Avg,Wkts");
      athletes.forEach(a => rows.push(`"${a.id}","${a.name}","${a.school}","${a.team}","${a.role}","${a.batHand}","${a.bowlArm}","${a.bowlStyle}","${a.age}","${a.fitness}","${a.avg}","${a.wkts}"`));
    } else if (activeTab === 'umpires') {
      rows.push("ID,Name,BadgeNumber,Association,Region,CSALevel,Matches,DisciplinaryReports,Expiry,Status");
      umpires.forEach(u => rows.push(`"${u.id}","${u.name}","${u.badgeNumber}","${u.association}","${u.region}","${u.csaLevel}","${u.matchesOfficiated}","${u.disciplinaryReports}","${u.expiryDate}","${u.status}"`));
    } else if (activeTab === 'scorers') {
      rows.push("ID,Name,School,TokenCode,Certification,Terminal,MatchesLogged,Status");
      scorers.forEach(sc => rows.push(`"${sc.id}","${sc.name}","${sc.schoolId}","${sc.tokenCode}","${sc.certification}","${sc.preferredTerminal}","${sc.matchesLogged}","${sc.status}"`));
    } else if (activeTab === 'coaches') {
      rows.push("ID,Name,School,RoleTitle,CSALevel,AssignedSquad,BokSmartExpiry,SAPSStatus,ExperienceYears");
      coaches.forEach(c => rows.push(`"${c.id}","${c.name}","${c.schoolId}","${c.roleTitle}","${c.csaLevel}","${c.assignedSquad}","${c.bokSmartExpiry}","${c.sapsClearance}","${c.experienceYears}"`));
    }

    const blob = new Blob([rows.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onTriggerToast(`Exported ${activeTab.toUpperCase()} master register to CSV.`);
  };

  // Filtered lists
  const filteredSchools = useMemo(() => {
    return schools.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.headOfCricket.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSchool = schoolFilter === 'ALL' || s.id === schoolFilter;
      return matchesSearch && matchesSchool;
    });
  }, [schools, searchQuery, schoolFilter]);

  const filteredAthletes = useMemo(() => {
    return athletes.filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.hometown && a.hometown.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesSchool = schoolFilter === 'ALL' || a.school === schoolFilter;
      const matchesStatus = statusFilter === 'ALL' || a.fitness === statusFilter;
      return matchesSearch && matchesSchool && matchesStatus;
    });
  }, [athletes, searchQuery, schoolFilter, statusFilter]);

  const filteredUmpires = useMemo(() => {
    return umpires.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.badgeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.association.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.csaLevel.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [umpires, searchQuery, statusFilter]);

  const filteredScorers = useMemo(() => {
    return scorers.filter(sc => {
      const matchesSearch = sc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sc.tokenCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sc.certification.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSchool = schoolFilter === 'ALL' || sc.schoolId === schoolFilter;
      const matchesStatus = statusFilter === 'ALL' || sc.status === statusFilter;
      return matchesSearch && matchesSchool && matchesStatus;
    });
  }, [scorers, searchQuery, schoolFilter, statusFilter]);

  const filteredCoaches = useMemo(() => {
    return coaches.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.csaLevel.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSchool = schoolFilter === 'ALL' || c.schoolId === schoolFilter;
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      return matchesSearch && matchesSchool && matchesStatus;
    });
  }, [coaches, searchQuery, schoolFilter, statusFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner / Master Header */}
      <div
        style={{
          background: D.surf1,
          border: `1px solid ${D.border}`,
          borderRadius: D.lg,
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '24px' }}>📑</span>
            <h1 style={{ fontFamily: D.head, fontSize: '22px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
              KZN Circuit Master Register
            </h1>
            <span
              style={{
                fontFamily: D.mono,
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: D.pill,
                background: `${rbacInfo.badgeColor}22`,
                color: rbacInfo.badgeColor,
                border: `1px solid ${rbacInfo.badgeColor}44`,
              }}
            >
              {rbacInfo.tierLabel}
            </span>
          </div>
          <p style={{ fontFamily: D.body, fontSize: '13px', color: D.textMuted, margin: 0, maxWidth: '750px' }}>
            Official institutional register for KZN interschool cricket. Regulated by Role-Based Access Control (RBAC) and POPIA data protection guidelines.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportCSV}
            style={{
              padding: '8px 14px',
              borderRadius: D.sm,
              background: D.surf2,
              border: `1px solid ${D.border}`,
              color: D.textPrimary,
              fontFamily: D.head,
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
            title="Download CSV export of active register"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          {canCreateInTab(activeTab) && (
            <button
              onClick={() => handleOpenCreate(activeTab)}
              style={{
                padding: '8px 16px',
                borderRadius: D.sm,
                background: D.emerald,
                border: 'none',
                color: '#ffffff',
                fontFamily: D.head,
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <Plus size={15} />
              <span>
                Register New {activeTab === 'schools' ? 'School' : activeTab === 'athletes' ? 'Athlete' : activeTab === 'umpires' ? 'Umpire' : activeTab === 'scorers' ? 'Scorer' : 'Coach'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* RBAC Permission Advisory Strip */}
      <div
        style={{
          background: `${rbacInfo.badgeColor}12`,
          border: `1px solid ${rbacInfo.badgeColor}33`,
          borderRadius: D.md,
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {rbacInfo.isSuper ? <Shield size={18} color={rbacInfo.badgeColor} /> : <Lock size={18} color={rbacInfo.badgeColor} />}
          <div>
            <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: D.textPrimary }}>
              Current Permission Scope: <span style={{ color: rbacInfo.badgeColor }}>{ROLES[currentRole]?.label || currentRole}</span> ({activeSchoolId})
            </div>
            <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted }}>
              {rbacInfo.editSummary}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
          <span>POPIA Sensitivity Max: <strong>Level {POPIA_POLICIES[currentRole]?.sensitivityMax ?? 2}</strong></span>
          <span>Access Scope: <strong>{POPIA_POLICIES[currentRole]?.scope ?? 'school'}</strong></span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          borderBottom: `1px solid ${D.border}`,
          paddingBottom: '2px',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'schools', label: 'Schools Register', icon: '🏫', count: schools.length },
          { id: 'athletes', label: 'Athletes Register', icon: '🏃', count: athletes.length },
          { id: 'umpires', label: 'Umpires & Match Officials', icon: '⚖️', count: umpires.length },
          { id: 'scorers', label: 'Official Scorers', icon: '📝', count: scorers.length },
          { id: 'coaches', label: 'Coaching & Technical Staff', icon: '🧢', count: coaches.length },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as RegisterTab);
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              style={{
                padding: '10px 18px',
                borderRadius: `${D.md} ${D.md} 0 0`,
                background: isActive ? D.surf1 : 'transparent',
                border: 'none',
                borderBottom: isActive ? `2px solid ${D.emerald}` : '2px solid transparent',
                color: isActive ? D.textPrimary : D.textMuted,
                fontFamily: D.head,
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                style={{
                  fontFamily: D.mono,
                  fontSize: '10px',
                  padding: '1px 6px',
                  borderRadius: D.pill,
                  background: isActive ? `${D.emerald}25` : D.surf2,
                  color: isActive ? D.emerald : D.textMuted,
                  fontWeight: 700,
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          background: D.surf0,
          padding: '12px 16px',
          borderRadius: D.md,
          border: `1px solid ${D.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: D.surf1,
              border: `1px solid ${D.border}`,
              borderRadius: D.sm,
              padding: '6px 12px',
              flex: 1,
            }}
          >
            <Search size={15} color={D.textMuted} />
            <input
              type="text"
              placeholder={`Search ${activeTab} by name, role, license, or keyword...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: D.textPrimary,
                fontFamily: D.body,
                fontSize: '13px',
                width: '100%',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: D.textMuted, cursor: 'pointer', padding: 0 }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Secondary Filters & View Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {activeTab !== 'umpires' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>School:</span>
              <select
                value={schoolFilter}
                onChange={(e) => setSchoolFilter(e.target.value)}
                style={{
                  background: D.surf1,
                  border: `1px solid ${D.border}`,
                  borderRadius: D.sm,
                  padding: '6px 10px',
                  color: D.textPrimary,
                  fontFamily: D.head,
                  fontSize: '12px',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">All Schools ({SCHOOLS_REGISTRY.length})</option>
                {SCHOOLS_REGISTRY.map(s => (
                  <option key={s.id} value={s.id}>{s.shortName}</option>
                ))}
              </select>
            </div>
          )}

          {activeTab === 'athletes' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>Fitness:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  background: D.surf1,
                  border: `1px solid ${D.border}`,
                  borderRadius: D.sm,
                  padding: '6px 10px',
                  color: D.textPrimary,
                  fontFamily: D.head,
                  fontSize: '12px',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="fit">Fit / Cleared</option>
                <option value="injured">Injured / Under Care</option>
                <option value="rehab">In Rehabilitation</option>
              </select>
            </div>
          )}

          {activeTab === 'umpires' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  background: D.surf1,
                  border: `1px solid ${D.border}`,
                  borderRadius: D.sm,
                  padding: '6px 10px',
                  color: D.textPrimary,
                  fontFamily: D.head,
                  fontSize: '12px',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Appointed">Appointed</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          )}

          {/* View Mode Toggle: Cards vs List */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: D.surf1,
              border: `1px solid ${D.border}`,
              borderRadius: D.pill,
              padding: '3px',
              gap: '2px',
            }}
          >
            <button
              onClick={() => setViewMode('card')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                borderRadius: D.pill,
                background: viewMode === 'card' ? `${D.emerald}22` : 'transparent',
                border: `1px solid ${viewMode === 'card' ? D.emerald : 'transparent'}`,
                color: viewMode === 'card' ? D.emerald : D.textMuted,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="Card Grid View"
            >
              <LayoutGrid size={13} />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                borderRadius: D.pill,
                background: viewMode === 'list' ? `${D.emerald}22` : 'transparent',
                border: `1px solid ${viewMode === 'list' ? D.emerald : 'transparent'}`,
                color: viewMode === 'list' ? D.emerald : D.textMuted,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="Compact List / Table View"
            >
              <List size={13} />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB CONTENT: 1. SCHOOLS REGISTER */}
      {activeTab === 'schools' && (
        viewMode === 'card' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
            {filteredSchools.map(school => {
              const canEdit = canEditItem('schools', school);
              return (
                <div
                  key={school.id}
                  style={{
                    background: D.surf1,
                    border: `1px solid ${school.id === activeSchoolId ? D.emerald : D.border}`,
                    borderRadius: D.lg,
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: D.md,
                          background: school.colors[0],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '22px',
                          border: `1px solid ${school.colors[1]}44`,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        }}
                      >
                        {school.crestIcon}
                      </div>
                      <div>
                        <div style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 700, color: D.textPrimary }}>
                          {school.name}
                        </div>
                        <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                          {school.city} · {school.region} Region · Est. {school.founded}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {canEdit ? (
                        <button
                          onClick={() => handleOpenEdit('schools', school)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: D.sm,
                            background: D.surf2,
                            border: `1px solid ${D.border}`,
                            color: D.textPrimary,
                            cursor: 'pointer',
                            fontFamily: D.head,
                            fontSize: '11px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          title="Edit School Registration Information"
                        >
                          <Edit2 size={12} />
                          <span>Edit</span>
                        </button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: D.textMuted, fontFamily: D.mono, fontSize: '10px' }}>
                          <Lock size={12} />
                          <span>Locked</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      background: D.surf0,
                      padding: '10px 12px',
                      borderRadius: D.sm,
                      border: `1px solid ${D.border}`,
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      fontFamily: D.body,
                      fontSize: '12px',
                    }}
                  >
                    <div>
                      <span style={{ color: D.textMuted, fontSize: '11px', display: 'block' }}>Head of Cricket</span>
                      <strong style={{ color: D.textPrimary }}>{school.headOfCricket}</strong>
                    </div>
                    <div>
                      <span style={{ color: D.textMuted, fontSize: '11px', display: 'block' }}>Main Oval</span>
                      <strong style={{ color: D.textPrimary }}>{school.mainOval}</strong>
                    </div>
                    <div>
                      <span style={{ color: D.textMuted, fontSize: '11px', display: 'block' }}>Active Athletes</span>
                      <strong style={{ color: D.emerald }}>{school.stats.activePlayers} registered</strong>
                    </div>
                    <div>
                      <span style={{ color: D.textMuted, fontSize: '11px', display: 'block' }}>Provincial Reps</span>
                      <strong style={{ color: D.sky }}>{school.stats.provincialReps} SA / KZN</strong>
                    </div>
                  </div>

                  <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textSecondary, lineHeight: '1.4' }}>
                    <em>&ldquo;{school.motto}&rdquo;</em> · Rivalry: <strong>{school.derbyName}</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {school.fields.map(f => (
                      <span
                        key={f}
                        style={{
                          fontFamily: D.mono,
                          fontSize: '10px',
                          padding: '2px 7px',
                          borderRadius: D.pill,
                          background: D.surf2,
                          color: D.textMuted,
                          border: `1px solid ${D.border}`,
                        }}
                      >
                        🏟️ {f}
                      </span>
                    ))}
                  </div>

                  {onOpenSchoolProfile && (
                    <button
                      onClick={() => onOpenSchoolProfile(school.id)}
                      style={{
                        marginTop: 'auto',
                        padding: '8px 12px',
                        borderRadius: D.md,
                        background: `${D.emerald}18`,
                        border: `1px solid ${D.emerald}44`,
                        color: D.emerald,
                        fontFamily: D.head,
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>🏛️ View Institutional Profile</span>
                      <span style={{ fontSize: '14px' }}>→</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              background: D.surf1,
              border: `1px solid ${D.border}`,
              borderRadius: D.lg,
              overflowX: 'auto',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '920px' }}>
              <thead>
                <tr style={{ background: D.surf0, borderBottom: `1px solid ${D.border}` }}>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>INSTITUTION</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>REGION / CITY</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>FOUNDED</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>HEAD OF CRICKET</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>MAIN OVAL</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>ATHLETES</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>PROV. REPS</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>PRIMARY RIVALRY</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted, textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchools.map(school => {
                  const canEdit = canEditItem('schools', school);
                  return (
                    <tr
                      key={school.id}
                      style={{
                        borderBottom: `1px solid ${D.border}`,
                        background: school.id === activeSchoolId ? `${D.emerald}08` : 'transparent',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: D.sm,
                              background: school.colors[0],
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '18px',
                              border: `1px solid ${school.colors[1]}44`,
                              flexShrink: 0,
                            }}
                          >
                            {school.crestIcon}
                          </div>
                          <div>
                            <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: D.textPrimary }}>
                              {school.name}
                            </div>
                            <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted, fontStyle: 'italic' }}>
                              &ldquo;{school.motto}&rdquo;
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: D.mono, fontSize: '12px', color: D.textSecondary }}>
                        {school.city}, {school.region}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: D.mono, fontSize: '12px', color: D.textMuted }}>
                        {school.founded}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: D.body, fontSize: '12px', fontWeight: 600, color: D.textPrimary }}>
                        {school.headOfCricket}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: D.mono, fontSize: '12px', color: D.textSecondary }}>
                        🏟️ {school.mainOval}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontFamily: D.mono,
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: D.pill,
                            background: `${D.emerald}20`,
                            color: D.emerald,
                            border: `1px solid ${D.emerald}40`,
                          }}
                        >
                          {school.stats.activePlayers}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontFamily: D.mono,
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: D.pill,
                            background: `${D.sky}20`,
                            color: D.sky,
                            border: `1px solid ${D.sky}40`,
                          }}
                        >
                          {school.stats.provincialReps} SA/KZN
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: D.body, fontSize: '12px', color: D.textSecondary }}>
                        {school.derbyName}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {onOpenSchoolProfile && (
                            <button
                              onClick={() => onOpenSchoolProfile(school.id)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: D.sm,
                                background: `${D.emerald}18`,
                                border: `1px solid ${D.emerald}44`,
                                color: D.emerald,
                                cursor: 'pointer',
                                fontFamily: D.head,
                                fontSize: '11px',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                              title="View Institutional Profile"
                            >
                              <span>Profile</span>
                              <span>→</span>
                            </button>
                          )}
                          {canEdit ? (
                            <button
                              onClick={() => handleOpenEdit('schools', school)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: D.sm,
                                background: D.surf2,
                                border: `1px solid ${D.border}`,
                                color: D.textPrimary,
                                cursor: 'pointer',
                                fontSize: '11px',
                              }}
                              title="Edit School"
                            >
                              <Edit2 size={12} />
                            </button>
                          ) : (
                            <span style={{ color: D.textMuted, fontSize: '11px' }}>
                              <Lock size={12} />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* TAB CONTENT: 2. ATHLETES REGISTER */}
      {activeTab === 'athletes' && (
        viewMode === 'list' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div
              style={{
                background: D.surf1,
                border: `1px solid ${D.border}`,
                borderRadius: D.lg,
                overflowX: 'auto',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
                <thead>
                  <tr style={{ background: D.surf0, borderBottom: `1px solid ${D.border}` }}>
                    <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>ATHLETE NAME</th>
                    <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>SCHOOL & SQUAD</th>
                    <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>PRIMARY ROLE</th>
                    <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>STYLE (BAT / BOWL)</th>
                    <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>GRADE / AGE</th>
                    <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>FITNESS CLEARANCE</th>
                    <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>STATS (AVG / WKTS)</th>
                    <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted, textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAthletes.map(player => {
                    const canEdit = canEditItem('athletes', player);
                    const schoolObj = SCHOOLS_REGISTRY.find(s => s.id === player.school);
                    return (
                      <tr
                        key={player.id}
                        style={{
                          borderBottom: `1px solid ${D.border}`,
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '15px' }}>{schoolObj?.crestIcon || '🏏'}</span>
                            <div>
                              <div style={{ fontFamily: D.body, fontSize: '13px', fontWeight: 700, color: D.textPrimary }}>
                                {player.name}
                                {player.cap && (
                                  <span style={{ marginLeft: '6px', color: D.amber, fontSize: '11px', fontWeight: 800 }}>
                                    ({player.cap.toUpperCase()})
                                  </span>
                                )}
                              </div>
                              <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                                ID: {player.id} · House: {player.houseAtSchool || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: schoolObj?.colors[0] || D.textPrimary }}>
                            {schoolObj?.shortName || player.school}
                          </div>
                          <span
                            style={{
                              fontFamily: D.mono,
                              fontSize: '10px',
                              padding: '1px 6px',
                              borderRadius: D.pill,
                              background: D.surf2,
                              color: D.textMuted,
                              border: `1px solid ${D.border}`,
                            }}
                          >
                            {player.team}
                          </span>
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              fontFamily: D.mono,
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: D.pill,
                              background:
                                player.role === 'BAT' ? `${D.sky}22` :
                                player.role === 'BOWL' ? `${D.emerald}22` :
                                player.role === 'ALL' ? `${D.violet}22` : `${D.amber}22`,
                              color:
                                player.role === 'BAT' ? D.sky :
                                player.role === 'BOWL' ? D.emerald :
                                player.role === 'ALL' ? D.violet : D.amber,
                              border: `1px solid ${
                                player.role === 'BAT' ? D.sky :
                                player.role === 'BOWL' ? D.emerald :
                                player.role === 'ALL' ? D.violet : D.amber
                              }44`,
                            }}
                          >
                            {player.role === 'BAT' ? '🏏 Batter' :
                             player.role === 'BOWL' ? '🎯 Bowler' :
                             player.role === 'ALL' ? '⚡ All-Rounder' : '🧤 Keeper'}
                          </span>
                        </td>

                        <td style={{ padding: '12px 16px', fontFamily: D.mono, fontSize: '11px', color: D.textSecondary }}>
                          <div>{player.batHand}HB · {player.bowlArm}A {player.bowlStyle}</div>
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textPrimary }}>
                            {player.age} yrs
                          </div>
                          <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                            Grade {player.age <= 14 ? '8' : player.age === 15 ? '9' : player.age === 16 ? '10' : player.age === 17 ? '11' : '12'}
                          </div>
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              fontFamily: D.mono,
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: D.pill,
                              background:
                                player.fitness === 'fit' ? `${D.emerald}22` :
                                player.fitness === 'rehab' ? `${D.amber}22` : `${D.rose}22`,
                              color:
                                player.fitness === 'fit' ? D.emerald :
                                player.fitness === 'rehab' ? D.amber : D.rose,
                              border: `1px solid ${
                                player.fitness === 'fit' ? D.emerald :
                                player.fitness === 'rehab' ? D.amber : D.rose
                              }44`,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: player.fitness === 'fit' ? D.emerald : player.fitness === 'rehab' ? D.amber : D.rose }} />
                            {player.fitness === 'fit' ? 'Cleared (Fit)' : player.fitness === 'rehab' ? 'In Rehab' : 'Injured (Locked)'}
                          </span>
                        </td>

                        <td style={{ padding: '12px 16px', fontFamily: D.mono, fontSize: '11px' }}>
                          <span style={{ color: D.textPrimary, fontWeight: 700 }}>{player.avg}</span> avg · <span style={{ color: D.emerald, fontWeight: 700 }}>{player.wkts}</span> wkts
                        </td>

                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            {onSelectPlayerProfile && (
                              <button
                                onClick={() => onSelectPlayerProfile(player)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: D.sm,
                                  background: D.surf2,
                                  border: `1px solid ${D.border}`,
                                  color: D.textPrimary,
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                }}
                                title="View Full Profile Dossier"
                              >
                                <Eye size={12} />
                              </button>
                            )}

                            {onNavigateToH2H && (
                              <button
                                onClick={() => onNavigateToH2H(player.id)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: D.sm,
                                  background: D.surf2,
                                  border: `1px solid ${D.border}`,
                                  color: D.textPrimary,
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                }}
                                title="Compare in Head-to-Head"
                              >
                                ⚔️
                              </button>
                            )}

                            {canEdit ? (
                              <button
                                onClick={() => handleOpenEdit('athletes', player)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: D.sm,
                                  background: `${D.emerald}20`,
                                  border: `1px solid ${D.emerald}44`,
                                  color: D.emerald,
                                  cursor: 'pointer',
                                  fontFamily: D.head,
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                                title="Edit Athlete Registration"
                              >
                                <Edit2 size={12} />
                                <span>Edit</span>
                              </button>
                            ) : (
                              <span style={{ color: D.textMuted, fontSize: '11px' }}>
                                <Lock size={12} />
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {filteredAthletes.map(player => {
              const canEdit = canEditItem('athletes', player);
              const schoolObj = SCHOOLS_REGISTRY.find(s => s.id === player.school);
              return (
                <div
                  key={player.id}
                  style={{
                    background: D.surf1,
                    border: `1px solid ${D.border}`,
                    borderRadius: D.lg,
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: D.md,
                          background: schoolObj?.colors[0] || D.surf2,
                          border: `1px solid ${schoolObj?.colors[1] || D.border}44`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                        }}
                      >
                        {schoolObj?.crestIcon || '🏏'}
                      </div>
                      <div>
                        <div style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 700, color: D.textPrimary }}>
                          {player.name}
                          {player.cap && (
                            <span style={{ marginLeft: '6px', color: D.amber, fontSize: '10px', fontWeight: 800 }}>
                              ★ {player.cap.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                          {schoolObj?.shortName || player.school} · {player.team} · Grade {player.age <= 14 ? '8' : player.age === 15 ? '9' : player.age === 16 ? '10' : player.age === 17 ? '11' : '12'}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        fontFamily: D.mono,
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: D.pill,
                        background:
                          player.role === 'BAT' ? `${D.sky}22` :
                          player.role === 'BOWL' ? `${D.emerald}22` :
                          player.role === 'ALL' ? `${D.violet}22` : `${D.amber}22`,
                        color:
                          player.role === 'BAT' ? D.sky :
                          player.role === 'BOWL' ? D.emerald :
                          player.role === 'ALL' ? D.violet : D.amber,
                        border: `1px solid ${
                          player.role === 'BAT' ? D.sky :
                          player.role === 'BOWL' ? D.emerald :
                          player.role === 'ALL' ? D.violet : D.amber
                        }44`,
                      }}
                    >
                      {player.role === 'BAT' ? '🏏 BAT' : player.role === 'BOWL' ? '🎯 BOWL' : player.role === 'ALL' ? '⚡ ALL' : '🧤 WK'}
                    </span>
                  </div>

                  <div
                    style={{
                      background: D.surf0,
                      padding: '10px 12px',
                      borderRadius: D.sm,
                      border: `1px solid ${D.border}`,
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      fontFamily: D.body,
                      fontSize: '12px',
                    }}
                  >
                    <div>
                      <span style={{ color: D.textMuted, fontSize: '10px', display: 'block' }}>Batting & Bowling</span>
                      <strong style={{ color: D.textPrimary }}>{player.batHand}HB · {player.bowlArm}A</strong>
                    </div>
                    <div>
                      <span style={{ color: D.textMuted, fontSize: '10px', display: 'block' }}>Medical Clearance</span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: player.fitness === 'fit' ? D.emerald : player.fitness === 'rehab' ? D.amber : D.rose,
                          fontWeight: 700,
                          fontSize: '11px',
                        }}
                      >
                        ● {player.fitness === 'fit' ? 'Fit' : player.fitness === 'rehab' ? 'Rehab' : 'Injured'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: D.textMuted, fontSize: '10px', display: 'block' }}>Batting Avg</span>
                      <strong style={{ color: D.textPrimary }}>{player.avg} runs</strong>
                    </div>
                    <div>
                      <span style={{ color: D.textMuted, fontSize: '10px', display: 'block' }}>Wickets Taken</span>
                      <strong style={{ color: D.emerald }}>{player.wkts} wkts</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '4px' }}>
                    <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                      ID: {player.id}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {onSelectPlayerProfile && (
                        <button
                          onClick={() => onSelectPlayerProfile(player)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: D.sm,
                            background: D.surf2,
                            border: `1px solid ${D.border}`,
                            color: D.textPrimary,
                            cursor: 'pointer',
                            fontFamily: D.head,
                            fontSize: '11px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          title="View Profile"
                        >
                          <Eye size={12} />
                          <span>Dossier</span>
                        </button>
                      )}

                      {onNavigateToH2H && (
                        <button
                          onClick={() => onNavigateToH2H(player.id)}
                          style={{
                            padding: '5px 8px',
                            borderRadius: D.sm,
                            background: D.surf2,
                            border: `1px solid ${D.border}`,
                            color: D.textPrimary,
                            cursor: 'pointer',
                            fontSize: '11px',
                          }}
                          title="Compare Head-to-Head"
                        >
                          ⚔️
                        </button>
                      )}

                      {canEdit && (
                        <button
                          onClick={() => handleOpenEdit('athletes', player)}
                          style={{
                            padding: '5px 8px',
                            borderRadius: D.sm,
                            background: `${D.emerald}20`,
                            border: `1px solid ${D.emerald}44`,
                            color: D.emerald,
                            cursor: 'pointer',
                            fontSize: '11px',
                          }}
                          title="Edit Athlete"
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
        )
      )}

      {/* TAB CONTENT: 3. UMPIRES & MATCH OFFICIALS */}
      {activeTab === 'umpires' && (
        viewMode === 'card' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
            {filteredUmpires.map(umpire => {
              const canEdit = canEditItem('umpires', umpire);
              return (
                <div
                  key={umpire.id}
                  style={{
                    background: D.surf1,
                    border: `1px solid ${D.border}`,
                    borderRadius: D.lg,
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: D.md,
                          background: `${D.cyan}20`,
                          border: `1px solid ${D.cyan}44`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                        }}
                      >
                        ⚖️
                      </div>
                      <div>
                        <div style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 700, color: D.textPrimary }}>
                          {umpire.name}
                        </div>
                        <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                          Badge: <strong>{umpire.badgeNumber}</strong> · {umpire.region}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontFamily: D.mono,
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: D.pill,
                          background: umpire.status === 'Available' ? `${D.emerald}22` : umpire.status === 'Appointed' ? `${D.sky}22` : `${D.amber}22`,
                          color: umpire.status === 'Available' ? D.emerald : umpire.status === 'Appointed' ? D.sky : D.amber,
                          border: `1px solid ${umpire.status === 'Available' ? D.emerald : umpire.status === 'Appointed' ? D.sky : D.amber}44`,
                        }}
                      >
                        {umpire.status}
                      </span>

                      {canEdit && (
                        <button
                          onClick={() => handleOpenEdit('umpires', umpire)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: D.sm,
                            background: D.surf2,
                            border: `1px solid ${D.border}`,
                            color: D.textPrimary,
                            cursor: 'pointer',
                          }}
                        >
                          <Edit2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      background: D.surf0,
                      padding: '10px 12px',
                      borderRadius: D.sm,
                      border: `1px solid ${D.border}`,
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      fontFamily: D.body,
                      fontSize: '12px',
                    }}
                  >
                    <div>
                      <span style={{ color: D.textMuted, fontSize: '10px', display: 'block' }}>CSA Accreditation</span>
                      <strong style={{ color: D.cyan }}>{umpire.csaLevel}</strong>
                    </div>
                    <div>
                      <span style={{ color: D.textMuted, fontSize: '10px', display: 'block' }}>Matches Officiated</span>
                      <strong style={{ color: D.textPrimary }}>{umpire.matchesOfficiated} Fixtures</strong>
                    </div>
                    <div>
                      <span style={{ color: D.textMuted, fontSize: '10px', display: 'block' }}>Certification Expiry</span>
                      <strong style={{ color: D.textPrimary }}>{umpire.expiryDate}</strong>
                    </div>
                    <div>
                      <span style={{ color: D.textMuted, fontSize: '10px', display: 'block' }}>Disciplinary Reports</span>
                      <strong style={{ color: umpire.disciplinaryReports > 0 ? D.amber : D.emerald }}>{umpire.disciplinaryReports} Lodged</strong>
                    </div>
                  </div>

                  <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={12} />
                      <span>{umpire.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={12} />
                      <span>{umpire.phone}</span>
                    </div>
                  </div>

                  {umpire.lastAssignedFixture && (
                    <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary, background: D.surf2, padding: '6px 10px', borderRadius: D.sm }}>
                      Last Assigned: <strong>{umpire.lastAssignedFixture}</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              background: D.surf1,
              border: `1px solid ${D.border}`,
              borderRadius: D.lg,
              overflowX: 'auto',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
              <thead>
                <tr style={{ background: D.surf0, borderBottom: `1px solid ${D.border}` }}>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>OFFICIAL NAME & BADGE</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>REGION / ASSOCIATION</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>CSA LEVEL</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>MATCHES</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>DISCIPLINARY</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>EXPIRY DATE</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>STATUS</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>CONTACT (POPIA)</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted, textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredUmpires.map(umpire => {
                  const canEdit = canEditItem('umpires', umpire);
                  return (
                    <tr
                      key={umpire.id}
                      style={{
                        borderBottom: `1px solid ${D.border}`,
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px' }}>⚖️</span>
                          <div>
                            <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: D.textPrimary }}>
                              {umpire.name}
                            </div>
                            <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.cyan }}>
                              Badge: {umpire.badgeNumber}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: D.body, fontSize: '12px', color: D.textSecondary }}>
                        {umpire.region} · {umpire.association}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontFamily: D.mono,
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: D.pill,
                            background: `${D.cyan}20`,
                            color: D.cyan,
                            border: `1px solid ${D.cyan}40`,
                          }}
                        >
                          {umpire.csaLevel}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: D.mono, fontSize: '12px', color: D.textPrimary, fontWeight: 700 }}>
                        {umpire.matchesOfficiated}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: D.mono, fontSize: '12px', color: umpire.disciplinaryReports > 0 ? D.amber : D.emerald }}>
                        {umpire.disciplinaryReports}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                        {umpire.expiryDate}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontFamily: D.mono,
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: D.pill,
                            background: umpire.status === 'Available' ? `${D.emerald}22` : umpire.status === 'Appointed' ? `${D.sky}22` : `${D.amber}22`,
                            color: umpire.status === 'Available' ? D.emerald : umpire.status === 'Appointed' ? D.sky : D.amber,
                          }}
                        >
                          {umpire.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                        <div>{umpire.email}</div>
                        <div>{umpire.phone}</div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {canEdit ? (
                          <button
                            onClick={() => handleOpenEdit('umpires', umpire)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: D.sm,
                              background: D.surf2,
                              border: `1px solid ${D.border}`,
                              color: D.textPrimary,
                              cursor: 'pointer',
                              fontSize: '11px',
                            }}
                          >
                            <Edit2 size={12} />
                          </button>
                        ) : (
                          <Lock size={12} color={D.textMuted} />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* TAB CONTENT: 4. OFFICIAL SCORERS */}
      {activeTab === 'scorers' && (
        viewMode === 'card' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
            {filteredScorers.map(scorer => {
              const canEdit = canEditItem('scorers', scorer);
              const schoolObj = SCHOOLS_REGISTRY.find(s => s.id === scorer.schoolId);
              return (
                <div
                  key={scorer.id}
                  style={{
                    background: D.surf1,
                    border: `1px solid ${D.border}`,
                    borderRadius: D.lg,
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: D.md,
                          background: `${D.amber}20`,
                          border: `1px solid ${D.amber}44`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                        }}
                      >
                        📝
                      </div>
                      <div>
                        <div style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 700, color: D.textPrimary }}>
                          {scorer.name}
                        </div>
                        <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                          {schoolObj?.shortName || scorer.schoolId} · Token: <strong>{scorer.tokenCode}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontFamily: D.mono,
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: D.pill,
                          background: scorer.status === 'Active' ? `${D.emerald}22` : `${D.amber}22`,
                          color: scorer.status === 'Active' ? D.emerald : D.amber,
                          border: `1px solid ${scorer.status === 'Active' ? D.emerald : D.amber}44`,
                        }}
                      >
                        {scorer.status}
                      </span>

                      {canEdit && (
                        <button
                          onClick={() => handleOpenEdit('scorers', scorer)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: D.sm,
                            background: D.surf2,
                            border: `1px solid ${D.border}`,
                            color: D.textPrimary,
                            cursor: 'pointer',
                          }}
                        >
                          <Edit2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      background: D.surf0,
                      padding: '10px 12px',
                      borderRadius: D.sm,
                      border: `1px solid ${D.border}`,
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      fontFamily: D.body,
                      fontSize: '12px',
                    }}
                  >
                    <div>
                      <span style={{ color: D.textMuted, fontSize: '10px', display: 'block' }}>Certification</span>
                      <strong style={{ color: D.amber }}>{scorer.certification}</strong>
                    </div>
                    <div>
                      <span style={{ color: D.textMuted, fontSize: '10px', display: 'block' }}>Preferred Terminal</span>
                      <strong style={{ color: D.textPrimary }}>💻 {scorer.preferredTerminal}</strong>
                    </div>
                    <div>
                      <span style={{ color: D.textMuted, fontSize: '10px', display: 'block' }}>Matches Logged</span>
                      <strong style={{ color: D.textPrimary }}>{scorer.matchesLogged} Fixtures</strong>
                    </div>
                    <div>
                      <span style={{ color: D.textMuted, fontSize: '10px', display: 'block' }}>Appointed Squads</span>
                      <strong style={{ color: D.sky }}>{scorer.appointedSquads.join(', ')}</strong>
                    </div>
                  </div>

                  <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={12} />
                      <span>{scorer.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={12} />
                      <span>{scorer.phone}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              background: D.surf1,
              border: `1px solid ${D.border}`,
              borderRadius: D.lg,
              overflowX: 'auto',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
              <thead>
                <tr style={{ background: D.surf0, borderBottom: `1px solid ${D.border}` }}>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>SCORER & TOKEN</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>SCHOOL AFFILIATION</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>CERTIFICATION</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>TERMINAL</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>MATCHES</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>APPOINTED SQUADS</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>STATUS</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>CONTACT</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted, textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredScorers.map(scorer => {
                  const canEdit = canEditItem('scorers', scorer);
                  const schoolObj = SCHOOLS_REGISTRY.find(s => s.id === scorer.schoolId);
                  return (
                    <tr
                      key={scorer.id}
                      style={{
                        borderBottom: `1px solid ${D.border}`,
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px' }}>📝</span>
                          <div>
                            <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: D.textPrimary }}>
                              {scorer.name}
                            </div>
                            <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.amber }}>
                              Token: {scorer.tokenCode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: D.body, fontSize: '12px', fontWeight: 600, color: D.textPrimary }}>
                        {schoolObj?.shortName || scorer.schoolId}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontFamily: D.mono,
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: D.pill,
                            background: `${D.amber}20`,
                            color: D.amber,
                            border: `1px solid ${D.amber}40`,
                          }}
                        >
                          {scorer.certification}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: D.mono, fontSize: '11px', color: D.textSecondary }}>
                        💻 {scorer.preferredTerminal}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: D.mono, fontSize: '12px', color: D.textPrimary, fontWeight: 700 }}>
                        {scorer.matchesLogged}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: D.body, fontSize: '11px', color: D.sky }}>
                        {scorer.appointedSquads.join(', ')}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontFamily: D.mono,
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: D.pill,
                            background: scorer.status === 'Active' ? `${D.emerald}22` : `${D.amber}22`,
                            color: scorer.status === 'Active' ? D.emerald : D.amber,
                          }}
                        >
                          {scorer.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                        <div>{scorer.email}</div>
                        <div>{scorer.phone}</div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {canEdit ? (
                          <button
                            onClick={() => handleOpenEdit('scorers', scorer)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: D.sm,
                              background: D.surf2,
                              border: `1px solid ${D.border}`,
                              color: D.textPrimary,
                              cursor: 'pointer',
                              fontSize: '11px',
                            }}
                          >
                            <Edit2 size={12} />
                          </button>
                        ) : (
                          <Lock size={12} color={D.textMuted} />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* TAB CONTENT: 5. COACHES & TECHNICAL STAFF */}
      {activeTab === 'coaches' && (
        viewMode === 'card' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
            {filteredCoaches.map(coach => {
              const canEdit = canEditItem('coaches', coach);
              const schoolObj = SCHOOLS_REGISTRY.find(s => s.id === coach.schoolId);
              return (
                <div
                  key={coach.id}
                  style={{
                    background: D.surf1,
                    border: `1px solid ${D.border}`,
                    borderRadius: D.lg,
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: D.md,
                          background: `${D.emerald}20`,
                          border: `1px solid ${D.emerald}44`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                        }}
                      >
                        🧢
                      </div>
                      <div>
                        <div style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 700, color: D.textPrimary }}>
                          {coach.name}
                        </div>
                        <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textSecondary }}>
                          {coach.roleTitle} · <strong>{schoolObj?.shortName || coach.schoolId}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontFamily: D.mono,
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: D.pill,
                          background: `${D.violet}22`,
                          color: D.violet,
                          border: `1px solid ${D.violet}44`,
                        }}
                      >
                        {coach.csaLevel}
                      </span>

                      {canEdit && (
                        <button
                          onClick={() => handleOpenEdit('coaches', coach)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: D.sm,
                            background: D.surf2,
                            border: `1px solid ${D.border}`,
                            color: D.textPrimary,
                            cursor: 'pointer',
                          }}
                        >
                          <Edit2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      background: D.surf0,
                      padding: '10px 12px',
                      borderRadius: D.sm,
                      border: `1px solid ${D.border}`,
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      fontFamily: D.body,
                      fontSize: '12px',
                    }}
                  >
                    <div>
                      <span style={{ color: D.textMuted, fontSize: '10px', display: 'block' }}>Specialization</span>
                      <strong style={{ color: D.emerald }}>{coach.specialization}</strong>
                    </div>
                    <div>
                      <span style={{ color: D.textMuted, fontSize: '10px', display: 'block' }}>Assigned Squad</span>
                      <strong style={{ color: D.textPrimary }}>{coach.assignedSquad}</strong>
                    </div>
                    <div>
                      <span style={{ color: D.textMuted, fontSize: '10px', display: 'block' }}>Child Protection Clearance</span>
                      <strong style={{ color: D.emerald }}>🛡️ {coach.sapsClearance}</strong>
                    </div>
                    <div>
                      <span style={{ color: D.textMuted, fontSize: '10px', display: 'block' }}>BokSmart / First Aid</span>
                      <strong style={{ color: D.textPrimary }}>Exp: {coach.bokSmartExpiry}</strong>
                    </div>
                  </div>

                  <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={12} />
                      <span>{coach.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={12} />
                      <span>{coach.phone}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              background: D.surf1,
              border: `1px solid ${D.border}`,
              borderRadius: D.lg,
              overflowX: 'auto',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '920px' }}>
              <thead>
                <tr style={{ background: D.surf0, borderBottom: `1px solid ${D.border}` }}>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>COACH & ROLE</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>SCHOOL</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>CSA LEVEL</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>SPECIALIZATION</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>ASSIGNED SQUAD</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>CHILD PROTECTION</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>BOKSMART EXPIRY</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>CONTACT</th>
                  <th style={{ padding: '12px 16px', fontFamily: D.head, fontSize: '11px', color: D.textMuted, textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoaches.map(coach => {
                  const canEdit = canEditItem('coaches', coach);
                  const schoolObj = SCHOOLS_REGISTRY.find(s => s.id === coach.schoolId);
                  return (
                    <tr
                      key={coach.id}
                      style={{
                        borderBottom: `1px solid ${D.border}`,
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px' }}>🧢</span>
                          <div>
                            <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: D.textPrimary }}>
                              {coach.name}
                            </div>
                            <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary }}>
                              {coach.roleTitle}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: D.body, fontSize: '12px', fontWeight: 600, color: D.textPrimary }}>
                        {schoolObj?.shortName || coach.schoolId}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontFamily: D.mono,
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: D.pill,
                            background: `${D.violet}20`,
                            color: D.violet,
                            border: `1px solid ${D.violet}40`,
                          }}
                        >
                          {coach.csaLevel}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: D.body, fontSize: '12px', color: D.emerald, fontWeight: 600 }}>
                        {coach.specialization}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: D.body, fontSize: '12px', color: D.textPrimary }}>
                        {coach.assignedSquad}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: D.mono, fontSize: '11px', color: D.emerald }}>
                        🛡️ {coach.sapsClearance}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                        {coach.bokSmartExpiry}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                        <div>{coach.email}</div>
                        <div>{coach.phone}</div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {canEdit ? (
                          <button
                            onClick={() => handleOpenEdit('coaches', coach)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: D.sm,
                              background: D.surf2,
                              border: `1px solid ${D.border}`,
                              color: D.textPrimary,
                              cursor: 'pointer',
                              fontSize: '11px',
                            }}
                          >
                            <Edit2 size={12} />
                          </button>
                        ) : (
                          <Lock size={12} color={D.textMuted} />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* RBAC MODAL (ADD / EDIT RECORD) */}
      {editingItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: D.surf1,
              border: `1px solid ${D.border}`,
              borderRadius: D.lg,
              width: '100%',
              maxWidth: '620px',
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: `1px solid ${D.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>
                  {editingItem.type === 'schools' ? '🏫' : editingItem.type === 'athletes' ? '🏃' : editingItem.type === 'umpires' ? '⚖️' : editingItem.type === 'scorers' ? '📝' : '🧢'}
                </span>
                <div>
                  <h3 style={{ fontFamily: D.head, fontSize: '17px', fontWeight: 800, margin: 0, color: D.textPrimary }}>
                    {isCreatingNew ? 'Register New' : 'Edit'}{' '}
                    {editingItem.type === 'schools' ? 'School' : editingItem.type === 'athletes' ? 'Athlete Profile' : editingItem.type === 'umpires' ? 'Umpire Credentials' : editingItem.type === 'scorers' ? 'Official Scorer' : 'Coach Details'}
                  </h3>
                  <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                    RBAC Role: <strong style={{ color: rbacInfo.badgeColor }}>{ROLES[currentRole]?.label || currentRole}</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setEditingItem(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: D.textMuted,
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Common Name Field */}
              <div>
                <label style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, display: 'block', marginBottom: '6px' }}>
                  {editingItem.type === 'schools' ? 'Official School Name' : 'Full Name'}
                </label>
                <input
                  type="text"
                  value={modalFormData.name || ''}
                  onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: D.sm,
                    background: D.surf0,
                    border: `1px solid ${D.border}`,
                    color: D.textPrimary,
                    fontFamily: D.body,
                    fontSize: '13px',
                    outline: 'none',
                  }}
                  placeholder="Enter full title / name..."
                />
              </div>

              {/* SCHOOL REGISTER SPECIFIC FIELDS */}
              {editingItem.type === 'schools' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, display: 'block', marginBottom: '4px' }}>
                      Short Display Name
                    </label>
                    <input
                      type="text"
                      value={modalFormData.shortName || ''}
                      onChange={(e) => setModalFormData({ ...modalFormData, shortName: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: D.sm, background: D.surf0, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, display: 'block', marginBottom: '4px' }}>
                      Head of Cricket
                    </label>
                    <input
                      type="text"
                      value={modalFormData.headOfCricket || ''}
                      onChange={(e) => setModalFormData({ ...modalFormData, headOfCricket: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: D.sm, background: D.surf0, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, display: 'block', marginBottom: '4px' }}>
                      Main Oval Field
                    </label>
                    <input
                      type="text"
                      value={modalFormData.mainOval || ''}
                      onChange={(e) => setModalFormData({ ...modalFormData, mainOval: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: D.sm, background: D.surf0, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, display: 'block', marginBottom: '4px' }}>
                      Motto
                    </label>
                    <input
                      type="text"
                      value={modalFormData.motto || ''}
                      onChange={(e) => setModalFormData({ ...modalFormData, motto: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: D.sm, background: D.surf0, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: '13px' }}
                    />
                  </div>
                </div>
              )}

              {/* ATHLETE REGISTER SPECIFIC FIELDS */}
              {editingItem.type === 'athletes' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, display: 'block', marginBottom: '4px' }}>
                      School Affiliation
                    </label>
                    <select
                      value={modalFormData.school || ''}
                      disabled={!rbacInfo.isSuper}
                      onChange={(e) => setModalFormData({ ...modalFormData, school: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: D.sm, background: D.surf0, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: '13px', opacity: rbacInfo.isSuper ? 1 : 0.6 }}
                    >
                      {SCHOOLS_REGISTRY.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, display: 'block', marginBottom: '4px' }}>
                      Squad Tier
                    </label>
                    <select
                      value={modalFormData.team || '1st XI'}
                      onChange={(e) => setModalFormData({ ...modalFormData, team: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: D.sm, background: D.surf0, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: '13px' }}
                    >
                      <option value="1st XI">1st XI (Open)</option>
                      <option value="2nd XI">2nd XI (Open)</option>
                      <option value="3rd XI">3rd XI (Open)</option>
                      <option value="U16A">U16A Tier</option>
                      <option value="U15A">U15A Tier</option>
                      <option value="U14A">U14A Tier</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, display: 'block', marginBottom: '4px' }}>
                      Playing Role
                    </label>
                    <select
                      value={modalFormData.role || 'BAT'}
                      onChange={(e) => setModalFormData({ ...modalFormData, role: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: D.sm, background: D.surf0, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: '13px' }}
                    >
                      <option value="BAT">Top-Order Batter (BAT)</option>
                      <option value="BOWL">Specialist Bowler (BOWL)</option>
                      <option value="ALL">All-Rounder (ALL)</option>
                      <option value="WK">Wicketkeeper / Batter (WK)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, display: 'block', marginBottom: '4px' }}>
                      Fitness Clearance Status
                    </label>
                    <select
                      value={modalFormData.fitness || 'fit'}
                      disabled={!rbacInfo.isSuper && !rbacInfo.isMedical && !rbacInfo.isSchoolAdmin}
                      onChange={(e) => setModalFormData({ ...modalFormData, fitness: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: D.sm, background: D.surf0, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: '13px' }}
                    >
                      <option value="fit">✅ Cleared to Play (Fit)</option>
                      <option value="rehab">⚠️ In Rehabilitation Pipeline</option>
                      <option value="injured">❌ Medical Hold / Injured</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, display: 'block', marginBottom: '4px' }}>
                      Batting Hand
                    </label>
                    <select
                      value={modalFormData.batHand || 'R'}
                      onChange={(e) => setModalFormData({ ...modalFormData, batHand: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: D.sm, background: D.surf0, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: '13px' }}
                    >
                      <option value="R">Right Hand Bat</option>
                      <option value="L">Left Hand Bat</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, display: 'block', marginBottom: '4px' }}>
                      Bowling Style
                    </label>
                    <select
                      value={modalFormData.bowlStyle || 'M'}
                      onChange={(e) => setModalFormData({ ...modalFormData, bowlStyle: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: D.sm, background: D.surf0, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: '13px' }}
                    >
                      <option value="F">Fast / Express</option>
                      <option value="M">Fast-Medium / Seam</option>
                      <option value="S">Spin (Off / Leg / SLA)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* UMPIRE SPECIFIC FIELDS */}
              {editingItem.type === 'umpires' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, display: 'block', marginBottom: '4px' }}>
                      Badge Number
                    </label>
                    <input
                      type="text"
                      value={modalFormData.badgeNumber || ''}
                      onChange={(e) => setModalFormData({ ...modalFormData, badgeNumber: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: D.sm, background: D.surf0, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, display: 'block', marginBottom: '4px' }}>
                      CSA Accreditation
                    </label>
                    <select
                      value={modalFormData.csaLevel || 'Level 2'}
                      disabled={!rbacInfo.isSuper}
                      onChange={(e) => setModalFormData({ ...modalFormData, csaLevel: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: D.sm, background: D.surf0, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: '13px' }}
                    >
                      <option value="Level 1">Level 1 Certified</option>
                      <option value="Level 2">Level 2 Provincial</option>
                      <option value="Level 3">Level 3 Senior Panel</option>
                      <option value="ICC / CSA Elite Panel">ICC / CSA Elite Panel</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, display: 'block', marginBottom: '4px' }}>
                      Availability Status
                    </label>
                    <select
                      value={modalFormData.status || 'Available'}
                      onChange={(e) => setModalFormData({ ...modalFormData, status: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: D.sm, background: D.surf0, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: '13px' }}
                    >
                      <option value="Available">Available for Appointments</option>
                      <option value="Appointed">Appointed on Match Duty</option>
                      <option value="On Leave">On Leave / Unavailable</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, display: 'block', marginBottom: '4px' }}>
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={modalFormData.phone || ''}
                      onChange={(e) => setModalFormData({ ...modalFormData, phone: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: D.sm, background: D.surf0, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: '13px' }}
                    />
                  </div>
                </div>
              )}

              {/* SCORER SPECIFIC FIELDS */}
              {editingItem.type === 'scorers' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, display: 'block', marginBottom: '4px' }}>
                      Assigned School
                    </label>
                    <select
                      value={modalFormData.schoolId || ''}
                      disabled={!rbacInfo.isSuper}
                      onChange={(e) => setModalFormData({ ...modalFormData, schoolId: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: D.sm, background: D.surf0, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: '13px' }}
                    >
                      {SCHOOLS_REGISTRY.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, display: 'block', marginBottom: '4px' }}>
                      Scoring Certification
                    </label>
                    <select
                      value={modalFormData.certification || 'CSA Level 2 DLS Master'}
                      onChange={(e) => setModalFormData({ ...modalFormData, certification: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: D.sm, background: D.surf0, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: '13px' }}
                    >
                      <option value="CSA Level 1 Digital">CSA Level 1 Digital</option>
                      <option value="CSA Level 2 DLS Master">CSA Level 2 DLS Master</option>
                      <option value="Linear Scorebook Specialist">Linear Scorebook Specialist</option>
                      <option value="CricClubs Certified">CricClubs Certified</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, display: 'block', marginBottom: '4px' }}>
                      Preferred Terminal Device
                    </label>
                    <select
                      value={modalFormData.preferredTerminal || 'iPad Pro'}
                      onChange={(e) => setModalFormData({ ...modalFormData, preferredTerminal: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: D.sm, background: D.surf0, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: '13px' }}
                    >
                      <option value="iPad Pro">iPad Pro Live Terminal</option>
                      <option value="MacBook">MacBook / Laptop</option>
                      <option value="Surface Pro">Surface Pro Windows</option>
                      <option value="Android Tablet">Android Tablet</option>
                      <option value="Linear Book">Linear Scorebook</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, display: 'block', marginBottom: '4px' }}>
                      Scorer Security Token
                    </label>
                    <input
                      type="text"
                      value={modalFormData.tokenCode || ''}
                      readOnly={!rbacInfo.isSuper}
                      onChange={(e) => setModalFormData({ ...modalFormData, tokenCode: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: D.sm, background: D.surf0, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.mono, fontSize: '12px' }}
                    />
                  </div>
                </div>
              )}

              {/* COACH SPECIFIC FIELDS */}
              {editingItem.type === 'coaches' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, display: 'block', marginBottom: '4px' }}>
                      Assigned School
                    </label>
                    <select
                      value={modalFormData.schoolId || ''}
                      disabled={!rbacInfo.isSuper}
                      onChange={(e) => setModalFormData({ ...modalFormData, schoolId: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: D.sm, background: D.surf0, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: '13px' }}
                    >
                      {SCHOOLS_REGISTRY.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, display: 'block', marginBottom: '4px' }}>
                      Role Title
                    </label>
                    <input
                      type="text"
                      value={modalFormData.roleTitle || ''}
                      onChange={(e) => setModalFormData({ ...modalFormData, roleTitle: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: D.sm, background: D.surf0, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, display: 'block', marginBottom: '4px' }}>
                      CSA Coaching Level
                    </label>
                    <select
                      value={modalFormData.csaLevel || 'Level 2'}
                      disabled={!rbacInfo.isSuper && !rbacInfo.isSchoolAdmin}
                      onChange={(e) => setModalFormData({ ...modalFormData, csaLevel: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: D.sm, background: D.surf0, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: '13px' }}
                    >
                      <option value="Level 1">CSA Level 1</option>
                      <option value="Level 2">CSA Level 2</option>
                      <option value="Level 3 HP">CSA Level 3 High Performance</option>
                      <option value="Level 4 Elite">CSA Level 4 Elite</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, display: 'block', marginBottom: '4px' }}>
                      Specialization
                    </label>
                    <select
                      value={modalFormData.specialization || 'Head Coach'}
                      onChange={(e) => setModalFormData({ ...modalFormData, specialization: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: D.sm, background: D.surf0, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: '13px' }}
                    >
                      <option value="Head Coach">Head Coach</option>
                      <option value="Batting Specialist">Batting Specialist</option>
                      <option value="Pace Bowling">Pace Bowling Coach</option>
                      <option value="Spin Bowling">Spin Bowling Coach</option>
                      <option value="Fielding & Wicketkeeping">Fielding & Wicketkeeping</option>
                      <option value="S&C / High Performance">S&C / High Performance</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Contact Email & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, display: 'block', marginBottom: '4px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={modalFormData.email || ''}
                    onChange={(e) => setModalFormData({ ...modalFormData, email: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: D.sm, background: D.surf0, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, display: 'block', marginBottom: '4px' }}>
                    Direct Phone Contact
                  </label>
                  <input
                    type="text"
                    value={modalFormData.phone || ''}
                    onChange={(e) => setModalFormData({ ...modalFormData, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: D.sm, background: D.surf0, border: `1px solid ${D.border}`, color: D.textPrimary, fontFamily: D.body, fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div
              style={{
                padding: '16px 20px',
                borderTop: `1px solid ${D.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {!isCreatingNew && (rbacInfo.isSuper || rbacInfo.isSchoolAdmin) ? (
                <button
                  onClick={() => handleDeleteItem(editingItem.type, modalFormData.id, modalFormData.name)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: D.sm,
                    background: `${D.rose}20`,
                    border: `1px solid ${D.rose}44`,
                    color: D.rose,
                    fontFamily: D.head,
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Trash2 size={14} />
                  <span>Delete Record</span>
                </button>
              ) : <div />}

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => setEditingItem(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: D.sm,
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    color: D.textPrimary,
                    fontFamily: D.head,
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveModal}
                  style={{
                    padding: '8px 20px',
                    borderRadius: D.sm,
                    background: D.emerald,
                    border: 'none',
                    color: '#ffffff',
                    fontFamily: D.head,
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(16,185,129,0.3)',
                  }}
                >
                  {isCreatingNew ? 'Create & Register' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
