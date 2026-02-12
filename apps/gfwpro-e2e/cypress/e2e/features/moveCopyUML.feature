Feature: Move/Copy Lists - UML

  Scenario: A non-UML list becomes one, once locations from a UML list are moved or copied
    Given I login in the landing page
    When I navigate to a UML list details page
    Then I should be able to create a non-UML list for testing
    When I select a location from the UML list
    And I copy the location to the existing non-UML list
    Then I should verify the location has ID Type and Palm Mill ID columns in the target list
    Then I should verify other locations have no information in those columns
    Then I should be able to delete the test lists
