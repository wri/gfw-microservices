Feature: user can log in
  Scenario: login
    When I login in the landing page
    Then I should be redirected to locations view
