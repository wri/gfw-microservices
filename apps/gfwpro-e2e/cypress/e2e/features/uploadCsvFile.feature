Feature: User can upload a location

  Scenario: User uploads a file to add a location
  Given I login in the landing page
  When I navigate to the Locations page
  When I click on the Add Location button
  And I select the file upload option
  When I click on the Drop file button and drag a CSV file

