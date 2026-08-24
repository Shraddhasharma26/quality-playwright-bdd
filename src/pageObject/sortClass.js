import baseClass from "./baseClass";
import { expect } from "@playwright/test";

class sortClass extends baseClass {
  constructor(page) {
    super(page);

    this.page = page;

    this.shopbycategory = page.getByRole("button", {
      name: "Shop by Category",
    });

    this.component = page.locator("ul.navbar-nav.vertical").first();

    this.sortBy = page.locator("select[id^='input-sort-']");

    this.productTitles = page.locator("h4.title");
  }

  async categoryPage() {
    await this.shopbycategory.click();

    await expect(this.component).toBeVisible({
      timeout: 30000,
    });
  }

  async catorgerySelection() {
    const options = this.component.locator("li.nav-item");
    const count = await options.count();

    console.log("The total category count:", count);

    for (let i = 0; i < count; i++) {
      const option = options.nth(i);
      const text = (await option.innerText()).trim();

      if (text.includes("Phone, Tablets & Ipod")) {
        console.log(`Found option: ${text}`);

        await option.click();

        await expect(this.productTitles.first()).toBeVisible({
          timeout: 30000,
        });

        return;
      }
    }

    throw new Error(
      'Category "Phone, Tablets & Ipod" was not found.'
    );
  }

  async optionAtoZ() {
    await expect(this.sortBy).toBeVisible({
      timeout: 30000,
    });

    await expect(this.sortBy).toBeEnabled();

    await this.sortBy.selectOption({
      label: "Name (A - Z)",
    });

    await expect(this.sortBy).toHaveValue(/ASC/i);

    await expect
      .poll(
        async () => {
          const actualNames = (
            await this.productTitles.allTextContents()
          )
            .map((name) => name.trim())
            .filter(Boolean);

          const expectedNames = [...actualNames].sort((a, b) =>
            a.localeCompare(b, undefined, {
              sensitivity: "base",
              numeric: true,
            })
          );

          return JSON.stringify(actualNames) === JSON.stringify(expectedNames);
        },
        {
          message: "Waiting for products to appear in A-Z order",
          timeout: 30000,
        }
      )
      .toBe(true);
  }

  async atozPageDisplay() {
    await expect(this.productTitles.first()).toBeVisible({
      timeout: 30000,
    });

    const optionList = (
      await this.productTitles.allTextContents()
    )
      .map((name) => name.trim())
      .filter(Boolean);

    console.log("Displayed product names:", optionList);

    expect(
      optionList.length,
      "No products were displayed"
    ).toBeGreaterThan(0);

    const expectedNamesSorted = [...optionList].sort((a, b) =>
      a.localeCompare(b, undefined, {
        sensitivity: "base",
        numeric: true,
      })
    );

    expect(
      optionList,
      `Products are not sorted A-Z.
Actual: ${JSON.stringify(optionList)}
Expected: ${JSON.stringify(expectedNamesSorted)}`
    ).toEqual(expectedNamesSorted);
  }
}

export default sortClass;