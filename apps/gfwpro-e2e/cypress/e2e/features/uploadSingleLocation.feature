Feature: User can upload a location

  Scenario: User uploads a Polygon location
  Given I login in the landing page
  When I navigate to the Locations page
  When I click on the Add Location button
  And I select the Polygon option
  When I complete the polygon form and confirm
  Then I should see the completion legend

  Scenario: User uploads a Point location
  Given I login in the landing page
  When I navigate to the Locations page
  When I click on the Add Location button
  And I select the Point option
  When I complete the point form and confirm
  Then I should see the completion legend