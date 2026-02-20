Feature: User can upload locations using UML (Universal Mill List) IDs

  Scenario: Upload UML - Display new columns in Preview screen
    Given I login in the landing page
    When I navigate to the Locations page
    When I click on the Add Locations button
    And I select the CAR ID file upload option
    When I click on the Drop file button and drag a UML CSV file
    Then I should see the UML list preview with Palm Mill ID and Analysis Radius columns
    Then I complete the UML form and confirm the upload
    Then I should see the confirmation message
