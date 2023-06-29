import { When, Then, Given } from '@badeball/cypress-cucumber-preprocessor';

const listIdFromListName = {
  'GPV 1651': 5439,
};

const datatCyIdFromSensitiveAreaName = {
  'Primary Forest': 'primary-forest',
  'Protected Areas': 'protected-areas',
  Peat: 'peat',
  'Intact Forest Landscape': 'intact-forest-landscape',
};

Given("I'm viewing diagnostics for {string}", (listName: string) => {
  // login
  cy.on('uncaught:exception', () => {
    // work around for existing errors that otherwise fail the test
    return false;
  });
  cy.visit('https://localhost:8443');
  cy.login('dt_test1@example.com', 'unsafe');

  // lists page
  cy.visit(`https://localhost:8443/locations?id=${listIdFromListName[listName]}`);
  cy.get('[data-cy="list-diagnostics"]').click();

  // diagnostics
  cy.url().should('include', '/locations/diagnostics');
});

When('I select {string} in the sensitive areas section', (sensitiveArea: string) => {
  cy.get(`[data-cy="${datatCyIdFromSensitiveAreaName[sensitiveArea]}"]`).click();
});

Then('I can see tree cover loss within {string} by year', (sensitiveArea: string) => {
  cy.get('.sensitive-areas-chart > svg > g.highcharts-series-group rect').eq(0).click();

  cy.get('.sensitive-areas-chart div.highcharts-label.highcharts-tooltip > span > table > tbody')
    .eq(0)
    .as('firstChartBar');
  cy.get('@firstChartBar').contains('td', 'Tree Cover Loss').should('be.visible');
  cy.get('@firstChartBar').contains('td', sensitiveArea).should('be.visible');
});
