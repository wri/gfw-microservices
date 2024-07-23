Feature: user can copy list diagnostics
  Scenario: Copy list 
    When I login in the landing page
    When I navigate to a list details page
    Then I should see the copy view
