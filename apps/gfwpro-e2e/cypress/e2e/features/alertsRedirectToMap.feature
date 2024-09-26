Feature: User is redirected to map from the alerts page

  Scenario: Redirect to the map from the alerts page
    Given I log in to the application
    When I navigate to the alerts page
    And I select a list from the dropdown menu
    Then I should see the locations displayed on the map
    When I navigate to the map page
    Then I should see the locations from the selected list on the map

