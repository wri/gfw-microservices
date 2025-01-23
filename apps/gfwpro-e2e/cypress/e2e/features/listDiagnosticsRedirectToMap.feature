Feature: User is redirected to map from the list diagnostics

  Scenario: Redirected to map accessing from a GFW list
    Given I am logged in
    When I navigate to locations and select a GFW list
    And I click on the List Diagnostic button
    When I click on the map
    Then I should be redirected to the map page and view the GFW list loaded on the map

