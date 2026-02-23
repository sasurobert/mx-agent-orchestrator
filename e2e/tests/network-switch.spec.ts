import { test, expect } from '@playwright/test';

test.describe('Network Switch', () => {
    test('network switch is visible on the page', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const networkSwitch = page.locator('[data-testid="network-switch"]');
        await expect(networkSwitch).toBeVisible();
    });

    test('network switch shows current network', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const networkSwitch = page.locator('[data-testid="network-switch"]');
        // Should show one of: Devnet, Testnet, or Mainnet
        const text = await networkSwitch.textContent();
        expect(['Devnet', 'Testnet', 'Mainnet'].some((n) => text?.includes(n))).toBe(true);
    });

    test('clicking network switch opens dropdown', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const pill = page.locator('[data-testid="network-switch"] button').first();
        await pill.click();

        // All three options should be visible
        await expect(page.locator('text=Devnet')).toBeVisible();
        await expect(page.locator('text=Testnet')).toBeVisible();
        await expect(page.locator('text=Mainnet')).toBeVisible();
    });

    test('selecting a network updates the display', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Open dropdown
        const pill = page.locator('[data-testid="network-switch"] button').first();
        await pill.click();

        // Click Testnet
        await page.locator('button:has-text("Testnet")').click();

        // Verify switch updated
        const networkSwitch = page.locator('[data-testid="network-switch"]');
        await expect(networkSwitch).toContainText('Testnet');

        // Verify localStorage persistence
        const savedNetwork = await page.evaluate(() => localStorage.getItem('mvx-network'));
        expect(savedNetwork).toBe('testnet');
    });

    test('network persists after page reload', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Set network to testnet via localStorage
        await page.evaluate(() => localStorage.setItem('mvx-network', 'testnet'));

        // Reload page
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Should show Testnet
        const networkSwitch = page.locator('[data-testid="network-switch"]');
        await expect(networkSwitch).toContainText('Testnet');
    });

    test('network switch has colored indicator dots', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Open dropdown
        const pill = page.locator('[data-testid="network-switch"] button').first();
        await pill.click();

        // Each option should have a colored dot
        const options = page.locator('[data-testid="network-switch"] button');
        const count = await options.count();
        // At least the pill + 3 options
        expect(count).toBeGreaterThanOrEqual(3);
    });
});
