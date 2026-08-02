Feature: User is able to search the item 

Background:
Given User launches the url site 
Given user is login to website
Given user press the home button

Scenario: User able to search the product successfully
When user seach for mac
Then user must get all relevant search result

Scenario: User is not able to find the invalid product
When user search for cloth
Then user must not find any product