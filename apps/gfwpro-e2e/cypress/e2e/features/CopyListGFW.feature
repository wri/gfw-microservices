Feature: user can copy list GFW
  Scenario: Copy list GFW Administrative Areas
    When I login in the landing page
    When I navigate to a list details page GFW Administrative Areas
    Then I should be able to select country a Administrative Areas list GFW
    Then I should be able to copy a list GFW and save as draft
    Then I should see the created list in the locations page
    Then I should be able to delete the list from the locations page
    Then I should verify the list is deleted from the locations page

  Scenario: Copy list GFW Protected areas
    When I login in the landing page
    When I navigate to a list details page GFW Protected areas
    Then I should be able to select country a Protected Areas list GFW
    Then I should be able to copy a list GFW and save as draft
    Then I should see the created list in the locations page
    Then I should be able to delete the list from the locations page
    Then I should verify the list is deleted from the locations page

  Scenario: Copy list GFW Palm Oil Mills
    When I login in the landing page
    When I navigate to a list details page GFW Palm Oil Mills
    Then I should be able to copy a list GFW and save as draft
    Then I should see the created list in the locations page
    Then I should be able to delete the list from the locations page
    Then I should verify the list is deleted from the locations page

  Scenario: Copy list GFW RSPO Palm Concessions
    When I login in the landing page
    When I navigate to a list details page GFW RSPO Palm Concessions
    Then I should be able to copy a list GFW and save as draft
    Then I should see the created list in the locations page
    Then I should be able to delete the list from the locations page
    Then I should verify the list is deleted from the locations page

  Scenario: Copy list GFW Oil Palm Concessions
    When I login in the landing page
    When I navigate to a list details page GFW Oil Palm Concessions
    Then I should be able to copy a list GFW and save as draft
    Then I should see the created list in the locations page
    Then I should be able to delete the list from the locations page
    Then I should verify the list is deleted from the locations page



