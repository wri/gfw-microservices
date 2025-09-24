Feature: user can share a list and log in with multiple roles to interact with the shared list
  Scenario: login as admin and share a list
    When I login as admin
    Then I should be redirected to locations view
    When I share a list with users
    Then I should see the users added to the shared list

  Scenario: login as viewer and verify shared list is visible
    When I login as viewer
    Then I should be redirected to locations view
    Then I should see the shared list in the locations page

  Scenario: login as editor and verify shared list is visible
    When I login as editor
    Then I should be redirected to locations view
    Then I should see the shared list in the locations page

  Scenario: login as admin and stop sharing the list
    When I login as admin
    Then I should be redirected to locations view
    When I stop sharing a list with users
    Then I should not see the users added to the shared list
