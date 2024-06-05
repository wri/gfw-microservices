import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import * as ListDiagnostic from '../../../app-api/ListDiagnostic';

When('I try to download the list data for {string}', (list: string) => {
  ListDiagnostic.downloadListData(list);
});

Then('I can see the download confirmation', () => {
  cy.get('[data-cy="download-dialog"]').should('be.visible').and('have.text', 'List file Download');
  cy.get('button.icon-button.icon-button--large').click();
  cy.get('[data-cy="download-dialog"]').should('not.be.visible');
});

Then('I am able to download the list data', () => {
  cy.get('[data-cy="download-diagnostics"]', { timeout: 10000 }).should('be.visible');
  cy.get('[data-cy="download-diagnostics"]', { timeout: 10000 }).should('be.visible');
});
