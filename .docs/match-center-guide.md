# Match Center - Comprehensive Guide

## Overview

The Match Center is your central hub for viewing **live matches**, **upcoming fixtures**, and **completed results** with detailed, data-driven information.

## Features

### 1. **Matches Hub** (`/matches`)

#### **Quick Stats Dashboard**

At the top of the page, you'll see three key metrics:

- **Live Matches** (Red) - Currently in progress
- **Upcoming Matches** (Blue) - Scheduled fixtures
- **Completed Matches** (Green) - Finished games with results

#### **Filter Tabs**

Navigate between different match views:

- **All Matches** - Complete list
- **Live** - Only matches currently in progress
- **Upcoming** - Future fixtures sorted by date
- **Completed** - Past matches with results

#### **Match Cards**

Each match card displays:

**Left Section:**

- Date (large format)
- Match status badge (LIVE/UPCOMING/COMPLETED)
- Time

**Center Section:**

- Home Team with logo
- Away Team with logo
- Current scores (if available)
- Match result (for completed matches)

**Right Section:**

- Venue location
- Division/League
- Arrow to view details

### 2. **Match Detail Page** (`/matches/[id]`)

**Currently Available:**

- Match header with teams and status
- Tabs: Overview, Scorecard, Analytics, Commentary
- Score overlay (sticky bottom)
- Match info sidebar (toss, umpires, referee)
- Key stats
- Charts: Manhattan (run rate), Worm (comparison), Wagon Wheel

**Coming Soon (Data-Driven Features):**

#### **Live Match Features**

- Real-time score updates
- Ball-by-ball commentary
- Live statistics
- Player performance tracking
- Partnership tracker
- Run rate graphs
- Required run rate calculator

#### **Detailed Scorecard**

- **Batting:**
  - Player name, runs, balls, 4s, 6s, strike rate
  - How out (bowler, fielder)
  - Fall of wickets timeline
  - Partnerships
  - Extras breakdown

- **Bowling:**
  - Bowler name, overs, maidens, runs, wickets, economy
  - Dot ball percentage
  - Bowling figures by spell

#### **Advanced Analytics**

- **Performance Charts:**
  - Manhattan Chart (runs per over)
  - Worm Chart (cumulative runs comparison)
  - Wagon Wheel (shot placement)
  - Pitch Map (where balls landed)
  - Partnership graph

- **Player Comparisons:**
  - Head-to-head stats
  - Form guide
  - Historical performance at venue

- **Team Stats:**
  - Powerplay performance
  - Death overs analysis
  - Boundary count
  - Dot ball percentage
  - Extras conceded

#### **Ball-by-Ball Commentary**

- Over-by-over breakdown
- Color-coded events:
  - 🔴 Wickets (red)
  - 🟡 Sixes (gold)
  - 🔵 Fours (blue)
  - ⚪ Dots (gray)
- Key moments highlighted
- Video highlights (future)

#### **Match Info Sidebar**

- Toss result
- Playing XI for both teams
- Umpires and referee
- Weather conditions
- Pitch report
- Ground details

## Data Structure

### Match Object

```typescript
{
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  dateTime: string; // ISO format
  venue: string;
  division: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  
  score: {
    home: "245/8 (50 overs)",
    away: "248/5 (48.2 overs)"
  },
  
  result: "Away Team won by 5 wickets",
  
  tossWinner: "Home Team",
  tossChoice: "bat",
  matchType: "ODI",
  overs: 50,
  
  umpires: ["R. Tucker", "M. Erasmus"],
  referee: "D. Boon",
  
  // Extended data for live/detailed view
  innings: [
    {
      battingTeam: "teamId",
      bowlingTeam: "teamId",
      balls: [
        {
          over: 1,
          ball: 1,
          batter: "playerId",
          bowler: "playerId",
          runs: 4,
          extras: 0,
          wicket: false,
          commentary: "Driven through covers for four!"
        }
      ]
    }
  ]
}
```

## How to Use

### Viewing Live Matches

1. Navigate to `/matches`
2. Click the **Live** tab
3. See all currently in-progress matches
4. Click any match card to view detailed live scorecard
5. Watch real-time updates (auto-refresh every 30 seconds)

### Checking Upcoming Fixtures

1. Go to `/matches`
2. Click **Upcoming** tab
3. Matches sorted by date (soonest first)
4. Click a match to see:
   - Team lineups (when announced)
   - Venue details
   - Weather forecast
   - Head-to-head history

### Reviewing Past Results

1. Navigate to `/matches`
2. Click **Completed** tab
3. Most recent matches first
4. Click any match to see:
   - Full scorecard
   - Match summary
   - Player of the match
   - Key statistics
   - Match highlights

## Mobile Experience

- **Responsive Design**: All features work on mobile
- **Swipeable Tabs**: Easy navigation
- **Compact Cards**: Optimized for small screens
- **Bottom Score Bar**: Sticky score overlay on match detail
- **Pull to Refresh**: Update live scores

## Future Enhancements

### Phase 1: Real-Time Data

- [ ] WebSocket integration for live updates
- [ ] Push notifications for match events
- [ ] Live commentary feed

### Phase 2: Rich Media

- [ ] Video highlights
- [ ] Photo gallery
- [ ] Audio commentary

### Phase 3: Social Features

- [ ] Match predictions
- [ ] Fan polls
- [ ] Live chat
- [ ] Share to social media

### Phase 4: Advanced Analytics

- [ ] AI-powered insights
- [ ] Predictive analytics
- [ ] Player heatmaps
- [ ] Win probability tracker

## API Integration

To populate matches with real data, you'll need to:

1. **Create Matches** in Firestore:

```typescript
{
  homeTeamId: "team-123",
  awayTeamId: "team-456",
  dateTime: "2024-03-15T14:00:00Z",
  venue: "Lord's Cricket Ground",
  status: "scheduled",
  matchType: "T20",
  overs: 20
}
```

2. **Update Live Scores**:

```typescript
// During match
{
  status: "live",
  score: {
    home: "145/4 (15.3 overs)",
    away: "Not batted"
  }
}
```

3. **Add Final Result**:

```typescript
{
  status: "completed",
  result: "Home Team won by 25 runs",
  score: {
    home: "185/7 (20 overs)",
    away: "160/10 (19.2 overs)"
  }
}
```

## Keyboard Shortcuts

- `L` - Jump to Live matches
- `U` - Jump to Upcoming
- `C` - Jump to Completed
- `N` - Schedule new match
- `R` - Refresh scores
- `ESC` - Close match detail

## Accessibility

- Screen reader friendly
- Keyboard navigation
- High contrast mode support
- ARIA labels on all interactive elements

---

The Match Center provides a comprehensive, ESPN/Cricinfo-style experience for viewing all your cricket matches with rich, data-driven insights!
