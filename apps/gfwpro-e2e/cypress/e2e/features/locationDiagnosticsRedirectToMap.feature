Feature: User can view location diagnostics and map views

  Scenario: Viewing diagnostics for a single location in GFW
    Given I login in the landing page
    When I navigate to a location details page in GFW
    When I select a single location for diagnostics
    Then I should be redirected to the GFW map view

  Scenario: Viewing diagnostics for a single location
    Given I login in the landing page
    When I navigate to a location details page
    When I select a single location for diagnostics
    Then I should be redirected to the map view

  Scenario: Viewing the full list map from a draft list
    Given I login in the landing page
    When I navigate to the map from a draft list
    Then I should be redirected to the draft list map view

  Scenario: Viewing the full list map from an active list
    Given I login in the landing page
    When I navigate to the map from an active list
    Then I should be redirected to the active list map view

  Scenario: Viewing the full list map in GFW
    Given I login in the landing page
    When I navigate to a list details page in GFW
    Then I should be redirected to the full list map view in GFW

  Scenario: Viewing the full list map
    Given I login in the landing page
    When I navigate to a list details page
    Then I should be redirected to the full list map view
