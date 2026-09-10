'use client';

import React, { useState, useMemo } from 'react';
import { Theme, Drill, Player } from './types';
import { PLAYERS } from './data';

interface TrainingViewProps {
  theme: Theme;
  players?: Player[];
}

export interface PlayerAssignedRoutine {
  id: string;
  playerId: string;
  playerName: string;
  playerRole: string;
  drillId: string;
  drillName: string;
  category: "batting" | "bowling" | "fielding" | "fitness" | "tactical";
  intensity: "low" | "medium" | "high";
  targetSets: string;
  frequency: "Daily" | "3x / Week" | "Match Day Prep" | "Rehab Specific";
  scheduledDay: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  scheduledTime: string;
  status: "unassigned" | "assigned" | "in_review" | "mastered";
  assignedByCoach: string;
  assignedDate: string;
  targetCompletionDate: string;
  coachingNotes: string;
  completionRatePct: number;
}

const DRILL_LIBRARY: Drill[] = [
  {
    id: "dr1",
    name: "Front-Foot Drive Corridor Target",
    category: "batting",
    durationMins: 25,
    intensity: "medium",
    equipment: ["Sidearm ball thrower", "Cones", "6 Kookaburra balls"],
    description: "Batters hit full-length deliveries between two cones placed at extra cover and mid-off. Focus on leading with the head and elbow.",
    keyCoachingPoints: ["High front elbow aligned towards target", "Head positioned directly over ball at impact", "Weight transferred smoothly onto front knee"],
  },
  {
    id: "dr2",
    name: "Short-Ball Pull & Hook Mastery",
    category: "batting",
    durationMins: 20,
    intensity: "high",
    equipment: ["Bowling machine (125-135 km/h)", "Incrediballs / Leather", "Cones"],
    description: "Rapid delivery of chest-high bouncers. Batters practice rolling wrists on the pull to keep the ball grounded forward of square.",
    keyCoachingPoints: ["Quick back-and-across movement", "Eyes locked on ball; avoid turning head away", "Roll wrists over the ball at point of contact"],
  },
  {
    id: "dr3",
    name: "Death-Overs Yorker Target Challenge",
    category: "bowling",
    durationMins: 30,
    intensity: "high",
    equipment: ["Shoe boxes or cones at popping crease", "Speed radar gun"],
    description: "Bowlers attempt 18 deliveries aiming directly at a shoe box placed on the batting crease. Points awarded for clean hits.",
    keyCoachingPoints: ["Drive front knee hard through crease", "Lock wrist tightly at 12 o'clock release", "Do not shorten stride length on final bound"],
  },
  {
    id: "dr4",
    name: "Slip Cordon Reflex React & Catch",
    category: "fielding",
    durationMins: 20,
    intensity: "high",
    equipment: ["Katchet deflection ramp", "Soft reflex balls", "Catching mitts"],
    description: "Ramp-deflected balls simulating thick edges into 1st, 2nd, and 3rd slip. Players take rapid-fire reaction catches in low posture.",
    keyCoachingPoints: ["Soft hands giving with the ball", "Weight on balls of feet; hips down", "Watch ball into the cupped palms"],
  },
  {
    id: "dr5",
    name: "Run-Out Direct Hit Pressure Shuttle",
    category: "fielding",
    durationMins: 25,
    intensity: "high",
    equipment: ["Single stump target", "Stopwatch", "12 Cricket balls"],
    description: "Fielder sprints 20m from cover, picks up ball with one hand, and throws at one stump with 2-second time penalty.",
    keyCoachingPoints: ["Stay low when swooping on the ball", "Pick up cleanly outside the right foot", "Turn sideways and release in one fluid motion"],
  },
  {
    id: "dr6",
    name: "Fast-Bowler Repeat Sprint Interval (RSI)",
    category: "fitness",
    durationMins: 35,
    intensity: "high",
    equipment: ["Heart rate monitors", "Cones", "Agility ladders"],
    description: "6 sets of 30m maximum intensity sprints simulating run-up deceleration and repeat spells. 45 seconds rest between repetitions.",
    keyCoachingPoints: ["Explosive first 3 strides", "Maintain upright running posture", "Controlled deceleration over 10m"],
  },
  {
    id: "dr7",
    name: "Spin Bowling Drift & Drop Control",
    category: "bowling",
    durationMins: 30,
    intensity: "medium",
    equipment: ["Visual string trajectory guides", "Chalk target discs"],
    description: "Spinners deliver over an elevated crossbar to force dip and revolutions, landing within a 30cm chalk circle outside off-stump.",
    keyCoachingPoints: ["Cock wrist fully behind the ball", "Drive through hip pivot for maximum revolutions", "Complete full bowling arm wrap-around"],
  },
  {
    id: "dr8",
    name: "Middle-Overs Strike Rotation Running",
    category: "tactical",
    durationMins: 25,
    intensity: "medium",
    equipment: ["Full pitch cones", "Batting pads and gloves"],
    description: "Paired batters practice drop-and-run calling in the infield, reading fielder momentum and converting 0s into 1s and 1s into 2s.",
    keyCoachingPoints: ["Decisive, loud 'YES', 'NO', 'WAIT' calls", "Slide bat past popping crease on turn", "Always turn facing the ball"],
  },
];

const INITIAL_ASSIGNED_ROUTINES: PlayerAssignedRoutine[] = [
  {
    id: "as-1",
    playerId: "p1",
    playerName: "James Whitfield",
    playerRole: "Top-Order Batsman",
    drillId: "dr2",
    drillName: "Short-Ball Pull & Hook Mastery",
    category: "batting",
    intensity: "high",
    targetSets: "4 sets × 12 balls (130 km/h)",
    frequency: "3x / Week",
    scheduledDay: "Tuesday",
    scheduledTime: "14:30",
    status: "assigned",
    assignedByCoach: "Wayne Scott (Head Coach)",
    assignedDate: "2026-09-08",
    targetCompletionDate: "2026-09-22",
    coachingNotes: "Work on rolling top wrist early; eliminate top edges vs Hilton's pace attack.",
    completionRatePct: 65,
  },
  {
    id: "as-2",
    playerId: "p1",
    playerName: "James Whitfield",
    playerRole: "Top-Order Batsman",
    drillId: "dr4",
    drillName: "Slip Cordon Reflex React & Catch",
    category: "fielding",
    intensity: "high",
    targetSets: "60 catches (20 each at 1st, 2nd, 3rd slip)",
    frequency: "Daily",
    scheduledDay: "Wednesday",
    scheduledTime: "06:30",
    status: "in_review",
    assignedByCoach: "Craig Hendricks (Fielding Coach)",
    assignedDate: "2026-09-07",
    targetCompletionDate: "2026-09-18",
    coachingNotes: "Maintain lower center of gravity; stay still until the edge is induced.",
    completionRatePct: 82,
  },
  {
    id: "as-3",
    playerId: "p2",
    playerName: "Kyle Petersen",
    playerRole: "Opening Fast Bowler",
    drillId: "dr3",
    drillName: "Death-Overs Yorker Target Challenge",
    category: "bowling",
    intensity: "high",
    targetSets: "3 sets × 6 yorkers into base target",
    frequency: "3x / Week",
    scheduledDay: "Thursday",
    scheduledTime: "15:00",
    status: "assigned",
    assignedByCoach: "Wayne Scott (Head Coach)",
    assignedDate: "2026-09-09",
    targetCompletionDate: "2026-09-24",
    coachingNotes: "Target base of off-stump from over the wicket; monitor front foot landing line.",
    completionRatePct: 40,
  },
  {
    id: "as-4",
    playerId: "p3",
    playerName: "Sipho Ndlovu",
    playerRole: "Left-Arm Orthodox Spinner",
    drillId: "dr7",
    drillName: "Spin Bowling Drift & Drop Control",
    category: "bowling",
    intensity: "medium",
    targetSets: "5 sets × 8 balls over visual crossbar",
    frequency: "Daily",
    scheduledDay: "Monday",
    scheduledTime: "14:00",
    status: "mastered",
    assignedByCoach: "Bongani Cele (Spin Specialist)",
    assignedDate: "2026-08-28",
    targetCompletionDate: "2026-09-12",
    coachingNotes: "Excellent flight trajectory achieved; certified competent on Bulli clay.",
    completionRatePct: 100,
  },
  {
    id: "as-5",
    playerId: "p4",
    playerName: "Matthew Evans",
    playerRole: "Wicketkeeper / Batsman",
    drillId: "dr1",
    drillName: "Front-Foot Drive Corridor Target",
    category: "batting",
    intensity: "medium",
    targetSets: "50 drives through 1m cone corridor",
    frequency: "3x / Week",
    scheduledDay: "Friday",
    scheduledTime: "07:00",
    status: "in_review",
    assignedByCoach: "Wayne Scott (Head Coach)",
    assignedDate: "2026-09-05",
    targetCompletionDate: "2026-09-20",
    coachingNotes: "Head position much improved over front toe. Needs consistency on fifth-stump line.",
    completionRatePct: 75,
  },
  {
    id: "as-6",
    playerId: "p6",
    playerName: "Chad van Breda",
    playerRole: "Fast Bowler",
    drillId: "dr6",
    drillName: "Fast-Bowler Repeat Sprint Interval (RSI)",
    category: "fitness",
    intensity: "high",
    targetSets: "6 × 30m sprints (45s rest recovery)",
    frequency: "3x / Week",
    scheduledDay: "Monday",
    scheduledTime: "06:30",
    status: "assigned",
    assignedByCoach: "Ernest Mzimba (Strength & Conditioning)",
    assignedDate: "2026-09-09",
    targetCompletionDate: "2026-09-23",
    coachingNotes: "Monitor heart rate recovery. Cease immediately if hamstring tightness exceeds Grade 1.",
    completionRatePct: 50,
  },
];

type ViewMode = "cards" | "list" | "kanban" | "timeline" | "calendar";

export default function TrainingView({ theme: D, players = PLAYERS }: TrainingViewProps) {
  const safePlayers = players && players.length > 0 ? players : PLAYERS;
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDrill, setSelectedDrill] = useState<Drill>(DRILL_LIBRARY[0]);
  const [assignedRoutines, setAssignedRoutines] = useState<PlayerAssignedRoutine[]>(INITIAL_ASSIGNED_ROUTINES);

  // Assignment Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [assignPlayerId, setAssignPlayerId] = useState<string>(safePlayers[0]?.id || "p1");
  const [assignDrillId, setAssignDrillId] = useState<string>(DRILL_LIBRARY[0].id);
  const [assignSets, setAssignSets] = useState<string>("4 sets × 12 balls");
  const [assignFreq, setAssignFreq] = useState<"Daily" | "3x / Week" | "Match Day Prep" | "Rehab Specific">("3x / Week");
  const [assignDay, setAssignDay] = useState<"Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday">("Tuesday");
  const [assignTime, setAssignTime] = useState<string>("15:00");
  const [assignCoachNotes, setAssignCoachNotes] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filtered Drills
  const filteredDrills = useMemo(() => {
    return DRILL_LIBRARY.filter(d => {
      const matchCat = categoryFilter === "all" || d.category === categoryFilter;
      const matchSearch = searchQuery.trim() === "" ||
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [categoryFilter, searchQuery]);

  // Filtered Routines
  const filteredRoutines = useMemo(() => {
    return assignedRoutines.filter(r => {
      const matchCat = categoryFilter === "all" || r.category === categoryFilter;
      const matchSearch = searchQuery.trim() === "" ||
        r.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.drillName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.coachingNotes.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [assignedRoutines, categoryFilter, searchQuery]);

  // Open modal pre-selected with a specific drill
  const handleOpenAssignModal = (drill?: Drill) => {
    if (drill) {
      setAssignDrillId(drill.id);
    }
    setIsAssignModalOpen(true);
  };

  // Submit Routine Assignment
  const handleAssignRoutineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPlayer = safePlayers.find(p => p.id === assignPlayerId) || safePlayers[0];
    const targetDrill = DRILL_LIBRARY.find(d => d.id === assignDrillId) || DRILL_LIBRARY[0];

    const newRoutine: PlayerAssignedRoutine = {
      id: `as-${Date.now()}`,
      playerId: targetPlayer.id,
      playerName: targetPlayer.name,
      playerRole: targetPlayer.role,
      drillId: targetDrill.id,
      drillName: targetDrill.name,
      category: targetDrill.category,
      intensity: targetDrill.intensity,
      targetSets: assignSets || "3 sets × 10 reps",
      frequency: assignFreq,
      scheduledDay: assignDay,
      scheduledTime: assignTime,
      status: "assigned",
      assignedByCoach: "Wayne Scott (Head Coach)",
      assignedDate: new Date().toISOString().split("T")[0],
      targetCompletionDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      coachingNotes: assignCoachNotes || `Focus on technical repetition and balance for ${targetDrill.name}.`,
      completionRatePct: 0,
    };

    setAssignedRoutines(prev => [newRoutine, ...prev]);
    setIsAssignModalOpen(false);
    setAssignCoachNotes("");
    setToastMessage(`Assigned "${targetDrill.name}" to ${targetPlayer.name} successfully!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Advance routine status
  const handleAdvanceStatus = (routineId: string) => {
    setAssignedRoutines(prev => prev.map(r => {
      if (r.id !== routineId) return r;
      const nextStatus: PlayerAssignedRoutine["status"] =
        r.status === "assigned" ? "in_review" :
        r.status === "in_review" ? "mastered" : "assigned";
      const nextPct = nextStatus === "mastered" ? 100 : nextStatus === "in_review" ? 75 : 25;
      return { ...r, status: nextStatus, completionRatePct: nextPct };
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            padding: '12px 18px',
            background: `${D.emerald}20`,
            border: `1px solid ${D.emerald}`,
            borderRadius: D.md,
            color: D.emerald,
            fontFamily: D.head,
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>💪</span>
            <h2 style={{ fontFamily: D.head, fontSize: '18px', fontWeight: 800, color: D.textPrimary, margin: 0 }}>
              Squad Training & High-Performance Routine Hub
            </h2>
          </div>
          <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted, marginTop: '2px' }}>
            Assign tailored drill modules, track individual player routines, and monitor mastery across 5 distinct perspectives
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => handleOpenAssignModal()}
          style={{
            padding: '9px 18px',
            borderRadius: D.pill,
            background: D.indigo,
            border: 'none',
            color: '#fff',
            fontFamily: D.head,
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
          }}
        >
          <span>+</span>
          <span>Assign Drill to Player</span>
        </button>
      </div>

      {/* Control Bar: View Switcher, Category Pills & Search */}
      <div
        style={{
          padding: '14px 18px',
          background: D.surf1,
          borderRadius: D.lg,
          border: `1px solid ${D.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        {/* View Switcher Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, marginRight: '4px' }}>
            VIEW MODE:
          </span>
          {[
            { id: 'cards', icon: '🗂️', label: 'Cards Gallery' },
            { id: 'list', icon: '📋', label: 'List Table' },
            { id: 'kanban', icon: '📊', label: 'Kanban Pipeline' },
            { id: 'timeline', icon: '⏱️', label: 'Timeline / Gantt' },
            { id: 'calendar', icon: '📅', label: 'Calendar' },
          ].map(v => (
            <button
              key={v.id}
              onClick={() => setViewMode(v.id as ViewMode)}
              style={{
                padding: '6px 12px',
                borderRadius: D.md,
                background: viewMode === v.id ? D.indigo : D.surf2,
                border: `1px solid ${viewMode === v.id ? D.indigo : D.border}`,
                color: viewMode === v.id ? '#fff' : D.textSecondary,
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span>{v.icon}</span>
              <span>{v.label}</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '10px', flex: '1 1 240px', maxWidth: '350px' }}>
          <input
            type="text"
            placeholder="Search drills, players, or cues..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 12px',
              borderRadius: D.md,
              background: D.surf2,
              border: `1px solid ${D.border}`,
              color: D.textPrimary,
              fontFamily: D.body,
              fontSize: '12px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Category Pills Bar */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {['all', 'batting', 'bowling', 'fielding', 'fitness', 'tactical'].map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            style={{
              padding: '5px 12px',
              borderRadius: D.pill,
              border: `1px solid ${categoryFilter === cat ? D.sky : D.border}`,
              background: categoryFilter === cat ? `${D.sky}25` : D.surf1,
              color: categoryFilter === cat ? D.sky : D.textMuted,
              fontFamily: D.head,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {cat === 'all' ? 'All Disciplines' : cat}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: CARDS GALLERY VIEW (Drill Repository + Assigned Routine Cards)     */}
      {/* ========================================================================= */}
      {viewMode === "cards" && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.25fr) minmax(300px, 1fr)', gap: '18px' }}>
          {/* Left: Drill Repository */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
                COACHING DRILL REPOSITORY ({filteredDrills.length})
              </div>
              <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                Click card to inspect coaching cues
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {filteredDrills.map(drill => {
                const isSelected = selectedDrill.id === drill.id;
                const catColor =
                  drill.category === 'batting' ? D.sky :
                  drill.category === 'bowling' ? D.violet :
                  drill.category === 'fielding' ? D.emerald :
                  drill.category === 'fitness' ? D.rose : D.amber;

                return (
                  <div
                    key={drill.id}
                    onClick={() => setSelectedDrill(drill)}
                    style={{
                      padding: '16px',
                      borderRadius: D.lg,
                      background: isSelected ? `${D.indigo}18` : D.surf1,
                      border: `1px solid ${isSelected ? D.indigo : D.border}`,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      boxShadow: isSelected ? `0 0 0 1px ${D.indigo}` : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: D.head, fontSize: '10px', fontWeight: 800, color: catColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {drill.category}
                      </span>
                      <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                        ⏱ {drill.durationMins} mins
                      </span>
                    </div>

                    <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary }}>
                      {drill.name}
                    </div>

                    <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textSecondary, lineHeight: 1.5 }}>
                      {drill.description}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px', borderTop: `1px solid ${D.border}` }}>
                      <span style={{ padding: '2px 8px', borderRadius: D.pill, background: D.surf2, fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                        Intensity: <strong style={{ color: drill.intensity === 'high' ? D.rose : D.amber }}>{drill.intensity}</strong>
                      </span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleOpenAssignModal(drill);
                        }}
                        style={{
                          padding: '4px 10px',
                          borderRadius: D.pill,
                          background: `${D.indigo}20`,
                          border: `1px solid ${D.indigo}40`,
                          color: D.indigo,
                          fontFamily: D.head,
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        + Assign to Player
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Drill Detail Inspector */}
            {selectedDrill && (
              <div style={{ padding: '20px', borderRadius: D.lg, background: D.surf1, border: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontFamily: D.head, fontSize: '15px', fontWeight: 800, color: D.textPrimary }}>
                    TECHNICAL BLUEPRINT: {selectedDrill.name}
                  </div>
                  <button
                    onClick={() => handleOpenAssignModal(selectedDrill)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: D.pill,
                      background: D.indigo,
                      border: 'none',
                      color: '#fff',
                      fontFamily: D.head,
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Assign This Module →
                  </button>
                </div>

                <div>
                  <div style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, marginBottom: '6px' }}>
                    REQUIRED EQUIPMENT:
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {(selectedDrill.equipment || []).map((eq, i) => (
                      <span key={i} style={{ padding: '4px 10px', borderRadius: D.pill, background: D.surf2, fontFamily: D.body, fontSize: '11px', color: D.textPrimary }}>
                        • {eq}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, marginBottom: '6px' }}>
                    KEY COACHING CUES & FAULT CORRECTION:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(selectedDrill.keyCoachingPoints || []).map((pt, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', fontFamily: D.body, fontSize: '12px', color: D.textPrimary, lineHeight: 1.5 }}>
                        <span style={{ color: D.emerald, fontWeight: 800 }}>✓</span>
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Active Player Routines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>
                ACTIVE PLAYER ROUTINES ({filteredRoutines.length})
              </div>
              <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.emerald }}>
                ● Auto-synced to Passport
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredRoutines.map(routine => {
                const statusColor =
                  routine.status === "mastered" ? D.emerald :
                  routine.status === "in_review" ? D.amber : D.sky;

                return (
                  <div
                    key={routine.id}
                    style={{
                      padding: '16px',
                      borderRadius: D.lg,
                      background: D.surf1,
                      border: `1px solid ${D.border}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary }}>
                          {routine.playerName}
                        </div>
                        <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted }}>
                          {routine.playerRole} · {routine.scheduledDay}s at {routine.scheduledTime}
                        </div>
                      </div>

                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: D.pill,
                          background: `${statusColor}20`,
                          color: statusColor,
                          fontFamily: D.mono,
                          fontSize: '10px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                        }}
                      >
                        {routine.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div style={{ padding: '10px 12px', background: D.surf2, borderRadius: D.md }}>
                      <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.indigo }}>
                        {routine.drillName}
                      </div>
                      <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary, marginTop: '2px' }}>
                        🎯 Target: <strong>{routine.targetSets}</strong> ({routine.frequency})
                      </div>
                    </div>

                    <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted, fontStyle: 'italic' }}>
                      &ldquo;{routine.coachingNotes}&rdquo;
                    </div>

                    {/* Progress Bar & Status Action */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginTop: '4px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: D.mono, fontSize: '9px', color: D.textMuted, marginBottom: '3px' }}>
                          <span>Mastery Progress</span>
                          <span>{routine.completionRatePct}%</span>
                        </div>
                        <div style={{ width: '100%', height: '5px', background: D.surf2, borderRadius: D.pill, overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${routine.completionRatePct}%`,
                              height: '100%',
                              background: statusColor,
                              borderRadius: D.pill,
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleAdvanceStatus(routine.id)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: D.pill,
                          background: D.surf2,
                          border: `1px solid ${D.border}`,
                          color: D.textPrimary,
                          fontFamily: D.head,
                          fontSize: '10px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Advance Stage →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: LIST / TABLE VIEW (Dense administrative roster)                    */}
      {/* ========================================================================= */}
      {viewMode === "list" && (
        <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${D.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary }}>
              PLAYER ROUTINE MASTER TABLE ({filteredRoutines.length} active assignments)
            </div>
            <button
              onClick={() => handleOpenAssignModal()}
              style={{
                padding: '6px 14px',
                borderRadius: D.pill,
                background: D.indigo,
                border: 'none',
                color: '#fff',
                fontFamily: D.head,
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              + New Routine
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '780px' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${D.border}`, background: D.surf2 }}>
                  <th style={{ padding: '10px 16px', fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>PLAYER & ROLE</th>
                  <th style={{ padding: '10px 16px', fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>ASSIGNED DRILL</th>
                  <th style={{ padding: '10px 16px', fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>TARGET REPS / FREQ</th>
                  <th style={{ padding: '10px 16px', fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>SCHEDULE SLOT</th>
                  <th style={{ padding: '10px 16px', fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>PROGRESS</th>
                  <th style={{ padding: '10px 16px', fontFamily: D.head, fontSize: '10px', color: D.textMuted }}>STATUS</th>
                  <th style={{ padding: '10px 16px', fontFamily: D.head, fontSize: '10px', color: D.textMuted, textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoutines.map(routine => {
                  const statusColor =
                    routine.status === "mastered" ? D.emerald :
                    routine.status === "in_review" ? D.amber : D.sky;

                  return (
                    <tr key={routine.id} style={{ borderBottom: `1px solid ${D.border}` }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: D.textPrimary }}>
                          {routine.playerName}
                        </div>
                        <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                          {routine.playerRole}
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontFamily: D.body, fontSize: '13px', fontWeight: 600, color: D.indigo }}>
                          {routine.drillName}
                        </div>
                        <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, textTransform: 'capitalize' }}>
                          {routine.category} · {routine.intensity} intensity
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px', fontFamily: D.body, fontSize: '12px', color: D.textSecondary }}>
                        <div>{routine.targetSets}</div>
                        <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>{routine.frequency}</div>
                      </td>

                      <td style={{ padding: '12px 16px', fontFamily: D.mono, fontSize: '11px', color: D.textPrimary }}>
                        {routine.scheduledDay} {routine.scheduledTime}
                      </td>

                      <td style={{ padding: '12px 16px', minWidth: '110px' }}>
                        <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, marginBottom: '2px' }}>
                          {routine.completionRatePct}%
                        </div>
                        <div style={{ width: '100%', height: '4px', background: D.surf2, borderRadius: D.pill }}>
                          <div style={{ width: `${routine.completionRatePct}%`, height: '100%', background: statusColor, borderRadius: D.pill }} />
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: D.pill,
                            background: `${statusColor}20`,
                            color: statusColor,
                            fontFamily: D.mono,
                            fontSize: '10px',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                          }}
                        >
                          {routine.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleAdvanceStatus(routine.id)}
                          style={{
                            padding: '5px 12px',
                            borderRadius: D.pill,
                            background: D.surf2,
                            border: `1px solid ${D.border}`,
                            color: D.textPrimary,
                            fontFamily: D.head,
                            fontSize: '10px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Advance →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: KANBAN BOARD VIEW (Pipeline of Routine Progression)               */}
      {/* ========================================================================= */}
      {viewMode === "kanban" && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {[
            { id: 'assigned', title: '⏳ ASSIGNED & ACTIVE', color: D.sky, items: assignedRoutines.filter(r => r.status === 'assigned') },
            { id: 'in_review', title: '🔍 UNDER COACH ASSESSMENT', color: D.amber, items: assignedRoutines.filter(r => r.status === 'in_review') },
            { id: 'mastered', title: '🏆 MASTERED & CERTIFIED', color: D.emerald, items: assignedRoutines.filter(r => r.status === 'mastered') },
          ].map(col => (
            <div
              key={col.id}
              style={{
                background: D.surf1,
                borderRadius: D.lg,
                border: `1px solid ${D.border}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${col.color}`, paddingBottom: '8px' }}>
                <span style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: col.color }}>
                  {col.title}
                </span>
                <span style={{ padding: '2px 8px', borderRadius: D.pill, background: D.surf2, fontFamily: D.mono, fontSize: '10px', color: D.textPrimary, fontWeight: 700 }}>
                  {col.items.length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '350px' }}>
                {col.items.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: D.textMuted, fontFamily: D.body, fontSize: '11px' }}>
                    No routines currently in this stage.
                  </div>
                ) : (
                  col.items.map(r => (
                    <div
                      key={r.id}
                      style={{
                        padding: '14px',
                        borderRadius: D.md,
                        background: D.surf2,
                        border: `1px solid ${D.border}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: D.textPrimary }}>
                          {r.playerName}
                        </span>
                        <span style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                          {r.scheduledDay}
                        </span>
                      </div>

                      <div style={{ fontFamily: D.body, fontSize: '12px', color: D.indigo, fontWeight: 600 }}>
                        {r.drillName}
                      </div>

                      <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textSecondary }}>
                        Target: {r.targetSets}
                      </div>

                      <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted, fontStyle: 'italic' }}>
                        &ldquo;{r.coachingNotes}&rdquo;
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '6px', borderTop: `1px solid ${D.border}` }}>
                        <span style={{ fontFamily: D.mono, fontSize: '10px', color: col.color, fontWeight: 700 }}>
                          {r.completionRatePct}% Complete
                        </span>
                        <button
                          onClick={() => handleAdvanceStatus(r.id)}
                          style={{
                            padding: '3px 8px',
                            borderRadius: D.pill,
                            background: `${col.color}20`,
                            border: `1px solid ${col.color}40`,
                            color: col.color,
                            fontFamily: D.head,
                            fontSize: '9px',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          Move Next →
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: TIMELINE / GANTT VIEW (Weekly Hour-by-Hour Session Mapping)        */}
      {/* ========================================================================= */}
      {viewMode === "timeline" && (
        <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary }}>
                WEEKLY HIGH-PERFORMANCE TRAINING TIMELINE (GANTT SEQUENCE)
              </div>
              <div style={{ fontFamily: D.body, fontSize: '12px', color: D.textMuted }}>
                Tracking morning nets, afternoon skill modules, and fitness intervals across the week
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => {
              const dayRoutines = assignedRoutines.filter(r => r.scheduledDay === day);

              return (
                <div key={day} style={{ padding: '12px 16px', background: D.surf2, borderRadius: D.md, display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ width: '100px', flexShrink: 0 }}>
                    <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 800, color: D.textPrimary }}>{day}</div>
                    <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                      {dayRoutines.length} Sessions
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
                    {dayRoutines.length === 0 ? (
                      <span style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted, fontStyle: 'italic', alignSelf: 'center' }}>
                        Rest / Tactical video review day
                      </span>
                    ) : (
                      dayRoutines.map(r => (
                        <div
                          key={r.id}
                          style={{
                            padding: '8px 14px',
                            background: D.surf1,
                            borderRadius: D.md,
                            border: `1px solid ${D.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                          }}
                        >
                          <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.sky, fontWeight: 700 }}>
                            {r.scheduledTime}
                          </span>
                          <div>
                            <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textPrimary }}>
                              {r.playerName}: {r.drillName}
                            </div>
                            <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted }}>
                              {r.targetSets} · Coach {r.assignedByCoach.split(' ')[0]}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 5: CALENDAR VIEW (Weekly Training Matrix Grid)                        */}
      {/* ========================================================================= */}
      {viewMode === "calendar" && (
        <div style={{ background: D.surf1, borderRadius: D.lg, border: `1px solid ${D.border}`, padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, color: D.textPrimary }}>
              MICROCYCLE CALENDAR (SCHEDULED DRILL SESSIONS)
            </div>
            <span style={{ fontFamily: D.mono, fontSize: '11px', color: D.indigo, fontWeight: 700 }}>
              TERM 3 IN-SEASON PERIODIZATION
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(130px, 1fr))', gap: '8px', overflowX: 'auto' }}>
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => {
              const dayRoutines = assignedRoutines.filter(r => r.scheduledDay === day);

              return (
                <div
                  key={day}
                  style={{
                    background: D.surf2,
                    borderRadius: D.md,
                    padding: '10px',
                    minHeight: '260px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 800, color: D.textPrimary, textAlign: 'center', borderBottom: `1px solid ${D.border}`, paddingBottom: '6px' }}>
                    {day.slice(0, 3).toUpperCase()}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    {dayRoutines.map(r => (
                      <div
                        key={r.id}
                        style={{
                          padding: '6px 8px',
                          borderRadius: D.sm,
                          background: D.surf1,
                          border: `1px solid ${D.border}`,
                          fontSize: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                        }}
                      >
                        <div style={{ fontFamily: D.mono, color: D.sky, fontWeight: 700 }}>
                          {r.scheduledTime}
                        </div>
                        <div style={{ fontFamily: D.head, color: D.textPrimary, fontWeight: 700 }}>
                          {r.playerName.split(' ')[0]}
                        </div>
                        <div style={{ fontFamily: D.body, color: D.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {r.drillName}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ASSIGN DRILL TO PLAYER MODAL                                              */}
      {/* ========================================================================= */}
      {isAssignModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              background: D.surf1,
              borderRadius: D.lg,
              border: `1px solid ${D.border}`,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 800, color: D.textPrimary }}>
                Assign Training Drill to Player Routine
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                style={{ background: 'none', border: 'none', color: D.textMuted, fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignRoutineSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Select Player */}
              <div>
                <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>
                  SELECT PLAYER:
                </label>
                <select
                  value={assignPlayerId}
                  onChange={e => setAssignPlayerId(e.target.value)}
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
                  {safePlayers.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Drill */}
              <div>
                <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>
                  DRILL MODULE:
                </label>
                <select
                  value={assignDrillId}
                  onChange={e => setAssignDrillId(e.target.value)}
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
                  {DRILL_LIBRARY.map(d => (
                    <option key={d.id} value={d.id}>
                      [{d.category.toUpperCase()}] {d.name} ({d.durationMins}m · {d.intensity})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sets & Target Reps */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>
                    TARGET REPS / SETS:
                  </label>
                  <input
                    type="text"
                    value={assignSets}
                    onChange={e => setAssignSets(e.target.value)}
                    placeholder="e.g. 4 sets × 12 balls"
                    required
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

                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>
                    FREQUENCY:
                  </label>
                  <select
                    value={assignFreq}
                    onChange={e => setAssignFreq(e.target.value as any)}
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
                    <option value="Daily">Daily</option>
                    <option value="3x / Week">3x / Week</option>
                    <option value="Match Day Prep">Match Day Prep</option>
                    <option value="Rehab Specific">Rehab Specific</option>
                  </select>
                </div>
              </div>

              {/* Schedule Slot Day & Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>
                    SCHEDULED DAY:
                  </label>
                  <select
                    value={assignDay}
                    onChange={e => setAssignDay(e.target.value as any)}
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
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>
                    SCHEDULED TIME:
                  </label>
                  <input
                    type="time"
                    value={assignTime}
                    onChange={e => setAssignTime(e.target.value)}
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
              </div>

              {/* Coaching Cues & Focus Note */}
              <div>
                <label style={{ fontFamily: D.head, fontSize: '11px', color: D.textMuted, display: 'block', marginBottom: '4px' }}>
                  COACHING FOCUS & FAULT REMEDIATION NOTES:
                </label>
                <textarea
                  rows={3}
                  value={assignCoachNotes}
                  onChange={e => setAssignCoachNotes(e.target.value)}
                  placeholder="e.g. Focus on keeping the head still through the stroke; eliminate top edge."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: D.md,
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    color: D.textPrimary,
                    fontFamily: D.body,
                    fontSize: '12px',
                    resize: 'none',
                  }}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: D.pill,
                    background: D.surf2,
                    border: `1px solid ${D.border}`,
                    color: D.textSecondary,
                    fontFamily: D.head,
                    fontSize: '11px',
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
                    background: D.indigo,
                    border: 'none',
                    color: '#fff',
                    fontFamily: D.head,
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
