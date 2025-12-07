import { Page } from '@playwright/test';

/**
 * Test Data Seeder Utility
 * 
 * This utility helps create test data (teams, players, matches) for E2E testing.
 * It uses the UI to create data to ensure the full flow works.
 */

export class TestDataSeeder {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Creates a test team with players
     */
    async createTeam(teamName: string, playerCount: number = 11) {
        // Navigate to teams page
        await this.page.goto('/teams');

        // Check if team already exists
        const existingTeam = this.page.locator(`text=${teamName}`);
        if (await existingTeam.isVisible()) {
            console.log(`Team ${teamName} already exists`);
            return; // Or return ID if possible
        }

        // Create Team
        await this.page.click('text=Add Team');
        await this.page.fill('input[name="name"]', teamName);
        await this.page.fill('input[name="abbreviatedName"]', teamName.substring(0, 3).toUpperCase());
        await this.page.click('button[type="submit"]');

        // Wait for creation
        await this.page.waitForSelector(`text=${teamName}`);

        // Add Players
        // Note: This assumes we can add players from the team page or a separate flow
        // For now, we'll assume players are added via a separate bulk import or manual loop
        // Implementing a simplified version:

        console.log(`Created team: ${teamName}`);
    }

    /**
     * Creates a test match between two teams using the MatchWizard
     */
    async createMatch(homeTeam: string, awayTeam: string, date: Date = new Date()) {
        // Navigate directly to the match creation wizard
        await this.page.goto('/matches/add');

        // Step 1: Teams - wait for wizard to load
        await this.page.waitForSelector('text=Who is Playing?', { timeout: 10000 });
        await this.selectTeam('Home Team', homeTeam);
        await this.selectTeam('Away Team', awayTeam);
        await this.page.click('button:has-text("Next")');

        // Step 2: Date & Venue
        await this.page.waitForSelector('text=When & Where?');

        // Date and Time
        const dateStr = date.toISOString().split('T')[0];
        await this.page.fill('input[type="date"]', dateStr);
        await this.page.fill('input[type="time"]', '10:00');

        // Venue (Select the first available venue)
        // We need to click the trigger first
        await this.page.click('text=Select Venue');
        // Select the first item in the dropdown
        await this.page.click('div[role="option"]:first-child');

        await this.page.click('button:has-text("Next")');

        // Step 3: Format
        await this.page.waitForSelector('text=Match Details');
        // Default is T20, just click Next
        await this.page.click('button:has-text("Next")');

        // Step 4: Review & Submit
        await this.page.waitForSelector('text=Officials & Review');
        await this.page.click('button:has-text("Schedule Match")');

        // Wait for match to appear (redirects to /matches usually, or stays on page?)
        // The wizard usually redirects to the match page or list
        // Let's wait for the URL to change to a match ID
        await this.page.waitForURL(/\/matches\/[a-zA-Z0-9]+/);

        // Extract match ID from URL
        const url = this.page.url();
        const matchId = url.split('/').pop();

        console.log(`Created match: ${matchId}`);
        return matchId;
    }

    /**
     * Helper to select a team in the TeamSelectionWidget
     */
    async selectTeam(widgetLabel: string, teamName: string) {
        console.log(`Selecting team "${teamName}" in widget "${widgetLabel}"...`);

        // Determine prefix based on label
        const prefix = widgetLabel.toLowerCase().includes('home') ? 'home' : 'away';

        // Click the trigger using data-testid
        const trigger = this.page.locator(`[data-testid="${prefix}-team-select"]`);
        await trigger.waitFor({ state: 'visible', timeout: 10000 });
        await trigger.click();

        // Wait for the popover to open and the search input to be visible
        const searchInput = this.page.locator('input[placeholder="Search..."]').first();
        await searchInput.waitFor({ state: 'visible', timeout: 5000 });

        // Type in the search box
        await searchInput.fill(teamName);

        // Wait a bit for the filtering to happen
        await this.page.waitForTimeout(1000);

        // Take a screenshot for debugging
        await this.page.screenshot({ path: `test-results/team-select-${prefix}-debug.png` });

        // Click the option - try multiple selectors
        // CommandItem renders with role="option" and contains the team name
        let option = this.page.locator('div[role="option"]').filter({ hasText: new RegExp(`^${teamName}$`) }).first();

        // If exact match doesn't work, try partial match
        const optionCount = await option.count();
        if (optionCount === 0) {
            console.log(`Exact match not found, trying partial match...`);
            option = this.page.locator('div[role="option"]').filter({ hasText: teamName }).first();
        }

        try {
            await option.waitFor({ state: 'visible', timeout: 5000 });
            await option.click();
            console.log(`Successfully selected team: ${teamName}`);
        } catch (e) {
            console.error(`Failed to find option "${teamName}". Available options:`);
            const options = await this.page.locator('div[role="option"]').allTextContents();
            console.log(options.join(', '));
            throw e;
        }
    }

    /**
     * Helper to select option in shadcn/ui Select
     */
    private async selectOption(label: string, optionText: string) {
        console.log(`Selecting "${optionText}" for "${label}"...`);

        // Find the container that has the label
        // We look for a div that contains the label text, then find the combobox button within it
        const container = this.page.locator('div.space-y-2').filter({ has: this.page.locator(`label:has-text("${label}")`) }).first();

        // Find the trigger button
        const trigger = container.locator('button[role="combobox"]');

        const count = await trigger.count();
        console.log(`Found ${count} triggers for label "${label}"`);

        if (count === 0) {
            console.log('Trying fallback locator...');
            // Try finding by placeholder text logic
            const cleanLabel = label.replace(' *', '');
            const placeholderTrigger = this.page.locator(`button[role="combobox"]:has-text("Select ${cleanLabel}")`);
            if (await placeholderTrigger.count() > 0) {
                await placeholderTrigger.click();
            } else {
                throw new Error(`Could not find trigger for "${label}"`);
            }
        } else {
            // Ensure it's visible and enabled
            await trigger.waitFor({ state: 'visible' });
            await this.page.waitForTimeout(1000); // Wait for hydration/animations
            try {
                await trigger.click({ force: true });
            } catch (e) {
                console.log('Click failed, trying dispatchEvent...');
                await trigger.dispatchEvent('click');
            }
        }

        // Wait for options to appear
        console.log('Waiting for options...');
        const option = this.page.locator(`div[role="option"]`).filter({ hasText: optionText }).first();

        try {
            await option.waitFor({ state: 'visible', timeout: 5000 });
            await option.click();
            console.log('Option selected.');
        } catch (e) {
            console.error(`Failed to find option "${optionText}". Available options:`);
            const options = await this.page.locator('div[role="option"]').allTextContents();
            console.log(options.join(', '));
            throw e;
        }
    }
}
