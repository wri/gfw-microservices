Feature: User can interact with info bubbles in list diagnostics page
  Scenario: info bubbles content
    When I login in the landing page
    When I navigate to a list diagnostic page
    Then I should be able to see each info bubbles content including links if available