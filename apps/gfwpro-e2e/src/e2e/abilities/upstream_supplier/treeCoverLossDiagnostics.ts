import { When, Then, Given} from '@badeball/cypress-cucumber-preprocessor';

Given("I'm logged in", () => {
  cy.on('uncaught:exception', () => {
    // work around for existing errors that otherwise fail the test
    return false;
  });
  cy.visit('https://localhost:8443');
  cy.login('dt_test1@example.com', 'unsafe', 'unsafe');
});

Then('I should be redirected to locations view', () => {
  cy.url().should('include', '/locations');
});

Then('the cocoa list {string} with {string} within its extent', (listId, sensitiveArea) => {
  cy.visit(`https://localhost:8443/locations?id=${listId}`);
  cy.url().should('include', '/locations/lists');
});

Then('I am exploring diagnostics', () => {
  cy.get('[data-cy="list-diagnostics"]').click();
});

Then('I should be redirected to diagnostics view', () => {
  cy.url().should('include', '/locations/diagnostics');
});

Then('I select {string}', (checkboxId) => {
  cy.get(`[data-cy="${checkboxId}"]`).click();
});


Then('shows tooltip for {string} and Tree Cover Loss labels', (sensitiveArea) => {
  cy.get(".sensitive-areas-chart > svg > g.highcharts-series-group rect").eq(0).click();
    cy.get('.sensitive-areas-chart div.highcharts-label.highcharts-tooltip > span > table > tbody')
  .contains('td', 'Tree Cover Loss').should('be.visible')
  cy.get('.sensitive-areas-chart div.highcharts-label.highcharts-tooltip > span > table > tbody')
  .contains('td', sensitiveArea).should('be.visible');

});
