import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
    test('all interactive elements are reachable via Tab', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Tab through elements and collect IDs/roles
        const focusableElements: string[] = [];

        for (let i = 0; i < 15; i++) {
            await page.keyboard.press('Tab');
            const tagName = await page.evaluate(() => {
                const el = document.activeElement;
                return el ? `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}` : 'none';
            });
            focusableElements.push(tagName);
        }

        // Should have reached multiple interactive elements
        const uniqueElements = new Set(focusableElements.filter((e) => e !== 'none' && e !== 'body'));
        expect(uniqueElements.size).toBeGreaterThanOrEqual(3);
    });

    test('sidebar toggle has aria-label', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const toggleBtn = page.locator('button[aria-label="Toggle sidebar"]');
        await expect(toggleBtn).toBeVisible();

        const ariaLabel = await toggleBtn.getAttribute('aria-label');
        expect(ariaLabel).toBe('Toggle sidebar');
    });

    test('network switch has aria attributes', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const switchBtn = page.locator('[data-testid="network-switch"] button[aria-label]');
        await expect(switchBtn).toBeVisible();

        const ariaLabel = await switchBtn.getAttribute('aria-label');
        expect(ariaLabel).toBe('Switch network');
    });

    test('page uses semantic HTML elements', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Check for semantic elements
        const hasAside = await page.locator('aside').count();
        const hasMain = await page.locator('main').count();
        const hasNav = await page.locator('nav').count();

        expect(hasAside).toBeGreaterThanOrEqual(1);
        expect(hasMain).toBeGreaterThanOrEqual(1);
        expect(hasNav).toBeGreaterThanOrEqual(1);
    });

    test('images have alt attributes', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const images = page.locator('img');
        const count = await images.count();

        for (let i = 0; i < count; i++) {
            const alt = await images.nth(i).getAttribute('alt');
            // All images should have alt (even empty string for decorative)
            expect(alt).not.toBeNull();
        }
    });
});
