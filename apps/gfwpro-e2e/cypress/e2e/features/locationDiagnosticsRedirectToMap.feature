Feature:  User is redirected to map from the location diagnostics
  Scenario: Viewing the full list map from a draft list
    Given I am logged in
    When I navigate to the map from a draft list
    Then I should be redirected to the draft list map view

  Scenario: Viewing the full list map from an active list
    Given I am logged in
    When I navigate to the map from an active list
    Then I should be redirected to the active list map view

  Scenario: View a single location on the map from the list
    Given I am logged in
    When I navigate to locations and select the list
    And I choose a location and press the Locations Map button
    Then I should be redirected to map with the selected location from the list

  Scenario: View multiple locations on the map from the list
    Given I am logged in
    When I navigate to locations and select the list
    And I choose multiple locations and press the Locations Map button
    Then I should be redirected to map with the selected location from the list

  Scenario: View all locations on the map using Full List Map
    Given I am logged in
    When I navigate to locations and select the list
    And I click Full List Map
    Then I should be redirected to map with the selected location from the list

  Scenario: View a single location on the map from the GFW list
    Given I am logged in
    When I navigate to locations and select the GFW list
    And I choose a location and press the Locations Map button
    Then I should be redirected to map with the selected location from GFW list

  Scenario: View multiple locations on the map from the GFW list
    Given I am logged in
    When I navigate to locations and select the GFW list
    And I choose multiple locations and press the Locations Map button
    Then I should be redirected to map with the selected location from GFW list

  Scenario: View all locations on the map using Full List Map
    Given I am logged in
    When I navigate to locations and select the GFW list
    And I click Full List Map
    Then I should be redirected to map with all locations from the GFW list
    

