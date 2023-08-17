Ability: Show Loss of Forests diagnostcs by regions

  Scenario Outline: Locations graph changes when select filters

    Given I'm viewing diagnostics for <list>
    Then I can see that <filter> is enabled

    Examples:
      | list                   | filter                   |
      | "Argentina Jujuy OTBN" | "Soy on Tree Cover Loss"   |

  Scenario Outline: Locations graph changes when select filters

    Given I'm viewing diagnostics for <list>
    When I select <filter> in the regions section
    Then I can see the graph bar values change

    Examples:
      | list                   | filter                   |
      | "Argentina Jujuy OTBN" | "Soy on Tree Cover Loss"   |

  Scenario Outline: Locations graph changes when selecting years

    Given I'm viewing diagnostics for <list>
    When I select <filter> in the regions section
    And I select a year range
    Then I can see the graph bar values change

    Examples:
      | list                   | filter                   |
      | "Argentina Jujuy OTBN" | "Soy on Tree Cover Loss"   |