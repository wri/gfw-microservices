Ability: Show Loss of Forests in Sensitive Areas

  Scenario Outline: Locations should show tree cover loss by sensitive area

    Given I'm logged in
    And I am redirected to locations view
    When I access the cocoa list with id "<listId>"
    And I click on the list diagnostics
    Then I should be redirected to diagnostics view
    When I select the sensitive area option with id "<checkboxId>"
    Then clicking on the chart shows a tooltip with "<sensitiveArea>" and Tree Cover Loss labels

    Examples:
      | list     | listId   | sensitiveArea           | checkboxId              |
      | GPV 1651 | 5439     | Primary Forest          | primary-forest          |
      | GPV 1651 | 5439     | Protected Areas         | protected-areas         |
      | GPV 1651 | 5439     | Peat                    | peat                    |
      | GPV 1651 | 5439     | Intact Forest Landscape | intact-forest-landscape |
