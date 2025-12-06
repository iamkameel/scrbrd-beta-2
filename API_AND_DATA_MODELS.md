# API and Data Models Documentation

## Overview

SCRBRD uses a serverless architecture built on Next.js and Firebase. The "API" consists of **Server Actions** for mutations and **Direct Firestore Queries** (server-side) or **Real-time Listeners** (client-side) for data fetching.

---

## Data Models (Firestore Schema)

The database is structured as a collection of documents in Firestore. Below are the core entities.

### 1. Teams & Organization

#### `Team`

Represents a cricket team within a school or club.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `name` | string | Full team name |
| `schoolId` | string | Reference to parent School |
| `divisionId` | string | Reference to League Division |
| `coachIds` | string[] | Array of assigned coach IDs |
| `logoUrl` | string | URL to team logo |
| `teamColors` | object | Primary and secondary hex colors |

#### `Person` (Player/Staff)

A unified entity for all users, players, and staff.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `firstName` | string | First name |
| `lastName` | string | Last name |
| `role` | string | 'Player', 'Coach', 'Admin', etc. |
| `battingStyle` | string | e.g., 'Right-hand bat' |
| `bowlingStyle` | string | e.g., 'Right-arm fast' |
| `stats` | object | Aggregated career statistics |
| `schoolId` | string | Associated school ID |

### 2. Matches & Scoring

#### `Match`

The central entity for a cricket match.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `homeTeamId` | string | Home team reference |
| `awayTeamId` | string | Away team reference |
| `date` | Timestamp | Scheduled date/time |
| `status` | enum | 'scheduled', 'live', 'completed', 'cancelled' |
| `state` | enum | Granular state (e.g., 'INNINGS_BREAK') |
| `toss` | object | Winner and decision (bat/bowl) |
| `result` | string | Text summary of result |
| `liveScore` | object | Real-time score summary |

#### `Ball` (Sub-collection or Array)

Represents a single delivery in a match.

| Field | Type | Description |
|-------|------|-------------|
| `overNumber` | number | The over number (0-indexed) |
| `ballInOver` | number | Ball number in over (1-6+) |
| `bowlerId` | string | ID of the bowler |
| `batsmanId` | string | ID of the striker |
| `runs` | number | Runs scored off the bat |
| `extras` | number | Extra runs (wides, no-balls) |
| `isWicket` | boolean | True if a wicket fell |
| `wicketType` | string | Type of dismissal (bowled, caught, etc.) |

### 3. Venues & Logistics

#### `Field`

Represents a cricket ground or venue.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `name` | string | Venue name |
| `location` | string | Physical address/location |
| `capacity` | number | Spectator capacity |
| `facilities` | string[] | List of available amenities |
| `bookings` | sub-col | Calendar bookings |

---

## Server Actions (API Layer)

Mutations are handled via Next.js Server Actions. These are async functions that run on the server.

### Match Actions (`src/app/actions/matchActions.ts`)

- **`createMatchAction(data)`**: Creates a new match.
- **`updateMatchStatusAction(id, status)`**: Transitions match state.
- **`recordBallAction(matchId, ballData)`**: Records a delivery, updates scores, and handles player stats.
- **`undoLastBallAction(matchId)`**: Reverts the last recorded delivery.

### Team Actions (`src/app/actions/teamActions.ts`)

- **`createTeamAction(data)`**: Registers a new team.
- **`addPlayerToTeamAction(teamId, playerId)`**: Adds a player to the roster.
- **`updateTeamAction(id, data)`**: Modifies team details.

### Person Actions (`src/app/actions/personActions.ts`)

- **`createPersonAction(data)`**: Creates a new user profile.
- **`updatePersonAction(id, data)`**: Updates profile details.
- **`deletePersonAction(id)`**: Removes a user (soft or hard delete).

---

## Real-time Data Sync

SCRBRD uses Firestore's real-time capabilities for live features.

### `useLiveScore` Hook

Subscribes to a specific match document to receive instant updates on:

- Score changes
- Wickets
- Current over progress
- Batsman/Bowler stats

```typescript
// Example usage
const { match, loading } = useLiveScore(matchId);
```

### Optimistic Updates

For non-critical UI interactions (like deleting an item), we use optimistic updates to provide instant feedback before the server confirms the action.

---

## Authentication & Security

- **Auth**: Firebase Authentication (Email/Password, Google).
- **RBAC**: Role-Based Access Control via custom claims or user profile 'role' field.
- **Security Rules**: Firestore security rules enforce data access policies at the database level.
