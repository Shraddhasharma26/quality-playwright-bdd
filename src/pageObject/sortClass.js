import baseClass from "./baseClass";
import { expect } from "allure-playwright";

class sortClass extends baseClass
{
    constructor(page)
    {
    super(page)
    this.page =page
    this.shopbycategory= page.getByRole('button',{name:'Shop by Category'})
    //this.topcategories =page.getByRole('heading',{name:'Top categories close'})
    this.component =page.locator('ul.navbar-nav.vertical').first()
    this.sortBy =page.locator('(//div[@class="input-group flex-nowrap"])[2]//select[@id="input-sort-212403"]')
    //this.sortBy = page.getByLabel(/sort/i);
    }
    async categoryPage() {
    await this.shopbycategory.click();

    await expect(this.component).toBeVisible({
      timeout: 30000,
    });
  }

    async catorgerySelection()
    {
       const options= this.component.locator('li.nav-item')
       const count = await options.count()
       console.log("the total count", count)
       for(let i=0;i<count;i++)
       {
        const option =options.nth(i)
        const text =(await option.innerText()).trim()
        if(text.includes('Phone, Tablets & Ipod'))
        {
            console.log(`found option:${text}`)
            await option.click()
        }
       }
    }
    async optionAtoZ()
    {
    // await this.sortBy.click()
    //await this.sortBy.selectOption('Name (A - Z)');
      await this.sortBy.click()
      await this.sortBy.selectOption({label:'Name (A - Z)'})
    }
    async atozPageDisplay()
    {
     await this.page.waitForLoadState('networkidle');
     const optionlist = await this.page.locator('h4.title').allTextContents()
     console.log(optionlist)
     const expectedNamesSorted = [...optionlist].sort((a, b) => a.localeCompare(b));
     expect(optionlist).toEqual(expectedNamesSorted);
  
     
    }
}
export default sortClass