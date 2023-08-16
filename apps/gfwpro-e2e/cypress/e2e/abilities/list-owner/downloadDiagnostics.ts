import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { listIdFromListName } from '../../../app-api/List';
When('I try to download diagnostic for {string}', (list: string) => {
  const id = listIdFromListName[list];
  const url = `/locations/csv/${id}?type=everything&order=asc&listFilterStr=&aggregate=true&listView=forest_change&analysisAreaMin=0&selectedLocations=`;
  cy.intercept('GET', url, (req) => {
    req.reply({
      statusCode: 200,
      body: '',
      headers: {},
    });
  }).as('download');

  cy.get('[data-cy="download-diagnostics"]').click();
  cy.wait('@download');
});

Then('I can see the download confirmation', () => {
  cy.get('[data-cy="download-dialog"]').should('be.visible');
});

Then('I am able to download the list data', () => {
  cy.get('[data-cy="download-diagnostics"]').should('be.visible');
});
