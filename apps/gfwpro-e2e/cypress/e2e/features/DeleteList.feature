Feature: user can delete list diagnostics
  Scenario: Delete list 
    When I login in the landing page
    When I navigate to a list details page
    Then I should see the delete view
