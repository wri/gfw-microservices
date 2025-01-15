Feature: user can edit list
  Scenario: Edit all locations 
    When I login in the landing page
    When I navigate to a list details page
    When I select all locations and press the Edit button
    Then I should be able to download the file list

  Scenario: Edit list 
    When I login in the landing page
    When I navigate to a list details page
    When I select a location and press the Edit button
    Then I should be able to edit on a cell
    When I press the Update button
    Then I should be able to confirm the edit and be redirected to the list details view
    
  Scenario: Edit list of 50 selected locations
    When I login in the landing page
    When I navigate to a list details page
    When I select 50 locations and press the Edit button
    Then I should be able to edit on a cell
    When I press the Update button
    Then I should be able to confirm the edit and be redirected to the list details view


