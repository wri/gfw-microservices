Ability: Show diagnostcs page

  Scenario Outline: Diagnostcs page should have download option

    Given I'm viewing diagnostics for <list>
    Then I can see the download button

    Examples:
      | list                   |
      | "Argentina Jujuy OTBN" |

  Scenario Outline: Diagnostcs button should request download

    Given I'm viewing diagnostics for <list>
    When I click on download button
    Then I can see the download confirmation

    Examples:
      | list                   |
      | "Argentina Jujuy OTBN" |