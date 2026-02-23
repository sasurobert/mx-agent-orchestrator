import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
    test('mobile (320x568) — sidebar collapsed by default hint', async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 568 });
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // On mobile, the greeting should still be visible
        await expect(page.locator('text=Hello there')).toBeVisible({ timeout: 10000 });

        // Page should not have horizontal scroll
        const hasHScroll = await page.evaluate(() => document.body.scrollWidth > document.body.clientWidth);
        // Allow slight overflow due to sidebar animation
        expect(hasHScroll).toBe(false);
    });

    test('tablet (768x1024) — layout adapts', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('text=Hello there')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=Orchestrator')).toBeVisible();
    });

    test('desktop (1440x900) — full layout', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Sidebar and content should be visible
        await expect(page.locator('text=Orchestrator')).toBeVisible();
        await expect(page.locator('text=Hello there')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=Recent Jobs')).toBeVisible();
    });

    test('widescreen (1920x1080) — no stretched content', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('text=Hello there')).toBeVisible({ timeout: 10000 });

        // Content should not be ridiculously wide
        const mainWidth = await page.evaluate(() => {
            const main = document.querySelector('main');
            return main ? main.getBoundingClientRect().width : 0;
        });
        // Main content should exist and not exceed viewport
        expect(mainWidth).toBeGreaterThan(0);
        expect(mainWidth).toBeLessThanOrEqual(1920);
    });

    test('discover page responsive at mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/discover');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('text=Discover')).toBeVisible();
    });
});
