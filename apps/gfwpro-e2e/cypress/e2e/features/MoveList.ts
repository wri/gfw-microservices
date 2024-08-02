import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';
import * as User from '../../app-api/User';

describe('Move List', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();
  const listFromMove = 'testregresioncopylisttomove';
  const listToMove = 'testregresioncopylisttoremove';

  When('I login in the landing page', () => {
    User.login();
    cy.visit('/locations');
  });

  When('I navigate to a list details page', () => {
    locationsPage.clickOnLocationsList(listFromMove);
  });

  Then('I should see the move view', () => {
    listDetailsPage.moveList(listToMove);
  });
});
