import { createBdd } from 'playwright-bdd';
import { chromium } from 'playwright';

const { Before, After, BeforeAll, AfterAll } = createBdd();

let browser;

BeforeAll(async () => {
  console.log("************** Starting Test Suite *************");
  // 1. Launch a single browser instance shared across parallel workers
  browser = await chromium.launch({
    headless: process.env.CI ? true : false
  });
});

Before(async function ({ $testInfo }) {
  // 2. Create an isolated BrowserContext for every individual scenario
  this.context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: 'test-results/videos/' }
  });

  // 3. Create a fresh page within this isolated context
  this.page = await this.context.newPage();
});

After(async function ({ $testInfo }) {
  if ($testInfo) {
    console.log(`----------- Cleaning up scenario: ${$testInfo.title}`);

    // 4. Capture screenshot and trace on failure
    if ($testInfo.status !== $testInfo.expectedStatus && this.page) {
      const screenshot = await this.page.screenshot({ fullPage: true });
      await $testInfo.attach('screenshot', {
        body: screenshot,
        contentType: 'image/png'
      });
    }
  }

  // 5. Explicit teardown to prevent memory leaks and zombie processes
  if (this.page) await this.page.close();
  if (this.context) await this.context.close();
});

AfterAll(async () => {
  console.log('[AfterAll] All scenarios completed');
  if (browser) {
    await browser.close();
  }
});