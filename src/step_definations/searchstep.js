import { createBdd } from "playwright-bdd";
import baseClass from "../pageObject/baseClass";
import loginCart from "../pageObject/loginCart";
import searchResult from "../pageObject/searchResult"
import registerClass from "../pageObject/registerClass";

const {Given , When , Then}=createBdd();

Given('User launches the url site' , async({page})=>
    {
  const baseurl = new baseClass(page);
  await baseurl.goToUrl('https://ecommerce-playground.lambdatest.io/');
    })

Given('user is login to website', async({page}) =>
{
  const registerbutton = new registerClass(page)
 await registerbutton. myAccount()
 const loginbutton = new loginCart(page)
 await loginbutton.clickLogin()
 const provideCred = new loginCart(page)
   await provideCred.userCredentail('shraddhasharma6991@gmail.com','Shraddha@26')
   await provideCred.submitLogin()
})

Given('user press the home button', async ({page})=>
{
const home = new searchResult(page)
await home.homeClick()
})

When('user seach for mac', async({page}) =>
{
 const search = new searchResult(page)
 await search.validSearch()
})

Then('user must get all relevant search result', async({page})=>
    {
 const display = new searchResult(page)
 await display.displayResult()
    })

When('user search for cloth' , async({page})=>
{
const invalidsearch = new searchResult(page)
await invalidsearch.invalidSearch()
})

Then('user must not find any product' , async({page})=>
{
const checkmesg = new searchResult(page)
await checkmesg.assertInvalid()
})