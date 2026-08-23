# Sort Feature Test Plan

## Application Overview

Verify sorting behavior on the "Phone, Tablets & Ipod" category page (https://ecommerce-playground.lambdatest.io/index.php?route=product/category&path=57). Include happy paths, edge cases, pagination, filters, accessibility, and performance checks. Assume fresh browser state for each scenario.

## Test Scenarios

### 1. Sort Feature - Phone, Tablets & iPod

**Seed:** `tests/seed.spec.ts`

#### 1.1. Default Sort (Page Load)

**File:** `specs/sort/default-sort.md`

**Steps:**
  1. Open the Phone, Tablets & Ipod category page: https://ecommerce-playground.lambdatest.io/index.php?route=product/category&path=57 with a fresh browser session (no cookies/localStorage).
    - expect: Page loads without JS errors.
    - expect: Default sort label is visible (e.g., Default).
    - expect: Product list shows in backend default order.

#### 1.2. Sort By Name (A → Z)

**File:** `specs/sort/name-az.md`

**Steps:**
  1. Select "Name (A - Z)" from the Sort By control and wait for the product listing to refresh.
    - expect: Product names are ordered ascending alphabetically on the current page.
    - expect: No JS errors and request for sorted results returns success.

#### 1.3. Sort By Name (Z → A)

**File:** `specs/sort/name-za.md`

**Steps:**
  1. Select "Name (Z - A)" from the Sort By control and wait for update.
    - expect: Product names are ordered descending alphabetically.
    - expect: No JS errors and UI shows selected sort option.

#### 1.4. Sort By Price (Low → High)

**File:** `specs/sort/price-low-high.md`

**Steps:**
  1. Select "Price (Low > High)" and wait for listing to refresh.
    - expect: Products are listed by effective price ascending (use discounted price where shown).
    - expect: Each product price ≤ next product price on the page.

#### 1.5. Sort By Price (High → Low)

**File:** `specs/sort/price-high-low.md`

**Steps:**
  1. Select "Price (High > Low)" and wait for refresh.
    - expect: Products are listed by effective price descending.
    - expect: Each product price ≥ next product price on the page.

#### 1.6. Sort By Rating (Highest → Lowest)

**File:** `specs/sort/rating-high-low.md`

**Steps:**
  1. Select the "Rating" sort option (highest first) and wait for update.
    - expect: Products with higher ratings appear before lower-rated ones.
    - expect: Products without ratings are placed last or clearly indicated.

#### 1.7. Sort By Model / Attribute

**File:** `specs/sort/model.md`

**Steps:**
  1. If a "Model" (or similar) option exists, select it and observe ordering.
    - expect: Products ordered by model identifier/name as expected.
    - expect: Control behaves consistently and updates listing.

#### 1.8. Pagination + Sort Consistency

**File:** `specs/sort/pagination-consistency.md`

**Steps:**
  1. Apply a sort (e.g., Price Low > High), navigate to page 2, then back to page 1.
    - expect: Sorting persists across pages.
    - expect: Combined sequence across pages remains globally sorted (page boundary maintains order).

#### 1.9. Sort with Filters Applied

**File:** `specs/sort/filter-plus-sort.md`

**Steps:**
  1. Apply a manufacturer filter (e.g., Apple), then apply "Name (A - Z)".
    - expect: Only filtered products appear and are sorted correctly.
    - expect: Filter and sort states persist and pagination/counts reflect the filter.

#### 1.10. Sort Stability with Identical Values

**File:** `specs/sort/stability.md`

**Steps:**
  1. Find products with identical sort values (e.g., same price) and apply the relevant sort.
    - expect: Order between products with identical key is deterministic (stable) across repeated sorts/refreshes.
    - expect: No random re-ordering between identical-key products.

#### 1.11. Sort Persistence after Product View

**File:** `specs/sort/persistence-after-view.md`

**Steps:**
  1. Sort (e.g., Price Low > High), open a product, then use browser back.
    - expect: Category page restores previous sort and pagination state.
    - expect: User returns to same relative position in the list.

#### 1.12. URL / Query Param Behavior

**File:** `specs/sort/url-params.md`

**Steps:**
  1. Apply a sort option and copy the resulting URL (or observe network request). Open the URL in a new tab/window.
    - expect: URL encodes the selected sort so the same view is reproducible from the URL.
    - expect: New tab shows identical sorted list and pagination state where applicable.

#### 1.13. Empty / Out-of-Stock Handling

**File:** `specs/sort/out-of-stock.md`

**Steps:**
  1. Filter to show out-of-stock items (if filter available) and apply Price sort.
    - expect: Out-of-stock items are included and sorted correctly.
    - expect: Stock status is visible in the UI and does not break sorting.

#### 1.14. Sort + Show (items-per-page) Interaction

**File:** `specs/sort/show-interaction.md`

**Steps:**
  1. Change the "Show" value (e.g., 15 → 30) then apply a sort (Name or Price).
    - expect: Page size updates and sorting applies to the full result set.
    - expect: Pagination adjusts correctly; no loss of sort state.

#### 1.15. Accessibility & Keyboard

**File:** `specs/sort/accessibility.md`

**Steps:**
  1. Tab to the Sort By control and change option using keyboard (Arrow/Enter). Test with a screen reader if available.
    - expect: Sort control is reachable and operable by keyboard.
    - expect: ARIA attributes or accessible labels present and options announced.

#### 1.16. Mobile / Responsive Behavior

**File:** `specs/sort/mobile.md`

**Steps:**
  1. On a mobile viewport (or device), open category page and change sort option.
    - expect: Sort control visible and usable on small viewports.
    - expect: Layout remains usable and product ordering matches desktop behavior.

#### 1.17. Performance & Error Handling

**File:** `specs/sort/performance.md`

**Steps:**
  1. Rapidly change sort options several times and monitor network/console for errors and response times.
    - expect: UI responds without JS errors; network requests complete successfully.
    - expect: Sorting completes within an acceptable time (subjective <2s) and shows loading indicators.

#### 1.18. Negative: Unsupported Option Fallback

**File:** `specs/sort/negative-unsupported.md`

**Steps:**
  1. If possible, manually send/modify query parameter to an unsupported sort value, or simulate malformed param.
    - expect: Application falls back to a safe default sort; no stack traces or error pages shown.
    - expect: User sees either default ordering or an informative message.
