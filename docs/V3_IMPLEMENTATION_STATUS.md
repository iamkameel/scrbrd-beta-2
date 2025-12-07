# SCRBRD V3 Schema Implementation Status

> **Created:** December 6, 2025  
> **Last Updated:** December 6, 2025

## Overview

This document tracks the implementation of the V3 schema architecture, which addresses the structural issues identified in the V2 → V5 gap analysis.

---

## ✅ Phase 1: Foundation (COMPLETE)

### Created Files

1. **`/docs/SCHEMA_V3_PROPOSAL.md`**
   - Complete architectural proposal
   - Event-sourced scoring design
   - MatchLineup normalization
   - Role assignment collections
   - Season-aware analytics
   - Migration strategy

2. **`/src/types/scoring.ts`**
   - `ScoringAction` - Single source of truth for ball-by-ball data
   - `LiveScoreProjection` - Derived real-time view
   - `InningsProjection` - Computed innings state
   - `BatsmanProjection` / `BowlerProjection` - Player stats
   - `MatchLineup` - Canonical team selection
   - `SchoolRoleAssignment` / `TeamRoleAssignment` / `MatchRoleAssignment`
   - `PlayerSeasonStats` / `TeamSeasonStats` / `PlayerHeadToHeadStats`

3. **`/src/lib/scoring/projectionService.ts`**
   - `computeProjection()` - Main projection computation from events
   - `recomputeProjection()` - Recompute after undo
   - `validateProjection()` - Consistency checking
   - Helper functions for overs, strike rate, economy, etc.

4. **`/src/lib/scoring/index.ts`**
   - Module exports

5. **Updated `/src/types/firestore.ts`**
   - Re-exports V3 scoring types

---

## 🔄 Phase 2: Migration (NEXT)

### Tasks

1. **Migrate `recordBallAction()`**
   - [ ] Write to `scoring_actions` subcollection as primary
   - [ ] Compute projection using `projectionService`
   - [ ] Write projection to `/matches/{id}/live/score`
   - [ ] Maintain backward compatibility with `ballHistory`

2. **Migrate `undoLastBallAction()`**
   - [ ] Mark action as `isVoided: true` (not delete)
   - [ ] Recompute projection from remaining actions
   - [ ] Add undo audit trail

3. **Create Migration Script**
   - [ ] Convert existing `ballHistory` to `scoring_actions`
   - [ ] Validate projection consistency
   - [ ] Run for all live/completed matches

---

## 📋 Phase 3: Match Lineups (PLANNED)

### Tasks

1. **Create MatchLineup subcollection**
   - [ ] Add `/matches/{matchId}/lineups` structure
   - [ ] Migrate existing `teamSelection` data

2. **Update Team Selection UI**
   - [ ] Use MatchLineup for playing XI
   - [ ] Update scorecard generation

3. **Deprecate Legacy Fields**
   - [ ] `Match.teamSelection`
   - [ ] `PreMatchProcedure.teamSelection`
   - [ ] `RosterMember` (move to team_role_assignments)

---

## 📋 Phase 4: Role Assignments (PLANNED)

### Tasks

1. **Create Collections**
   - [ ] `school_role_assignments`
   - [ ] `team_role_assignments`
   - [ ] `/matches/{matchId}/role_assignments`

2. **Migrate Existing Data**
   - [ ] Extract from `Person.teamIds`, `Person.assignedSchools`
   - [ ] Extract from `Match.umpires`, `Match.scorer`

3. **Update Security Rules**
   - [ ] Check role assignments for authorization
   - [ ] Add temporal role validation

---

## 📋 Phase 5: Statistics (PLANNED)

### Tasks

1. **Create Season-Aware Stats Collections**
   - [ ] `player_season_stats`
   - [ ] `team_season_stats`
   - [ ] `player_h2h_stats`

2. **Build Aggregation Service**
   - [ ] Compute from `scoring_actions`
   - [ ] Background job for updates

3. **Update Analytics Dashboard**
   - [ ] Use season-aware stats
   - [ ] Add H2H views

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     SCORING ENGINE                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌──────────────────┐                                      │
│   │  recordBall()    │                                      │
│   └────────┬─────────┘                                      │
│            │                                                │
│            ▼                                                │
│   ┌──────────────────────────────────────┐                 │
│   │  scoring_actions (Event Store)       │  ← TRUTH        │
│   │  /matches/{id}/scoring_actions/{id}  │                 │
│   └────────┬─────────────────────────────┘                 │
│            │                                                │
│            │ compute                                        │
│            ▼                                                │
│   ┌──────────────────────────────────────┐                 │
│   │  projectionService.computeProjection │                 │
│   └────────┬─────────────────────────────┘                 │
│            │                                                │
│            ▼                                                │
│   ┌──────────────────────────────────────┐                 │
│   │  LiveScoreProjection (Cached View)   │  ← DERIVED      │
│   │  /matches/{id}/live/score            │                 │
│   └──────────────────────────────────────┘                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     TEAM SELECTION                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Squad + SquadPlayer                                       │
│   (Seasonal Pool)                                           │
│        │                                                    │
│        │ select                                             │
│        ▼                                                    │
│   ┌──────────────────────────────────────┐                 │
│   │  MatchLineup                         │  ← TRUTH        │
│   │  /matches/{id}/lineups/{id}          │                 │
│   └──────────────────────────────────────┘                 │
│        │                                                    │
│        │ used for                                           │
│        ▼                                                    │
│   Scorecards, Stats, Analytics                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     ROLE ASSIGNMENTS                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Person (capabilities only)                                │
│        │                                                    │
│        │ assigned via                                       │
│        ▼                                                    │
│   school_role_assignments (temporal)                        │
│   team_role_assignments (temporal)                          │
│   match_role_assignments (per-match)                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Design Decisions

### 1. Event Sourcing for Balls
- All ball-by-ball data in `scoring_actions`
- Actions are append-only (never delete)
- Corrections create new events with references
- Projections are computed and cached

### 2. Voided Actions vs Deletion
- Undo sets `isVoided: true`
- Original action preserved for audit
- Projection recomputed from valid actions

### 3. MatchLineup as Canonical Selection
- Replaces scattered selection structures
- Single query point for "who played"
- Supports substitutions and impact subs

### 4. Temporal Role Assignments
- Roles have start/end dates
- Season context where applicable
- Enables historical queries

### 5. Season-Aware Statistics
- Stats partitioned by season/team/format
- Enables proper league standings
- Supports head-to-head analytics

---

## Breaking Changes

### Deprecated (Phase Out Over 2 Weeks)

| Field/Structure | Replacement |
|-----------------|-------------|
| `LiveScore.ballHistory` | `scoring_actions` collection |
| `Innings.overHistory[].balls[]` | Computed from `scoring_actions` |
| `Match.teamSelection` | `MatchLineup` subcollection |
| `PreMatchProcedure.teamSelection` | `MatchLineup` subcollection |
| `RosterMember` | `team_role_assignments` |
| `Person.teamIds` | Query `team_role_assignments` |
| `Person.assignedSchools` | Query `school_role_assignments` |
| `Match.umpires[]` | `match_role_assignments` |
| `PlayerStats` (global) | `PlayerSeasonStats` |
| `TeamStats` (global) | `TeamSeasonStats` |

---

## Testing Checklist

### Scoring Engine
- [ ] Record sequence of balls, verify projection matches
- [ ] Undo a ball, verify projection recomputes correctly
- [ ] End innings, verify innings1 snapshot is correct
- [ ] Complete match, verify final stats
- [ ] Large innings (20+ overs), verify performance
- [ ] Concurrent scoring (two devices), verify consistency

### Match Lineups
- [ ] Create lineup, verify stored correctly
- [ ] Query playing XI for team
- [ ] Scorecard uses lineup data
- [ ] Historical matches still work

### Role Assignments
- [ ] Assign role with dates
- [ ] Query active roles for person
- [ ] Query all coaches for school
- [ ] Security rules check role
