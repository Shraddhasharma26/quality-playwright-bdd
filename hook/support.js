import { createBdd } from 'playwright-bdd';

const { Before, After, BeforeAll, AfterAll } = createBdd();
import('playwright').then(async ({ chromium }) => {
     const browser = await chromium.launch({ headless: false});
     const page = await browser.newPage()})

BeforeAll(async () => {
  console.log("**************Starting the code*************");
   
});

After(async ({ page, $testInfo }) => {
  if ($testInfo) {
    console.log(`-----------cleaning up scenario : ${$testInfo.title}`);

    if ($testInfo.status !== $testInfo.expectedStatus) {
      const screenshot = await page.screenshot();
      await $testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });
    }
  }
});

AfterAll(async () => {
  console.log('[AfterAll] All scenarios completed');
});
