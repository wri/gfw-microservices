Feature:  User is redirected to map from the location diagnostics
  

  Scenario: View a single location on the map from the list
    Given I am logged in
    When I navigate to locations and select the list
    And I hover over a location and click the Locations Map button
    Then I should be redirected to map

  Scenario: View multiple locations on the map from the list
    Given I am logged in
    When I navigate to locations and select the list
    And I choose multiple locations and press the Locations Map button
    Then I should be redirected to map

  Scenario: View all locations on the map using Full List Map
    Given I am logged in
    When I navigate to locations and select the list
    And I click Full List Map
    Then I should be redirected to map

  Scenario: View a single location on the map from the GFW list
    Given I am logged in
    When I navigate to locations and select the GFW list
    And I hover over a location and click the Locations Map button
    Then I should be redirected to map

  Scenario: View multiple locations on the map from the GFW list
    Given I am logged in
    When I navigate to locations and select the GFW list
    And I choose multiple locations and press the Locations Map button
    Then I should be redirected to map

  Scenario: View all locations on the map using Full List Map
    Given I am logged in
    When I navigate to locations and select the GFW list
    And I click Full List Map
    Then I should be redirected to map
    

