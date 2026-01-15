Feature: View alerts analysis on the list details page
  Scenario: Switch land cover datasets in the alerts tab
    When I login in the landing page
    And I navigate to a list details page with alerts analysis
    And I switch to the alerts tab
    Then I should see the alerts land cover dataset selector with the default option
    And I should see the alerts specific columns for the Natural Forest Map dataset
    When I switch the alerts land cover dataset to JRC Global Forest Cover
    Then I should see the alerts specific columns for the JRC Global Forest Cover dataset
