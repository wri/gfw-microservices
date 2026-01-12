import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import ListDetailsPage from '../../pages/listDetailsPage';

// Page object is stateless (only contains selectors and methods), so a shared instance is safe
const listDetailsPage = new ListDetailsPage();

Given('I log in to the landing page', () => {
  cy.loginUI();
});

When('I navigate to the Locations page', () => {
  cy.visit('/locations');
});

// Scenario: Locations landing page - draft list CTA
Then('I should see draft lists with submit CTA button', () => {
  // Wait for the page to load and check for draft lists
  cy.get('.my-lists-list', { timeout: 15000 }).should('be.visible');
  // Check for draft lists - they should have the DiagnosticStatusDraft label
  cy.get('.DiagnosticStatusDraft__label', { timeout: 10000 }).should('exist');
  // Check for submit button within draft lists
  cy.get('.DiagnosticStatusDraft')
    .first()
    .within(() => {
      cy.contains('button', 'Submit').should('be.visible');
    });
});

Then('I should be able to click the submit button on a draft list', () => {
  // Find the first draft list and click its submit button
  cy.get('.DiagnosticStatusDraft', { timeout: 10000 })
    .first()
    .within(() => {
      cy.contains('button', 'Submit').should('be.visible').click();
    });
  // Wait for the dialog to appear
  cy.get('.list-diagnostics-dialog[role="dialog"]', { timeout: 5000 }).should('be.visible');
});

Then('I should see the submit analysis confirmation modal', () => {
  // Check for the confirmation dialog - it has class 'list-diagnostics-dialog'
  cy.get('.list-diagnostics-dialog[role="dialog"]', { timeout: 10000 }).should('be.visible');
  cy.get('.list-diagnostics-dialog[role="dialog"]')
    .first()
    .within(() => {
      // The title can be either "Confirm Submission" or "Confirm Analysis Submission"
      cy.get('.MuiDialogTitle-root').should('satisfy', ($title) => {
        const text = $title.text();
        return text.includes('Confirm') && text.includes('Submission');
      });
    });
});

// Scenario: List details page - draft list CTA
When('I click on a draft list', () => {
  // Wait for lists to load and ensure we're on the locations page
  cy.url().should('include', '/locations');
  cy.get('.my-lists-list', { timeout: 15000 }).should('be.visible');
  // Find and click on the first draft list
  cy.get('.my-lists-list li', { timeout: 10000 })
    .filter(':has(.DiagnosticStatusDraft__label)')
    .first()
    .within(() => {
      cy.get('[class*="locations-list__title"]').click();
    });
  // Wait for the list details page to load
  cy.url().should('include', '/list-details', { timeout: 10000 });
});

Then('I should see the submit analysis button on the list details page', () => {
  // Check for Submit Analysis button on list details page
  listDetailsPage.elements.submitBtn().should('be.visible');
});

Then('I should be able to click the submit analysis button', () => {
  listDetailsPage.elements.submitBtn().should('be.visible').click();
  // The next step will wait for the modal to appear
});

When('I click on the submit analysis button', () => {
  listDetailsPage.elements.submitBtn().should('be.visible').click();
});

// Scenario: List details page - Submit Analysis confirmation modal
Then('I should see the confirmation modal with title {string}', (expectedTitle: string) => {
  // The modal has class 'list-diagnostics-dialog' and role="dialog"
  cy.get('.list-diagnostics-dialog[role="dialog"]', { timeout: 10000 }).should('be.visible');
  cy.get('.list-diagnostics-dialog[role="dialog"]').within(() => {
    cy.get('.MuiDialogTitle-root').should('have.text', expectedTitle);
  });
});

Then('I should see the confirmation message about list accessibility', () => {
  cy.get('.list-diagnostics-dialog[role="dialog"]').within(() => {
    cy.get('.MuiDialogContent-root').should('contain.text', 'submit this list for analysis');
    cy.get('.MuiDialogContent-root').should(
      'contain.text',
      'will not be able to access the list until analysis is complete'
    );
  });
});

Then('I should see OK and Cancel buttons in the modal', () => {
  cy.get('.list-diagnostics-dialog[role="dialog"]').within(() => {
    cy.get('.list-diagnostics-dialog__actions').within(() => {
      cy.contains('button', 'OK').should('be.visible');
      cy.contains('button', 'Cancel').should('be.visible');
    });
  });
});

// Scenario: List details page - Update Analysis confirmation modal
When('I click on a list with existing analysis', () => {
  // Wait for lists to load
  cy.get('.my-lists-list', { timeout: 15000 }).should('be.visible');
  // Reuse the approach from locationsPage.optionListOK() which finds lists with:
  // - No failed tooltip
  // - Has "Update Analysis" button
  // - Has analysis chips with text
  // Then select the second one if available (not the first)
  cy.get('.my-lists-list li', { timeout: 10000 })
    .filter(':not(:has(.failed-tooltip.failed-tooltip--default))')
    .filter(':has(button:contains("Update Analysis"))')
    .filter((_, el) => {
      const analysisChipText = Cypress.$(el).find('.analysis-chips').text().trim();
      return analysisChipText.length > 0;
    })
    .then(($filteredLists) => {
      if ($filteredLists.length === 0) {
        throw new Error('No processed/analyzed lists found');
      }
      // Use the second list if available, otherwise use the first
      const selectedIndex = $filteredLists.length > 1 ? 1 : 0;
      cy.wrap($filteredLists[selectedIndex]).within(() => {
        cy.get('[class*="locations-list__title"]').click();
      });
    });
  // Wait for the list details page to load
  cy.url().should('include', '/list-details', { timeout: 10000 });
  // Verify we're on a list that's not in draft state (should have Update Analysis button available)
  cy.get('#RerunList.selected-rerun-list', { timeout: 10000 }).should('exist');
});

When('I click on the update analysis button', () => {
  // Wait for the page to be fully loaded and verify we're on a list with analysis (not draft)
  cy.url().should('include', '/list-details');

  // Verify the list is not in draft state - should have #RerunList container
  cy.get('#RerunList.selected-rerun-list', { timeout: 10000 }).should('exist');

  // Click the Update Analysis button in the #RerunList container
  // The button has "Update Analysis" text and a ReplayIcon
  // Using force: true because the button may be covered by other UI elements during animation
  cy.get('#RerunList.selected-rerun-list button')
    .should('be.visible')
    .should('contain.text', 'Update Analysis')
    .click({ force: true });
});

Then('I should see the update analysis confirmation modal', () => {
  // The update analysis modal also has class 'list-diagnostics-dialog'
  cy.get('.list-diagnostics-dialog[role="dialog"]', { timeout: 10000 }).should('be.visible');
  cy.get('.list-diagnostics-dialog[role="dialog"]').within(() => {
    cy.get('.MuiDialogTitle-root').should('contain.text', 'Confirm Analysis Update');
  });
});

Then('I should see the confirmation message about changing analysis type', () => {
  cy.get('.list-diagnostics-dialog[role="dialog"]').within(() => {
    cy.get('.MuiDialogContent-root').should('contain.text', 'submit this list for analysis');
    cy.get('.MuiDialogContent-root').should(
      'contain.text',
      'will not be able to access the list until analysis is complete'
    );
    cy.get('.MuiDialogContent-root').should(
      'contain.text',
      'email notification when the update is completed'
    );
  });
});

// Helper function to find the change analysis type modal selector
function findChangeAnalysisModalSelector(): Cypress.Chainable<string | null> {
  return cy.get('body', { timeout: 10000 }).then(($body) => {
    if ($body.find('.change-type-of-analysis-modal').length > 0) {
      return '.change-type-of-analysis-modal';
    }
    if ($body.find('[role="dialog"] .change-type-of-analysis-modal').length > 0) {
      return '[role="dialog"] .change-type-of-analysis-modal';
    }
    if ($body.find('[role="dialog"]').length > 0) {
      return '[role="dialog"]';
    }
    return null;
  });
}

// Helper function to verify the change analysis type modal is visible
function verifyChangeAnalysisModalVisible() {
  findChangeAnalysisModalSelector().then((modalSelector) => {
    if (modalSelector) {
      cy.get(modalSelector).should('be.visible');
      // If using generic dialog selector, verify it contains "List Analyses" text
      if (modalSelector === '[role="dialog"]') {
        cy.get(modalSelector).should('contain.text', 'List Analyses');
      }
    } else {
      throw new Error('Change analysis type modal not found');
    }
  });
}

// Helper function to click the change analysis type button with fallback strategies
function clickChangeAnalysisButton() {
  const buttonTexts = ['CHANGE ANALYSES', 'Change Analyses', 'Change Analysis Type'];

  cy.get('body', { timeout: 10000 }).then(($body) => {
    // Try primary button texts first (list details page)
    for (const buttonText of buttonTexts) {
      if ($body.find(`button:contains("${buttonText}")`).length > 0) {
        cy.contains('button', buttonText).click();
        return;
      }
    }

    // Fallback: check if we're on locations page (menu-based)
    if ($body.find('.locations-list__menu-container').length > 0) {
      cy.get('.locations-list__menu-container')
        .first()
        .within(() => {
          // Using force: true because menu buttons may be temporarily covered during transitions
          cy.get('button').first().click({ force: true });
        });
      cy.contains('Change Type of analysis', { timeout: 5000 }).click();
      return;
    }

    // Last resort: look for any button containing "change" or "analysis"
    // Using force: true as fallback when element may be in transition state
    cy.get('button')
      .contains(/change|analysis/i)
      .first()
      .click({ force: true });
  });
}

// Scenario: Changing analysis type - confirmation button
When('I open the change analysis type modal', () => {
  clickChangeAnalysisButton();
  verifyChangeAnalysisModalVisible();
});

When('I change the analysis type selection', () => {
  // Select a different analysis type checkbox - wait for modal to be visible first
  findChangeAnalysisModalSelector().then((modalSelector) => {
    if (!modalSelector) {
      throw new Error('Change analysis type modal not found');
    }

    // If using generic dialog selector, verify it contains "List Analyses" text
    if (modalSelector === '[role="dialog"]') {
      cy.get(modalSelector).should('contain.text', 'List Analyses');
    }

    cy.get(modalSelector).within(() => {
      // Find all checkboxes
      cy.get('input[type="checkbox"]', { timeout: 5000 }).should('have.length.greaterThan', 0);
      cy.get('input[type="checkbox"]').then(($checkboxes) => {
        const totalCheckboxes = $checkboxes.length;
        // Check how many are checked
        cy.get('input[type="checkbox"]').then(($allCheckboxes) => {
          const checkedCount = Array.from($allCheckboxes).filter(
            (cb) => (cb as HTMLInputElement).checked
          ).length;

          if (checkedCount === totalCheckboxes && totalCheckboxes > 0) {
            // All are checked - uncheck the first one to enable the Submit button
            // Leave it unchecked to make a change
            // Using force: true because checkboxes may be temporarily disabled during state updates
            cy.get('input[type="checkbox"]').first().uncheck({ force: true });
          } else if (checkedCount > 0 && checkedCount < totalCheckboxes) {
            // Some are checked - check an unchecked one to make a change
            // Using force: true because checkboxes may be temporarily disabled during state updates
            cy.get('input[type="checkbox"]:not(:checked)').first().check({ force: true });
          } else if (checkedCount === 0 && totalCheckboxes > 0) {
            // None are checked - check the first one
            // Using force: true because checkboxes may be temporarily disabled during state updates
            cy.get('input[type="checkbox"]').first().check({ force: true });
          }
        });
        // Wait for the Submit button to be enabled after the change
        cy.contains('button', 'Submit Analysis', { timeout: 5000 }).should('not.be.disabled');
      });
    });
  });
});

Then('I should see the {string} button with confirmation prompt', (buttonLabel: string) => {
  // Check for the button within the change analysis type modal context
  cy.get('.change-type-of-analysis-modal, .list-diagnostics-dialog[role="dialog"]')
    .first()
    .within(() => {
      cy.contains('button', buttonLabel).should('be.visible');
    });
});

Then('I should be able to confirm the analysis type change', () => {
  // Wait for the Submit Analysis button to be enabled
  cy.contains('button', 'Submit Analysis', { timeout: 5000 }).should('not.be.disabled').click();
  // Wait for the confirmation modal to appear
  // When adding a new analysis, it shows a confirmation modal with class 'change-type-of-analysis-modal'
  // Otherwise it submits directly
  cy.get('body', { timeout: 10000 }).then(($body) => {
    if ($body.find('.change-type-of-analysis-modal').length > 0) {
      // Confirmation modal for adding new analysis
      // Use scrollIntoView to ensure it's visible even if covered
      cy.get('.change-type-of-analysis-modal').first().scrollIntoView();
      cy.get('.change-type-of-analysis-modal').first().should('exist');

      cy.get('.change-type-of-analysis-modal')
        .first()
        .within(() => {
          // Look for OK or confirmation button - use contains for flexible matching
          cy.get('button').then(($buttons) => {
            const okButton = Array.from($buttons).find((btn) => {
              const text = btn.textContent?.toLowerCase() || '';
              return text.includes('ok') || text.includes('confirm');
            });
            if (okButton) {
              cy.wrap(okButton).scrollIntoView();
              // Using force: true because modal buttons may be covered by overlays during animation
              cy.wrap(okButton).click({ force: true });
            } else {
              // Fallback: click the first button
              // Using force: true because modal buttons may be covered by overlays during animation
              cy.get('button').first().scrollIntoView();
              cy.get('button').first().click({ force: true });
            }
          });
        });
    } else if ($body.find('.list-diagnostics-dialog[role="dialog"]').length > 0) {
      // Alternative confirmation modal
      cy.get('.list-diagnostics-dialog[role="dialog"]').first().scrollIntoView();
      cy.get('.list-diagnostics-dialog[role="dialog"]').first().should('exist');
      cy.get('.list-diagnostics-dialog[role="dialog"]')
        .first()
        .within(() => {
          cy.contains('button', 'OK').scrollIntoView();
          // Using force: true because modal buttons may be covered by overlays during animation
          cy.contains('button', 'OK').click({ force: true });
        });
    } else {
      // If no modal appears, the change was submitted directly (this is valid)
      cy.log('No confirmation modal - change submitted directly');
    }
  });
});

// Scenario: Check button labels for submit analysis button
Then('I should see the submit analysis button with label {string}', (label: string) => {
  listDetailsPage.elements.submitBtn().should('be.visible').and('contain.text', label);
});

Then('the button should be visible and enabled', () => {
  listDetailsPage.elements.submitBtn().should('be.visible').and('not.be.disabled');
});

// Scenario: Check submit analysis confirmation modal
Then('I should see the confirmation modal', () => {
  cy.get('.list-diagnostics-dialog[role="dialog"]', { timeout: 10000 }).should('be.visible');
});

Then('the modal should have the correct title', () => {
  cy.get('.list-diagnostics-dialog[role="dialog"]').within(() => {
    // Accept either "Confirm Submission" or "Confirm Analysis Submission"
    cy.get('.MuiDialogTitle-root').should('satisfy', ($title) => {
      const text = $title.text();
      return text.includes('Confirm') && text.includes('Submission');
    });
  });
});

Then('the modal should have the correct message', () => {
  cy.get('.list-diagnostics-dialog[role="dialog"]').within(() => {
    cy.get('.MuiDialogContent-root').should('contain.text', 'submit this list for analysis');
    cy.get('.MuiDialogContent-root').should(
      'contain.text',
      'will not be able to access the list until analysis is complete'
    );
  });
});

Then('the modal should have OK and Cancel buttons', () => {
  cy.get('.list-diagnostics-dialog[role="dialog"]').within(() => {
    cy.get('.list-diagnostics-dialog__actions').within(() => {
      cy.contains('button', 'OK').should('be.visible');
      cy.contains('button', 'Cancel').should('be.visible');
    });
  });
});
