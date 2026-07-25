import { createBdd } from 'playwright-bdd';
import baseClass from '../pageObject/baseClass.js';
import registerClass from '../pageObject/registerClass.js';

const { Given, When, Then } = createBdd();

Given('the user opens the application', async ({ page }) => {
  const baseurl = new baseClass(page);
  await baseurl.goToUrl('https://ecommerce-playground.lambdatest.io/');
});

When('the user clicks on register link', async ({ page }) => {
  const registerbutton = new registerClass(page);
  await registerbutton.myAccount();
});

When('the user provide the details', async ({ page }) => {
  const userdetails = new registerClass(page);
  const email = `shraddhasharma_${Date.now()}@gmail.com`;
  await userdetails.enterEntities('shraddha', 'sharma', email, '7077100856', 'Shraddha@26', 'Shraddha@26');
});

Then('the user clicks the continue link', async ({ page }) => {
  const checkbox = new registerClass(page);
  await checkbox.checkbox();
  await checkbox.clickContinue();
});