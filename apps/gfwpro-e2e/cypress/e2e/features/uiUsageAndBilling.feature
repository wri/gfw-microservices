Feature: UI Usage & Billing Regression Tests

  Scenario: Locations landing page - draft list CTA
    Given I log in to the landing page
    When I navigate to the Locations page
    Then I should see draft lists with submit CTA button
    And I should be able to click the submit button on a draft list
    And I should see the submit analysis confirmation modal

  Scenario: List details page - draft list CTA
    Given I log in to the landing page
    When I navigate to the Locations page
    And I click on a draft list
    Then I should see the submit analysis button on the list details page
    And I should be able to click the submit analysis button
    And I should see the submit analysis confirmation modal

  Scenario: List details page - Submit Analysis confirmation modal
    Given I log in to the landing page
    When I navigate to the Locations page
    And I click on a draft list
    And I click on the submit analysis button
    Then I should see the confirmation modal with title "Confirm Analysis Submission"
    And I should see the confirmation message about list accessibility
    And I should see OK and Cancel buttons in the modal

  Scenario: List details page - Update Analysis confirmation modal
    Given I log in to the landing page
    When I navigate to the Locations page
    And I click on a list with existing analysis
    And I click on the update analysis button
    Then I should see the update analysis confirmation modal
    And I should see the confirmation message about changing analysis type

  Scenario: Changing analysis type - confirmation button
    Given I log in to the landing page
    When I navigate to the Locations page
    And I click on a list with existing analysis
    And I open the change analysis type modal
    And I change the analysis type selection
    Then I should see the "Submit Analysis" button with confirmation prompt
    And I should be able to confirm the analysis type change

  Scenario: Check button labels for submit analysis button
    Given I log in to the landing page
    When I navigate to the Locations page
    And I click on a draft list
    Then I should see the submit analysis button with label "Submit Analysis"
    And the button should be visible and enabled

  Scenario: Check submit analysis confirmation modal
    Given I log in to the landing page
    When I navigate to the Locations page
    And I click on a draft list
    And I click on the submit analysis button
    Then I should see the confirmation modal
    And the modal should have the correct title
    And the modal should have the correct message
    And the modal should have OK and Cancel buttons
