Ability: Show Loss of Forests in Sensitive Areas

  Scenario Outline: Locations should show tree cover loss by sensitive area

    Given I'm logged in
    Then I should be redirected to locations view
    Then the cocoa list "<listId>" with "<sensitiveArea>" within its extent
    And I am exploring diagnostics
    Then I should be redirected to diagnostics view
    Then I select primary forest

    Examples:
      | list     | listId   | sensitiveArea       |
      | GPV 1651 | 5439     | primary-forest      |
