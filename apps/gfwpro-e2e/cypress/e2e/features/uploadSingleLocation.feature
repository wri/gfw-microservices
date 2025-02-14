Feature: User can upload a location

  Scenario: User uploads a location
    Given I login in the landing page
    When I navigate to the Locations page
    And I click on the Add Location Alpha button and select the file upload option
    When I click on the Drop file button and drag a KML file
    Then I complete the form and confirm the upload

