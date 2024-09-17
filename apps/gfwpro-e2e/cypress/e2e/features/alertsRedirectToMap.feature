Feature: User can navigate to the alerts page

  Scenario: Navigating to the alerts page and viewing alerts
    Given I login in the landing page
    When I navigate to the alerts page
    When I select a list from the dropdown
    Then I should be able to view the alerts on the map and interact with the features
