Feature: Text Input 1752357997567
  As a user
  I want to interact with the application
  So that I can accomplish my goals

  Scenario: User can login
    Given I am on the login page
    When I enter valid credentials
    And I click the login button
    Then I should be logged in successfully
