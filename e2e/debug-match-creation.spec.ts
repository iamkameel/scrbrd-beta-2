import { test, expect } from '@playwright/test';
import { TestDataSeeder } from './utils/seeder';

test.describe('Debug Match Creation', () => {
    const TEST_USER = {
        email: process.env.TEST_USER_EMAIL || 'test@scrbrd.com',
        password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
    };

    test('should create a match successfully', async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.fill('input[type="email"]', TEST_USER.email);
        await page.fill('input[type="password"]', TEST_USER.password);
        await page.click('button[type="submit"]');
        await page.waitForURL('/home', { timeout: 10000 });

        const seeder = new TestDataSeeder(page);

        // Ensure teams exist
        await seeder.createTeam('Debug Home Team');
        await seeder.createTeam('Debug Away Team');

        // Create Match
        const matchId = await seeder.createMatch('Debug Home Team', 'Debug Away Team');
        expect(matchId).toBeTruthy();
        console.log('Match created with ID:', matchId);
    });
});
