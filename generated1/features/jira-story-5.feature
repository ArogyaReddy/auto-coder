Feature: Datapipeline Export Feature for Specific Custom Fields
  - Dark feature.
  
  Background:
    Given Jira is running and I have administrator privileges

  @positive
  Scenario: Your export
    Given the Jira instance is running and the user has appropriate permissions
    When the user interacts with your export
    Then the operation should complete successfully
    And the operation should be logged for audit purposes

  @negative
  Scenario: your export - Error Handling
    Given the Jira instance is running and the user has appropriate permissions
    When the user attempts to your export with invalid parameters
    Then an appropriate error message should be displayed and the system should remain stable
    And the system should remain stable

  @positive
  Scenario: Dark features
    Given the Jira instance is running and the user has appropriate permissions
    When the user interacts with dark features
    Then the operation should complete successfully
    And the operation should be logged for audit purposes

  @positive
  Scenario: Feature flag
    Given the Jira instance is running and the user has appropriate permissions
    When the user interacts with feature flag
    Then the operation should complete successfully
    And the operation should be logged for audit purposes

  @positive
  Scenario: Dark feature
    Given the Jira instance is running and the user has appropriate permissions
    When the user interacts with dark feature
    Then the operation should complete successfully
    And the operation should be logged for audit purposes

  @smoke
  Scenario: System Health Check
    Given the application is running
    When I check the system status
    Then all required services should be operational
    And no critical errors should be present

# Feature generated from requirements analysis
# Domain: jira
# User Stories: 0
# Test Scenarios: 5
