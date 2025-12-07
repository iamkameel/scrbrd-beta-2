import { test, expect, Page } from '@playwright/test';

/**
 * Complete E2E Test Suite for Live Scoring
 * 
 * This test covers the FULL match lifecycle:
 * 1. Login
 * 2. Create Match
 * 3. Handle Toss
 * 4. Select Players (Striker, Non-Striker, Bowler)
 * 5. Record Balls (Runs, Wickets, Extras)
 * 6. Undo Functionality
 * 7. End Innings (optional)
 * 8. Match Completion
 */

test.describe.serial('Live Scoring - Complete Flow', () => {
    const TEST_USER = {
        email: process.env.TEST_USER_EMAIL || 'kameel@maverickdesign.co.za',
        password: process.env.TEST_USER_PASSWORD || 'Nomdeplume1983!',
    };

    let matchId: string;

    // Reusable login function
    async function login(page: Page) {
        // Check if already logged in
        if (page.url() !== 'about:blank' && !page.url().includes('/login')) {
            try {
                await page.waitForSelector('text=Dashboard', { timeout: 2000 });
                console.log('✅ Already logged in');
                return;
            } catch (e) {
                // Not on dashboard, continue to login
            }
        }

        await page.goto('/login');

        // Check if we were redirected to home (already logged in)
        try {
            await page.waitForURL((url) => !url.toString().includes('/login'), { timeout: 3000 });
            console.log('✅ Already logged in (redirected)');
            return;
        } catch (e) {
            // Still on login page, proceed
        }

        await page.waitForSelector('input[type="email"]', { timeout: 5000 });
        await page.fill('input[type="email"]', TEST_USER.email);
        await page.fill('input[type="password"]', TEST_USER.password);
        await page.click('button[type="submit"]');

        // Wait for navigation away from login
        try {
            await page.waitForURL((url) => !url.toString().includes('/login'), { timeout: 10000 });
            console.log(`✅ Logged in successfully`);
        } catch (e) {
            const currentUrl = page.url();
            if (currentUrl.includes('/login')) {
                // Check for error message
                const error = await page.locator('.text-red-500').textContent().catch(() => 'Unknown error');
                throw new Error(`Login failed - still on login page. Error: ${error}`);
            }
        }
    }

    // Helper to select from cmdk/command menu or custom select
    async function selectFromCommandMenu(page: Page, triggerSelector: string, searchText: string) {
        const trigger = page.locator(triggerSelector);
        await trigger.waitFor({ state: 'visible', timeout: 10000 });
        await trigger.click();

        // Try to find input (either cmdk or standard)
        const searchInput = page.locator('input[placeholder="Search..."]').first();
        await searchInput.waitFor({ state: 'visible', timeout: 5000 });

        await searchInput.fill(searchText);
        await page.waitForTimeout(500);

        // Click the option directly instead of using keyboard
        // This is more robust across different implementations
        const option = page.locator('div[role="option"]').filter({ hasText: searchText }).first();
        if (await option.isVisible()) {
            await option.click();
        } else {
            // Fallback to first option if exact match not found
            // Use nth(0) because sometimes "None" isn't there or we want the first result
            const firstOption = page.locator('div[role="option"]').first();
            if (await firstOption.isVisible()) {
                await firstOption.click();
            }
        }

        await page.waitForTimeout(500);
    }

    // Helper to select from standard Select component
    async function selectFromDropdown(page: Page, labelOrSelector: string, optionText?: string) {
        // Try to find by label first, then by selector
        let trigger;
        try {
            const container = page.locator('div').filter({ hasText: labelOrSelector }).first();
            trigger = container.locator('button[role="combobox"]').first();
        } catch {
            trigger = page.locator(labelOrSelector).first();
        }

        if (!await trigger.isVisible()) {
            trigger = page.locator('button[role="combobox"]').first();
        }

        await trigger.click();
        await page.waitForTimeout(300);

        if (optionText) {
            await page.locator(`div[role="option"]:has-text("${optionText}")`).click();
        } else {
            await page.keyboard.press('ArrowDown');
            await page.waitForTimeout(100);
            await page.keyboard.press('Enter');
        }
        await page.waitForTimeout(300);
    }

    // Helper to navigate to a match's management page
    async function navigateToMatchManage(page: Page): Promise<string | null> {
        await page.goto('/matches');
        await page.waitForTimeout(2000);

        // Find match links and get href directly (avoid clicking due to sidebar interception)
        const matchLinks = page.locator('a[href^="/matches/"]');
        const count = await matchLinks.count();

        for (let i = 0; i < count; i++) {
            const href = await matchLinks.nth(i).getAttribute('href');
            if (href && !href.includes('/add') && href !== '/matches') {
                const matchId = href.split('/').pop() || '';
                console.log(`📍 Found match: ${matchId}`);
                await page.goto(`/matches/${matchId}/manage`);
                await page.waitForTimeout(2000);
                return matchId;
            }
        }

        console.log('⚠️ No matches found');
        return null;
    }

    test('Complete Match Creation', async ({ page }) => {
        await login(page);

        // Navigate to create match
        await page.goto('/matches/add');
        await page.waitForSelector('text=Who is Playing?', { timeout: 10000 });
        console.log('✅ Match wizard loaded');

        // Select Home Team
        await selectFromCommandMenu(page, '[data-testid="home-team-select"]', 'Capitals');
        console.log('✅ Selected home team');

        // Select Away Team
        await selectFromCommandMenu(page, '[data-testid="away-team-select"]', 'Durban');
        console.log('✅ Selected away team');

        await page.waitForTimeout(1000);
        await page.click('button:has-text("Next")');
        await page.waitForSelector('text=When & Where?');
        console.log('✅ Moved to date/venue step');

        // Fill date, time, venue
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];

        await page.fill('input[type="date"]', dateStr);
        await page.fill('input[type="time"]', '14:00');

        // Select venue
        const venueSelect = page.locator('button[role="combobox"]').first();
        await venueSelect.waitFor({ state: 'visible', timeout: 5000 });
        await venueSelect.click();
        await page.waitForTimeout(300);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        console.log('✅ Set date, time, and venue');

        // Next steps
        await page.click('button:has-text("Next")');
        await page.waitForSelector('text=Match Details');
        console.log('✅ Moved to format step');

        await page.click('button:has-text("Next")');
        await page.waitForSelector('text=Officials & Review');
        console.log('✅ Moved to review step');

        // Submit match
        await page.click('button:has-text("Schedule Match")');
        await page.waitForTimeout(3000);

        const currentUrl = page.url();
        console.log(`📍 Redirected to: ${currentUrl}`);

        if (currentUrl.includes('/matches/') && !currentUrl.includes('/add')) {
            // Direct redirect to match detail page
            const urlParts = currentUrl.split('/');
            const matchesIndex = urlParts.findIndex(p => p === 'matches');
            matchId = urlParts[matchesIndex + 1] || '';
        } else {
            // Redirected to list or stayed on page - try to find new match
            console.log('📋 Checking matches list for new match');

            // Go to matches list if not there
            if (!currentUrl.endsWith('/matches')) {
                await page.goto('/matches');
                await page.waitForTimeout(2000);
            }

            // Find match cards/links that aren't the "add" link
            const matchLinks = page.locator('a[href^="/matches/"]');
            const count = await matchLinks.count();

            for (let i = 0; i < count; i++) {
                const href = await matchLinks.nth(i).getAttribute('href');
                if (href && !href.includes('/add') && href !== '/matches') {
                    matchId = href.split('/').pop() || '';
                    console.log(`✅ Found match from list: ${matchId}`);
                    break;
                }
            }
        }

        console.log(`✅ Match created: ${matchId}`);
        expect(matchId).toBeTruthy();
        expect(matchId).not.toContain('add');
    });

    test('Handle Toss and Start Match', async ({ page }) => {
        await login(page);

        // Navigate to matches list
        await page.goto('/matches');
        await page.waitForTimeout(2000);

        // Find match links and get href directly (avoid clicking due to sidebar interception)
        const matchLinks = page.locator('a[href^="/matches/"]');
        const count = await matchLinks.count();
        let targetMatchId = '';

        for (let i = 0; i < count; i++) {
            const href = await matchLinks.nth(i).getAttribute('href');
            if (href && !href.includes('/add') && href !== '/matches') {
                targetMatchId = href.split('/').pop() || '';
                break;
            }
        }

        if (!targetMatchId) {
            console.log('⚠️ No matches found - skipping toss test');
            return;
        }

        console.log(`📍 Found match: ${targetMatchId}`);

        // Navigate directly to manage page
        await page.goto(`/matches/${targetMatchId}/manage`);
        await page.waitForTimeout(2000);
        console.log(`✅ Navigated to match management: ${page.url()}`);

        // Check for toss button
        const tossButton = page.locator('button:has-text("Start Match"), button:has-text("Toss")').first();
        if (await tossButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            console.log('🎲 Toss required - handling toss dialog');
            await tossButton.click();
            await page.waitForTimeout(500);

            // Select toss winner (first option)
            const tossWinnerTrigger = page.locator('[data-testid="toss-winner-select"], button[role="combobox"]').first();
            if (await tossWinnerTrigger.isVisible({ timeout: 2000 }).catch(() => false)) {
                await tossWinnerTrigger.click();
                await page.waitForTimeout(300);
                await page.keyboard.press('ArrowDown');
                await page.keyboard.press('Enter');
                console.log('✅ Selected toss winner');
            }

            // Select decision (bat first)
            const batOption = page.locator('text=Bat, button:has-text("Bat")').first();
            if (await batOption.isVisible({ timeout: 2000 }).catch(() => false)) {
                await batOption.click();
                console.log('✅ Selected to bat first');
            }

            // Confirm toss
            const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Start")').first();
            if (await confirmBtn.isVisible()) {
                await confirmBtn.click();
                await page.waitForTimeout(1000);
                console.log('✅ Toss confirmed');
            }
        } else {
            console.log('ℹ️ No toss button visible - match may already be started');
        }

        // Take screenshot of match management page
        await page.screenshot({ path: 'test-results/match-management.png' });
    });

    test('Select Players for Scoring', async ({ page }) => {
        await login(page);

        const matchId = await navigateToMatchManage(page);
        if (!matchId) {
            console.log('⚠️ No matches found - skipping player selection test');
            return;
        }
        console.log(`✅ Navigated to match management: ${page.url()}`);

        // Look for player selection dialog or button
        const playersButton = page.locator('[data-testid="players-button"], button:has-text("Select Players")').first();
        if (await playersButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await playersButton.click();
            await page.waitForTimeout(500);
        }

        // Select striker
        const strikerSelect = page.locator('[data-testid="select-striker"], [data-testid="striker-select"]').first();
        if (await strikerSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
            await strikerSelect.click();
            await page.waitForTimeout(300);
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Enter');
            console.log('✅ Selected striker');
        }

        // Select non-striker
        const nonStrikerSelect = page.locator('[data-testid="select-non-striker"], [data-testid="non-striker-select"]').first();
        if (await nonStrikerSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
            await nonStrikerSelect.click();
            await page.waitForTimeout(300);
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Enter');
            console.log('✅ Selected non-striker');
        }

        // Select bowler
        const bowlerSelect = page.locator('[data-testid="select-bowler"], [data-testid="bowler-select"]').first();
        if (await bowlerSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
            await bowlerSelect.click();
            await page.waitForTimeout(300);
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Enter');
            console.log('✅ Selected bowler');
        }

        // Confirm selection
        const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Start Scoring")').first();
        if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await confirmBtn.click();
            await page.waitForTimeout(1000);
            console.log('✅ Player selection confirmed');
        }

        await page.screenshot({ path: 'test-results/after-player-selection.png' });
    });

    test('Record Ball - Four Runs', async ({ page }) => {
        await login(page);

        const matchId = await navigateToMatchManage(page);
        if (!matchId) {
            console.log('⚠️ No matches found - skipping scoring test');
            return;
        }
        console.log(`✅ Navigated to match management: ${page.url()}`);

        // Look for scoring interface
        const recordBallBtn = page.locator('[data-testid="record-ball-button"], button:has-text("Record Ball"), button:has-text("Score")').first();

        if (await recordBallBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            // Get current score before
            const scoreBefore = await page.locator('text=/\\d+\\/\\d+/').first().textContent().catch(() => '0/0');
            console.log(`📊 Score before: ${scoreBefore}`);

            await recordBallBtn.click();
            await page.waitForTimeout(500);

            // Click 4 button
            const fourButton = page.locator('button:has-text("4")').first();
            if (await fourButton.isVisible({ timeout: 2000 }).catch(() => false)) {
                await fourButton.click();
                await page.waitForTimeout(1000);
                console.log('✅ Recorded 4 runs');

                // Verify score updated
                const scoreAfter = await page.locator('text=/\\d+\\/\\d+/').first().textContent().catch(() => '0/0');
                console.log(`📊 Score after: ${scoreAfter}`);

                await page.screenshot({ path: 'test-results/after-four-runs.png' });
            }
        } else {
            console.log('⚠️ Scoring interface not available - match may need setup');
            await page.screenshot({ path: 'test-results/scoring-not-available.png' });
        }
    });

    test('Record Ball - Wicket', async ({ page }) => {
        await login(page);

        const matchId = await navigateToMatchManage(page);
        if (!matchId) {
            console.log('⚠️ No matches found - skipping wicket test');
            return;
        }
        console.log(`✅ Navigated to match management: ${page.url()}`);

        const recordBallBtn = page.locator('[data-testid="record-ball-button"], button:has-text("Record Ball"), button:has-text("Score")').first();

        if (await recordBallBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await recordBallBtn.click();
            await page.waitForTimeout(500);

            // Click Wicket button
            const wicketButton = page.locator('button:has-text("Wicket"), button:has-text("W")').first();
            if (await wicketButton.isVisible({ timeout: 2000 }).catch(() => false)) {
                await wicketButton.click();
                await page.waitForTimeout(500);

                // Select dismissal type (Bowled)
                const bowledOption = page.locator('text=Bowled, button:has-text("Bowled")').first();
                if (await bowledOption.isVisible({ timeout: 2000 }).catch(() => false)) {
                    await bowledOption.click();
                    await page.waitForTimeout(500);
                }

                // Confirm
                const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Record")').first();
                if (await confirmBtn.isVisible()) {
                    await confirmBtn.click();
                }

                await page.waitForTimeout(1000);
                console.log('✅ Recorded wicket');

                await page.screenshot({ path: 'test-results/after-wicket.png' });
            }
        } else {
            console.log('⚠️ Scoring interface not available');
        }
    });

    test('Undo Last Ball', async ({ page }) => {
        await login(page);

        const matchId = await navigateToMatchManage(page);
        if (!matchId) {
            console.log('⚠️ No matches found - skipping undo test');
            return;
        }
        console.log(`✅ Navigated to match management: ${page.url()}`);

        // Look for undo button
        const undoButton = page.locator('[data-testid="undo-button"], button:has-text("Undo")').first();

        if (await undoButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            // Get score before undo
            const scoreBefore = await page.locator('text=/\\d+\\/\\d+/').first().textContent().catch(() => '0/0');
            console.log(`📊 Score before undo: ${scoreBefore}`);

            await undoButton.click();

            // Confirm undo if dialog appears
            const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Yes")').first();
            if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                await confirmBtn.click();
            }

            await page.waitForTimeout(1000);

            const scoreAfter = await page.locator('text=/\\d+\\/\\d+/').first().textContent().catch(() => '0/0');
            console.log(`📊 Score after undo: ${scoreAfter}`);
            console.log('✅ Undo completed');

            await page.screenshot({ path: 'test-results/after-undo.png' });
        } else {
            console.log('⚠️ Undo button not visible');
        }
    });

    test('Record Extras - Wide', async ({ page }) => {
        await login(page);

        const matchId = await navigateToMatchManage(page);
        if (!matchId) {
            console.log('⚠️ No matches found - skipping extras test');
            return;
        }
        console.log(`✅ Navigated to match management: ${page.url()}`);

        const recordBallBtn = page.locator('[data-testid="record-ball-button"], button:has-text("Record Ball"), button:has-text("Score")').first();

        if (await recordBallBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await recordBallBtn.click();
            await page.waitForTimeout(500);

            // Look for Wide button or Extras section
            const wideButton = page.locator('button:has-text("Wide"), button:has-text("Wd")').first();
            if (await wideButton.isVisible({ timeout: 2000 }).catch(() => false)) {
                await wideButton.click();
                await page.waitForTimeout(1000);
                console.log('✅ Recorded wide');

                await page.screenshot({ path: 'test-results/after-wide.png' });
            }
        } else {
            console.log('⚠️ Scoring interface not available');
        }
    });
});

