Feature: ArcGIS CSP Validation
  As a developer
  I want to ensure ArcGIS scripts load without CSP errors
  So that maps function correctly in production

  Scenario: ArcGIS scripts should not be blocked by Content Security Policy
    When I login in the landing page
    Given I navigate to the map page
    Then ArcGIS scripts should load without CSP violations
