Feature: user can get location diagnostics

  Scenario: full list map from a list draft mode
    When I login in the landing page
    Then I navigate to map from list draft
    Then I should be redirected to list draft map view 

  Scenario: full list map from a list active mode
    When I login in the landing page
    Then I navigate to map from list active
    Then I should be redirected to full list active map view

  Scenario: list diagnostic select full list GFW
    When I login in the landing page
    When I navigate to a listings details page GFW
    Then I should be redirected to full list map view GFW

  Scenario: list diagnostic select full list
    When I login in the landing page
    When I navigate to a listings details page
    Then I should be redirected to full list map view


