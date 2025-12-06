---
description: Set up Playwright for End-to-End Testing
---
# Setup E2E Testing

1. Install Playwright and its dependencies:

   ```bash
   npm init playwright@latest
   ```

   - Choose `TypeScript`
   - Choose `e2e` as the tests folder
   - Add a GitHub Actions workflow? (Optional, say No for now)
   - Install Playwright browsers? (Yes)

2. Create a test file `e2e/live-scoring.spec.ts` that implements the flows from `LIVE_SCORING_TESTING.md`.

3. Configure `playwright.config.ts` to use the local dev server (`http://localhost:3000`).

4. Run the tests:

   ```bash
   npx playwright test
   ```
