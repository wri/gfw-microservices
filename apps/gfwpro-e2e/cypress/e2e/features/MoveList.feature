Feature: user can move list diagnostics
  Scenario: Move list 
    When I login in the landing page
    When I navigate to a list details page
    Then I should see the copy view
    Then I should see the created lists in the locations page
    Then I navigate to a list details page
    Then I should see the move view
    Then I should delete the lists from the locations page
    Then I should verify the lists are deleted from the locations page
