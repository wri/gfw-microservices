Ability: Show Loss of Forests in Sensitive Areas

  Scenario Outline: Locations should show tree cover loss by sensitive area

    Given I'm viewing diagnostics for <list>
    When I select <sensitiveArea> in the sensitive areas section
    Then I can see tree cover loss within <sensitiveArea> by year

    Examples:
      | list       | sensitiveArea             |
      | "GPV 1651" | "Primary Forest"          |
      | "GPV 1651" | "Protected Areas"         |
      | "GPV 1651" | "Peat"                    |
      | "GPV 1651" | "Intact Forest Landscape" |
