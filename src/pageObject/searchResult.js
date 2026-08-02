import baseClass from "./baseClass";
import { expect } from "allure-playwright";

class searchResult extends baseClass
{
    constructor(page)
    {
      super(page)
      this.page =page
      this.home = page.locator('span.title',{hasText:'Home'})
      this.searchbar = page.getByRole('textbox',{name:'Search For Products'})
      this.searchresult =page.locator('.product-thumb h4 a')
    

    }
    async homeClick()
    {
        await this.home.click()
    }
    async validSearch()
    {
       await this.searchbar.click()
        await this.searchbar.fill('mac')
        await this.searchbar.press('Enter')
    }
    async displayResult()
    {
        await this.searchresult.first().waitFor({ state: 'visible', timeout: 15000 })
        const items = await this.searchresult.allTextContents();
        console.log(items);
        items.forEach(item =>
             {
         expect(item.toLowerCase()).toContain('mac');
        })
        
    }
    async invalidSearch()
        {
            await this.searchbar.click()
        await this.searchbar.fill('zara')
        await this.searchbar.press('Enter')
        }
   async assertInvalid()
   {
await expect(this.page.locator("//p[contains(text(),'There is no product that matches the search criter')]")).toBeVisible();  
   }
   
}
export default searchResult