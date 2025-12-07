# E2E Testing Status

## Current Status: ⚠️ In Progress

**Last Updated**: December 6, 2025

---

## Setup Complete ✅

- [x] **Test User Created**: `test-e2e@scrbrd.com` with System Architect role
- [x] **Playwright Configuration**: Timeouts increased to 60s, navigation timeout 30s
- [x] **Test Data Seeder**: Updated to handle multi-step MatchWizard

---

## Known Issues 🐛

### 1. Team Selection in MatchWizard
**Status**: ✅ RESOLVED
**Solution**: Added `data-testid` attributes to all selection components in MatchWizard and PlayerSelectionDialog.

**Changes Made**:
- Added `data-testid` to `SearchableSelect` component
- Updated `TeamSelectionWidget` to pass testId prefixes (`home-team-select`, `away-team-select`)
- Updated `PlayerSelectionDialog` with `data-testid` for striker, non-striker, and bowler selects
- Simplified `TestDataSeeder.selectTeam()` to use data-testid selectors

### 2. Test Suite Complexity
**Status**: ✅ IMPROVED
**Solution**: Created simplified test file `e2e/live-scoring-simplified.spec.ts`

**Recommendation**:
- Use `live-scoring-simplified.spec.ts` for quick validation
- Expand coverage incrementally after happy path works

---

## Recommended Approach

### Phase 1: Manual Verification (Recommended First)
Before running automated tests, manually verify the flow:

1. **Login** as `test-e2e@scrbrd.com` / `password123`
2. **Create Match** via `/matches/add`
   - Select two teams
   - Set date/time/venue
   - Complete wizard
3. **Navigate** to `/matches/[id]/manage`
4. **Record** a few balls
5. **Verify** real-time updates

### Phase 2: Simplified E2E Test
Create a single test that covers the critical path:

```typescript
test('Complete match flow - happy path', async ({ page }) => {
  // Login
  await login(page);
  
  // Create match (using UI or API)
  const matchId = await createMatchViaAPI(homeTeam, awayTeam);
  
  // Navigate to manage page
  await page.goto(`/matches/${matchId}/manage`);
  
  // Verify scoring works
  await page.click('button:has-text("Record Ball")');
  await page.click('button:has-text("4")');
  
  // Verify score updated
  await expect(page.locator('text=4 runs')).toBeVisible();
});
```

### Phase 3: Expand Coverage
Once the happy path works:
- Add tests for wickets
- Add tests for over completion
- Add tests for innings break
- Add tests for match completion

---

## Test Data

### Created Resources
- **Teams**: `Test Home XI`, `Test Away XI`
- **User**: `test-e2e@scrbrd.com` (System Architect)

### Cleanup Script Needed
Consider creating a cleanup script to remove test data:

```bash
npx tsx scripts/cleanup-test-data.ts
```

---

## Alternative: API-Based Setup

Instead of using the UI to create matches, consider:

1. **Create a test helper** that uses Firebase Admin SDK
2. **Seed test data** directly into Firestore
3. **Focus E2E tests** on the scoring interface only

This would make tests:
- Faster (no UI navigation for setup)
- More reliable (no dependency on wizard UI)
- Easier to maintain

---

## Next Actions

1. ✅ ~~Fix Build Error~~ *Completed*
2. ✅ ~~Add `data-testid` attributes to MatchWizard selects~~ *Completed*
3. ✅ ~~Simplify test suite to single happy path~~ *Completed*
4. ✅ ~~Add player creation to test setup~~ *Completed*
5. ✅ ~~Add cleanup strategy~~ *Completed*
6. ⏳ **Run simplified test and verify it passes**
7. ⏳ Expand test coverage incrementally

---

## Resources

- **Test Suite**: `/e2e/live-scoring-simplified.spec.ts` (NEW - Simplified)
- **Legacy Test Suite**: `/e2e/live-scoring.spec.ts` (500 lines - for reference)
- **Test Helper**: `/e2e/utils/seeder.ts`
- **Firebase Admin Utils**: `/e2e/utils/firebase-admin.ts` (NEW)
- **Playwright Config**: `/playwright.config.ts`
- **Testing Checklist**: `/LIVE_SCORING_TESTING.md`
