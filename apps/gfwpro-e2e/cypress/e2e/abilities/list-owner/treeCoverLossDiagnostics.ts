import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import * as ListDiagnostic from '../../../app-api/ListDiagnostic';

When('I select {string} in the sensitive areas section', (sensitiveArea: string) => {
  ListDiagnostic.viewTreeCoverLossForSensitiveArea(sensitiveArea);
});

Then('I can see tree cover loss within {string} by year', (sensitiveArea: string) => {
  cy.get('.sensitive-areas-chart > svg > g.highcharts-series-group rect').eq(0).click();
  cy.get('.sensitive-areas-chart div.highcharts-label.highcharts-tooltip > span > table > tbody')
    .eq(0)
    .then(() => {
      cy.contains('td', 'Tree Cover Loss').should('be.visible');
      cy.contains('td', sensitiveArea).should('be.visible');
    });
});
