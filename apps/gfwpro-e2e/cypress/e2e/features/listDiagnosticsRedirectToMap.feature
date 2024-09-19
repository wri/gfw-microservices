Feature: User is redirected to map from the list diagnostics

  Scenario: View details of a single location from the GFW list
    Given I am logged in
    When I navigate to locations and select the GFW list
    And I choose a location and click List Diagnostic
    When I click on the map
    Then I should be redirected to map with the selected location from GFW list

  Scenario: View details of multiple locations from the GFW list
    Given I am logged in
    When I navigate to locations and select the GFW list
    And I choose multiple locations and click List Diagnostic
    When I click on the map 
    Then I should be redirected to map with the selected location from GFW list

  Scenario: View details of all locations from the GFW list
    Given I am logged in
    When I navigate to locations and select the GFW list
    And I choose all locations and click List Diagnostic
    When I click on the map
    Then I should be redirected to map with the selected location from GFW list

 Scenario: View details of a single location from the list
    Given I am logged in
    When I navigate to locations and select a list
    And I choose a location and click List Diagnostic
    When I click on the map
    Then I should be redirected to map with the selected location from the list

  Scenario: View details of multiple locations from the list
    Given I am logged in
    When I navigate to locations and select a list
    And I choose multiple locations and click List Diagnostic
    When I click on the map
    Then I should be redirected to map with the selected location from the list

  Scenario: View details of all locations from the list
    Given I am logged in
    When I navigate to locations and select a list
    And I choose all locations and click List Diagnostic
    When I click on the map
    Then I should be redirected to map with the selected location from the list

