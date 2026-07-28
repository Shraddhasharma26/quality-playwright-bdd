# Agent Knowledge Base for ecommerce-bdd-playwright

## Project Stack
- **Framework:** Playwright with Behavior Driven Development (BDD) using `playwright-bdd`.
- **Pattern:** Page Object Model (POM).

## Key Files & Directories
- `src/features/`: Contains Gherkin `.feature` files (plain English test scenarios).
- `src/step_definations/`: Contains step definitions mapping Gherkin steps to JS code.
- `src/pageObject/`: Contains Page Object classes (`baseClass.js`, `registerClass.js`).
- `hook/support.js`: Contains BDD hooks (`BeforeAll`, `After`, `AfterAll`).
- `playwright.config.js`: Main configuration for the Playwright test runner.

## Important Context & Known Behaviors
- **Browser Launching & Headless Mode:** 
  - Playwright test runner automatically manages browser contexts and pages based on `playwright.config.js`.
  - By default, Playwright runs in **headless mode** (no visible browser UI).
  - Manual browser launching (e.g., `chromium.launch()`) inside hooks like `hook/support.js` creates an isolated, disconnected browser instance that does not affect the actual tests, and can cause confusion.
  - To view tests running in the UI, `headless: false` must be configured in `playwright.config.js` (`use` object) or the tests must be run via CLI with the `--headed` flag.
