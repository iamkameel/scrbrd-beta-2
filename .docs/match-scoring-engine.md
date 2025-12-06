# Match Scoring Engine with Wagon Wheel Technology

## Overview

Complete live match scoring system with **interactive wagon wheel** for recording shot placement. This allows scorers to capture detailed ball-by-ball data during matches.

---

## 🎯 Two Wagon Wheel Technologies

### 1. **Wagon Wheel Scorer** (Input Tool) ✅ NEW

**Purpose:** Live scoring during matches  
**Location:** `/src/components/scoring/WagonWheelScorer.tsx`

**Features:**
- ✅ Interactive cricket field diagram
- ✅ Click/tap to record shot placement
- ✅ Real-time coordinate calculation
- ✅ Visual feedback on click
- ✅ Hover preview
- ✅ Automatic angle & distance capture (0-360°, 0-100%)
- ✅ Field zones labeled (Off, Leg, Third, Fine)
- ✅ Inner circle (30-yard boundary)
- ✅ Pitch visualization
- ✅ Disabled state support

### 2. **Wagon Wheel Chart** (Analytics Tool) ✅ EXISTING

**Purpose:** Post-match analysis and visualization  
**Location:** `/src/components/charts/WagonWheel.tsx`

**Features:**
- ✅ Visual representation of all shots
- ✅ Color-coded by runs (4s, 6s, wickets, runs)
- ✅ Filterable (All, Fours, Sixes, Wickets, Singles)
- ✅ Displays shot patterns
- ✅ Used in match analytics tab

---

## 🏏 Complete Scoring Interface

### **MatchScoringInterface Component**

**Location:** `/src/components/scoring/MatchScoringInterface.tsx`

#### **Runs Selector**
- Large buttons: 0, 1, 2, 3, 4, 6, W
- Color-coded: 4s (blue), 6s (purple), W (red)
- Selected state highlighting
- One-click scoring

#### **Extras Management**
- Wide (1 run + ball not counted)
- No Ball (1 run + ball not counted + free hit)
- Bye (runs to batting team, not batsman)
- Leg Bye (runs off body/pads)

#### **Shot Type Recording** (Optional)
Dropdown with 12 shot types:
- Drive, Cut, Pull, Hook
- Sweep, Flick, Glance, Loft
- Paddle, Reverse, Slog, Block

#### **Wicket Types**
- Bowled, Caught, LBW, Run Out
- Stumped, Hit Wicket
- Caught & Bowled, Retired

#### **Ball-by-Ball Display**
- Current over shows all balls
- Color-coded badges (W=red, runs=gray)
- Symbols: W, •(dot), 1, 2, 3, 4, 6, wd, nb, b, lb
- Last 3 overs history

#### **Score Display**
- Large score: Total/Wickets
- Overs: Completed.Balls
- Real-time updates

#### **Controls**
- **Record Ball** - Save current ball
- **Undo** - Remove last ball
- **Pause/Play** - Pause scoring
- **Save** - Save match state
- **Show/Hide Wagon Wheel** - Toggle field diagram

---

## 📊 Data Capture

### Ball Object

```typescript
{
  runs: number,                    // 0-6
  extras?: number,                 // Extra runs
  extrasType?: 'wide' | 'noball' | 'bye' | 'legbye',
  isWicket: boolean,
  wicketType?: string,             // 'Bowled', 'Caught', etc.
  shotAngle?: number,              // 0-360° (from wagon wheel)
  shotDistance?: number,           // 0-100% (from wagon wheel)
  shotType?: string,               // 'Drive', 'Cut', etc.
  batsmanId?: string,
  bowlerId?: string
}
```

### Over Object

```typescript
{
  balls: Ball[],
  overNumber: number
}
```

### Innings Object

```typescript
{
  overs: Over[],
  totalRuns: number,
  wickets: number,
  currentBatsmen: string[],
  currentBowler: string
}
```

---

## 🎮 How to Use

### **Accessing the Scorer**

1. Navigate to any match: `/matches/[id]`
2. Click "Start Scoring" or go to `/matches/[id]/score`
3. Scoring interface loads with match details

### **Recording a Ball**

#### Method 1: Simple Scoring (No Shot Placement)
1. Select runs (0, 1, 2, 3, 4, 6) or W
2. (Optional) Select shot type from dropdown
3. Click "Record Ball"

#### Method 2: With Wagon Wheel (Shot Placement)
1. Click "Show Wagon Wheel"
2. Select runs (0, 1, 2, 3, 4, 6) or W
3. **Click on the field** where the ball went
4. Coordinates auto-captured
5. (Optional) Select shot type
6. Click "Record Ball"

#### Recording Extras
1. Click extras button (Wide, No Ball, Bye, Leg Bye)
2. Runs auto-set (usually 1, adjust if needed)
3. Click "Record Ball"

### **Over Management**
- System auto-tracks 6 legal balls per over
- Wides & No Balls don't count toward over
- After 6th ball, over completes automatically
- New over starts fresh

### **Corrections**
- Click **Undo** to remove last ball
- Make corrections before recording next ball
- Can undo multiple times (goes back ball-by-ball)

---

## 🎨 Wagon Wheel Scoring Details

### **Field Layout**
- **Center:** Pitch (batsman's position)
- **Top:** Off side
- **Bottom:** Leg side
- **Left:** Third man region
- **Right:** Fine leg region

### **How It Works**
1. Click anywhere on the field diagram
2. System calculates:
   - **Angle:** Direction of shot (0° = straight, clockwise)
   - **Distance:** How far it went (% of boundary)
3. Green line + dot shows where you clicked
4. Blue preview line shows hover position

### **Visual Feedback**
- **Hover:** Blue dashed line + circle
- **Recorded:** Green solid line + pulsing circle
- **Info Box:** Shows exact angle & distance

### **Coordinates**
- Angle: 0-360° (0° = top/off, 90° = right/fine, 180° = bottom/leg, 270° = left/third)
- Distance: 0-100% (0 = pitch, 100 = boundary)

---

## 🔄 Data Flow

```
1. Scorer clicks runs/wicket/extras
2. (Optional) Scorer clicks field to record placement
3. Wagon Wheel captures angle & distance
4. Shot type selected from dropdown
5. "Record Ball" clicked
6. Ball object created with all data
7. Added to current over
8. Score updated (runs, wickets)
9. Check if over complete (6 legal balls)
10. If complete, move to overs history
11. UI updates with latest state
12. Ready for next ball
```

---

## 📱 Features

### **Real-Time Scoring**
- Instant score updates
- Live over tracking
- Running totals

### **Rich Data Capture**
- Runs scored
- Shot placement (angle + distance)
- Shot type classification
- Wicket details
- Extras breakdown

### **User-Friendly Interface**
- Large touch-friendly buttons
- Visual feedback
- Clear state indicators
- Undo capability
- Pause/resume

### **Analytics Ready**
- All data feeds into wagon wheel chart
- Ball-by-ball history
- Shot distribution analysis
- Over-by-over breakdown

---

## 🚀 Future Enhancements

### Phase 1: Enhanced Scoring
- [ ] Batsman selector (striker/non-striker)
- [ ] Bowler selector
- [ ] Fielder selector (for catches/run outs)
- [ ] Player autocomplete

### Phase 2: Advanced Features
- [ ] Partnership tracking
- [ ] Run rate calculator
- [ ] Required run rate (chasing)
- [ ] Powerplay indicators
- [ ] Free hit tracking (after no ball)

### Phase 3: Live Features
- [ ] Real-time sync to database
- [ ] Multiple scorer support
- [ ] Commentary input field
- [ ] Umpire review system
- [ ] DRS integration

### Phase 4: Analytics
- [ ] Live wagon wheel chart update
- [ ] Manhattan chart (runs per over)
- [ ] Worm chart (cumulative)
- [ ] Bowling analysis
- [ ] Pitch map

### Phase 5: Broadcasting
- [ ] Live scoreboard display
- [ ] Mobile scorer app
- [ ] Tablet optimization
- [ ] Voice commands
- [ ] API for scoreboards

---

## 🎯 Use Cases

### **School Matches**
- Simple scoring for junior cricket
- Training tool for student scorers
- Data for player development

### **Club Cricket**
- Professional-grade scoring
- Detailed analytics
- Historical data

### **Leagues & Tournaments**
- Consistent data format
- Multi-match tracking
- Leaderboards & stats

### **Coaching**
- Player analysis
- Shot selection review
- Weakness identification
- Training focus areas

---

## 📖 Examples

### Example 1: Scoring a Boundary

```
1. Batsman hits a four through covers
2. Scorer clicks "4" button (blue)
3. Scorer shows wagon wheel
4. Clicks on field: mid-off area
5. Selects shot type: "Drive"
6. Clicks "Record Ball"
7. Result: {
     runs: 4,
     shotAngle: 45,
     shotDistance: 95,
     shotType: "Drive"
   }
```

### Example 2: Wicket

```
1. Bowled!
2. Scorer clicks "W" button (red)
3. Wicket type auto-set to "Bowled"
4. Clicks "Record Ball"
5. Result: {
     runs: 0,
     isWicket: true,
     wicketType: "Bowled"
   }
```

### Example 3: Wide + Runs

```
1. Bowler bowls wide, batsman scores 3 runs
2. Scorer clicks "Wide" button
3. Manually adjust runs to 4 (1 wide + 3 runs)
4. Clicks "Record Ball"
5. Result: {
     runs: 4,
     extrasType: "wide",
     extras: 4
   }
6. Ball NOT counted in over
```

---

## 🎨 UI Components

### Created Files
1. **WagonWheelScorer.tsx** - Interactive field diagram
2. **MatchScoringInterface.tsx** - Complete scoring UI
3. **page.tsx** (`/matches/[id]/score`) - Scoring page

### Updated Files
- Match detail page can link to `/matches/[id]/score`

### Dependencies
- Lucide icons (already installed)
- ShadCN UI components (already installed)
- Tailwind CSS (already configured)

---

## 🔗 Integration Points

### **From Match Page**
Add "Start Scoring" button:

```tsx
<Link href={`/matches/${matchId}/score`}>
  <Button>Start Live Scoring</Button>
</Link>
```

### **Save to Firestore**
Extend Match interface:

```typescript
{
  // ... existing fields
  ballByBall: {
    innings1: Innings,
    innings2?: Innings
  }
}
```

### **Feed to Analytics**
Wagon wheel chart reads same data:

```typescript
<WagonWheel innings={match.ballByBall.innings1} />
```

---

## ✅ Summary

You now have a **complete match scoring engine** with:

✅ **Interactive wagon wheel** for shot placement  
✅ **Full scoring interface** (runs, wickets, extras)  
✅ **Ball-by-ball tracking** with rich data  
✅ **Real-time score updates**  
✅ **Shot type classification**  
✅ **Undo/redo capability**  
✅ **Over management** (auto-complete at 6 balls)  
✅ **Match summary** (last 3 overs)  
✅ **Pause/resume** functionality  
✅ **Analytics-ready data** for wagon wheel chart  

The scorer can now capture **every detail** of every ball, including exactly where it went on the field! 🏏🎯
