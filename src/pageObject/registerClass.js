import baseClass from './baseClass.js';

class registerClass extends baseClass {
  constructor(page) {
    super(page);
    this.page = page;
    this.myaccount = page.locator('a.dropdown-toggle', { hasText: 'My account' });
    this.register = page.locator('a.dropdown-item', { hasText: 'Register' });
    this.firstname = page.getByRole('textbox', { name: 'First Name*' });
    this.lastname = page.getByRole('textbox', { name: 'Last Name*' });
    this.email = page.getByRole('textbox', { name: 'E-Mail*' });
    this.telephone = page.getByRole('textbox', { name: 'Telephone*' });
    this.password = page.getByRole('textbox', { name: 'Password*' });
    this.confirmpassword = page.getByRole('textbox', { name: 'Password Confirm*' });
    this.checktick = page.locator("label[for='input-agree']");
    this.continue = page.getByRole('button', { name: 'Continue' });
  }

  async myAccount() {
    await this.myaccount.hover();
    await this.register.click();
  }

  async newRegister() {
    await this.register.click();
  }

  async enterEntities(firstname, lastname, email, telephone, password, confpass) {
    await this.firstname.fill(firstname);
    await this.lastname.fill(lastname);
    await this.email.fill(email);
    await this.telephone.fill(String(telephone));
    await this.password.fill(password);
    await this.confirmpassword.fill(confpass);
  }

  async checkbox() {
    await this.checktick.click();
  }

  async clickContinue() {
    await this.continue.click();
  }
}

export default registerClass;

