Feature: user can view the draft list CTA
  Scenario: Locations Page - Draft List CTA 
    When I login to the landing page
    And I search for a list in draft state
    Then I should be able to see the draft list CTA in the Locations Page

  Scenario: List Details Page - Draft List CTA 
    When I login to the landing page
    And I navigate to a list details page
    Then I should be able to see the draft list CTA in the List Details Page