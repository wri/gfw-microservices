Feature: User can upload locations using CAR IDs

  Scenario: Upload CAR - Display new columns in Preview screen
    Given I login in the landing page
    When I navigate to the Locations page
    When I click on the Add Locations button
    And I select the CAR ID file upload option
    When I click on the Drop file button and drag a CAR CSV file
    Then I should see the CAR list preview with ID Type and ID columns
    Then I complete the CAR form and confirm the upload
    Then I should see the confirmation message
