import { test, expect } from '@playwright/test';

test.describe('Job Flow', () => {
    test('landing page has input bar to submit requests', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Input bar (textarea or input) should be visible
        const input = page.locator('input, textarea').first();
        await expect(input).toBeVisible();
    });

    test('suggestion chips are clickable on landing', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Suggestion cards/chips
        const chips = page.locator('[class*="suggest"], [class*="chip"], [class*="card"]');
        const count = await chips.count();
        expect(count).toBeGreaterThanOrEqual(1);

        // First chip should be clickable
        const firstChip = chips.first();
        await firstChip.click();
        // After clicking a suggestion, the input should populate or navigate
    });

    test('job dashboard shows pipeline visualization', async ({ page }) => {
        await page.goto('/job');
        await page.waitForLoadState('networkidle');

        // Pipeline or progress elements should be present
        const pipelineElements = page.locator(
            '[class*="pipeline"], [class*="progress"], [class*="step"], [class*="stage"]'
        );
        const count = await pipelineElements.count();
        expect(count).toBeGreaterThanOrEqual(1);
    });

    test('job dashboard shows cost summary', async ({ page }) => {
        await page.goto('/job');
        await page.waitForLoadState('networkidle');

        // Cost or payment section should be present
        const costSection = page.locator('text=TOTAL COST');
        const count = await costSection.count();
        expect(count).toBeGreaterThanOrEqual(1);
    });
});
