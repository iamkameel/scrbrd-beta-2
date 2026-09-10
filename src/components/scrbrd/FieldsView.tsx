'use client';

import React, { useState, useEffect } from 'react';
import { Theme, PitchCondition } from './types';
import { SCHOOLS_REGISTRY, getSchoolFieldConditions } from './data';

interface FieldAssessmentRecord {
  id: string;
  timestamp: string;
  groundId: string;
  fieldName: string;
  schoolName: string;
  assessorName: string;
  assessorRole: string;
  assessmentType: 'match_day_prep' | 'post_match' | 'weekly_scheduled' | 'weather_alert';
  stripNumber: string;
  moisturePct: number;
  grassHeightMm: number;
  compactionTonnage: number;
  rollingPasses: number;
  cleatPenetrationMm: number;
  bounceRating: number;
  paceRating: number;
  outfieldSpeed: 'Fast' | 'Medium' | 'Slow';
  coversStatus: 'off' | 'on' | 'standby';
  weatherRisk: 'None' | 'Light Dew' | 'Overcast Rain Threat' | 'Severe Storm Alert';
  verdict: 'MATCH READY' | 'PLAY WITH CAUTION' | 'WEATHER DELAY' | 'UNPLAYABLE / PITCH REPAIR';
  curatorNotes: string;
}

interface FieldsViewProps {
  theme: Theme;
  activeSchoolId?: string;
  currentRole?: string;
  onSelectSchool?: (schoolId: string) => void;
}

const INITIAL_TASKS = [
  { id: 't1', day: 'Monday', task: "Scarify Bowden's 1st XI wicket to remove dead thatch & clear debris", done: true, time: '06:30' },
  { id: 't2', day: 'Tuesday', task: 'Deep-spike aeration on Commons Field & junior ovals', done: true, time: '08:00' },
  { id: 't3', day: 'Wednesday', task: 'Automated 40-min sub-surface irrigation cycle on Match Strip #2', done: true, time: '05:00' },
  { id: 't4', day: 'Thursday', task: 'Cross-rolling with 1.8-ton tandem roller (8 passes) across pitch table', done: true, time: '14:00' },
  { id: 't5', day: 'Friday', task: 'Final precision laser-mow to 4.0mm and 12-pass heavy rolling (2.5T)', done: true, time: '07:30' },
  { id: 't6', day: 'Saturday', task: 'Match-Day 06:00 surface probe, crease painting, & boundary wedge alignment', done: true, time: '06:00' },
  { id: 't7', day: 'Sunday', task: 'Post-match recovery divot repair, seam-mark sanding, and standby covers deploy', done: false, time: '16:00' },
];

const INITIAL_ASSESSMENT_LOGS: FieldAssessmentRecord[] = [
  {
    id: 'log-1',
    timestamp: 'Today, 06:15 SAST',
    groundId: 'g_wes_1',
    fieldName: "Bowden's Field Oval",
    schoolName: "Westville Boys' High School",
    assessorName: 'Ernest Mzimba',
    assessorRole: 'Head Turfgrass Curator (CSA Level 3)',
    assessmentType: 'match_day_prep',
    stripNumber: 'Match Strip #2 (Centre)',
    moisturePct: 18,
    grassHeightMm: 4.0,
    compactionTonnage: 2.5,
    rollingPasses: 12,
    cleatPenetrationMm: 3.2,
    bounceRating: 8.8,
    paceRating: 8.6,
    outfieldSpeed: 'Fast',
    coversStatus: 'off',
    weatherRisk: 'Light Dew',
    verdict: 'MATCH READY',
    curatorNotes: 'Firm Bulli base with sharp, uniform carry to the keeper. Morning dew swept at 05:45. Crease marked in fresh emulsion. Outfield cut to 12mm; boundary ropes at 68m.',
  },
  {
    id: 'log-2',
    timestamp: 'Yesterday, 16:30 SAST',
    groundId: 'g_wes_1',
    fieldName: "Bowden's Field Oval",
    schoolName: "Westville Boys' High School",
    assessorName: 'Ernest Mzimba',
    assessorRole: 'Head Turfgrass Curator',
    assessmentType: 'weekly_scheduled',
    stripNumber: 'Match Strip #2',
    moisturePct: 21,
    grassHeightMm: 4.8,
    compactionTonnage: 2.5,
    rollingPasses: 8,
    cleatPenetrationMm: 4.5,
    bounceRating: 8.2,
    paceRating: 8.0,
    outfieldSpeed: 'Medium',
    coversStatus: 'standby',
    weatherRisk: 'Overcast Rain Threat',
    verdict: 'MATCH READY',
    curatorNotes: 'Pre-match rolling complete. Standby covers staged near boundary in case of afternoon thunderstorm.',
  },
  {
    id: 'log-3',
    timestamp: '3 days ago, 08:00 SAST',
    groundId: 'g_wes_2',
    fieldName: 'Commons Field',
    schoolName: "Westville Boys' High School",
    assessorName: 'K. Naidoo',
    assessorRole: 'Assistant Groundskeeper',
    assessmentType: 'weekly_scheduled',
    stripNumber: 'Strip #1 (South)',
    moisturePct: 22,
    grassHeightMm: 5.5,
    compactionTonnage: 1.8,
    rollingPasses: 6,
    cleatPenetrationMm: 5.0,
    bounceRating: 7.4,
    paceRating: 7.2,
    outfieldSpeed: 'Medium',
    coversStatus: 'off',
    weatherRisk: 'None',
    verdict: 'MATCH READY',
    curatorNotes: 'Good natural camber drainage. Prepared for U15A / 2nd XI inter-school fixture.',
  },
];

export default function FieldsView({
  theme: D,
  activeSchoolId = 'wbhs',
  currentRole = 'groundskeeper',
  onSelectSchool,
}: FieldsViewProps) {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(activeSchoolId);
  const [grounds, setGrounds] = useState<PitchCondition[]>(() => getSchoolFieldConditions(activeSchoolId));
  const [selectedGroundId, setSelectedGroundId] = useState<string>('');
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [assessmentLogs, setAssessmentLogs] = useState<FieldAssessmentRecord[]>(INITIAL_ASSESSMENT_LOGS);
  const [activeTab, setActiveTab] = useState<'monitoring' | 'weekly_plan' | 'history'>('monitoring');
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync grounds when school changes
  useEffect(() => {
    const list = getSchoolFieldConditions(selectedSchoolId);
    setGrounds(list);
    if (list.length > 0) {
      setSelectedGroundId(list[0].groundId);
    }
  }, [selectedSchoolId]);

  const currentSchool = SCHOOLS_REGISTRY.find(s => s.id === selectedSchoolId) || SCHOOLS_REGISTRY[0];
  const activeGround = grounds.find(g => g.groundId === selectedGroundId) || grounds[0] || {
    groundId: 'default',
    name: 'Main Oval',
    surface: 'Bulli Clay & Kikuyu Turf',
    moisturePct: 20,
    grassHeightMm: 4.5,
    rollerCompaction: '2.0-ton roller',
    bounceRating: 8.0,
    paceRating: 8.0,
    outfieldSpeed: 'Fast',
    coversStatus: 'off',
    drainageTimeMin: 30,
    curatorNotes: 'Pitch in prime competitive condition.',
    lastMaintained: 'Today 06:00',
  };

  // Assessment Form State
  const [formType, setFormType] = useState<'match_day_prep' | 'post_match' | 'weekly_scheduled' | 'weather_alert'>('match_day_prep');
  const [formStrip, setFormStrip] = useState<string>('Match Strip #2 (Centre)');
  const [formMoisture, setFormMoisture] = useState<number>(activeGround.moisturePct || 18);
  const [formHeight, setFormHeight] = useState<number>(activeGround.grassHeightMm || 4.0);
  const [formCompactionTonnage, setFormCompactionTonnage] = useState<number>(2.5);
  const [formRollingPasses, setFormRollingPasses] = useState<number>(12);
  const [formCleatPenetration, setFormCleatPenetration] = useState<number>(3.0);
  const [formBounce, setFormBounce] = useState<number>(activeGround.bounceRating || 8.5);
  const [formPace, setFormPace] = useState<number>(activeGround.paceRating || 8.2);
  const [formOutfieldSpeed, setFormOutfieldSpeed] = useState<'Fast' | 'Medium' | 'Slow'>(activeGround.outfieldSpeed || 'Fast');
  const [formCovers, setFormCovers] = useState<'off' | 'on' | 'standby'>(activeGround.coversStatus || 'off');
  const [formWeatherRisk, setFormWeatherRisk] = useState<'None' | 'Light Dew' | 'Overcast Rain Threat' | 'Severe Storm Alert'>('None');
  const [formVerdict, setFormVerdict] = useState<'MATCH READY' | 'PLAY WITH CAUTION' | 'WEATHER DELAY' | 'UNPLAYABLE / PITCH REPAIR'>('MATCH READY');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formAssessor, setFormAssessor] = useState<string>(currentRole === 'super_admin' ? 'Super Admin Inspector' : 'Ernest Mzimba');

  // Handle Cover Toggle
  const toggleCovers = (groundId: string) => {
    setGrounds(prev => prev.map(g => {
      if (g.groundId !== groundId) return g;
      const nextStatus = g.coversStatus === 'on' ? 'off' : 'on';
      return { ...g, coversStatus: nextStatus };
    }));
    setNotification(`Covers status updated to ${activeGround.coversStatus === 'on' ? 'OFF' : 'DEPLOYED'} for ${activeGround.name}`);
    setTimeout(() => setNotification(null), 3000);
  };

  // Toggle Task
  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
  };

  // Handle Assessment Submission
  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();

    const newRecord: FieldAssessmentRecord = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now (' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' SAST)',
      groundId: activeGround.groundId,
      fieldName: activeGround.name,
      schoolName: currentSchool.name,
      assessorName: formAssessor,
      assessorRole: currentRole === 'super_admin' ? 'Super Admin (Lead Inspector)' : 'Head Turfgrass Curator (CSA Level 3)',
      assessmentType: formType,
      stripNumber: formStrip,
      moisturePct: Number(formMoisture),
      grassHeightMm: Number(formHeight),
      compactionTonnage: Number(formCompactionTonnage),
      rollingPasses: Number(formRollingPasses),
      cleatPenetrationMm: Number(formCleatPenetration),
      bounceRating: Number(formBounce),
      paceRating: Number(formPace),
      outfieldSpeed: formOutfieldSpeed,
      coversStatus: formCovers,
      weatherRisk: formWeatherRisk,
      verdict: formVerdict,
      curatorNotes: formNotes || `${formVerdict} signed off by ${formAssessor}. Surface moisture tested at ${formMoisture}%. Outfield speed ${formOutfieldSpeed}.`,
    };

    // Update active ground data in memory
    setGrounds(prev => prev.map(g => {
      if (g.groundId !== activeGround.groundId) return g;
      return {
        ...g,
        moisturePct: Number(formMoisture),
        grassHeightMm: Number(formHeight),
        bounceRating: Number(formBounce),
        paceRating: Number(formPace),
        outfieldSpeed: formOutfieldSpeed,
        coversStatus: formCovers,
        rollerCompaction: `${formCompactionTonnage}T cylinder (${formRollingPasses} passes)`,
        curatorNotes: newRecord.curatorNotes,
        lastMaintained: `Today ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by ${formAssessor}`,
      };
    }));

    // Prepend to audit log
    setAssessmentLogs(prev => [newRecord, ...prev]);
    setIsAssessmentModalOpen(false);
    setNotification(`✅ Pitch assessment successfully published and logged for ${activeGround.name}!`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: D.md,
            background: `${D.emerald}20`,
            border: `1px solid ${D.emerald}`,
            color: D.emerald,
            fontFamily: D.head,
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <span>{notification}</span>
          <button
            onClick={() => setNotification(null)}
            style={{ background: 'none', border: 'none', color: D.emerald, cursor: 'pointer', fontSize: '14px', fontWeight: 800 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner & Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🌿</span>
            <h2 style={{ fontFamily: D.head, fontSize: '20px', fontWeight: 800, color: D.textPrimary }}>
              Grounds & Turfgrass Curator Management
            </h2>
            <span
              style={{
                padding: '3px 10px',
                borderRadius: D.pill,
                background: currentRole === 'super_admin' ? `${D.indigo}25` : `${D.emerald}25`,
                color: currentRole === 'super_admin' ? D.indigo : D.emerald,
                border: `1px solid ${currentRole === 'super_admin' ? D.indigo : D.emerald}`,
                fontFamily: D.mono,
                fontSize: '10px',
                fontWeight: 800,
              }}
            >
              {currentRole === 'super_admin' ? '👑 SUPER ADMIN OVERRIDE' : '🌱 CURATOR COMMAND'}
            </span>
          </div>
          <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted, marginTop: '4px' }}>
            Telemetry, moisture probe logs, laser cut heights, roller compaction passes, and daily/weekly curator assessments.
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            id="btn-log-assessment"
            onClick={() => setIsAssessmentModalOpen(true)}
            style={{
              padding: '9px 18px',
              borderRadius: D.pill,
              background: D.emerald,
              border: 'none',
              color: '#fff',
              fontFamily: D.head,
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
            }}
          >
            <span>📝</span>
            <span>+ Input Assessment Log</span>
          </button>

          <button
            id="btn-toggle-covers"
            onClick={() => toggleCovers(activeGround.groundId)}
            style={{
              padding: '9px 18px',
              borderRadius: D.pill,
              background: activeGround.coversStatus === 'on' ? `${D.rose}22` : `${D.emerald}22`,
              border: `1px solid ${activeGround.coversStatus === 'on' ? D.rose : D.emerald}`,
              color: activeGround.coversStatus === 'on' ? D.rose : D.emerald,
              fontFamily: D.head,
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>{activeGround.coversStatus === 'on' ? '☔ Covers Deployed' : '☀️ Covers Off'}</span>
            <span style={{ fontFamily: D.mono, fontSize: '10px' }}>(Toggle)</span>
          </button>
        </div>
      </div>

      {/* School Selector & Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 16px',
          background: D.surf1,
          borderRadius: D.lg,
          border: `1px solid ${D.border}`,
        }}
      >
        {/* School Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 700, color: D.textMuted }}>INSTITUTION:</span>
          <select
            value={selectedSchoolId}
            onChange={(e) => {
              setSelectedSchoolId(e.target.value);
              if (onSelectSchool) onSelectSchool(e.target.value);
            }}
            style={{
              padding: '6px 14px',
              borderRadius: D.pill,
              background: D.surf2,
              border: `1px solid ${D.border}`,
              color: D.textPrimary,
              fontFamily: D.head,
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {SCHOOLS_REGISTRY.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.fields ? s.fields.length : 1} Fields)
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Tabs */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'monitoring', label: '📊 Field Telemetry & Gauges' },
            { id: 'weekly_plan', label: '📅 7-Day Curator Maintenance Plan' },
            { id: 'history', label: `📜 Assessment Audit Logs (${assessmentLogs.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '6px 14px',
                borderRadius: D.pill,
                background: activeTab === tab.id ? D.emerald : 'transparent',
                border: `1px solid ${activeTab === tab.id ? D.emerald : D.border}`,
                color: activeTab === tab.id ? '#fff' : D.textSecondary,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: activeTab === tab.id ? 800 : 600,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Field Selector (Ovals of the Selected School) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        <span style={{ fontFamily: D.head, fontSize: '10px', color: D.textMuted, whiteSpace: 'nowrap' }}>
          FIELDS ({grounds.length}):
        </span>
        {grounds.map(g => (
          <button
            key={g.groundId}
            onClick={() => setSelectedGroundId(g.groundId)}
            style={{
              padding: '8px 16px',
              borderRadius: D.pill,
              border: `1px solid ${selectedGroundId === g.groundId ? D.emerald : D.border}`,
              background: selectedGroundId === g.groundId ? `${D.emerald}20` : D.surf1,
              color: selectedGroundId === g.groundId ? D.emerald : D.textPrimary,
              fontFamily: D.head,
              fontSize: '12px',
              fontWeight: selectedGroundId === g.groundId ? 800 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>{g.name}</span>
            {selectedGroundId === g.groundId && <span style={{ fontSize: '10px' }}>●</span>}
          </button>
        ))}
      </div>

      {/* ── TAB 1: REAL-TIME TELEMETRY & CURATOR COCKPIT ── */}
      {activeTab === 'monitoring' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 340px', gap: '16px' }}>
          {/* Left Column: Field Dossier */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Main Telemetry Card */}
            <div style={{ padding: '20px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 800, color: D.textPrimary }}>
                    {activeGround.name}
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted, marginTop: '2px' }}>
                    {currentSchool.name} · Surface: <strong style={{ color: D.textSecondary }}>{activeGround.surface}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: D.pill,
                      background: `${D.emerald}22`,
                      color: D.emerald,
                      fontFamily: D.mono,
                      fontSize: '11px',
                      fontWeight: 800,
                      border: `1px solid ${D.emerald}44`,
                    }}
                  >
                    ✓ MATCH READY
                  </span>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: D.pill,
                      background: activeGround.coversStatus === 'on' ? `${D.rose}22` : `${D.sky}22`,
                      color: activeGround.coversStatus === 'on' ? D.rose : D.sky,
                      fontFamily: D.mono,
                      fontSize: '10px',
                      fontWeight: 700,
                    }}
                  >
                    {activeGround.coversStatus === 'on' ? 'COVERS DEPLOYED' : 'UNCOVERED'}
                  </span>
                </div>
              </div>

              {/* 5 Pitch Telemetry Gauges */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginTop: '4px' }}>
                <div style={{ padding: '12px 10px', background: D.surf2, borderRadius: D.md, textAlign: 'center', border: `1px solid ${D.border}` }}>
                  <div style={{ fontFamily: D.head, fontSize: '9px', fontWeight: 800, color: D.textMuted }}>SOIL MOISTURE</div>
                  <div style={{ fontFamily: D.mono, fontSize: '22px', fontWeight: 900, color: D.sky, marginTop: '4px' }}>
                    {activeGround.moisturePct}%
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: '10px', color: D.emerald, marginTop: '2px' }}>Optimal firm deck</div>
                </div>

                <div style={{ padding: '12px 10px', background: D.surf2, borderRadius: D.md, textAlign: 'center', border: `1px solid ${D.border}` }}>
                  <div style={{ fontFamily: D.head, fontSize: '9px', fontWeight: 800, color: D.textMuted }}>CUT HEIGHT</div>
                  <div style={{ fontFamily: D.mono, fontSize: '22px', fontWeight: 900, color: D.emerald, marginTop: '4px' }}>
                    {activeGround.grassHeightMm}mm
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: '10px', color: D.textMuted, marginTop: '2px' }}>Laser mown</div>
                </div>

                <div style={{ padding: '12px 10px', background: D.surf2, borderRadius: D.md, textAlign: 'center', border: `1px solid ${D.border}` }}>
                  <div style={{ fontFamily: D.head, fontSize: '9px', fontWeight: 800, color: D.textMuted }}>BOUNCE CARRY</div>
                  <div style={{ fontFamily: D.mono, fontSize: '22px', fontWeight: 900, color: D.amber, marginTop: '4px' }}>
                    {activeGround.bounceRating}/10
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: '10px', color: D.textMuted, marginTop: '2px' }}>True trajectory</div>
                </div>

                <div style={{ padding: '12px 10px', background: D.surf2, borderRadius: D.md, textAlign: 'center', border: `1px solid ${D.border}` }}>
                  <div style={{ fontFamily: D.head, fontSize: '9px', fontWeight: 800, color: D.textMuted }}>PACE RATING</div>
                  <div style={{ fontFamily: D.mono, fontSize: '22px', fontWeight: 900, color: D.teal, marginTop: '4px' }}>
                    {activeGround.paceRating}/10
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: '10px', color: D.textMuted, marginTop: '2px' }}>Good carry</div>
                </div>

                <div style={{ padding: '12px 10px', background: D.surf2, borderRadius: D.md, textAlign: 'center', border: `1px solid ${D.border}` }}>
                  <div style={{ fontFamily: D.head, fontSize: '9px', fontWeight: 800, color: D.textMuted }}>OUTFIELD PACE</div>
                  <div style={{ fontFamily: D.mono, fontSize: '22px', fontWeight: 900, color: D.indigo, marginTop: '4px' }}>
                    {activeGround.outfieldSpeed}
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: '10px', color: D.textMuted, marginTop: '2px' }}>{activeGround.drainageTimeMin}m drain</div>
                </div>
              </div>

              {/* Roller Compaction & Mechanics Detail */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <div style={{ padding: '10px 14px', background: D.surf2, borderRadius: D.md, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>ROLLER COMPACTION PROGRAM</div>
                  <div style={{ fontFamily: D.body, fontSize: '12px', fontWeight: 700, color: D.textPrimary }}>
                    {activeGround.rollerCompaction}
                  </div>
                </div>

                <div style={{ padding: '10px 14px', background: D.surf2, borderRadius: D.md, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>DRAINAGE & STORM RESPONSE</div>
                  <div style={{ fontFamily: D.body, fontSize: '12px', fontWeight: 700, color: D.textPrimary }}>
                    Full sub-surface drainage clearance in {activeGround.drainageTimeMin} mins
                  </div>
                </div>
              </div>

              {/* Curator Notes & Signoff */}
              <div style={{ padding: '14px 16px', borderRadius: D.md, background: D.surf2, fontFamily: D.body, fontSize: '12px', color: D.textSecondary, lineHeight: 1.6, borderLeft: `3px solid ${D.emerald}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ color: D.textPrimary, fontFamily: D.head, fontSize: '12px' }}>Curator Assessment & Match Strategy:</strong>
                  <button
                    onClick={() => setIsAssessmentModalOpen(true)}
                    style={{ background: 'none', border: 'none', color: D.emerald, fontFamily: D.head, fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    ✏️ Update Assessment
                  </button>
                </div>
                {activeGround.curatorNotes}
                <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, marginTop: '8px' }}>
                  Signoff Stamp: {activeGround.lastMaintained}
                </div>
              </div>
            </div>

            {/* Boundary Dimensions Diagram */}
            <div style={{ padding: '18px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}` }}>
              <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.textPrimary, marginBottom: '10px' }}>
                OFFICIAL BOUNDARY ROPE DIMENSIONS ({activeGround.name.toUpperCase()})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {[
                  { sector: 'Straight (Long On/Off)', dist: '72m', grade: 'CSA Standard' },
                  { sector: 'Square of Wicket (Point)', dist: '68m', grade: 'Full Oval' },
                  { sector: 'Mid-Wicket / Square Leg', dist: '66m', grade: 'Full Oval' },
                  { sector: 'Fine Leg / Third Man', dist: '61m', grade: 'Short Arc' },
                ].map(b => (
                  <div key={b.sector} style={{ padding: '10px', background: D.surf2, borderRadius: D.md, border: `1px solid ${D.border}` }}>
                    <div style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>{b.sector}</div>
                    <div style={{ fontFamily: D.mono, fontSize: '18px', fontWeight: 800, color: D.emerald, marginTop: '2px' }}>{b.dist}</div>
                    <div style={{ fontFamily: D.body, fontSize: '10px', color: D.textMuted }}>{b.grade}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Daily Curator Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '18px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.textPrimary }}>
                  MATCH PREP CHECKLIST
                </span>
                <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.emerald, fontWeight: 800 }}>
                  {tasks.filter(t => t.done).length}/{tasks.length} Completed
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tasks.map(t => (
                  <div
                    key={t.id}
                    onClick={() => toggleTask(t.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px',
                      borderRadius: D.md,
                      background: t.done ? `${D.emerald}12` : D.surf2,
                      border: `1px solid ${t.done ? D.emerald + '33' : D.border}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        background: t.done ? D.emerald : 'transparent',
                        border: `1.5px solid ${t.done ? D.emerald : D.textMuted}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 900,
                        flexShrink: 0,
                      }}
                    >
                      {t.done && '✓'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: D.body,
                          fontSize: '11px',
                          fontWeight: 600,
                          color: D.textPrimary,
                          textDecoration: t.done ? 'line-through' : 'none',
                          opacity: t.done ? 0.8 : 1,
                        }}
                      >
                        {t.task}
                      </div>
                      <div style={{ fontFamily: D.mono, fontSize: '9px', color: D.textMuted, marginTop: '2px' }}>
                        {t.day} · {t.time} SAST
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Head Curator Info Card */}
              <div style={{ padding: '12px', borderRadius: D.md, background: D.surf2, border: `1px solid ${D.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>👨‍🌾</span>
                <div>
                  <div style={{ fontFamily: D.head, fontSize: '11px', fontWeight: 800, color: D.textPrimary }}>
                    Head Curator: Mr Ernest Mzimba
                  </div>
                  <div style={{ fontFamily: D.body, fontSize: '10px', color: D.textMuted }}>
                    CSA Turfgrass Level 3 · 26 yrs Tenure · Cell: +27 82 555 1902
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: 7-DAY CURATOR MAINTENANCE PLAN ── */}
      {activeTab === 'weekly_plan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '18px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.emerald }}>
                📅 7-DAY CURATOR PITCH & OUTFIELD MAINTENANCE REGIME
              </div>
              <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted, marginTop: '2px' }}>
                Standard operating procedure for preparing 1st XI Bulli Clay match strips and preserving grass root depth.
              </div>
            </div>

            <button
              onClick={() => setIsAssessmentModalOpen(true)}
              style={{
                padding: '8px 16px',
                borderRadius: D.pill,
                background: D.emerald,
                border: 'none',
                color: '#fff',
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              + Log Daily/Weekly Assessment
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {[
              { day: 'MONDAY', title: 'Thatch Scarification & Outfield Cleanup', time: '06:30', action: 'Remove dead organic thatch on match strip. Sweep boundary perimeter for plastic/tape.', tool: 'Hand scarifier & blower', status: 'Completed' },
              { day: 'TUESDAY', title: 'Deep Aeration & Soil Conditioning', time: '08:00', action: 'Solid-tine spiking to 100mm depth to relieve compaction. Light top-dressing with screened Bulli clay.', tool: 'Verti-Drain Spiker', status: 'Completed' },
              { day: 'WEDNESDAY', title: 'Controlled Pitch Irrigation Cycle', time: '05:00', action: 'Apply 15mm equivalent sprinkler watering to saturate pitch base to 150mm. Monitor moisture probe.', tool: 'Automated Pop-Up Sprinklers', status: 'Completed' },
              { day: 'THURSDAY', title: 'Cross-Rolling & Camber Dressing', time: '14:00', action: 'Cross-pitch rolling with 1.8T roller (8 passes) while moisture is ~22%. Seal surface voids.', tool: '1.8T Tandem Roller', status: 'Completed' },
              { day: 'FRIDAY', title: 'Final Match-Cut & Heavy Rolling', time: '07:30', action: 'Laser-cut match strip down to 4.0mm. 12-pass heavy rolling with 2.5T motorized cylinder.', tool: '2.5T Cylinder Roller & Cylinder Mower', status: 'Completed' },
              { day: 'SATURDAY', title: 'Match-Day Prep & Dew Sweep', time: '06:00', action: 'Morning moisture reading. Crease painting with acrylic emulsion. Boundary wedges & sight screens set.', tool: 'Line Marker, Moisture Probe', status: 'In Progress' },
              { day: 'SUNDAY', title: 'Post-Derby Divot Repair & Rest', time: '16:00', action: 'Inspect bowler footmarks and popping crease divots. Fill with moist clay/seed mix and hand-tamp.', tool: 'Hand Tamper, Germination Cover', status: 'Scheduled' },
            ].map((plan, idx) => (
              <div key={idx} style={{ padding: '16px', background: D.surf1, borderRadius: D.md, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.emerald }}>
                      {plan.day}
                    </span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: D.pill,
                        background: plan.status === 'Completed' ? `${D.emerald}20` : plan.status === 'In Progress' ? `${D.amber}20` : D.surf2,
                        color: plan.status === 'Completed' ? D.emerald : plan.status === 'In Progress' ? D.amber : D.textMuted,
                        fontFamily: D.mono,
                        fontSize: '9px',
                        fontWeight: 700,
                      }}
                    >
                      {plan.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary, marginTop: '6px' }}>
                    {plan.title}
                  </div>

                  <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary, marginTop: '4px', lineHeight: 1.5 }}>
                    {plan.action}
                  </div>
                </div>

                <div style={{ paddingTop: '8px', borderTop: `1px solid ${D.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: D.mono, fontSize: '9px', color: D.textMuted }}>
                  <span>🛠️ {plan.tool}</span>
                  <span>⏰ {plan.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: AUDITABLE ASSESSMENT HISTORY LOGS ── */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '16px', background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary }}>
                📜 OFFICIAL FIELD ASSESSMENT AUDIT LOGS
              </div>
              <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted, marginTop: '2px' }}>
                All submitted daily inspections, rolling passes, surface moisture probe tests, and umpire signoffs.
              </div>
            </div>

            <button
              onClick={() => setIsAssessmentModalOpen(true)}
              style={{
                padding: '8px 16px',
                borderRadius: D.pill,
                background: D.emerald,
                border: 'none',
                color: '#fff',
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              + Record New Inspection
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {assessmentLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: '16px',
                  background: D.surf1,
                  borderRadius: D.md,
                  border: `1px solid ${D.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary }}>
                      {log.fieldName}
                    </span>
                    <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                      ({log.stripNumber})
                    </span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: D.pill,
                        background: log.verdict === 'MATCH READY' ? `${D.emerald}20` : `${D.amber}20`,
                        color: log.verdict === 'MATCH READY' ? D.emerald : D.amber,
                        fontFamily: D.mono,
                        fontSize: '9px',
                        fontWeight: 800,
                      }}
                    >
                      {log.verdict}
                    </span>
                  </div>

                  <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                    {log.timestamp}
                  </span>
                </div>

                {/* Log Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px', padding: '10px', background: D.surf2, borderRadius: D.md }}>
                  <div>
                    <div style={{ fontFamily: D.head, fontSize: '8px', color: D.textMuted }}>MOISTURE</div>
                    <div style={{ fontFamily: D.mono, fontSize: '14px', fontWeight: 800, color: D.sky }}>{log.moisturePct}%</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: D.head, fontSize: '8px', color: D.textMuted }}>CUT HEIGHT</div>
                    <div style={{ fontFamily: D.mono, fontSize: '14px', fontWeight: 800, color: D.emerald }}>{log.grassHeightMm}mm</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: D.head, fontSize: '8px', color: D.textMuted }}>COMPACTION</div>
                    <div style={{ fontFamily: D.mono, fontSize: '14px', fontWeight: 800, color: D.textPrimary }}>{log.compactionTonnage}T ({log.rollingPasses}p)</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: D.head, fontSize: '8px', color: D.textMuted }}>CLEAT PENETRATION</div>
                    <div style={{ fontFamily: D.mono, fontSize: '14px', fontWeight: 800, color: D.amber }}>{log.cleatPenetrationMm}mm</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: D.head, fontSize: '8px', color: D.textMuted }}>BOUNCE / PACE</div>
                    <div style={{ fontFamily: D.mono, fontSize: '14px', fontWeight: 800, color: D.teal }}>{log.bounceRating} / {log.paceRating}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: D.head, fontSize: '8px', color: D.textMuted }}>OUTFIELD SPEED</div>
                    <div style={{ fontFamily: D.mono, fontSize: '14px', fontWeight: 800, color: D.indigo }}>{log.outfieldSpeed}</div>
                  </div>
                </div>

                {/* Notes & Assessor Sign-off */}
                <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary, lineHeight: 1.5 }}>
                  <strong>Curator Observations:</strong> {log.curatorNotes}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: D.mono, fontSize: '9px', color: D.textMuted, borderTop: `1px solid ${D.border}`, paddingTop: '6px' }}>
                  <span>Verified by: <strong style={{ color: D.textPrimary }}>{log.assessorName}</strong> ({log.assessorRole})</span>
                  <span>School: {log.schoolName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODAL: INPUT FIELD ASSESSMENT (DAILY/WEEKLY) ── */}
      {isAssessmentModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setIsAssessmentModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '640px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: D.surf1,
              borderRadius: D.lg,
              border: `1px solid ${D.border}`,
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${D.border}`, pb: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>🌱</span>
                  <h3 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.textPrimary }}>
                    Input Field Condition & Curator Assessment
                  </h3>
                </div>
                <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted, marginTop: '2px' }}>
                  Recording for: <strong style={{ color: D.emerald }}>{activeGround.name}</strong> ({currentSchool.name})
                </div>
              </div>
              <button
                onClick={() => setIsAssessmentModalOpen(false)}
                style={{ background: 'none', border: 'none', color: D.textMuted, fontSize: '18px', cursor: 'pointer', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>

            {/* Assessment Form */}
            <form onSubmit={handleSaveAssessment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Row 1: Assessment Type & Pitch Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: D.head, fontSize: '10px', fontWeight: 700, color: D.textMuted, marginBottom: '4px' }}>
                    INSPECTION TYPE
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: D.md,
                      background: D.surf2,
                      border: `1px solid ${D.border}`,
                      color: D.textPrimary,
                      fontFamily: D.body,
                      fontSize: '12px',
                    }}
                  >
                    <option value="match_day_prep">Match-Day Morning Inspection (06:00)</option>
                    <option value="post_match">Post-Match Evening Recovery</option>
                    <option value="weekly_scheduled">Weekly Scheduled Maintenance Log</option>
                    <option value="weather_alert">Inclement Weather / Rain Cover Protocol</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: D.head, fontSize: '10px', fontWeight: 700, color: D.textMuted, marginBottom: '4px' }}>
                    PITCH STRIP NUMBER
                  </label>
                  <select
                    value={formStrip}
                    onChange={(e) => setFormStrip(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: D.md,
                      background: D.surf2,
                      border: `1px solid ${D.border}`,
                      color: D.textPrimary,
                      fontFamily: D.body,
                      fontSize: '12px',
                    }}
                  >
                    <option value="Match Strip #1 (North)">Match Strip #1 (North Edge)</option>
                    <option value="Match Strip #2 (Centre)">Match Strip #2 (Centre Match Deck)</option>
                    <option value="Match Strip #3 (South)">Match Strip #3 (South Deck)</option>
                    <option value="Match Strip #4 (Junior)">Match Strip #4 (Junior / Feeder Strip)</option>
                    <option value="Practice Net Wickets">Turf Practice Nets (Nets 1-4)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Soil Moisture Probe % & Grass Cut Height mm */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: D.head, fontSize: '10px', fontWeight: 700, color: D.textMuted, marginBottom: '4px' }}>
                    SOIL MOISTURE PROBE ({formMoisture}%)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="range"
                      min="10"
                      max="35"
                      step="1"
                      value={formMoisture}
                      onChange={(e) => setFormMoisture(Number(e.target.value))}
                      style={{ flex: 1, accentColor: D.sky }}
                    />
                    <span style={{ fontFamily: D.mono, fontSize: '13px', fontWeight: 800, color: D.sky, minWidth: '40px' }}>
                      {formMoisture}%
                    </span>
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: '9px', color: D.textMuted, marginTop: '2px' }}>
                    14-20%: Firm match pace | 21-25%: Moderate seam | &gt;26%: Damp deck
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: D.head, fontSize: '10px', fontWeight: 700, color: D.textMuted, marginBottom: '4px' }}>
                    GRASS CUT HEIGHT (mm)
                  </label>
                  <input
                    type="number"
                    min="3.0"
                    max="8.0"
                    step="0.1"
                    value={formHeight}
                    onChange={(e) => setFormHeight(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: D.md,
                      background: D.surf2,
                      border: `1px solid ${D.border}`,
                      color: D.textPrimary,
                      fontFamily: D.mono,
                      fontSize: '12px',
                    }}
                  />
                  <div style={{ fontFamily: D.mono, fontSize: '9px', color: D.textMuted, marginTop: '2px' }}>
                    Standard: 4.0mm for Premier 1st XI fixtures
                  </div>
                </div>
              </div>

              {/* Row 3: Roller Compaction (Tonnage & Passes) & Cleat Penetration */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: D.head, fontSize: '10px', fontWeight: 700, color: D.textMuted, marginBottom: '4px' }}>
                    ROLLER WEIGHT (TONS)
                  </label>
                  <select
                    value={formCompactionTonnage}
                    onChange={(e) => setFormCompactionTonnage(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: D.md,
                      background: D.surf2,
                      border: `1px solid ${D.border}`,
                      color: D.textPrimary,
                      fontFamily: D.body,
                      fontSize: '11px',
                    }}
                  >
                    <option value="1.2">1.2T (Junior Oval)</option>
                    <option value="1.8">1.8T (Tandem Roller)</option>
                    <option value="2.5">2.5T (Motorized Heavy)</option>
                    <option value="3.0">3.0T (CSA Championship)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: D.head, fontSize: '10px', fontWeight: 700, color: D.textMuted, marginBottom: '4px' }}>
                    ROLLING PASSES
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="30"
                    value={formRollingPasses}
                    onChange={(e) => setFormRollingPasses(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: D.md,
                      background: D.surf2,
                      border: `1px solid ${D.border}`,
                      color: D.textPrimary,
                      fontFamily: D.mono,
                      fontSize: '11px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: D.head, fontSize: '10px', fontWeight: 700, color: D.textMuted, marginBottom: '4px' }}>
                    CLEAT PENETRATION (mm)
                  </label>
                  <input
                    type="number"
                    min="1.0"
                    max="10.0"
                    step="0.5"
                    value={formCleatPenetration}
                    onChange={(e) => setFormCleatPenetration(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: D.md,
                      background: D.surf2,
                      border: `1px solid ${D.border}`,
                      color: D.textPrimary,
                      fontFamily: D.mono,
                      fontSize: '11px',
                    }}
                  />
                </div>
              </div>

              {/* Row 4: Ratings (Bounce & Pace out of 10) & Outfield Speed */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: D.head, fontSize: '10px', fontWeight: 700, color: D.textMuted, marginBottom: '4px' }}>
                    ESTIMATED BOUNCE ({formBounce}/10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    value={formBounce}
                    onChange={(e) => setFormBounce(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: D.md,
                      background: D.surf2,
                      border: `1px solid ${D.border}`,
                      color: D.textPrimary,
                      fontFamily: D.mono,
                      fontSize: '11px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: D.head, fontSize: '10px', fontWeight: 700, color: D.textMuted, marginBottom: '4px' }}>
                    ESTIMATED PACE ({formPace}/10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    value={formPace}
                    onChange={(e) => setFormPace(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: D.md,
                      background: D.surf2,
                      border: `1px solid ${D.border}`,
                      color: D.textPrimary,
                      fontFamily: D.mono,
                      fontSize: '11px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: D.head, fontSize: '10px', fontWeight: 700, color: D.textMuted, marginBottom: '4px' }}>
                    OUTFIELD SPEED
                  </label>
                  <select
                    value={formOutfieldSpeed}
                    onChange={(e) => setFormOutfieldSpeed(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: D.md,
                      background: D.surf2,
                      border: `1px solid ${D.border}`,
                      color: D.textPrimary,
                      fontFamily: D.body,
                      fontSize: '11px',
                    }}
                  >
                    <option value="Fast">Fast (Laser cut & rolled)</option>
                    <option value="Medium">Medium (Standard Kikuyu)</option>
                    <option value="Slow">Slow (Wet / Dense grass)</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Verdict & Covers Protocol */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: D.head, fontSize: '10px', fontWeight: 700, color: D.textMuted, marginBottom: '4px' }}>
                    OFFICIAL MATCH SUITABILITY VERDICT
                  </label>
                  <select
                    value={formVerdict}
                    onChange={(e) => setFormVerdict(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: D.md,
                      background: D.surf2,
                      border: `1px solid ${D.border}`,
                      color: formVerdict === 'MATCH READY' ? D.emerald : formVerdict === 'PLAY WITH CAUTION' ? D.amber : D.rose,
                      fontFamily: D.head,
                      fontSize: '11px',
                      fontWeight: 800,
                    }}
                  >
                    <option value="MATCH READY">✓ MATCH READY (Passes all CSA criteria)</option>
                    <option value="PLAY WITH CAUTION">⚠️ PLAY WITH CAUTION (Soft bowler footmarks)</option>
                    <option value="WEATHER DELAY">☔ WEATHER DELAY (Covers deployed)</option>
                    <option value="UNPLAYABLE / PITCH REPAIR">⛔ UNPLAYABLE (Dangerous bounce / flooded)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: D.head, fontSize: '10px', fontWeight: 700, color: D.textMuted, marginBottom: '4px' }}>
                    COVERS DEPLOYMENT STATUS
                  </label>
                  <select
                    value={formCovers}
                    onChange={(e) => setFormCovers(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: D.md,
                      background: D.surf2,
                      border: `1px solid ${D.border}`,
                      color: D.textPrimary,
                      fontFamily: D.body,
                      fontSize: '11px',
                    }}
                  >
                    <option value="off">☀️ Covers Off (Exposed to sun)</option>
                    <option value="standby">⚡ Standby (Boundary side ready)</option>
                    <option value="on">☔ Deployed (Full pitch table covered)</option>
                  </select>
                </div>
              </div>

              {/* Row 6: Curator Notes & Observations */}
              <div>
                <label style={{ display: 'block', fontFamily: D.head, fontSize: '10px', fontWeight: 700, color: D.textMuted, marginBottom: '4px' }}>
                  CURATOR NOTES, CRACK MAPPING & STRATEGY DIRECTIVES
                </label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g., Uniform compaction across good-length zone. Slight micro-cracking starting on off-stump line. Advise captains to bat first on winning the toss..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: D.md,
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    color: D.textPrimary,
                    fontFamily: D.body,
                    fontSize: '11px',
                    lineHeight: 1.5,
                  }}
                />
              </div>

              {/* Row 7: Assessor Name */}
              <div>
                <label style={{ display: 'block', fontFamily: D.head, fontSize: '10px', fontWeight: 700, color: D.textMuted, marginBottom: '4px' }}>
                  CERTIFIED ASSESSOR / CURATOR SIGNOFF
                </label>
                <input
                  type="text"
                  value={formAssessor}
                  onChange={(e) => setFormAssessor(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: D.md,
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    color: D.textPrimary,
                    fontFamily: D.body,
                    fontSize: '12px',
                  }}
                />
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAssessmentModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: D.pill,
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    color: D.textPrimary,
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
                    background: D.emerald,
                    border: 'none',
                    color: '#fff',
                    fontFamily: D.head,
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  💾 Save & Publish Assessment Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
