import { createBdd } from "playwright-bdd";
import baseClass from "../pageObject/baseClass";
import POManager from "../pageObject/POManager";

const {Given , When , Then}=createBdd();

Given('User launches the url site' , async({page})=>
    {
  const baseurl = new baseClass(page);
  await baseurl.goToUrl('https://ecommerce-playground.lambdatest.io/');
    })

Given('user is login to website', async({page}) =>
{
  const pom = new POManager(page)
  const registerbutton = await pom.registerPage()
 await registerbutton. myAccount()
 const loginbutton = await pom.loginPage()
 await loginbutton.clickLogin()
 const provideCred = await pom.loginPage()
   await provideCred.userCredentail('shraddhasharma6991@gmail.com','Shraddha@26')
   await provideCred.submitLogin()
})

Given('user press the home button', async ({page})=>
{
   const pom = new POManager(page)
  const home = await pom.searchPage()
await home.homeClick()
})

When('user seach for mac', async({page}) =>
{
   const pom = new POManager(page)
   const search = await pom.searchPage()
 await search.validSearch()
})

Then('user must get all relevant search result', async({page})=>
    {
   const pom = new POManager(page)
   const display = await pom.searchPage()
 await display.displayResult()
    })

When('user search for cloth' , async({page})=>
{
   const pom = new POManager(page)
   const invalidsearch = await pom.searchPage()
await invalidsearch.invalidSearch()
})

Then('user must not find any product' , async({page})=>
{
   const pom = new POManager(page)
   const checkmesg = await pom.searchPage()
await checkmesg.assertInvalid()
})