Feature: user can get list diagnostics
  Scenario: list GFW diagnostic select full list
    When I login in the landing page
    When I navigate to a full lists GFW details page
    Then I should be redirected to diagnostic view GFW and verify full list locations
    
  Scenario: list GFW diagnostic select single location
    When I login in the landing page
    When I navigate to a sigle list GFW details page
    When I click on list diagnostic button
    Then I should be redirected to diagnostic view GFW and verify single location

  Scenario: list GFW diagnostic select multiple locations
    When I login in the landing page
    When I navigate to a multiple lists GFW details page
    When I click on list diagnostic button
    Then I should be redirected to diagnostic view GFW and verify multiple locations

  Scenario: list diagnostic select full list
    When I login in the landing page
    When I navigate to a full lists details page
    Then I should be redirected to diagnostic view and verify full list locations

  Scenario: list diagnostic select multiple locations
    When I login in the landing page
    When I navigate to a multiple lists details page
    When I click on list diagnostic button
    Then I should be redirected to diagnostic view and verify multiple locations

  Scenario: list diagnostic select single location
    When I login in the landing page
    When I navigate to a sigle list details page
    When I click on list diagnostic button
    Then I should be redirected to diagnostic view and verify single location


