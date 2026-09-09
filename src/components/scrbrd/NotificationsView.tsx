'use client';

import React, { useState } from 'react';
import { Theme } from './types';
import { ROLES, POPIA_POLICIES } from './data';

export type NotificationCategory =
  | 'match'
  | 'medical'
  | 'logistics'
  | 'grounds'
  | 'fixture'
  | 'governance'
  | 'academic'
  | 'finance'
  | 'system';

export interface InboxItem {
  id: string;
  type: 'message' | 'alert' | 'approval';
  category: NotificationCategory;
  title: string;
  sender: string;
  senderRole: string;
  senderAvatar?: string;
  body: string;
  time: string;
  read: boolean;
  starred?: boolean;
  actionLabel?: string;
  targetPage?: string;
  priority?: 'high' | 'normal' | 'urgent';
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  // Strict RBAC Access Controls
  allowedRoles?: string[]; // If defined, only these roles can access (superadmin always bypasses)
  deniedRoles?: string[]; // If defined, these roles are strictly forbidden
  securityLevel?: number; // 1-4 POPIA classification
}

interface NotificationsViewProps {
  theme: Theme;
  currentRole?: string;
  onNavigate: (page: string) => void;
  onTriggerToast?: (title: string, body: string, category: string, targetPage?: string) => void;
}

// ── ROLE DOMAIN RULES & RBAC POLICIES ──────────────────────
export const ROLE_NOTIFICATION_CONFIG: Record<
  string,
  {
    allowedDomains: NotificationCategory[];
    deniedDomains: NotificationCategory[];
    description: string;
    allowedSummary: string;
    restrictedSummary: string;
  }
> = {
  superadmin: {
    allowedDomains: ['match', 'medical', 'logistics', 'grounds', 'fixture', 'governance', 'academic', 'finance', 'system'],
    deniedDomains: [],
    description: 'Root platform governor with unrestricted access across all institutional streams.',
    allowedSummary: 'All 9 Institutional Domains (Full Audit Clearance)',
    restrictedSummary: 'None (Root Authority)',
  },
  platformsupport: {
    allowedDomains: ['system', 'governance', 'logistics', 'grounds', 'fixture', 'match'],
    deniedDomains: ['medical', 'finance'],
    description: 'Platform infrastructure and user support with automated clinical & financial PII masking.',
    allowedSummary: 'Infrastructure, Governance Logs, Fixtures, Logistics Telemetry',
    restrictedSummary: 'Confidential Clinical Records, Commercial Bank Invoices',
  },
  headmaster: {
    allowedDomains: ['governance', 'academic', 'finance', 'fixture', 'match', 'logistics', 'grounds'],
    deniedDomains: ['medical'],
    description: 'Executive institutional governance, financial oversight, prestige fixtures, and board circulars.',
    allowedSummary: 'Executive Circulars, Sponsorship Tranches, Bursaries, POPIA Governance, Master Fixtures',
    restrictedSummary: 'Confidential Clinical Physio Diagnostics',
  },
  schooladmin: {
    allowedDomains: ['governance', 'academic', 'finance', 'logistics', 'fixture', 'match', 'grounds', 'system'],
    deniedDomains: ['medical'],
    description: 'School tenant administrator managing logistics, registrations, schedules, and operations.',
    allowedSummary: 'Staff Bulletins, POPIA Compliance, Fleet Logistics, Invoices, Fixtures',
    restrictedSummary: 'Private Clinical Medical Records',
  },
  financeadmin: {
    allowedDomains: ['finance', 'governance', 'logistics', 'academic', 'fixture'],
    deniedDomains: ['match', 'medical', 'grounds'],
    description: 'Commercial rights accounting, sponsorship tranches, fleet invoices, and fee reconciliation.',
    allowedSummary: 'Commercial Sponsorships, Transport Invoices, Tournament Fees, POPIA Audits, Bursary Allocations',
    restrictedSummary: 'Live Scorer Telemetry Bots, Match Tactics, Team Sheets, Clinical Physio Clearances, Turfgrass Telemetry',
  },
  sportsmaster: {
    allowedDomains: ['match', 'fixture', 'logistics', 'grounds', 'academic', 'governance', 'medical'],
    deniedDomains: ['finance'],
    description: 'Head of sports operations, master fixture programming, team sheet verification, and return-to-play.',
    allowedSummary: 'Master Fixtures, Team Sheet Approvals, Return-to-Play, Pitch Conditions, Squad Transport',
    restrictedSummary: 'Bank Invoices & Commercial Sponsorship Disbursements',
  },
  doc: {
    allowedDomains: ['match', 'fixture', 'grounds', 'logistics', 'medical', 'academic', 'governance'],
    deniedDomains: ['finance'],
    description: 'Director of Cricket oversight across all 23 squads, talent pipelines, pitch preparation, and coaching plans.',
    allowedSummary: 'All Squad Telemetry, Coach Briefings, Pitch Moisture Reports, Injury Return Clearances',
    restrictedSummary: 'Commercial Sponsorship Accounting & Invoices',
  },
  headcoach: {
    allowedDomains: ['match', 'fixture', 'grounds', 'logistics', 'medical'],
    deniedDomains: ['finance', 'governance'],
    description: '1st XI leadership, live match scorer telemetry, squad strategy briefings, and pitch advisories.',
    allowedSummary: 'Live Telemetry Bot Alerts, 1st XI Squad Briefings, Physio Return-to-Play, Pitch Curator Reports',
    restrictedSummary: 'School Financial Accounts & Statutory POPIA Audits',
  },
  coach: {
    allowedDomains: ['match', 'fixture', 'logistics', 'grounds', 'medical'],
    deniedDomains: ['finance', 'governance'],
    description: 'Junior and open squad development, age-group telemetry, training drills, and transport schedules.',
    allowedSummary: 'Squad Match Milestones, Training Circulars, Bus Departure Times, Player Readiness',
    restrictedSummary: 'Commercial Accounts & Executive Governance',
  },
  assistant: {
    allowedDomains: ['match', 'fixture', 'logistics', 'medical'],
    deniedDomains: ['finance', 'governance', 'grounds'],
    description: 'Coaching support, training logs, attendance verification, and match day coordination.',
    allowedSummary: 'Training Logs, Squad Match Updates, Bus Logistics',
    restrictedSummary: 'Financial Accounts, Turfgrass Sensors, Governance',
  },
  analyst: {
    allowedDomains: ['match', 'fixture'],
    deniedDomains: ['medical', 'finance', 'governance', 'grounds', 'logistics'],
    description: 'Ball-by-ball telemetry, Hawk-Eye DRS metrics, 360° wagon wheels, and performance milestones.',
    allowedSummary: 'Live Match Telemetry, Scorer Bot Milestone Feeds, Hawk-Eye Ball Tracking Data',
    restrictedSummary: 'Medical Records, Finance Invoices, Fleet Logistics, Curator Soil Reports',
  },
  medical: {
    allowedDomains: ['medical', 'fixture', 'logistics'],
    deniedDomains: ['finance', 'grounds', 'match'],
    description: 'Clinical physiotherapy, injury diagnostics, return-to-play pipelines, and workload monitoring.',
    allowedSummary: 'Physio Clearances, Return-to-Play Sign-offs, Acute Workload Spikes, Concussion Baselines',
    restrictedSummary: 'Live Match Telemetry, Commercial Finance, Pitch Moisture Data',
  },
  scorer: {
    allowedDomains: ['match', 'fixture'],
    deniedDomains: ['medical', 'finance', 'logistics', 'grounds', 'governance', 'academic'],
    description: 'Official CSA scoring token alerts, match delays, team sheet reconciliations, and overs sign-offs.',
    allowedSummary: 'Scoring Session Tokens, Match Over Sign-offs, Umpire Directives, Start Times',
    restrictedSummary: 'Medical Diagnoses, Financial Records, Vehicle Dispatch, Grounds Moisture',
  },
  driver: {
    allowedDomains: ['logistics', 'fixture'],
    deniedDomains: ['match', 'medical', 'finance', 'grounds', 'governance', 'academic'],
    description: 'Fleet operations, bus departure schedules, tollgate clearances, and passenger manifests.',
    allowedSummary: 'Bus Dispatch Tracking, Tollgate Clearances, Fixture Venue Shifts, Passenger Manifests',
    restrictedSummary: 'Match Telemetry Bots, Clinical Records, Sponsor Accounts, Pitch Reports',
  },
  groundskeeper: {
    allowedDomains: ['grounds', 'fixture'],
    deniedDomains: ['match', 'medical', 'finance', 'logistics', 'governance', 'academic'],
    description: 'Curator pitch moisture telemetry, soil compaction, grass cutting schedules, and weather radars.',
    allowedSummary: 'Pitch Moisture Telemetry, Rolling Schedules, Toss Advisories, Weather Radar Alerts',
    restrictedSummary: 'Match Scorer Telemetry, Clinical Diagnoses, Financial Invoices, Bus Routes',
  },
  player: {
    allowedDomains: ['match', 'fixture', 'medical', 'academic', 'logistics'],
    deniedDomains: ['finance', 'grounds', 'governance'],
    description: 'Student athlete portal: squad selection notices, training plans, and personal physio updates.',
    allowedSummary: 'Squad Match Briefings, Personal Physio Clearances, Bus Departure Times, Academic Schedules',
    restrictedSummary: 'Institutional Financial Statements, Pitch Agronomy Logs, POPIA Legal Ledgers',
  },
  parent: {
    allowedDomains: ['fixture', 'logistics', 'governance', 'match', 'academic'],
    deniedDomains: ['medical', 'finance', 'grounds'],
    description: 'Parent & guardian portal: linked child bus tracking, POPIA broadcasts, and live stream links.',
    allowedSummary: 'Bus Tracking & ETA, POPIA Parental Consent, Master Fixture Adjustments, Match Stream Links',
    restrictedSummary: 'Confidential Medical Records of Other Students, Commercial Sponsorship Ledgers, Pitch Soil Data',
  },
  spectator: {
    allowedDomains: ['match', 'fixture'],
    deniedDomains: ['medical', 'finance', 'logistics', 'grounds', 'governance', 'academic'],
    description: 'Public match scorecards, livestream links, and derby day festival announcements.',
    allowedSummary: 'Public Match Scorecards, Derby Day Schedules, Livestream Broadcast Links',
    restrictedSummary: 'All Internal Operations, Staff Communications, Medical & Financial Records',
  },
  scout: {
    allowedDomains: ['match', 'fixture'],
    deniedDomains: ['medical', 'finance', 'logistics', 'grounds', 'governance', 'academic'],
    description: 'Authorized talent discovery on verified public player scorecards and festival fixtures.',
    allowedSummary: 'Sanctioned Tournament Match Calendars, Published Public Scorecards',
    restrictedSummary: 'Private Student PII, Medical Notes, School Fleet Logistics, Financial Disbursements',
  },
};

export function isRoleAuthorizedForNotification(role: string, item: InboxItem): boolean {
  if (!role || role === 'superadmin') return true;

  // 1. Explicit Denial Check
  if (item.deniedRoles && item.deniedRoles.includes(role)) {
    return false;
  }

  // 2. Explicit Allowlist Check
  if (item.allowedRoles && item.allowedRoles.length > 0) {
    return item.allowedRoles.includes(role);
  }

  // 3. Category/Domain RBAC Check
  const config = ROLE_NOTIFICATION_CONFIG[role];
  if (!config) return true;

  if (config.deniedDomains.includes(item.category)) {
    return false;
  }

  return config.allowedDomains.includes(item.category);
}

// ── COMPREHENSIVE INITIAL INBOX REPOSITORY ─────────────────
const INITIAL_INBOX_ITEMS: InboxItem[] = [
  // ── 1. Commercial & Finance Stream (Strictly for Finance Admin, Headmaster, School Admin, Super Admin)
  {
    id: "fin1",
    type: "alert",
    category: "finance",
    title: "Commercial Sponsorship Disbursement: Derivco 1st XI Sleeve Rights",
    sender: "Commercial Rights Desk",
    senderRole: "Corporate Partnerships & Treasury",
    body: "R 145,000 Q3 tranche received and allocated to General Sporting Fund. Automated tax invoice INV-2026-D09 generated and filed under Section 18A register.",
    time: "15 mins ago",
    read: false,
    starred: true,
    actionLabel: "View Commercial Ledger →",
    targetPage: "sponsorship",
    priority: "high",
    allowedRoles: ["superadmin", "financeadmin", "headmaster", "schooladmin"],
    securityLevel: 3,
  },
  {
    id: "fin2",
    type: "approval",
    category: "finance",
    title: "Sign-off Required: Bus Charter & Tollgate Levy Reconciliation",
    sender: "Fleet Operations Billing",
    senderRole: "Accounts Payable Desk",
    body: "Iveco 35-Seater fleet monthly invoice (R 38,400) for Highway Derby transit awaiting Finance Admin reconciliation and payment release before Friday banking cut-off.",
    time: "1 hour ago",
    read: false,
    starred: true,
    actionLabel: "Reconcile Invoice →",
    targetPage: "logistics",
    priority: "urgent",
    approvalStatus: "pending",
    allowedRoles: ["superadmin", "financeadmin", "headmaster"],
    securityLevel: 3,
  },
  {
    id: "fin3",
    type: "alert",
    category: "finance",
    title: "Tournament Settlement Notice: Oppenheimer Michaelmas Cricket Week",
    sender: "KZN Schools Finance Bureau",
    senderRole: "Inter-School Accounts Clearing",
    body: "Balance invoice for 1st XI player boarding, tournament levies, and match balls (R 24,500) generated. Payment due by 15 September 2026 to ensure team registration lock.",
    time: "3 hours ago",
    read: false,
    actionLabel: "Open Payment Portal →",
    targetPage: "sponsorship",
    priority: "normal",
    allowedRoles: ["superadmin", "financeadmin", "headmaster", "schooladmin"],
    securityLevel: 3,
  },
  {
    id: "fin4",
    type: "approval",
    category: "finance",
    title: "Commercial Kit Sponsorship Contract Sign-off: Standard Bank Festival",
    sender: "Institutional Brand Office",
    senderRole: "Director of Institutional Advancement",
    body: "Apparel co-branding agreement with Standard Bank (R 80,000 value-in-kind) approved by Sportsmaster. Counter-signature by Finance Admin required for financial execution.",
    time: "Yesterday, 11:30",
    read: true,
    actionLabel: "Review Contract Terms →",
    targetPage: "sponsorship",
    priority: "high",
    approvalStatus: "approved",
    allowedRoles: ["superadmin", "financeadmin", "headmaster"],
    securityLevel: 3,
  },

  // ── 2. Live Match & Scorer Telemetry Bot Stream (Strictly for Coaches, Scorer, Analyst, Sportsmaster, DOC, Athletes - NOT Finance Admin)
  {
    id: "mat1",
    type: "alert",
    category: "match",
    title: "Live Match Milestone: Century Partnership",
    sender: "SCRBRD Telemetry Bot",
    senderRole: "Live Scorer Engine",
    body: "Westville U19A vs Kearsney College: J. Whitfield (74*) and R. Campbell (48*) have compiled a 112-run opening stand. Current RR: 9.85 rpo. Projected total: 245/4.",
    time: "2 mins ago",
    read: false,
    starred: true,
    actionLabel: "Open Match Scorer →",
    targetPage: "matches",
    priority: "high",
    deniedRoles: ["financeadmin", "driver", "groundskeeper", "medical"],
    allowedRoles: ["superadmin", "headcoach", "coach", "assistant", "analyst", "scorer", "sportsmaster", "doc", "headmaster", "player", "parent", "spectator", "scout"],
    securityLevel: 1,
  },
  {
    id: "mat2",
    type: "message",
    category: "match",
    title: "1st XI Squad Briefing: Match Strategy vs Kearsney",
    sender: "Coach Wayne Whitfield",
    senderRole: "Head Coach, 1st XI",
    body: "Gentlemen, toss is at 08:45 AM on Bowden's Field. We will bowl first if overhead conditions persist. Bring both whites and color kits. Be at the clubhouse by 07:30 sharp.",
    time: "Yesterday, 18:20",
    read: false,
    starred: true,
    actionLabel: "View 1st XI Squad →",
    targetPage: "squad",
    priority: "high",
    deniedRoles: ["financeadmin", "driver", "groundskeeper", "medical", "scorer", "spectator", "scout"],
    allowedRoles: ["superadmin", "headcoach", "doc", "sportsmaster", "player", "parent", "headmaster"],
    securityLevel: 2,
  },
  {
    id: "mat3",
    type: "approval",
    category: "match",
    title: "Sign-off Required: Official 1st XI Team Sheet vs Kearsney",
    sender: "Match Officiating Desk",
    senderRole: "CSA Umpires Panel",
    body: "Playing XI team sheets have been submitted by Westville Boys' High. Sportsmaster / Head Coach signature required before the coin toss at 08:30 AM.",
    time: "35 mins ago",
    read: false,
    starred: true,
    actionLabel: "Review & Sign Sheet →",
    targetPage: "matches",
    priority: "urgent",
    approvalStatus: "pending",
    deniedRoles: ["financeadmin", "driver", "groundskeeper", "medical", "player", "parent", "analyst"],
    allowedRoles: ["superadmin", "sportsmaster", "doc", "headcoach", "scorer"],
    securityLevel: 2,
  },
  {
    id: "mat4",
    type: "alert",
    category: "match",
    title: "Hawk-Eye DRS Telemetry Synchronized: 360° Pitch Map Ready",
    sender: "SCRBRD Telemetry Bot",
    senderRole: "Performance Tracking AI",
    body: "Release speed, pitch deviation, and beehive clustering data from Bowden's Field Oval successfully uploaded for analyst review.",
    time: "10 mins ago",
    read: true,
    actionLabel: "Inspect Wagon Wheel →",
    targetPage: "analytics",
    priority: "normal",
    deniedRoles: ["financeadmin", "driver", "groundskeeper", "medical"],
    allowedRoles: ["superadmin", "analyst", "headcoach", "doc", "sportsmaster"],
    securityLevel: 1,
  },

  // ── 3. Medical & Physio Stream (Strictly for Medical, Sportsmaster, DOC, Head Coach summaries - NOT Finance Admin)
  {
    id: "med1",
    type: "alert",
    category: "medical",
    title: "Physio Clearance Notice: Stage 3 Rehabilitation",
    sender: "Dr. Sister N. Mkhize",
    senderRole: "Lead Physiotherapist",
    body: "Theo Pretorius (Grade 2 Hamstring Strain) progressed to Stage 3 Skill Re-Integration. Cleared for throw-downs and straight-line running under coach supervision.",
    time: "45 mins ago",
    read: false,
    actionLabel: "View Rehab Plan →",
    targetPage: "injuries",
    priority: "urgent",
    deniedRoles: ["financeadmin", "analyst", "driver", "groundskeeper", "scorer", "spectator", "scout", "platformsupport"],
    allowedRoles: ["superadmin", "medical", "doc", "sportsmaster", "headcoach", "coach", "player", "parent"],
    securityLevel: 4,
  },
  {
    id: "med2",
    type: "approval",
    category: "medical",
    title: "Return-to-Play Final Sign-off: Luca De Villiers",
    sender: "Sports Medicine Unit",
    senderRole: "Chief Medical Officer",
    body: "Pace bowler Luca De Villiers has completed 6-over bowling load testing with zero lumbar discomfort. Medical clearance ready for coach selection approval.",
    time: "3 hours ago",
    read: false,
    actionLabel: "Approve Clearance →",
    targetPage: "injuries",
    priority: "high",
    approvalStatus: "pending",
    deniedRoles: ["financeadmin", "analyst", "driver", "groundskeeper", "scorer", "spectator", "scout", "platformsupport"],
    allowedRoles: ["superadmin", "medical", "doc", "sportsmaster", "headcoach"],
    securityLevel: 4,
  },
  {
    id: "med3",
    type: "alert",
    category: "medical",
    title: "Workload Monitor: Fast Bowler Acute-to-Chronic Spike (1.48)",
    sender: "Sports Medicine Biomechanics Desk",
    senderRole: "Load Management System",
    body: "M. Ngcobo exceeded recommended weekly delivery quota (28.4 overs in 5 days). Recommended 48h active recovery and maximum 4 overs in tomorrow's fixture.",
    time: "4 hours ago",
    read: false,
    actionLabel: "Adjust Bowler Quota →",
    targetPage: "injuries",
    priority: "high",
    deniedRoles: ["financeadmin", "analyst", "driver", "groundskeeper", "scorer", "spectator", "scout"],
    allowedRoles: ["superadmin", "medical", "doc", "sportsmaster", "headcoach"],
    securityLevel: 4,
  },

  // ── 4. Fleet & Logistics Stream
  {
    id: "log1",
    type: "alert",
    category: "logistics",
    title: "Transport Dispatch: Coach ND 849-211 En Route to DHS",
    sender: "Logistics Dispatch Center",
    senderRole: "Fleet Operations",
    body: "Iveco 35-Seater Coach carrying the U15A squad has cleared the Marianhill tollgate. GPS telemetry confirms on-time arrival: ETA at Durban High School 07:15 AM.",
    time: "2 hours ago",
    read: false,
    actionLabel: "Track Vehicle Telemetry →",
    targetPage: "logistics",
    priority: "normal",
    deniedRoles: ["scorer", "analyst", "groundskeeper", "spectator", "scout"],
    allowedRoles: ["superadmin", "schooladmin", "driver", "sportsmaster", "doc", "headcoach", "coach", "parent", "player", "financeadmin"],
    securityLevel: 2,
  },
  {
    id: "log2",
    type: "approval",
    category: "logistics",
    title: "Driver Passenger Manifest Sign-off: Highway Derby Transit",
    sender: "Fleet Safety Controller",
    senderRole: "Transport Compliance Officer",
    body: "Passenger manifest of 28 registered student-athletes and 3 coaching staff verified against parental consent database. Driver sign-off logged.",
    time: "Yesterday, 06:15",
    read: true,
    actionLabel: "View Manifest →",
    targetPage: "logistics",
    priority: "normal",
    approvalStatus: "approved",
    deniedRoles: ["scorer", "analyst", "groundskeeper", "spectator", "scout"],
    allowedRoles: ["superadmin", "schooladmin", "driver", "sportsmaster", "financeadmin"],
    securityLevel: 2,
  },

  // ── 5. Turfgrass & Grounds Stream
  {
    id: "grd1",
    type: "alert",
    category: "grounds",
    title: "Curator Advisory: Bowden's Field Strip #2",
    sender: "Keith Venter",
    senderRole: "Head Curator",
    body: "Moisture levels recorded at 16.8% (Target: 17%). Final cross-rolling complete. Surface firm with true carry. Recommended toss decision: Bat first.",
    time: "3 hours ago",
    read: true,
    actionLabel: "Inspect Pitch Moisture →",
    targetPage: "fields",
    priority: "normal",
    deniedRoles: ["financeadmin", "medical", "driver", "scorer", "player", "parent", "spectator", "scout"],
    allowedRoles: ["superadmin", "groundskeeper", "headcoach", "doc", "sportsmaster", "headmaster", "schooladmin"],
    securityLevel: 2,
  },

  // ── 6. Master Fixtures & Calendar Stream
  {
    id: "fix1",
    type: "alert",
    category: "fixture",
    title: "Derby Reschedule: U13A Match Adjusted",
    sender: "KZN Schools Fixture Secretary",
    senderRole: "Fixture Commission",
    body: "Roy Couzens Oval start time adjusted to 10:00 AM to facilitate traveling teams and buses arriving from Michaelhouse Balgowan.",
    time: "5 hours ago",
    read: true,
    actionLabel: "View Master Calendar →",
    targetPage: "calendar",
    priority: "normal",
    securityLevel: 1,
  },

  // ── 7. POPIA Governance & Regulatory Stream
  {
    id: "gov1",
    type: "message",
    category: "governance",
    title: "POPIA Annual Consent Confirmation for Student Profiles",
    sender: "Compliance & Legal Office",
    senderRole: "School Data Protection Officer",
    body: "All parental consent certificates for livestream broadcasting, commercial partner exposure, and public scorecard publication have been verified for the 2026 Michaelmas term.",
    time: "Yesterday, 14:10",
    read: true,
    actionLabel: "Review POPIA Ledger →",
    targetPage: "governance",
    priority: "normal",
    allowedRoles: ["superadmin", "headmaster", "schooladmin", "financeadmin", "doc", "sportsmaster", "parent", "platformsupport"],
    securityLevel: 3,
  },

  // ── 8. Academic & Sports Bursary Stream
  {
    id: "aca1",
    type: "message",
    category: "academic",
    title: "Mid-Year Sports Bursary & Scholar Financial Allocation Meeting",
    sender: "Headmaster's Executive Board",
    senderRole: "Executive Board",
    body: "The sports scholarship committee will review dual-code scholar academic progression and termly bursary fee remissions this Thursday in the heritage boardroom at 16:30.",
    time: "2 days ago",
    read: true,
    actionLabel: "Open Bursary Summary →",
    targetPage: "sponsorship",
    priority: "normal",
    allowedRoles: ["superadmin", "headmaster", "schooladmin", "financeadmin", "sportsmaster", "doc"],
    securityLevel: 3,
  },
];

export default function NotificationsView({
  theme: D,
  currentRole = 'superadmin',
  onNavigate,
  onTriggerToast,
}: NotificationsViewProps) {
  const [items, setItems] = useState<InboxItem[]>(INITIAL_INBOX_ITEMS);
  const [activeTab, setActiveTab] = useState<'all' | 'messages' | 'alerts' | 'approvals' | 'starred'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showComposeModal, setShowComposeModal] = useState<boolean>(false);
  const [composeData, setComposeData] = useState({
    recipient: '1st XI Squad & Staff',
    subject: '',
    category: 'match' as NotificationCategory,
    priority: 'normal' as const,
    message: '',
  });

  const roleMeta = ROLES[currentRole] || ROLES.superadmin;
  const roleConfig = ROLE_NOTIFICATION_CONFIG[currentRole] || ROLE_NOTIFICATION_CONFIG.superadmin;
  const popiaLevel = POPIA_POLICIES[currentRole]?.sensitivityMax || 1;

  // ── 1. Apply Strict RBAC Authorization Filter ─────────────
  const authorizedItems = items.filter(item => isRoleAuthorizedForNotification(currentRole, item));

  // ── 2. Calculate Counts from Authorized Items Only ───────
  const unreadCount = authorizedItems.filter(i => !i.read).length;
  const alertCount = authorizedItems.filter(i => i.type === 'alert' && !i.read).length;
  const messageCount = authorizedItems.filter(i => i.type === 'message' && !i.read).length;
  const approvalCount = authorizedItems.filter(i => i.type === 'approval' && i.approvalStatus === 'pending').length;
  const starredCount = authorizedItems.filter(i => i.starred).length;

  const markAllRead = () => {
    const authorizedIds = new Set(authorizedItems.map(i => i.id));
    setItems(prev => prev.map(i => (authorizedIds.has(i.id) ? { ...i, read: true } : i)));
  };

  const toggleRead = (id: string) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, read: !i.read } : i)));
  };

  const toggleStar = (id: string) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, starred: !i.starred } : i)));
  };

  const handleApprove = (id: string) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, approvalStatus: 'approved', read: true } : i)));
    if (onTriggerToast) {
      onTriggerToast('Item Approved', 'Item officially signed and logged into institutional ledger.', 'approval');
    }
  };

  const handleReject = (id: string) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, approvalStatus: 'rejected', read: true } : i)));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeData.subject.trim() || !composeData.message.trim()) return;

    const newItem: InboxItem = {
      id: `m_${Date.now()}`,
      type: 'message',
      category: composeData.category,
      title: composeData.subject,
      sender: `You (${roleMeta.label})`,
      senderRole: composeData.recipient,
      body: composeData.message,
      time: 'Just now',
      read: true,
      starred: false,
      priority: composeData.priority,
      securityLevel: popiaLevel,
    };

    setItems([newItem, ...items]);
    setShowComposeModal(false);
    setComposeData({
      recipient: currentRole === 'financeadmin' ? 'Finance & Bursary Committee' : '1st XI Squad & Staff',
      subject: '',
      category: currentRole === 'financeadmin' ? 'finance' : 'match',
      priority: 'normal',
      message: '',
    });

    if (onTriggerToast) {
      onTriggerToast('Message Broadcasted', `Sent "${newItem.title}" to ${newItem.senderRole}.`, 'message');
    }
  };

  // Filter items by Tab, Domain, and Search
  const filteredItems = authorizedItems.filter(item => {
    // Tab filter
    if (activeTab === 'messages' && item.type !== 'message') return false;
    if (activeTab === 'alerts' && item.type !== 'alert') return false;
    if (activeTab === 'approvals' && item.type !== 'approval') return false;
    if (activeTab === 'starred' && !item.starred) return false;

    // Category filter
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.body.toLowerCase().includes(q) ||
        item.sender.toLowerCase().includes(q) ||
        item.senderRole.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const getCategoryBadge = (cat: NotificationCategory) => {
    switch (cat) {
      case 'finance':
        return { col: D.emerald, icon: '💳', label: 'COMMERCIAL & FINANCE' };
      case 'match':
        return { col: D.sky, icon: '🏏', label: 'MATCH EVENT' };
      case 'medical':
        return { col: D.rose, icon: '⚕️', label: 'MEDICAL & PHYSIO' };
      case 'logistics':
        return { col: D.amber, icon: '🚌', label: 'FLEET & BUS' };
      case 'grounds':
        return { col: D.teal, icon: '🌿', label: 'CURATOR / TURF' };
      case 'governance':
        return { col: D.violet, icon: '⚖️', label: 'POPIA GOVERNANCE' };
      case 'academic':
        return { col: D.indigo, icon: '🎓', label: 'ACADEMIC & BOARD' };
      default:
        return { col: D.sky, icon: '📅', label: 'FIXTURE' };
    }
  };

  // Trigger a role-appropriate live test toast
  const handleTestLiveToast = () => {
    if (!onTriggerToast) return;
    if (currentRole === 'financeadmin') {
      onTriggerToast(
        'Commercial Sponsorship Alert',
        'Derivco R 145,000 Q3 tranche disbursement confirmed into Sporting Account.',
        'finance',
        'sponsorship'
      );
    } else if (currentRole === 'medical') {
      onTriggerToast(
        'Physio Clearance Alert',
        'Theo Pretorius completed Stage 3 rehab. Cleared for throw-downs.',
        'medical',
        'injuries'
      );
    } else if (currentRole === 'driver') {
      onTriggerToast(
        'Fleet Dispatch Alert',
        'Iveco 35-Seater Coach ND 849-211 cleared Marianhill Tollgate on schedule.',
        'logistics',
        'logistics'
      );
    } else if (currentRole === 'groundskeeper') {
      onTriggerToast(
        'Turf Moisture Telemetry',
        "Bowden's Field Strip #2 moisture recorded at 16.8% (Target: 17%).",
        'grounds',
        'fields'
      );
    } else {
      onTriggerToast(
        'Live Match Milestone',
        'Westville U19A: 150 up in 15.2 overs vs Kearsney College!',
        'match',
        'matches'
      );
    }
  };

  // Build the list of available domain filter chips for the active role
  const allDomainChips: { id: string; label: string; icon: string; cat: NotificationCategory }[] = [
    { id: 'finance', label: 'Commercial & Finance', icon: '💳', cat: 'finance' },
    { id: 'match', label: 'Match Events', icon: '🏏', cat: 'match' },
    { id: 'medical', label: 'Medical & Physio', icon: '⚕️', cat: 'medical' },
    { id: 'logistics', label: 'Fleet & Logistics', icon: '🚌', cat: 'logistics' },
    { id: 'grounds', label: 'Curator & Turf', icon: '🌿', cat: 'grounds' },
    { id: 'governance', label: 'POPIA / Legal', icon: '⚖️', cat: 'governance' },
    { id: 'academic', label: 'Academic & Board', icon: '🎓', cat: 'academic' },
    { id: 'fixture', label: 'Fixtures', icon: '📅', cat: 'fixture' },
  ];

  const availableDomainChips = allDomainChips.filter(chip => roleConfig.allowedDomains.includes(chip.cat));

  return (
    <div id="unified-inbox-view" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Header with Title and Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: D.md,
                background: `${roleMeta.color || D.indigo}20`,
                border: `1px solid ${roleMeta.color || D.indigo}44`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}
            >
              📥
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontFamily: D.head, fontSize: '20px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                  Unified Inbox & Institutional Communications
                </h2>
                <span
                  style={{
                    fontFamily: D.mono,
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: D.pill,
                    background: `${roleMeta.color || D.indigo}25`,
                    color: roleMeta.color || D.indigo,
                    border: `1px solid ${roleMeta.color || D.indigo}44`,
                    textTransform: 'uppercase',
                  }}
                >
                  {roleMeta.icon} {roleMeta.label}
                </span>
              </div>
              <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted, marginTop: '2px' }}>
                Role-governed communication hub with automated POPIA stream isolation and auditable sign-offs
              </div>
            </div>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onTriggerToast && (
            <button
              id="test-live-toast-btn"
              onClick={handleTestLiveToast}
              style={{
                padding: '7px 12px',
                borderRadius: D.pill,
                background: `${D.emerald}15`,
                border: `1px solid ${D.emerald}44`,
                color: D.emerald,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>⚡</span>
              <span>Test Role Toast</span>
            </button>
          )}

          <button
            id="new-announcement-btn"
            onClick={() => setShowComposeModal(true)}
            style={{
              padding: '7px 16px',
              borderRadius: D.pill,
              background: D.indigo,
              border: 'none',
              color: '#fff',
              fontFamily: D.head,
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: `0 2px 8px ${D.indigo}44`,
            }}
          >
            <span>✉️</span>
            <span>New Announcement</span>
          </button>

          {unreadCount > 0 && (
            <button
              id="mark-all-read-btn"
              onClick={markAllRead}
              style={{
                padding: '7px 12px',
                borderRadius: D.pill,
                background: D.surf2,
                border: `1px solid ${D.border}`,
                color: D.textSecondary,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ✓ Mark All Read ({unreadCount})
            </button>
          )}
        </div>
      </div>

      {/* ── STRICT RBAC COMPLIANCE BANNER ── */}
      <div
        id="rbac-compliance-status-banner"
        style={{
          padding: '12px 16px',
          borderRadius: D.lg,
          background: `${roleMeta.color || D.indigo}0d`,
          border: `1px solid ${roleMeta.color || D.indigo}33`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: D.sm,
              background: `${roleMeta.color || D.indigo}22`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
            }}
          >
            🛡️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.textPrimary }}>
                RBAC Security Enforcement: {roleMeta.label}
              </span>
              <span
                style={{
                  fontFamily: D.mono,
                  fontSize: '9px',
                  padding: '1px 6px',
                  borderRadius: '3px',
                  background: D.surf2,
                  border: `1px solid ${D.border}`,
                  color: D.textMuted,
                }}
              >
                POPIA Level: {popiaLevel}/4 ({roleMeta.scope})
              </span>
            </div>
            <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary, marginTop: '2px' }}>
              <span style={{ color: D.emerald, fontWeight: 700 }}>✓ Authorized:</span> {roleConfig.allowedSummary}
              {roleConfig.deniedDomains.length > 0 && (
                <>
                  {' '}
                  <span style={{ color: D.rose, fontWeight: 700, marginLeft: '6px' }}>🚫 Restricted:</span>{' '}
                  {roleConfig.restrictedSummary}
                </>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontFamily: D.mono,
              fontSize: '10px',
              padding: '3px 8px',
              borderRadius: D.pill,
              background: D.surf2,
              border: `1px solid ${D.border}`,
              color: D.textMuted,
            }}
          >
            {authorizedItems.length} of {items.length} streams visible
          </span>
        </div>
      </div>

      {/* Main Tabs Navigation Bar */}
      <div
        id="inbox-tabs-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${D.border}`,
          gap: '12px',
          flexWrap: 'wrap',
          paddingBottom: '4px',
        }}
      >
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {[
            { id: 'all', label: 'All Items', icon: '📬', count: authorizedItems.length },
            { id: 'messages', label: 'Messages & Broadcasts', icon: '✉️', count: messageCount },
            { id: 'alerts', label: 'Telemetry & Alerts', icon: '🚨', count: alertCount },
            { id: 'approvals', label: 'Sign-offs & Approvals', icon: '📋', count: approvalCount },
            { id: 'starred', label: 'Starred', icon: '⭐', count: starredCount },
          ].map(tab => {
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '8px 14px',
                  borderRadius: `${D.md} ${D.md} 0 0`,
                  background: isSel ? D.surf2 : 'transparent',
                  borderBottom: `2px solid ${isSel ? D.indigo : 'transparent'}`,
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  color: isSel ? D.textPrimary : D.textMuted,
                  fontFamily: D.head,
                  fontSize: '12px',
                  fontWeight: isSel ? 800 : 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    style={{
                      padding: '1px 6px',
                      borderRadius: D.pill,
                      background: isSel ? D.indigo : D.surf3,
                      color: isSel ? '#fff' : D.textMuted,
                      fontSize: '10px',
                      fontFamily: D.mono,
                      fontWeight: 700,
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '220px' }}>
          <input
            id="inbox-search-input"
            type="text"
            placeholder="Search authorized inbox..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px 6px 28px',
              borderRadius: D.pill,
              background: D.surf1,
              border: `1px solid ${D.border}`,
              color: D.textPrimary,
              fontFamily: D.body,
              fontSize: '11px',
              outline: 'none',
            }}
          />
          <span
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '11px',
              color: D.textMuted,
            }}
          >
            🔍
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: D.textMuted,
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Chips (Dynamic by Active Role RBAC) */}
      <div id="domain-filter-chips" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span
          style={{
            fontFamily: D.head,
            fontSize: '10px',
            fontWeight: 700,
            color: D.textMuted,
            marginRight: '4px',
            textTransform: 'uppercase',
          }}
        >
          Authorized Domains:
        </span>
        <button
          id="filter-all-domains"
          onClick={() => setCategoryFilter('all')}
          style={{
            padding: '4px 10px',
            borderRadius: D.pill,
            border: `1px solid ${categoryFilter === 'all' ? D.indigo : D.border}`,
            background: categoryFilter === 'all' ? `${D.indigo}20` : D.surf1,
            color: categoryFilter === 'all' ? D.sky || D.indigo : D.textMuted,
            fontFamily: D.head,
            fontSize: '10px',
            fontWeight: categoryFilter === 'all' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <span>🌐</span>
          <span>All Authorized ({authorizedItems.length})</span>
        </button>

        {availableDomainChips.map(chip => {
          const isSel = categoryFilter === chip.id;
          const count = authorizedItems.filter(i => i.category === chip.cat).length;
          return (
            <button
              key={chip.id}
              id={`filter-domain-${chip.id}`}
              onClick={() => setCategoryFilter(chip.id)}
              style={{
                padding: '4px 10px',
                borderRadius: D.pill,
                border: `1px solid ${isSel ? D.indigo : D.border}`,
                background: isSel ? `${D.indigo}20` : D.surf1,
                color: isSel ? D.sky || D.indigo : D.textMuted,
                fontFamily: D.head,
                fontSize: '10px',
                fontWeight: isSel ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span>{chip.icon}</span>
              <span>{chip.label}</span>
              {count > 0 && (
                <span style={{ fontSize: '9px', opacity: 0.75, fontFamily: D.mono }}>({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Inbox Feed */}
      <div id="inbox-items-feed" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredItems.length === 0 ? (
          <div
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              background: D.surf1,
              borderRadius: D.lg,
              border: `1px solid ${D.border}`,
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>📭</div>
            <div style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 700, color: D.textPrimary }}>
              No messages or alerts found for {roleMeta.label}
            </div>
            <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted, marginTop: '4px' }}>
              {searchQuery
                ? `No results matching "${searchQuery}"`
                : `Your authorized stream for ${roleMeta.label} is all caught up.`}
            </div>
          </div>
        ) : (
          filteredItems.map(item => {
            const badge = getCategoryBadge(item.category);
            const isUnread = !item.read;

            return (
              <div
                key={item.id}
                id={`inbox-item-${item.id}`}
                style={{
                  padding: '16px 18px',
                  borderRadius: D.lg,
                  background: isUnread ? `${D.indigo}0c` : D.surf1,
                  border: `1px solid ${isUnread ? D.indigo + '40' : D.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'all 0.15s ease',
                  boxShadow: isUnread ? `0 2px 10px ${D.indigo}10` : 'none',
                }}
              >
                {/* Item Top Row */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
                    {/* Star Button */}
                    <button
                      id={`star-btn-${item.id}`}
                      onClick={() => toggleStar(item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: item.starred ? '#eab308' : D.textMuted,
                        padding: '2px',
                      }}
                      title={item.starred ? 'Unstar' : 'Star'}
                    >
                      {item.starred ? '★' : '☆'}
                    </button>

                    {/* Category Icon Badge */}
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: D.md,
                        background: `${badge.col}18`,
                        border: `1px solid ${badge.col}33`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '15px',
                        flexShrink: 0,
                      }}
                    >
                      {badge.icon}
                    </div>

                    {/* Sender & Metadata */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
                          {item.sender}
                        </span>
                        <span
                          style={{
                            fontFamily: D.mono,
                            fontSize: '9px',
                            color: badge.col,
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '3px',
                            background: `${badge.col}15`,
                          }}
                        >
                          {badge.label}
                        </span>
                        {item.priority === 'urgent' && (
                          <span
                            style={{
                              fontFamily: D.mono,
                              fontSize: '9px',
                              color: '#ef4444',
                              fontWeight: 800,
                              padding: '1px 5px',
                              borderRadius: '3px',
                              background: '#ef444420',
                            }}
                          >
                            URGENT
                          </span>
                        )}
                        {item.type === 'approval' && (
                          <span
                            style={{
                              fontFamily: D.mono,
                              fontSize: '9px',
                              color: D.amber,
                              fontWeight: 800,
                              padding: '1px 5px',
                              borderRadius: '3px',
                              background: `${D.amber}20`,
                            }}
                          >
                            SIGN-OFF REQUIRED
                          </span>
                        )}
                      </div>
                      <span style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                        {item.senderRole}
                      </span>
                    </div>
                  </div>

                  {/* Timestamp & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                      {item.time}
                    </span>
                    {isUnread && (
                      <span
                        style={{ width: '8px', height: '8px', borderRadius: '50%', background: D.indigo }}
                        title="Unread"
                      />
                    )}
                    <button
                      id={`read-toggle-${item.id}`}
                      onClick={() => toggleRead(item.id)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: D.sm,
                        background: 'transparent',
                        border: `1px solid ${D.border}`,
                        color: D.textMuted,
                        fontFamily: D.mono,
                        fontSize: '10px',
                        cursor: 'pointer',
                      }}
                    >
                      {item.read ? 'Mark Unread' : 'Mark Read'}
                    </button>
                    <button
                      id={`delete-btn-${item.id}`}
                      onClick={() => deleteItem(item.id)}
                      style={{
                        padding: '3px 6px',
                        borderRadius: D.sm,
                        background: 'transparent',
                        border: 'none',
                        color: D.textMuted,
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                      title="Delete / Dismiss"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Subject / Title */}
                <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 700, color: D.textPrimary }}>
                  {item.title}
                </div>

                {/* Body Content */}
                <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textSecondary, lineHeight: 1.6 }}>
                  {item.body}
                </div>

                {/* Bottom Row with Approvals or Navigation Actions */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                    paddingTop: '6px',
                    borderTop: `1px solid ${D.border}44`,
                  }}
                >
                  {/* Approval Actions */}
                  {item.type === 'approval' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {item.approvalStatus === 'pending' ? (
                        <>
                          <button
                            id={`approve-btn-${item.id}`}
                            onClick={() => handleApprove(item.id)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: D.sm,
                              background: D.emerald,
                              border: 'none',
                              color: '#fff',
                              fontFamily: D.head,
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            ✓ Approve & Sign
                          </button>
                          <button
                            id={`reject-btn-${item.id}`}
                            onClick={() => handleReject(item.id)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: D.sm,
                              background: 'transparent',
                              border: `1px solid ${D.rose}`,
                              color: D.rose,
                              fontFamily: D.head,
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            ✕ Reject
                          </button>
                        </>
                      ) : (
                        <span
                          style={{
                            fontFamily: D.head,
                            fontSize: '11px',
                            fontWeight: 700,
                            color: item.approvalStatus === 'approved' ? D.emerald : D.rose,
                          }}
                        >
                          Status: {item.approvalStatus === 'approved' ? '✓ Approved & Signed' : '✕ Rejected'}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div />
                  )}

                  {/* Deep Link Navigation CTA */}
                  {item.actionLabel && item.targetPage && (
                    <button
                      id={`navigate-btn-${item.id}`}
                      onClick={() => onNavigate(item.targetPage!)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: D.sm,
                        background: `${D.indigo}15`,
                        border: `1px solid ${D.indigo}44`,
                        color: D.sky || D.indigo,
                        fontFamily: D.head,
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {item.actionLabel}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Compose Announcement Modal */}
      {showComposeModal && (
        <div
          id="compose-announcement-modal"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              background: D.surf0,
              border: `1px solid ${D.borderMed}`,
              borderRadius: D.xl,
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: `1px solid ${D.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>✉️</span>
                <h3 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
                  Compose Announcement / Circular ({roleMeta.label})
                </h3>
              </div>
              <button
                id="close-compose-modal-btn"
                onClick={() => setShowComposeModal(false)}
                style={{ background: 'none', border: 'none', color: D.textMuted, cursor: 'pointer', fontSize: '16px' }}
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSendMessage} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: D.head,
                    fontSize: '11px',
                    fontWeight: 700,
                    color: D.textMuted,
                    marginBottom: '4px',
                  }}
                >
                  Target Audience / Squad
                </label>
                <select
                  id="compose-recipient-select"
                  value={composeData.recipient}
                  onChange={e => setComposeData({ ...composeData, recipient: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: D.md,
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    color: D.textPrimary,
                    fontFamily: D.body,
                    fontSize: '12px',
                  }}
                >
                  {currentRole === 'financeadmin' ? (
                    <>
                      <option value="Finance & Bursary Committee">💳 Finance & Bursary Committee</option>
                      <option value="School Executive Board">🏛️ School Executive Board</option>
                      <option value="Commercial Sponsors & Partners">💼 Commercial Sponsors & Partners</option>
                      <option value="Fleet & Transport Billing Desk">🚌 Fleet & Transport Billing Desk</option>
                    </>
                  ) : currentRole === 'medical' ? (
                    <>
                      <option value="Medical & Physio Staff">⚕️ Medical & Physio Staff</option>
                      <option value="1st XI Squad & Staff">🏏 1st XI Coaching Staff</option>
                      <option value="Parents of Injured Athletes">👪 Parents of Injured Athletes</option>
                    </>
                  ) : (
                    <>
                      <option value="1st XI Squad & Staff">🏏 1st XI Squad & Staff</option>
                      <option value="All Junior Cricket Age Groups">👥 All Junior Cricket Age Groups (U14-U16)</option>
                      <option value="Parents & Guardians of Athletes">👪 Parents & Guardians of Athletes</option>
                      <option value="Coaches, Curators & Sportsmasters">🏅 Coaches, Curators & Sportsmasters</option>
                      <option value="School Executive Committee">🏛️ School Executive Committee</option>
                    </>
                  )}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: D.head,
                      fontSize: '11px',
                      fontWeight: 700,
                      color: D.textMuted,
                      marginBottom: '4px',
                    }}
                  >
                    Domain Category
                  </label>
                  <select
                    id="compose-category-select"
                    value={composeData.category}
                    onChange={e => setComposeData({ ...composeData, category: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: D.md,
                      background: D.surf2,
                      border: `1px solid ${D.border}`,
                      color: D.textPrimary,
                      fontFamily: D.body,
                      fontSize: '12px',
                    }}
                  >
                    {availableDomainChips.map(chip => (
                      <option key={chip.cat} value={chip.cat}>
                        {chip.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: D.head,
                      fontSize: '11px',
                      fontWeight: 700,
                      color: D.textMuted,
                      marginBottom: '4px',
                    }}
                  >
                    Priority Level
                  </label>
                  <select
                    id="compose-priority-select"
                    value={composeData.priority}
                    onChange={e => setComposeData({ ...composeData, priority: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: D.md,
                      background: D.surf2,
                      border: `1px solid ${D.border}`,
                      color: D.textPrimary,
                      fontFamily: D.body,
                      fontSize: '12px',
                    }}
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Broadcast</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: D.head,
                    fontSize: '11px',
                    fontWeight: 700,
                    color: D.textMuted,
                    marginBottom: '4px',
                  }}
                >
                  Subject / Headline
                </label>
                <input
                  id="compose-subject-input"
                  type="text"
                  placeholder={
                    currentRole === 'financeadmin'
                      ? 'e.g. Q3 Sponsorship Tranche Settlement Notice'
                      : 'e.g. Saturday Departure Time Update for Derby'
                  }
                  value={composeData.subject}
                  onChange={e => setComposeData({ ...composeData, subject: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: D.md,
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    color: D.textPrimary,
                    fontFamily: D.body,
                    fontSize: '12px',
                  }}
                  required
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: D.head,
                    fontSize: '11px',
                    fontWeight: 700,
                    color: D.textMuted,
                    marginBottom: '4px',
                  }}
                >
                  Message Content
                </label>
                <textarea
                  id="compose-message-textarea"
                  placeholder="Type your official circular or institutional announcement here..."
                  rows={4}
                  value={composeData.message}
                  onChange={e => setComposeData({ ...composeData, message: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: D.md,
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    color: D.textPrimary,
                    fontFamily: D.body,
                    fontSize: '12px',
                    resize: 'vertical',
                  }}
                  required
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  id="compose-cancel-btn"
                  onClick={() => setShowComposeModal(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: D.md,
                    background: 'transparent',
                    border: `1px solid ${D.border}`,
                    color: D.textMuted,
                    fontFamily: D.head,
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="compose-submit-btn"
                  style={{
                    padding: '8px 18px',
                    borderRadius: D.md,
                    background: D.indigo,
                    border: 'none',
                    color: '#fff',
                    fontFamily: D.head,
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Send Announcement 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
