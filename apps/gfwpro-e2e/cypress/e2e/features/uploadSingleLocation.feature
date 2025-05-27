Feature: User can upload a location

  Scenario: User uploads a Polygon location
  Given I login to the landing page
  When I navigate to the Locations page
  When I click on the Add Locations button
  And I select the Polygon option
  When I complete the polygon form and confirm
  When I complete the Configure List step for a new Polygon list
  When I submit the list for analysis
  Then I should see the confirmation message

  Scenario: User uploads a Point location
  Given I login to the landing page
  When I navigate to the Locations page
  When I click on the Add Locations button
  And I select the Point option
  When I complete the point form and confirm
  When I complete the Configure List step for a new Point list
  When I submit the list for analysis
  Then I should see the confirmation message