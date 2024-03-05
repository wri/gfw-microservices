Feature: user can get list diagnostics
  Scenario: list diagnostic
    When I login in the landing page
    When I navigate to a list details page
    When I click on list diagnostic button
    Then I should be redirected to diagnostic view
