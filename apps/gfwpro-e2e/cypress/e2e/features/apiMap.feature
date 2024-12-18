Feature: User can be redirected to the API map

  Scenario: Visibility of the map
    Given I login to the landing page
    Then I am redirected to the API Map with location ""
    Then I am redirected to the API Map with location "1"