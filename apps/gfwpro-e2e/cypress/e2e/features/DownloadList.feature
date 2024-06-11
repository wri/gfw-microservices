Feature: user can get Download List
  Scenario: Should be in Locations View
    When I login in the landing page
    When Verify to Locations screen
    Then I test download list on Locations
    Then I test download list into list details


    