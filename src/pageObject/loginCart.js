import baseClass from "./baseClass";
import registerClass from "./registerClass";
import { expect } from "@playwright/test";

class loginCart extends baseClass
{
    constructor(page)
    {
        super(page)
        this.page=page
         this.login = page.locator('a.list-group-item', { hasText: 'Login' });
        //this.login = page.locator('a.dropdown-item', { hasText: 'Login' });
        this.emailAddress= page.getByRole('textbox',{name:'E-Mail Address'})
        this.password =page.getByRole('textbox',{name:'Password'})
        this.loginButton = page.getByRole('button',{name:'Login'})
    }
    async clickLogin()
    {
        await this.login.hover()
        await this.login.click()
    }
    async userCredentail(username, password)
    {
        await this.emailAddress.fill(username)
        await this.password.fill(password)
    }
    async submitLogin()
    {
        await this.loginButton.click()
    }
    async assertthesuccesslogin()
    {
        await this.page.mouse.wheel(0, 500);
        await expect(this.page.locator('a.list-group-item', { hasText: 'Logout' })).toBeVisible();
    }
}
export default loginCart