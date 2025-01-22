import { Then, Given, When } from '@badeball/cypress-cucumber-preprocessor';

describe('Api Map', () => {
  Given('I login to the landing page', () => {
    cy.loginUI();
  });

  When('I am redirected to the API Map with location {string}', (location: string) => {
    cy.visit(`/apimap?listId=1569&locationId=${location}`);
  });
  Then('I should redirect to the map view', () => {
    cy.location('href').should('include', '/apimap');
  });
});
