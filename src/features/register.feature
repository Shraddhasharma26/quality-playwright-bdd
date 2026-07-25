Feature: User register flow

  Scenario: User register successfully
    Given the user opens the application
    When the user clicks on register link
    And the user provide the details
    Then the user clicks the continue link
