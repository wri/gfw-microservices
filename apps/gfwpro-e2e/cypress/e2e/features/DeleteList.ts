import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';
import * as User from '../../app-api/User';

describe('Delete List', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();

  const listToDelete = [`testregresiondeletelist-${Date.now()}`];

  When('I login in the landing page', () => {
    User.login();
    cy.visit('/locations');
  });

  When('I navigate to a list details page', () => {
    locationsPage.clickOnLocationsList('AAT Argentina Polygons Generic');
  });

  Then('I should be able to create a list as a copy and save as draft', () => {
    listDetailsPage.copyLists(listToDelete);
  });

  Then('I should see the created list in the locations page', () => {
    cy.visit('/locations');
    locationsPage.verifyLists(listToDelete, true);
  });

  Then('I should be able to delete the list from the locations page', () => {
    listDetailsPage.deleteLists(listToDelete);
  });

  Then('I should verify the list is deleted from the locations page', () => {
    cy.visit('/locations');
    locationsPage.verifyLists(listToDelete, false);
  });
});
