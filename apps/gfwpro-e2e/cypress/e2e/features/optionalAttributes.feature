Feature: user can add Optional Attributes to the locations table
  Scenario: Optional Attributes 
    When I login to the landing page
    And I navigate to a list details page
    And I add optional attributes to the locations table
    Then I should be able to see the optional attributes column headers