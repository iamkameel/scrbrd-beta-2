# SCRBRD Testing Checklist
**Last Updated**: December 6, 2025

This checklist tracks all testing activities needed before production deployment.

---

## 🧪 Manual Testing

### Authentication & User Management
- [ ] Sign up with new email
- [ ] Email verification flow
- [ ] Login with correct credentials
- [ ] Login with incorrect credentials (verify error message)
- [ ] Forgot password flow
- [ ] Password reset email received
- [ ] Logout functionality
- [ ] Session persistence (refresh page while logged in)
- [ ] Multi-role switching (System Architect)
- [ ] Role-based navigation visibility

**Status**: ⏳ Not Started  
**Priority**: High  
**Estimated Time**: 1 hour

---

### Live Scoring - Complete Match Flow
- [ ] **Pre-Match Setup**
  - [ ] Create new match via wizard
  - [ ] Select home and away teams
  - [ ] Set match details (date, venue, overs)
  - [ ] Navigate to match management page
  - [ ] Verify match details display correctly

- [ ] **First Innings**
  - [ ] Start match (opens player selection)
  - [ ] Select opening batsmen
  - [ ] Select opening bowler
  - [ ] Record dot ball (0 runs)
  - [ ] Record single (1 run)
  - [ ] Record boundary (4 runs)
  - [ ] Record six (6 runs)
  - [ ] Record wide
  - [ ] Record no-ball
  - [ ] Record wicket (caught, bowled, LBW, run out)
  - [ ] Verify new batsman selection dialog opens
  - [ ] Complete over (verify bowler change dialog)
  - [ ] Undo last ball
  - [ ] Retire batsman (hurt)
  - [ ] Verify wagon wheel updates
  - [ ] Verify pitch map updates
  - [ ] Verify scoreboard updates in real-time
  - [ ] Complete innings (10 wickets or overs complete)

- [ ] **Innings Break**
  - [ ] Verify innings break screen shows
  - [ ] Verify target is calculated correctly
  - [ ] Start second innings

- [ ] **Second Innings**
  - [ ] Select opening batsmen for chasing team
  - [ ] Select opening bowler
  - [ ] Record balls until target reached
  - [ ] Verify match completion when target reached
  - [ ] Verify winner is determined correctly

- [ ] **Match Completion**
  - [ ] Verify match summary displays
  - [ ] Verify result is saved
  - [ ] Navigate to match detail page
  - [ ] Verify scorecard is complete
  - [ ] Verify analytics are generated

**Status**: ⏳ Not Started  
**Priority**: Critical  
**Estimated Time**: 2-3 hours

---

### Mobile Responsiveness
- [ ] **iPhone (iOS)**
  - [ ] Dashboard loads correctly
  - [ ] Live scoring interface is usable
  - [ ] Touch targets are adequate (min 44x44px)
  - [ ] Dialogs are readable
  - [ ] Tables scroll horizontally
  - [ ] Navigation menu works
  - [ ] Forms are usable

- [ ] **Android Phone**
  - [ ] Dashboard loads correctly
  - [ ] Live scoring interface is usable
  - [ ] Touch targets are adequate
  - [ ] Dialogs are readable
  - [ ] Tables scroll horizontally
  - [ ] Navigation menu works
  - [ ] Forms are usable

- [ ] **Tablet (iPad/Android)**
  - [ ] Layout adapts correctly
  - [ ] All features accessible
  - [ ] No UI breaking issues

**Status**: ⏳ Not Started  
**Priority**: High  
**Estimated Time**: 2 hours  
**Devices Needed**: iPhone, Android phone, iPad/tablet

---

### Player & Profile Management
- [ ] Create new player profile
- [ ] Edit player profile
- [ ] Add player attributes (batting, bowling)
- [ ] Upload player photo
- [ ] View player profile
- [ ] Delete player profile
- [ ] Create coach profile
- [ ] Edit coach attributes
- [ ] Create umpire profile
- [ ] Create scorer profile
- [ ] Create medical staff profile
- [ ] Create groundskeeper profile
- [ ] Switch between profile types
- [ ] Verify role-specific attributes display correctly

**Status**: ⏳ Not Started  
**Priority**: Medium  
**Estimated Time**: 1.5 hours

---

### Team Management
- [ ] Create new team
- [ ] Edit team details
- [ ] Add players to team roster
- [ ] Remove players from team
- [ ] Assign captain
- [ ] Assign vice-captain
- [ ] View team analytics
- [ ] Delete team
- [ ] Search teams
- [ ] Filter teams by division/league
- [ ] Switch view modes (List/Grid/Table)

**Status**: ⏳ Not Started  
**Priority**: Medium  
**Estimated Time**: 1 hour

---

### Analytics & Reporting
- [ ] View analytics dashboard
- [ ] Filter by date range
- [ ] Filter by season
- [ ] Filter by division
- [ ] Filter by team
- [ ] Export to CSV
- [ ] Share stats (copy to clipboard)
- [ ] Print match report
- [ ] View wagon wheel
- [ ] View pitch map
- [ ] View Manhattan chart
- [ ] View worm graph
- [ ] View partnership cards

**Status**: ⏳ Not Started  
**Priority**: Medium  
**Estimated Time**: 1 hour

---

### Financial Management
- [ ] Create income transaction
- [ ] Create expense transaction
- [ ] Edit transaction
- [ ] Delete transaction
- [ ] Filter transactions by date
- [ ] Filter by type (income/expense)
- [ ] View financial dashboard
- [ ] Add sponsor
- [ ] Edit sponsor details
- [ ] Export financial data

**Status**: ⏳ Not Started  
**Priority**: Low  
**Estimated Time**: 30 minutes

---

### Venue & Field Management
- [ ] Create new field/venue
- [ ] Edit field details
- [ ] Add facilities (lights, covers, etc.)
- [ ] Set capacity
- [ ] View field details
- [ ] Delete field
- [ ] Search fields
- [ ] Filter fields by location

**Status**: ⏳ Not Started  
**Priority**: Low  
**Estimated Time**: 30 minutes

---

### Logistics
- [ ] **Equipment**
  - [ ] Add equipment item
  - [ ] Edit equipment
  - [ ] Assign to player
  - [ ] Track condition
  - [ ] Delete equipment

- [ ] **Transport**
  - [ ] Add vehicle
  - [ ] Schedule trip
  - [ ] Assign driver
  - [ ] View transport schedule

**Status**: ⏳ Not Started  
**Priority**: Low  
**Estimated Time**: 30 minutes

---

## 🤖 Automated Testing (E2E)

### Playwright Tests
- [ ] **Setup**
  - [x] Install Playwright
  - [x] Configure playwright.config.ts
  - [x] Create test user
  - [x] Create test data seeder
  - [ ] Fix team selection in MatchWizard

- [ ] **Test Suites**
  - [ ] Authentication flow
  - [ ] Match creation (happy path)
  - [ ] Live scoring (simplified)
  - [ ] Player management
  - [ ] Team management

**Status**: ⏳ In Progress (Debugging)  
**Priority**: High  
**Estimated Time**: 4-6 hours  
**Blockers**: Team selection dropdown interaction

---

## 🔬 Unit Testing

### Component Tests (Not Started)
- [ ] Set up Jest/Vitest
- [ ] Test utility functions
- [ ] Test form validation
- [ ] Test data transformations
- [ ] Test hooks (useLiveScore, etc.)

**Status**: ❌ Not Started  
**Priority**: Medium  
**Estimated Time**: 8-10 hours

---

## 🔗 Integration Testing

### API/Server Action Tests (Not Started)
- [ ] Test matchActions
- [ ] Test personActions
- [ ] Test teamActions
- [ ] Test analyticsActions
- [ ] Test Firestore operations

**Status**: ❌ Not Started  
**Priority**: Medium  
**Estimated Time**: 6-8 hours

---

## ⚡ Performance Testing

### Load Testing (Not Started)
- [ ] Test with 100 concurrent users
- [ ] Test with 1000 matches in database
- [ ] Test real-time sync with multiple clients
- [ ] Measure Firestore read/write costs
- [ ] Benchmark page load times
- [ ] Analyze bundle size

**Status**: ❌ Not Started  
**Priority**: Low  
**Estimated Time**: 4-6 hours

---

## 🔒 Security Testing

### Security Audit (Not Started)
- [ ] Test Firestore security rules
- [ ] Test authentication bypass attempts
- [ ] Test authorization (role-based access)
- [ ] Test input validation
- [ ] Test XSS vulnerabilities
- [ ] Test CSRF protection
- [ ] Test SQL injection (N/A for Firestore)

**Status**: ❌ Not Started  
**Priority**: High  
**Estimated Time**: 4-6 hours

---

## 🌐 Browser Compatibility

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] Safari iOS (latest)
- [ ] Chrome Android (latest)
- [ ] Samsung Internet

**Status**: ⏳ Not Started  
**Priority**: Medium  
**Estimated Time**: 2 hours

---

## ♿ Accessibility Testing

### WCAG 2.1 Compliance
- [ ] Keyboard navigation
- [ ] Screen reader compatibility (NVDA/JAWS)
- [ ] Color contrast ratios
- [ ] ARIA labels
- [ ] Focus indicators
- [ ] Alt text for images

**Status**: ❌ Not Started  
**Priority**: Medium  
**Estimated Time**: 3-4 hours

---

## 📊 Testing Summary

| Category | Status | Priority | Est. Time | Completion |
|----------|--------|----------|-----------|------------|
| Manual Testing | ⏳ Not Started | High | 8-10 hours | 0% |
| E2E Testing | ⏳ In Progress | High | 4-6 hours | 20% |
| Unit Testing | ❌ Not Started | Medium | 8-10 hours | 0% |
| Integration Testing | ❌ Not Started | Medium | 6-8 hours | 0% |
| Performance Testing | ❌ Not Started | Low | 4-6 hours | 0% |
| Security Testing | ❌ Not Started | High | 4-6 hours | 0% |
| Browser Compatibility | ⏳ Not Started | Medium | 2 hours | 0% |
| Accessibility | ❌ Not Started | Medium | 3-4 hours | 0% |

**Total Estimated Time**: 40-54 hours  
**Overall Completion**: ~5%

---

## 🎯 Recommended Testing Order

### Phase 1: Critical Path (Week 1)
1. ✅ Fix dashboard issues - **COMPLETED**
2. 🔥 Manual testing - Live scoring complete flow
3. 📱 Mobile responsiveness - iOS/Android
4. 🤖 E2E testing - Single happy path working

**Goal**: Verify core functionality works end-to-end

### Phase 2: Comprehensive (Week 2)
5. 🧪 Manual testing - All features
6. 🤖 E2E testing - Expand test coverage
7. 🔒 Security testing - Basic audit
8. 🌐 Browser compatibility - Major browsers

**Goal**: Ensure all features work across platforms

### Phase 3: Quality Assurance (Week 3)
9. 🔬 Unit testing - Critical functions
10. 🔗 Integration testing - Server actions
11. ♿ Accessibility testing - WCAG compliance
12. ⚡ Performance testing - Load and optimization

**Goal**: Production-ready quality

---

## 📝 Testing Notes

### Test Environment
- **URL**: http://localhost:3000
- **Test User**: test-e2e@scrbrd.com / password123
- **Firebase Project**: scrbrd-beta-2 (development)

### Test Data
- **Teams**: Test Home XI, Test Away XI
- **Players**: 22 test players (11 per team)
- **Matches**: Created via seeder or UI

### Known Issues During Testing
1. Team selection dropdown in MatchWizard (E2E tests)
2. Build error in test script (non-blocking)
3. ESLint configuration (non-blocking)

### Testing Tools
- **E2E**: Playwright
- **Unit**: Jest/Vitest (to be set up)
- **Performance**: Lighthouse, Chrome DevTools
- **Accessibility**: axe DevTools, WAVE

---

## ✅ Testing Sign-Off

### Manual Testing
- [ ] Signed off by: _______________
- [ ] Date: _______________
- [ ] Notes: _______________

### Automated Testing
- [ ] Signed off by: _______________
- [ ] Date: _______________
- [ ] Notes: _______________

### Security Testing
- [ ] Signed off by: _______________
- [ ] Date: _______________
- [ ] Notes: _______________

### Performance Testing
- [ ] Signed off by: _______________
- [ ] Date: _______________
- [ ] Notes: _______________

---

**Next Update**: After completing Phase 1 testing

*Track progress by checking off items as they are completed.*
