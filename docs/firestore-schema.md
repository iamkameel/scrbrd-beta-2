# Firestore Schema Documentation

## Overview
SCRBRD uses Firebase Firestore as its primary database. This document outlines all collections, their structure, relationships, and access patterns.

---

## Core Collections

### `users`
**Purpose**: Authentication and user profiles

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✓ | User UID from Firebase Auth |
| `email` | string | ✓ | User email address |
| `role` | string | ✓ | User role (see `src/lib/roles.ts`) |
| `firstName` | string | ✓ | First name |
| `lastName` | string | ✓ | Last name |
| `profileImageUrl` | string | | Profile photo URL |
| `assignedSchools` | string[] | | School IDs user has access to |
| `createdAt` | Timestamp | ✓ | Account creation date |
| `updatedAt` | Timestamp | | Last update timestamp |

**Indexes**: `email`, `role`

**Security**: Users can read their own document. Admins can read/write all.

---

### `people`
**Purpose**: Players, coaches, officials, and staff

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Document ID |
| `firstName` | string | First name |
| `lastName` | string | Last name |
| `email` | string | Contact email |
| `phone` | string | Phone number |
| `dateOfBirth` | Timestamp/string | Birth date |
| `role` | string | Person's role (Player, Coach, etc.) |
| `schoolId` | string | Associated school ID |
| `teamIds` | string[] | Teams they belong to |
| `battingStyle` | string | RHB/LHB |
| `bowlingStyle` | string | Bowling type |
| `playingRole` | string | Batsman/Bowler/AllRounder/Wicketkeeper |
| `skillMatrix` | object | Skill ratings (0-100) |
| `status` | string | active/injured/inactive |

**Relationships**: 
- `schoolId` → `schools/{id}`
- `teamIds[]` → `teams/{id}`

---

### `schools`
**Purpose**: Educational institutions

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Document ID |
| `name` | string | Full school name |
| `abbreviation` | string | Short code (e.g., "WBHS") |
| `provinceId` | string | Province reference |
| `divisionId` | string | Division reference |
| `address` | string | Physical address |
| `contactEmail` | string | Admin email |
| `contactPhone` | string | Contact number |
| `logoUrl` | string | School logo/crest |
| `brandColors` | object | `{primary, secondary}` |
| `motto` | string | School motto |
| `establishmentYear` | number | Year founded |

**Relationships**:
- `provinceId` → `provinces/{id}`
- `divisionId` → `divisions/{id}`

---

### `teams`
**Purpose**: Cricket teams within schools

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Document ID |
| `name` | string | Team name |
| `abbreviatedName` | string | Short name |
| `schoolId` | string | Parent school |
| `divisionId` | string | Division/age group |
| `suffix` | string | "1st XI", "U15A", etc. |
| `defaultCaptainId` | string | Captain player ID |
| `coachIds` | string[] | Coach IDs |
| `teamColors` | object | `{primary, secondary}` |
| `logoUrl` | string | Team logo |

**Relationships**:
- `schoolId` → `schools/{id}`
- `divisionId` → `divisions/{id}`
- `defaultCaptainId` → `people/{id}`

---

### `matches`
**Purpose**: Cricket match fixtures and results

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Document ID |
| `homeTeamId` | string | Home team reference |
| `awayTeamId` | string | Away team reference |
| `matchDate` | Timestamp | Match date/time |
| `fieldId` | string | Venue reference |
| `status` | string | scheduled/live/completed/cancelled |
| `state` | string | SCHEDULED/LIVE/COMPLETED (state machine) |
| `leagueId` | string | League reference |
| `seasonId` | string | Season reference |
| `division` | string | Division name |
| `matchType` | string | T20/ODI/Test |
| `overs` | number | Total overs per innings |
| `tossWinner` | string | Team that won toss |
| `tossChoice` | string | bat/field |
| `umpires` | string[] | Umpire names |
| `scorer` | string | Scorer name |
| `weather` | string | Weather conditions |
| `result` | string | Match result summary |

**Subcollections**:
- `matches/{id}/live/score` - Real-time scoring data
- `matches/{id}/innings` - Innings details

**Relationships**:
- `homeTeamId` → `teams/{id}`
- `awayTeamId` → `teams/{id}`
- `fieldId` → `fields/{id}`
- `leagueId` → `leagues/{id}`

---

### `matches/{matchId}/live/score`
**Purpose**: Real-time match scoring (single document)

| Field | Type | Description |
|-------|------|-------------|
| `matchId` | string | Parent match ID |
| `status` | string | live/completed |
| `inningsNumber` | number | 1 or 2 |
| `battingTeamId` | string | Current batting team |
| `bowlingTeamId` | string | Current bowling team |
| `currentInnings` | object | Runs, wickets, overs, balls |
| `innings1` | object | First innings summary |
| `innings2` | object | Second innings summary |
| `currentPlayers` | object | strikerId, nonStrikerId, bowlerId |
| `batsmen` | array | Live batsman stats |
| `bowlers` | array | Live bowler stats |
| `ballHistory` | array | Ball-by-ball data |
| `undoLog` | array | Undo history |

**Access**: Real-time listeners for live updates

---

### `fields`
**Purpose**: Cricket grounds and venues

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Document ID |
| `name` | string | Ground name |
| `abbreviatedName` | string | Short code |
| `location` | string | Address/description |
| `schoolId` | string | Owning school (optional) |
| `coordinates` | object | `{lat, lng}` GPS |
| `capacity` | number | Spectator capacity |
| `pitchType` | string | Natural Turf/Astro/etc. |
| `floodlights` | boolean | Has lights |
| `scoreboardType` | string | Manual/Digital/LED |
| `status` | string | Available/Maintenance/Booked |

---

### `leagues`
**Purpose**: Competition structures

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Document ID |
| `name` | string | League name |
| `provinceId` | string | Province reference |
| `type` | string | League/Series/Cup/Friendly |

---

### `divisions`
**Purpose**: Age groups and skill levels

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Document ID |
| `name` | string | Division name |
| `leagueId` | string | Parent league |
| `ageGroup` | string | Open/U19/U16/U15/U14/U13 |
| `season` | string | Season identifier |

---

### `seasons`
**Purpose**: Competition seasons

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Document ID |
| `name` | string | Season name (e.g., "2025") |
| `startDate` | Timestamp | Season start |
| `endDate` | Timestamp | Season end |
| `status` | string | active/completed/upcoming |

---

## Security Rules Summary

### Role-Based Access
- **Admin**: Full read/write access to all collections
- **Sportsmaster**: Read all, write matches/teams/players
- **Coach**: Read all, write own team's data
- **Scorer**: Read all, write match scores
- **Player**: Read own data, read public match info
- **Parent**: Read own child's data

### Key Rules
```javascript
// Users can read their own profile
match /users/{userId} {
  allow read: if request.auth.uid == userId;
  allow write: if request.auth.uid == userId || isAdmin();
}

// Live scores are publicly readable
match /matches/{matchId}/live/score {
  allow read: if true;
  allow write: if isScorer() || isAdmin();
}
```

---

## Composite Indexes Required

1. **matches**: `(status, matchDate)`
2. **matches**: `(leagueId, seasonId, matchDate)`
3. **people**: `(schoolId, role)`
4. **teams**: `(schoolId, divisionId)`

---

## Data Migration Notes

- Legacy `mock store` data has been migrated to Firestore
- All timestamps use Firebase `Timestamp` type
- GeoPoints use Firebase `GeoPoint` for coordinates
- Arrays are used for multi-value fields (teamIds, umpires, etc.)
