import baseClass from "./baseClass";


class sortClass extends baseClass
{
    constructor(page)
    {
    super(page)
    this.page =page
    this.shopbycategory= page.getByRole('button',{name:'Shop by Category'})
    this.topcategories =page.getByRole('heading',{name:'Top categories close'})
    this.component =page.locator('ul.navbar-nav.vertical').first()
    this.sortBy =page.locator('input-sort-212403')
    }
    async categoryPage(page)
    {
        await this.shopbycategory.click()
    }
    async catorgerySelection(page)
    {
       const options= this.component.locator('li')
       const count = await options.count()
       for(let i=0;i<count;i++)
       {
        const option =options.nth(i)
        const text =(await option.innerText()).trim()
        if(text.tolowerCase().includes('Phone, Tablets & Ipod'))
        {
            console.log(`found option:${text}`)
            await option.click()
        }
       }
    }
    async optionAtoZ()
    {
     await this.sortBy.selectOption('Name (A - Z)').click()
    }
    async atozPageDisplay()
    {
     await page.waitForLoadState('networkidle');
     const optionlist = await this.page.locator('div.row').allTextContents()
     console.log(optionlist)
    }
}
export default sortClass