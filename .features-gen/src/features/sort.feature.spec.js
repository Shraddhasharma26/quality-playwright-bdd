// Generated from: src\features\sort.feature
import { test } from "playwright-bdd";

test.describe('Sort products in Phone, Tablets & Ipod category', () => {

  test.beforeEach('Background', async ({ Given, And, page }, testInfo) => { if (testInfo.error) return;
    await Given('the user launches the application', null, { page }); 
    await And('the user navigates to the "Phone, Tablets & Ipod" category', null, { page }); 
  });
  
  test('Sort by Name A to Z', async ({ When, Then, page }) => { 
    await When('the user selects Name (A - Z) from Sort By', null, { page }); 
    await Then('the products on the current page are ordered by name ascending', null, { page }); 
  });

  test('Sort by Name Z to A', async ({ When, Then, page }) => { 
    await When('the user selects Name (Z - A) from Sort By', null, { page }); 
    await Then('the products on the current page are ordered by name descending', null, { page }); 
  });

  test('Sort by Price Low to High', async ({ When, Then, page }) => { 
    await When('the user selects Price (Low > High) from Sort By', null, { page }); 
    await Then('the products on the current page are ordered by effective price ascending', null, { page }); 
  });

  test('Sort by Price High to Low', async ({ When, Then, page }) => { 
    await When('the user selects Price (High > Low) from Sort By', null, { page }); 
    await Then('the products on the current page are ordered by effective price descending', null, { page }); 
  });

});

// == technical section ==

test.beforeAll('BeforeAll Hooks', ({ $runBeforeAllHooks }) => $runBeforeAllHooks(test, {  }, bddFileData));
test.afterAll('AfterAll Hooks', ({ $registerAfterAllHooks }) => $registerAfterAllHooks(test, {  }, bddFileData));
test.afterEach('AfterEach Hooks', ({ $runScenarioHooks, page }) => $runScenarioHooks('after', { page }));

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('src\\features\\sort.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":11,"pickleLine":7,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given the user launches the application","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"And the user navigates to the \"Phone, Tablets & Ipod\" category","isBg":true,"stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":8,"keywordType":"Action","textWithKeyword":"When the user selects Name (A - Z) from Sort By","stepMatchArguments":[]},{"pwStepLine":13,"gherkinStepLine":9,"keywordType":"Outcome","textWithKeyword":"Then the products on the current page are ordered by name ascending","stepMatchArguments":[]}]},
  {"pwTestLine":16,"pickleLine":11,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given the user launches the application","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"And the user navigates to the \"Phone, Tablets & Ipod\" category","isBg":true,"stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":12,"keywordType":"Action","textWithKeyword":"When the user selects Name (Z - A) from Sort By","stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"Then the products on the current page are ordered by name descending","stepMatchArguments":[]}]},
  {"pwTestLine":21,"pickleLine":16,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given the user launches the application","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"And the user navigates to the \"Phone, Tablets & Ipod\" category","isBg":true,"stepMatchArguments":[]},{"pwStepLine":22,"gherkinStepLine":17,"keywordType":"Action","textWithKeyword":"When the user selects Price (Low > High) from Sort By","stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":18,"keywordType":"Outcome","textWithKeyword":"Then the products on the current page are ordered by effective price ascending","stepMatchArguments":[]}]},
  {"pwTestLine":26,"pickleLine":21,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given the user launches the application","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"And the user navigates to the \"Phone, Tablets & Ipod\" category","isBg":true,"stepMatchArguments":[]},{"pwStepLine":27,"gherkinStepLine":22,"keywordType":"Action","textWithKeyword":"When the user selects Price (High > Low) from Sort By","stepMatchArguments":[]},{"pwStepLine":28,"gherkinStepLine":23,"keywordType":"Outcome","textWithKeyword":"Then the products on the current page are ordered by effective price descending","stepMatchArguments":[]}]},
]; // bdd-data-end