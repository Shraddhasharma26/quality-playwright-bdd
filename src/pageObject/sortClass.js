import baseClass from "./baseClass";
import { expect } from "@playwright/test";

const parsePrice = (price) => Number(price.replace(/[$,]/g, ""));

class sortClass extends baseClass
{
    constructor(page)
    {
    super(page)
    this.page =page
    this.shopbycategory= page.getByRole('button',{name:'Shop by Category'})
    //this.topcategories =page.getByRole('heading',{name:'Top categories close'})
    //this.component =page.locator('ul.navbar-nav.vertical').first()
    this.component=page.getByRole('link', { name: 'Phone, Tablets & Ipod' }).first()
    //this.sortBy =page.locator('(//div[@class="input-group flex-nowrap"])[2]//select[@id="input-sort-212403"]')
     this.sortBy = page.locator('select[id^="input-sort"]:visible').first()
     this.productCards = page.locator('.product-layout')
    //this.sortBy = page.getByLabel(/sort/i);
    }
    async categoryPage() {
    await this.shopbycategory.click();

    await expect(this.component).toBeVisible({
      timeout: 10_000,
    });
  }

    async catorgerySelection()
    {
       //const options= this.component.locator('li.nav-item')
       //const count = await options.count()
       //console.log("the total count", count)
      //  for(let i=0;i<count;i++)
      //  {
      //   const option =options.nth(i)
      //   const text =(await option.innerText()).trim()
      //   if(text.includes('Phone, Tablets & Ipod'))
      //   {
      //       console.log(`found option:${text}`)
      //       await option.click()
      //   }
      //  }
     await this.component.click()
    }
    async optionAtoZ()
    {
      await this.sortBy.selectOption({label:'Name (A - Z)'})
    }
    async atozPageDisplay()
    {
      console.log("start of a-z")
    await this.page.waitForLoadState('domcontentloaded');
     const optionlist = (await this.page.locator('h4.title').allTextContents())
       .map((name) => name.trim())
     console.log(optionlist)
     const expectedNamesSorted = [...optionlist].sort((a, b) => a.localeCompare(b));
     expect(optionlist).toEqual(expectedNamesSorted);
     console.log("end of a to z")
    }
     async optionZtoA()
     {
      console.log("start of option z to a")
      await this.sortBy.selectOption({label:'Name (Z - A)'})
      console.log("end of option z to a")
     }

    async ztoapageDisplay()
    {
      console.log("start of z to a")
      await this.page.waitForLoadState('domcontentloaded');
      const optionlist = (await this.page.locator('h4.title').allTextContents())
        .map((name) => name.trim())
     console.log(optionlist)
     const expectedNamesSorted = [...optionlist].sort((a, b) => b.localeCompare(a));
     expect(optionlist).toEqual(expectedNamesSorted);
      console.log("end of z to a")
    }
    async optionLowtoHigh()
    {
       console.log("start of low to high")
      await this.sortBy.selectOption({label:'Price (Low > High)'})
       console.log("end of low to high")
    }
    async lowtoHighPageDisplay()
    {
       console.log("start of low to high")
    await this.page.waitForLoadState('domcontentloaded');
      const optionlist = (await this.page.locator('span.price-new').allInnerTexts())
        .map(parsePrice)
     console.log(optionlist)
     const expectedNamesSorted = [...optionlist].sort((a, b) => a - b);
     expect(optionlist).toEqual(expectedNamesSorted);
      console.log("end of low to high")
    }
    async optionHightoLow()
    {
      console.log("start of high to low")
      await this.sortBy.selectOption({label:'Price (High > Low)'})
      console.log("end of high to low")
    }
    async hightolowPageDisplay()
    {
      console.log("start of display high to low")
    await this.page.waitForLoadState('domcontentloaded');
    const optionlist = (await this.page.locator('span.price-new').allTextContents())
      .map(parsePrice)
    console.log(optionlist)
    const expectedNamesSorted = [...optionlist].sort((a, b) => b - a)
    expect(optionlist).toEqual(expectedNamesSorted);
    console.log("end of high to low ")
    }
  }

export default sortClass
