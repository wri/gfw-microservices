Feature: user can see data under palm risk assessment tab
  Scenario: User navigates to a user list
    When I login in the landing page
    And I navigate to the details page of a user list that has palm risk assessment analysis
    And I switch to the palm risk assessment tab
    Then I should see the table with the expected data

  Scenario: User navigates to a GFW list
    When I login in the landing page
    And I navigate to the details page of a GFW list that has palm risk assessment analysis
    And I switch to the palm risk assessment tab
    Then I should see the table with the expected data