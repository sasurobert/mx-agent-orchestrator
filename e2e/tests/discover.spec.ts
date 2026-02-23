import { test, expect } from '@playwright/test';

test.describe('Discover Agents Page', () => {
    test('discover page loads with agent grid', async ({ page }) => {
        await page.goto('/discover');
        await page.waitForLoadState('networkidle');

        // Page title/header should indicate discovery
        await expect(page.getByRole('heading', { name: /discover/i })).toBeVisible();

        // Should have agent cards
        const cards = page.locator('[class*="card"], [class*="agent"]');
        const count = await cards.count();
        expect(count).toBeGreaterThanOrEqual(1);
    });

    test('agent cards display name and details', async ({ page }) => {
        await page.goto('/discover');
        await page.waitForLoadState('networkidle');

        // At least one card should have text content
        const firstCard = page.locator('[class*="card"], [class*="agent"]').first();
        const text = await firstCard.textContent();
        expect(text?.length).toBeGreaterThan(5);
    });

    test('sidebar is present on discover page', async ({ page }) => {
        await page.goto('/discover');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('text=Orchestrator')).toBeVisible();
        await expect(page.locator('text=New Request')).toBeVisible();
    });

    test('discover page has search or filter interaction', async ({ page }) => {
        await page.goto('/discover');
        await page.waitForLoadState('networkidle');

        // Look for filter chips, search input, or sort buttons
        const interactiveElements = page.locator(
            'input[type="text"], input[type="search"], [class*="chip"], [class*="filter"], select, [class*="sort"]'
        );
        const count = await interactiveElements.count();
        expect(count).toBeGreaterThanOrEqual(1);
    });

    test('discover page is navigable from landing', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        await page.click('text=Discover Agents');
        await page.waitForURL('/discover');

        await expect(page.getByRole('heading', { name: /discover/i })).toBeVisible();
    });
});
