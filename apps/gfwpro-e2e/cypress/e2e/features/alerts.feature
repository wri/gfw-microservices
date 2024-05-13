Feature: user can navigate to alerts page
  Scenario: alerts page
    Given I login to the landing page
    When I navigate to the alerts page
    When I select a List from the dropdown
    Then I should be able to view the alerts on the map and interact with the features
