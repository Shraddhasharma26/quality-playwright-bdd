import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'src/features/**/*.feature',
  steps: ['src/step_definations/**/*.js', 'hook/**/*.js'],
});
const authFile = '.auth/user.json';

export default defineConfig({
  testDir,
  globalSetup: './auth.setup.js',
   timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        baseURL: 'https://ecommerce-playground.lambdatest.io/',
        headless: process.env.CI ? true : false,
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
        video: 'on-first-retry',
        actionTimeout: 15_000,
        navigationTimeout: 30_000,
      },
    },
    {
      name: 'firefox',
      use: {
        browserName: 'firefox',
        baseURL: 'https://ecommerce-playground.lambdatest.io/',
        headless: process.env.CI ? true : false,
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
        video: 'on-first-retry',
        actionTimeout: 15_000,
        navigationTimeout: 30_000,
      },
    },
    {
      name: 'authenticated',
      testMatch: /.*(search|sort)\.feature\.spec\.js/,
      use: {
        browserName: 'chromium',
        baseURL: 'https://ecommerce-playground.lambdatest.io/',
        storageState: authFile,
        headless: process.env.CI ? true : false,
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
        video: 'on-first-retry',
        actionTimeout: 15_000,
        navigationTimeout: 30_000,
      },
    },
    {
      name: 'anonymous',
      testIgnore: /.*(search|sort)\.feature\.spec\.js/,
      use: {
        browserName: 'chromium',
        baseURL: 'https://ecommerce-playground.lambdatest.io/',
        headless: process.env.CI ? true : false,
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
        video: 'on-first-retry',
        actionTimeout: 15_000,
        navigationTimeout: 30_000,
      },
    },
  ],
});
