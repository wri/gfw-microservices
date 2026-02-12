Feature: Move/Copy Lists - CAR

  Scenario: A non-CAR list becomes one, once locations from a CAR list are moved or copied
    Given I login in the landing page
    When I navigate to a CAR list details page
    Then I should be able to create a non-CAR list for testing
    When I select a location from the CAR list
    And I copy the location to the existing non-CAR list
    Then I should verify the location has ID Type and ID columns in the target list
    Then I should verify other locations have no information in those columns
    Then I should be able to delete the test lists
