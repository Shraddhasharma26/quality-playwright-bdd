import { createBdd } from "playwright-bdd";
import baseClass from "../pageObject/baseClass";
import POManager from "../pageObject/POManager";
import sortClass from "../pageObject/sortClass";
import loginCart from "../pageObject/loginCart";
import registerClass from "../pageObject/registerClass";


const{Given,When,Then}= createBdd()

Given('the user launches the application',async({page})=>
{
   const baseurl = new baseClass(page);
   await baseurl.goToUrl('https://ecommerce-playground.lambdatest.io/');
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
  const sortClassObject =await new sortClass(page)
  await sortClassObject.optionZtoA()
})
Then('the products on the current page are ordered by name descending', async({page})=>
{
  const sortClassObject =await new sortClass(page)
  await sortClassObject.ztoapageDisplay()
})
When('the user selects Price \\(Low > High) from Sort By', async({page})=>
{
  const sortClassObject =await new sortClass(page)
  await sortClassObject.optionLowtoHigh()
})
Then('the products on the current page are ordered by effective price ascending', async({page})=>
{
const sortClassObject =await new sortClass(page)
  await sortClassObject.lowtoHighPageDisplay()
})
 When('the user selects Price \\(High > Low) from Sort By',async({page})=>
 {
  const sortClassObject =await new sortClass(page)
  await sortClassObject.optionHightoLow()
 })
Then('the products on the current page are ordered by effective price descending', async({page})=>
{
  const sortClassObject =await new sortClass(page)
  await sortClassObject.hightolowPageDisplay()
})
//run the code