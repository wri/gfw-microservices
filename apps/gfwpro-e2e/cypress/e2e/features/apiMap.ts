import { Then, Given } from '@badeball/cypress-cucumber-preprocessor';
import * as User from '../../app-api/User';

describe('Api Map', () => {
  Given('I login to the landing page', () => {
    User.login();
  });

  Then('I am redirected to the API Map with location {string}', (location: string) => {
    cy.visit(`/map?listId=2&isGfwList=false&isSharedList=false&selectedLocations=${location}`);
  });
});
