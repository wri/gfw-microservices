Ability: Show Loss of Forests diagnostcs by regions

  Scenario Outline: Locations graph changes when selecting filters

    Given I'm viewing diagnostics for <list>
    Then I can see that <filter> is enabled

    Examples:
      | list                           | filter                     |
      | "AAT Argentina Points Generic" | "Soy on Tree Cover Loss"   |

  Scenario Outline: Locations graph changes when selecting filters

    Given I'm viewing diagnostics for <list>
    When I select <filter> in the regions section
    Then I can see that the graph value changes

    Examples:
      | list                           | filter                     |
      | "AAT Argentina Points Generic" | "Soy on Tree Cover Loss"   |