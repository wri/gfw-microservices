Ability: Show Loss of Forests diagnostcs

  Scenario Outline: Locations should show tree cover loss by sensitive area

    Given I'm viewing diagnostics for <list>
    When I select <sensitiveArea> in the sensitive areas section
    Then I can see tree cover loss within <sensitiveArea> by year

    Examples:
      | list                           | sensitiveArea             |
      | "AAT Argentina Points Generic" | "Primary Forest"          |
      | "AAT Argentina Points Generic" | "Peat"                    |
      | "AAT Argentina Points Generic" | "Intact Forest Landscape" |