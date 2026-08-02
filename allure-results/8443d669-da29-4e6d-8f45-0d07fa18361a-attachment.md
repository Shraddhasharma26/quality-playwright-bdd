# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: src\features\login.feature.spec.js >> User login >> User login successfully
- Location: .features-gen\src\features\login.feature.spec.js:6:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Login' })

```

# Test source

```ts
  1  | import baseClass from "./baseClass";
  2  | import registerClass from "./registerClass";
  3  | import { expect } from "@playwright/test";
  4  | 
  5  | class loginCart extends baseClass
  6  | {
  7  |     constructor(page)
  8  |     {
  9  |         super(page)
  10 |         this.page=page
  11 |          this.login = page.locator('a.list-group-item', { hasText: 'Login' });
  12 |         //this.login = page.locator('a.dropdown-item', { hasText: 'Login' });
  13 |         this.emailAddress= page.getByRole('textbox',{name:'E-Mail Address'})
  14 |         this.password =page.getByRole('textbox',{name:'Password'})
  15 |         this.loginButton = page.getByRole('button',{name:'Login'})
  16 |     }
  17 |     async clickLogin()
  18 |     {
  19 |         await this.login.hover()
  20 |         await this.login.click()
  21 |     }
  22 |     async userCredentail(username, password)
  23 |     {
  24 |         await this.emailAddress.fill(username)
  25 |         await this.password.fill(password)
  26 |     }
  27 |     async submitLogin()
  28 |     {
> 29 |         await this.loginButton.click()
     |                                ^ Error: locator.click: Test timeout of 30000ms exceeded.
  30 |     }
  31 |     async assertthesuccesslogin()
  32 |     {
  33 |         await this.page.mouse.wheel(0, 500);
  34 |         await expect(this.page.locator('a.list-group-item', { hasText: 'Logout' })).toBeVisible();
  35 |     }
  36 | }
  37 | export default loginCart
```