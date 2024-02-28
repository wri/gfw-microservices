Feature: user can get list diagnostics
  Scenario: list diagnostic
    When I login in the landing page
    And I navigate to a list details page
    And I click on list diagnostic button
    Then I should be redirected to diagnostic view
