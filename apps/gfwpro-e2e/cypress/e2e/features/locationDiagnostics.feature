Feature: user can get location diagnostics
  Scenario: location diagnostic
    When I login in the landing page
    When I navigate to a list details page and click on a location checkbox
    When I click on location diagnostic button
    Then I should be redirected to diagnostic view

  Scenario: location diagnostic - palm risk assessment
    When I login in the landing page
    And I navigate to the details page of a user list that has palm risk assessment analysis
    And I switch to the palm risk assessment tab
    And I click on location diagnostic button
    And I click on the diagnostics palm risk assessment tab
    Then I should see the palm risk assessment data charts
