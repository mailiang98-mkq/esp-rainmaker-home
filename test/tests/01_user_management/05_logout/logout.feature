Feature: User Logout
  User logout scenarios

  Background:
    Given the app is launched
    And user should be on login screen

  @sanity
  Scenario: Successful logout
    Given user is on user profile screen for "registered user 1"
    When user confirms logout
    Then user should be on login screen

  @regression
  Scenario: Cancel logout
    Given user is on user profile screen for "registered user 1"
    When user cancels logout
    Then user should remain on user profile screen
