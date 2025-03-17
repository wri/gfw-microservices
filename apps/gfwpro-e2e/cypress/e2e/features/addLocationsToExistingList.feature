Feature: User can add location to an existing list
  Scenario: Add locations to an existing list
    Given I login in the landing page
    When I click on Add Location and select the Single Location option
    And I select the list AAT ADD LOCATION TEST and complete the form
    Then I should see the location added successfully
