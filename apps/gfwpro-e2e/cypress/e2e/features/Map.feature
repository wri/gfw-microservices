Feature: User interaction with Map Screen
  Scenario: Should be able to interact with the Map Interface
    When I login in the landing page
    When I navigate to Map view
    Then I should be redirected to Map view
    Then I should be able to zoom in
    Then I should be able to zoom out
    Then I test modal Analysis Base Map
