Feature: Jira Story
  As a user
  I want to interact with the application
  So that I can accomplish my goals

  Scenario: User can upload
    Given I am on the upload page
    When I perform the upload action
    Then the upload should be completed successfully

  Scenario: User can confirm
    Given I am on the confirm page
    When I perform the confirm action
    Then the confirm should be completed successfully

  Scenario: User can view
    Given I am on the view page
    When I perform the view action
    Then the view should be completed successfully
