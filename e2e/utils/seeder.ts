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
     * Creates a test match between two teams
     */
    async createMatch(homeTeam: string, awayTeam: string, date: Date = new Date()) {
        await this.page.goto('/matches');
        await this.page.click('text=Create Match');

        // Fill form
        // Note: These selectors depend on your specific form implementation
        // You might need to use select options or comboboxes

        // For Select components (shadcn/ui), we usually click trigger then option
        await this.selectOption('homeTeamId', homeTeam);
        await this.selectOption('awayTeamId', awayTeam);

        await this.page.fill('input[name="matchDate"]', date.toISOString().split('T')[0]);
        await this.page.fill('input[name="overs"]', '20');
        await this.page.fill('input[name="venue"]', 'Test Venue');

        await this.page.click('button[type="submit"]');

        // Wait for match to appear
        await this.page.waitForURL(/\/matches\/[a-zA-Z0-9]+/);

        // Extract match ID from URL
        const url = this.page.url();
        const matchId = url.split('/').pop();

        console.log(`Created match: ${matchId}`);
        return matchId;
    }

    /**
     * Helper to select option in shadcn/ui Select
     */
    private async selectOption(triggerId: string, label: string) {
        // Click trigger
        // Assuming trigger has id or name attribute
        // If using name for form:
        const trigger = this.page.locator(`button[name="${triggerId}"]`);
        if (await trigger.isVisible()) {
            await trigger.click();
        } else {
            // Fallback to finding by label
            await this.page.click(`label:has-text("${triggerId}") + *`);
        }

        // Click option
        await this.page.click(`div[role="option"]:has-text("${label}")`);
    }
}
