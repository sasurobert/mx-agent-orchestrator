import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',

    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'on-first-retry',
    },

    webServer: [
        {
            command: 'cd ../backend && npx ts-node src/server.ts',
            port: 4000,
            reuseExistingServer: true,
            timeout: 15000,
        },
        {
            command: 'cd ../frontend && npm run dev',
            port: 3000,
            reuseExistingServer: true,
            timeout: 30000,
        },
    ],

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
