Ability: Download diagnostcs page

  Scenario Outline: Diagnostcs page should have download option

    Given I'm viewing diagnostics for <list>
    Then I am able to download the list data

    Examples:
      | list                   |
      | "Argentina Jujuy OTBN" |

  Scenario Outline: Diagnostcs page should download info

    Given I'm viewing diagnostics for <list>
    When I try to download diagnostic for <list>
    Then I can see the download confirmation

    Examples:
      | list                   |
      | "Argentina Jujuy OTBN" |
