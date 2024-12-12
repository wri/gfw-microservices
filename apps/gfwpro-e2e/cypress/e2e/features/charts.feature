Feature: user can control the visibility of charts
  Scenario: visibility of argentina charts
    Given I login to the landing page
    When I navigate to a list details page from the Argentina list
    And I navigate to a diagnostics page
    Then I should be able to control the visibility of the charts for Argentina

  Scenario: visibility of colombia charts
    Given I login to the landing page
    When I navigate to a list details page from the Colombia list
    And I navigate to a diagnostics page
    Then I should be able to control the visibility of the charts for Colombia
