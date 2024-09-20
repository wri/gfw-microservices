Feature: User is redirected to map from the list diagnostics

  Scenario: Redirected to map accessing from the GFW list
    Given I am logged in
    When I navigate to locations and select the GFW list
    And I click List Diagnostic button
    When I click on the map
    Then I should be redirected to map from List Diagnostic using a GFW list

  Scenario: Redirected to map accessing from the list
    Given I am logged in
    When I navigate to locations and select a list
    And I click List Diagnostic button
    When I click on the map
    Then I should be redirected to map from List Diagnostic
