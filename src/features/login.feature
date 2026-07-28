Feature: User login 

  Scenario: User login successfully
    Given the user launch the application
    When the user clicks on login link
    And the user provide the valid credential
    Then the user naviage home page
