Ability: Show Loss of Forests in Sensitive Areas

  Scenario Outline: Locations should show tree cover loss by sensitive area

    Given I'm viewing diagnostics for <list>
    When I select <sensitiveArea> in the sensitive areas section
    Then I can see tree cover loss within <sensitiveArea> by year

    Examples:
      | list                   | sensitiveArea             |
      | "Argentina Jujuy OTBN" | "Primary Forest"          |
      | "Argentina Jujuy OTBN" | "Protected Areas"         |
      | "Argentina Jujuy OTBN" | "Peat"                    |
      | "Argentina Jujuy OTBN" | "Intact Forest Landscape" |
