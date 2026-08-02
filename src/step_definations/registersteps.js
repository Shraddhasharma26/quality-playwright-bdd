import { createBdd } from 'playwright-bdd';
import baseClass from '../pageObject/baseClass.js';

import POManager from '../pageObject/POManager.js';

const { Given, When, Then } = createBdd();

Given('the user opens the application', async ({ page }) => {
  const baseurl = new baseClass(page);
  await baseurl.goToUrl('https://ecommerce-playground.lambdatest.io/');
});

When('the user clicks on register link', async ({ page }) => 
  {
     const pom = new POManager(page)
     const registerbutton =await pom.registerPage()
  await registerbutton.myAccount();
});

When('the user provide the details', async ({ page }) => {
  const pom = new POManager(page)
  const userdetails = await pom.registerPage()
  const email = 'shraddhasharma6991@gmail.com';
  await userdetails.enterEntities('shraddha', 'sharma', email, '7077100856', 'Shraddha@26', 'Shraddha@26');
});

Then('the user clicks the continue link', async ({ page }) => {
  
  const pom = new POManager(page)
  const checkbox = await pom.registerPage()
  await checkbox.checkbox();
  await checkbox.clickContinue();
});
