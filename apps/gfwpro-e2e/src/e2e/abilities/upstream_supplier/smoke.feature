Feature: smoke
  Scenario: login in
    When I login in the landing page
    Then I should be redirected to locations view
