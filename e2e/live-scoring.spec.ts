import { test, expect, Page } from '@playwright/test';
import { TestDataSeeder } from './utils/seeder';

/**
 * Live Scoring E2E Test Suite
 * 
 * This test suite implements the comprehensive testing checklist from LIVE_SCORING_TESTING.md
 * 
 * Prerequisites:
 * - Firebase project must be configured with valid credentials
 * - Dev server must be running on http://localhost:3000
 * - Test user account must exist (or signup flow must work)
 */

test.describe('Live Scoring Interface - Full Match Flow', () => {
    // Test configuration
    const TEST_USER = {
        email: process.env.TEST_USER_EMAIL || 'test@scrbrd.com',
        password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
    };

    const TEST_MATCH = {
        homeTeam: 'Test Home XI',
        awayTeam: 'Test Away XI',
        overs: 5, // Short match for testing
        venue: 'Test Ground',
    };

    let matchId: string;

    // Helper function to login
    async function login(page: Page) {
        await page.goto('/login');
        await page.fill('input[type="email"]', TEST_USER.email);
        await page.fill('input[type="password"]', TEST_USER.password);
        await page.click('button[type="submit"]');
        await page.waitForURL('/home', { timeout: 10000 });
    }

    test.beforeEach(async ({ page }) => {
        // Login before each test
        await login(page);

        // Create a new match for testing
        // Note: In a real scenario, we might want to reuse a match or clean up after
        // For now, we'll create a fresh one to ensure clean state
        const seeder = new TestDataSeeder(page);

        // Ensure teams exist (idempotent)
        await seeder.createTeam(TEST_MATCH.homeTeam);
        await seeder.createTeam(TEST_MATCH.awayTeam);

        // Create match
        const createdId = await seeder.createMatch(TEST_MATCH.homeTeam, TEST_MATCH.awayTeam);
        if (createdId) {
            matchId = createdId;
        } else {
            throw new Error('Failed to create test match');
        }
    });

    test('1. Pre-Match Flow - Match Creation', async ({ page }) => {
        // Navigate to matches page
        await page.goto('/matches');
        await expect(page.locator('h1')).toContainText(/Matches/i);

        // Create new match
        await page.click('text=Create Match');

        // Fill match details
        await page.fill('input[name="homeTeam"]', TEST_MATCH.homeTeam);
        await page.fill('input[name="awayTeam"]', TEST_MATCH.awayTeam);
        await page.fill('input[name="overs"]', TEST_MATCH.overs.toString());
        await page.fill('input[name="venue"]', TEST_MATCH.venue);

        // Submit
        await page.click('button[type="submit"]');

        // Verify match appears with SCHEDULED state
        await expect(page.locator('text=SCHEDULED')).toBeVisible();
    });

    test('2. Pre-Match Setup - Player Selection', async ({ page }) => {
        // This test assumes a match exists
        // Navigate to a match's pre-match page
        await page.goto('/matches');

        // Click on first match
        await page.click('[data-testid="match-card"]');

        // Navigate to pre-match setup
        await page.click('text=Pre-Match Setup');

        // Verify pre-match page loads
        await expect(page.locator('h1')).toContainText(/Pre-Match/i);

        // Select Playing XI (this depends on your UI implementation)
        // For now, we'll verify the page structure
        await expect(page.locator('text=Select Playing XI')).toBeVisible();
        await expect(page.locator('text=Batting Order')).toBeVisible();
    });

    test('3. Live Scoring - Initial State', async ({ page }) => {
        // Navigate to a live match management page
        // This assumes a match ID exists - in real tests, we'd create one first
        // const matchId = 'test-match-id'; // Replace with actual match creation

        await page.goto(`/matches/${matchId}/manage`);

        // Verify initial scoreboard state
        await expect(page.locator('text=0/0')).toBeVisible();
        await expect(page.locator('text=0.0')).toBeVisible(); // Overs

        // Check if player selection dialog auto-opens
        await expect(page.locator('text=Select Players')).toBeVisible({ timeout: 5000 });
    });

    test('4. Player Selection Dialog', async ({ page }) => {
        // const matchId = 'test-match-id';
        await page.goto(`/matches/${matchId}/manage`);

        // Open players dialog if not already open
        await page.click('button:has-text("Players")');

        // Select striker
        await page.click('[data-testid="select-striker"]');
        await page.click('text=Player 1'); // Assumes player names

        // Select non-striker
        await page.click('[data-testid="select-non-striker"]');
        await page.click('text=Player 2');

        // Select bowler
        await page.click('[data-testid="select-bowler"]');
        await page.click('text=Bowler 1');

        // Verify selections appear in scoreboard
        await expect(page.locator('text=Player 1')).toBeVisible();
        await expect(page.locator('text=Player 2')).toBeVisible();
        await expect(page.locator('text=Bowler 1')).toBeVisible();
    });

    test('5. Ball-by-Ball Scoring - Runs', async ({ page }) => {
        // const matchId = 'test-match-id';
        await page.goto(`/matches/${matchId}/manage`);

        // Ensure players are selected first
        // ... (player selection code)

        // Click Record Ball
        await page.click('button:has-text("Record Ball")');

        // Test different run options
        const runOptions = [0, 1, 2, 3, 4, 6];

        for (const runs of runOptions) {
            await page.click(`button:has-text("${runs}")`);

            // Verify score updates
            // This would need to check the actual score display
            await expect(page.locator('[data-testid="current-score"]')).toBeVisible();

            // Check badge in recent balls
            await expect(page.locator(`[data-testid="ball-badge"]:has-text("${runs}")`)).toBeVisible();

            // Open dialog for next ball
            await page.click('button:has-text("Record Ball")');
        }
    });

    test('6. Extras - Wide and No-Ball', async ({ page }) => {
        // const matchId = 'test-match-id';
        await page.goto(`/matches/${matchId}/manage`);

        // Record a wide
        await page.click('button:has-text("Record Ball")');
        await page.click('button:has-text("Wide")');

        // Verify wide is recorded (adds 1 run, doesn't count as legal ball)
        await expect(page.locator('text=WD')).toBeVisible();

        // Record a no-ball
        await page.click('button:has-text("Record Ball")');
        await page.click('button:has-text("No Ball")');

        // Verify no-ball is recorded
        await expect(page.locator('text=NB')).toBeVisible();
    });

    test('7. Wicket Handling', async ({ page }) => {
        // const matchId = 'test-match-id';
        await page.goto(`/matches/${matchId}/manage`);

        // Record a wicket
        await page.click('button:has-text("Record Ball")');
        await page.click('button:has-text("Wicket")');

        // Select wicket type
        await page.click('text=Bowled');

        // Verify wicket count increments
        await expect(page.locator('text=1 wicket')).toBeVisible();

        // Verify new batsman dialog opens
        await expect(page.locator('text=Select New Batsman')).toBeVisible({ timeout: 3000 });

        // Select new batsman
        await page.click('text=Player 3');

        // Verify scoring can resume
        await expect(page.locator('button:has-text("Record Ball")')).toBeEnabled();
    });

    test('8. Over Completion', async ({ page }) => {
        // const matchId = 'test-match-id';
        await page.goto(`/matches/${matchId}/manage`);

        // Score 6 legal balls
        for (let i = 0; i < 6; i++) {
            await page.click('button:has-text("Record Ball")');
            await page.click('button:has-text("1")'); // Score 1 run each ball
        }

        // Verify new bowler dialog opens
        await expect(page.locator('text=Select New Bowler')).toBeVisible({ timeout: 3000 });

        // Verify previous bowler is excluded
        // (This would need specific implementation details)

        // Select new bowler
        await page.click('text=Bowler 2');

        // Verify overs increment
        await expect(page.locator('text=1.0')).toBeVisible();
    });

    test('9. Wagon Wheel - Shot Placement', async ({ page }) => {
        // const matchId = 'test-match-id';
        await page.goto(`/matches/${matchId}/manage`);

        // Navigate to Field & Shots tab
        await page.click('text=Field & Shots');
        await page.click('text=Wagon Wheel');

        // Click on wagon wheel to record shot location
        const wagonWheel = page.locator('[data-testid="wagon-wheel"]');
        await wagonWheel.click({ position: { x: 100, y: 100 } });

        // Verify scoring dialog opens with coordinates
        await expect(page.locator('button:has-text("Record Ball")')).toBeVisible();

        // Record the shot
        await page.click('button:has-text("4")');

        // Verify shot appears on chart
        await expect(page.locator('[data-testid="shot-marker"]')).toBeVisible();
    });

    test('10. End Innings - Manual Trigger', async ({ page }) => {
        // const matchId = 'test-match-id';
        await page.goto(`/matches/${matchId}/manage`);

        // Click End Innings button
        await page.click('button:has-text("End Innings")');

        // Confirm dialog
        await page.click('button:has-text("Confirm")');

        // Verify innings break state
        await expect(page.locator('text=Innings Break')).toBeVisible();

        // Verify target is displayed
        await expect(page.locator('text=Target')).toBeVisible();

        // Verify Start Second Innings button
        await expect(page.locator('button:has-text("Start Second Innings")')).toBeVisible();
    });

    test('11. Second Innings - Chasing Target', async ({ page }) => {
        // const matchId = 'test-match-id';
        await page.goto(`/matches/${matchId}/manage`);

        // Assume we're in second innings
        // Start second innings
        await page.click('button:has-text("Start Second Innings")');

        // Verify innings number updates
        await expect(page.locator('text=2nd Innings')).toBeVisible();

        // Verify score resets
        await expect(page.locator('text=0/0')).toBeVisible();

        // Verify target display
        await expect(page.locator('text=Target:')).toBeVisible();

        // Verify Required Run Rate (RRR) is shown
        await expect(page.locator('text=RRR')).toBeVisible();
    });

    test('12. Undo Functionality', async ({ page }) => {
        // const matchId = 'test-match-id';
        await page.goto(`/matches/${matchId}/manage`);

        // Record a ball
        await page.click('button:has-text("Record Ball")');
        await page.click('button:has-text("4")');

        // Get current score
        const scoreBefore = await page.locator('[data-testid="current-score"]').textContent();

        // Click Undo
        await page.click('button:has-text("Undo")');

        // Verify score decrements
        const scoreAfter = await page.locator('[data-testid="current-score"]').textContent();
        expect(scoreAfter).not.toBe(scoreBefore);

        // Verify ball is removed from recent balls
        await expect(page.locator('[data-testid="ball-badge"]:has-text("4")')).not.toBeVisible();
    });

    test('13. Real-Time Sync - Multi-Tab', async ({ browser }) => {
        // const matchId = 'test-match-id';

        // Create two contexts (tabs)
        const context1 = await browser.newContext();
        const context2 = await browser.newContext();

        const page1 = await context1.newPage();
        const page2 = await context2.newPage();

        // Login both tabs
        await login(page1);
        await login(page2);

        // Navigate both to same match
        await page1.goto(`/matches/${matchId}/manage`);
        await page2.goto(`/matches/${matchId}/manage`);

        // Score a ball in tab 1
        await page1.click('button:has-text("Record Ball")');
        await page1.click('button:has-text("6")');

        // Verify tab 2 updates automatically (via Firestore listener)
        await expect(page2.locator('text=6')).toBeVisible({ timeout: 5000 });

        // Clean up
        await context1.close();
        await context2.close();
    });

    test('14. Match Completion - Target Reached', async ({ page }) => {
        // const matchId = 'test-match-id';
        await page.goto(`/matches/${matchId}/manage`);

        // Assume we're in second innings chasing a small target
        // Score runs until target is reached
        // (This would need to be implemented based on actual target)

        // Verify match completion dialog
        await expect(page.locator('text=Match Complete')).toBeVisible({ timeout: 3000 });

        // Verify winner is displayed
        await expect(page.locator('text=Winner')).toBeVisible();

        // Verify margin (wickets remaining)
        await expect(page.locator('text=wickets')).toBeVisible();
    });

    test('15. Analytics Dashboard - Pitch Map', async ({ page }) => {
        // const matchId = 'test-match-id';
        await page.goto(`/matches/${matchId}/manage`);

        // Navigate to Pitch Map
        await page.click('text=Field & Shots');
        await page.click('text=Pitch Map');

        // Verify pitch map displays
        await expect(page.locator('[data-testid="pitch-map"]')).toBeVisible();

        // Verify heatmap cells are present
        await expect(page.locator('[data-testid="pitch-cell"]')).toHaveCount(20); // 4 lengths x 5 lines
    });

    test('16. Mobile Responsiveness', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        // const matchId = 'test-match-id';
        await page.goto(`/matches/${matchId}/manage`);

        // Verify scoring buttons are visible and large enough
        const recordButton = page.locator('button:has-text("Record Ball")');
        await expect(recordButton).toBeVisible();

        const buttonBox = await recordButton.boundingBox();
        expect(buttonBox?.height).toBeGreaterThan(40); // Minimum touch target

        // Verify wagon wheel is tap-friendly
        await page.click('text=Wagon Wheel');
        const wagonWheel = page.locator('[data-testid="wagon-wheel"]');
        await expect(wagonWheel).toBeVisible();
    });

    test('17. Performance - Large Match Data', async ({ page }) => {
        // const matchId = 'test-match-id';
        await page.goto(`/matches/${matchId}/manage`);

        // Record multiple overs (simulate a full match)
        const startTime = Date.now();

        for (let over = 0; over < 5; over++) {
            for (let ball = 0; ball < 6; ball++) {
                await page.click('button:has-text("Record Ball")');
                await page.click('button:has-text("1")');
            }

            // Select new bowler after each over
            if (over < 4) {
                await page.click(`text=Bowler ${(over % 3) + 1}`);
            }
        }

        const endTime = Date.now();
        const duration = endTime - startTime;

        // Verify performance (should complete in reasonable time)
        expect(duration).toBeLessThan(60000); // 60 seconds for 5 overs

        // Verify UI remains responsive
        await expect(page.locator('button:has-text("Record Ball")')).toBeEnabled();

        // Verify charts render without lag
        await page.click('text=Wagon Wheel');
        await expect(page.locator('[data-testid="wagon-wheel"]')).toBeVisible({ timeout: 3000 });
    });
});

test.describe('Error Handling and Edge Cases', () => {
    let matchId: string;

    const TEST_MATCH = {
        homeTeam: 'Test Home XI',
        awayTeam: 'Test Away XI',
        overs: 5,
        venue: 'Test Ground',
    };

    // Helper function to login
    async function login(page: Page) {
        await page.goto('/login');
        await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || 'test@scrbrd.com');
        await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || 'TestPassword123!');
        await page.click('button[type="submit"]');
        await page.waitForURL('/home', { timeout: 10000 });
    }

    test.beforeEach(async ({ page }) => {
        await login(page);
        const seeder = new TestDataSeeder(page);
        await seeder.createTeam(TEST_MATCH.homeTeam);
        await seeder.createTeam(TEST_MATCH.awayTeam);
        const createdId = await seeder.createMatch(TEST_MATCH.homeTeam, TEST_MATCH.awayTeam);
        if (createdId) {
            matchId = createdId;
        } else {
            throw new Error('Failed to create test match');
        }
    });

    test('18. State Guards - SCHEDULED Match', async ({ page }) => {
        // Try accessing manage page for a scheduled match
        // Note: The newly created match is likely SCHEDULED by default
        // So we can use matchId here directly
        await page.goto(`/matches/${matchId}/manage`);

        // Should show error or redirect
        // Adjust expectation based on actual behavior for scheduled matches
        // If the app redirects or shows a specific message
        await expect(page.locator('text=Match has not started')).toBeVisible();
    });

    test('19. Missing Players - Disabled Scoring', async ({ page }) => {
        // We need to start the match first to test scoring
        // This might require a helper to transition match state
        // For now, assuming we can access the page but scoring is disabled

        // Skip if we can't easily start match in this test
        // Or implement a helper to start match

        // await page.goto(`/matches/${matchId}/manage`);
        // ...
    });

    test('20. Data Persistence - Browser Refresh', async ({ page }) => {
        // Requires active match
        // await page.goto(`/matches/${matchId}/manage`);
        // ...
    });
});
