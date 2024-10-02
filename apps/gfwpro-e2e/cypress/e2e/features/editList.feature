Feature: user can edit list

  Scenario: Edit list 
    When I login in the landing page
    When I navigate to a list details page
    When I select a location and press the Edit button
    Then I should be able to edit on a cell
    When I press the Update button
    Then I should be able to confirm the edit and be redirected to the list details view

  Scenario: Cancel Edit list 
    When I login in the landing page
    When I navigate to a list details page
    When I select a location and press the Edit button
    Then I should be able to edit on a cell
    When I press the Cancel button
    Then I should be able to cancel the edit and return to the list details view