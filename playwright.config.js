import { defineConfig, devices } from '@playwright/test';
import { environment } from './config/environment';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: environment.baseUrl,
    httpCredentials: environment.httpCredentials,
    trace: 'on-first-retry',
  },

  projects: [
    // Setup project: prepares authenticated storage state
    { name: 'setup', testMatch: /.*\.setup\.js/ },

    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], storageState: 'playwright/.auth/user.json' },
      dependencies: ['setup'],
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], storageState: 'playwright/.auth/user.json' },
      dependencies: ['setup'],
    }
  ]
});
