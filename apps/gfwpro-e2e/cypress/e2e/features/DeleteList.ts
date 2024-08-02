import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../pages/locationsPage';
import ListDetailsPage from '../pages/listDetailsPage';
import * as User from '../app-api/User';

describe('Delete List', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();
  const listsToDelete = ['testregresioncopylisttoremove', 'testregresioncopylisttomove'];

  When('I login in the landing page', () => {
    User.login();
    cy.visit('/locations');
  });

  When('I check if lists exist in locations', () => {
    listDetailsPage.deleteLists(listsToDelete);
  });

  Then('I should dont see the created lists in the locations page', () => {
    cy.visit('/locations');
    locationsPage.verifyLists(listsToDelete, false);
  });
});
