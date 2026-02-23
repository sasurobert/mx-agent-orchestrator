import { test, expect } from '@playwright/test';

test.describe('Navigation & Page Loading', () => {
    test('landing page loads with greeting and input bar', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Verify core landing page elements
        await expect(page.locator('text=Hello there')).toBeVisible({ timeout: 10000 });

        // Input bar should be present at bottom
        const inputBar = page.locator('input[placeholder], textarea');
        await expect(inputBar.first()).toBeVisible();
    });

    test('Vanta.js background canvas renders', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Wait for Vanta.js to initialize (it creates a canvas element)
        await page.waitForTimeout(2000);
        const canvas = page.locator('canvas');
        const count = await canvas.count();
        expect(count).toBeGreaterThanOrEqual(1);
    });

    test('sidebar renders with all expected sections', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Logo
        await expect(page.locator('text=Orchestrator')).toBeVisible();

        // Navigation
        await expect(page.locator('text=Discover Agents')).toBeVisible();
        await expect(page.locator('text=New Request')).toBeVisible();

        // Recent Jobs section
        await expect(page.locator('text=Recent Jobs')).toBeVisible();

        // Connect Wallet button (when not logged in)
        await expect(page.locator('[data-testid="connect-wallet-btn"], text=Connect Wallet')).toBeVisible();
    });

    test('sidebar collapse and expand works', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Find and click the toggle button
        const toggleBtn = page.locator('button[aria-label="Toggle sidebar"]');
        await expect(toggleBtn).toBeVisible();
        await toggleBtn.click();

        // Sidebar should be collapsed — "Orchestrator" text hidden
        await expect(page.locator('text=Orchestrator')).not.toBeVisible();

        // Floating toggle should appear
        const floatingToggle = page.locator('button[aria-label="Open sidebar"]');
        await expect(floatingToggle).toBeVisible();

        // Click floating toggle to reopen
        await floatingToggle.click();
        await expect(page.locator('text=Orchestrator')).toBeVisible();
    });

    test('navigate to discover page', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        await page.click('text=Discover Agents');
        await page.waitForURL('/discover');

        // Verify discover page content
        await expect(page.locator('text=Discover')).toBeVisible();
    });

    test('navigate to job dashboard via sidebar', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Click a recent job entry
        const firstJob = page.locator('a[href="/job"]').first();
        await expect(firstJob).toBeVisible();
        await firstJob.click();

        await page.waitForURL('/job');
    });

    test('deep link to /discover loads correctly', async ({ page }) => {
        await page.goto('/discover');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('text=Discover')).toBeVisible();
        await expect(page.locator('text=Orchestrator')).toBeVisible();
    });

    test('deep link to /job loads correctly', async ({ page }) => {
        await page.goto('/job');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('text=Orchestrator')).toBeVisible();
    });
});
