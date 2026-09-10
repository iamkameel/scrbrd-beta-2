'use client';

import React, { useState, useEffect } from 'react';
import { Theme } from './types';

interface PitchDeckViewProps {
  theme: Theme;
}

interface SlideData {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  bullets: string[];
  metrics?: { label: string; value: string; detail: string }[];
  highlightQuote?: string;
  footerNote: string;
  presenterNotes: string;
}

const SLIDES: SlideData[] = [
  {
    id: 1,
    badge: 'EXECUTIVE BRIEFING',
    title: 'SCRBRD OS: High School Sports Intelligence & Media Infrastructure',
    subtitle: 'Digitizing 140+ years of high school cricket tradition into an institutional operating system, talent discovery network, and broadcast monetization engine.',
    bullets: [
      'Uniting school sporting governance across all 23 squads (from 1st XI down to U14G).',
      'Bridging real-time scoring, live broadcast overlays, talent scouting, and groundskeeping telemetry into a single zero-trust platform.',
      'Designed specifically for premier South African and Commonwealth sporting institutions.',
    ],
    metrics: [
      { label: 'SQUADS PER INSTITUTION', value: '23 Squads', detail: 'Complete Open & Age-Group pipeline' },
      { label: 'DERBY RIVALRIES', value: '140+ Years', detail: 'Tradition, records & prestige preserved' },
      { label: 'COMPLIANCE BENCHMARK', value: 'POPIA Tier 4', detail: 'Strict zero-trust minor PII redaction' },
    ],
    highlightQuote: '“School sport isn’t amateur—it is the bedrock of national high-performance sports pipelines and institutional legacy.”',
    footerNote: 'CONFIDENTIAL & PROPRIETARY · SCRBRD TECHNOLOGIES (PTY) LTD · 2026',
    presenterNotes: 'Good morning Council & Investors. High school sport in South Africa commands a degree of passion and tribal rivalry comparable to collegiate athletics in the US. Today, we present SCRBRD OS—the digital foundation that turns fragmented match days into an enterprise-grade institution.',
  },
  {
    id: 2,
    badge: 'THE PROBLEM',
    title: 'The Multi-Million Rand Blindspot in High School Sports',
    subtitle: 'Elite high schools spend millions on world-class facilities and coaching, yet rely on outdated, fragmented, and legally vulnerable tools.',
    bullets: [
      'Paper Scorebooks & Lost Data: Over 70% of historical match scorecards and youth player milestones vanish after each season.',
      'Unprotected Minor PII & POPIA Liability: Health, medical injuries, and adolescent personal info are routinely shared over unencrypted messaging apps.',
      'Unmonetized Broadcast Feeds: High-demand derby livestreams generate hundreds of thousands of views with zero automated sponsor attribution or linear ad insertion.',
      'Broken Talent Discovery: Scouts and provincial selectors still rely on subjective word-of-mouth rather than verified empirical match telemetry.',
    ],
    metrics: [
      { label: 'PII LEAK RISK', value: '88%', detail: 'Youth athlete data shared via unencrypted chats' },
      { label: 'COMMERCIAL LOSS', value: 'R 45M+', detail: 'Unclaimed school sports streaming ad inventory' },
      { label: 'DATA RETENTION', value: '< 20%', detail: 'Historical school cricket records digitized' },
    ],
    highlightQuote: '“Schools were running 21st-century sporting programmes with 20th-century paper clipboards.”',
    footerNote: 'PROBLEM STATEMENT · MARKET INEFFICIENCIES & REGULATORY LIABILITIES',
    presenterNotes: 'Notice the irony: A premier school invests R25M in a high-performance center, but the U15B bowler’s lumbar strain is tracked on a wet piece of paper, and livestream sponsor banners are manually pasted in PowerPoint. The legal exposure alone under POPIA is an existential hazard.',
  },
  {
    id: 3,
    badge: 'THE SOLUTION',
    title: 'SCRBRD OS: The Unified Institutional Operating System',
    subtitle: 'A single, role-based platform that coordinates administrators, coaches, analysts, parents, and commercial licensors.',
    bullets: [
      'Universal Broadcast Scorer: Instant ball-by-ball scoring with live Manhattan charts, Worm graphs, and 4K broadcast score-bug generation.',
      '6-Layer RBAC & POPIA Shield: Fine-grained data access protecting clinical diagnoses, player contact info, and minor identities.',
      'Opposition Scout Dossiers: Automatic wagon wheels, bowler pitch landing heatmaps, and dismissal vulnerability radars.',
      'Grounds & Turf Telemetry: Real-time Bulli clay moisture tracking, grass height, roller compaction, and rain cover alerts.',
      '80/20 Commercial Rights Engine: SCTE-35 automated sponsor ad pods, digital inventory valuation, and Section 18A tax receipting.',
    ],
    metrics: [
      { label: 'OPERATIONAL MODULES', value: '18 Engines', detail: 'Scoring, Logistics, Medical, Fields, Scouting' },
      { label: 'ROLES GOVERNED', value: '12 Roles', detail: 'SuperAdmin to Parent & Spectator' },
      { label: 'BROADCAST LATENCY', value: '< 1.5s', detail: 'Real-time score bug sync across OTT' },
    ],
    footerNote: 'PRODUCT ARCHITECTURE · PURPOSE-BUILT FOR INSTITUTIONAL CRICKET',
    presenterNotes: 'SCRBRD OS isn’t an app—it’s an operating system with 18 specialized modules. The scorer touches one screen, and simultaneously the 4K stream receives a lower-third score bug, the team analyst receives release velocity data, and the ground curator sees the impact of pitch wear.',
  },
  {
    id: 4,
    badge: 'MARKET OPPORTUNITY',
    title: 'Total Addressable Market (TAM): South Africa & Commonwealth',
    subtitle: 'Expanding from KZN’s premier school circuit to 450+ cricket-playing schools nationwide and international Commonwealth networks.',
    bullets: [
      'South African Tier 1 & Tier 2 Schools: 450+ traditional high schools fielding active cricket programmes (KZN, Western Province, Gauteng, Eastern Cape).',
      'Commonwealth Expansion: UK Independent Schools (The Headmasters’ Conference), Australian GPS / CAS systems, and Indian elite school circuits.',
      'Ancillary Sports Codes: Built to expand into Rugby, Hockey, Water Polo, and Athletics using the same institutional architecture.',
    ],
    metrics: [
      { label: 'SA SCHOOL MARKET', value: 'R 420M', detail: 'Annual school sports SaaS & media potential' },
      { label: 'COMMONWEALTH EXPANSION', value: 'R 1.45B', detail: 'UK, Australia, New Zealand & India circuits' },
      { label: 'YOUTH ATHLETE REACH', value: '180,000+', detail: 'Registered student-athletes across codes' },
    ],
    highlightQuote: '“South Africa is the global proving ground for school sports passion, tribal derby rivalries, and institutional prestige.”',
    footerNote: 'MARKET SIZE & EXPANSION TRAJECTORY',
    presenterNotes: 'We start in the hyper-competitive KwaZulu-Natal circuit—Westville, Hilton, Maritzburg College. But high school cricket culture is identical in Sydney, Melbourne, Surrey, and Mumbai. The expansion path requires zero fundamental codebase rewrites.',
  },
  {
    id: 5,
    badge: 'BUSINESS MODEL',
    title: 'Tri-Partite Monetization & High-Margin Recurring Revenue',
    subtitle: 'A balanced revenue model combining institutional SaaS subscriptions, media sponsorships, and scouting intelligence.',
    bullets: [
      '1. Institutional SaaS License: Tiered annual school subscriptions (R 65,000 to R 180,000 / year) covering platform hosting, POPIA vault, multi-squad coaching, and grounds maintenance.',
      '2. Broadcast & Sponsorship Share (80/20 Split): SCRBRD connects national corporate sponsors (Sunfoil, Discovery, Puma) into live streams and LED jumbotrons, retaining a 20% platform management fee.',
      '3. Verified Scouting Intelligence API: Pro franchises (Dolphins, Titans, Lions, SA20 teams) subscribe to empirical youth player performance passports and telemetry data.',
    ],
    metrics: [
      { label: 'ANNUAL SAAS / SCHOOL', value: 'R 125,000', detail: 'Average recurring institutional license' },
      { label: 'SPONSOR REV SHARE', value: '20% Platform', detail: '80% reinvested into school bursary trusts' },
      { label: 'GROSS MARGINS', value: '78%', detail: 'Software-driven cloud infrastructure' },
    ],
    footerNote: 'BUSINESS MODEL · SUSTAINABLE INSTITUTIONAL PARTNERSHIPS',
    presenterNotes: 'Our model is designed so schools make money rather than viewing us as a cost center. By syndicating sponsor banners through our 80/20 commercial split, an active cricket school generates over R200,000 in new sponsorship revenue, paying for their SaaS license many times over.',
  },
  {
    id: 6,
    badge: 'COMPETITIVE MOATS',
    title: 'High Barriers to Entry & Institutional Defensibility',
    subtitle: 'Why standard generic sports scoring apps cannot compete with SCRBRD OS.',
    bullets: [
      'Deep Cultural Understanding: Custom-engineered for South African inter-school derbies, historic traditions, and multi-day declaration match rules.',
      'Complete Pipeline Depth: Generic apps only score the 1st team; SCRBRD manages all 23 squads from U14G through 1st XI with coach assignments and ground logistics.',
      'Legally Enforced POPIA Compliance: Built from day one with child-safeguarding encryption and role-gated PII redaction.',
      'Dual-Division Promotion & Relegation Engine: Automated governance maintaining competitive balance and relegation/promotion playoffs across school leagues.',
    ],
    metrics: [
      { label: 'PIPELINE COVERAGE', value: '100% of Squads', detail: 'No age group or lower XI left behind' },
      { label: 'RETENTION RATE', value: '96% Projected', detail: 'Deep institutional embedding across faculty' },
      { label: 'SWITCHING COST', value: 'Extremely High', detail: 'Historical player archives & school records' },
    ],
    highlightQuote: '“Competitors sell scorebooks to parents. SCRBRD delivers an enterprise OS to Headmasters and School Trusts.”',
    footerNote: 'COMPETITIVE ADVANTAGE & SUSTAINABLE DEFENSE',
    presenterNotes: 'Why can’t a generic scoring app displace us? Because scoring is only 10% of the friction. The friction is managing 23 squad rosters, school bus routes, medical clearance, and headmaster governance reports. Once our system is in place, switching is virtually impossible.',
  },
  {
    id: 7,
    badge: 'TECH STACK & HARDWARE ROADMAP',
    title: 'Modern Architecture & Computer-Vision Optical Future',
    subtitle: 'A responsive full-stack cloud core preparing for edge optical tracking and automated broadcast production.',
    bullets: [
      'Current Cloud Core: Next.js 15, TypeScript, Tailwind CSS, real-time Firebase Firestore persistence, and role-based cryptographic sessions.',
      'Broadcast Integration: SCTE-35 digital cue marker injection, SRT/RTMP 1080p60 ingest, and clean/dirty video routing.',
      'Phase 2 Hardware Rollout (DRS & 360° Tracking): Integration with venue optical camera rigs for automated ball-tracking, LBW predictive paths, and pitch landing sensor probes.',
      'Offline-First Progressive Web App: Groundskeeper and scorer offline synchronization for low-connectivity rural grounds.',
    ],
    metrics: [
      { label: 'CORE FRAMEWORK', value: 'Next.js 15', detail: 'High-performance App Router' },
      { label: 'STATE ENGINE', value: 'Firestore Live', detail: 'Sub-second real-time sync across devices' },
      { label: 'OPTICAL READINESS', value: 'Phase 2 Rig', detail: 'DRS Law 36 rules engine pre-integrated' },
    ],
    footerNote: 'TECHNOLOGY ROADMAP & HARDWARE INTEGRATION TIMELINE',
    presenterNotes: 'Our architecture is built for edge reliability. Even on rural grounds with spotty 3G, scorers can record ball-by-ball actions offline. The moment connection restores, the entire cloud state synchronizes without data collisions.',
  },
  {
    id: 8,
    badge: 'GROWTH MILESTONES',
    title: 'Rollout Roadmap & Investment Milestones',
    subtitle: 'From the KZN Circuit pilot to a nationwide standard and international Commonwealth licensing.',
    bullets: [
      'Stage 1 (Current): KZN High Schools Circuit deployment (Westville, Hilton, Maritzburg College, DHS, Michaelhouse, Glenwood, Kearsney, Northwood, Clifton, St Charles).',
      'Stage 2 (Q3–Q4 2026): Expansion to Western Province (Bishops, Rondebosch, Wynberg, SACS, Paul Roos) and Gauteng (Affies, KES, St Stithians, Jeppe).',
      'Stage 3 (2027): National SuperSport Schools API integration, centralized talent draft analytics, and pilot rollout across UK Independent Schools.',
    ],
    metrics: [
      { label: 'PILOT SCHOOLS (KZN)', value: '10 Institutions', detail: 'Elite high school circuit active' },
      { label: '2026/27 TARGET', value: '65 Schools', detail: 'Expansion to Gauteng & Western Cape' },
      { label: 'PROJECTED ARR', value: 'R 18.2M', detail: 'Year 2 recurring SaaS + media share' },
    ],
    highlightQuote: '“Building the definitive digital operating infrastructure for the future of school sports.”',
    footerNote: 'SCRBRD OS · INVESTOR & EXECUTIVE PRESENTATION',
    presenterNotes: 'We are seeking strategic partners to accelerate Phase 2 camera hardware rollouts and scale the sales pipeline into the Western Cape and Gauteng circuits. Thank you for your time.',
  },
];

export default function PitchDeckView({ theme: D }: PitchDeckViewProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [showPresenterNotes, setShowPresenterNotes] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [activeInteractiveTool, setActiveInteractiveTool] = useState<'none' | 'roi_simulator' | 'system_explorer'>('none');

  // Interactive ROI Simulator State
  const [schoolsCount, setSchoolsCount] = useState<number>(30);
  const [saasFeePerSchool, setSaasFeePerSchool] = useState<number>(125000); // R 125,000
  const [sponsorshipPerDerby, setSponsorshipPerDerby] = useState<number>(45000); // R 45,000
  const [derbiesPerSeason, setDerbiesPerSeason] = useState<number>(40);

  // Computed ROI
  const totalSaaSRevenue = schoolsCount * saasFeePerSchool;
  const totalSponsorshipPool = derbiesPerSeason * sponsorshipPerDerby;
  const schoolBursaryPayout = totalSponsorshipPool * 0.8; // 80% to schools
  const platformSponsorShare = totalSponsorshipPool * 0.2; // 20% to SCRBRD
  const totalPlatformGross = totalSaaSRevenue + platformSponsorShare;
  const averageSchoolGain = (schoolBursaryPayout / schoolsCount) - saasFeePerSchool;

  // Active Explorer Node
  const [activeNode, setActiveNode] = useState<'scorer' | 'broadcast' | 'popia' | 'turf' | 'scout'>('scorer');

  const currentSlide = SLIDES[currentSlideIndex];

  const nextSlide = useCallback(() => {
    setCurrentSlideIndex(prev => Math.min(prev + 1, SLIDES.length - 1));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, isFullScreen]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Deck Navigation Header */}
      <div
        style={{
          padding: '16px 24px',
          background: D.surf1,
          borderRadius: D.lg,
          border: `1px solid ${D.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>📐</span>
          <div>
            <div style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800, color: D.textPrimary }}>
              SCRBRD OS Strategic Pitch Deck & Executive Suite
            </div>
            <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
              Slide {currentSlideIndex + 1} of {SLIDES.length} · Institutional Investor Presentation
            </div>
          </div>
        </div>

        {/* Interactive Mode Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveInteractiveTool(prev => prev === 'roi_simulator' ? 'none' : 'roi_simulator')}
            style={{
              padding: '6px 12px',
              borderRadius: D.pill,
              background: activeInteractiveTool === 'roi_simulator' ? `${D.emerald}25` : D.surf2,
              border: `1px solid ${activeInteractiveTool === 'roi_simulator' ? D.emerald : D.border}`,
              color: activeInteractiveTool === 'roi_simulator' ? D.emerald : D.textSecondary,
              fontFamily: D.head,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>💰</span>
            <span>Live ROI Calculator</span>
          </button>

          <button
            onClick={() => setActiveInteractiveTool(prev => prev === 'system_explorer' ? 'none' : 'system_explorer')}
            style={{
              padding: '6px 12px',
              borderRadius: D.pill,
              background: activeInteractiveTool === 'system_explorer' ? `${D.sky}25` : D.surf2,
              border: `1px solid ${activeInteractiveTool === 'system_explorer' ? D.sky : D.border}`,
              color: activeInteractiveTool === 'system_explorer' ? D.sky : D.textSecondary,
              fontFamily: D.head,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>🔬</span>
            <span>Architecture Node Explorer</span>
          </button>

          <button
            onClick={() => setShowPresenterNotes(prev => !prev)}
            style={{
              padding: '6px 12px',
              borderRadius: D.pill,
              background: showPresenterNotes ? `${D.indigo}25` : D.surf2,
              border: `1px solid ${showPresenterNotes ? D.indigo : D.border}`,
              color: showPresenterNotes ? D.indigo : D.textSecondary,
              fontFamily: D.head,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            🎙️ {showPresenterNotes ? 'Hide Speaker Script' : 'Speaker Script'}
          </button>

          {/* Slide Navigation Buttons */}
          <button
            onClick={prevSlide}
            disabled={currentSlideIndex === 0}
            style={{
              padding: '6px 14px',
              borderRadius: D.pill,
              background: D.surf2,
              border: `1px solid ${D.border}`,
              color: currentSlideIndex === 0 ? D.textMuted : D.textPrimary,
              fontFamily: D.head,
              fontSize: '11px',
              fontWeight: 700,
              cursor: currentSlideIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: currentSlideIndex === 0 ? 0.5 : 1,
            }}
          >
            ← Prev
          </button>

          <span style={{ fontFamily: D.mono, fontSize: '12px', color: D.indigo, fontWeight: 800, padding: '0 4px' }}>
            {currentSlideIndex + 1}/{SLIDES.length}
          </span>

          <button
            onClick={nextSlide}
            disabled={currentSlideIndex === SLIDES.length - 1}
            style={{
              padding: '6px 14px',
              borderRadius: D.pill,
              background: currentSlideIndex === SLIDES.length - 1 ? D.surf2 : D.indigo,
              border: `1px solid ${currentSlideIndex === SLIDES.length - 1 ? D.border : D.indigo}`,
              color: currentSlideIndex === SLIDES.length - 1 ? D.textMuted : '#fff',
              fontFamily: D.head,
              fontSize: '11px',
              fontWeight: 700,
              cursor: currentSlideIndex === SLIDES.length - 1 ? 'not-allowed' : 'pointer',
              opacity: currentSlideIndex === SLIDES.length - 1 ? 0.5 : 1,
            }}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Slide Thumbnails Ribbon */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {SLIDES.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrentSlideIndex(idx)}
            style={{
              flex: '1 0 110px',
              padding: '8px 10px',
              borderRadius: D.md,
              background: currentSlideIndex === idx ? `${D.indigo}20` : D.surf1,
              border: `1px solid ${currentSlideIndex === idx ? D.indigo : D.border}`,
              color: currentSlideIndex === idx ? D.indigo : D.textMuted,
              fontFamily: D.head,
              fontSize: '10px',
              fontWeight: currentSlideIndex === idx ? 800 : 600,
              textAlign: 'left',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            0{s.id}. {s.badge}
          </button>
        ))}
      </div>

      {/* INTERACTIVE TOOL DRAWER 1: FINANCIAL & ROI SIMULATOR */}
      {activeInteractiveTool === 'roi_simulator' && (
        <div
          style={{
            padding: '24px',
            borderRadius: D.lg,
            background: `linear-gradient(135deg, ${D.surf1} 0%, ${D.surf2} 100%)`,
            border: `1px solid ${D.emerald}50`,
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            boxShadow: '0 8px 30px rgba(16,185,129,0.12)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.emerald }}>
                💰 Live Institutional Financial Model & Sponsorship Simulator
              </div>
              <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted }}>
                Adjust variables to dynamically model recurring SaaS revenue, 80/20 commercial shares, and school bursary funding
              </div>
            </div>
            <button
              onClick={() => setActiveInteractiveTool('none')}
              style={{ background: 'none', border: 'none', color: D.textMuted, cursor: 'pointer', fontSize: '16px' }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {/* Slider 1: Schools */}
            <div style={{ padding: '14px', background: D.surf1, borderRadius: D.md, border: `1px solid ${D.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>
                <span>SCHOOLS SUBSCRIBED</span>
                <strong style={{ color: D.textPrimary }}>{schoolsCount} Schools</strong>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={schoolsCount}
                onChange={e => setSchoolsCount(Number(e.target.value))}
                style={{ width: '100%', marginTop: '10px' }}
              />
            </div>

            {/* Slider 2: SaaS Fee */}
            <div style={{ padding: '14px', background: D.surf1, borderRadius: D.md, border: `1px solid ${D.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>
                <span>ANNUAL SAAS LICENSE</span>
                <strong style={{ color: D.textPrimary }}>R {(saasFeePerSchool / 1000).toFixed(0)}k / yr</strong>
              </div>
              <input
                type="range"
                min="65000"
                max="200000"
                step="5000"
                value={saasFeePerSchool}
                onChange={e => setSaasFeePerSchool(Number(e.target.value))}
                style={{ width: '100%', marginTop: '10px' }}
              />
            </div>

            {/* Slider 3: Derby Sponsorship Pool */}
            <div style={{ padding: '14px', background: D.surf1, borderRadius: D.md, border: `1px solid ${D.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>
                <span>DERBY SPONSOR POOL</span>
                <strong style={{ color: D.textPrimary }}>R {(sponsorshipPerDerby / 1000).toFixed(0)}k / derby</strong>
              </div>
              <input
                type="range"
                min="15000"
                max="100000"
                step="5000"
                value={sponsorshipPerDerby}
                onChange={e => setSponsorshipPerDerby(Number(e.target.value))}
                style={{ width: '100%', marginTop: '10px' }}
              />
            </div>

            {/* Slider 4: Derbies Streamed */}
            <div style={{ padding: '14px', background: D.surf1, borderRadius: D.md, border: `1px solid ${D.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.head, fontSize: '11px', color: D.textMuted }}>
                <span>BROADCAST DERBIES</span>
                <strong style={{ color: D.textPrimary }}>{derbiesPerSeason} Derbies</strong>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={derbiesPerSeason}
                onChange={e => setDerbiesPerSeason(Number(e.target.value))}
                style={{ width: '100%', marginTop: '10px' }}
              />
            </div>
          </div>

          {/* Real-time Calculation Outputs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '14px', background: D.surf1, borderRadius: D.md, border: `1px solid ${D.border}` }}>
              <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>PLATFORM GROSS ARR</div>
              <div style={{ fontFamily: D.head, fontSize: '20px', fontWeight: 800, color: D.emerald }}>
                R {(totalPlatformGross / 1000000).toFixed(2)}M
              </div>
              <div style={{ fontFamily: D.body, fontSize: '10px', color: D.textMuted, marginTop: '2px' }}>
                SaaS + 20% Commercial share
              </div>
            </div>

            <div style={{ padding: '14px', background: D.surf1, borderRadius: D.md, border: `1px solid ${D.border}` }}>
              <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>SCHOOL BURSARY PAYOUT</div>
              <div style={{ fontFamily: D.head, fontSize: '20px', fontWeight: 800, color: D.sky }}>
                R {(schoolBursaryPayout / 1000000).toFixed(2)}M
              </div>
              <div style={{ fontFamily: D.body, fontSize: '10px', color: D.textMuted, marginTop: '2px' }}>
                80% reinvested into school trusts
              </div>
            </div>

            <div style={{ padding: '14px', background: D.surf1, borderRadius: D.md, border: `1px solid ${D.border}` }}>
              <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>AVERAGE SCHOOL NET POSITION</div>
              <div style={{ fontFamily: D.head, fontSize: '20px', fontWeight: 800, color: averageSchoolGain >= 0 ? D.emerald : D.rose }}>
                {averageSchoolGain >= 0 ? `+ R ${(averageSchoolGain / 1000).toFixed(0)}k Net` : `- R ${(Math.abs(averageSchoolGain) / 1000).toFixed(0)}k Net`}
              </div>
              <div style={{ fontFamily: D.body, fontSize: '10px', color: D.textMuted, marginTop: '2px' }}>
                Sponsor earnings minus SaaS license
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE TOOL DRAWER 2: ARCHITECTURE NODE EXPLORER */}
      {activeInteractiveTool === 'system_explorer' && (
        <div
          style={{
            padding: '24px',
            borderRadius: D.lg,
            background: `linear-gradient(135deg, ${D.surf1} 0%, ${D.surf2} 100%)`,
            border: `1px solid ${D.sky}50`,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.sky }}>
                🔬 Interactive Platform Engine & Telemetry Node Explorer
              </div>
              <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted }}>
                Click a core infrastructure node to inspect live data throughput, protocols, and latency parameters
              </div>
            </div>
            <button
              onClick={() => setActiveInteractiveTool('none')}
              style={{ background: 'none', border: 'none', color: D.textMuted, cursor: 'pointer', fontSize: '16px' }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'scorer', label: '1. Scorer Telemetry Engine', icon: '⚡' },
              { id: 'broadcast', label: '2. 4K SCTE-35 Overlay Sync', icon: '📹' },
              { id: 'popia', label: '3. Zero-Trust POPIA Vault', icon: '🛡️' },
              { id: 'turf', label: '4. Pitch & Curator Telemetry', icon: '🌿' },
              { id: 'scout', label: '5. Talent Discovery Radar', icon: '🎯' },
            ].map(node => (
              <button
                key={node.id}
                onClick={() => setActiveNode(node.id as any)}
                style={{
                  padding: '8px 14px',
                  borderRadius: D.pill,
                  background: activeNode === node.id ? D.sky : D.surf2,
                  border: `1px solid ${activeNode === node.id ? D.sky : D.border}`,
                  color: activeNode === node.id ? '#fff' : D.textSecondary,
                  fontFamily: D.head,
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{node.icon}</span>
                <span>{node.label}</span>
              </button>
            ))}
          </div>

          <div style={{ padding: '16px', background: D.surf1, borderRadius: D.md, border: `1px solid ${D.border}` }}>
            {activeNode === 'scorer' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.sky }}>
                  Scorer Telemetry Engine (Sub-50ms Input Processing)
                </div>
                <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textSecondary, lineHeight: 1.6 }}>
                  Captures 26 discrete ball parameters (release line, landing coordinate, shot zone, contact quality, fielder touch, bowler workload) on an offline-capable SQLite/IndexedDB client. Syncs to Cloud Firestore via optimistic mutations.
                </div>
                <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                  THROUGHPUT: 120 events/min · REPLICATION: Sub-second multi-device websocket · ENCRYPTION: AES-256
                </div>
              </div>
            )}
            {activeNode === 'broadcast' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.sky }}>
                  4K SCTE-35 Digital Broadcast Overlay & Ad Injection
                </div>
                <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textSecondary, lineHeight: 1.6 }}>
                  Direct SRT/RTMP stream ingest with automated HTML5 graphics rendering. Detects over changes, wickets, and drinks breaks to inject compliant SCTE-35 commercial ad markers directly into SuperSport Schools linear feeds.
                </div>
                <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                  OVERLAY LATENCY: &lt; 120ms · VIDEO PASSTHROUGH: 1080p60 Uncompressed · PROTOCOLS: SRT, NDI, RTMP
                </div>
              </div>
            )}
            {activeNode === 'popia' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.sky }}>
                  Zero-Trust POPIA Shield & Youth Athlete Protection
                </div>
                <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textSecondary, lineHeight: 1.6 }}>
                  Role-based token validation guarantees that medical diagnoses, emergency contacts, and minor home addresses are never transmitted to public or broadcast clients. Automatically redacts identifiable health data for public spectator profiles.
                </div>
                <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                  AUDIT LOG: Immutable ledger · ROLES: 6 Security Layers · COMPLIANCE: POPIA Act 4 of 2013
                </div>
              </div>
            )}
            {activeNode === 'turf' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.sky }}>
                  Curator & Turfgrass Telemetry Sub-System
                </div>
                <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textSecondary, lineHeight: 1.6 }}>
                  Real-time soil core moisture probe integration, compaction Clegg hammer ratings, cut deck heights, and automated rain cover notification broadcasts across all 4 school ovals.
                </div>
                <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                  PROBE SAMPLING: Hourly · SENSOR PROTOCOL: Bluetooth Low Energy / LoRaWAN
                </div>
              </div>
            )}
            {activeNode === 'scout' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.sky }}>
                  Verified Talent Discovery & Performance Passport API
                </div>
                <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textSecondary, lineHeight: 1.6 }}>
                  Empirical player passports tracking strike rotation efficiency, boundary percentages across 6 wagon wheel sectors, death-overs dot ball ratios, and Lumbar Stress Index pace bowling workloads.
                </div>
                <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                  INTEGRATIONS: CSA National Database · FRANCHISES: Dolphins, Titans, Lions Academy
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Slide Canvas */}
      <div
        style={{
          minHeight: '480px',
          padding: '36px',
          background: `linear-gradient(145deg, ${D.surf1} 0%, ${D.surf2} 100%)`,
          borderRadius: D.lg,
          border: `1px solid ${D.border}`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
        }}
      >
        {/* Slide Header */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span
              style={{
                padding: '4px 12px',
                borderRadius: D.pill,
                background: `${D.indigo}25`,
                color: D.indigo,
                fontFamily: D.mono,
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '0.05em',
                border: `1px solid ${D.indigo}40`,
              }}
            >
              {currentSlide.badge}
            </span>
            <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
              SCRBRD OS · SLIDE 0{currentSlide.id}
            </span>
          </div>

          <h2
            style={{
              fontFamily: D.head,
              fontSize: '24px',
              fontWeight: 800,
              color: D.textPrimary,
              margin: '0 0 10px 0',
              lineHeight: 1.3,
            }}
          >
            {currentSlide.title}
          </h2>

          <p
            style={{
              fontFamily: D.body,
              fontSize: '14px',
              color: D.textSecondary,
              lineHeight: 1.6,
              maxWidth: '850px',
              margin: '0 0 24px 0',
            }}
          >
            {currentSlide.subtitle}
          </p>
        </div>

        {/* Slide Content: Bullets & Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.4fr) minmax(240px, 1fr)', gap: '24px', margin: '16px 0' }}>
          {/* Bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentSlide.bullets.map((bullet, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 16px',
                  background: D.surf1,
                  borderRadius: D.md,
                  border: `1px solid ${D.border}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <span style={{ color: D.sky, fontSize: '14px', marginTop: '2px' }}>⚡</span>
                <span style={{ fontFamily: D.body, fontSize: '13px', color: D.textPrimary, lineHeight: 1.5 }}>
                  {bullet}
                </span>
              </div>
            ))}
          </div>

          {/* Key Metrics / Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentSlide.metrics &&
              currentSlide.metrics.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '14px 18px',
                    background: D.surf1,
                    borderRadius: D.md,
                    border: `1px solid ${D.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, letterSpacing: '0.04em' }}>
                    {m.label}
                  </div>
                  <div style={{ fontFamily: D.head, fontSize: '20px', fontWeight: 800, color: D.emerald }}>
                    {m.value}
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary }}>
                    {m.detail}
                  </div>
                </div>
              ))}

            {currentSlide.highlightQuote && (
              <div
                style={{
                  padding: '14px 18px',
                  background: `${D.indigo}15`,
                  borderRadius: D.md,
                  border: `1px solid ${D.indigo}30`,
                  fontFamily: D.body,
                  fontSize: '12px',
                  color: D.textPrimary,
                  fontStyle: 'italic',
                  lineHeight: 1.6,
                }}
              >
                {currentSlide.highlightQuote}
              </div>
            )}
          </div>
        </div>

        {/* Slide Footer */}
        <div
          style={{
            borderTop: `1px solid ${D.border}`,
            paddingTop: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '16px',
          }}
        >
          <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
            {currentSlide.footerNote}
          </span>

          <div style={{ display: 'flex', gap: '6px' }}>
            {SLIDES.map((_, idx) => (
              <span
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                style={{
                  width: currentSlideIndex === idx ? '24px' : '8px',
                  height: '6px',
                  borderRadius: D.pill,
                  background: currentSlideIndex === idx ? D.indigo : D.border,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'inline-block',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* SPEAKER NOTES / PRESENTER SCRIPT DRAWER */}
      {showPresenterNotes && (
        <div
          style={{
            padding: '18px 24px',
            background: `${D.indigo}10`,
            borderRadius: D.lg,
            border: `1px solid ${D.indigo}40`,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>🎙️</span>
            <span style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.indigo }}>
              SPEAKER PRESENTATION SCRIPT (SLIDE 0{currentSlide.id}):
            </span>
          </div>
          <p style={{ fontFamily: D.body, fontSize: '13px', color: D.textPrimary, lineHeight: 1.7, margin: 0 }}>
            {currentSlide.presenterNotes}
          </p>
        </div>
      )}
    </div>
  );
}
