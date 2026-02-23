import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [['list'], ['html', { open: 'never' }]],
    timeout: 30000,

    use: {
        baseURL: 'http://localhost:3100',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'on-first-retry',
    },

    /* Start the frontend dev server on port 3100 if not already running */
    webServer: {
        command: 'cd ../frontend && PORT=3100 npm run dev',
        port: 3100,
        reuseExistingServer: true,
        timeout: 60000,
    },

    projects: [
        {
            name: 'desktop-chrome',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'mobile-iphone',
            use: { ...devices['iPhone 13'] },
        },
    ],
});
