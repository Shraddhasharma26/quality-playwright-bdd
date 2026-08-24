Feature: Sort products in Phone, Tablets & Ipod category

  Background:
    Given the user launches the application
    And the user navigates to the "Phone, Tablets & Ipod" category

  Scenario: Sort by Name A to Z
    When the user selects Name (A - Z) from Sort By
    Then the products on the current page are ordered by name ascending

  Scenario: Sort by Name Z to A
    When the user selects Name (Z - A) from Sort By
    Then the products on the current page are ordered by name descending
    

  Scenario: Sort by Price Low to High
    When the user selects Price (Low > High) from Sort By
    Then the products on the current page are ordered by effective price ascending
  

  Scenario: Sort by Price High to Low
    When the user selects Price (High > Low) from Sort By
    Then the products on the current page are ordered by effective price descending
    

  Scenario: Sort by Rating Highest to Lowest
    When the user selects Rating from Sort By
    Then products with higher ratings appear before lower-rated ones

