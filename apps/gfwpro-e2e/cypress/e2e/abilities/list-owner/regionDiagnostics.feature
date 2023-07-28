Ability: Show Loss of Forests diagnostcs by regions

  Scenario Outline: Locations graph changes when selecting years

    Given I'm viewing diagnostics for <list>
    When I select <dataType> in the regions section
    And I select a year range
    Then I can see the graph bar values change

    Examples:
      | list                   | dataType                   |
      | "Argentina Jujuy OTBN" | "Soy on Tree Cover Loss"   |