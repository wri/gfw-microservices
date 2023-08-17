import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import * as ListDiagnostic from '../../../app-api/ListDiagnostic';
import { datatCyIdFromRegionsOptionsName } from '../../../app-api/ListLabels';

const getAllDataFromGraph = (barElements) => {
  return barElements.map((index, element) => Cypress.$(element).attr('height')).get();
};

When('I select {string} in the regions section', (filter: string) => {
  cy.get('[data-cy="diagnotcs-regions"] .chart-container .highcharts-point').then((barElements) => {
    const divValues = getAllDataFromGraph(barElements);
    cy.wrap(divValues).as('initialValues');
  });

  ListDiagnostic.viewTreeCoverLossForRegions(filter);
});

When('I select a year range', () => {
  cy.get('[data-cy="diagnotcs-regions"] .highcharts-point').then((barElement) => {
    const initialNumberCollums = barElement.length;
    cy.wrap(initialNumberCollums).as('initialNumberCollums');
  });

  ListDiagnostic.changeDateFilter();

  cy.get('[data-cy="diagnotcs-regions"] .highcharts-point')
    .its('length')
    .as('updatedNumberCollums');
});

Then('I can see that the graph value changes', () => {
  cy.get(`[data-cy="diagnotcs-regions"] .chart-container .highcharts-point`).then((barElements) => {
    const updatedDivValues = getAllDataFromGraph(barElements);
    cy.wrap(updatedDivValues).as('updatedValues');
  });

  cy.get('@initialValues').then((initialValues) => {
    cy.get('@updatedValues').should('not.deep.equal', initialValues);
  });
});

Then('I can see the graph bar values change', () => {
  cy.get('@updatedNumberCollums').then((initialNumberCollums) => {
    cy.get('@initialNumberCollums').should('be.gt', initialNumberCollums);
  });
});

Then('I can see that {string} is enabled', (filter: string) => {
  cy.get(`[data-cy="${datatCyIdFromRegionsOptionsName[filter]}"] label`)
    .invoke('text')
    .should('not.eq', '0');
  cy.get(`[data-cy="${datatCyIdFromRegionsOptionsName[filter]}"] input`).should(
    'not.have.attr',
    'disabled'
  );
});
