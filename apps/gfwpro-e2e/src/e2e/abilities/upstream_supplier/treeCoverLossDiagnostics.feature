Ability: Show Loss of Forests in Sensitive Areas

  Scenario Outline: Locations should show tree cover loss by sensitive area

    Given the cocoa list <id> with <sensitive area> within its extent
    And I am exploring diagnostics for <id>
    When I select <sensitive area> within sensitive areas
    Then tree cover loss in <sensitive area> should be contrasted with my total tree cover loss

    Examples:
      | list     | id   | sensitive area          |
      | GPV 1651 | 5479 | primary forest          |
      | GPV 1651 | 5479 | protected areas         |
      | GPV 1651 | 5479 | peat                    |
      | GPV 1651 | 5479 | intact forest landscape |
