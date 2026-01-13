Feature: user can move list diagnostics
  Scenario: Create, Move and Delete list
    When I login in the landing page
    When I navigate to a list details page origin
    Then I should be able to create a list as a copy and save as draft
    Then I should see the created lists in the locations page
    When I navigate to a list details page
    Then I should be able to move locations from a list into another one and save as draft
    Then I should see the list moved and saved as draft
    Then I should be able to delete the lists from the locations page
    Then I should verify the lists are deleted from the locations page