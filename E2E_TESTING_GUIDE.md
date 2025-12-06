# E2E Testing Guide

## Setup

1. **Environment Variables**: Create a `.env.test` file with test credentials:

   ```bash
   TEST_USER_EMAIL=test@scrbrd.com
   TEST_USER_PASSWORD=TestPassword123!
   ```

2. **Test Data**: Ensure your Firebase test project has:
   - At least 2 teams created
   - At least 11 players per team
   - Test user account with appropriate permissions

## Running Tests

### Run all tests

```bash
npx playwright test
```

### Run specific test file

```bash
npx playwright test e2e/live-scoring.spec.ts
```

### Run in headed mode (see browser)

```bash
npx playwright test --headed
```

### Run in debug mode

```bash
npx playwright test --debug
```

### Run specific test

```bash
npx playwright test -g "Ball-by-Ball Scoring"
```

## Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

## Test Structure

The test suite is organized into two main describe blocks:

### 1. Live Scoring Interface - Full Match Flow
- Pre-match flow (match creation, player selection)
- Live scoring (runs, extras, wickets)
- Over completion and bowler changes
- Wagon wheel shot placement
- Innings transitions
- Second innings and target chasing
- Undo functionality
- Real-time sync across tabs
- Match completion scenarios
- Analytics dashboards
- Mobile responsiveness
- Performance testing

### 2. Error Handling and Edge Cases
- State guards (accessing matches in wrong state)
- Missing player validation
- Data persistence across refreshes

## Important Notes

### Test Data IDs

The tests use `data-testid` attributes for reliable element selection. Ensure your components have these attributes:

```tsx
// Example in your components
<button data-testid="record-ball-button">Record Ball</button>
<div data-testid="current-score">{score}</div>
<div data-testid="wagon-wheel">...</div>
```

### Match IDs

Currently, tests use placeholder match IDs (`'test-match-id'`). In a real implementation, you should:

1. Create a test match in the `beforeEach` hook
2. Store the match ID
3. Use it throughout the test
4. Clean up in `afterEach`

Example:

```typescript
let testMatchId: string;

test.beforeEach(async ({ page }) => {
  await login(page);
  testMatchId = await createTestMatch(page);
});

test.afterEach(async ({ page }) => {
  await deleteTestMatch(page, testMatchId);
});
```

### Firebase Emulator (Recommended)

For consistent, isolated testing, use Firebase Emulator:

```bash
firebase emulators:start
```

Update your test environment to point to emulator:

```typescript
// In test setup
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
```

## Continuous Integration

Add to your CI pipeline (e.g., GitHub Actions):

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Tests timing out
- Increase timeout in `playwright.config.ts`: `timeout: 60000`
- Check if dev server is running
- Verify Firebase connection

### Element not found
- Add explicit waits: `await page.waitForSelector('[data-testid="element"]')`
- Check if element has correct `data-testid`
- Use `--headed` mode to see what's happening

### Flaky tests
- Add retry logic in config: `retries: 2`
- Use `waitForLoadState('networkidle')` before assertions
- Avoid hardcoded delays, use `waitFor` methods

## Next Steps

1. **Add Test Data Helpers**: Create utility functions to seed test data
2. **Implement Fixtures**: Use Playwright fixtures for common setup
3. **Add Visual Regression**: Use `toHaveScreenshot()` for UI consistency
4. **Expand Coverage**: Add tests for all edge cases in `LIVE_SCORING_TESTING.md`
