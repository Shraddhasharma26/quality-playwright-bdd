import { chromium, expect } from '@playwright/test';
import baseClass from './src/pageObject/baseClass.js';
import POManager from './src/pageObject/POManager.js';

const authFile = '.auth/user.json';

export default async function globalSetup() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const baseurl = new baseClass(page);
  const pom = new POManager(page);

  await baseurl.goToUrl('https://ecommerce-playground.lambdatest.io/');
  await (await pom.registerPage()).myAccount();
  await (await pom.loginPage()).clickLogin();
  await (await pom.loginPage()).userCredentail(
    'shraddhasharma6991@gmail.com',
    'Shraddha@26',
  );
  await (await pom.loginPage()).submitLogin();
  await expect(page.locator('a.list-group-item', { hasText: 'Logout' })).toBeVisible();
  await page.context().storageState({ path: authFile });
  await browser.close();
}
