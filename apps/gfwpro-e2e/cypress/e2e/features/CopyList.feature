Feature: user can copy list diagnostics
  Scenario: Copy list 
    When I login in the landing page
    When I navigate to a list details page
    Then I should be able to copy a list and save as draft
    Then I should see the created list in the locations page
    Then I should be able to delete the list from the locations page
    Then I should verify the list is deleted from the locations page
