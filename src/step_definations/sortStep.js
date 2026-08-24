import { createBdd } from "playwright-bdd";
import baseClass from "../pageObject/baseClass";
import POManager from "../pageObject/POManager";
import sortClass from "../pageObject/sortClass";
import loginCart from "../pageObject/loginCart";
import registerClass from "../pageObject/registerClass";
const{Given,When,Then}= createBdd()

Given('the user launches the application',async({page})=>
{
   const pom = new POManager(page)
   const baseurl = new baseClass(page);
   await baseurl.goToUrl('https://ecommerce-playground.lambdatest.io/');
   const registerbutton = await pom.registerPage()
   await registerbutton. myAccount()
   const loginbutton = await pom.loginPage()
   await loginbutton.clickLogin()
   const provideCred = await pom.loginPage()
   await provideCred.userCredentail('shraddhasharma6991@gmail.com','Shraddha@26')
   await provideCred.submitLogin()
})
Given('the user navigates to the "Phone, Tablets & Ipod" category', async({page})=>
{
 const sortClassObject = await new sortClass(page)
 await sortClassObject.categoryPage()
 await sortClassObject.catorgerySelection()
})
When('the user selects Name \\(A - Z) from Sort By', async({page})=>
{
     const sortClassObject = await new sortClass(page)
     await sortClassObject.optionAtoZ()

})
Then ('the products on the current page are ordered by name ascending', async({page})=>
{
  const sortClassObject =await new sortClass(page)
  await sortClassObject.atozPageDisplay()

})
When('the user selects Name \\(Z - A) from Sort By', async({page})=>
{

})
Then('the products on the current page are ordered by name descending', async({page})=>
{

})
When('the user selects Price \\(Low > High) from Sort By', async({page})=>
{

})
Then('the products on the current page are ordered by effective price ascending',async({page})=>
{

})
 When('the user selects Price \\(High > Low) from Sort By',async({page})=>
 {

 })
Then('the products on the current page are ordered by effective price descending',async({page})=>
{

})
When('the user selects Rating from Sort By',async({page})=>
{

})
Then('products with higher ratings appear before lower-rated ones',async({page})=>
{

})