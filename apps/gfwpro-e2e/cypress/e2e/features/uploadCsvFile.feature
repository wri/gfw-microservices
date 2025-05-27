Feature: User can upload a location

  Scenario: User uploads a file to add a location
  Given I login in the landing page
  When I navigate to the Locations page
  When I click on the Add Locations button
  And I select the file upload option
  When I click on the Drop file button and drag a CSV file
  Then I should see a list preview
  Then I complete the form and confirm the upload
  Then I should see the confirmation message
