Feature: user can delete list diagnostics
  Scenario: Delete list 
    When I login in the landing page
    When I check if lists exist in locations
    Then I should dont see the created lists in the locations page
