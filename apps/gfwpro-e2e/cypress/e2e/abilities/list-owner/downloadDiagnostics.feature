Ability: Download list data from the diagnostics page

  Scenario Outline: Diagnostics page should have a download option

    Given I'm viewing diagnostics for <list>
    Then I am able to download the list data

    Examples:
      | list                   |
      | "Argentina Jujuy OTBN" |

  Scenario Outline: Electing to download list data notifies the list owner of where they can find their data

    Given I'm viewing diagnostics for <list>
    When I try to download the list data for <list>
    Then I can see the download confirmation

    Examples:
      | list                   |
      | "Argentina Jujuy OTBN" |
