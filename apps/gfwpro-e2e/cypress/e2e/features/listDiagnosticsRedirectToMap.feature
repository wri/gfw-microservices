Feature: User is redirected to map from the list diagnostics

  Scenario: Viewing diagnostics for a full list in GFW
    Given I login in the landing page
    When I navigate to a GFW full list details page
    Then I should be redirected to the map view in GFW and verify the full list locations

  Scenario: Viewing diagnostics for a single location in GFW
    Given I login in the landing page
    When I navigate to a GFW list details page containing a single location
    When I click on the list diagnostics button
    Then I should be redirected to the map view in GFW and verify the single location

  Scenario: Viewing diagnostics for multiple locations in GFW
    Given I login in the landing page
    When I navigate to a GFW list details page containing multiple locations
    When I click on the list diagnostics button
    Then I should be redirected to the map view in GFW and verify the multiple locations

  Scenario: Viewing diagnostics for a full list
    Given I login in the landing page
    When I navigate to a full list details page
    Then I should be redirected to the map view and verify the full list locations

  Scenario: Viewing diagnostics for multiple locations
    Given I login in the landing page
    When I navigate to a list details page containing multiple locations
    When I click on the list diagnostics button
    Then I should be redirected to the map view and verify the multiple locations

  Scenario: Viewing diagnostics for a single location
    Given I login in the landing page
    When I navigate to a list details page containing a single location
    When I click on the list diagnostics button
    Then I should be redirected to the map view and verify the single location
