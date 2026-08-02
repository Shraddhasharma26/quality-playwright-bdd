import { createBdd } from "playwright-bdd";
import baseClass from '../pageObject/baseClass.js';
import POManager from "../pageObject/POManager.js";

const { Given, When, Then } = createBdd();

 Given('the user launch the application', async({page})=>
 {
  const baseurl = new baseClass(page);
  await baseurl.goToUrl('https://ecommerce-playground.lambdatest.io/');
 })
When('the user clicks on login link', async({page})=>
{
    const pom = new POManager(page);
 const registerbutton = await pom.registerPage();
 await registerbutton. myAccount()
 const loginbutton = await pom.loginPage()
 await loginbutton.clickLogin()
})
When('the user provide the valid credential', async ({page}) =>
{
     const pom = new POManager(page);
    const provideCred = await pom.loginPage()
   await provideCred.userCredentail('shraddhasharma6991@gmail.com','Shraddha@26')
   await provideCred.submitLogin()
})
Then('the user naviage home page', async ({page})=>
{
  const pom = new POManager(page);
  const assertloginsuccess = await pom.loginPage()
 await assertloginsuccess.assertthesuccesslogin()
})
