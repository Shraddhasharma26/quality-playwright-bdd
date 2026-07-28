import { createBdd } from "playwright-bdd";
import baseClass from '../pageObject/baseClass.js';
import registerClass from '../pageObject/registerClass.js';
import loginCart from "../pageObject/loginCart";
const { Given, When, Then } = createBdd();

 Given('the user launch the application', async({page})=>
 {
  const baseurl = new baseClass(page);
  await baseurl.goToUrl('https://ecommerce-playground.lambdatest.io/');
 })
When('the user clicks on login link', async({page})=>
{
 const registerbutton = new registerClass(page)
 await registerbutton. myAccount()
 const loginbutton = new loginCart(page)
 await loginbutton.clickLogin()
})
When('the user provide the valid credential', async ({page}) =>
{
    const provideCred = new loginCart(page)
   await provideCred.userCredentail('shraddhasharma6991@gmail.com','Shraddha@26')
   await provideCred.submitLogin()
})
Then('the user naviage home page', async ({page})=>
{
 const assertloginsuccess = new loginCart(page)
 await assertloginsuccess.assertthesuccesslogin()
})
