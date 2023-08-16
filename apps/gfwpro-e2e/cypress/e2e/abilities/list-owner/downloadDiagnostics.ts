import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('I click on download button', () => {
  cy.get('[data-cy="download-diagnostics"]').click();
});

Then('I can see the download confirmation', () => {
  cy.get('[data-cy="download-dialog"]').should('be.visible');
});

Then('I am able to download the list data', () => {
  cy.get('[data-cy="download-diagnostics"]').should('be.visible');
});
