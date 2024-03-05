Feature: user can get location diagnostics
  Scenario: list diagnostic
    When I login in the landing page
    When I navigate to a list details page and click on a location checkbox
    When I click on location diagnostic button
    Then I should be redirected to diagnostic view
