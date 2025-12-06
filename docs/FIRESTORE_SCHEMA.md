# Firestore Schema Documentation

This document describes the Firestore collections used in SCRBRD.

## Collections Overview

| Collection | Purpose | Primary Key |
|------------|---------|-------------|
| `people` | Players, coaches, staff | Auto-generated `id` |
| `teams` | Team configurations | Auto-generated `id` |
| `matches` | Match records | Auto-generated `id` |
| `schools` | School/organization info | Auto-generated `id` |
| `fields` | Venue/field data | Auto-generated `id` |
| `equipment` | Equipment inventory | Auto-generated `id` |
| `transactions` | Financial records | Auto-generated `id` |
| `sponsors` | Sponsorship data | Auto-generated `id` |
| `seasons` | Season configurations | Auto-generated `id` |
| `divisions` | League divisions | Auto-generated `id` |
| `leagues` | League/tournament data | Auto-generated `id` |

## Collection Schemas

### People Collection

```typescript
interface Person {
  id: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string | Timestamp;
  role: 'player' | 'coach' | 'admin' | 'umpire' | 'staff';
  schoolId: string;
  teamIds?: string[];
  playingRole?: string;
  jerseyNumber?: number;
  profileImage?: string;
  status?: 'active' | 'injured' | 'inactive';
  
  // Cricket-specific
  battingStyle?: string;
  bowlingStyle?: string;
  primaryPosition?: string;
  heightCm?: number;
  weightKg?: number;
  
  // Skills (0-100 scale)
  skills?: {
    batting?: number;
    bowling?: number;
    fielding?: number;
    wicketkeeping?: number;
    leadership?: number;
    fitness?: number;
    mental?: number;
  };
  
  // Statistics
  stats?: {
    totalRuns?: number;
    wicketsTaken?: number;
    matchesPlayed?: number;
    battingAverage?: number;
    bowlingAverage?: number;
    strikeRate?: number;
    economyRate?: number;
  };
  
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
```

### Teams Collection

```typescript
interface Team {
  id: string;
  name: string;
  shortName?: string;
  schoolId: string;
  divisionId?: string;
  seasonId?: string;
  ageGroup?: string;
  homeFieldId?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  playerIds?: string[];
  coachIds?: string[];
  captainId?: string;
  status?: 'active' | 'inactive';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
```

### Matches Collection

```typescript
interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  dateTime: string | Timestamp;
  venue: string;
  fieldId?: string;
  divisionId?: string;
  seasonId?: string;
  leagueId?: string;
  matchType?: string;
  format?: 'T20' | 'ODI' | 'Test' | 'Limited Overs';
  overs?: number;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  
  // Scores
  homeScore?: string;
  awayScore?: string;
  result?: string;
  winningTeamId?: string;
  tossWinner?: string;
  tossDecision?: 'bat' | 'bowl';
  
  // Officials
  umpire1?: string;
  umpire2?: string;
  thirdUmpire?: string;
  matchReferee?: string;
  
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
```

### Schools Collection

```typescript
interface School {
  id: string;
  name: string;
  shortName?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
```

### Fields Collection

```typescript
interface Field {
  id: string;
  name: string;
  schoolId?: string;
  address?: string;
  capacity?: number;
  pitchType?: string;
  floodlights?: boolean;
  facilities?: string[];
  maintenanceStatus?: 'excellent' | 'good' | 'fair' | 'poor';
  latitude?: number;
  longitude?: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
```

### Equipment Collection

```typescript
interface Equipment {
  id: string;
  name: string;
  category: string;
  quantity: number;
  condition: 'New' | 'Good' | 'Fair' | 'Poor';
  status: 'Available' | 'In Use' | 'Maintenance';
  assignedTo?: string | null;
  schoolId?: string;
  purchaseDate?: string | Timestamp;
  lastMaintenanceDate?: string | Timestamp;
  notes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
```

### Transactions Collection

```typescript
interface Transaction {
  id: string;
  type: 'Income' | 'Expense';
  amount: number;
  category: string;
  description: string;
  date: string | Timestamp;
  status: 'Completed' | 'Pending' | 'Cancelled';
  paymentMethod?: string;
  reference?: string;
  schoolId?: string;
  createdBy?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
```

### Sponsors Collection

```typescript
interface Sponsor {
  id: string;
  name: string;
  industry?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  logoUrl?: string;
  tierLevel?: 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
  contributionAmount?: number;
  startDate?: string | Timestamp;
  endDate?: string | Timestamp;
  status?: 'active' | 'inactive' | 'pending';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
```

## Composite Indexes

Create these indexes in Firebase Console for optimal query performance:

### Top Run Scorers Query

```
Collection: people
Fields:
  - role (Ascending)
  - stats.totalRuns (Descending)
```

### Top Wicket Takers Query

```
Collection: people
Fields:
  - role (Ascending)
  - stats.wicketsTaken (Descending)
```

## Data Access Patterns

### Server Actions

All data mutations go through server actions in `src/lib/actions/`:

- `playerActions.ts` - Player CRUD
- `teamActions.ts` - Team CRUD
- `matchActions.ts` - Match CRUD
- `equipmentActions.ts` - Equipment management
- `transactionActions.ts` - Financial transactions
- `sponsorActions.ts` - Sponsor management

### Firestore Utilities

Generic and specific fetch functions in `src/lib/firestore.ts`:

```typescript
// Generic
fetchCollection(collectionName)
fetchDocument(collectionName, docId)
createDocument(collectionName, data)
updateDocument(collectionName, docId, data)
deleteDocument(collectionName, docId)

// Specific
fetchPlayers(limit?)
fetchTeams()
fetchMatches(limit?)
fetchFields()
fetchSponsors()
fetchTransactions()
fetchTopRunScorers(limit?)
fetchTopWicketTakers(limit?)
```

## Security Rules (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Authenticated users can read all data
    match /{collection}/{document=**} {
      allow read: if request.auth != null;
    }
    
    // Only admins can write
    match /{collection}/{document=**} {
      allow write: if request.auth != null 
        && request.auth.token.role in ['super_admin', 'admin'];
    }
  }
}
```
