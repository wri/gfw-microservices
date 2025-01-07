import { Then, Given, When } from '@badeball/cypress-cucumber-preprocessor';
import * as User from '../../app-api/User';

describe('Api Map', () => {
  Given('I login to the landing page', () => {
    User.login();
  });

  When('I am redirected to the API Map with location {string}', (location: string) => {
    cy.visit(`/apimap?listId=1569&locationId=${location}`);
  });
  Then('I should redirect to the map view', () => {
    cy.location('href').should('include', '/apimap');
  });
});
