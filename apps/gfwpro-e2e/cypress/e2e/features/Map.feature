Feature: User interaction with Map Screen
  Scenario: Should be able to interact with the Map Interface
    When I login in the landing page
    Then I Navigate to Maps screen
    Then I should be able to zoom in
    Then I should be able to zoom out
    Then I test modal Analysis Base Map
    Then I test global data
    Then I test search button
