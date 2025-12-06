# Live Scoring Interface - Testing Checklist

## Status: Feature Complete ✅

The live scoring interface is feature-complete and ready for end-to-end testing. All scoring functionality has been consolidated into `/matches/[id]/manage`.

---

## Route Consolidation

- ✅ **Primary Route**: `/matches/[id]/manage` (Full-featured dashboard)
- ✅ **Legacy Route**: `/matches/[id]/score` → **DEPRECATED** (redirects to `/manage`)

---

## Pre-Match Flow

### 1. Match Creation
- [ ] Navigate to Matches page
- [ ] Create a new match with two teams
- [ ] Verify match appears with `SCHEDULED` state

### 2. Pre-Match Setup
- [ ] Navigate to `/matches/[id]/pre-match`
- [ ] Select Playing XI for both teams
- [ ] Verify Pitch Report & Weather fields
- [ ] Set Batting Order (drag-and-drop)
- [ ] Click "Start Match" → should transition to `LIVE` state

---

## Live Scoring - First Innings

### 3. Initial State
- [ ] Verify Live Scoreboard displays:
  - Score: 0/0
  - Overs: 0.0
  - Run Rate: 0.00
- [ ] Check "Recent Balls" section is empty
- [ ] Verify "Players" dialog auto-opens if no batsmen/bowler selected

### 4. Player Selection
- [ ] Open "Players" dialog
- [ ] Select Striker (should show batting order)
- [ ] Select Non-Striker
- [ ] Select Bowler
- [ ] Verify selections appear in scoreboard

### 5. Ball-by-Ball Scoring
- [ ] Click "Record Ball" → Opens Scoring Dialog
- [ ] Test each run option: 0, 1, 2, 3, 4, 6
  - [ ] Verify score updates in real-time
  - [ ] Check badge appears in "Recent Balls"
  - [ ] Confirm boundaries have colored badges (4=blue, 6=purple)
- [ ] Test Extras:
  - [ ] Wide (adds 1 run, doesn't count as legal ball)
  - [ ] No-Ball (adds 1 run, doesn't count as legal ball)
  - [ ] Bye
  - [ ] Leg-Bye

### 6. Shot Placement (Wagon Wheel)
- [ ] Navigate to "Field & Shots" tab
- [ ] Click on Wagon Wheel to record shot location
- [ ] Verify shot appears on chart with correct runs/color
- [ ] Switch back to "Recent Balls" → shot coordinates saved

### 7. Wicket Handling
- [ ] Click "Record Ball" → Select Wicket (W)
- [ ] Choose wicket type (Bowled, Caught, LBW, etc.)
- [ ] For Caught/Stumped/Run Out: Select fielder
- [ ] Verify:
  - [ ] Wickets count increments
  - [ ] "New Batsman" dialog auto-opens
  - [ ] Next batsman suggestion follows batting order
- [ ] Select new batsman → Resume scoring

### 8. Over Completion
- [ ] Score 6 legal balls (extras don't count)
- [ ] Verify:
  - [ ] "New Bowler" dialog auto-opens
  - [ ] Previous bowler is excluded from options
  - [ ] Current over moves to "Match Progress" history
- [ ] Select new bowler → Continue scoring

### 9. End of Innings Triggers
Test both automatic and manual endings:

#### Auto-Trigger: All Out (10 wickets)
- [ ] Score until 10 wickets fall
- [ ] Verify automatic "End Innings" prompt

#### Auto-Trigger: Overs Complete
- [ ] Score until `match.overs` limit reached (e.g., 20 overs)
- [ ] Verify automatic "End Innings" toast

#### Manual Trigger
- [ ] Click "End Innings" button
- [ ] Confirm dialog → Verify:
  - [ ] Match transitions to `INNINGS_BREAK` state
  - [ ] Target is calculated (Innings 1 runs + 1)
  - [ ] Second innings setup is prompted

---

## Innings Break

### 10. Between Innings
- [ ] Verify UI shows:
  - [ ] "Innings Break" message
  - [ ] Target score displayed prominently
  - [ ] "Start Second Innings" button enabled
- [ ] Click "Start Second Innings"
- [ ] Verify:
  - [ ] Match transitions to `LIVE` state
  - [ ] Innings number updates to 2
  - [ ] Score resets to 0/0
  - [ ] "Players" dialog opens for new batting team

---

## Live Scoring - Second Innings

### 11. Chasing Target
- [ ] Select batsmen and bowler for second innings
- [ ] Score runs normally
- [ ] Verify:
  - [ ] Target display shows runs needed
  - [ ] Required Run Rate (RRR) updates dynamically
  - [ ] Partnership stats track correctly

### 12. Match Completion Scenarios

#### Scenario A: Target Reached
- [ ] Score runs until target is reached
- [ ] Verify:
  - [ ] Auto-trigger "End Match" dialog
  - [ ] Winner is batting team
  - [ ] Margin is "X wickets remaining"

#### Scenario B: All Out (Chasing)
- [ ] Lose 10 wickets before reaching target
- [ ] Verify:
  - [ ] Auto-trigger "End Match" dialog
  - [ ] Winner is bowling/first innings team
  - [ ] Margin is "X runs"

#### Scenario C: Overs Complete (Target Not Reached)
- [ ] Complete all overs without reaching target
- [ ] Verify:
  - [ ] Auto-trigger "End Match" dialog
  - [ ] Winner is first innings team
  - [ ] Margin is "X runs"

#### Scenario D: Manual End Match
- [ ] Click "End Match" button
- [ ] Fill in result manually
- [ ] Verify match transitions to `COMPLETED` state

---

## Post-Match

### 13. Match Completion
- [ ] Verify match state is `COMPLETED`
- [ ] Navigate to `/matches/[id]` (match detail page)
- [ ] Verify:
  - [ ] Full scorecard displays correctly
  - [ ] Ball-by-ball commentary is accurate
  - [ ] Wagon Wheel shows all shots from both innings
  - [ ] Manhattan Chart displays over-by-over runs
  - [ ] Worm Graph shows cumulative run chase
  - [ ] Partnership cards show all partnerships

---

## Advanced Features

### 14. Undo Functionality
- [ ] Record a ball
- [ ] Click "Undo" button
- [ ] Verify:
  - [ ] Last ball is removed from "Recent Balls"
  - [ ] Score decrements correctly
  - [ ] Undo available only when balls exist

### 15. Retire Batter
- [ ] Click "Retire Batter" button
- [ ] Select striker or non-striker
- [ ] Choose: "Retired Hurt" or "Retired Out"
- [ ] Verify:
  - [ ] Batter removed from crease
  - [ ] "New Batsman" dialog opens
  - [ ] Retired batter can return later (if Hurt)

### 16. Real-Time Sync
- [ ] Open match in two browser tabs
- [ ] Score a ball in Tab 1
- [ ] Verify:
  - [ ] Tab 2 updates instantly (via Firestore listener)
  - [ ] No page refresh needed
  - [ ] Both tabs show identical state

### 17. Analytics Dashboard
- [ ] Navigate to "Field & Shots" → "Pitch Map"
- [ ] Verify bowling line & length heatmap displays
- [ ] Check ball colors match runs (boundaries highlighted)
- [ ] Test Wagon Wheel interactive selection

---

## Error Handling

### 18. State Guards
- [ ] Try accessing `/matches/[id]/manage` when match is `SCHEDULED`
  - [ ] Should show error message + redirect to details
- [ ] Try accessing when match is `COMPLETED`
  - [ ] Should show "Match Finished" message
- [ ] Try accessing when match is `CANCELLED`
  - [ ] Should show cancellation notice

### 19. Missing Players
- [ ] Start scoring without selecting bowler
- [ ] Verify "Record Ball" button is disabled
- [ ] Select bowler → button enables

### 20. Connection Loss
- [ ] Disconnect network during scoring
- [ ] Verify "Offline" indicator (if implemented)
- [ ] Reconnect → data syncs correctly

---

## Performance

### 21. Large Match Data
- [ ] Score a full 20-over match (120 balls minimum)
- [ ] Verify:
  - [ ] UI remains responsive
  - [ ] Charts render without lag
  - [ ] No memory leaks in console

---

## Regression Tests

### 22. UI Responsiveness
- [ ] Test on mobile viewport (375px)
  - [ ] Scoring buttons are large enough
  - [ ] Wagon Wheel is tap-friendly
  - [ ] Dialogs are scrollable
- [ ] Test on tablet (768px)
- [ ] Test on desktop (1920px)

### 23. Data Persistence
- [ ] Close browser mid-match
- [ ] Reopen → verify scoring state is preserved
- [ ] Continue scoring seamlessly

---

## Known Issues / Future Enhancements

### Potential Improvements
- [ ] **Player Stats Auto-Update**: Live batting/bowling averages during match
- [ ] **Commentary AI**: Auto-generate commentary from shot type + runs
- [ ] **Video Integration**: Attach video clips to specific balls
- [ ] **Strike Rotation**: Auto-swap striker/non-striker on odd runs
- [ ] **Bowling Analysis**: Economy rate, strike rate per bowler
- [ ] **Timeout/DRS**: Add support for match events (reviews, rain delays)

---

## Sign-Off

| Test Phase | Status | Tester | Date |
|------------|--------|--------|------|
| Pre-Match Flow | ⏳ Pending | - | - |
| First Innings Scoring | ⏳ Pending | - | - |
| Innings Break | ⏳ Pending | - | - |
| Second Innings Scoring | ⏳ Pending | - | - |
| Match Completion | ⏳ Pending | - | - |
| Advanced Features | ⏳ Pending | - | - |
| Error Handling | ⏳ Pending | - | - |
| Performance | ⏳ Pending | - | - |

---

## Notes
- All tests should be run against a **real Firebase instance** (not mocks)
- Use a dedicated test project to avoid polluting production data
- Document any bugs in GitHub Issues with `bug` label
- Screenshots/videos of critical flows are highly recommended
