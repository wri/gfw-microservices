Feature: tests all downloads
  Scenario: Test download lists into location and list detail
    When I login in the landing page
    Then Verify the Locations screen
    Then I test download list on Locations
    Then I test download list into list details
