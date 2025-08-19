Feature: User can download templates

  Scenario: User downloads a Polygon Shapefile template
    Given I login in the landing page
    When I navigate to the Locations page
    And I click on the Add Locations button and select the file upload option
    And I click on the Data Templates button
    Then I should be able to download the Polygon Shapefile template
    When I click on the Polygon Shapefile option and click the Download button
    Then I should see a checkmark button

  Scenario: User downloads a KML template
    Given I login in the landing page
    When I navigate to the Locations page
    And I click on the Add Locations button and select the file upload option
    And I click on the Data Templates button
    Then I should be able to download the KML template
    When I click on the KML option and click the Download button
    Then I should see a checkmark button

  Scenario: User downloads a SpreadSheet template
    Given I login in the landing page
    When I navigate to the Locations page
    And I click on the Add Locations button and select the file upload option
    And I click on the Data Templates button
    Then I should be able to download the SpreadSheet template
    When I click on the SpreadSheet option and click the Download button
    Then I should see a checkmark button

  Scenario: User downloads a Point Shapefile template
    Given I login in the landing page
    When I navigate to the Locations page
    And I click on the Add Locations button and select the file upload option
    And I click on the Data Templates button
    Then I should be able to download the Point Shapefile template
    When I click on the Point Shapefile option and click the Download button
    Then I should see a checkmark button

  Scenario: User downloads a Polygon GeoJSON template
    Given I login in the landing page
    When I navigate to the Locations page
    And I click on the Add Locations button and select the file upload option
    And I click on the Data Templates button
    Then I should be able to download the Polygon GeoJSON template
    When I click on the Polygon GeoJSON option and click the Download button
    Then I should see a checkmark button

  Scenario: User downloads a Point GeoJSON template
    Given I login in the landing page
    When I navigate to the Locations page
    And I click on the Add Locations button and select the file upload option
    And I click on the Data Templates button
    Then I should be able to download the Point GeoJSON template
    When I click on the Point GeoJSON option and click the Download button
    Then I should see a checkmark button