import loginCart from "./loginCart"
import registerClass from "./registerClass"
import searchResult from "./searchResult"

class POManager 
{
    constructor(page)
    {
   this.page =page
   this. registerbutton = new registerClass(page)
   this.loginbutton = new loginCart(page)
   this.search = new searchResult(page)
    }
async registerPage()
{
return this.registerbutton
}
async loginPage()
{
 return this.loginbutton
}
async searchPage()
{
return this.search
}
}
export default POManager;