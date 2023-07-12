import { When, Then, Given } from '@badeball/cypress-cucumber-preprocessor';
import * as User from '../../../app-api/User';
import * as List from '../../../app-api/List';
import * as ListDiagnostic from '../../../app-api/ListDiagnostic';
import { datatCyIdFromRegionsName } from '../../../app-api/ListLabels';

Given("I'm viewing diagnostics for {string}", (listName: string) => {
  User.login();
  List.withName(listName).viewDiagnostics();
});

When('I select {string} in the sensitive areas section', (sensitiveArea: string) => {
  ListDiagnostic.viewTreeCoverLossForSensitiveArea(sensitiveArea);
});

When('I select {string} in the regions section', (dataType: string) => {
  ListDiagnostic.viewTreeCoverLossForRegions(dataType);
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

Then('I can see tree cover loss within by {string}', (region: string) => {
  cy.get(`[data-cy=${datatCyIdFromRegionsName[region]}] .chart-container`).should('be.visible');
});
