Feature: tests all downloads
  Scenario: Test download lists into location and list detail
    When I login in the landing page
    When Verify to Locations screen
    Then I test download list on Locations
    Then I test download list into list details
    When I navigate to the alerts page
    Then I test download into Alerts
