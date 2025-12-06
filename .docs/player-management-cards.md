# Player Management Cards - Usage Examples

## Overview

Phase 3 components for managing player selection, availability, and team status. All components follow the design system established in `scoring-dialog.tsx`.

---

## Components

### 1. PlayerCard

Display player information in compact or detailed format with actions.

#### Compact Variant (for lists)

```typescript
import { PlayerCard } from './player-card';

<PlayerCard
  player={player}
  variant="compact"
  onSelect={(id) => handlePlayerSelect(id)}
  isSelected={selectedPlayerId === player.id}
/>
```

#### Detailed Variant (for selection/management)

```typescript
<PlayerCard
  player={player}
  variant="detailed"
  onSelect={(id) => handlePlayerSelect(id)}
  onSubstitute={(id) => handleSubstitute(id)}
  onViewStats={(id) => router.push(`/people/${id}`)}
  isSelected={selectedPlayerId === player.id}
  showActions={true}
/>
```

**Features:**
- Avatar with fallback to generated avatar
- Role and playing style badges
- Status indicator (active/injured/inactive)
- Quick stats (runs, wickets, average)
- Selection, substitution, and view stats actions

---

### 2. PlayerAvailabilityCard

Manage individual player availability status.

```typescript
import { PlayerAvailabilityCard } from './player-availability-card';

<PlayerAvailabilityCard
  player={player}
  availability="available" // available | unavailable | doubtful | injured | pending
  reason="Minor injury"
  estimatedReturn="2 days"
  onUpdateAvailability={(playerId, status) => {
    updatePlayerAvailability(playerId, status);
  }}
/>
```

**Features:**
- Color-coded status badges
  - Green: Available
  - Red: Unavailable/Injured
  - Orange: Doubtful
  - Gray: Pending
- Reason and estimated return display
- Quick status update buttons

---

### 3. AvailabilityStatusCard

Team-wide availability overview with alerts.

#### Compact Variant

```typescript
import { AvailabilityStatusCard } from './availability-status-card';

<AvailabilityStatusCard
  teamName="Team A"
  stats={{
    available: 12,
    unavailable: 2,
    injured: 1,
    doubtful: 1,
    pending: 0,
    total: 16
  }}
  variant="compact"
/>
```

#### Detailed Variant

```typescript
<AvailabilityStatusCard
  teamName="Team A"
  stats={availabilityStats}
  variant="detailed"
/>
```

**Features:**
- Ready to play vs not available summary
- Availability percentage with progress bar
- Detailed status breakdown (Available, Injured, Unavailable, Doubtful)
- Automatic alerts when players are unavailable or pending

---

## Design System Adherence

All components follow the **scoring-dialog.tsx** design patterns:

### Colors
- **Green (600)**: Available, positive states
- **Red (600)**: Unavailable, injured, critical states
- **Orange (600)**: Doubtful, warning states
- **Blue (600)**: Primary actions, information
- **Purple (600)**: Special stats (wickets)
- **Gray (600)**: Inactive, pending states

### Typography
- **Bold headings**: font-semibold, font-bold
- **Muted text**: text-muted-foreground
- **Stats**: text-xl, text-2xl, text-3xl with font-bold

### Patterns
- **Gradients**: `from-{color}/10 to-{color}/10`
- **Borders**: `border-2 border-{color}/30`
- **Rings**: `ring-4 ring-primary` for selected state
- **Transitions**: `transition-all` with `scale-105` on hover/select
- **Cards**: `p-4` (compact), `p-6` (detailed)

---

## Integration Example

### Lineup Manager (Coming Soon)

```typescript
export function LineupManager({ teamId, matchId }: Props) {
  const [players, setPlayers] = useState<Person[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  
  return (
    <div className="space-y-6">
      {/* Team Availability Overview */}
      <AvailabilityStatusCard
        teamName="Home Team"
        stats={calculateAvailabilityStats(players)}
        variant="detailed"
      />
      
      {/* Player Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            variant="detailed"
            onSelect={handlePlayerSelect}
            isSelected={selectedPlayers.includes(player.id)}
            showActions={true}
          />
        ))}
      </div>
      
      {/* Individual Availability Management */}
      <div className="space-y-3">
        <h3 className="font-semibold">Manage Availability</h3>
        {players.map((player) => (
          <PlayerAvailabilityCard
            key={player.id}
            player={player}
            availability={getPlayerAvailability(player.id)}
            onUpdateAvailability={updateAvailability}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## File Locations

- [player-card.tsx](file:///Users/kameel.kalyan/Documents/SCRBRD/src/app/matches/[matchId]/manage/player-card.tsx)
- [player-availability-card.tsx](file:///Users/kameel.kalyan/Documents/SCRBRD/src/app/matches/[matchId]/manage/player-availability-card.tsx)
- [availability-status-card.tsx](file:///Users/kameel.kalyan/Documents/SCRBRD/src/app/matches/[matchId]/manage/availability-status-card.tsx)

---

## Next Steps

These components will be integrated into:
- **Lineup Manager** (Phase 5) - Player selection and batting/bowling order
- **Match Management Page** - Team availability overview
- **Pre-Match Procedures** - Squad confirmation and availability checks
