import { test, expect, Page } from '@playwright/test';
import { TestDataSeeder } from './utils/seeder';
import { createTestPlayers, cleanupTestData, getTeamIdByName } from './utils/firebase-admin';

test.describe('Live Scoring - Simplified Happy Path', () => {
    const TEST_USER = {
        email: process.env.TEST_USER_EMAIL || 'test-e2e@scrbrd.com',
        password: process.env.TEST_USER_PASSWORD || 'password123',
    };

    const TEST_MATCH = {
        homeTeam: 'Test Home XI',
        awayTeam: 'Test Away XI',
        overs: 5,
        venue: 'Test Ground',
    };

    let matchId: string;
    let homeTeamId: string;
    let awayTeamId: string;

    async function login(page: Page) {
        await page.goto('/login');
        await page.fill('input[type="email"]', TEST_USER.email);
        await page.fill('input[type="password"]', TEST_USER.password);
        await page.click('button[type="submit"]');
        await page.waitForURL('/home', { timeout: 15000 });
    }

    test.beforeAll(async () => {
        // Cleanup any existing test data
        await cleanupTestData('Test');
    });

    test.beforeEach(async ({ page }) => {
        await login(page);
        const seeder = new TestDataSeeder(page);

        // Ensure teams exist
        await seeder.createTeam(TEST_MATCH.homeTeam);
        await seeder.createTeam(TEST_MATCH.awayTeam);

        // Get team IDs
        homeTeamId = await getTeamIdByName(TEST_MATCH.homeTeam) || '';
        awayTeamId = await getTeamIdByName(TEST_MATCH.awayTeam) || '';

        expect(homeTeamId).toBeTruthy();
        expect(awayTeamId).toBeTruthy();

        // Create players for both teams
        await createTestPlayers(homeTeamId, TEST_MATCH.homeTeam, 11);
        await createTestPlayers(awayTeamId, TEST_MATCH.awayTeam, 11);

        // Create match
        matchId = await seeder.createMatch(TEST_MATCH.homeTeam, TEST_MATCH.awayTeam);
        expect(matchId).toBeTruthy();
    });

    test.afterEach(async () => {
        // Cleanup test data after each test
        await cleanupTestData('Test');
    });

    test('Complete Scoring Flow', async ({ page }) => {
        // Navigate to match management
        await page.goto(`/matches/${matchId}/manage`);

        // Handle toss if required
        const tossButton = page.locator('button:has-text("Start Match / Toss")');
        if (await tossButton.isVisible({ timeout: 3000 })) {
            console.log('Toss required - handling toss dialog');
            await tossButton.click();

            // Wait for toss dialog
            await page.waitForSelector('text=Toss', { timeout: 5000 });

            // Select toss winner (first option - home team)
            const tossWinnerSelect = page.locator('[data-testid="toss-winner-select"]').first();
            if (await tossWinnerSelect.isVisible({ timeout: 2000 })) {
                await tossWinnerSelect.click();
                await page.click('div[role="option"]:first-child');
            }

            // Select decision (bat first)
            const batFirstOption = page.locator('text=Bat First');
            if (await batFirstOption.isVisible({ timeout: 2000 })) {
                await batFirstOption.click();
            }

            // Confirm toss
            await page.click('button:has-text("Confirm")');
            await page.waitForTimeout(1000); // Wait for toss to be recorded
        }

        // 1. Verify Initial State
        await expect(page.locator('text=0/0')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=0.0')).toBeVisible();

        // 2. Select Players
        const playersDialog = page.locator('text=Select Players');
        const playersButton = page.locator('[data-testid="players-button"]');

        // Open player selection if not already open
        if (!await playersDialog.isVisible({ timeout: 2000 })) {
            await playersButton.click();
            await page.waitForSelector('text=Select Players', { timeout: 5000 });
        }

        // Select striker
        await page.click('[data-testid="select-striker"]');
        await page.waitForSelector('div[role="option"]', { timeout: 5000 });
        await page.click('div[role="option"]:first-child');

        // Select non-striker
        await page.click('[data-testid="select-non-striker"]');
        await page.waitForSelector('div[role="option"]', { timeout: 5000 });
        await page.click('div[role="option"]:nth-child(2)');

        // Select bowler
        await page.click('[data-testid="select-bowler"]');
        await page.waitForSelector('div[role="option"]', { timeout: 5000 });
        await page.click('div[role="option"]:first-child');

        // Confirm Selection
        await page.click('button:has-text("Confirm Selection")');
        await page.waitForTimeout(1000); // Wait for players to be set

        // 3. Record a Ball (4 runs)
        await page.click('[data-testid="record-ball-button"]');
        await page.waitForSelector('button:has-text("4")', { timeout: 5000 });
        await page.click('button:has-text("4")');

        // Verify score update
        await expect(page.locator('text=4/0')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('text=0.1')).toBeVisible();

        // 4. Undo
        await page.click('[data-testid="undo-button"]');
        await page.waitForTimeout(500);

        // Verify score revert
        await expect(page.locator('text=0/0')).toBeVisible();
        await expect(page.locator('text=0.0')).toBeVisible();

        // 5. Record Wicket
        await page.click('[data-testid="record-ball-button"]');
        await page.waitForSelector('button:has-text("Wicket")', { timeout: 5000 });
        await page.click('button:has-text("Wicket")');

        // Select wicket type
        await page.waitForSelector('text=Bowled', { timeout: 5000 });
        await page.click('text=Bowled');

        // Verify wicket
        await expect(page.locator('text=0/1')).toBeVisible({ timeout: 5000 });

        // Verify new batsman dialog appears
        await expect(page.locator('text=Select Players')).toBeVisible({ timeout: 5000 });

        console.log('✅ Test completed successfully');
    });
});
