# Server Actions Reference

## Overview
SCRBRD uses Next.js Server Actions for all data mutations. All actions are located in `src/app/actions/`.

---

## Match Actions (`matchActions.ts`)

### `createMatchAction(prevState, formData)`
Creates a new match fixture.

**Parameters**:
- `prevState`: Previous action state
- `formData`: Form data containing match details

**FormData Fields**:
- `homeTeamId`, `awayTeamId`: Team IDs (required)
- `matchDate`: Match date (required)
- `matchTime`: Match time (optional)
- `fieldId`: Venue ID (optional)
- `leagueId`, `seasonId`: Competition IDs (optional)
- `matchType`: T20/ODI/Test (default: T20)
- `overs`: Total overs (optional)

**Returns**: `{ success?, error?, fieldErrors? }`

**Example**:
```typescript
const result = await createMatchAction(prevState, formData);
if (result.success) {
  // Redirects to /matches
}
```

---

### `updateLivePlayersAction(matchId, updates)`
Updates current players in a live match.

**Parameters**:
- `matchId`: Match document ID
- `updates`: Object with player IDs
  - `strikerId?`: Striker player ID
  - `nonStrikerId?`: Non-striker player ID
  - `bowlerId?`: Bowler player ID
  - `bowlingAngle?`: 'Over the Wicket' | 'Round the Wicket'

**Returns**: `{ success, error? }`

**Usage**: Called when selecting players or swapping ends

---

### `recordBallAction(matchId, ballData)`
Records a single ball in live scoring.

**Parameters**:
- `matchId`: Match document ID
- `ballData`: Ball details
  - `runs`: Runs scored off bat
  - `extraRuns`: Extra runs (wides, no-balls)
  - `extraType`: 'wide' | 'noball' | 'bye' | 'legbye'
  - `isWicket`: Boolean
  - `wicketType`: Dismissal type
  - `strikerId`, `bowlerId`: Player IDs
  - `coordinates`: Shot location `{angle, distance}`

**Returns**: 
```typescript
{
  success: boolean;
  milestone?: string; // "50", "100", etc.
  isHatTrick?: boolean;
  isDuck?: boolean;
  isMaidenOver?: boolean;
  isOverComplete?: boolean;
}
```

**Logic**:
- Updates innings totals (runs, wickets, balls)
- Updates batsman and bowler stats
- Handles strike rotation (odd runs, over completion)
- Detects milestones and hat-tricks
- Clears striker on wicket (prompts for new batsman)

---

### `endInningsAction(matchId)`
Ends the current innings.

**Returns**:
```typescript
{
  success: boolean;
  isMatchComplete: boolean;
  target?: number; // For 2nd innings
  winnerId?: string; // If match complete
  margin?: string; // Win margin
}
```

**Logic**:
- Saves completed innings to history
- If 1st innings: Prepares for 2nd innings
- If 2nd innings: Determines winner and completes match

---

### `undoLastBallAction(matchId, reason)`
Undoes the last recorded ball.

**Parameters**:
- `matchId`: Match ID
- `reason`: Reason for undo (string)

**Returns**: `{ success, undoneRuns?, error? }`

**Logic**:
- Reverses all stats (runs, wickets, balls)
- Logs undo action with reason
- Restores previous state

---

## Team Actions (`teamActions.ts`)

### `createTeamAction(prevState, formData)`
Creates a new team.

**FormData Fields**:
- `name`: Team name (required)
- `schoolId`: Parent school (required)
- `divisionId`: Division/age group
- `suffix`: "1st XI", "U15A", etc.
- `defaultCaptainId`: Captain player ID

---

## Player Actions (`playerActions.ts`)

### `createPlayerAction(prevState, formData)`
Adds a new player to the system.

**FormData Fields**:
- `firstName`, `lastName`: Name (required)
- `email`, `phone`: Contact info
- `dateOfBirth`: Birth date
- `schoolId`: School reference
- `battingStyle`, `bowlingStyle`: Cricket attributes
- `playingRole`: Batsman/Bowler/AllRounder/Wicketkeeper

---

## School Actions (`schoolActions.ts`)

### `createSchoolAction(prevState, formData)`
Creates a new school.

**FormData Fields**:
- `name`: School name (required)
- `abbreviation`: Short code (e.g., "WBHS")
- `provinceId`: Province reference
- `contactEmail`, `contactPhone`: Contact details
- `logoUrl`: School crest URL

---

## League Actions (`leagueActions.ts`)

### `getLeaguesAction()`
Fetches all leagues.

**Returns**: `League[]`

**Usage**: Populating league dropdowns

---

## Season Actions (`seasonActions.ts`)

### `createSeasonAction(prevState, formData)`
Creates a new season.

**FormData Fields**:
- `name`: Season name (e.g., "2025")
- `startDate`, `endDate`: Season dates
- `status`: active/completed/upcoming

---

## Field Actions (`fieldActions.ts`)

### `createFieldAction(prevState, formData)`
Adds a new cricket ground.

**FormData Fields**:
- `name`: Ground name (required)
- `location`: Address
- `schoolId`: Owning school (optional)
- `capacity`: Spectator capacity
- `pitchType`: Surface type
- `floodlights`: Boolean

---

## Common Patterns

### Error Handling
All actions return a consistent error structure:
```typescript
{
  success?: boolean;
  error?: string; // General error message
  fieldErrors?: Record<string, string[]>; // Validation errors
}
```

### Revalidation
Actions automatically revalidate affected paths:
```typescript
revalidatePath('/matches');
revalidatePath(`/matches/${id}`);
```

### Redirects
Create/Update actions redirect on success:
```typescript
redirect('/matches');
```

### Validation
All actions use Zod schemas for validation:
```typescript
const validatedData = MatchSchema.parse(rawData);
```

---

## Security Notes

- All actions use `'use server'` directive
- Firebase Admin SDK is used for server-side operations
- User authentication should be checked in production
- Role-based permissions should be enforced

---

## Performance Tips

1. **Batch Updates**: Use Firestore batch writes for multiple updates
2. **Optimistic UI**: Update UI before server confirmation
3. **Debounce**: Debounce rapid actions (e.g., live scoring)
4. **Caching**: Leverage Next.js cache for read operations

---

## Testing Server Actions

```typescript
// Example test
import { createMatchAction } from '@/app/actions/matchActions';

test('creates match successfully', async () => {
  const formData = new FormData();
  formData.append('homeTeamId', 'team1');
  formData.append('awayTeamId', 'team2');
  formData.append('matchDate', '2025-01-15');
  
  const result = await createMatchAction({}, formData);
  expect(result.success).toBe(true);
});
```
