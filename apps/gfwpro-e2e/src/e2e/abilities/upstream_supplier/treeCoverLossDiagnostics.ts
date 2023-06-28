import { When, Then, Given } from '@badeball/cypress-cucumber-preprocessor';

Given("I'm logged in", () => {
  cy.on('uncaught:exception', () => {
    // work around for existing errors that otherwise fail the test
    return false;
  });
  cy.visit('https://localhost:8443');
  cy.login('dt_test1@example.com', 'unsafe', 'unsafe');
});

Given('I am redirected to locations view', () => {
  cy.url().should('include', '/locations');
});

When('I access the cocoa list with id {string}', (listId) => {
  cy.visit(`https://localhost:8443/locations?id=${listId}`);
  cy.url().should('include', '/locations/lists');
});

When('I click on the list diagnostics', () => {
  cy.get('[data-cy="list-diagnostics"]').click();
});

Then('I should be redirected to diagnostics view', () => {
  cy.url().should('include', '/locations/diagnostics');
});

When('I select the sensitive area option with id {string}', (checkboxId) => {
  cy.get(`[data-cy="${checkboxId}"]`).click();
});

Then(
  'clicking on the chart shows a tooltip with {string} and Tree Cover Loss labels',
  (sensitiveArea) => {
    cy.get('.sensitive-areas-chart > svg > g.highcharts-series-group rect').eq(0).click();

    cy.get('.sensitive-areas-chart div.highcharts-label.highcharts-tooltip > span > table > tbody')
      .eq(0)
      .as('firstChartBar');
    cy.get('@firstChartBar').contains('td', 'Tree Cover Loss').should('be.visible');
    cy.get('@firstChartBar').contains('td', sensitiveArea).should('be.visible');
  }
);
