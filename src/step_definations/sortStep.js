import { createBdd } from "playwright-bdd";
import baseClass from "../pageObject/baseClass";
import POManager from "../pageObject/POManager";
import sortClass from "../pageObject/sortClass";

const{Given , When , Then}=createBdd

Given ('the user launches the application',async({page})=>
{
   const baseurl = new baseClass(page);
   await baseurl.goToUrl('https://ecommerce-playground.lambdatest.io/');
   const loginbutton = await pom.loginPage()
   await loginbutton.clickLogin()
   const provideCred = await pom.loginPage()
   await provideCred.userCredentail('shraddhasharma6991@gmail.com','Shraddha@26')
   await provideCred.submitLogin()
})
Given ('the user navigates to the "Phone, Tablets & Ipod" category', async({page})=>
{
 const sortClass = new sortClass(page)
 await sortClass.categoryPage()
 await sortClass.catorgerySelection()
})
When ('the user selects "Name (A - Z)" from Sort By' , async({page})=>
{
     const sortClass = new sortClass(page)
     await sortClass.ptionAtoZ()

})
Then ('the products on the current page are ordered by name ascending', async({page})=>
{
  const sortClass = new sortClass(page)
  await sortClass.atozPageDisplay()

})