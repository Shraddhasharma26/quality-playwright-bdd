
class baseClass {
  constructor(page) {
    this.page = page;
  }

  async goToUrl(url) {
    await this.page.goto(url);
  }
}

export default baseClass;