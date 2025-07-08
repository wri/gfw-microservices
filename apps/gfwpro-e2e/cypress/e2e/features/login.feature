Feature: user can log in with multiple roles
  Scenario: login as admin
    When I login as admin
    Then I should be redirected to locations view

  Scenario: login as viewer
    When I login as viewer
    Then I should be redirected to locations view

  Scenario: login as editor
    When I login as editor
    Then I should be redirected to locations view
