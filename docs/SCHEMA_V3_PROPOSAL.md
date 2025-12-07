# SCRBRD Schema V3: Event-Sourced Scoring Architecture

> **Created:** December 6, 2025  
> **Status:** Proposal  
> **Priority:** Tier 1 - Structural Correctness

## Executive Summary

This document proposes a fundamental architectural shift from the current **double-bookkeeping** approach to an **event-sourced** model where:

1. **`scoring_actions`** is the single source of truth for all ball-by-ball data
2. **`LiveScore`, `Innings`, `BattingCard`, `BowlingCard`** become **projections** derived from this event log
3. **`MatchLineup`** replaces the competing selection structures
4. **Role assignments** are normalized into dedicated collections

---

## Part 1: The Scoring Engine Redesign

### 1.1 Current Problems

The current schema has **multiple competing sources of truth**:

| Structure | Location | Problem |
|-----------|----------|---------|
| `LiveScore.ballHistory` | `/matches/{id}/live/score` | Real-time scoring |
| `Innings.overHistory[].balls[]` | Match document | Post-match reconstruction |
| `Match.inningsData` | Match document | Another copy |
| `Match.liveData` | Match document | View model state |

**Issues:**
- Undo/redo requires syncing multiple locations
- Recalculating stats requires complex joins
- Data drift between sources is inevitable
- No audit trail for corrections

### 1.2 Proposed Architecture: Event Store Pattern

```
matches/{matchId}/
├── live/
│   └── score         ← Real-time projection (derived view)
└── scoring_actions/
    ├── {actionId_1}  ← Immutable event
    ├── {actionId_2}
    └── ...
```

**Key Principle:** `scoring_actions` is append-only. Corrections create new events with references to what they're correcting.

---

## Part 2: Core Type Definitions

### 2.1 ScoringAction (The Single Source of Truth)

```typescript
/**
 * ScoringAction represents a single delivery in a cricket match.
 * This is the ONLY place where ball-by-ball data is persisted.
 * Everything else is derived from this collection.
 */
export interface ScoringAction {
  // Identity
  id: string;
  matchId: string;
  
  // Position in match
  inningsNumber: 1 | 2;
  overNumber: number;        // 0-indexed (0 = first over)
  ballInOver: number;        // 1-6 for legal deliveries, can exceed for extras
  sequenceNumber: number;    // Global sequence in innings (for ordering)
  
  // Participants
  strikerId: string;
  nonStrikerId: string;
  bowlerId: string;
  
  // Outcome: Runs
  runsOffBat: number;        // Runs credited to batsman
  extras: {
    wide: number;            // Wides (typically 1, but can have additional runs)
    noBall: number;          // No-balls (typically 1)
    bye: number;             // Byes
    legBye: number;          // Leg byes
    penalty: number;         // Penalty runs
  };
  totalRuns: number;         // Computed: runsOffBat + sum of extras
  
  // Outcome: Wicket
  isWicket: boolean;
  wicket?: {
    type: WicketType;
    dismissedPlayerId: string;
    fielderIds?: string[];   // For caught, run out, stumped
    assistFielderIds?: string[]; // For relay catches, etc.
  };
  
  // Legal delivery flag
  isLegalDelivery: boolean;  // Computed: no wide or no-ball
  
  // Shot analysis (for wagon wheel, pitch map)
  shotData?: {
    coordinates?: { x: number; y: number };  // Wagon wheel position
    shotType?: ShotType;
    length?: PitchLength;
    line?: BowlingLine;
    speed?: number;          // Ball speed if available
    wagonWheelSegment?: number; // 1-8 segments
  };
  
  // Metadata
  timestamp: Date | string;
  recordedBy?: string;       // User who recorded this
  source: 'live' | 'manual_entry' | 'import' | 'correction';
  
  // Correction/Undo linkage
  corrects?: string;         // ID of action this corrects (null = original)
  correctedBy?: string;      // ID of action that corrected this
  isVoided: boolean;         // True if this action was undone
  voidReason?: string;
  
  // Audit
  createdAt: Date | string;
  updatedAt?: Date | string;
}

type WicketType = 
  | 'bowled'
  | 'caught'
  | 'lbw'
  | 'run_out'
  | 'stumped'
  | 'hit_wicket'
  | 'handled_ball'
  | 'obstructing_field'
  | 'timed_out'
  | 'retired_out'
  | 'retired_hurt';

type ShotType = 
  | 'drive' | 'cut' | 'pull' | 'hook' | 'sweep' | 'reverse_sweep'
  | 'flick' | 'glance' | 'defend' | 'leave' | 'edge' | 'other';

type PitchLength = 
  | 'full_toss' | 'yorker' | 'full' | 'good' | 'short' | 'bouncer';

type BowlingLine = 
  | 'off_stump' | 'middle_stump' | 'leg_stump' 
  | 'outside_off' | 'outside_leg';
```

### 2.2 Derived Projections

These are **computed views** of the scoring_actions data, not separate sources of truth.

#### LiveScoreProjection (Real-time view)

```typescript
/**
 * LiveScoreProjection is a DERIVED view of the match state.
 * It's computed from scoring_actions and cached in Firestore for performance.
 * On any discrepancy, scoring_actions is the authority.
 */
export interface LiveScoreProjection {
  matchId: string;
  status: 'scheduled' | 'live' | 'innings_break' | 'completed';
  
  // Current state
  inningsNumber: 1 | 2;
  
  currentInnings: {
    battingTeamId: string;
    bowlingTeamId: string;
    runs: number;
    wickets: number;
    overs: number;    // Display format: 12.4 = 12 overs and 4 balls
    balls: number;    // Raw ball count
    target?: number;  // For 2nd innings
    
    // Current players (mutable state)
    strikerId: string | null;
    nonStrikerId: string | null;
    bowlerId: string | null;
    bowlingAngle?: 'Over the Wicket' | 'Round the Wicket';
  };
  
  // Batsman stats (computed from scoring_actions)
  batsmen: BatsmanProjection[];
  
  // Bowler stats (computed from scoring_actions)
  bowlers: BowlerProjection[];
  
  // Current over summary (last 6 legal deliveries)
  currentOver: BallSummary[];
  
  // Partnership
  partnership: {
    batsmanAId: string;
    batsmanBId: string;
    runs: number;
    balls: number;
  };
  
  // Fall of wickets
  fallOfWickets: FallOfWicketEntry[];
  
  // Extras summary
  extras: {
    wides: number;
    noBalls: number;
    byes: number;
    legByes: number;
    penalty: number;
    total: number;
  };
  
  // Previous innings (for 2nd innings)
  innings1?: InningsProjection;
  innings2?: InningsProjection;
  
  // Match result (when complete)
  winnerId?: string;
  winMargin?: string;
  
  // Metadata
  lastUpdated: Date | string;
  lastActionId: string;  // For consistency checking
  version: number;       // Optimistic locking
}

interface BatsmanProjection {
  playerId: string;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  strikeRate: number;     // Computed
  isOut: boolean;
  dismissal?: {
    type: WicketType;
    bowlerId?: string;
    fielderIds?: string[];
    description?: string;  // "c Smith b Jones"
  };
  isOnStrike: boolean;
  battingPosition: number;
}

interface BowlerProjection {
  playerId: string;
  overs: number;          // Display format
  ballsBowled: number;    // Raw count
  maidens: number;
  runsConceded: number;
  wickets: number;
  wides: number;
  noBalls: number;
  economy: number;        // Computed
  dotBalls: number;
  spells: SpellSummary[];
}

interface SpellSummary {
  startOver: number;
  endOver: number;
  runs: number;
  wickets: number;
}

interface BallSummary {
  runs: number;
  isWicket: boolean;
  extraType?: 'wide' | 'noball' | 'bye' | 'legbye';
  display: string;  // "W", "4", "1nb", etc.
}

interface FallOfWicketEntry {
  wicketNumber: number;
  score: number;
  over: string;           // "12.4"
  batsmanOutId: string;
  batsmanOutName?: string;
  bowlerId?: string;
}

interface InningsProjection {
  inningsNumber: 1 | 2;
  battingTeamId: string;
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  batsmen: BatsmanProjection[];
  bowlers: BowlerProjection[];
  extras: LiveScoreProjection['extras'];
  fallOfWickets: FallOfWicketEntry[];
}
```

---

## Part 3: Match Lineups (Single Selection Truth)

### 3.1 Current Problem

Multiple competing structures for "who plays":
- `Squad` + `SquadPlayer` (seasonal pool)
- `RosterMember` (team membership)  
- `Match.teamSelection` (match-specific)
- `PreMatchProcedure.teamSelection` (duplicate)

### 3.2 Proposed Solution

```typescript
/**
 * MatchLineup is the canonical record of who played in a match.
 * This is the ONLY structure used for:
 * - Scorecards
 * - Match stats
 * - Player "matches played" counts
 * - Analytics
 */
export interface MatchLineup {
  id: string;
  matchId: string;
  teamId: string;
  playerId: string;
  
  // Selection status
  role: 'playing_xi' | 'substitute' | 'reserve' | 'withdrawn';
  
  // Leadership
  isCaptain: boolean;
  isViceCaptain: boolean;
  isWicketkeeper: boolean;
  
  // Batting order
  battingPosition?: number;  // 1-11
  
  // Status changes during match
  substitutedAt?: Date | string;
  substitutedFor?: string;    // Player ID they replaced
  substitutionReason?: 'concussion' | 'covid' | 'tactical' | 'injury';
  
  // Confirmation workflow
  selectedAt: Date | string;
  selectedBy: string;
  confirmedAt?: Date | string;
  confirmedBy?: string;
  
  // Metadata
  createdAt: Date | string;
  updatedAt?: Date | string;
}

/**
 * MatchLineups collection structure:
 * /matches/{matchId}/lineups/{lineupId}
 * 
 * Query patterns:
 * - Get all playing XI for home team: where teamId == X, role == 'playing_xi'
 * - Get captain: where matchId == X, isCaptain == true
 * - Get all matches for player: where playerId == X (across matches)
 */
```

### 3.3 Relationship Clarification

| Collection | Purpose | Lifespan |
|------------|---------|----------|
| `Squad` + `SquadPlayer` | Seasonal player pool | Season-long |
| `MatchLineup` | Who actually played | Per-match |
| `RosterMember` | **DEPRECATED** | Phase out |
| `Match.teamSelection` | **DEPRECATED** | Migrate to MatchLineup |

---

## Part 4: Role Assignments

### 4.1 School Role Assignments

```typescript
/**
 * SchoolRoleAssignment tracks who holds what role at a school.
 * This replaces storing role info on Person.assignedSchools.
 */
export interface SchoolRoleAssignment {
  id: string;
  schoolId: string;
  personId: string;
  
  role: SchoolRole;
  
  // Temporal bounds
  startDate: Date | string;
  endDate?: Date | string;      // null = current
  seasonId?: string;            // Optional season context
  
  // Details
  isPrimary: boolean;           // Primary role vs secondary
  notes?: string;
  
  // Audit
  assignedBy: string;
  assignedAt: Date | string;
  revokedBy?: string;
  revokedAt?: Date | string;
  
  createdAt: Date | string;
  updatedAt?: Date | string;
}

type SchoolRole = 
  | 'director_of_cricket'
  | 'head_coach'
  | 'assistant_coach'
  | 'administrator'
  | 'scorer'
  | 'groundskeeper'
  | 'medical_officer';
```

### 4.2 Team Role Assignments

```typescript
/**
 * TeamRoleAssignment tracks who holds what role in a team.
 */
export interface TeamRoleAssignment {
  id: string;
  teamId: string;
  personId: string;
  
  role: TeamRole;
  
  // Temporal bounds
  startDate: Date | string;
  endDate?: Date | string;
  seasonId?: string;
  
  // Leadership flags
  isCaptain: boolean;
  isViceCaptain: boolean;
  
  // Details
  jerseyNumber?: string;
  notes?: string;
  
  // Audit
  assignedBy: string;
  assignedAt: Date | string;
  
  createdAt: Date | string;
  updatedAt?: Date | string;
}

type TeamRole = 
  | 'player'
  | 'coach'
  | 'assistant_coach'
  | 'manager'
  | 'scorer'
  | 'analyst';
```

### 4.3 Match Role Assignments

```typescript
/**
 * MatchRoleAssignment tracks officials and support staff for a match.
 */
export interface MatchRoleAssignment {
  id: string;
  matchId: string;
  personId: string;
  
  role: MatchRole;
  
  // Status
  status: 'assigned' | 'confirmed' | 'present' | 'no_show';
  
  // Confirmation workflow
  assignedAt: Date | string;
  assignedBy: string;
  confirmedAt?: Date | string;
  arrivedAt?: Date | string;
  
  // Performance (optional feedback)
  performanceRating?: number;   // 1-5
  performanceNotes?: string;
  
  createdAt: Date | string;
  updatedAt?: Date | string;
}

type MatchRole = 
  | 'umpire_on_field'
  | 'umpire_third'
  | 'umpire_reserve'
  | 'match_referee'
  | 'scorer_home'
  | 'scorer_away'
  | 'scorer_neutral'
  | 'medical_officer'
  | 'groundskeeper';
```

---

## Part 5: Analytics & Statistics (Season-Aware)

### 5.1 Player Season Stats

```typescript
export interface PlayerSeasonStats {
  id: string;
  personId: string;
  seasonId: string;
  teamId: string;              // Stats are per-team
  format?: 'T20' | 'ODI' | 'Test' | 'All';
  
  // Batting
  batting: {
    matches: number;
    innings: number;
    notOuts: number;
    runs: number;
    highestScore: number;
    highestScoreNotOut: boolean;
    average: number;           // Computed
    strikeRate: number;        // Computed
    fifties: number;
    hundreds: number;
    ducks: number;
    fours: number;
    sixes: number;
    ballsFaced: number;
  };
  
  // Bowling
  bowling: {
    matches: number;
    innings: number;
    overs: number;
    ballsBowled: number;
    maidens: number;
    runs: number;
    wickets: number;
    average: number;           // Computed
    economy: number;           // Computed
    strikeRate: number;        // Computed
    bestBowling: string;       // e.g., "5/23"
    fiveWickets: number;
    tenWickets: number;
    wides: number;
    noBalls: number;
  };
  
  // Fielding
  fielding: {
    catches: number;
    stumpings: number;
    runOuts: number;           // Direct + assisted
    runOutsAssisted: number;
  };
  
  // Aggregates
  matchesPlayed: number;
  momAwards: number;
  
  // Computed on update
  lastUpdated: Date | string;
  lastMatchId: string;
}
```

### 5.2 Team Season Stats

```typescript
export interface TeamSeasonStats {
  id: string;
  teamId: string;
  seasonId: string;
  competitionId?: string;
  
  // Results
  matchesPlayed: number;
  wins: number;
  losses: number;
  ties: number;
  noResults: number;
  
  // Points (for league tables)
  points: number;
  
  // Net Run Rate
  runsScored: number;
  oversPlayed: number;        // As decimal
  runsConceded: number;
  oversBowled: number;        // As decimal
  netRunRate: number;         // Computed
  
  // Form
  formGuide: Array<'W' | 'L' | 'T' | 'NR'>; // Last 5 matches
  currentStreak: {
    type: 'W' | 'L' | 'T';
    count: number;
  };
  
  // Computed
  lastUpdated: Date | string;
}
```

### 5.3 Player Head-to-Head Stats

```typescript
export interface PlayerHeadToHeadStats {
  id: string;
  batsmanId: string;
  bowlerId: string;
  
  // Context (optional filtering)
  seasonId?: string;
  format?: string;
  
  // Core stats
  ballsFaced: number;
  runsScored: number;
  dismissals: number;
  
  // Breakdown
  fours: number;
  sixes: number;
  dotBalls: number;
  
  // Computed
  strikeRate: number;
  dotBallPercentage: number;
  boundaryPercentage: number;
  dismissalRate: number;       // Balls per dismissal
  
  // Dismissal types
  dismissalBreakdown: {
    bowled: number;
    caught: number;
    lbw: number;
    other: number;
  };
  
  // Last updated
  lastUpdated: Date | string;
  lastMatchId: string;
}
```

---

## Part 6: Implementation Roadmap

### Phase 1: Scoring Engine (Week 1-2)

1. **Create `ScoringAction` type and Firestore structure**
   - Add type definitions to `src/types/firestore.ts`
   - Create subcollection under `/matches/{matchId}/scoring_actions`

2. **Create projection computation service**
   - `src/lib/scoring/projectionService.ts`
   - Functions to compute `LiveScoreProjection` from `ScoringAction[]`

3. **Migrate `recordBallAction`**
   - Write to `scoring_actions` as primary
   - Compute and write projection to `/matches/{id}/live/score`
   - Add atomic writes for consistency

4. **Migrate `undoLastBallAction`**
   - Mark action as `isVoided: true` instead of deleting
   - Recompute projection from remaining actions

5. **Update live scoring UI**
   - Read from projection for display
   - Ensure projection is always in sync

### Phase 2: Match Lineups (Week 2-3)

1. **Create `MatchLineup` type**
2. **Add `/matches/{matchId}/lineups` subcollection**
3. **Migrate team selection workflow**
4. **Deprecate `Match.teamSelection` and `PreMatchProcedure.teamSelection`**
5. **Update scorecard generation to use lineups**

### Phase 3: Role Assignments (Week 3-4)

1. **Create role assignment collections**
   - `school_role_assignments`
   - `team_role_assignments`
   - `match_role_assignments`

2. **Migrate existing data**
   - Extract from `Person.teamIds`, `Person.assignedSchools`
   - Extract from `Match.umpires`, `Match.scorer`

3. **Update security rules**
   - Check role assignments for authorization

### Phase 4: Statistics (Week 4-5)

1. **Create season-aware stats types**
2. **Build aggregation service**
3. **Create head-to-head computation**
4. **Set up background jobs for stat updates**

---

## Part 7: Migration Strategy

### 7.1 Backward Compatibility

During migration, we maintain dual-write:

1. **Write** to new `scoring_actions` collection
2. **Also write** to legacy `ballHistory` for backward compat
3. **Read** from projection (which is derived from new model)
4. After validation period, **remove** legacy writes

### 7.2 Data Migration Script

```typescript
// Migration: Convert existing ballHistory to scoring_actions
async function migrateMatchToScoringActions(matchId: string) {
  const liveDoc = await admin.firestore()
    .collection('matches')
    .doc(matchId)
    .collection('live')
    .doc('score')
    .get();
  
  if (!liveDoc.exists) return;
  
  const liveScore = liveDoc.data();
  const ballHistory = liveScore.ballHistory || [];
  
  const batch = admin.firestore().batch();
  
  ballHistory.forEach((ball: any, index: number) => {
    const actionRef = admin.firestore()
      .collection('matches')
      .doc(matchId)
      .collection('scoring_actions')
      .doc();
    
    const action: ScoringAction = {
      id: actionRef.id,
      matchId,
      inningsNumber: liveScore.inningsNumber || 1,
      overNumber: Math.floor(index / 6),
      ballInOver: (index % 6) + 1,
      sequenceNumber: index + 1,
      strikerId: ball.strikerId,
      nonStrikerId: '', // May need lookup
      bowlerId: ball.bowlerId,
      runsOffBat: ball.runs || 0,
      extras: {
        wide: ball.extraType === 'wide' ? (ball.extraRuns || 1) : 0,
        noBall: ball.extraType === 'noball' ? 1 : 0,
        bye: ball.extraType === 'bye' ? (ball.extraRuns || 0) : 0,
        legBye: ball.extraType === 'legbye' ? (ball.extraRuns || 0) : 0,
        penalty: 0
      },
      totalRuns: (ball.runs || 0) + (ball.extraRuns || 0),
      isWicket: ball.isWicket || false,
      wicket: ball.isWicket ? {
        type: ball.wicketType,
        dismissedPlayerId: ball.strikerId,
        fielderIds: ball.fielderIds
      } : undefined,
      isLegalDelivery: !['wide', 'noball'].includes(ball.extraType),
      shotData: ball.coordinates ? { coordinates: ball.coordinates } : undefined,
      timestamp: ball.timestamp || new Date().toISOString(),
      source: 'migration',
      isVoided: false,
      createdAt: ball.timestamp || new Date().toISOString()
    };
    
    batch.set(actionRef, action);
  });
  
  await batch.commit();
  console.log(`Migrated ${ballHistory.length} balls for match ${matchId}`);
}
```

---

## Part 8: Testing Strategy

### 8.1 Unit Tests

```typescript
describe('Projection Service', () => {
  it('should compute correct runs from scoring actions', () => {
    const actions = [
      { runsOffBat: 4, extras: {}, isWicket: false },
      { runsOffBat: 1, extras: {}, isWicket: false },
      { runsOffBat: 0, extras: { wide: 1 }, isWicket: false },
    ];
    const projection = computeProjection(actions);
    expect(projection.currentInnings.runs).toBe(6); // 4+1+1(wide)
  });
  
  it('should handle wicket correctly', () => {
    const actions = [
      { runsOffBat: 0, isWicket: true, wicket: { type: 'bowled' } },
    ];
    const projection = computeProjection(actions);
    expect(projection.currentInnings.wickets).toBe(1);
    expect(projection.batsmen[0].isOut).toBe(true);
  });
  
  it('should compute correct overs', () => {
    const actions = new Array(15).fill({
      runsOffBat: 1, extras: {}, isWicket: false, isLegalDelivery: true
    });
    const projection = computeProjection(actions);
    expect(projection.currentInnings.overs).toBe(2.3); // 15 balls = 2.3 overs
  });
});
```

### 8.2 Integration Tests

- Record sequence of balls, verify projection matches
- Undo a ball, verify projection recomputes correctly
- End innings, verify innings1 snapshot is correct
- Complete match, verify final stats

---

## Appendix A: Firestore Collection Structure

```
/matches/{matchId}
│
├── /scoring_actions/{actionId}    ← Single source of truth
│   └── ScoringAction
│
├── /live
│   └── /score                      ← Derived projection (cached)
│       └── LiveScoreProjection
│
├── /lineups/{lineupId}            ← Who actually played
│   └── MatchLineup
│
└── Match (document)                ← Match metadata only

/player_season_stats/{id}          ← Aggregated stats
/team_season_stats/{id}
/player_h2h_stats/{id}

/school_role_assignments/{id}      ← Role assignments
/team_role_assignments/{id}
/match_role_assignments/{id}
```

## Appendix B: Security Rules Updates

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Scoring actions - only authorized scorers can write
    match /matches/{matchId}/scoring_actions/{actionId} {
      allow read: if true;
      allow create: if isMatchScorer(matchId) || isAdmin();
      allow update: if isAdmin(); // Only admin can void/correct
      allow delete: if false; // Never delete, only void
    }
    
    // Live projection - read-only for clients
    match /matches/{matchId}/live/{docId} {
      allow read: if true;
      allow write: if isMatchScorer(matchId) || isAdmin();
    }
    
    // Helper functions
    function isMatchScorer(matchId) {
      let match = get(/databases/$(database)/documents/matches/$(matchId)).data;
      return request.auth.uid == match.scorer || 
             exists(/databases/$(database)/documents/match_role_assignments
               where matchId == matchId 
               and personId == request.auth.uid 
               and role.matches('scorer.*'));
    }
  }
}
```

---

## Summary

This schema redesign:

1. ✅ **Eliminates double-bookkeeping** - One source of truth for balls
2. ✅ **Enables reliable undo/redo** - Void actions, recompute
3. ✅ **Supports correction workflows** - Audit trail preserved
4. ✅ **Normalizes team selection** - MatchLineup is canonical
5. ✅ **Adds temporal role tracking** - Who held what role when
6. ✅ **Enables season-aware analytics** - Proper aggregation paths
7. ✅ **Future-proofs for H2H** - Data structure supports it

**Next Step:** Implement the projection computation service (`src/lib/scoring/projectionService.ts`) before migrating any actions.
