Feature: User can view list diagnostics

  Scenario: Viewing diagnostics for a full list in GFW
    Given I login in the landing page
    When I navigate to a full list details page in GFW
    Then I should be redirected to the diagnostic view in GFW and verify full list locations

  Scenario: Viewing diagnostics for a single location in GFW
    Given I login in the landing page
    When I navigate to a single list details page in GFW
    When I click on the list diagnostics button
    Then I should be redirected to the diagnostic view in GFW and verify single location

  Scenario: Viewing diagnostics for multiple locations in GFW
    Given I login in the landing page
    When I navigate to a multiple lists details page in GFW
    When I click on the list diagnostics button
    Then I should be redirected to the diagnostic view in GFW and verify multiple locations

  Scenario: Viewing diagnostics for a full list
    Given I login in the landing page
    When I navigate to a full list details page
    Then I should be redirected to the diagnostic view and verify full list locations

  Scenario: Viewing diagnostics for multiple locations
    Given I login in the landing page
    When I navigate to a multiple lists details page
    When I click on the list diagnostics button
    Then I should be redirected to the diagnostic view and verify multiple locations

  Scenario: Viewing diagnostics for a single location
    Given I login in the landing page
    When I navigate to a single list details page
    When I click on the list diagnostics button
    Then I should be redirected to the diagnostic view and verify single location
