Ability: Show Loss of Forests in Sensitive Areas

  Scenario Outline: Locations should show tree cover loss by sensitive area

    Given I'm logged in
    Then I should be redirected to locations view
    Then the cocoa list "<listId>" with "<sensitiveArea>" within its extent
    And I am exploring diagnostics
    Then I should be redirected to diagnostics view
    Then I select "<checkboxId>"
    Then shows tooltip for "<sensitiveArea>" and Tree Cover Loss labels

    Examples:
      | list     | listId   | sensitiveArea     | checkboxId      |
      | GPV 1651 | 5439     | Primary Forest    | primary-forest  |
