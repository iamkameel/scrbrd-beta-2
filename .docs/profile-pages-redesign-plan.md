# Profile Pages UI/UX Improvement Plan

## 🎯 Overview

Transform profile pages (Team, Player, Coach, School) into modern, data-rich dashboards with intuitive navigation, visual analytics, and professional layouts inspired by leading sports platforms (ESPN, Cricinfo, Opta).

## 📊 Current Issues

### 1. **Team Profile** (`/teams/[id]`)

- ❌ Basic card layout with minimal visual hierarchy
- ❌ Statistics shown in plain text grids
- ❌ No performance visualizations
- ❌ Match history lacks context (scores, results, trends)
- ❌ Roster displayed as simple list without filtering/grouping

### 2. **Player/Person Profile** (`/people/[id]`)

- ❌ Long scrolling page with no clear sections
- ❌ Stats displayed as numbers without context or trends
- ❌ No performance graphs or comparative analytics
- ❌ Physical attributes buried in text
- ❌ Career progression not visualized

### 3. **School Profile** (`/schools/[id]`)

- ❌ Basic information display
- ❌ No statistics or performance metrics
- ❌ Teams and people shown as simple grids
- ❌ Missing historical data, achievements, rankings

## ✨ Proposed Improvements

### **Design Principles**

1.  **Information Hierarchy**: Hero section → Key stats → Detailed tabs → Related entities
2.  **Visual Data**: Charts, graphs, progress bars instead of plain numbers
3.  **Contextual Comparisons**: Show league averages, team rankings, player percentiles
4.  **Progressive Disclosure**: Summary cards → Expandable details → Full analytics
5.  **Responsive Layouts**: Grid systems that adapt to screen sizes
6.  **Action-Oriented**: Quick actions at top (Edit, Share, Export, Compare)

---

## 🏏 TEAM PROFILE REDESIGN

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Hero Section                                            │
│ ┌──────────┐ Michaelhouse 1st XI                   Actions│
│ │  Logo    │ KZN Schools Division • 2024 Season    [Edit]│
│ │  (large) │ W:12 L:3 D:1 (League Position: 2nd)  [Share]│
│ └──────────┘                                             │
├─────────────────────────────────────────────────────────┤
│ Quick Stats Cards (4 columns)                           │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                    │
│ │ 16   │ │ 75%  │ │ 4.2  │ │ 245  │                    │
│ │Match │ │Win % │ │Goals │ │Avg   │                    │
│ └──────┘ └──────┘ └──────┘ └──────┘                    │
├─────────────────────────────────────────────────────────┤
│ Tab Navigation                                          │
│ [Overview] [Roster] [Matches] [Stats] [Analytics]       │
├─────────────────────────────────────────────────────────┤
│ TAB CONTENT AREA                                        │
│ ┌──────────────────────┬──────────────────────┐        │
│ │ Performance Chart    │ Recent Form          │        │
│ │ (Line/Area)          │ W W L W W D          │        │
│ ├──────────────────────┴──────────────────────┤        │
│ │ Top Performers (Cards with avatars & stats)  │        │
│ └──────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

### Components to Build

1.  **Hero Section Card**
    - Large team logo/badge
    - Team name, division badge, season
    - Key record stats (W-L-D, position)
    - Quick action buttons (Edit, Share, Export)

2.  **Stats Overview Cards** (4-6 cards)
    - Total matches
    - Win percentage (with progress ring)
    - Average score
    - League position (with up/down indicator)
    - Top scorer
    - Clean sheets/Best bowler

3.  **Performance Chart Component**
    - Line chart showing performance over time
    - Area chart for cumulative stats
    - Comparison with league average (optional)

4.  **Roster Section** (Enhanced Grid)
    - Filters: Position, Status, Age Group
    - Sort: Name, Matches, Performance
    - Card layout with:
      - Player photo
      - Name, number, position
      - Key stat (matches/goals/wickets)
      - Mini performance indicator
    - Group by position/role

5.  **Match History Timeline**
    - Chronological list (latest first)
    - Cards showing:
      - Date, opponent, venue
      - Score/result with visual indicator (W/L/D)
      - Match highlights link
      - Key performers

6.  **Team Analytics Dashboard**
    - Performance radar chart (batting, bowling, fielding)
    - Player contribution pie chart
    - Form guide heatmap
    - Strengths & weaknesses cards

---

## 👤 PLAYER PROFILE REDESIGN

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Hero Section                                            │
│ ┌──────────┐ John Smith                    #15   Actions│
│ │  Photo   │ All-Rounder • Michaelhouse   [Edit]│
│ │ (large)  │ Age: 17 • RHB/RFM            [Compare]│
│ └──────────┘ Form: ▲▲▲▼▲                   [Export]│
├─────────────────────────────────────────────────────────┤
│ Quick Stats Cards (Scrollable horizontal on mobile)     │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│ │ 24   │ │ 487  │ │ 45.2 │ │ 18   │ │ 3.2  │          │
│ │Match │ │Runs  │ │ Avg  │ │Wck│ │Econ  │          │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘          │
├─────────────────────────────────────────────────────────┤
│ Tab Navigation                                          │
│ [Overview] [Stats] [Performance] [Career] [Training]    │
├─────────────────────────────────────────────────────────┤
│ TAB CONTENT                                             │
│ ┌────────────────────────┬─────────────────────┐       │
│ │ Performance Trends     │ Strengths Radar     │       │
│ │ (Multi-line chart)     │ (Skills pentagon)   │       │
│ ├────────────────────────┴─────────────────────┤       │
│ │ Recent Matches (Timeline with highlights)     │       │
│ └──────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

### Components to Build

1.  **Hero Card**
    - Large profile photo with status badge
    - Name, jersey number, position/role
    - Team affiliation (clickable)
    - Physical stats (age, batting/bowling style)
    - Recent form indicator (last 5 matches)
    - Quick stats strip below

2.  **Career Stats Grid** (2-3 columns)
    - Batting stats card (matches, runs, average, SR, 50s/100s)
    - Bowling stats card (wickets, average, economy, 5-fers)
    - Fielding stats card (catches, run-outs)
    - Each with comparative percentile bar

3.  **Performance Dashboard**
    - Time-series chart (runs/wickets over time)
    - Skills radar chart (6-8 attributes)
    - Form guide visualization
    - Season comparison table

4.  **Physical Attributes Card**
    - Height, weight (with icons)
    - Fitness score (progress ring)
    - Injury status
    - Physical test results (speed, strength)

5.  **Career Timeline**
    - Vertical timeline showing:
      - Debut match
      - Best performances (milestones)
      - Awards/achievements
      - Team changes
      - Notable moments

6.  **Training Tracker**
    - Session calendar heatmap
    - Progress bars for skill development
    - Training load vs performance correlation
    - Coach notes/feedback cards

7.  **Match-by-Match Breakdown** (Table/Cards)
    - Date, opponent, venue
    - Batting: runs, balls, SR, 4s/6s
    - Bowling: overs, runs, wickets, economy
    - Performance rating
    - Expandable for ball-by-ball data

---

## 🏫 SCHOOL PROFILE REDESIGN

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ School Banner (Cover Photo with overlay)               │
│ ┌──────┐ Michaelhouse                          Actions  │
│ │ Logo │ Est. 1896 • Balgowan, KZN            [Edit]   │
│ │ └──────┘ "Honor Through Truth"                [Follow] │
│ └──────┘                                                │
├─────────────────────────────────────────────────────────┤
│ Quick Stats                                             │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                    │
│ │ 12   │ │ 287  │ │ 5    │ │ 23   │                    │
│ │Teams │ │Plyr  │ │Staff │ │Titles│                    │
│ └──────┘ └──────┘ └──────┘ └──────┘                    │
├─────────────────────────────────────────────────────────┤
│ [Overview] [Teams] [People] [Achievements] [Facilities] │
├─────────────────────────────────────────────────────────┤
│ TAB CONTENT                                             │
│ ┌──────────────────────┬──────────────────────┐        │
│ │ Trophy Cabinet       │ Current Season       │        │
│ │ (Grid of achievements)│ Performance          │        │
│ ├──────────────────────┴──────────────────────┤        │
│ │ Teams Performance Comparison (Chart)         │        │
│ └──────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

### Components to Build

1.  **School Header**
    - Cover photo/banner
    - School logo (large, overlapping banner)
    - Name, establishment year, location
    - Motto (elegant typography)
    - School colors display

2.  **About Section**
    - Description/history
    - Contact information
    - Principal, sports director
    - Website, social links

3.  **Statistics Dashboard**
    - Total teams, players, staff
    - Championship titles
    - Recent achievements
    - League rankings

4.  **Teams Grid** (Enhanced)
    - Filter by division, season, age group
    - Card per team showing:
      - Team photo/logo
      - Division, season
      - W-L record
      - League position
      - Top performers

5.  **Trophy Cabinet**
    - Grid of achievements with:
      - Trophy icon/image
      - Championship name
      - Year won
      - Team/player
    - Timeline view option

6.  **Facilities Map**
    - List of fields/venues
    - Interactive map (optional)
    - Capacity, surface type, facilities
    - Available for booking indicator

7.  **People Directory**
    - Role-based tabs (Players, Coaches, Staff)
    - Searchable, filterable grid
    - Cards with photo, name, role, contact

---

## 🎨 Design System Additions

### New UI Components Needed

1.  **StatCard** - Displays single metric with label, icon, trend
2.  **PerformanceRing** - Circular progress for percentages
3.  **MiniChart** - Sparkline for trends in cards
4.  **FormIndicator** - W/L/D sequence visualizer
5.  **SkillRadar** - Pentagon/hexagon for skill visualization
6.  **Timeline** - Vertical event timeline
7.  **ComparisonBar** - Shows player vs average
8.  **HeatmapCalendar** - Training/activity calendar
9.  **LeaderboardList** - Ranked list with badges
10. **ActionBar** - Sticky action buttons (Edit, Share, etc.)

### Color/Visual Enhancements

-   **Performance colors**: Green (win/high), amber (avg), red (loss/low)
-   **Gradient cards**: Subtle gradients for stat cards
-   **Glassmorphism**: For overlay cards on images
-   **Shadows**: Layered shadows for depth
-   **Animations**: Micro-interactions (hover, expand, load)

---

## 🚀 Implementation Priority

### Phase 1: Core Components (Week 1)

-   [ ] StatCard component
-   [ ] Hero sections for all profiles
-   [ ] Tab navigation system
-   [ ] Basic data visualization (bar, line charts)
-   [ ] Responsive grid layouts

### Phase 2: Data Integration (Week 2)

-   [ ] Migrate to Firestore data
-   [ ] Add computed statistics functions
-   [ ] Performance trend calculations
-   [ ] Comparative analytics (averages, percentiles)

### Phase 3: Advanced Features (Week 3)

-   [ ] Skill radar charts
-   [ ] Timeline components
-   [ ] Heatmap calendars
-   [ ] Advanced filtering/sorting
-   [ ] Export/share functionality

### Phase 4: Polish (Week 4)

-   [ ] Animations and transitions
-   [ ] Loading states and skeletons
-   [ ] Error handling
-   [ ] Mobile optimization
-   [ ] Accessibility (ARIA, keyboard nav)

---

## 📱 Mobile Responsiveness

### Breakpoint Strategy

-   **Desktop (>1024px)**: Full 3-column layouts, side-by-side charts
-   **Tablet (768-1024px)**: 2-column, collapsible sidebars
-   **Mobile (<768px)**: Single column, horizontal scroll for stats, bottom sheet for filters

### Mobile-Specific Features

-   Swipeable tabs
-   Bottom navigation for actions
-   Collapsible sections
-   Horizontal scroll for stat cards
-   Pull-to-refresh

---

## 🔧 Technical Stack

### Charts & Visualization

-   **Recharts** (already installed): For line, bar, area charts
-   **React Vis** OR **Visx** (optional): For radar charts
-   **React Calendar Heatmap**: For training calendars

### State Management

-   React Server Components for initial data
-   Client components for interactivity
-   Local state for filters/tabs
-   React Query for data fetching (optional)

### Performance

-   Code splitting for tab content
-   Lazy loading for charts
-   Image optimization with next/image
-   Skeleton loaders for async data

---

## 📊 Sample Data Requirements

To showcase these designs, we need richer data:

### Team Extended Data

```typescript
interface TeamExtended {
  // Existing fields...
  statistics: {
    matchesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
    points: number;
    leaguePosition: number;
    totalFor: number; // Total runs/goals scored
    totalAgainst: number;
    form: ('W'|'L'|'D')[]; // Last 5 results
  };
  topPerformers: {
    topScorer: { personId: string; stat: number };
    topWicketTaker: { personId: string; stat: number };
    mvp: { personId: string };
  };
}
```

### Player Extended Data

```typescript
interface PlayerExtended {
  // Existing fields...
  careerStats: {
    batting: {
      matches: number;
      innings: number;
      runs: number;
      average: number;
      strikeRate: number;
      fifties: number;
      hundreds: number;
      highScore: number;
    };
    bowling: {
      matches: number;
      wickets: number;
      average: number;
      economy: number;
      strikeRate: number;
      fiveWickets: number;
      bestFigures: string;
    };
  };
  recentPerformance: MatchPerformance[]; // Last 10 matches
  skillsRating: {
    batting: number; // 0-100
    bowling: number;
    fielding: number;
    fitness: number;
    technique: number;
    mentality: number;
  };
}
```

---

## ✅ Success Metrics

The redesign is successful if:
- [ ] Users can find key information within 3 seconds
- [ ] Visual hierarchy guides attention naturally
- [ ] Data tells a story (trends, comparisons, context)
- [ ] Mobile experience is smooth and intuitive
- [ ] Load time < 2s for initial render
- [ ] Engagement increases (time on page, clicks)
- [ ] Positive user feedback on aesthetics and usability

---

## 📚 References & Inspiration

- **ESPN Player Profiles**: Clean hero sections, stat grids, performance charts
- **Cricinfo Player Pages**: Comprehensive career stats, match-by-match breakdown
- **Opta Sports**: Advanced analytics visualizations
- **FotMob**: Mobile-first design, smooth animations
- **SofaScore**: Real-time stats, clean typography, intuitive tabs

---

## 🎯 Next Steps

1. Get approval on design direction
2. Create Figma mockups (optional) OR start with component library
3. Build reusable components first (StatCard, Chart wrappers)
4. Implement one profile type fully as proof-of-concept
5. Iterate based on feedback
6. Roll out to remaining profile types

