# Why `npx playwright test sort` fails — a walkthrough

Nothing in this file has been applied to your code. It is a study guide: what is broken, *why*, and what I would change as a senior SDET. Work through it top to bottom.

---

## Part 0: How I read your error log (learn this skill first)

Before any fix, learn to read the failure. Your log says the same headline four times:

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

A **timeout** is not really an error. It means: *Playwright was patiently waiting for something, and gave up after 30 seconds.* Your job is always to find out **what it was waiting for**. A timeout never tells you the bug — it tells you where the bug *stopped* things.

Now look at the `console.log` output, and pay attention to **which logs printed and which didn't**:

```
the total count 16
found option:Phone, Tablets & Ipod     <- printed 3 times
```

But these never printed even once:

```
start of a-z
start of option z to a
start of low to high
start of high to low
```

Those logs live in your `When` steps. So **the `When` steps never ran at all.** Three of your four tests died *inside* `catorgerySelection()`, right after printing `found option:`.

That is the smoking gun. The last thing that printed tells you where execution stopped.

> **Habit to build:** when a test times out, don't stare at the timeout. Find the last log/step that succeeded and the first that didn't. The bug is in the gap between them.

The fourth test (`Sort by Price Low to High`) is a *different* failure — it never even printed `the total count`, and it gave you a real locator error at `registerClass.js:21`. So you actually have **two separate bugs**, not one. We'll fix both.

---

## Bug #1 — The `for` loop that keeps going after the page navigated

**This is your main bug. It causes 3 of the 4 failures.**

### Your code (`src/pageObject/sortClass.js`)

```js
async catorgerySelection() {
   const options = this.component.locator('li.nav-item')
   const count = await options.count()
   console.log("the total count", count)
   for (let i = 0; i < count; i++) {
      const option = options.nth(i)
      const text = (await option.innerText()).trim()      // <-- hangs here
      if (text.includes('Phone, Tablets & Ipod')) {
          console.log(`found option:${text}`)
          await option.click()                            // <-- page navigates
      }
   }
}
```

### What actually happens, step by step

1. The loop finds your category at, say, index 5. It prints `found option:...`. Good.
2. `await option.click()` fires. **The browser leaves the current page and loads the category page.**
3. The loop does **not** stop. `i` becomes 6, and the code calls `options.nth(6).innerText()`.
4. But `options` is `this.component.locator('li.nav-item')`, and `this.component` is `ul.navbar-nav.vertical` — a menu that **only existed on the old page**. On the new page, that `<ul>` is gone.
5. Playwright locators are *lazy and auto-waiting*. `innerText()` doesn't fail instantly when the element is missing — it politely **waits** for the element to appear.
6. It waits. And waits. It will never appear. At 30 seconds the whole test is killed.

That's your timeout. Not a slow website — a loop asking a dead page a question it can never answer.

### The concept you need: a Locator is a *recipe*, not a *thing*

This trips up nearly every newcomer coming from Selenium.

```js
const option = options.nth(5);   // this does NOT find an element right now
```

In Selenium, `findElement` grabs a real element handle immediately, and if the page changes you get `StaleElementReferenceException` — a loud, fast crash. Playwright deliberately works differently. `options.nth(5)` just stores the *instructions* "the 6th `li.nav-item` inside `ul.navbar-nav.vertical`". Nothing is looked up until you call an action like `.innerText()`, `.click()`, or `.count()`.

That design is normally a gift: it means locators are never stale, and Playwright auto-waits for elements that haven't rendered yet. But it has a price — **when an element genuinely will never exist, you get a slow 30-second hang instead of a fast crash.** You lost 30 seconds per test to exactly this.

### The minimal fix (one word)

```js
if (text.includes('Phone, Tablets & Ipod')) {
    await option.click()
    break                  // <-- stop looping; the page is gone
}
```

`break` exits the loop immediately. Three of your four tests would go green from this alone.

### The fix I'd actually make in review

Here's the more important lesson: **delete the loop.** Playwright already does searching-and-waiting for you. Hand-rolling a `count()` + `nth()` + `innerText()` loop is re-implementing, badly, something the framework gives you for free:

```js
async categorySelection() {
    await this.component
        .getByRole('link', { name: 'Phone, Tablets & Ipod' })
        .first()
        .click();
}
```

Why this is better, concretely:

- **No stale-state class of bug can exist.** There's no "after the click" code to go wrong.
- **It auto-waits.** If the menu is still animating open, Playwright retries until the link is visible, actionable, and stable. Your loop had no such protection.
- **It clicks the `<a>`, not the `<li>`.** Your version clicks the list item, and the clickable link may only occupy part of that box — a real source of "the click did nothing" flake.
- **`.first()` guards strict mode.** Playwright throws if a locator matches multiple elements (this is a feature — ambiguous selectors are bugs). `.first()` is your explicit "yes, I know, take the first one."
- It reads like the sentence in your `.feature` file.

> **Rule of thumb:** if you're writing `for`, `count()`, and `nth()` to *find* something in Playwright, you're probably fighting the framework. Loops are for *asserting over a collection*, not for locating one item.

Bonus: `catorgerySelection` is a typo for `categorySelection`. Fix it now while it's cheap. Typos in method names are the kind of thing that quietly spreads across twenty files.

---

## Bug #2 — The hover-then-click dropdown race

**This is your 4th failure**, and it's the one with a real error message:

```
locator resolved to <a class="icon-left both dropdown-item" href="...route=account/register">
attempting click action
  - element is not visible
  - retrying click action ... (repeats for 30s)
```

Read that carefully, because it's telling you something precise. **"locator resolved to"** means Playwright *found* the element in the HTML. **"element is not visible"** means it's in the DOM but hidden — the dropdown menu is collapsed. So this isn't a bad selector. The element is there; the menu just isn't open.

### Your code (`src/pageObject/registerClass.js`)

```js
async myAccount() {
    await this.myaccount.hover();     // open the dropdown
    await this.register.click();      // click inside it
}
```

### Why this is fragile

These menus open on CSS `:hover` (or a JS mouseover) and close the instant the pointer leaves. There is a **race** here:

- `hover()` returns as soon as the mouse event is dispatched — **not** when the dropdown finishes its fade/slide animation. Your next line runs while the menu is still opening.
- Before clicking, Playwright scrolls the target into view. That scroll can shift the page under the cursor so the mouse is no longer over "My account" — and the menu snaps shut. Playwright retries, and each retry can re-trigger the same problem. Hence the 30 seconds of "retrying click action".

This is a genuinely flaky construct. It passes most of the time, which is the worst possible behaviour, because you'll blame the website instead of the code.

### Fix A — wait for the menu, don't assume it

```js
async myAccount() {
    await this.myaccount.hover();
    await this.register.waitFor({ state: 'visible' });
    await this.register.click();
}
```

`waitFor({ state: 'visible' })` blocks until the element is actually painted and non-zero-sized. It converts "I hope the menu is open" into "I know the menu is open."

### Fix B — don't use the menu at all (what I'd do)

Ask yourself: *is the dropdown the thing under test?* In your **sort** feature, no. It's just plumbing to reach a logged-in state. Every UI interaction in a setup path is a chance to fail for reasons unrelated to what you're testing.

```js
async gotoLogin() {
    await this.page.goto('/index.php?route=account/login');
}
```

Direct navigation is instant and cannot flake. Keep the hover-and-click version — but only inside your *navigation* or *register* tests, where the menu genuinely is the feature under test.

> **Principle: test through the UI, set up around it.** The steps that get you to the starting line should be the fastest, most boring path available. Save the realistic clicking for the behaviour you're actually verifying.

While you're here: `registerClass` has both `myAccount()` (hover + click Register) and `newRegister()` (click Register). The name `myAccount` describes *where you clicked*, not *what happened*. `goToRegisterPage()` says what it does. Naming methods after the outcome rather than the mechanics makes page objects much easier to use six months later.

---

## Bug #3 — Your `Background` logs in through the UI, four times over

Look at what runs before **every single scenario**:

```gherkin
Background:
    Given the user launches the application
    And the user navigates to the "Phone, Tablets & Ipod" category
```

And what `the user launches the application` does in `sortStep.js`:

```js
await baseurl.goToUrl('https://ecommerce-playground.lambdatest.io/');
await registerbutton.myAccount()        // hover menu, go to Register page
await loginbutton.clickLogin()          // click Login in the sidebar
await provideCred.userCredentail(...)   // type email + password
await provideCred.submitLogin()         // submit, wait for redirect
```

That's five page loads and a hover-dropdown, on a free public demo site, **repeated for all four scenarios** — 20 page loads to test four dropdown selections. And with `fullyParallel: true` you're doing it in four browsers at once, hammering the same server with the same account.

Notice your tests took **35–39 seconds** each against a **30 second** budget. Even with zero bugs, that's uncomfortably close.

Three things are wrong here, in increasing order of importance:

**The route is silly.** You navigate to the *Register* page, then click a "Login" link in its sidebar. Going straight to the login URL removes two page loads and the flaky hover.

**Logging in through the UI on every test is slow by design.** The professional pattern is: log in **once**, save the browser's cookies to a file, and have every test start already authenticated.

```js
// auth.setup.js — runs once
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/index.php?route=account/login');
  await page.getByRole('textbox', { name: 'E-Mail Address' }).fill(EMAIL);
  await page.getByRole('textbox', { name: 'Password' }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL(/route=account\/account/);
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
```

Then in `playwright.config.js`, point your project at `storageState: 'playwright/.auth/user.json'`. Playwright injects those cookies into every new browser context, so tests open already logged in. **`storageState` is the single biggest speed and stability win available to you** — it typically cuts suite time by more than half and deletes a whole category of flake. Look it up properly once you've fixed Bugs #1 and #2.

**And the real question: does sorting even require login?** Anonymous users can sort a product category on that site. If login isn't needed, the entire `Given` is dead weight — pure risk with no coverage. Deleting a setup step is the cheapest reliability improvement there is.

> As a rule: **every step in a `Background` is a tax paid by every scenario in the file.** Keep it as small as the test genuinely requires.

---

## Bug #4 — Timeouts that fight each other

Two related problems in your config and page object.

### Your global timeout is the default 30s

`playwright.config.js` never sets `timeout`, so you get Playwright's default of 30,000ms. That is the budget for **the whole test**, hooks included — your entire login flow plus navigation plus assertions. On a slow public demo site that's tight. Raise it while you're learning:

```js
export default defineConfig({
  timeout: 90_000,           // per test, including hooks
  expect: { timeout: 10_000 } // per individual expect()
});
```

**But understand what you're doing.** Raising a timeout does not fix a bug; it just gives a slow-but-correct test room to finish. In Bug #1 the code was never going to succeed — a 90 second timeout would have turned a 30 second failure into a 90 second failure. Raise timeouts for *slowness*. Fix code for *wrongness*. Telling the two apart is most of the job.

### A nested timeout larger than the test timeout is meaningless

```js
async categoryPage() {
    await this.shopbycategory.click();
    await expect(this.component).toBeVisible({ timeout: 30000 });  // <-- 30s
}
```

The test's total budget is also 30,000ms. This inner wait can never actually run to completion — the test is killed first. It creates an illusion of patience that the framework can't honour. Any nested timeout must be comfortably *smaller* than the test timeout to mean anything. `10_000` here would be honest.

### While debugging, stop running four browsers at once

```js
workers: 1,          // one at a time
fullyParallel: false,
```

With `headless: false` and four workers you get four Chrome windows racing each other, all hitting one demo server with one account. Debugging that is miserable — you can't tell which window is which, and server-side slowness looks exactly like a code bug. Get it green on one worker, *then* turn parallelism back up. Parallelism is an optimisation; correctness comes first.

---

## Bug #5 — The sort dropdown selector will break

```js
this.sortBy = page.locator('(//div[@class="input-group flex-nowrap"])[2]//select[@id="input-sort-212403"]')
```

Two problems, and one style note.

**`212403` is a generated module ID.** OpenCart mints those per layout module. It changes when the site's content is edited, and it is usually *different on different category pages*. You've hard-coded a number that isn't yours to rely on. Anchor on the stable prefix instead:

```js
this.sortBy = page.locator('select[id^="input-sort"]').first();
```

`[id^="input-sort"]` is CSS for "id **starts with** `input-sort`". (`$=` is ends-with, `*=` is contains — worth memorising, they're everywhere.)

**`(...)[2]` is positional and fragile.** It means "the second element matching this on the page." Add a banner, reorder a widget, and the second becomes the third. Positional selectors encode the current layout as if it were a contract.

**Style note: prefer CSS or role-based locators over XPath in Playwright.** They're shorter, faster, and they compose — `page.locator('...').getByRole('link', {name: '...'})` chains naturally, XPath strings don't. Reach for XPath only when you truly need something CSS can't express (like selecting a parent).

Best of all, if the `<select>` has an associated label: `page.getByLabel('Sort By')`. You had this commented out in your file — `//this.sortBy = page.getByLabel(/sort/i)`. Your instinct was right. Check whether the site has a real `<label>`, and if it does, use it. User-facing locators (role, label, text) survive refactors because they're tied to what the user sees rather than to implementation details.

---

## Bug #6 — Your price assertion is silently wrong

This one won't show up until the timeouts are fixed, so I'm flagging it early.

```js
const optionlist = (await this.page.locator('span.price-new').allInnerTexts()).map(parsePrice)
```

On this site a product's price renders one of two ways. Discounted products show:

```html
<span class="price-new">$100</span> <span class="price-old">$120</span>
```

Non-discounted products show only:

```html
<span class="price-normal">$100</span>
```

So `span.price-new` **only collects the discounted products.** If the page has 12 products and 5 are on sale, you assert that 5 numbers are sorted — and cheerfully ignore the other 7. Worse, those 5 will usually *happen* to be in order, so **the test passes while checking almost nothing.**

This is the most dangerous bug in your file. A test that fails is annoying. A test that passes without verifying anything is actively harmful — it buys false confidence, and nobody investigates a green tick.

Your `.feature` file says "ordered by **effective** price", and you were right to use that word. Effective price means: the new price if there is one, otherwise the normal price. So gather per product card, not per price span:

```js
async getEffectivePrices() {
  const cards = this.page.locator('.product-layout');
  return await cards.evaluateAll(nodes =>
    nodes.map(n => {
      const el = n.querySelector('.price-new') ?? n.querySelector('.price-normal');
      return Number(el.textContent.replace(/[$,]/g, ''));
    })
  );
}
```

The key idea: **iterate over products, and for each product ask what its price is.** Never gather a flat list of price elements and assume it lines up with the product list.

Two smaller things nearby:

- You use `allTextContents()` in some methods and `allInnerTexts()` in others. They differ: `textContent` returns raw text **including hidden elements**, `innerText` returns rendered text and **skips anything hidden by CSS**. Pages often have hidden mobile/desktop duplicates, so mixing these gives inconsistent array lengths. Pick one deliberately — usually `allInnerTexts()`, since it matches what the user sees.
- `h4.title` may match headings outside the product grid (related-products carousels, sidebar modules). Scope it: `this.page.locator('.product-layout h4.title')`. **Always scope a collection locator to its container.**

---

## Bug #7 — Asserting before the sort has applied

```js
await this.sortBy.selectOption({ label: 'Name (A - Z)' })
// ...later
await this.page.waitForLoadState('domcontentloaded');
const optionlist = await this.page.locator('h4.title').allTextContents()
```

Changing that dropdown triggers a **full page reload** with a new URL (`&sort=pd.name&order=ASC`). The race: `waitForLoadState('domcontentloaded')` can resolve against the page that's *already* loaded — the old one — before the new navigation even begins. You then read the *unsorted* list and assert it's sorted.

Depending on timing this either fails confusingly or passes by luck. Both are bad.

Wait for the thing that proves the new state has arrived:

```js
async selectSort(label) {
  await this.sortBy.selectOption({ label });
  await this.page.waitForURL(/sort=/);     // the new page is here
}
```

Or, more robustly, use a web-first assertion that retries:

```js
await expect.poll(async () => await this.getProductNames())
            .toEqual(expectedSortedNames);
```

`expect.poll` re-runs the function until it matches or times out, so it rides out the reload without you having to reason about navigation timing at all.

> **Concept: never wait for *time*, wait for a *condition*.** `waitForTimeout(3000)` is both too slow when things are fast and too short when they're slow. `waitForURL`, `toBeVisible`, and `expect.poll` wait for evidence that the state you need actually exists.

---

## Smaller things worth knowing

**`await new sortClass(page)`** — `await` on a constructor does nothing; constructors aren't async. Harmless, but it suggests a fuzzy mental model of `await`. `await` only means something when the right-hand side returns a Promise. Same with `async registerPage() { return this.registerbutton }` in `POManager` — it's marked `async` and awaited at every call site, but it's just returning a field. Drop the `async` and the `await`; `pom.registerPage()` is enough. Extra `await`s aren't free — they hide which lines can actually fail.

**You build a new page object in every single step.** Every step does `new sortClass(page)`. It works (they're cheap), but it's exactly what the empty `customfixture/` folder in your repo was meant to solve. A `playwright-bdd` custom fixture lets you write `Given('...', async ({ sortPage }) => { ... })` and have the object handed to you, already constructed. That's the natural next thing to learn once this suite is green.

**`customfixture/fuxture.js` contains only the text `Feature:`** — a stray paste. It's not in your `steps` glob so it does no harm today, but delete it before it confuses someone. (Also: `fuxture` → `fixture`, `step_definations` → `step_definitions`.)

**`BeforeAll` printed four times** because in Playwright `BeforeAll` runs **once per worker process**, not once per run. You had four workers, so four printings. If you ever need truly-once-per-run setup, that's what `globalSetup` in the config is for. Same reasoning applies to `AfterAll`.

**Your `After` hook screenshots on failure**, but your config already sets `screenshot: 'only-on-failure'`, so you're capturing twice — that's why the report shows duplicate attachments and `attachment #5` for the trace. Worse: when a test dies from a *timeout*, the page may be mid-navigation, and `page.screenshot()` in the hook can itself hang. Let the config handle screenshots and delete that block.

**One thing you got right:** `'the user selects Name \\(A - Z) from Sort By'` in your step definitions. Cucumber expressions treat `(` as the start of an *optional group*, so an unescaped `(A - Z)` would silently fail to match your feature file. You escaped it correctly. That's a subtle detail many people lose an hour to.

---

## Suggested order of work

Do these one at a time and re-run in between. Changing five things at once means you learn nothing about which one mattered — and if things get worse, you can't tell why.

1. Add `break` after the click in `catorgerySelection()`. Re-run. **Expect 3 of 4 to change behaviour.** This is the big one.
2. Set `workers: 1`, `fullyParallel: false`, `timeout: 90_000` in the config. Re-run — you now get a readable, sequential log.
3. Add `waitFor({ state: 'visible' })` before the Register click, or bypass the dropdown with a direct `goto`. That fixes the 4th test.
4. Replace the sort-dropdown XPath with `select[id^="input-sort"]`.
5. Add `waitForURL(/sort=/)` after `selectOption`.
6. Fix the price gathering to use `price-new ?? price-normal` per product card.
7. Only once everything is green: turn parallelism back on, and look into `storageState`.

## How to debug this yourself next time

You already have the tools — your run produced trace files and never used them:

```bash
npx playwright show-trace test-results/<folder>/trace.zip
```

The **trace viewer** is the single best thing in Playwright, and it's the habit that separates people who guess from people who know. It gives you a timeline of every action with a DOM snapshot **before and after each one**. For Bug #1 you'd have seen it plainly: click on the category, page navigates, then a locator spinning forever against a page that no longer contains the menu.

Two more worth knowing:

```bash
npx playwright test sort --debug      # step through live, with a locator picker
npx playwright test sort --ui         # watch mode; re-runs and shows the timeline
```

`--ui` is the nicest way to work day to day. Reach for the trace *first*, before reading code — thirty seconds in the trace viewer usually beats thirty minutes of staring at selectors.

---
---

# Round 2 — "Execution context was destroyed"

You fixed the hang. The new failure is its exact opposite, and that's progress worth naming.

- **Round 1** was *waiting for something that would never arrive.* Locator hangs 30s, test killed.
- **Round 2** is *reading the page while it was being replaced.* The read starts, the page reloads underneath it, the read dies.

Same root subject — navigation — approached from the other side. You went from "too patient" to "not patient enough."

## The clue in the log that matters more than the error

```
the total count 0
```

Last run this said `16`. That number changing to `0` is the single most informative line in your output.

Here's why. You changed `this.component` from the container:

```js
this.component = page.locator('ul.navbar-nav.vertical').first()   // a <ul>
```

to the link itself:

```js
this.component = page.getByRole('link', { name: 'Phone, Tablets & Ipod' }).first()
```

That's the right locator. But `catorgerySelection()` still contained the old line beneath it:

```js
const options = this.component.locator('li.nav-item')   // now: <li> INSIDE an <a>
const count = await options.count()                     // 0
```

Chaining `.locator()` onto a locator means **"search inside this element."** So you were asking for list items nested inside a single anchor tag. There are none. Zero.

It was harmless — the loop was commented out and `count` was unused — but it's a warning sign worth learning to read:

> **When a variable name outlives its meaning, bugs move in.** `component` meant "the menu container", then silently became "one link". Every line that still assumed the old meaning was now wrong. Renaming a variable when its meaning changes isn't cosmetic; it's how you make the compiler and your own eyes catch the leftovers.

In the rewrite it's now `categoryLink`, and there is nothing left that could misread it.

## The real bug: `waitForLoadState` doesn't wait for the *next* page

This is the important concept in this round.

```js
await this.sortBy.selectOption({ label: 'Name (A - Z)' })   // triggers a reload
// ...
await this.page.waitForLoadState('domcontentloaded');       // <-- does nothing useful
const optionlist = await this.page.locator('h4.title').allTextContents()
```

`selectOption` returns as soon as the `change` event is dispatched. The browser *then* begins tearing down the current page and loading `...&sort=pd.name&order=ASC`. That takes a moment.

Now `waitForLoadState('domcontentloaded')` runs. Here is the trap: **it checks the state of the page that is loaded right now.** The old page finished loading long ago, so the condition is already satisfied and it returns **immediately**. It does not know a new navigation is coming. It is not a barrier — it's a question about the present.

So `allTextContents()` starts reading the old DOM. Halfway through, the new page commits, Chrome destroys the old JavaScript execution context, and your half-finished read dies with:

```
Execution context was destroyed, most likely because of a navigation
```

That message is Playwright saying: *the page I was reading no longer exists.*

Note that this is a **race**, so it's timing-dependent. Sometimes the read finishes first and you get the *old, unsorted* list and a confusing assertion failure. Sometimes it loses and you get this crash. Both outcomes come from the same defect. Non-deterministic failures almost always mean a race — when a test fails differently on different runs, stop looking for a bad selector and start looking for something you didn't wait for.

### The fix: wait for evidence the new page arrived

```js
async selectSort(label) {
  const urlBefore = this.page.url();
  await this.sortBy.selectOption({ label });
  await this.page.waitForURL(url => url.href !== urlBefore);      // new page committed
  await expect(this.productCards.first()).toBeVisible();          // grid painted
}
```

Two waits, doing two different jobs:

1. `waitForURL` blocks until the URL actually changes — proof the navigation happened, not just that it was requested.
2. `toBeVisible()` blocks until a product card is rendered — proof the new DOM is ready to read.

Capturing `urlBefore` and comparing matters. Waiting for a *fixed* pattern like `/sort=/` breaks on the second sort in a row, because the URL already contained `sort=` from the previous selection — the condition is true before anything happens, and you're back to the same race. **Wait for a change from a known starting point, not for a value that might already hold.**

> **The rule:** `waitForLoadState` describes the page you are on. `waitForURL` and web-first assertions wait for the page you are going to. When an action navigates, you need the second kind.

## Why the four tests failed four different ways

Look at how inconsistent the run was: one died in `atozPageDisplay`, one "while setting up When", one in `beforeEach`, one in `hightolowPageDisplay`. Four tests, one bug, four faces.

That's `fullyParallel: true` with four workers, all logging into the **same account on the same demo server at the same time**. They queue behind each other, the site slows under the load, and whichever step happened to be running when the 30s budget ran out is the one blamed. The reported location is the *victim*, not the *culprit*.

Also worth knowing: OpenCart login is session-based. Four workers signing into one account concurrently can invalidate each other's sessions — a genuine source of "it works alone but fails in parallel."

Config now uses `workers: 1` and `fullyParallel: false` locally. Get it green serially, then scale up. **Parallelism multiplies flake; it never causes it alone, but it turns a 5% race into a near-certain failure.**

## Don't fully trust the caret in the stack trace

Your report pointed here:

```
> 49 |     {
     |      ^
```

Line 49 is an opening brace. It cannot fail. And failure #4 pointed at `selectOption` on line 97 while naming `hightolowPageDisplay` — a function that doesn't contain line 97.

Playwright maps async stack frames back to source and the arrow lands a line or two off, especially with brace-on-next-line style. **Trust the function name in the stack, not the caret.** Read the frame `at sortClass.atozPageDisplay (...)` and go read that whole method.

## The changes to make, and why

**`sortClass.js`**

- Rename `component` to `categoryLink`, and delete the three dead lines (`options`, `count`, the `console.log`).
- Add a `clickAndWaitForNewPage()` / `selectSort()` pair so the click-then-wait-for-navigation pattern lives in **one** place instead of five. A race fixed once stays fixed.
- Change `sortBy` to `select[id^="input-sort"]:visible` — no hard-coded `212403` module id, no positional `[2]`. `:visible` is evaluated at action time, so it picks whichever copy of the dropdown is actually on screen (the theme renders a mobile duplicate).
- Read names and prices with `evaluateAll`, which grabs the whole grid in **one** round-trip to the browser. Fewer round-trips means a smaller window for a navigation to land mid-read.
- **Read prices per product card**, taking `.price-new` if present and falling back to `.price-normal`. `span.price-new` alone collects only discounted items — it would pass while checking a fraction of the page. That's the most dangerous line in the file, because it fails *green*.
- Check `length > 0` before every sort assertion, with a message. If a locator breaks later you get "No products found — check the .product-layout locator" instead of `expect([]).toEqual([])` quietly passing. **An empty list satisfies every sort check ever written.**
- Compare names case-insensitively. `'iPhone'` vs `'HTC'` sorts differently under raw `localeCompare` than in the database, which produces a real-looking failure that isn't a bug.
- Make `parsePrice` extract the first number with a regex instead of stripping `$` and `,`. Cards often render `"$74.00 Ex Tax: $60.00"`; the old version turns that into `NaN`, and `NaN !== NaN`, so the failure is genuinely hard to read.

**`loginCart.js`** — add a `loginDirectly()` that goes straight to the login URL, fills, submits, then waits for the URL to leave the login page. No hover-dropdown, three fewer page loads, and it doesn't return until you're really logged in.

**`sortStep.js`** — the `Given` navigates to Register, clicks Login in the sidebar, then fills the form. Replace all of that with one `loginDirectly()` call. Move the credentials to `process.env` with fallbacks — hard-coded passwords in a repo are a habit worth breaking early, even on a demo site.

**`playwright.config.js`** — `timeout: 90_000`, `expect.timeout: 10_000`, `actionTimeout: 15_000`, `navigationTimeout: 30_000`, one worker locally. Note the layering: every inner timeout stays comfortably below the outer one, so a stuck action fails with a *specific* message instead of eating the whole budget and reporting a generic test timeout. The existing `toBeVisible({ timeout: 30000 })` inside a 30s test could never have completed.

**`hook/support.js`** — drop the manual screenshot. The config already sets `screenshot: 'only-on-failure'`, so it captures twice (hence duplicate attachments in the report). Worse, `page.screenshot()` on a page that timed out mid-navigation can itself hang, replacing the real error with a confusing hook failure.

## If it still fails, this is the one thing to check

`.product-layout` is my best guess at this theme's product card class. If you see **"No products found — check the .product-layout locator"**, that guess was wrong. Find the truth in ten seconds:

```js
// drop this temporarily inside getProductNames()
await this.page.pause();
```

Run with `npx playwright test sort --debug`, and in the Inspector use the pick-locator button on a product tile. Whatever wrapper it highlights is your real card class — change the one line in the constructor.

That failure mode is *by design*. The old code would have returned `[]` and passed silently. Now it stops and tells you exactly which locator to fix. **Design your assertions so that a broken locator fails loudly rather than passing quietly** — a test that can't fail is worse than no test, because it costs the same to run and buys false confidence.


---

# Round 3 — "Error: Process completed with exit code 1" in GitHub Actions

## Step 0: read the log correctly before you touch anything

```
Running tests using Playwright workspaces.
Test run created successfully.
Playwright Workspaces reporting: ENABLED
Uploading artifacts to: storage account= pwstrgrrdcac7 ...
Reporting upload status: SUCCESS
Published report URL: https://ms.portal.azure.com/...
Error: Process completed with exit code 1.
```

Every Azure line in that log says **SUCCESS**. The connection worked, the run
was created, the artifacts uploaded, the report published. So this is **not** an
infrastructure or authentication problem.

`Error: Process completed with exit code 1` is not a Playwright message at all —
it is GitHub Actions saying "the command I ran finished with a non-zero exit
code, so I am marking this step red." Playwright's exit codes:

| exit code | meaning |
|-----------|---------|
| 0 | every test passed |
| 1 | at least one test failed, **or** a spec file failed to load / config error |

So "exit code 1" tells you *something is wrong* and nothing more. It never tells
you *what*. You need a reporter that talks.

## Root cause #1 — your CI is blind by configuration (this is why you're stuck)

`playwright.service.config.js` ends with:

```js
reporter: [
  ["html", { open: "never" }],
  ["@azure/playwright/reporter"],
],
```

`defineConfig(a, b, c)` merges left-to-right and **the last value wins**. Your
base `playwright.config.js` has `reporter: [['list'], ['html', ...]]`. The
service config overwrites that whole array — so **`list` is gone in CI**.

The comment sitting directly above those lines in your own file warns about
exactly this:

> This configuration will replace any existing reporter settings from your base
> config. If you're already using other reporters, add them to this array.

`html` writes a folder and prints nothing. The Azure reporter uploads to the
portal and prints nothing per-test. Result: **no test output reaches stdout**,
which is precisely the empty log you pasted.

**Lesson:** in CI you cannot attach a debugger, you cannot watch the browser,
you cannot re-run by hand. The log is your only sense organ. Configuring it away
is the most expensive mistake in CI work.

## Root cause #2 — CI runs 8 tests; you have only ever run 4

`npx playwright test sort` filters spec files by filename *before loading them*.
Locally you have only ever executed `sort.feature`.

CI runs `npx playwright test` with no filter:

| feature | scenarios | ever run locally? |
|---|---|---|
| login.feature | 1 | no |
| register.feature | 1 | no |
| search.feature | 2 | no |
| sort.feature | 4 | yes |

So the failure may not be in `sort` at all. **Before blaming the code you
changed, confirm the failure is even in the code you changed.**

## Root cause #3 — the sort navigation race is still unfixed

Steps 3–6 of Round 2 are not applied. `atozPageDisplay()` and friends still do:

```js
await this.page.waitForLoadState('domcontentloaded');   // resolves instantly
const optionlist = await this.page.locator('h4.title').allTextContents();
```

Cloud browsers sit further from the site than your laptop does, so the
navigation window is *wider* in CI. Expect `Execution context was destroyed` to
reappear, more often, not less.

## Root cause #4 — `--workers=4` with one shared login account

Your workflow runs `--workers=4`. `fullyParallel: false` only serialises tests
*within* one file; the four spec files still run in four parallel browsers.
Three of them (`login`, `search`, `sort`) log into the **same** account with the
same credentials at the same moment. OpenCart keeps one server-side session per
account, so the workers fight over it and log each other out.

Locally `workers: 1` hid this completely.

## Root cause #5 — `headless: false` is a landmine

Because you connect to Azure's cloud browsers, `use.headless` is ignored (the
browser is launched remotely), so this is probably *not* today's failure. But the
day the service is unavailable and someone runs the plain config on
`ubuntu-latest`, there is no display **and** your workflow never runs
`npx playwright install --with-deps`. Two failures at once, for no reason.

## Root cause #6 — the Allure step cannot work

Neither config registers an Allure reporter, so `allure-results/` is never
created — yet the workflow runs `npx allure generate ./allure-results`. That
step is `if: always()`, so it runs and fails too, adding a second red step that
has nothing to do with your tests.

## Repo hygiene: `.gitignore` has a typo that is costing you

```
/node_modules
/allure-reports     <-- plural; the real folder is allure-report
```

Because the pattern never matches, `allure-report/`, `playwright-report/`,
`test-results/` and `.features-gen/` are all committed. That is why
`git status` is a wall of noise and real diffs are unreviewable.

## The method: three ways to get the actual error

**1. Open the published report URL (30 seconds, no code change).** It is already
in your log. Each failed test, its error, and its trace/screenshot/video.

**2. Download the artifact.** Actions run summary -> Artifacts ->
`playwright-report` -> unzip -> `npx playwright show-report ./playwright-report`.

**3. Reproduce CI locally — the skill worth learning.** "Passes locally, fails in
CI" is always a difference in *scope* or *environment*. Make your local run match
CI's scope:

```bat
npx bddgen
set CI=true
npx playwright test --workers=4
```

Note what changed: no `sort` filter (scope), `CI=true` (turns on `retries: 2`),
4 workers. If it fails locally like this, you never need CI to debug again.

Then change **one variable at a time**: drop to `--workers=1`; run only
`register`; run only `search`. The variable that flips it from red to green is
your root cause.

Do not bother with "Re-run jobs -> Enable debug logging". That makes the *runner*
verbose, not Playwright.
