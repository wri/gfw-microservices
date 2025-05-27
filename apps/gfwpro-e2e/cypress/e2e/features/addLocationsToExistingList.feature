Feature: User can add a location to an existing list
  Scenario: Add locations to an existing list
    Given I login in the landing page
    When I click on Add Location
    And I select the Point option
    And I complete the point form and confirm
    And I complete the Configure List step for an existing list
    And I submit the list for analysis
    Then I should see the confirmation message
